// Heads-Up-Display (HUD) class for PxlNav
//   Written by Kevin Edzenga, 2025
// -- -- -- -- -- -- -- -- -- -- -- --
//
// Init() is called after pxlRoom's have loaded and post processing has been applied
//   All room items and collider object triggers are loaded and ready for HUD visual display
//
// Initial pass on this class is handling events within the class
//   Will move to EventManager class once the HUD is fully functional
//     (EventManager class isn't fully integrated yet)
//


import { DEVICE_ACTION, HUD_ELEMENT } from "../core/Enums.js";

import { ElementBase } from "./elements/elementBase.js";
import { DragRegion } from "./elements/dragRegion.js";
import { Thumbstick } from "./elements/thumbstick.js";


/**
 * Class to handle a Heads-Up Display (HUD) management for pxlNav.
 *   Examples should be ran from your `pxlRoom.build()` function --
 * @alias pxlHUD
 * @class
 * @description HUD drawing and management
 * @example
 * // Add a button to the HUD from your room
 * let buttonData = { 'style': ['my-button-style'] };
 * this.pxlHUD.addItem('myButton', HUD_ELEMENT.BUTTON, buttonData, () => {
 *   console.log('Button clicked!');
 * });
 * @example
 * // Add a draggable region to the HUD from your room
 * let dragData = { 'style': ['my-drag-style'] };
 * this.pxlHUD.addItem('myDragRegion', HUD_ELEMENT.DRAG_REGION, dragData, ( data ) => {
 *   // data = { type = pxlEnum, name='myDragRegion', value={ x: number, y: number } };
 *   console.log('Drag delta / relative offset : ', data.value );
 * });
 * @example
 * // Add a thumbstick to the HUD from your room
 * let thumbData = { 'style': ['my-thumbstick-style'] };
 * this.pxlHUD.addItem('myThumbstick', HUD_ELEMENT.THUMBSTICK, thumbData, ( data ) => {
 *   // data = { type = pxlEnum, name='myThumbstick', value={ x: number (-1 to 1), y: number (-1 to 1) } };
 *   console.log('Thumbstick value : ', data.value );
 * });
 */
export class HUD{
  /**
   * Create a new HUD instance.
   */
  constructor(){
    /**
     * @type {Object|null}
     */
    this.pxlOptions = null;
    /**
     * @type {Object|null}
     */
    this.pxlEnums = null;
    /**
     * @type {Object|null}
     */
    this.pxlGuiDraws = null;
    /**
     * @type {Object|null}
     */
    this.pxlDevice = null;

    /**
     * @type {HTMLElement|null}
     */
    this.hudParent = null;
    /**
     * @type {Object}
     */
    this.huds = {};

    /**
     * @type {Object}
     */
    this.mobileHUD = {};


  }

  // -- -- --

  /**
   * Set dependencies for the HUD.
   * @param {Object} pxlNav - The pxlNav instance containing dependencies.
   * @private
   */
  setDependencies( pxlNav ){
    this.pxlOptions = pxlNav.pxlOptions;
    this.pxlEnums = pxlNav.pxlEnums;
    this.pxlGuiDraws = pxlNav.pxlGuiDraws;
    this.pxlDevice = pxlNav.pxlDevice;
  }

  // -- -- --

  /**
   * Initialize the HUD.
   * @private
   */
  init(){

    let hudParent = document.createElement('div');
    hudParent.classList.add('pxlNav-hud-parent');
    this.pxlGuiDraws.addToContainer( hudParent );
    this.hudParent = hudParent;

    // Add mobile hud elements
    //   Thumbsticks, jump + run empty regions
    if( this.pxlOptions.mobile && !this.pxlOptions.staticCamera ){
      hudParent.classList.add('pxlNav-hud-parent-mobile');
      this.createMobileHUD();
    }
  }

