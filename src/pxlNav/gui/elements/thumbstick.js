// Thumbstick interface for the PxlNav GUI
//   Written by Kevin Edzenga, 2025
// -- -- -- -- -- -- -- -- -- -- -- --
//

import { ElementBase } from './elementBase.js';
import { HUD_DRAW, HUD_ELEMENT } from "../../core/Enums.js";

export class Thumbstick extends ElementBase{
  constructor( name, data = {} ){
    super( name, data );

    this.type = HUD_ELEMENT.THUMBSTICK;
    this.dragThreshold = 10;
  }

  // -- -- --

  build(){
    let parentObj = this.createMainElement();
    parentObj.classList.add('pxlNav-hudElement-thumbstick');

    let innerObj = document.createElement('div');
    innerObj.classList.add('pxlNav-hudElement-thumbstick-inner');
    parentObj.appendChild( innerObj );

    // -- -- --

    parentObj.ontouchstart = this.ontouchstart.bind( this );
    parentObj.ontouchmove = this.ontouchmove.bind( this );
    parentObj.ontouchend = this.ontouchend.bind( this );

    // -- -- --
    
    this.object = parentObj;
    this.innerObj = innerObj;
    
    // -- -- --

    return parentObj;
  }

  // -- -- --

  ontouchstart( e ){
    e.preventDefault();
    e.stopPropagation();

    this.isDown = true;
    this.isDragging = false;
    this.dragCount = 0;

    this.startPos = {
      'x': e.touches[0].clientX,
      'y': e.touches[0].clientY
    };

    this.updateStyle();

  }

  ontouchmove( e ){
    e.preventDefault();
    e.stopPropagation();

    if( this.isDown ){
      this.dragCount++;

      if( !this.isDragging ){
        if( Math.abs( this.delta.x ) > this.dragThreshold || Math.abs( this.delta.y ) > this.dragThreshold ){
          this.isDragging = true;
        }
      }

      this.currentPos = {
        'x': e.touches[0].clientX,
        'y': e.touches[0].clientY
      };

      this.delta = {
        'x': this.currentPos.x - this.startPos.x,
        'y': this.currentPos.y - this.startPos.y
      };

      this.emit( this.delta );

      this.updateStyle();
    }
  }

  ontouchend( e ){
    e.preventDefault();
    e.stopPropagation();

    this.isDown = false;
    this.isDragging = false;
    this.dragCount = 0;
    
    this.updateStyle();

  }

  // -- -- --

  updateStyle(){
    if( !this.innerObj ){
      return;
    }

    if( this.isDown && !this.isDragging ){
      // Touch is down; dragCount < dragThreshold
      this.innerObj.style.left = this.delta.x + 'px';
      this.innerObj.style.top = this.delta.y + 'px';
    }else if( this.isDragging ){
      // Touch is dragging; dragCount > dragThreshold
      this.innerObj.style.left = this.delta.x + 'px';
      this.innerObj.style.top = this.delta.y + 'px';
    }else{
      // Reset thumbstick objects
      this.innerObj.style.left = '0px';
      this.innerObj.style.top = '0px';
    }
  }

  // -- -- --

  subscribe( fn ){
    this.callbacks.push( fn );
  }

}