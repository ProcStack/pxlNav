// HUD Element Base Class
//   Written by Kevin Edzenga, 2025
// -- -- -- -- -- -- -- -- -- -- -- --
//
//

import { HUD_DRAW, HUD_ELEMENT } from "../../core/Enums.js";

export class ElementBase{
  constructor( name="hudRegion", data = {} ){
    this.name = name;
    this.object = null; // DOM Object
    this.type = HUD_ELEMENT.REGION;

    this.pxlOptions = null;
    this.pxlEnums = null;
    this.pxlDevice = null;

    this.touchId = -1;
    this.isDown = false;
    this.isDragging = false;

    this.dragCount = 0;
    this.dragThreshold = 10;

    this.startPos = null;
    this.currentPos = null;
    this.previousPos = null;
    this.startDelta = {
      'x':0,
      'y':0
    };

    this.stepDelta = {
      'x':0,
      'y':0
    };

    // -- -- --

    this.defaultObject = {
      'pos' : {
        'x' : 0,
        'y' : 0,
      },
      'bbox' : {
        'width' : 0,
        'height' : 0,
      },
      'draw' : HUD_DRAW.DEFAULT,
      'style' : [],
      'objectStyles' : [],
      'objectStyleKeys' : [],
    };

    this.defaultObjectStyleEntry = {
      'object': 'parent',
      'base': ['pxlNav-hudElement-thumbstick-default'],
      'hover': ['pxlNav-hudElement-thumbstick-hover'],
      'active': ['pxlNav-hudElement-thumbstick-active']
    }

    if( typeof data !== 'object' ){
      data = {};
    }
    data = Object.assign( this.defaultObject, data );

    // Parse object override style keys
    //   Make for easier lookup into the objectStyles [{},{},...]
    if( data.objectStyles.length > 0 ){
      data.objectStyles.forEach(( style )=>{
        data.objectStyleKeys.push( style.object );
      });
    }

    this.data = data;

    // -- -- --

    this.callbacks = [];
  }
  
  // -- -- --

  setDependencies( pxlNav ){
    this.pxlOptions = pxlNav.pxlOptions;
    this.pxlEnums = pxlNav.pxlEnums
    this.pxlDevice = pxlNav.pxlDevice;
  }

  // -- -- --

  build(){
    let emptyObj = this.createMainElement();
    emptyObj.classList.add('pxlNav-hudElement-region');
    this.object = emptyObj;

    this.object.ontouchstart = this.ontouchstart.bind( this );
    this.object.ontouchend = this.ontouchend.bind( this );

    return emptyObj;
  }

  // -- -- --

  // Build generic parent object for HUD Element
  createMainElement(){
    let emptyObj = document.createElement('div');
    if( this.data.hasOwnProperty('id') ){
      emptyObj.id = this.data.id;
    }
    if( this.data.hasOwnProperty('style') ){
      this.data.style.forEach( style => {
        emptyObj.classList.add( style );
      });
    }
    this.object = emptyObj;
    return emptyObj;
  }


  // -- -- --

  ontouchstart( e ){
    this.emit( true );
  }

  ontouchmove( e ){}

  ontouchend( e ){
    this.emit( false );
  }

  // -- -- --
  
  updateStyle(){}
  
  // -- -- --

  subscribe( callbackFn ){
    this.callbacks.push( callbackFn );
  }

  emit( data ){
    this.callbacks.forEach( function( fn ){
      fn( data );
    });
  }
}