  /**
   * Add an element to the HUD DOM Object.
   * @method
   * @memberof pxlHUD
   * @param {HTMLElement|Object} hudElement - The HUD element to add.
   * @example
   * //Add an created element to the managed HUD or specific parent
   * let newButton = this.pxlHUD.createButton('myButton', buttonData, ( data )=>{
   *   console.log('Button clicked!');
   * });
   * 
   * this.pxlHUD.addToHUD( newButton );
   */
  addToHUD( hudElement ){
    if( hudElement.hasOwnProperty('block') && hudElement.block !== null ){
      this.hudParent.appendChild( hudElement.block );
    }else if( hudElement?.object !== null ){
      this.hudParent.appendChild( hudElement.object );
    }else{
      this.hudParent.appendChild( hudElement );
    }
  }

  // -- -- --

  /**
   * Add an item to the HUD.
   * @method
   * @memberof pxlHUD
   * @param {string} [label='default'] - The label for the HUD item.
   * @param {string} type - The type of HUD element.
   * @param {Object} data - The data for the HUD element.
   * @param {Function|null} [callbackFn=null] - The callback function for the HUD element.
   * @param {Object|null} [parentObj=null] - The parent object for the HUD element.
   * @returns {Object|null} The created HUD element.
   * @example
   * // Add a button to the HUD
   * //   Subscription passed through the `addItem()` function
   * //   Its preferer you use this function over directly creating HUD elements
   * //     As pxlHUD can manage the HUD elements and their subscriptions
   * let buttonData = { 'style': ['my-button-style'] };
   * this.pxlHUD.addItem('myButton', HUD_ELEMENT.BUTTON, buttonData, () => {
   *   console.log('Button clicked!');
   * });
   * 
   * // Add a draggable region to the HUD
   * //   Subscription called after hud element creation
   * let dragData = { 'style': ['my-drag-style'] };
   * this.pxlHUD.addItem('myDragRegion', HUD_ELEMENT.DRAG_REGION, dragData);
   *  // [...] // Later in your code
   * this.pxlHUD.subscribe('myDragRegion', ( data ) => {
   *   console.log('Drag delta / relative offset : ', data.value );
   * });
   */
  addItem( label='default', type, data, callbackFn = null, parentObj = null ){
    if( !this.huds.hasOwnProperty( label ) ){
      this.huds[ label ] = [];
    }
    let curRegion = null;

    switch( type ){
      case HUD_ELEMENT.REGION:
        curRegion = this.createRegion( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      case HUD_ELEMENT.DRAG_REGION:
        curRegion = this.createDragRegion( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      case HUD_ELEMENT.BUTTON:
        curRegion = this.createButton( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      case HUD_ELEMENT.THUMBSTICK:
        curRegion = this.createThumbstick( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      case HUD_ELEMENT.SLIDER:
        curRegion = this.createSlider( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      case HUD_ELEMENT.IMAGE:
        curRegion = this.createImage( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      case HUD_ELEMENT.TEXT:
        curRegion = this.createText( label, data, callbackFn, parentObj );
        this.huds[ label ].push( curRegion );
        break;
      default:
        break;
    }

    if( curRegion !== null ){

      if( parentObj !== null ){
        parentObj.appendChild( curRegion.object );
      }else{
        // Add new HUD element to the DOM
        this.addToHUD( curRegion );
      }

      // Subscribe to the HUD element if callbackFn provided
      if( callbackFn !== null ){
        curRegion.subscribe( callbackFn );
      }
    }

    return curRegion;
  }

  // -- -- --

  /**
   * Create a region element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the region.
   * @param {Object} data - The data for the region.
   * @param {Function|null} [callbackFn=null] - The callback function for the region.
   * @returns {Object} The created region element.
   * @example
   * // Create a region element
   * let regionData = { 'style': ['my-region-style'] };
   * let newRegion = this.pxlHUD.createRegion('myRegion', regionData, ( data )=>{
   *   console.log( 'Region clicked!' );
   *   console.log( data );
   * });
   * this.pxlHUD.addToHUD( newRegion );
   */
  createRegion( label, data, callbackFn=null, parentObj=null ){
    let region = new ElementBase( label, data );
    region.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    region.build();

    if(callbackFn !== null){
      region.subscribe( callbackFn );
    }
    if( parentObj !== null ){
      parentObj.appendChild( region.object );
    }

    return region;
  }

  /**
   * Create a draggable region element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the draggable region.
   * @param {Object} data - The data for the draggable region.
   * @param {Function|null} [callbackFn=null] - The callback function for the draggable region.
   * @returns {Object} The created draggable region element.
   * @example
   * // Create a draggable region element
   * let dragData = { 'style': ['my-drag-style'] };
   * let newDragRegion = this.pxlHUD.createDragRegion('myDragRegion', dragData, ( data )=>{
   *  console.log( 'Drag delta / relative offset {X,Y} :' );
   *  console.log( data.value );
   * });
   * this.pxlHUD.addToHUD( newDragRegion );
   */
  createDragRegion( label, data, callbackFn=null, parentObj=null ){
    let dragRegion = new DragRegion( label, data );
    dragRegion.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    dragRegion.build();

    if(callbackFn !== null){
      dragRegion.subscribe( callbackFn );
    }
    if( parentObj !== null ){
      parentObj.appendChild( dragRegion.object );
    }

    return dragRegion;
  }

  /**
   * Create a button element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the button.
   * @param {Object} data - The data for the button.
   * @param {Function|null} [callbackFn=null] - The callback function for the button.
   * @returns {Object} The created button element.
   * @example
   * // Create a button element
   * let buttonData = { 'style': ['my-button-style'] };
   * let newButton = this.pxlHUD.createButton('myButton', buttonData, ( data )=>{
   *   console.log( 'Button clicked!' );
   * });
   * this.pxlHUD.addToHUD( newButton );
   */
  createButton( label, data, callbackFn=null, parentObj=null ){
    let button = new ElementBase( label, data );
    button.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    button.build();

    if(callbackFn !== null){
      button.subscribe( callbackFn );
    }
    if( parentObj !== null ){
      parentObj.appendChild( button.object );
    }

    return button;
  }

  /**
   * Create a thumbstick element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the thumbstick.
   * @param {Object} data - The data for the thumbstick.
   * @param {Function|null} [callbackFn=null] - The callback function for the thumbstick.
   * @returns {Object} The created thumbstick element.
   * @example
   * // Create a thumbstick element
   * let thumbstickData = { 'style': ['my-thumbstick-style'] };
   * let newThumbstick = this.pxlHUD.createThumbstick('myThumbstick', thumbstickData, ( data )=>{
   *   console.log( 'Thumbstick value changed!' );
   *   console.log( data );
   * });
   * this.pxlHUD.addToHUD( newThumbstick );
   */
  createThumbstick( label, data, callbackFn=null ){

    let thumbstickObj = new Thumbstick( label, data );
    thumbstickObj.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    thumbstickObj.build();

    // Connect thumbstick interactions to listeners
    if( callbackFn !== null ){
      thumbstickObj.subscribe( callbackFn );
    }

    return thumbstickObj;
  }

  /**
   * Create a slider element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the slider.
   * @param {Object} data - The data for the slider.
   * @param {Function|null} [callbackFn=null] - The callback function for the slider.
   * @returns {Object} The created slider element.
   * @example
   * // Create a slider element
   * let sliderData = { 'min': 0, 'max': 100, 'value': 50, 'style': ['my-slider-style'] };
   * let newSlider = this.pxlHUD.createSlider('mySlider', sliderData, ( data )=>{
   *   console.log( 'Slider value changed!' );
   *   console.log( data );
   * });
   * this.pxlHUD.addToHUD( newSlider );
   */
  createSlider( label, data, callbackFn=null, parentObj=null ){
    let slider = new ElementBase( label, data );
    slider.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    slider.build();

    if(callbackFn !== null){
      slider.subscribe( callbackFn );
    }
    if( parentObj !== null ){
      parentObj.appendChild( slider.object );
    }

    return slider;
  }

  /**
   * Create an image element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the image.
   * @param {Object} data - The data for the image.
   * @param {Function|null} [callbackFn=null] - The callback function for the image.
   * @returns {Object} The created image element.
   * @example
   * // Create an image element
   * let imageData = { 'src': 'path/to/image.png', 'style': ['my-image-style'] };
   * let newImage = this.pxlHUD.createImage('myImage', imageData, ( data )=>{
   *   console.log( 'Image clicked!' );
   * });
   * this.pxlHUD.addToHUD( newImage );
   */
  createImage( label, data, callbackFn=null, parentObj=null ){
    let image = new ElementBase( label, data );
    image.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    image.build();

    if(callbackFn !== null){
      image.subscribe( callbackFn );
    }
    if( parentObj !== null ){
      parentObj.appendChild( image.object );
    }

    return image;
  }

  /**
   * Create a text element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label for the text.
   * @param {Object} data - The data for the text.
   * @param {Function|null} [callbackFn=null] - The callback function for the text.
   * @returns {Object} The created text element.
   * @example
   * // Create a text element
   * let textData = { 'text': 'Hello, world!', 'style': ['my-text-style'] };
   * let newText = this.pxlHUD.createText('myText', textData, ( data )=>{
   *   console.log( 'Text clicked!' );
   * });
   * this.pxlHUD.addToHUD( newText );
   */
  createText( label, data, callbackFn=null, parentObj=null ){
    let text = new ElementBase( label, data );
    text.setDependencies( { 'pxlOptions':this.pxlOptions, 'pxlEnums':this.pxlEnums, 'pxlDevice':this.pxlDevice } );
    text.build();

    if(callbackFn !== null){
      text.subscribe( callbackFn );
    }
    if( parentObj !== null ){
      parentObj.appendChild( text.object );
    }

    return text;
  }

  // -- -- --

  /**
   * Create mobile HUD elements.
   * @private
   */
  createMobileHUD(){
    let curId = '';
    let curElement = '';
    let curData = {};

    let mobileHudParent = document.createElement('div');
    mobileHudParent.classList.add('pxlNav-hudMobile-parent');
    mobileHudParent.classList.add();

    this.hudParent.appendChild( mobileHudParent );

    let noneState = this.pxlEnums.HUD_ACTION.NONE;
    let hoverState = this.pxlEnums.HUD_ACTION.HOVER;
    let activeState = this.pxlEnums.HUD_ACTION.ACTIVE;

    // Virtual thumbsticks with dragable inner peg
    curId = 'thumbstick_left';
    curData = {
       'style': [ 'pxlNav-hudMobile-joystick-left' ],
       'objectStyles': [
          {
            'object': 'block',
          },
          {
            'object': 'parent',
          },
          {
            'object': 'inner',
          },
        ]
      };
      curData['objectStyles'][0][noneState] = ['pxlNav-hudElement-thumbstick-block-default'];
      curData['objectStyles'][0][hoverState] = ['pxlNav-hudElement-thumbstick-block-hover'];
      curData['objectStyles'][0][activeState] = ['pxlNav-hudElement-thumbstick-block-active'];

      curData['objectStyles'][1][noneState] = ['pxlNav-hudElement-thumbstick-default'];
      curData['objectStyles'][1][hoverState] = ['pxlNav-hudElement-thumbstick-hover'];
      curData['objectStyles'][1][activeState] = ['pxlNav-hudElement-thumbstick-active', 'pxlNav-hudElement-thumbstick-left'];

      curData['objectStyles'][2][noneState] = ['pxlNav-hudElement-thumbstick-inner-default'];
      curData['objectStyles'][2][hoverState] = ['pxlNav-hudElement-thumbstick-inner-hover'];
      curData['objectStyles'][2][activeState] = ['pxlNav-hudElement-thumbstick-inner-active'];

    
    curElement = this.addItem( curId, HUD_ELEMENT.THUMBSTICK, Object.assign({},curData) );

    // Connect movement joystick to device actions
    curElement.subscribe(( deltas )=>{
      this.mobileDeligate( DEVICE_ACTION.MOVE, deltas );
    });

    this.mobileHUD[ curId ] = curElement;

    // -- -- --

    curId =  'thumbstick_right';
    
    curData = Object.assign({},curData);
    curData['style'] = [ 'pxlNav-hudMobile-joystick-right' ];
    curData['objectStyles'][1] = { 'object': 'parent' };
    curData['objectStyles'][1][noneState] = ['pxlNav-hudElement-thumbstick-default'];
    curData['objectStyles'][1][hoverState] = ['pxlNav-hudElement-thumbstick-hover'];
    curData['objectStyles'][1][activeState] = ['pxlNav-hudElement-thumbstick-active', 'pxlNav-hudElement-thumbstick-right'];

    curElement = this.addItem( curId, HUD_ELEMENT.THUMBSTICK, curData );

    // Connect look joystick to device actions
    curElement.subscribe(( deltas )=>{
      this.mobileDeligate( DEVICE_ACTION.LOOK, deltas );
    });

    this.mobileHUD[ curId ] = curElement;

    // -- -- --


    // Empty tap reagions for mobile jump & run
    curId = 'mobile_jump';
    curData = { 'style': [ 'pxlNav-hudMobile-region-jump' ] };
    curElement = this.addItem( curId, HUD_ELEMENT.REGION, curData, ( e )=>{
      this.mobileDeligate( DEVICE_ACTION.JUMP, {}, e );
    } );

    this.mobileHUD[ 'jump' ] = curElement;

    // -- -- --

    curId =  'mobile_ACTION';
    curData = { 'style': [ 'pxlNav-hudMobile-region-action' ] };
    curElement = this.addItem( curId, HUD_ELEMENT.REGION, curData );

    // Connect item region to device actions
    curElement.subscribe(( e )=>{
      this.mobileDeligate( DEVICE_ACTION.ACTION, e );
    });

    this.mobileHUD[ 'item' ] = curElement;



  }

  // -- -- --

  /**
   * Handle mobile HUD interactions to the device.
   * @param {pxlEnum} eventType - The type of event.
   * @param {Object} data - The data for the event.
   * @private
   */
  mobileDeligate( eventType, data={}, status=true ){
    this.pxlDevice.deviceAction( eventType, data, status );
  }


  // -- -- --

  /**
   * Subscribe to a HUD element's events.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label of the HUD element.
   * @param {Function} callbackFn - The callback function to subscribe.
   * @example
   * // Subscribe to a HUD element
   * let newButton = this.pxlHUD.addItem( 'myButton', HUD_ELEMENT.BUTTON );
   * this.pxlHUD.subscribe( 'myButton', ( data )=>{
   *   console.log( 'Button clicked!' );
   * });
   */
  subscribe( label, callbackFn ){
    if( this.huds.hasOwnProperty( label ) ){
      if( !this.huds[ label ].hasOwnProperty('callbacks') ){
        this.huds[ label ].callbacks = [];
      }
      this.huds[ label ].callbacks.push( callbackFn );
    }
  }

  /**
   * Emit an event for a HUD element.
   * @method
   * @memberof pxlHUD
   * @param {string} label - The label of the HUD element.
   * @param {Object} data - The data for the event.
   */
  emit( label, data ){
    if( this.huds.hasOwnProperty( label ) && this.huds[ label ].hasOwnProperty('callbacks') ){
      this.huds[ label ].callbacks.forEach( (fn)=>{
        fn( data );
      });
    }
  }

}