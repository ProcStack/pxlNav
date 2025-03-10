
/**
 * @namespace pxlDevice
 * @description Device and input handling
 */

import { 
  Vector2,
  Vector3,
  Quaternion
} from "../../libs/three/three.module.min.js";

// TODO : So much dependency on outside data and classes
//          Promote as much as possible to callback subscriptions

export class Device{
  constructor(projectTitle, pxlCore, mobile){
    this.projectTitle=projectTitle;
    this.pxlCore=pxlCore;
    this.pxlEnv=null;
    this.pxlEnums=null;
    this.pxlTimer=null;
    this.pxlAudio=null;
    this.pxlUser=null;
    this.pxlCamera=null;
    this.pxlAutoCam=null;
    this.pxlGuiDraws=null;
    this.pxlQuality=null;
    this.pxlOptions=null;


    // If the cursor swaps between grabbing and grabable
    // 'false' will keep the cursor as a pointer
    // 'true' will be grabable over pxlNav, grabbing while clicking
    this.allowCursorSwap = false;

    this.longTouchLength = .75; // Seconds to hold a tap, without moving, for long touch
    
    //this.bootTime=new Date().getTime();

    let sW = window.innerWidth;
    let sH = window.innerHeight;
    this.sW=sW;
    this.sH=sH;

    this.lookRange = .30;
    this.lookXScalar = 1 / (this.sW * this.lookRange);
    this.lookYScalar = 1 / (this.sH * this.lookRange);
    this.touchScreen=false;
    this.x=sW*.5;
    this.y=sH*.5;
    this.screenRes=new Vector2( 1/sW,1/sH );
    this.screenAspect=new Vector2( 1,1);//sH/sW,sW/sH );
    this.screenRatio=new Vector2( sW/sH, sH/sW );
    this.origRes=new Vector2( sW, sH );
    this.screenResDeltaPerc=new Vector2( 1, 1 );
    this.mapW=1;
    this.mapH=1;
    //this.wheelDelta=0;
    
    this.gammaCorrection = new Vector3(1,1,1);
    this.lightShift = new Vector2(1,1);
    
    this.firefox=/Firefox/i.test(navigator.userAgent);
    this.mobile=mobile;
        
    //const IE = document.all?true:false;
    //this.mouseWheelEvt=(firefox)? "DOMMouseScroll" : "mousewheel" ;
    this.button=0;
    this.inputActive=false;
    this.startPos=[0,0];
    this.endPos=[0,0];
    this.dragCount=0;
    this.dragTotal=0;
    this.latched=false;
    this.windowHidden=false;
    
    // -- -- -- -- -- -- -- -- //
    
    this.mouseX=sW/2;
    this.mouseY=sH/2;

    this.keyDownCount=[0,0,0];
    this.directionKeyDown=false;
    this.directionKeysPressed=[0,0,0,0];
    this.controlKey=false;
    
    this.objectPercList=[];
    this.objectPercFuncList={};
    this.objectPerc={
        active:false,
        object:null,
        left:0,
        top:0,
        width:0,
        height:0,
        startX:0,
        startY:0,
        offsetX:0,
        offsetY:0,
        percX:0,
        percY:0,
        offsetPercX:0,
        offsetPercY:0,
    };
    this.canCursorLock=
      'pointerLockElement' in document||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    this.cursorLockActive=false;
    this.cursorRightButtonLockActive=false;
    
    // ## All of this isn't needed, clean it up
    //      Controller Module?
    this.gyroGravity=[0,0,0];
    this.touchMouseData={
      'active':false,
      'lock':false,
      'mode':0,
      'updated':0,
      'button':0,
      'dragCount':0,
      'dragTotal':0,
      'startPos':null, //vec2
      'moveMult':new Vector2(1.,1.),
      'velocityEase':new Vector2(0,0),
      'velocityEasePrev':null, // new Vector2(0,0)
      'velocity':new Vector2(0,0), //vec2
      'mBlurVelInf':new Vector2(2*this.screenRes.x,2*this.screenRes.y),
      'prevDeltaPos':[0,0,0], //vec2
      'endPos':null, //  [x,y] 
      'latchMatrix':null, // Mat4
      'netDistance':new Vector2(0,0), //vec2
      'netDistYPerc':0, //vec2
      'curDistance':new Vector2(0,0), //vec2
      'curFadeOut':new Vector2(0,0), //vec2
      'curStepDistance':new Vector2(0,0), //vec2
      'initialQuat':new Quaternion(),
      'releaseTime':0,
    };
        
    this.subscriptableEvents=[
        //"touchstart",
        //"touchmove",
        //"touchend",
        //"mousedown",
        //"mousemove",
        //"mouseup",
        "keydown",
        "keyup",
        "resize"
      ];
    this.callbackList={};
    
  }

  setDependencies( pxlNav ){
    this.pxlEnv=pxlNav.pxlEnv;
    this.pxlEnums=pxlNav.pxlEnums;
    this.pxlTimer=pxlNav.pxlTimer;
    this.pxlAudio=pxlNav.pxlAudio;
    this.pxlUser=pxlNav.pxlUser;
    this.pxlCamera=pxlNav.pxlCamera;
    this.pxlAutoCam=pxlNav.pxlAutoCam;
    this.pxlGuiDraws=pxlNav.pxlGuiDraws;
    this.pxlQuality=pxlNav.pxlQuality;
    this.pxlOptions=pxlNav.pxlOptions;
  }

