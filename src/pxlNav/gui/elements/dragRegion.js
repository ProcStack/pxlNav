// HUD Element Base Class
//   Written by Kevin Edzenga, 2025
// -- -- -- -- -- -- -- -- -- -- -- --
//
//

import { ElementBase } from './elementBase.js';
import { HUD_DRAW, HUD_ELEMENT } from "../../core/Enums.js";

export class DragRegion extends ElementBase{
  constructor( name="hudDrawRegion", data = {} ){
    super( name, data );

    this.type = HUD_ELEMENT.DRAG_REGION;

    this.dragThreshold = 10;

  }
  
  // -- -- --

  build(){
    let dragEmptyObj = this.createMainElement();
    dragEmptyObj.classList.add('pxlNav-hudElement-dragRegion');
    return dragEmptyObj;
  }

  // -- -- --

  ontouchstart( e ){}

  ontouchmove( e ){}

  ontouchend( e ){}
  
}