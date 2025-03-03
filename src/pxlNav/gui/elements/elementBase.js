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

    this.isDown = false;
    this.isDragging = false;

    this.dragCount = 0;
    this.dragThreshold = 10;

    this.startPos = null;
    this.currentPos = null;
    this.delta = {
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
    };

    if( typeof data !== 'object' ){
      data = {};
    }
    data = Object.assign( this.defaultObject, data );
    this.data = data;

    // -- -- --

    this.callbacks = [];
  }
  
  // -- -- --

  build(){
    let emptyObj = this.createMainElement();
    emptyObj.classList.add('pxlNav-hudElement-region');
    this.object = emptyObj;
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

  ontouchstart( e ){}

  ontouchmove( e ){}

  ontouchend( e ){}

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