  init(){
    
    this.setGammaCorrection();
    
    let curObj=this;
    if( !this.pxlOptions.staticCamera || (this.pxlOptions.allowStaticRotation && this.pxlOptions.staticCamera) ){
      document.addEventListener("mousedown", (e)=>{ curObj.onmousedown(curObj,e); }, false);
      document.addEventListener("mousemove", (e)=>{ curObj.onmousemove(curObj,e); }, false);
      document.addEventListener("mouseup", (e)=>{ curObj.onmouseup(curObj,e); }, false);
      document.addEventListener('touchstart', function(e) {curObj.touchstart(curObj,e);}, {passive : true});
      document.addEventListener('touchmove', function(e) {curObj.touchmove(curObj,e);}, {passive : true});
      document.addEventListener('touchend', function(e) {curObj.touchend(curObj,e);}, {passive : true});
    }

    document.addEventListener("contextmenu", (e)=>{ curObj.oncontextmenu(e); }, false);
    window.addEventListener("resize", (e)=>{ curObj.resizeRenderResolution(); }, false);
    
    document.onkeydown=(e)=>{curObj.onkeydown(curObj,e)};
    document.onkeyup=(e)=>{curObj.onkeyup(curObj,e)};
  
    let tmpThis=this;
    /*window.addEventListener("popstate", (e)=>{
        console.log( e );
        //JSON.stringify(e.state);
    });*/
    document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this), false);
      
      if( typeof window.onblur == "object" ){
          window.onblur= this.resetUserInput.bind(this);
      }
        /*
    window.addEventListener( 'blur', (e)=>{
      tmpThis.directionKeysPressed=[0,0,0,0];
      tmpThis.directionKeyDown=false;
      tmpThis.pxlUser.setSpeed( tmpThis.pxlEnums.USER_SPEED.STOP );
      tmpThis.pxlCamera.workerFunc("focus");
    });*/
    window.addEventListener( 'beforeunload', (e)=>{
      if( tmpThis.controlKey==true ){
          e.preventDefault();
          e.returnValue="Close tab?";
          tmpThis.controlKey=false;
          tmpThis.mapLockCursor(false, 0);
          return "Close tab?";
      }
    });
  }
    
  // -- -- -- -- -- -- -- -- -- -- //

  step(){
    this.addMoveDelta();
  }

  // -- -- -- -- -- -- -- -- -- -- //
  
  // Post Process Gamma Correction; Set from Value / Detect based on OS
  // Default Gamma Settings --
  //   Windows - 2.2
  //   Mac - 1.8
  //   Linux - 1
  //     **Linux seems wrong, but can't find any reliable values other than `1`
  setGammaCorrection( value=null ){
    if( value != null ){ // Set from Settings Menu
      this.gammaCorrection.x = 1/value;
      this.gammaCorrection.y = value;
      this.gammaCorrection.z = value;
      return;
    }
    
    // Detect based on device operating system
    let toGamma = 1.5; // Most devices will be 1 (Mobile); Fail to middle ground
    let lightShift = 1.1; // Most devices will be 1 (Mobile); Fail to middle ground
    let shadowShift = 1.2; // Most devices will be 1 (Mobile); Fail to middle ground
    let shadowBoost = .5;
    if( window && window.navigator && window.navigator.userAgent ){
      let isWindows = window.navigator.userAgent.match(/(windows|win32|win64|wince)/i)
      if( isWindows && isWindows.length>0 ){ 
        toGamma = 2.2; // Windows
        lightShift = 0.95;
        shadowShift = 1;
        shadowBoost = 0;
      }else{
        let isMac = window.navigator.userAgent.match(/(macintosh|macintel|macppc|mac68k|iphone|ipad|ipod)/i)
        if( isMac && isMac.length>0 ){ 
          toGamma = 1.8; // Mac
          lightShift = 0.9;
          shadowShift = .97;
          shadowBoost = .1;
        }else{ 
          toGamma = 1.8; // Linux / Android
          lightShift = 0.70;
          shadowShift = .96;
          shadowBoost = .1;
        }
      }
    }
    // Color space is bugging me.... Just designing for windows and adjusting for the others
    this.gammaCorrection.x = 1/toGamma;
    this.gammaCorrection.y = shadowShift;
    this.gammaCorrection.z = shadowBoost;
    this.lightShift.x = lightShift;
  }
    
  // -- -- -- -- -- -- -- -- -- -- //
  
  getRenderScalar(){
    let renderScalar = 1.0;
    if( this.mobile && this.pxlOptions.renderScale.mobile != 0){
      renderScalar = this.pxlOptions.renderScale.mobile;
    }else if( this.pxlOptions.renderScale.pc != 0){
      renderScalar = this.pxlOptions.renderScale.pc;
    }

    return renderScalar;
  }

  // Set main pxlNav canvas size, with overscan if enabled
  //   Overscan is a percentage to render outside the canvas size
  //     But is scaled back to fit within the canvas
  //   This is primarily to allow for better rendering on mobile devices
  // Set `overscan` in pxlOptions to a percentage value
  //   pxlOptions.overscan = {
  //    'pc' : 0.0,
  //    'mobile' : 0.0
  //   }
  /**
   * Set main pxlNav canvas size, with overscan if enabled
   * 
   * Overscan is a percentage to render outside the canvas size
   * <br/>&nbsp;&nbsp; But is scaled back to fit within the canvas
   * <br/>This is primarily to allow for better rendering on mobile devices
   */
  setCanvasSize( sW, sH ){
    // Set main pxlNav Canvas Size
    this.pxlGuiDraws.pxlNavCanvas.width = sW;
    this.pxlGuiDraws.pxlNavCanvas.height = sH;
    
    let renderScalar = this.getRenderScalar();

    // Set overscan if enabled
    if( renderScalar != 1.0 ){
      let overscanFit = 1 / renderScalar;
      this.pxlGuiDraws.pxlNavCanvas.style.transform = "scale(" + overscanFit + ")";
    }else{
      this.pxlGuiDraws.pxlNavCanvas.style.transform = "";
    }
  }

  // -- -- -- -- -- -- -- -- -- -- //

  runHiddenCalcs(){
      if( this.windowHidden ){
          setTimeout( ()=>{
              this.runHiddenCalcs();
          }, 100);
      }
  }
  
  onVisibilityChange(){
    this.windowHidden=document.hidden ;
          
    this.directionKeysPressed=[0,0,0,0];
    this.directionKeyDown=false;
    this.pxlUser.setSpeed( this.pxlEnums.USER_SPEED.BASE );
    this.pxlCamera.workerFunc("focus", !document.hidden);
    
    this.runHiddenCalcs();
  }

  resetUserInput(e){
    this.directionKeysPressed=[0,0,0,0];
    this.directionKeyDown=false;
    this.pxlUser.setSpeed( this.pxlEnums.USER_SPEED.BASE );
    this.mapLockCursor(false,0);
    this.pxlCamera.camJumpKey(false);
    this.pxlCamera.deviceKey("space", false);
    
    if( this.touchMouseData.active ){
      if( this.touchScreen ){
        this.endTouch(e);
      }else{
        this.mapOnUp(e);
      }
    }
  }
  
  requestFullScreen(){
    let elem = document.documentElement;
    let requestMethod = elem.requestFullScreen ||
                        elem.webkitRequestFullScreen ||
                        elem.mozRequestFullScreen ||
                        elem.msRequestFullScreen;
    if( requestMethod ){
      requestMethod.call(elem);
    }
  }


  // -- -- -- -- -- -- -- -- -- -- //
  
  onmousemove(curObj,e){
    curObj.mapOnMove(e);
  }
  onmousedown(curObj,e){

    curObj.mapOnDown(e);
  }
  onmouseup(curObj,e){
    curObj.mapOnUp(e);
  }
  oncontextmenu(e){
        e.preventDefault();
        return false;
  }
  touchstart(curObj,e){
    curObj.startTouch(e);
  }
  touchmove(curObj,e){
    curObj.doTouch(e);
  }
  touchend(curObj,e){
    curObj.endTouch(e);
  }
  onkeydown(curObj,e){
    curObj.keyDownCall(e);
  }
  onkeyup(curObj,e){
    curObj.keyUpCall(e);
  }
  
  
  get active(){
    return this.inputActive;
  }
  set active(state){
    this.inputActive=!!state;
  }

  // -- -- -- -- -- -- -- -- -- -- //

  preventDefault(e){
    e=e||window.event;
    if (e.preventDefault(e)){
      e.preventDefault(e)();
    }
    e.returnValue=false;
  }
    
  setCursor(cursorType){
    if(this.allowCursorSwap){
      if(cursorType == "activeLatch"){
              let cursorType=["grab", "grabbing","all-scroll"][this.touchMouseData.button];
      }
      document.body.style.cursor=cursorType;
    }
  }

  hideAddressBar(){
    setTimeout(function(){ window.scrollTo(0, 1); }, 0);
  }
    
  getMouseXY(e){
    //e.this.preventDefault(e)();
    if(!this.mobile){
      let invert=this.pxlQuality.settings.mouse ? -1 : 1;
      if(this.cursorLockActive){
        this.mouseX+=(e.movementX||e.mozMovementX||e.webkitMovementX||0)*invert;
        this.mouseY+=(e.movementY||e.mozMovementY||e.webkitMovementY||0)*invert;
      }else{
        this.mouseX=e.clientX;
        this.mouseY=e.clientY;
      }
    }else{
      try{
        touch = e.touches[0];
        this.mouseX = touch.pageX;
        this.mouseY = touch.pageY;
        //pxlDevice.touchMouseData.startPos=new Vector2(this.mouseX,this.mouseY);
        //pxlDevice.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
      }catch(err){};
    }
    //mapMouse.x=(this.mouseX/sW)*2 - 1;
    //mapMouse.y=-(this.mouseY/sH)*2 + 1;
  }

  mapLockCursor(lock=false, button){
    if(this.canCursorLock && !this.mobile ){
      if(button==2){
        if(!lock && this.cursorRightButtonLockActive){
          this.cursorRightButtonLockActive=false;
        }else if(!lock && !this.cursorRightButtonLockActive){
          this.cursorRightButtonLockActive=true;
        }
        
        lock=lock || this.cursorRightButtonLockActive;
      }else{
        if(!lock){
          this.cursorRightButtonLockActive=lock;
        }
      }
      
      if(lock==true){
        this.pxlGuiDraws.pxlNavCanvas.focus();
        let curCanvas = this.pxlGuiDraws.pxlNavCanvas;
        curCanvas.requestPointerLock = curCanvas.requestPointerLock || 
                                       curCanvas.mozRequestPointerLock ||
                                       curCanvas.webkitRequestPointerLock;
        try{
          curCanvas.requestPointerLock()
          //  Catch isn't working on firefox
          //    .catch((err)=>{}); // User likely hit ESC out of the cursor lock
        }catch(err){}
      }else{
        if( document.pointerLockElement ){
          document.exitPointerLock();
        }
      }
      this.cursorLockActive=lock;
    }
  }

  mapOnDown(e){
    //let target= e.path ? e.path[0] : e.target; // Chrome or Firefox
    let target= e.target; // Chrome or Firefox
    if( target.getAttribute && target.getAttribute("id") == this.pxlCore && this.pxlTimer.active ){
      if(this.pxlGuiDraws.chatMessageInput){ this.pxlGuiDraws.chatMessageInput.blur(); }
      this.pxlGuiDraws.pxlNavCanvas.focus();
      this.preventDefault(e);
      this.touchMouseData.button=e.which;
      this.touchMouseData.active=true;
      this.touchMouseData.mode=this.touchMouseData.button;
      this.touchMouseData.startPos=new Vector2(this.mouseX,this.mouseY);
      this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
      this.touchMouseData.curDistance=new Vector2(0,0);
      this.touchMouseData.curStepDistance=new Vector2(0,0);
      this.touchMouseData.dragCount=0;
      this.pxlAutoCam.touchBlender=false;
      this.setCursor("grabbing");
      this.mapLockCursor(true, e.button);
    }
  }
  mapOnMove(e){
    //let target= e.path ? e.path[0] : e.target; // Chrome or Firefox
    let target= e.target; // Chrome or Firefox

    if( (target.getAttribute && target.getAttribute("id") == this.pxlCore && this.pxlTimer.active) || this.cursorLockActive){

      this.preventDefault(e);
      this.getMouseXY(e);
      if((this.touchMouseData.active || this.cursorLockActive) && this.touchMouseData.startPos ){
        this.touchMouseData.dragCount++;

        let xyDeltaTemp=this.touchMouseData.endPos.clone();
        this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
        this.touchMouseData.curDistance= this.touchMouseData.startPos.clone().sub(this.touchMouseData.endPos) ;
        
        this.touchMouseData.curStepDistance = this.touchMouseData.endPos.clone().sub(xyDeltaTemp) ;
        this.touchMouseData.netDistance.add( this.touchMouseData.curStepDistance.clone());
        //let curvelocity=this.touchMouseData.velocity.clone();
        this.touchMouseData.velocity = this.touchMouseData.velocity.clone().multiplyScalar(3).add(this.touchMouseData.curStepDistance).multiplyScalar(.25);

        // ## Add into this.pxlQuality for 3rd mouse velocity reference
        /*this.touchMouseData.velocity.add(this.touchMouseData.curStepDistance).multiplyScalar(.5);
        let curveleaseprev=this.touchMouseData.velocityEasePrev.clone();
        this.touchMouseData.velocityEasePrev=this.touchMouseData.velocityEase.clone();
        this.touchMouseData.velocityEase=curveleaseprev.clone().add(curvelocity.add(this.touchMouseData.velocity).multiplyScalar(.5)).multiplyScalar(.5);*/
        
        this.touchMouseData.netDistYPerc = (this.touchMouseData.netDistance.y+this.touchMouseData.curDistance.y+250)*0.0008;
        this.touchMouseData.curFadeOut.add( xyDeltaTemp.sub(this.touchMouseData.endPos)  );
        
      }else{
        this.pxlEnv.hoverUserDetect();
      }
    }
  }
  mapOnUp(e){
    //let target= e.path ? e.path[0] : e.target; // Chrome or Firefox
    let target= e.target; // Chrome or Firefox
        if( this.pxlAudio.djVolumeParentObj ){
            this.pxlAudio.djVolumeParentObj.down=false;
        }
        if( target.getAttribute && target.getAttribute("id") == this.pxlCore){
            this.pxlGuiDraws.checkFocus( target.getAttribute("id"), true );
            
            if( this.mobile ){
                this.pxlAutoCam.getNextPath(false, 1);
            }else{
                
                this.preventDefault(e);
                
                this.touchMouseData.dragCount++;
                this.touchMouseData.dragTotal+=this.touchMouseData.dragCount;
                this.touchMouseData.active=false;
                this.touchMouseData.releaseTime=this.pxlTimer.curMS;
                this.pxlAutoCam.touchBlender=true;
                this.pxlAutoCam.setNextTrigger();
                
                if(this.touchMouseData.dragCount<9){ // User simply clicked, didn't dragCount
                    this.pxlEnv.clickUserDetect();
                }
                this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
                this.touchMouseData.netDistYPerc =  (this.touchMouseData.netDistance.y+250)/1250;
                //this.touchMouseData.curDistance.multiplyScalar(0);
                //this.touchMouseData.curStepDistance.multiplyScalar(0);
                this.setCursor("grab");
                
                this.mapLockCursor(false, e.button);
                
                e.preventDefault();
                return false;
            }
        }
  }

    // -- -- -- -- -- -- //
    
  startTouch(e) {
    
    let target= e.target; // Chrome or Firefox
    // Check if something other than the pxlCore canvas was touched
    let runTouch = target.getAttribute && target.getAttribute("id") == this.pxlCore && this.pxlTimer.active;
    if( !runTouch ){
      return;
    }

    this.touchScreen=true;
    let touch = e.touches[0];
    this.mouseX = touch.pageX;  
    this.mouseY = touch.pageY;
    this.touchMouseData.active=true;
    this.touchMouseData.mode=this.touchMouseData.button;
    this.touchMouseData.startPos=new Vector2(this.mouseX,this.mouseY);
    this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
    this.touchMouseData.curDistance=new Vector2(0,0);
    this.touchMouseData.curStepDistance=new Vector2(0,0);
    this.touchMouseData.dragCount=0;
    this.pxlAutoCam.touchBlender=false;
    this.touchMouseData.releaseTime=this.pxlTimer.curMS;
    
    let id=target.getAttribute("id");
    if( this.objectPercList.includes( id ) ){
      if( id == "djPlayerVolume" ){
        target=this.pxlAudio.djVolumeParentObj;
        id=target.getAttribute("id");
      }
      
      let pBB=target.getBoundingClientRect();

      this.objectPerc.active=true;
      this.objectPerc.object=target;
      this.objectPerc.left=pBB.left;
      this.objectPerc.top=pBB.top;
      this.objectPerc.width=pBB.width;
      this.objectPerc.height=pBB.height;
      this.objectPerc.startX= this.mouseX - pBB.left;
      this.objectPerc.startY= this.mouseY - pBB.top;
      this.objectPerc.percX= ( this.mouseX - this.objectPerc.left ) / this.objectPerc.width ;
      this.objectPerc.percY= ( this.mouseY -this.objectPerc.top ) / this.objectPerc.height ;
      this.objectPerc.offsetX=0;
      this.objectPerc.offsetY=0;
      this.objectPerc.offsetPercX = 0 ;
      this.objectPerc.offsetPercY = 0 ;
      
      if( this.objectPercFuncList[id] ){
        this.objectPercFuncList[id](e);
      }
    }
  }

  doTouch(e) {
    
    // Touch started on something other than the pxlCore canvas, ignore
    if(!this.touchMouseData.active){
      return;
    }
    
    let target= e.target; // Chrome or Firefox

    let touch = e.touches[0];
    this.mouseX=touch.pageX;
    this.mouseY=touch.pageY;
    if(this.touchMouseData.active){
      this.touchMouseData.dragCount++;
      
      // Rotate the fog color, cause why not???
      // TODO : "why not???" because its specific to Antibody Club,
      //          But its fun, so I'll figure out some way to make it a bit more generic if the user wants to enable it
      if(typeof(e.touches[1]) !== 'undefined'){
        let touchTwo = e.touches[1];
        if( e.touches.length>1 && this.touchMouseData.dragCount>10 ){
          this.touchMouseData.lock=true;
          touch = e.touches[1];
          this.pxlEnv.setFogHue( [this.mouseX, this.mouseY], [touch.pageX, touch.pageY] );
        }
        return;
      }

      let xyDeltaTemp=this.touchMouseData.endPos.clone();
      this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
      this.touchMouseData.curDistance= this.touchMouseData.startPos.clone().sub(this.touchMouseData.endPos) ;
      this.touchMouseData.curStepDistance = this.touchMouseData.endPos.clone().sub(xyDeltaTemp) ;
      this.touchMouseData.netDistance.add( this.touchMouseData.curStepDistance.clone() );
      this.touchMouseData.velocity.add(this.touchMouseData.curStepDistance).multiplyScalar(.5);
      //this.touchMouseData.velocityEase.add(this.touchMouseData.curStepDistance).multiplyScalar(.5);
            
      this.touchMouseData.netDistYPerc =  (this.touchMouseData.netDistance.y+this.touchMouseData.curDistance.y+250)/1250;
      this.touchMouseData.curFadeOut.add( xyDeltaTemp.sub(this.touchMouseData.endPos)  );
    }
      
    if( this.objectPerc.active ){
      this.objectPerc.percX = ( this.mouseX - this.objectPerc.left ) / this.objectPerc.width ;
      this.objectPerc.percY = ( this.mouseY - this.objectPerc.top ) / this.objectPerc.height ;
      this.objectPerc.offsetX = this.mouseX - this.objectPerc.startX ;
      this.objectPerc.offsetY = this.mouseY - this.objectPerc.startY ;
      this.objectPerc.offsetPercX = this.objectPerc.offsetX / this.objectPerc.width ;
      this.objectPerc.offsetPercY = this.objectPerc.offsetY / this.objectPerc.height ;
    }
        
  }
  endTouch(e) {

    // Touch started on something other than the pxlCore canvas, ignore
    if(!this.touchMouseData.active){
      return;
    }

    this.touchScreen=false;
    this.touchMouseData.dragCount++;
    this.touchMouseData.dragTotal+=this.touchMouseData.dragCount;
    this.touchMouseData.active=false;
    this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
    //this.touchMouseData.netDistance.add( this.touchMouseData.curDistance.clone() );
    //this.touchMouseData.netDistance.y = Math.max(-1000, Math.min(1500, this.touchMouseData.netDistance.y ));
    this.touchMouseData.netDistYPerc =  (this.touchMouseData.netDistance.y+250)/1250;
    this.touchMouseData.curDistance.multiplyScalar(0);
    this.touchMouseData.curStepDistance.multiplyScalar(0);
        
    /*
      // Disabling for now, but is the overlay effect trigger when holding a long-touch
      if( this.mobile && this.touchMouseData.dragCount<10 && this.pxlTimer.curMS-this.touchMouseData.releaseTime > this.longTouchLength ){
        this.pxlCamera.itemTrigger();
        this.touchMouseData.lock=true;
      }
        */
      this.touchMouseData.releaseTime=this.pxlTimer.curMS;
      
      if( this.touchMouseData.lock ){
          this.touchMouseData.lock=false;
          return;
      }
      
      this.pxlAutoCam.touchBlender=true;
      this.pxlAutoCam.setNextTrigger();
        
    //let target= e.path ? e.path[0] : e.target; // Chrome or Firefox
    /*let target= e.target; // Chrome or Firefox
      //let dragLength=this.touchMouseData.startPos.clone().sub( this.touchMouseData.endPos ).length();
      if( this.touchMouseData.dragCount < 10 && target.getAttribute && target.getAttribute("id")==this.pxlCore ){
          // this.pxlAutoCam.prevNextAutoCam(1, true);
          this.pxlAutoCam.getNextPath(false, 0);
      }
      
      this.objectPerc.active=false;
      if( this.pxlAudio.djVolumeParentObj ){
          this.pxlAudio.djVolumeParentObj.down=false;
      }*/
  }
    
    // -- -- -- -- -- -- //
    
  async keyDownCall(e){

    this.emit("keydown", e);

    //e.this.preventDefault(e)();
        if( e.ctrlKey ){
            this.controlKey=true;
        }
    if(document.activeElement.type==undefined ){
      //%=
      if(false){
      //%
      if( e.ctrlKey || e.altKey || e.code.includes("F") ){
          e.preventDefault();
          return false;
      }
      //%=
      }
      //%
      
      if( this.pxlTimer.active){
        if( e.repeat ){
          return;
        }

        let keyHit=e.keyCode || e.which;
        if(keyHit==37 || keyHit==65){ // Left
          this.directionKeyDown=true;
          this.keyDownCount[0]=this.pxlQuality.fpsCounter.z;
          this.directionKeysPressed[0]=1;
          this.pxlCamera.deviceKey(0, true);
        }
        if(e.ctrlKey && keyHit==87 && this.directionKeysPressed[1]==1){
          e.this.preventDefault(e)();
        }
        if(keyHit==38 || keyHit==87){ // Up
          this.directionKeyDown=true;
          this.keyDownCount[1]=this.pxlQuality.fpsCounter.z;
          this.directionKeysPressed[1]=1;
          this.pxlCamera.deviceKey(1, true);
        }
        if(keyHit==39 || keyHit==68){ // Right
          this.directionKeyDown=true;
          this.keyDownCount[0]=this.pxlQuality.fpsCounter.z;
          this.directionKeysPressed[2]=1;

          this.pxlCamera.deviceKey(2, true);
        }
        if(keyHit==40 || keyHit==83){ // Down
          this.directionKeyDown=true;
          this.keyDownCount[1]=this.pxlQuality.fpsCounter.z;
          this.directionKeysPressed[3]=1;
          this.pxlCamera.deviceKey(3, true);
        }
        if(keyHit==16 || keyHit==224){ // Shift
          this.deviceAction( this.pxlEnums.DEVICE_ACTION.RUN, {}, true );
        }
        if(keyHit==32){
          this.deviceAction( this.pxlEnums.DEVICE_ACTION.JUMP, {}, true ); 
        }
      }
    }//else{
      // pxlNav Canvas not in focus
      //   User likely typing within a text field or other focus'ed object 
    //}
  }
    

  async keyUpCall(e){

    this.emit("keyup", e);

    //e.this.preventDefault(e)();
        if( e.ctrlKey ){
            this.controlKey=false;
            e.preventDefault();
            return false;
        }
    if(document.activeElement.type==undefined ){
      let keyHit=e.keyCode || e.which;
      let kCode=e.code || e.which;
      if( !e.isTrusted ){
        return false;
      }
      if( e.ctrlKey || e.altKey || e.code.includes("F") ){
          e.preventDefault();
          return false;
      }
            
      // -- -- -- -- -- -- -- -- -- -- //

      // Non-Active dependent functions -
      // 192 `
      if( kCode == "Backquote" ){
        this.pxlGuiDraws.guiToggleVisibility(); // No Texture
        return;
      }
      // 89 Y
      if( keyHit == 89 ){
        this.pxlGuiDraws.toggleShaderEditor();
      }
              
      // 220 \ | 
      if( keyHit == 220 ){
        //console.log( "Saving screenshot" );
        let tmpResSave=this.pxlQuality.screenResPerc;
        this.pxlQuality.screenResPerc=1;
        //this.resizeRenderResolution( 3840, 2160 );//3240, 3240 );
        
        this.pxlEnv.mapRender(false);
        
        let dlData=this.pxlGuiDraws.pxlNavCanvas.toDataURL("image/png");
        let blob=atob( dlData.split(',')[1] );
        let size=blob.length;
        let arr=new Uint8Array(size);
        for(let x=0; x<size; ++x){
            arr[x]=blob.charCodeAt(x);
        }
        let cameraData=URL.createObjectURL(new Blob([arr]));

        let dt=new Date();
        let d=dt.getDate();
        let m=dt.getMonth()+1;
        let y=dt.getFullYear();
        let fileSuffix=y+"-"+m+"-"+d+"_"+dt.getHours()+"-"+dt.getMinutes()+"-"+dt.getSeconds();

        let tempLink=document.createElement("a");
        tempLink.download=this.projectTitle+"_"+fileSuffix+".png";
        tempLink.href=cameraData;
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.parentNode.removeChild(tempLink);
        
        this.pxlQuality.screenResPerc=tmpResSave;
        //this.resizeRenderResolution();
        this.pxlEnv.mapRender(false);
        
        return;
      }

      // -- -- -- -- -- -- -- -- -- -- //
      
      // Active dependent functions; pxlNav needs to be running

      if(this.pxlTimer.active){
        if(keyHit==37 || keyHit==65){ // Left
          this.directionKeysPressed[0]=0;
          //this.pxlAutoCam.prevNextAutoCam(-1);
          //this.pxlAutoCam.getNextPath(false, -1);
          this.pxlCamera.deviceKey(0, false);
        }
        if(keyHit==38 || keyHit==87){ // Up
          this.directionKeysPressed[1]=0;
          if( this.pxlAutoCam.active ){
              this.pxlAutoCam.step(true);
          }
          this.pxlCamera.deviceKey(1, false);
        }
        if(keyHit==39 || keyHit==68){ // Right
          this.directionKeysPressed[2]=0;
          this.pxlCamera.deviceKey(2, false);
        }
        if(keyHit==40 || keyHit==83){ // Down
          this.directionKeysPressed[3]=0;
          if( this.pxlAutoCam.active ){
              this.pxlAutoCam.setRoom(true);
          }
          this.pxlCamera.deviceKey(3, false);
        }
        if(!this.directionKeysPressed.includes(1)){
          this.directionKeyDown=false;
        }
        // Shift
        if(keyHit==16 || keyHit==224){ // Shift
          this.deviceAction( this.pxlEnums.DEVICE_ACTION.RUN, {}, false );
          return;
        }
        // Space
        if(keyHit==32){
          this.deviceAction( this.pxlEnums.DEVICE_ACTION.JUMP, {}, false );
          return;
        }
        
        if( !this.directionKeyDown ){
          // 1 / Numpad 1 - Warp to Lobby
          /*if(keyHit == 49 || keyHit == 97){
            this.pxlCamera.fastTravel(0);
            return;
          }*/
          // 5 / Numpad 5 - Drone Cam
          if(keyHit == 53 || keyHit == 101){
            this.pxlAutoCam.preAutoCamToggle();
            return;
          }
        }
                
             
        
        //%=
        // 75 K Numpad-Plus
        if(keyHit == 75 || keyHit == 107 || keyHit == 187){
        }
        // 74 J Numpad-Minus
        if(keyHit == 74 || keyHit == 109 || keyHit == 189){
        }
        // 76 L
        if(keyHit == 76){
        }
        // 48  0
        if(keyHit == 48){
        }
        
        // 221 ]
        if( keyHit == 221 ){
          // Prevent current item from wearing off
          //   Printing it from the check list
          if( this.pxlUser?.itemInactiveCmd?.length >0 ){
            this.pxlUser.itemInactiveCmd.pop();
          }
          return;
        }
        // 106 *
        if( keyHit == 106 ){
        }
        
      }
      
      // Close all gui windows
      // ESC / Enter
      if(keyHit==27 || ( keyHit == 13 && !e.ctrlKey )){
        this.pxlGuiDraws.toggleHudBlock(false, true);
        this.pxlGuiDraws.toggleGuiWindowContainer(false, false, true);
        return;
      }
      
      
      if( e.altKey || e.ctrlKey || e.shiftKey ){
        return;
      }
      
      // 85  U
      if(keyHit == 85){
      }
      // 73  I
      if(keyHit == 73){
        this.pxlGuiDraws.iconEvent( "click", this.pxlGuiDraws.hudIcons.infoIcon, "info" );
        return;
      }
      // 71 G
      if(keyHit == 71){
        this.pxlGuiDraws.iconEvent( "click", this.pxlGuiDraws.hudIcons.settingsIcon, "settings" );
        return;
      }
      // 72 H; 191  ?
      if( keyHit == 191 || keyHit == 72 ){ // Open Help Screen
        this.pxlGuiDraws.iconEvent( "click", this.pxlGuiDraws.hudIcons.helpIcon, "help" );
        return;
      }
      
      // 67  C
      if(keyHit == 67){
      }
      // 66  B
      if(keyHit == 66){
        this.pxlGuiDraws.iconEvent( "click", this.pxlGuiDraws.hudIcons.musicIcon, "musicToggle" );
        return;
      }
      // 78 N
      if(keyHit == 78){
        this.pxlGuiDraws.iconEvent( "click", this.pxlGuiDraws.hudIcons.speakerIcon, "speakerToggle" );
        return;
      }
      // 77  M
      if(keyHit == 77){
      }
      // 86  V
      if(keyHit == 86){
      }
      
      // P 
      if(keyHit == 80){ // Pause pxlNav Environment
        this.deviceAction( this.pxlEnums.DEVICE_ACTION.PAUSE );
        return;
      }
    }
  }

  // -- -- -- -- -- -- //


  deviceAction( action, data, state=null ){
    switch( action ){
      case this.pxlEnums.DEVICE_ACTION.MOVE:
        //this.directionKeysPressed[2]=0;
        this.addMoveDelta( data );
        //this.pxlCamera.deviceKey(1, state);
        break;
      case this.pxlEnums.DEVICE_ACTION.LOOK:
        this.addLookDelta( data );
        //this.pxlCamera.deviceKey(2, state);
        break;
      case this.pxlEnums.DEVICE_ACTION.JUMP:
        this.pxlCamera.camJumpKey( state );
        //this.pxlCamera.deviceKey("space", state);
        break;
      case this.pxlEnums.DEVICE_ACTION.RUN:
        let speed = state ? this.pxlEnums.USER_SPEED.BOOST : this.pxlEnums.USER_SPEED.BASE;
        this.pxlUser.setSpeed( speed );
        //this.pxlCamera.deviceKey("shift", true);
        break;
      case this.pxlEnums.DEVICE_ACTION.ACTION:
        //this.pxlCamera.deviceKey("action", state);
        break;
      case this.pxlEnums.DEVICE_ACTION.ACTION_ALT:
        //this.pxlCamera.deviceKey("actionAlt", state);
        break;
      case this.pxlEnums.DEVICE_ACTION.ITEM:
        //this.pxlCamera.deviceKey("item", state);
        break;
      case this.pxlEnums.DEVICE_ACTION.MENU:
        //this.pxlCamera.deviceKey("menu", state);
        break;
      case this.pxlEnums.DEVICE_ACTION.PAUSE:
        this.togglePause( state );
        //this.pxlCamera.deviceKey("pause", state);
        break;
      case this.pxlEnums.DEVICE_ACTION.MAP:
        //this.pxlCamera.deviceKey("map", state);
        break;
    }
  }


  // -- -- -- -- -- -- //

  addMoveDelta( data=null ){
    let status = false;
    if( !this.pxlOptions.mobile || this.pxlOptions.staticCamera || (data === null && !this.directionKeyDown)){
      return;
    }
    
    if( data !== null ){
      if( data.hasOwnProperty("status") ){
        status = data.status;
      }

      if( status ){
        let absDeltaX = Math.abs(data.startDelta.x);
        let absDeltaY = Math.abs(data.startDelta.y);

        let deadZone = this.pxlOptions.userSettings.deadZone.touch;
        let startDeltaX = absDeltaX > deadZone ? data.startDelta.x - deadZone*Math.sign(data.startDelta.x) : 0;
        let startDeltaY = absDeltaY > deadZone ? data.startDelta.y - deadZone*Math.sign(data.startDelta.y) : 0;

        // Fit pixel distances to percentage of screen
        let xRatio = this.sW / this.sH;
        let yRatio = this.sH / this.sW;
        startDeltaX = Math.min(startDeltaX * this.lookXScalar, 1.0) * this.pxlOptions.userSettings.movement.max * xRatio;
        startDeltaY = Math.min(startDeltaY * this.lookYScalar, 1.0) * this.pxlOptions.userSettings.movement.max * yRatio;

        //this.pxlCamera.cameraMovement[0] =  ( this.pxlCamera.cameraMovement[0] + Math.min( Math.max( startDeltaX * 0.01, -1), 1) ) * .5; // x / 50
        //this.pxlCamera.cameraMovement[1] = ( this.pxlCamera.cameraMovement[1] + Math.min( Math.max( startDeltaY * 0.01, -1), 1) ) * .5; // x / 50 

        this.pxlCamera.cameraMovement[0] =  ( this.pxlCamera.cameraMovement[0] + startDeltaX ) * .7 // x / 50
        this.pxlCamera.cameraMovement[1] = ( this.pxlCamera.cameraMovement[1] +  startDeltaY ) * .7; // y / 50 
        this.userInputMoveScalar = Math.max(this.pxlCamera.cameraMovement[0]**2, this.pxlCamera.cameraMovement[1]**2) ** .5;
        this.userInputMoveScalar = this.userInputMoveScalar*this.userInputMoveScalar*this.userInputMoveScalar * 1.5;
        this.userInputMoveScalar += this.userInputMoveScalar>1.0 ? (this.userInputMoveScalar-1.0)*30. : 0;
        if( this.userInputMoveScalar > 1.0 ){
          // Trigger Run automatically on mobile
          this.deviceAction( this.pxlEnums.DEVICE_ACTION.RUN, {}, true );
        }else{
          this.deviceAction( this.pxlEnums.DEVICE_ACTION.RUN, {}, false );
        }
      }
    }else{
      status = this.directionKeyDown;
    }

    this.directionKeyDown = status;
    if( status ){
      this.directionKeysPressed[0]= this.pxlCamera.cameraMovement[0] < 0 ? 1 : 0;
      this.directionKeysPressed[1]= this.pxlCamera.cameraMovement[1] < 0 ? 1 : 0;
      this.directionKeysPressed[2]= this.pxlCamera.cameraMovement[0] > 0 ? 1 : 0;
      this.directionKeysPressed[3]= this.pxlCamera.cameraMovement[1] > 0 ? 1 : 0;
      this.pxlCamera.userInputMoveScalar.x = this.pxlCamera.cameraMovement[0];
      this.pxlCamera.userInputMoveScalar.y = this.pxlCamera.cameraMovement[1];
      this.pxlCamera.cameraMovementEase = 1;
      this.pxlUser.setSpeed( this.userInputMoveScalar * this.pxlEnums.USER_SPEED.BASE );
    }else{
      this.directionKeysPressed[0]=0;
      this.directionKeysPressed[1]=0;
      this.directionKeysPressed[2]=0;
      this.directionKeysPressed[3]=0;
      this.pxlCamera.cameraMovementEase = .85;
    }
  }

  addLookDelta( data ){
    let status = false;
    if( data.hasOwnProperty("status") ){
      status = data.status;
    }

    this.mouseX = data.currentPos.x;
    this.mouseY = data.currentPos.y;

    if( status ){

      if( data.dragCount == 0 ){
        this.touchScreen=true;
        this.touchMouseData.active=true;
        this.touchMouseData.mode=this.touchMouseData.button;
        this.touchMouseData.startPos=new Vector2(this.mouseX,this.mouseY);
        this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
        this.touchMouseData.curDistance=new Vector2(0,0);
        this.touchMouseData.curStepDistance=new Vector2(0,0);
        this.touchMouseData.dragCount=0;
        this.pxlAutoCam.touchBlender=false;
        this.touchMouseData.releaseTime=this.pxlTimer.curMS;
      }else{
        this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);

        this.touchMouseData.curDistance= new Vector2( data.startDelta.x, data.startDelta.y );
        this.touchMouseData.curStepDistance = new Vector2( data.stepDelta.x, data.stepDelta.y );
        this.touchMouseData.netDistance.add( this.touchMouseData.curStepDistance.clone() );
        this.touchMouseData.velocity.add(this.touchMouseData.curStepDistance).multiplyScalar(.5);
        //this.touchMouseData.velocityEase.add(this.touchMouseData.curStepDistance).multiplyScalar(.5);
              
        this.touchMouseData.netDistYPerc =  (this.touchMouseData.netDistance.y+this.touchMouseData.curDistance.y+250)/1250;
        
        this.touchMouseData.curFadeOut.add( (new Vector2( data.previousPos.x, data.previousPos.y )).sub(this.touchMouseData.endPos)  );
  
          
        if( this.objectPerc.active ){
          this.objectPerc.percX = ( this.mouseX - this.objectPerc.left ) / this.objectPerc.width ;
          this.objectPerc.percY = ( this.mouseY - this.objectPerc.top ) / this.objectPerc.height ;
          this.objectPerc.offsetX = this.mouseX - this.objectPerc.startX ;
          this.objectPerc.offsetY = this.mouseY - this.objectPerc.startY ;
          this.objectPerc.offsetPercX = this.objectPerc.offsetX / this.objectPerc.width ;
          this.objectPerc.offsetPercY = this.objectPerc.offsetY / this.objectPerc.height ;
        }
      }

    }else{
        
      this.touchScreen=false;
      this.touchMouseData.dragTotal+=data.dragCount;
      this.touchMouseData.active=false;
      this.touchMouseData.endPos=new Vector2(this.mouseX,this.mouseY);
      //this.touchMouseData.netDistance.add( this.touchMouseData.curDistance.clone() );
      //this.touchMouseData.netDistance.y = Math.max(-1000, Math.min(1500, this.touchMouseData.netDistance.y ));
      this.touchMouseData.netDistYPerc =  (this.touchMouseData.netDistance.y+250)/1250;
      this.touchMouseData.curDistance.multiplyScalar(0);
      this.touchMouseData.curStepDistance.multiplyScalar(0);

      this.touchMouseData.releaseTime=this.pxlTimer.curMS;
      
      if( this.touchMouseData.lock ){
          this.touchMouseData.lock=false;
          return;
      }
      
      this.pxlAutoCam.touchBlender=true;
      //this.pxlAutoCam.setNextTrigger();
    }
  }

  // -- -- -- -- -- -- //

  togglePause( state=null ){
    if( state === null ){
      state = !this.pxlTimer.active;
    }
    this.directionKeysPressed=[0,0,0,0];
    this.directionKeyDown=false;
    this.pxlTimer.pause( state );
    if( this.pxlTimer.active ){ 
      this.pxlEnv.mapRender();
    }
    this.pxlCamera.workerFunc("activeToggle",this.pxlTimer.active);
  }


  // -- -- -- -- -- -- //

  // ## Have it run a pxlEnv class function instead of all this mess
  resizeRenderResolution( iWidthBase=null, iHeightBase=null ){

    //let iWidth= window?.screen?.width ? window.screen.width / window.devicePixelRatio : window.innerWidth;
    //let iHeight= window?.screen?.height ? window.screen.height / window.devicePixelRatio : window.innerHeight;

    let iWidth = window.innerWidth;
    let iHeight = window.innerHeight;
    iWidth=!iWidthBase ? iWidth : iWidthBase;
    iHeight=!iHeightBase ? iHeight : iHeightBase;

    // -- -- -- 

    let renderScalar = this.getRenderScalar();
    iWidth = iWidth * renderScalar;
    iHeight = iHeight * renderScalar;
        
    this.mapW=(this.sW=iWidth)*this.pxlQuality.screenResPerc;
    this.mapH=(this.sH=iHeight)*this.pxlQuality.screenResPerc;
        
    /*let screenWidth = window?.screen?.width ? window.screen.width : this.mapW;
    let screenHeight = window?.screen?.height ? window.screen.height : this.mapH;
    this.mapW=screenWidth;
    this.mapH=screenHeight;*/

    this.screenRes.x=1/this.mapW;
    this.screenRes.y=1/this.mapH;
    this.screenRatio.x=this.sW * this.screenRes.x;
    this.screenRatio.y=this.sH * this.screenRes.y;

    if(this.pxlEnv.geoList['HDRView']){
      let rU=this.mapW>this.mapH ? 1 : this.mapW/this.mapH;
      //let rV=this.mapW>this.mapH ? this.mapH  his.mapW : 1;
      this.pxlEnv.geoList['HDRView'].material.uniforms.ratioU.value=rU;
      //this.pxlEnv.geoList['HDRView'].material.uniforms.ratioV.value=rV;
    }
    
    this.touchMouseData.mBlurVelInf=new Vector2(2*this.screenRes.x,2*this.screenRes.y);
    if(!this.pxlEnv.mapGlowPass){
      return;
    }

    // TODO : All of this should be set up through callbacks vv
    //this.pxlEnv.scene.renderTarget.setSize(this.mapW*this.pxlQuality.bufferPercMult,this.mapH*this.pxlQuality.bufferPercMult);
    //this.pxlEnv.scene.renderWorldPos.setSize(this.mapW*this.pxlQuality.bufferPercMult,this.mapH*this.pxlQuality.bufferPercMult);
    
    this.pxlEnv.scene.renderTarget.setSize(this.mapW,this.mapH);
    this.pxlEnv.scene.renderWorldPos.setSize(this.mapW,this.mapH);
    
    if( this.pxlEnv.mapComposer ) this.pxlEnv.mapComposer.setSize(this.mapW,this.mapH);
    if( this.pxlEnv.mapComposerGlow ) this.pxlEnv.mapComposerGlow.setSize(this.mapW,this.mapH);
    
    // For external rooms --
    if( this.pxlEnv.roomComposer ){
      this.pxlEnv.roomComposer.setSize( this.mapW,this.mapH);
    }
  
    if( this.pxlEnv.roomGlowPass ){
      this.pxlEnv.roomGlowPass.setSize(this.mapW*this.pxlQuality.bloomPercMult,this.mapH*this.pxlQuality.bloomPercMult);
    }

    // -- -- -- -- -- -- --
        
    // For texture swapping --
    if( this.pxlEnv.delayComposer ) this.pxlEnv.delayComposer.setSize(this.mapW,this.mapH);

    // -- -- -- -- -- -- --
        
    if( this.pxlEnv.mapGlowPass ){
      this.pxlEnv.mapGlowPass.setSize(this.mapW*this.pxlQuality.bloomPercMult,this.mapH*this.pxlQuality.bloomPercMult);
    }
    
    if( this.pxlEnv.mapMotionBlurPass ){
      this.pxlEnv.mapMotionBlurPass.setSize(this.mapW*this.pxlQuality.mBlurPercMult,this.mapH*this.pxlQuality.mBlurPercMult);
    }
    
    if( this.pxlEnv.mapOverlayHeavyPass ){
      this.pxlEnv.mapOverlayHeavyPass.setSize(this.mapW,this.mapH);
      this.pxlEnv.mapOverlayHeavyPass.uniforms.ratio.value = Math.min( 1, this.mapW/this.mapH );
    }
    
    if( this.pxlEnv.mapOverlayPass ){
      this.pxlEnv.mapOverlayPass.setSize(this.mapW,this.mapH);
      this.pxlEnv.mapOverlayPass.uniforms.ratio.value = Math.min( 1, this.mapW/this.mapH );
    }

    if( this.pxlEnv.mapOverlaySlimPass ){
      this.pxlEnv.mapOverlaySlimPass.setSize(this.mapW,this.mapH);
      this.pxlEnv.mapOverlaySlimPass.uniforms.ratio.value = Math.min( 1, this.mapW/this.mapH );
    }
    

    // Set main pxlNav canvas size
    this.setCanvasSize( this.sW, this.sH );


    this.pxlGuiDraws.loading=true;
    
    this.pxlEnv.engine.setPixelRatio(window.devicePixelRatio*this.pxlQuality.screenResPerc);
    //this.pxlEnv.engine.setPixelRatio(window.devicePixelRatio);
    //this.pxlEnv.engine.setSize(this.mapW, this.mapH);
    this.pxlEnv.engine.setSize(this.sW, this.sH);
    //let aspectRatio=this.mapW/this.mapH;
    let aspectRatio = window.innerWidth / window.innerHeight;
    this.pxlCamera.setAspect( aspectRatio );
        
        
    let safeAspect=[ this.sW/this.sH, this.sH/this.sW ];
    let aspectMult=[1,1];
    aspectMult[0]=(aspectRatio>safeAspect[0]) ? 1 : this.sW/(this.sH*safeAspect[0]) ;
    aspectMult[1]=(aspectRatio>safeAspect[1]) ? this.sH/(this.sW*safeAspect[1]) : 1 ;
    if(aspectMult[0]>1){
      aspectMult[1]*=1/aspectMult[0];
      aspectMult[0]=1;
    }else if(aspectMult[1]>1){
      aspectMult[0]*=1/aspectMult[1];
      aspectMult[1]=1;
    }

    this.screenAspect.x=aspectMult[0] * (1/(.5**2+.5**2)**.5);
    this.screenAspect.y=aspectMult[1];
    
    this.screenResDeltaPerc.x=this.sW/this.origRes.x;
    this.screenResDeltaPerc.y=this.sH/this.origRes.y;

    this.pxlEnv.updateCompUniforms();
    
    this.pxlEnv.roomNameList.forEach( (r)=>{
      this.pxlEnv.roomSceneList[ r ].pxlCamAspect = aspectRatio ;
      //if( r != this.pxlEnv.mainRoom){
      if( this.pxlEnv.roomSceneList[ r ]?.resize ){
        this.pxlEnv.roomSceneList[ r ].resize( this.mapW, this.mapH );
      }
    });
        
    // Emit the resize calculations 
    this.emit("resize", {
      "rawWidth" : window.innerWidth,
      "rawHeight" : window.innerHeight,
      "width" : this.mapW,
      "height" : this.mapH,
      "xPixelPerc" : this.screenRes.x,
      "yPixelPerc" : this.screenRes.y,
      "aspectRatio" : aspectRatio
    });
        
    if( !this.pxlTimer.active ){
        this.pxlEnv.mapRender( false );
    }
    
  }

  // -- -- -- -- -- -- -- -- -- -- //
  // -- Module Communication -- -- //
  // -- -- -- -- -- -- -- -- -- -- //

  subscribe( eventType, callbackFn ){
    if( !this.subscriptableEvents.includes( eventType ) ){
      console.error( "Event type not subscribable: ", eventType );
      return;
    }
    if( !this.callbackList[eventType] ){
      this.callbackList[eventType] = [];
    }
    this.callbackList[eventType].push( callbackFn );
  }

  unsubscribe( eventType, callbackFn ){
    if( this.callbackList[eventType] ){
      let index = this.callbackList[eventType].indexOf( callbackFn );
      if( index >= 0 ){
        this.callbackList[eventType].splice( index, 1 );
      }
    }
  }

  emit( eventType, data ){
    if( this.callbackList.hasOwnProperty( eventType ) ){
      this.callbackList[eventType].forEach( (callbackFn)=>{
        callbackFn( data );
      });
    }
  }

}
