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
    
    this.block = null;
    this.currentState = -1;
    this.innerObj = null;
    this.blockStyleOverrides = null;
    this.parentStyleOverrides = null;
    this.innerStyleOverrides = null;
  }

  // -- -- --

  build(){
    let blockObj = this.createMainElement();
    blockObj.classList.add('pxlNav-hudElement-thumbstick-block');

    let parentObj = document.createElement('div');
    parentObj.classList.add('pxlNav-hudElement-thumbstick');
    blockObj.appendChild( parentObj );

    let innerObj = document.createElement('div');
    innerObj.classList.add('pxlNav-hudElement-thumbstick-inner');
    parentObj.appendChild( innerObj );

    // -- -- --

    blockObj.ontouchstart = this.ontouchstart.bind( this );
    blockObj.ontouchmove = this.ontouchmove.bind( this );
    blockObj.ontouchend = this.ontouchend.bind( this );

    // -- -- --
    
    this.block = blockObj;
    this.object = parentObj;
    this.innerObj = innerObj;
    
    // -- -- --

    if( this.data.hasOwnProperty('objectStyleKeys') && this.data.objectStyleKeys.length > 0 ){
      let blockIndex = this.data.objectStyleKeys.indexOf('block');
      let parentIndex = this.data.objectStyleKeys.indexOf('parent');
      let innerIndex = this.data.objectStyleKeys.indexOf('inner');

      if( blockIndex >= 0 ){
        this.blockStyleOverrides = this.data.objectStyles[ blockIndex ];
        this.blockStyleOverrides[ 'currentAction' ] = this.pxlEnums.HUD_ACTION.NONE;
        this.blockStyleOverrides[ this.pxlEnums.HUD_ACTION.NONE ].forEach(( s )=>{
          blockObj.classList.add( s );
        });
      }

      if( parentIndex >= 0 ){
        this.parentStyleOverrides = this.data.objectStyles[ parentIndex ];
        this.parentStyleOverrides[ 'currentAction' ] = this.pxlEnums.HUD_ACTION.NONE;
        this.parentStyleOverrides[ this.pxlEnums.HUD_ACTION.NONE ].forEach(( s )=>{
          parentObj.classList.add( s );
        });
      }

      if( innerIndex >= 0 ){
        this.innerStyleOverrides = this.data.objectStyles[ innerIndex ];
        this.innerStyleOverrides[ 'currentAction' ] = this.pxlEnums.HUD_ACTION.NONE;
        this.innerStyleOverrides[ this.pxlEnums.HUD_ACTION.NONE ].forEach(( s )=>{
          innerObj.classList.add( s );
        });
      }
    }

    // -- -- --

    return blockObj;
  }

  // -- -- --

  ontouchstart( e ){
    e.preventDefault();
    e.stopPropagation();

    this.isDown = true;
    this.isDragging = false;
    this.dragCount = -1;

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
        if( Math.abs( this.startDelta.x ) > this.pxlOptions.userSettings.deadZone.touch || Math.abs( this.startDelta.y ) > this.pxlOptions.userSettings.deadZone.touch ){
          this.isDragging = true;
        }
      }

      let tempX = this.currentPos?.x || e.touches[0].clientX;
      let tempY = this.currentPos?.y || e.touches[0].clientY;

      this.previousPos = {
        'x': tempX,
        'y': tempY
      }

      this.currentPos = {
        'x': e.touches[0].clientX,
        'y': e.touches[0].clientY
      };


      
      this.startDelta = {
        'x': this.currentPos.x - this.startPos.x,
        'y': this.currentPos.y - this.startPos.y 
      };

      this.stepDelta = {
        'x': this.currentPos.x - this.previousPos.x,
        'y': this.currentPos.y - this.previousPos.y 
      };

      this.emit( {
        'startPos' : this.startPos,
        'previousPos' : this.previousPos,
        'currentPos' : this.currentPos,
        'startDelta' : this.startDelta,
        'stepDelta' : this.stepDelta,
        'dragCount' : this.dragCount,
        'status' : true
      });

      this.updateStyle();
    }
  }

  ontouchend( e ){
    e.preventDefault();
    e.stopPropagation();

    this.emit( {
      'startPos' : this.startPos,
      'previousPos' : this.previousPos,
      'currentPos' : Object.assign( {}, this.currentPos ),
      'startDelta' : this.startDelta,
      'stepDelta' : this.stepDelta,
      'dragCount' : this.dragCount,
      'status' : false
    });

    this.isDown = false;
    this.isDragging = false;
    this.dragCount = -1;
    this.currentPos = null;
    this.startPos = null;
    this.prevPos = null;
    

    
    this.updateStyle();

  }

  // -- -- --

  updateStyle(){
    if( !this.innerObj || !this.object ){
      return;
    }
    
    if( this.isDown && !this.isDragging ){

      // 
      if( this.blockStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.HOVER, this.blockStyleOverrides );
      }

      if( this.parentStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.HOVER, this.parentStyleOverrides );
      }

      if( this.innerStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.HOVER, this.innerStyleOverrides );
      }

      // Touch is down; dragCount < dragThreshold
      this.innerObj.style.left = 0 + 'px';
      this.innerObj.style.top = 0 + 'px';

    }else if( this.isDragging ){


      if( this.blockStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.ACTIVE, this.blockStyleOverrides );
      }

      if( this.parentStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.ACTIVE, this.parentStyleOverrides );
      }

      if( this.innerStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.ACTIVE, this.innerStyleOverrides );
      }

      let parentRect = this.object.getBoundingClientRect();
      let parentCenterX = parentRect.width / 2 + parentRect.left;
      let parentCenterY = parentRect.height / 2 + parentRect.top;
      //let pushX = this.currentPos.x - parentCenterX;
      //let pushY = this.currentPos.y - parentCenterY;
      let pushX = this.startDelta.x ;
      let pushY = this.startDelta.y ;

      let dist = Math.max( ( pushX ** 2 + pushY ** 2 ) ** 0.5, 1.0 );
      if( dist > 100 ){
        pushX = (pushX / dist) * 100;
        pushY = (pushY / dist) * 100;
      }

      // Touch is dragging; dragCount > dragThreshold
      this.innerObj.style.left = pushX + 'px';
      this.innerObj.style.top = pushY + 'px';
    }else{
      if( this.blockStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.NONE, this.blockStyleOverrides );
      }

      if( this.parentStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.NONE , this.parentStyleOverrides );
      }

      if( this.innerStyleOverrides ){
        this.toggleStyle( this.pxlEnums.HUD_ACTION.NONE, this.innerStyleOverrides );
      }

      // Reset thumbstick objects
      this.innerObj.style.left = '0px';
      this.innerObj.style.top = '0px';
    }
  }


  // -- -- --
  
  toggleStyle( action, overrides ){
    if( action === overrides[ 'currentAction' ] ){
      return;
    }

    let actionList = [ this.pxlEnums.HUD_ACTION.NONE, this.pxlEnums.HUD_ACTION.HOVER, this.pxlEnums.HUD_ACTION.ACTIVE ];
    let actionIndex = actionList.indexOf( action );
    let curObj = null;

    if( overrides.object === 'block' ){
      curObj = this.block;
    }else if( overrides.object === 'parent' ){
      curObj = this.object;
    }else if( overrides.object === 'inner' ){
      curObj = this.innerObj;
    }

    actionList.forEach(( a, index )=>{
      if( index !== actionIndex ){
        overrides[ a ].forEach(( s )=>{
          curObj.classList.remove( s );
        });
      }else{
        overrides[ a ].forEach(( s )=>{
          curObj.classList.add( s );
        });
      }
    });

    overrides[ 'currentAction' ] = action;

  }
  
  // -- -- --

  subscribe( fn ){
    this.callbacks.push( fn );
  }

}