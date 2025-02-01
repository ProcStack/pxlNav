// pxlNav Camera manager
//   Written by Kevin Edzenga 2020; 2024

// Note : Since item implementation was done rather hastily,
//          Triggering full screen overlays occures in the Camera class currently.
//            This include LizardKing, StarField and InfiniteZoom
//        The Low-Gravity Jump is triggered through the `User` class
//
//        TODO : Move item functions from Camera and User to an `Item` class

import {
  Vector2,
  Vector3,
  Quaternion,
  Object3D,
  Euler
} from "../../libs/three/three.module.min.js";

import { pxlUserSettings } from "../core/Options.js";
import { COLLIDER_TYPE, CAMERA_EVENT } from "../core/Enums.js";

// TODO : Extend this damn monolith of a chunky boy
//          Camera, Player Controller, Force Influence / Collision


/**
 * Camera or pxlCamera class
 *   Handles the camera movement, rotation, jumping, collision detection, and interaction with the environment.
 * Measurements are assumed to be in Meters, Seconds, and Radians
 *   But it's all just numbers in the end.
 * `standingHeight` is the height (Meters) of the user when standing. Default is 1.75 meters.
 * `movementScalar` is the scalar for movement speed. Default is 1.0.
 * `jumpScalar` is the scalar for jump height. Default is 1.0.
 * `userScale` determines the overall scale of the user's height, jump height, and movement speed.
 *   Generally, only edit `userScale` if the gross settings seem incorrect. Default is 1.0.
 * 
 * For Camera Rotation, please note that Roam Camera and Static Camera are using different math.
 *   Free Roam expects the camera to always be oriented "up" to the gravity source.
 *     (Note, Gravity Source is WIP and not fully implemented, gravity is assumed -Y for now)
 *   To prevent rortaional issues, use the correct rotation function when needed-
 *     Free Roam Camera Rotation : `this.updateRoamCameraRotation();`
 *     Static Camera Rotation : `this.updateStaticCameraRotation();`
 */
export class Camera{
  constructor(){
    
    // -- -- -- -- -- -- -- -- -- -- --
    // -- Default Camera Settings -- -- --
    // -- -- -- -- -- -- -- -- -- -- -- -- --

    // User Height
    this.standingHeight=1.75; // ~5'9" in meters

    // Movement Speed Scalar
    this.movementScalar=1.0;

    // Max Movement Settings
    this.hasMovementLimit=true;
    this.movementMax = 10.0; // Meters per second

    // Jump Height Scalar
    this.jumpScalar=1.0;

    // Scale of the User & Settings
    //   Standing Height, Jumping Height, Walking Speed, etc.
    this.userScale=1.0;

    // Max distance (Meters) up or down, like walking up and down stairs.
    this.maxStepHeight=5; 

    // Once click/tap is done, how much does the last velocity ease out
    //  Velocity * this.cameraEasing
    this.cameraEasing = [ .55, .45 ]; // [ PC, Mobile ]

    // Touch screen sensitivity settings
    this.touchMaxSensitivity = 500;
    
    // The jumping impulse per frame
    //this.cameraJumpImpulse= [ 0.045, 0.085 ];// [.035,.075]; // [ Grav, Low Grav ]
    this.cameraJumpImpulse= [ .75, 1.5 ];// [.035,.075]; // [ Grav, Low Grav ]
    this.cameraMaxJumpHold=[ 2.85, 2.0 ]; // Second; [ Grav, Low Grav ]

    this.gravityCount=0;
    this.gravityRate=0;
    this.gravityMax=15.5; // Gravity at scale of 1 / avg human(1.8 meters) * 9.8mms = 5.44;  But this is digital here, lower is lighter
    this.gravityUPS=[.3,.15]; // Units Per Step(); Influence of M/S^2 .. I guess haha; [ Grav, Low Grav ]

    // -- -- -- //
    // -- -- -- //
    // -- -- -- //

    this.pxlAudio=null;
    this.pxlTimer=null;
    this.pxlAutoCam=null;
    this.pxlEnv=null;
    this.pxlColliders=null;
    this.pxlUser=null;
    this.pxlUtils=null;
    this.pxlDevice=null;
    this.pxlGuiDraws=null;
    this.pxlQuality=null;
    this.socket=null;
    
    this.camera=null;
    this.canMove=true;
    this.HDRView=false;
    
    
    // Run updateCamera
    this.camUpdated=true;
    this.cameraBooted=false;

    // Calculation triggers
    this.hasMoved = false; // Player has moved camera, WASD or Arrow Keys
    this.hasRotated = false; // Player clicked and dragged mouse/touch to rotate camera
    this.hasJumped = false; // Initial Jump Trigger
    this.hasJumpLock = false; // Held jump upon landing, jump again after delay, this is the delay notification
    this.hasGravity = false; // Player isn't on the ground; due to jump or running off a ledge

    // -- -- --

    this.roomStandingHeight = { 'default' : this.standingHeight };
    this.standingHeightGravInfluence=0;
    this.standingMaxGravityOffset=.5; // Usage -  ( standingHeight / standingHeightGravInfluence ) * standingMaxGravityOffset
    
    this.walkBounceSeed=230;
    this.walkBounceHeight = .3; // sin(walkBounce) * walkBounceHeight
    this.walkBounce=0;
    this.walkBouncePerc=0;
    this.walkBounceRate=.025; // Bounce rate per frame; walkBounce + walkBounceRate
    this.walkBounceEaseIn=.03; // Ease in bouncePerc rate up to 1; perc + easeIn
    this.walkBounceEaseOut=.95; // Ease out bouncePerc scalar; perc * easeOut
    
    this.posRotEasingThreshold=.01; // Velocity based calculations with any per frame scalar cut off value; val<posRotEasingThreshold ? 0

    this.cameraMovement=[0,0]; // Left/Right, Forward/Back, Jump
    this.cameraMovementEase=.85; // After key up, pre-frame rate to 0
    this.cameraMoveLength=0;
    this.cameraMoveLengthMult=.1; // cameraMoveLength scalar // ## check adding multiplier to keydown movement calculations
    this.camPosBlend=.65; // Blend to previous position, easing movement
    
    this.camRotXYZ=new Vector3(0,0,0);//new Vector3(0,0,0);
    this.camRotPitch=new Vector2(0,0);
    this.cameraJumpActive=false;
    this.cameraAllowJump=true;
    this.cameraJumpHeight=0;
    this.cameraJumpVelocity=0;
    this.cameraJumpVelocityEaseOut=.90; // Ease out Jump Button Influence after Button Released
    this.cameraJumpInAir=false;
    
    this.floorColliderInitialHit=false;
    this.colliderValidityChecked=true; // Value shouldn't matter, but should Room Environments not set colliderValidity, assume checked initially
    this.nearestFloorHit=new Vector3(0,0,0);
    this.nearestFloorObjName=null;
    this.nearestFloorHitPrev=new Vector3(0,0,0);
    this.nearestFloorObjNamePrev=null;
    
    this.gravitySourceActive=false;
    this.gravityDirection=new Vector3( 0, -1, 0 );
    this.gravityEaseOutRate=.50;

    this.jump=0;
    // TODO : Unsure if I'd rather a contant timer for all "allowed" jumps or not
    //          For now, this lock holds that the player should jump again when the timer is up
    this.releaseJumpLockTime = 0;
    this.releaseJumpLockDelay = .08; // Seconds dely between repeated jumping, its less jaring with a slight delay

    this.runMain=true;
    this.workerActive=false;
    this.worker=null;
    this.workerTransfers=false;
    this.workerMessage=()=>{}; // Browser Compatibility
    this.workerFunc=()=>{}; // Browser Compatibility
    this.deviceKey=()=>{}; // Browser Compatibility
    
    this.portalList={};

    this.roomWarpZone=[];
    this.colliderCurObjHit=null;
    this.colliderPrevObjHit=null;
    this.colliderValid=false;
    this.colliderFail=false;
    
    this.warpActive=false;
    this.warpType=0;
    this.warpObj=null;
    this.warpTarget=null;
    this.hotKeyTriggered=false;

    this.eventCheckStatus=false;
    this.proximityScaleTrigger=false;
        
    this.colliderShiftActive=true;
    this.colliderAdjustPerc=0;
    this.colliderAdjustRate=.020;

    // ## Move to Device.js
    this.gyroGravity=[0,0,0];
    this.cameraPose={
      alpha:null,
      beta:null,
      gamma:null,
      alphaOffset:0,
      betaOffset:0,
      gammaOffset:0,
      orientation:window.orientation||0,
      pos:[0,0,0],
      posOffset:[0,0,0],
      rx:()=>{return this.beta},
      ry:()=>{return this.alpha},
      rz:()=>{return this.gamma},
      accelZeroed:[0,0,0],
      accelCalibration:10,
      accelCalDiv:1/10,
      accelCalCount:0,
      accelTotal:[0,0,0],
      accelPrev:null,
      accelDelta:[0,0,0],
      accelClearDelta:()=>{this.accelDelta=[0,0,0];},
    };

    this.uniformScalars={
      curExp:1.0,
      darkBase:.1,
      brightBase:0.5,
      exposureUniformBase:1.0,
    }
    
    // TODO : This needs to be moved and integrated into fileIO and RoomClass
    this.cameraPosLookAtNames = {
      "default":{
        pos:"Position",
        lookAt:"LookAt",
      },
      "mobile":{
        pos:"PositionMobile",
        lookAt:"LookAtMobile",
      },
      "vr":{
        pos:"PositionVR",
        lookAt:"LookAtVR",
      }
    };

    this.cameraPos=new Vector3(0,0,0);
    this.cameraPrevPos=new Vector3(0,0,0);;
    this.cameraPrevLookAt=new Vector3(0,0,0);;
    this.cameraAim=new Vector3(0,0,1);
    this.cameraAimTarget=new Vector3(0,0,0);;
    this.cameraCross=new Vector3(1,0,0); // For Audio API faux 3d audio; UNUSED CURRENTLY
    
    this.lookAtTargetActive=new Vector3(0,0,0);;
    this.lookAtPerc=new Vector2(1,0);
    this.lookAtLockPerc=0;
    this.lookAtLockFader=0;
    this.lookAtLockFadeRate=.01;
    
    this.prevQuaternion=new Quaternion(); // Used in motionBlur shader calculations only
    //this.prevWorldMatrix= new Matrix4(); // Only used if running higher quality motionBlur calculations, not needed
    
    this.pi=3.141592653589793238462643383279;
    this.touchSensitivityLimits = this.touchMaxSensitivity * this.pi;

    // Event callbacks
    this.eventCallbacks={};

    this.init();
  }

  /**
   * Sets dependencies for the Camera class.
   * @param {Object} pxlNav - The navigation object containing dependencies.
   */
  setDependencies( pxlNav ){
    this.pxlAudio=pxlNav.pxlAudio;
    this.pxlTimer=pxlNav.pxlTimer;
    this.pxlAutoCam=pxlNav.pxlAutoCam;
    this.pxlEnv=pxlNav.pxlEnv;
    this.pxlColliders=pxlNav.pxlColliders;
    this.pxlUser=pxlNav.pxlUser;
    this.pxlUtils=pxlNav.pxlUtils;
    this.pxlDevice=pxlNav.pxlDevice;
    this.pxlGuiDraws=pxlNav.pxlGuiDraws;
    this.pxlQuality=pxlNav.pxlQuality;
    this.socket=pxlNav.socket;
  }

  // -- -- --
  
  log( msg ){
    if( this.verbose >= VERBOSE_LEVEL.INFO ){
      console.log( msg );
    }
  }
  warn( msg ){
    if( this.verbose >= VERBOSE_LEVEL.WARN ){
      console.warn( msg );
    }
  }
  error( msg ){
    if( this.verbose >= VERBOSE_LEVEL.ERROR ){
      console.error( msg );
    }
  }

  // -- -- --

  /**
   * Initializes the Camera class and Camera Worker.
   */
  // TODO : Get worker implemented for whole of camera scripts
  init(){
    // Camera Service Worker - Ray Intersect Collision Detector
    // TODO : Finish adding workers to monitor the Collider class and raycasting
    var worker;
    if( false && Worker ){
        worker = new Worker("js/pxlBase/webWorkers/CameraWorker.js");  
        this.worker=worker;
        //this.workerList.push( worker );
    
        let tmpThis=this;
        worker.onmessage= (event) => {  
            tmpThis.workerMessage(event.data);
        };
        worker.onerror= (event)=>{  
            tmpThis.workerMessage({type:"err", data:event.data});
        };
        
        // Transferables Status
        let ab= new ArrayBuffer(1);
        worker.postMessage(ab, [ab]); // ab.byteLength -> If transfer successful
        this.workerTransfers=ab.byteLength==0; // Can transfer ArrayBuffers directly
        
        // Message Functions
        this.workerMessage= async ( msg )=>{
            if( msg.type == "update" ){
                tmpThis.updateMainValues( msg );
            }
        }
        this.workerFunc= async ( type, state=null )=>{
            tmpThis.worker.postMessage({type, state})
        }
        this.deviceKey= async ( key=false, state=false )=>{
            if( typeof key == "number"){
            }else if( typeof key == "string"){
                let type="key";
                tmpThis.worker.postMessage({type, key, state})
            }
        }
        this.workerActive=true;
        this.runMain=false;
        
        this.workerFunc("init");
    }
  }
  /**
   * Updates main values from worker data.
   * UNUSED CURRENTLY
   * @param {Object} data - The data from the worker.
   */
  updateMainValues( data ){
      let {gravityRate, standingHeightGravInfluence, cameraJumpImpulse}=data;
      if( gravityRate != null ){
          this.gravityRate = gravityRate;
      }
      if( standingHeightGravInfluence != null ){
          this.standingHeightGravInfluence = standingHeightGravInfluence;
      }
      if( cameraJumpImpulse != null ){
          this.cameraJumpVelocity+=cameraJumpImpulse;
      }
      this.camUpdated=true;
  }
    
////////////////////////////////////////////
// Update settings externally of Camera  //
//////////////////////////////////////////

  // Allow access to alter the Camera's internal settings
  //   Run these updates during the Room's `init()`, `start()`, or `build()` functions
  // TODO : Allow per-Room settings to be set in the Room's FBX file or Room Class
  // TODO : Move these to the User class when updated for pxlNav
  //          User is currently as it was for Antibody.club, so it needs to be updated for the pxlNav module
  

  // Default is 1.75
  setUserHeight( val, roomName="default" ){
    val = Math.max( val, 0.01 );
    if( !this.roomStandingHeight.hasOwnProperty(roomName) ){
      this.roomStandingHeight[roomName]=this.standingHeight;
    }
    
    if( roomName=="default" ){
      this.standingHeight=val;
    }

    this.roomStandingHeight[roomName]=val;
  }

  // Default is 5
  setMaxStepHeight( val ){
    val = Math.max( val, 0.01 );
    this.maxStepHeight=val;
  }

  // Default is 1
  setUserScale( val ){
    val = Math.max( val, 0.01 );
    this.userScale=val;
  }
  // Default is 1
  setMovementScalar( val ){
    val = Math.max( val, 0.01 );
    this.movementScalar=val;
  }
  // Default is 10
  setMovementMax( val ){
    val = Math.max( val, 0.01 );
    this.movementMax=val;
  }
  // Default is 0.85
  setMovementEase( val ){
    val = Math.min( 1, Math.max( val, 0.01 ) );
    this.cameraMovementEase=val;
  }

  // Default is 0.75
  setPositionBlend( val ){
    val = Math.min( 1, Math.max( val, 0.01 ) );
    this.camPosBlend=val;
  }

  // Default is 0.1
  setInputMovementMult( val ){
    val = Math.max( val, 0.01 );
    this.cameraMoveLengthMult=val;
  }

  // -- -- --

  // Default is 1
  setJumpScalar( val ){
    val = Math.max( val, 0.01 );
    this.jumpScalar=val;
  }
  // Default is 0.75
  setJumpImpulse( val ){
    val = Math.max( val, 0.01 );
    this.cameraJumpImpulse[0]=val;
  }
  // Default is 2.85
  setJumpHoldMax( val ){
    val = Math.max( val, 0.01 );
    this.cameraMaxJumpHold[0]=val;
  }
  // Default is 0.08
  setJumpRepeatDelay( val ){
    val = Math.max( val, 0.01 );
    this.releaseJumpLockDelay=val;
  }

  // -- -- --

  // Default is 0.85
  setCameraRotateEasing( val ){
    if( !Array.isArray(val) ){
      if( typeof val == "number" ){
        val=[val,val];
        this.warn("Warning : Camera.setCameraEasing() expects an array of two numeric values, [PC Easing 0-1, Mobile Easing 0-1]; Default is [.55,.45]");
      }else{
        this.error("Error : Camera.setCameraEasing() unexpected values type; expecting an array of two numeric values, [PC Easing 0-1, Mobile Easing 0-1]; Default is [.55,.45]");
      }
    }
    this.cameraEasing=val;
  }
  
  // Touch Sensitivity should be a pixel-to-device reasonable value
  //   Default is 500, being 500 pixels dragging range to look around
  setTouchSensitivity( val ){
    if(val<=0){
      val=1;
    }
    this.touchMaxSensitivity=val;
    this.touchSensitivityLimits = this.touchMaxSensitivity * this.pi;
  }
  
  setGravityRate( val ){
    if(val<=0){
      val=1;
    }
    this.gravityRate=val;
  }

  // Assume 1 unit is 1 meter/second^2
  //  But default is 2.5, so it's a bit lighter than Earth's gravity
  setGravityMax( val ){
    if(val<=0){
      val=1;
    }
    this.gravityMax=val;
  }

  // Set walking bounce settings
  // Default is 230
  setWalkBounceHeight( val ){
    if(val<=0){
      val=0;
    }
    this.walkBounceHeight=val;
  }
  // Default is 0.025
  setWalkBounceRate( val ){
    if(val<=0){
      val=0.0001;
    }
    this.walkBounceRate=val;
  }
  // Default is 0.03
  setWalkBounceEaseIn( val ){
    val = Math.min( 1, Math.max( val, 0.0001 ) );
    this.walkBounceEaseIn=val;
  }
  // Default is 0.95
  setWalkBounceEaseOut( val ){
    val = Math.min( 1, Math.max( val, 0.01 ) );
    this.walkBounceEaseOut=val;
  }

  // -- -- --

  // Set camera values from `pxlUserSettings` structure
  //   Should custom entries have been added, they wont be processed
  // TODO : This is a bit messy at the moment
  // TODO : Add a per-room userSettings with lookup into the `pxlUserSettings` structure
  //          Since with this set structure, it doesn't need to be individual variables
  setUserSettings( userSettingsObject ){
    // User & collider step height settings
    if( userSettingsObject.hasOwnProperty("height") ){
      if( userSettingsObject.height.hasOwnProperty("standing") ){
        this.setUserHeight( userSettingsObject.height.standing );
      }
      if( userSettingsObject.height.hasOwnProperty("stepSize") ){
        this.setMaxStepHeight( userSettingsObject.height.stepSize );
      }
    }
    // -- -- --
    // Camera movement settings
    if( userSettingsObject.hasOwnProperty("movement") ){
      if( userSettingsObject.movement.hasOwnProperty("scalar") ){
        this.setMovementScalar( userSettingsObject.movement.scalar );
      }
      if( userSettingsObject.movement.hasOwnProperty("max") ){
        this.setMovementMax( userSettingsObject.movement.max );
      }
      if( userSettingsObject.movement.hasOwnProperty("easing") ){
        this.setMovementEase( userSettingsObject.movement.easing );
      }
    }
    // -- -- --
    // Head bounce settings
    if( userSettingsObject.hasOwnProperty("headBounce") ){
      if( userSettingsObject.headBounce.hasOwnProperty("height") ){
        this.setWalkBounceHeight( userSettingsObject.headBounce.height );
      }
      if( userSettingsObject.headBounce.hasOwnProperty("rate") ){
        this.setWalkBounceRate( userSettingsObject.headBounce.rate );
      }
      if( userSettingsObject.headBounce.hasOwnProperty("easeIn") ){
        this.setWalkBounceEaseIn( userSettingsObject.headBounce.easeIn );
      }
      if( userSettingsObject.headBounce.hasOwnProperty("easeOut") ){
        this.setWalkBounceEaseOut( userSettingsObject.headBounce.easeOut );
      }
    }
    // -- -- --
    // Jump settings
    if( userSettingsObject.hasOwnProperty("jump") ){
      if( userSettingsObject.jump.hasOwnProperty("impulse") ){
        this.setJumpScalar( userSettingsObject.jump.impulse );
      }
      if( userSettingsObject.jump.hasOwnProperty("holdMax") ){
        this.setJumpHoldMax( userSettingsObject.jump.holdMax );
      }
      if( userSettingsObject.jump.hasOwnProperty("repeatDelay") ){
        this.setJumpRepeatDelay( userSettingsObject.jump.repeatDelay );
      }
    }
    // -- -- --
    // Gravity settings
    //   From a Jump or running off a ledge
    if( userSettingsObject.hasOwnProperty("gravity") ){
      if( userSettingsObject.gravity.hasOwnProperty("UPS") ){
        this.setGravityRate( userSettingsObject.gravity.UPS );
      }
      if( userSettingsObject.gravity.hasOwnProperty("Max") ){
        this.setGravityMax( userSettingsObject.gravity.Max );
      }
    }
  }


/////////////////////////
// Main runtime loop  //
///////////////////////
  /**
   * Main step function to update camera state.
   */
  step(){
    // Update camera position with out gravity, jump, or collider influences.
    //   Simply apply initial frame movement vectors
    if(this.pxlDevice.directionKeyDown){
        this.updateMovement(this.pxlTimer.prevMS);
    }
    if( this.runMain ){
      
      if( this.hasJumpLock && this.pxlTimer.runtime > this.releaseJumpLockTime ){
        this.hasJumpLock = false;
        this.hasGravity = false; 
        this.cameraAllowJump = true;
        this.camInitJump();
      }
      if( this.hasGravity && this.cameraJumpActive ){
          this.camJump(this.pxlTimer.prevMS);
      }else if(this.cameraJumpVelocity>0 ){
          this.killJumpImpulse( this.pxlTimer.deltaTime );
      }
    }
    
    // Check if camera calculations should be ran
    this.camUpdated= this.camUpdated || this.hasMoved || this.hasRotated || this.hasGravity || this.cameraMovement[0]!=0 || this.cameraMovement[1]!=0 ;// || this.pxlDevice.cursorLockActive;
    this.updateCamera();


    // Update Shaders to Camera Position / Rotation changes
    this.lowQualityUpdates();
    this.midQualityUpdates();
        
    this.eventCheck();
  }
  

  /**
   * Checks for events based on environment triggers.
   * Currently only checking for Ground Collider, Room Warps, and Portals
   */
  eventCheck(){
      if( this.colliderValid && this.eventCheckStatus){
          // Camera Translate Events don't need further calculatons; Room Warps and Portals
          if( this.eventTrigger(this.nearestFloorObjName) ){ 
              this.warpEventTriggered(1, this.nearestFloorObjName);
              //return;
          }
      }
  }
    
  /**
   * Updates device values based on velocity easing magnitude.
   * @param {number} velEaseMag - The current velocity magnitude.
   */
  updateDeviceValues( velEaseMag ){
    if(!this.pxlQuality.settings.leftRight){
      let tankRotate=-this.cameraMovement[0];
      if(!this.pxlDevice.touchMouseData.active){
        this.pxlDevice.touchMouseData.velocity.x+=tankRotate;
        //this.pxlDevice.touchMouseData.velocityEase.x+=tankRotate;
      }
      this.pxlDevice.touchMouseData.netDistance.x+=tankRotate*4.0;
    }
    
    //let stillMoving=false;
    // PC Mouse Movement
    if(this.pxlDevice.touchMouseData.velocity!=null && this.pxlDevice.mobile==0){
      if(velEaseMag<this.posRotEasingThreshold){
        this.pxlDevice.touchMouseData.velocity.multiplyScalar(0);
        //this.pxlDevice.touchMouseData.velocityEase.multiplyScalar(0);
      }else{
        let curEasing = this.cameraEasing[ (this.pxlDevice.mobile?1:0) ];
        this.pxlDevice.touchMouseData.velocity.multiplyScalar( curEasing );
        //this.pxlDevice.touchMouseData.velocityEase.multiplyScalar( curEasing );
      }
      this.pxlDevice.touchMouseData.netDistance.add( this.pxlDevice.touchMouseData.velocity.clone().multiply( this.pxlDevice.touchMouseData.moveMult ) );
    }
  }
  
//////////////////////////////////////////
// Gyroscope Enabled Device Functions  //
////////////////////////////////////////
  /**
   * Builds device-pose monitors for gyroscope-enabled devices.
   * CURRENTLY UNWORKING
   */
  buildDeviceMonitors(){
    let camObject=this;
    //window.addEventListener('deviceorientation', (e)=>{camObject.devicePoseData(camObject,e)} );
    //window.addEventListener('orientationchange', (e)=>{camObject.deviceOrientationData(camObject,e)} );
    //window.addEventListener('devicemotion', (e)=>{camObject.deviceMotionData(camObject,e)} );
        //%=
    //gyroscope=new Gyroscope({frequency:10});
    //gyroscope.addEventListener('reading',gyroPoseData);
    //gyroscope.start();
    
    //window.addEventListener('devicemotion', deviceMotionData);
    //window.addEventListener('orientationchange', devicePoseChange); // Don't know when this ever fires, docs seem like it should run tho
    
    // Based around w3.org's Accelerometer builder
  /*  navigator.permissions.query({ name: 'accelerometer' }).then(result => {
      if (result.state === 'denied') {
        console.log('Permission to use accelerometer sensor is denied.');
        return;
      }

      let acl = new Accelerometer({frequency: 10});
      let max_magnitude = 0;
      acl.addEventListener('activate', () => console.log('Ready to measure.'));
      acl.addEventListener('error', error => console.log(`Error: ${error.name}`));
      acl.addEventListener('reading', () => {
        let magnitude = Math.hypot(acl.x, acl.y, acl.z);
        if (magnitude > max_magnitude) {
          max_magnitude = magnitude;
          console.log(`Max magnitude: ${max_magnitude} m/s2`);
        }
      });
      acl.start();
    });*/
        //%
  }
    /*
  gyroPoseData(camObj,e){
    let x=gyroscope.x;
    let y=gyroscope.y;
    let z=gyroscope.z;
    let prevGyro=[...this.pxlDevice.gyroGravity];
    this.pxlDevice.gyroGravity=[x,y,z];
    accumGravity=[accumGravity[0]+x-prevGyro[0],accumGravity[1]+y-prevGyro[1],accumGravity[2]+z-prevGyro[2]];
    
  }

  deviceMotionData(camObj,e){
    let acc=e.acceleration;//IncludingGravity;
    //let ag=e.accelerationIncludingGravity;
    if(camObj.cameraPose.accelCalCount<camObj.cameraPose.accelCalibration){
      camObj.cameraPose.accelCalCount+=1;
      camObj.cameraPose.accelZeroed[0]+=acc.x;
      camObj.cameraPose.accelZeroed[1]+=acc.y;
      camObj.cameraPose.accelZeroed[2]+=acc.z;
      if(camObj.cameraPose.accelCalCount==camObj.cameraPose.accelCalibration){
        camObj.cameraPose.accelZeroed[0]*=camObj.cameraPose.accelCalDiv;
        camObj.cameraPose.accelZeroed[1]*=camObj.cameraPose.accelCalDiv;
        camObj.cameraPose.accelZeroed[2]*=camObj.cameraPose.accelCalDiv;
      }
    }
    camObj.cameraPose.accelDelta[0]=acc.x-camObj.cameraPose.accelZeroed[0];
    camObj.cameraPose.accelDelta[1]=acc.y-camObj.cameraPose.accelZeroed[1];
    camObj.cameraPose.accelDelta[2]=acc.z-camObj.cameraPose.accelZeroed[2];
    camObj.cameraPose.accelTotal[0]+=acc.x-camObj.cameraPose.accelZeroed[0];
    camObj.cameraPose.accelTotal[1]+=acc.y-camObj.cameraPose.accelZeroed[1];
    camObj.cameraPose.accelTotal[2]+=acc.z-camObj.cameraPose.accelZeroed[2];
  }

  devicePoseData(camObj,e){
    if(e.alpha!==null){
      camObj.abs=e.absolute;
      camObj.cameraPose.gamma=e.gamma; // Yaw
      camObj.cameraPose.beta=e.beta; // Pitch
      camObj.cameraPose.alpha=e.alpha; // Roll
      camObj.cameraPose.alphaOffset=e.alphaOffset||0; // Roll
    }
  }
  
  deviceOrientationData(camObj,e){
    camObj.cameraPose.orientation=window.orientation||0;
  }
  */
  
/////////////////////////////////////////////////////////////////////
// Set Camera Position / Look At Functions; Room Warps & Portals  //
///////////////////////////////////////////////////////////////////
  /**
   * Updates camera matrices.
   * Updates - Projection Matrix, Matrix World, & World Matrix
   */
  updateCameraMatrices(){
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.camera.updateWorldMatrix();
  }
  /**
   * Resets camera calculations to a Vector3.
   * @param {Vector3} newPosition - The new position for the camera.
   */
  resetCameraCalculations( newPosition ){
    this.cameraMovement[0] = 0;
    this.cameraMovement[1] = 0;
    this.pxlDevice.touchMouseData.curFadeOut.multiplyScalar(0);
    this.pxlDevice.touchMouseData.velocity.multiplyScalar(0);
    
    this.pxlDevice.touchMouseData.netDistance.set(0,0);
    
    this.camera.position.copy( newPosition );
    this.updateCameraMatrices();
    this.cameraPos.copy( newPosition );
    this.cameraPrevPos.copy( newPosition );
    
    // Force collision detection
    this.colliderCurObjHit=null; 
    this.colliderPrevObjHit=null;
    this.camUpdated=true; // Forces next frame update
  }

  /**
   * Sets the field-of-view for the camera.
   * @param {number} fov - The field-of-view.
   */
  setFOV( fov ){
    this.camera.fov=fov;
    this.camera.updateProjectionMatrix();
    this.camUpdated=true;
  }

  /**
   * Sets camera stats including FOV, aspect ratio, near and far clipping planes.
   * Used when changing Rooms
   * @param {number} fov - The field of view.
   * @param {number} aspect - The aspect ratio.
   * @param {number} near - The near clipping plane.
   * @param {number} far - The far clipping plane.
   */
  setStats( fov, aspect, near, far ){
    // TODO : Aspect is weird, I need to work out better calculations for this
    //this.camera.aspect=aspect;
    this.camera.near=near;
    this.camera.far=far;
    this.setFOV(fov);
  }

  setAspect( aspect ){
    this.camera.aspect=aspect;
    this.camera.updateProjectionMatrix();
    //this.camUpdated=true;
  }

  /**
   * Sets the camera transform to a specific position and lookAt target.
   * For camera position changes, portals, and room warps
   * @param {Vector3} pos - The position to set the camera.
   * @param {Vector3} [lookAt=null] - The lookAt target.
   */
  setTransform(pos, lookAt=null){ // Vector3, Vector3
    this.resetCameraCalculations(pos); // Reinitiates Camera; Forces collision detection, Kills user inputs
    
    if(lookAt){
      this.cameraAimTarget.position.copy( lookAt );
      this.camera.lookAt(lookAt);
      this.cameraPrevLookAt.copy( lookAt );
      
      this.updateCameraMatrices();
      
      this.pxlDevice.touchMouseData.initialQuat=this.camera.quaternion.clone();
    }
    
    this.resetGravity();
    this.camUpdated=true; // Forces next frame update
  }
  
  
  /**
  * Best used without a `lookAt` target to allow the object's rotation to be adopted.
  * If you just want to move the camera without rotational changes -or- to an object with a lookAt, it's better to use `setTransform`
  * @param {Object3D} obj - The object to set the camera to.
  * @param {Object3D|string} [lookAt=null] - The lookAt Camera Position Name or target object.
  * If a string is provided, it checks for the camera position if it exists in the Room,
  *   Ussuall set in your FBX file.
  */
  setToObj(obj, lookAt=null){ // Object3D, Object3D
    this.resetCameraCalculations( obj.position ); // Reinitiates Camera; Forces collision detection, Kills user inputs
    
    // If no lookat, adopt Object rotation
    if(lookAt){
      let toLookAt=lookAt.position.clone();
      this.cameraAimTarget.position.copy( toLookAt );
      this.camera.lookAt(toLookAt);
      this.cameraPrevLookAt.copy( toLookAt );
      
      this.updateCameraMatrices();
      
      this.pxlDevice.touchMouseData.initialQuat=this.camera.quaternion.clone();
    }else{
      this.pxlDevice.touchMouseData.initialQuat=obj.quaternion.clone();
      this.camera.setRotationFromQuaternion(this.pxlDevice.touchMouseData.initialQuat);
      this.updateCameraMatrices();
    }
    
    this.resetGravity();
    this.camUpdated=true; // Forces next frame update
    this.hasMoved=true;
    this.hasRotated=true;
    this.colliderCheck( obj.position );
    this.nearestFloorObjName=null;

    
  }
  
  /**
   * Warps the camera to a specific room.
   * @param {string} roomName - The name of the room to warp to.
   * @param {boolean} [start=false] - Whether to run the room's `start()` function.
   * @param {Object3D} [objTarget=null] - The target object in the room.
   */
  warpToRoom(roomName, start=false, objTarget=null){
    this.pxlEnv.roomSceneList[this.pxlEnv.currentRoom].stop();

    let prevRoom=this.pxlEnv.currentRoom;
    let holdCamera=this.pxlEnv.roomSceneList[this.pxlEnv.currentRoom].camHoldWarpPos;
    this.pxlEnv.currentRoom=roomName;
    this.pxlAutoCam.curRoom=roomName;
    let roomEnv=this.pxlEnv.roomSceneList[this.pxlEnv.currentRoom];
    
    let isMainRoom=roomName==this.pxlEnv.mainRoom;
    //this.pxlEnv.delayPass.uniforms.roomComposer.value= isMainRoom ? 0 : 1;
    if( this.pxlUser.iZoom ){
      let tDiff= isMainRoom ? this.pxlEnv.roomComposer : this.pxlEnv.mapComposer;
      let tDiffPrev= isMainRoom ? this.pxlEnv.mapComposer: this.pxlEnv.roomComposer;
      this.pxlEnv.delayPass.uniforms.tDiffusePrev.value= tDiff.renderTarget1.texture;
      this.pxlEnv.delayPass.uniforms.tDiffusePrevRoom.value= tDiffPrev.renderTarget1.texture;
      setTimeout( ()=>{
        if(  prevRoom != roomName ){
          if( isMainRoom ){
            this.pxlEnv.roomComposer.reset();
          }else{
            this.pxlEnv.mapComposer.reset();
          }
        }
        setTimeout( ()=>{
          this.pxlEnv.mapComposerWarpPass.needsSwap=false;
        },500);
      },100);
    }
    //this.pxlEnv.delayPass.uniforms.tDiffusePrev.value= roomName==this.pxlEnv.mainRoom ? this.pxlEnv.mapComposer.renderTarget1.texture : this.pxlEnv.roomComposer.renderTarget1.texture;
        
    //if(roomName!=this.pxlEnv.mainRoom || start){
    if( start ){
      if( roomName != prevRoom ){
        roomEnv.start();
      }

      this.pxlEnv.roomRenderPass.scene=roomEnv.scene;
      if( roomEnv.camLocation.hasOwnProperty(objTarget) ){
          
        let posName = this.cameraPosLookAtNames["default"].pos;
        let lookAtName = this.cameraPosLookAtNames["default"].lookAt;

        if( this.pxlDevice.mobile ){
          if( roomEnv.camLocation[objTarget].hasOwnProperty( this.cameraPosLookAtNames["mobile"].pos ) ){
            posName=this.cameraPosLookAtNames["mobile"].pos;
          }
          if( roomEnv.camLocation[objTarget].hasOwnProperty( this.cameraPosLookAtNames["mobile"].lookAt ) ){
            lookAtName=this.cameraPosLookAtNames["mobile"].lookAt;
          }
        }
        let toPos = roomEnv.camLocation[objTarget][ posName ];
        let toLookAt = roomEnv.camLocation[objTarget][ lookAtName ];
        this.setTransform( toPos, toLookAt );
      }else if( roomEnv.camInitPos && roomEnv.camInitLookAt && ( !holdCamera || !this.pxlEnv.postIntro || this.hotKeyTriggered ) ){
        this.setTransform( roomEnv.camInitPos, roomEnv.camInitLookAt );
        this.hotKeyTriggered=false;
      }
    }else{
      if(  !holdCamera || !this.pxlEnv.postIntro || this.hotKeyTriggered ){
        if(objTarget!=null){
            this.setToObj(objTarget);
        }else{
            this.setTransform( roomEnv.camReturnPos, roomEnv.camReturnLookAt );
        }
        this.hotKeyTriggered=false;
      }
    }
    this.pxlGuiDraws.prepArtistInfo( roomEnv.getArtistInfo() );
    this.camUpdated=true;
    /*this.pxlEnv.mapComposerWarpPass.enabled=!this.pxlEnv.mapComposerWarpPass.enabled;
    this.pxlEnv.mapComposer.render();
    this.pxlEnv.mapComposerWarpPass.enabled=!this.pxlEnv.mapComposerWarpPass.enabled;
    this.pxlEnv.mapComposer.render();*/
    
    let curFOV = roomEnv.pxlCamFOV[  this.pxlDevice.mobile ? 'MOBILE' : 'PC' ];
    this.camera.fov=curFOV;
    this.camera.zoom=roomEnv.pxlCamZoom;
    this.camera.aspect=roomEnv.pxlCamAspect;
    this.camera.near=roomEnv.pxlCamNearClipping;
    this.camera.far=roomEnv.pxlCamFarClipping;
    this.camera.updateProjectionMatrix();
    
    let standingHeight=this.getUserHeight();
    this.emitCameraTransforms( this.camera.position.clone(), standingHeight, true );
        
    // Camera assumes the player is warping to safe ground
    //   So it will treat the position as the nearest floor hit
    //     This was causing initial jumping and movement to use the camera position as the floor
    //   This will drop the player from any height to the nearest floor using gravity when warping to a room
    // TODO : Move this to be Room specific
    if( this.canMove ){
      this.colliderValid=false;
      this.hasGravity=true;
    }
    
    this.pxlAutoCam.checkStatus();
  }
  warpToRoomSnapshot(roomName){
    this.pxlEnv.currentRoom=roomName;
    let roomEnv=this.pxlEnv.roomSceneList[this.pxlEnv.currentRoom];
    
    let curFOV = roomEnv.pxlCamFOV[  this.pxlDevice.mobile ? 'MOBILE' : 'PC' ];
    this.camera.fov=curFOV;
    this.camera.zoom=roomEnv.pxlCamZoom;
    this.camera.aspect=roomEnv.pxlCamAspect;
    this.camera.near=roomEnv.pxlCamNearClipping;
    this.camera.far=roomEnv.pxlCamFarClipping;
    this.camera.updateProjectionMatrix();
    this.setTransform( roomEnv.camThumbPos, roomEnv.camThumbLookAt );

    let standingHeight=this.getUserHeight();
    this.emitCameraTransforms( this.camera.position.clone(), standingHeight, true );
  }
  
  // -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    // 
  /**
   * Initiates fast travel to a specific location.
   * This begins the warp effect process,
   *   It doesn't affect camera upon triggering, just queuing the warp event
   * @param {number} [hotkey=0] - The hotkey for the fast travel location.
   */
  fastTravel(hotkey=0){
        if( this.pxlAutoCam.enabled ){
            return;
        }
        if( this.pxlAutoCam.active || this.pxlAutoCam.autoCamActive ){
            this.pxlAutoCam.preAutoCamToggle();
        }
        
        this.hotKeyTriggered=true;
    if( hotkey == 0 ){ // Lobby
      //this.warpEventTriggered( 1, this.pxlEnv.mainRoom, 'init' );
      this.warpEventTriggered( 1, this.pxlEnv.currentRoom, 'init' );
    }
    
    // Hotkeys are set for a specific scene, make 3d scene file dependant
    return;
    if( hotkey == 1 ){ // Canyon
      //this.warpEventTriggered( 1, this.pxlEnv.mainRoom, this.portalList['Portal_8'] );
    }else if( hotkey == 2 ){ // Dance Hall
      //this.warpEventTriggered( 1, "ShadowPlanet", 'init' );
    }else if( hotkey == 3 ){ // Sunflower Room
      //this.warpEventTriggered( 1, this.pxlEnv.mainRoom, this.portalList['Portal_0'] );
    }
  }



////////////////////////////////////
// Camera Jumping Functions      //
//////////////////////////////////
  /**
   * Handles the camera jump key press or release.
   * @param {boolean} [jumpKeyIsDown=false] - Whether the jump (Default : Space) key is pressed.
   */
  camJumpKey( jumpKeyIsDown=false ){
    if( jumpKeyIsDown ){ // Space is down
      this.camInitJump();
    }else{ // Space is up
      if(this.cameraJumpActive){ // Space
        this.cameraJumpActive=false;
      }
      this.cameraAllowJump=true;
      this.hasJumpLock=false; // Prevent repeated jumping if Space held down after landing
    }
  }

  /**
   * Initializes the jump values for the camera.
   */
  camInitJump(){
    // Link static camera to prevent jumping as well
    if( !this.canMove ){return;}
      
    if( !this.hasGravity && this.cameraAllowJump ){
      this.pxlDevice.keyDownCount[2]=this.pxlTimer.prevMS;
      

      this.cameraAllowJump=false; // Prevent jump spamming up stacked colliders; this may be desired for ladders
      this.cameraJumpActive=true;
      this.cameraJumpInAir=true;
      
      this.hasGravity=true;
      this.gravityRate=0;
      this.cameraJumpVelocity=this.cameraJumpImpulse[this.pxlUser.lowGrav] * this.userScale;
            
      if( this.hasJumpLock ){
          this.hasJumpLock=false;
          this.nearestFloorHit=this.nearestFloorHitPrev;
      }
    }
  }
  
  /**
   * Handles the camera jump step.
   * Step the jump while impulse isn't 0.
   * @param {number} curTime - The current time.
   */
  camJump(curTime){
    let timeDelta= (curTime-this.pxlDevice.keyDownCount[2]) ;
    let fpsRateAdjust=1;//Math.min(1, 1/(20*this.pxlTimer.msRunner.y));
    // let jumpPerc=Math.min(1, timeDelta/(this.cameraMaxJumpHold[this.pxlUser.lowGrav]*fpsRateAdjust) );
    let jumpPerc=Math.min(1, timeDelta / (this.cameraMaxJumpHold[this.pxlUser.lowGrav] ) ) ;
        
    if(this.cameraJumpActive){
      let jumpRate=jumpPerc ;
      if(jumpRate==1){
        this.cameraJumpActive=false;
      }else{
        jumpRate=(1-jumpRate)*(1-jumpRate);
        jumpRate=jumpRate* ( jumpRate*.5+.5);
      }
      this.cameraJumpVelocity+=Math.max(0, jumpRate) * this.cameraJumpImpulse[this.pxlUser.lowGrav] * this.jumpScalar * this.pxlTimer.deltaTime;
    }
    this.cameraJumpVelocity*=(1-jumpPerc);//*.5+.5;

    if( jumpPerc==1 ){
      this.cameraJumpActive=false;
    }
  }
  /**
   * Kills the jump impulse.
   * Space released before max jump
   */
  killJumpImpulse(deltaTime){
    let toImpulse=this.cameraJumpVelocity * (this.cameraJumpVelocityEaseOut);

    this.cameraJumpVelocity= toImpulse>.1 ? toImpulse : 0;
    this.workerFunc( "killJumpImpulse" );
  }
  
/////////////////////////
// Gravity Functions  //
///////////////////////
  /**
   * Updates the gravity for the camera.
   * Gravity is updated and offset landing height with an ease back to standing upright
   */
  updateGravity( deltaTime ){
    if( this.runMain ){
      this.gravityRate = Math.max(0, this.gravityRate-this.cameraJumpVelocity  );
      
      let gravityRate = this.gravityUPS[ this.pxlUser.lowGrav ];

      if( this.hasGravity ){
        this.gravityCount += (gravityRate * 2.5) * deltaTime;
        //this.gravityRate = Math.min( 1, ((this.gravityRate+this.gravityMax)*deltaTime)) * gravityRate;
        this.gravityRate = Math.min( 1, ((this.gravityRate+this.gravityMax))) * this.gravityCount;
        //this.gravityRate +=  this.gravityRate * this.gravityCount;
      }
      if( this.gravityRate != 0 ){
        // gMult not used, testing for need
        let gMult=1;
        if( !this.hasGravity ){
          this.gravityRate=this.gravityRate>.01 ? this.gravityRate*this.gravityEaseOutRate*gravityRate * deltaTime : 0;
          gMult= this.gravityRate;
        }else{
          //gMult=this.gravityRate*.08*gravityRate;
          gMult=this.gravityRate;
        }
        gMult=Math.min(1, gMult);
        
        this.standingHeightGravInfluence = Math.min(1, this.gravityRate / this.gravityMax ) * this.standingMaxGravityOffset;
        //this.standingHeightGravInfluence = Math.min(1, gMult / this.gravityMax ) * this.standingMaxGravityOffset;
        //this.standingHeightGravInfluence = Math.min(this.gravityMax, this.gravityRate * deltaTime ) * this.standingMaxGravityOffset;
        //this.standingHeightGravInfluence = Math.min(this.gravityMax, this.gravityRate * deltaTime ) * this.standingMaxGravityOffset;
      }
    }
  }
  /**
   * Resets the gravity for the camera.
   * Ran during Jump Landing, Room & Portal Warps currently
   */
  resetGravity(){
    this.gravityCount=0;
    this.gravityRate=0;
    this.workerFunc( "resetGravity" );
    this.jumpLanding( false ); // resetGravity runs jumpLanding on Worker
  }
  /**
   * Handles the jump landing, stopping the camera jump.
   * @param {boolean} [send=true] - Whether to send the landing event.
   */
  jumpLanding( send=true ){
    // Is space held down?
    //  Trigger short delay before triggering a jump again
    if( this.cameraJumpActive ){
      this.hasJumpLock=true;
      this.releaseJumpLockTime = this.pxlTimer.runtime + this.releaseJumpLockDelay;
    }

    this.gravityCount=0;
    this.hasGravity=false; // Should probably name it cameraInAir
    this.cameraJumpVelocity=0;
    this.cameraJumpInAir=false; // hasGravity should indicate this value; residual from logic rework
    this.cameraJumpActive=false; // Stop running camJump function

    // Leave outside if for external access
    if( send ){
        this.workerFunc( "jumpLanding" );
    }
  }
  
//////////////////////////////////////////////
// Collision Objects and Ground Functions  //
////////////////////////////////////////////
  /**
   * Checks for main collider interactions.
   * Ground plane, obstacles, and no terrain (If there are colliders in scene)
   * @param {Vector3} curCamPos - The current camera position.
   * @returns {Vector3} - The updated camera position.
   */
  // TODO : gravitySource should probably originate from Room's object list, but for now...
  // TODO : Collision check shouldn't run if no cam movement length aside from gravity, store floor name and collision position from prior run
  colliderCheck( curCamPos ){

    // Check if camera is in Roam or Static mode
    if( !this.canMove ){
      return curCamPos;
    }

    // Floor Collider
    //   geoList["floorCollider"] Collision Detection
    let objHit=null;
    this.movementBlocked=false;
    
    if( (this.cameraMoveLength>0 || this.colliderPrevObjHit==null || this.nearestFloorObjName==null) &&
           this.cameraBooted && this.pxlEnv.roomSceneList[this.pxlEnv.currentRoom].collidersExist
        ){
      this.colliderValidityChecked=true; // Prevent doublechecking object validity post collision detection
      
      let curRoomObj = this.pxlEnv.roomSceneList[ this.pxlEnv.currentRoom ];

      let castDir=new Vector3(0,-1,0);
      let castPos=curCamPos.clone();//.add(new Vector3(0,100,0));
      let castHeight= 150*this.maxStepHeight ;
      castPos.y += castHeight + this.maxStepHeight;
      
      let resetKeyDown=false;
      var rayHits=[];
      
      let curQuadrant= ( ~~(castPos.x>0)+"" ) + ( ~~(castPos.z>0)+"" );
      
      if( curRoomObj.hasColliderType( COLLIDER_TYPE.WALL ) ){
        rayHits = this.pxlColliders.castRay( this.pxlEnv.currentRoom, castPos, castDir, COLLIDER_TYPE.WALL );
      }
      
      if(rayHits.length > 0){ // Hit a wall, check if you are standing on the wall
        // this.floorColliderInitialHit=true;
        curRoomObj.hitColliders( rayHits, COLLIDER_TYPE.WALL );
        if(curRoomObj.hasColliderType( COLLIDER_TYPE.WALL_TOP )){
          let rayTopHits=this.pxlColliders.castRay( this.pxlEnv.currentRoom, castPos, castDir, COLLIDER_TYPE.WALL_TOP );
          if( rayTopHits.length > 0 ){
            curRoomObj.hitColliders( rayTopHits, COLLIDER_TYPE.WALL_TOP );
          }
          
          let closestDist=-99999;
          let yPrevRef=curCamPos.y;
          let curName;
          let curCollisionPos=this.nearestFloorHit;
          let validHitCheck=false;
          for(var x=0; x<rayTopHits.length;++x){
            var obj=rayTopHits[x];
            curName=obj.object.name;
            let curHit=obj.pos;
            let curDist=obj.dist;
            let camDist=curHit.y;//- curCamPos.y; // ## Why??
            let validHit=camDist < this.maxStepHeight;
            validHitCheck = validHitCheck ? validHitCheck : validHit;
            if( (curDist<closestDist && valid) || objHit==null){
              objHit=curName;
              closestDist=curDist;
              curCollisionPos=curHit;
            }
          }

          // Check if camera is on top of wall
          let pullBack;
          if( !validHitCheck || ((curCamPos.y) < curCollisionPos.y && (this.nearestFloorHitPrev.y-curCollisionPos.y > (this.maxStepHeight+this.getStandingHeight()) && !this.hasGravity) && ( (curCamPos.y+this.maxStepHeight+this.getStandingHeight()) < curCollisionPos.y && this.hasGravity) ) ){
              
              //objHit=this.nearestFloorObjName;
              if(this.cameraMovement[0] != 0 || this.cameraMovement[1] != 0 ){
                  validHitCheck=true;
                  this.hasGravity=false;
                  this.hasJumpLock=true;
              }
              
              pullBack=this.cameraPos.clone();
              pullBack.y=Math.min(curCamPos.y,pullBack.y);//+this.cameraJumpVelocity;
              curCamPos=pullBack;
              curCollisionPos=curCamPos;
              if(this.hasGravity){
                  curCollisionPos.y=this.nearestFloorHitPrev.y;
              }else{
                  curCollisionPos.y=this.cameraPos.y;
              }
                  
              this.cameraJumpActive=false;
              this.cameraAllowJump=true;
              this.cameraJumpInAir=false;
              
              this.cameraMovement[0] = 0;
              this.cameraMovement[1] = 0;
              this.pxlDevice.touchMouseData.curFadeOut.multiplyScalar(0);
              this.pxlDevice.touchMouseData.velocity.multiplyScalar(0);
              //this.pxlDevice.touchMouseData.velocityEase.multiplyScalar(0);
          }
          
          
          //this.colliderValid=validHitCheck;
          if( validHitCheck ){
              if( objHit == null ){
                  this.nearestFloorHit = this.nearestFloorHitPrev;
                  this.nearestFloorObjName = this.nearestFloorObjNamePrev;
                  if( Math.abs(curCamPos.y-this.nearestFloorHit.y) > (this.maxStepHeight+this.getStandingHeight()) ){
                      this.colliderValid = false;
                      this.hasGravity = true;
                  }
              }else{
                  this.nearestFloorHitPrev = this.nearestFloorHit;
                  this.nearestFloorObjNamePrev = this.nearestFloorObjName;
                  this.nearestFloorHit = curCollisionPos;
                  this.nearestFloorObjName = objHit;
              }
          }
        }else{
          this.colliderFail=true;
          this.movementBlocked=true;
        }
      }else{
        // ## Find orientation to gravitational source if any exist in Room Environment
        let stepUpDist=this.maxStepHeight;//+this.cameraJumpVelocity;
        let validDistRange=stepUpDist+this.getStandingHeight();
        //castPos.y=curCamPos.y+stepUpDist;
        castPos=curCamPos.clone(); //.add(new Vector3(0,100,0));
        castPos.y += castHeight + this.maxStepHeight;
        
                
        if( this.pxlEnv.roomSceneList[this.pxlEnv.currentRoom].hasColliders() ){
          rayHits=this.pxlColliders.castRay( this.pxlEnv.currentRoom, castPos, castDir, COLLIDER_TYPE.FLOOR );
        }else{
          return curCamPos; // No colliders
        }
                
        if(rayHits.length > 0){
          if(rayHits.length > 1){
            let firstDist = Math.abs( rayHits[0].pos.y-curCamPos.y );
            if( firstDist<stepUpDist ){
              rayHits = [ rayHits[0] ];
            }else if( firstDist>stepUpDist && rayHits[0].pos.y > rayHits[1].pos.y && rayHits[1].pos.y > curCamPos.y-this.maxStepHeight ){
              return curCamPos;
            }
          }

          this.floorColliderInitialHit=true;
          let closestDist=-99999;
          let curName;
          let curCollisionPos=this.nearestFloorHit;
          
          for(let x=0; x<rayHits.length;++x){
            let obj=rayHits[x];
            let curHit=obj.pos;
            //let curHit=castPos.y-obj.dist;
            //let curDist=obj.dist;
            
            let validHit=false;
            curName=obj.object.name;
            let camDist=curHit.distanceTo( curCamPos );

            
            validHit=camDist<this.maxStepHeight;
            //console.log(stepUpDist,camDist, obj.dist, validHit);
            if( ( this.portalList[curName] || this.roomWarpZone.includes(curName) ) && validHit){
              objHit=curName;
              curCollisionPos=curHit;
              break;
            }else if( !this.itemCheck(curName, validHit) ){
              if(camDist<closestDist || objHit==null){
                objHit=curName;
                closestDist=camDist;
                curCollisionPos=curHit;
              }
            }
          }
          
          if( this.nearestFloorObjName==null && objHit!=null){
            this.nearestFloorHitPrev=curCollisionPos;
            this.nearestFloorObjNamePrev=objHit;
                        
            this.nearestFloorHit=curCollisionPos;
            this.nearestFloorObjName=objHit;
          }
          
          //console.log(this.nearestFloorHitPrev.y-curCollisionPos.y, this.maxStepHeight+this.getStandingHeight() );
          if( (this.nearestFloorHitPrev.y-curCollisionPos.y) > (this.maxStepHeight+this.getStandingHeight()) && !this.hasGravity){

            this.nearestFloorHit=this.nearestFloorHitPrev;
            this.nearestFloorObjName=this.nearestFloorObjNamePrev;
            
            //this.cameraMovement[0] = Math.abs(this.cameraMovement[0])<this.posRotEasingThreshold ? 0 : this.cameraMovement[0]*this.cameraMovementEase;
            //this.cameraMovement[1] = Math.abs(this.cameraMovement[1])<this.posRotEasingThreshold ? 0 : this.cameraMovement[1]*this.cameraMovementEase;

            if( !objHit ){
                curCamPos=this.cameraPrevPos.clone();
            }else{
                curCamPos=this.cameraPos.clone();
            }
            objHit=this.nearestFloorObjName;
            
            this.cameraMovement[0] = 0;
            this.cameraMovement[1] = 0;
            this.pxlDevice.touchMouseData.curFadeOut.multiplyScalar(0);
            this.pxlDevice.touchMouseData.velocity.multiplyScalar(0);
            //this.pxlDevice.touchMouseData.velocityEase.multiplyScalar(0);

          }else{ // Player is jumping or falling

            this.nearestFloorHitPrev=this.nearestFloorHit;
            this.nearestFloorObjNamePrev=this.nearestFloorObjName;
            
            this.nearestFloorHit=curCollisionPos;
            this.nearestFloorObjName=objHit;
            if( objHit == null ){
                this.colliderValid=false;
                this.hasGravity=true;
            }
          }
        }else{
          // If this runs, means the user ran off the edge of the collider and there is no floor below them.
          this.colliderFail=true;
          this.movementBlocked=true;
          this.colliderValidityChecked=false;
          curCamPos=this.cameraPos.clone();
        }
      }
    }else{
      // User didn't move, may be falling from gravity
      //   Call valid object check within distance from camera location
      this.colliderValidityChecked=false;
    }
    this.colliderValidityChecked=false;
    
    return curCamPos;
  }
  
  
///////////////////////////////
// Collider Event Triggers  //
/////////////////////////////
  // Should only run when this.colliderValid==false
  // ## 
  /**
   * Checks if the collider is valid.
   * For GravitySource, make sure to get vector delta magnitude, not just Y delta
   * @param {Vector3} curCamPos - The current camera position.
   * @returns {number} - The distance to the collider.
   */
  checkColliderValid( curCamPos ){
    this.colliderValidityChecked=true;
    let validDist=this.maxStepHeight+this.gravityRate;
    
    let curDist = curCamPos.distanceTo( this.nearestFloorHit );
    
    let checkValid= curDist < validDist;// && (curCamPos.y+validDist)<this.nearestFloorHit.y;
    
    this.colliderValid=checkValid;
        
    return curDist;
    //return checkValid; // Currently not needed, pre-emptive
  }
  
  /**
   * Triggers an event based on the collider object.
   * Currently supports inta-room portals, extra-room warp zones, and only 2 audio triggers.
   * Custom triggers haven't been implemented yet,
   *   For any custom Collider Events, use the `castray()`
   * @param {string} [checkObject=null] - The collider object to check.
   * @returns {boolean} - Whether an event was triggered.
   */
  eventTrigger( checkObject=null ){
    // Check if camera is in Roam or Static mode
    if( !this.canMove ){ return false; }

     // No collider, might be in a Room Environment with no colliders
    if(!checkObject){ return false; }
    
  
    // -- Check for Portals -- //
    // -- Within Room Environment position/rotation updates -- //
    if(this.portalList[checkObject]){
      this.warpEventTriggered( 0, this.portalList[checkObject]);
            this.eventCheckStatus=false;
      return true;
    }
    
    // -- Check for between Room Warp Zones -- //
    // -- Separate ThreeJS Scene position/rotation updates -- //
    if( this.roomWarpZone.includes(checkObject) ){ // ## Should live in the Room Environment
      this.warpEventTriggered( 1, checkObject );
      this.eventCheckStatus=false;
      return true; // Room warp, kill camera calculations
    }
    
    // -- Check for change between different Collider objects -- //
    // -- Changes may trigger Audio and Screen Visual Effects -- //
    this.colliderShiftActive=this.colliderCurObjHit!=checkObject || this.colliderShiftActive ;
    this.colliderPrevObjHit= this.colliderCurObjHit;
    this.colliderCurObjHit=checkObject;
    // If the volume adjust is mid transition, keep the fade rolling
    this.colliderShiftActive=this.colliderShiftActive || !(this.colliderAdjustPerc==1 || this.colliderAdjustPerc==0);
    
    // Fade Up/Down Audio/Video effects per room names
    // ## These should be handled by the Room Environment itself
    if(this.colliderShiftActive && this.colliderCurObjHit){
      let volMult= 1;
      let audioTriggerCur = this.colliderCurObjHit.includes("AudioTrigger")
      //let audioTriggerPrev = (this.colliderPrevObjHit || "").includes("AudioTrigger")
      //let audioTrigger= ( audioTriggerCur || audioTriggerPrev ) && ( audioTriggerCur != audioTriggerPrev);
      if( audioTriggerCur ){
          volMult=-1;
      }
      this.colliderAdjustPerc=Math.min(1, Math.max(0,  this.colliderAdjustPerc + this.colliderAdjustRate * volMult ));
      let curExposure=(1-this.colliderAdjustPerc);
      
      let curExp=1.0;
      // ## Convert to function dictionary per Room Environment's Collider[objName]
      if(this.colliderCurObjHit == "AudioTrigger_1"){ // Sunflower Room
        this.pxlEnv.currentAudioZone=1;
        curExp= curExp - curExposure*this.uniformScalars.darkBase; // ## Don't do it this way... blend, don't add offset
        this.uniformScalars.exposureUniformBase=curExp;

      }else if(this.colliderCurObjHit == "AudioTrigger_2"){ // Lobby
        this.pxlEnv.currentAudioZone=2;
        let animPerc=1;
        curExp= this.uniformScalars.curExp + curExposure*this.uniformScalars.brightBase*animPerc;  // ## Don't do it this way... blend, don't add offset
        this.uniformScalars.exposureUniformBase=curExp;
        this.proximityScaleTrigger=true; // Fade Out proximity range
        this.pxlAudio.setFadeActive(-1);
      //}else if(){ } // TODO : Add camera location warp pad check
      }else{
        this.pxlEnv.currentAudioZone=0;
        curExp= curExp*(1-curExposure) + this.uniformScalars.exposureUniformBase*curExposure; // ## Don't do it this way... blend, don't add offset
      }
      
      // Transition has completed when True
      this.colliderShiftActive=!(this.colliderAdjustPerc==1 || this.colliderAdjustPerc==0);
            
      // If Lobby geomtry is visible, but no longer in the Lobby, toggle visiblity
            // Runs once, at the moment of collider change
      if( this.colliderPrevObjHit=="AudioTrigger_2" && this.colliderCurObjHit!=this.colliderPrevObjHit){
        this.proximityScaleTrigger=true; // Fade In proximity range
        this.pxlAudio.setFadeActive(1);
      }
      
      if( this.pxlDevice.mobile ){
          curExp=this.colliderAdjustPerc;
      }
      
      // Set scene exposure on post-process composer passes 
      this.pxlEnv.updateCompUniforms(curExp);
            

      // Scale proximity visual
      if(this.proximityScaleTrigger && !this.pxlDevice.mobile && !this.pxlAutoCam.enabled ){
        let proxMult=this.colliderAdjustPerc;
        proxMult=1-(1-proxMult)*(1-proxMult);
        this.pxlEnv.fogMult.x = proxMult;
        if( !this.colliderShiftActive ){
          this.proximityScaleTrigger=false;
        }
      }
      
      this.eventCheckStatus=this.colliderShiftActive;
    }
  }
  
  /**
   * Checks if an item was triggered.
   * Currently only used as - if( !this.itemCheck(validHit) ){}
   *   Preventing standing on the item collider plane
   * @param {string} curNameBase - The base name of the item.
   * @param {boolean} validHit - Whether the hit was valid.
   * @returns {boolean} - Whether the item was triggered.
   */
  itemCheck(curNameBase, validHit){
    if(!validHit){ return false; }
        
        let curName=curNameBase.split("_").shift();
    
    if(this.pxlUser.itemListNames.includes(curNameBase)){
            let itemPickup=this.pxlUser.checkItemPickUp(curName);
            if(itemPickup){
                return this.itemActive( curName, curNameBase );
            }
    }
    return false; // Allowed to stand on object
  }
  /**
   * Triggers a newly picked-up item.
   * If no item is picked up, a random overlay-effect item is selected.
   */
  itemTrigger(){
        if( this.pxlUser.itemActiveTimer.length>0 ){
            this.pxlUser.itemActiveTimer[0]=this.pxlTimer.curMS;
        }else{
            if( this.pxlUser.mPick.length==0){
                this.pxlUser.mPick=this.pxlUtils.randomizeArray( ['LizardKing', 'StarField', 'InfinityZoom'] );
            }
            //this.pxlUser.mPick="LizardKing";
            let setItem= this.pxlUser.mPick.pop();
            this.pxlUser.checkItemPickUp(setItem);
            this.itemActive( setItem );
        }
    }
    /**
     * Activates an item.
     * @param {string} [curName=null] - The name of the item.
     * @param {string} [curNameBase=null] - The base name of the item.
     * @returns {boolean} - Whether the item was activated.
     */
    itemActive( curName=null, curNameBase=null ){
        if( curName==null ){
            return false;
        }
        let timer=this.pxlTimer.prevMS+this.pxlUser.itemRunTime;
        let finCmd="";
        let text="";
        if(curName=="LowGravity"){
            text="Low Gravity";
            finCmd="this.lowGrav=0;this.itemGroupList['"+curNameBase+"'].visible=true;";
            timer=this.pxlTimer.prevMS+this.pxlUser.itemRunTime;
        }else if(curName=="LizardKing"){
            text="I am the Lizard King";
            finCmd="this.lKing=0;this.lKingWarp.set(...this.lKingInactive);this.lKingPass.enabled=false;"+(!this.pxlDevice.mobile && "this.itemGroupList['"+curNameBase+"'].visible=true;");
            timer=this.pxlTimer.prevMS+this.pxlUser.itemRunTime;
        }else if(curName=="StarField"){
            text="Major Tom";
            finCmd="this.sField=0;this.sFieldPass.enabled=false;"+(!this.pxlDevice.mobile && "this.itemGroupList['"+curNameBase+"'].visible=true;");
            timer=this.pxlTimer.prevMS+this.pxlUser.itemRunTime;
        }else if(curName=="InfinityZoom"){
            text="Fractal Substrate";
            finCmd="this.iZoom=0;this.iZoomPass.enabled=false;"+(!this.pxlDevice.mobile && "this.itemGroupList['"+curNameBase+"'].visible=true;this.pxlEnv.mapComposerWarpPass.needsSwap=true;this.pxlEnv.mapComposerWarpPass.enabled=false;");
            timer=this.pxlTimer.prevMS+this.pxlUser.itemRunTime;
            //this.pxlEnv.mapComposerWarpPass.needsSwap=false;
            this.pxlEnv.mapComposerWarpPass.needsSwap=true;
            setTimeout(()=>{
                /*if( this.pxlEnv.currentRoom==this.pxlEnv.mainRoom ){
                    this.pxlEnv.roomComposer.reset();
                    this.pxlEnv.mapComposer.render();
                }else{
                    this.pxlEnv.mapComposer.reset();
                    this.pxlEnv.roomComposer.render();
                }*/
                this.pxlEnv.mapComposer.render();
                this.pxlEnv.roomComposer.render();
                setTimeout(()=>{
                    this.pxlEnv.mapComposerWarpPass.needsSwap=false;
                    this.pxlEnv.mapComposerWarpPass.enabled=true;
                    /*if( this.pxlEnv.currentRoom==this.pxlEnv.mainRoom ){
                        this.pxlEnv.roomComposer.reset();
                    }else{
                        this.pxlEnv.mapComposer.reset();
                    }*/
                },500);
            },500);
            /*this.pxlEnv.mapComposer.render();
            this.pxlEnv.mapComposerWarpPass.enabled=!this.pxlEnv.mapComposerWarpPass.enabled;
            this.pxlEnv.mapComposer.render();*/
            //this.pxlEnv.roomComposer.render();
            //this.pxlEnv.mapComposer.render();
        }else{
            return false;
        }
        this.pxlGuiDraws.buildItemHud(curName,text);
        if( !this.pxlDevice.mobile ){
            this.pxlUser.itemGroupList[curNameBase].visible=false;
        }
        this.pxlUser.itemInactiveCmd.push( finCmd );
        this.pxlUser.itemActiveTimer.push(timer);
        this.pxlUser.itemActiveList.push(text);
        return true; // Don't stand upon item collision object
    }
    
////////////////////////////////////
// Camera Positional Functions   //
//////////////////////////////////

  // Flip between free roaming or static camera
  //   Run this through pxlNav's trigger system, trigger --
  //     pxlNav.trigger("Camera","Roam")
  //      -or-
  //     pxlNav.trigger("Camera","Static")
  toggleMovement( canMoveVal=null ){
    if(canMoveVal == null){
      canMoveVal=!this.canMove;
    }
    this.canMove = canMoveVal;
  }

  /**
   * Updates the movement based on the current time.
   * Appling down directional key values to camera movement array
   * @param {number} curTime - The current time.
   */
  updateMovement(curTime){

    // Check if camera is in Roam or Static mode
    if( !this.canMove ){ return; }


    let rate=[0,0];//
    let dir=[...this.pxlDevice.directionKeysPressed];
    let strafe=0;
    let dolly=0;
    // Get millisecond time differences so camera movement is independant of FPS
    let deltas=[ (curTime-this.pxlDevice.keyDownCount[0]), (curTime-this.pxlDevice.keyDownCount[1]) ]; // 1.000 seconds

    // Array entry
    let easingMode = this.mobile ? 1 : 0;

    // Check if either Left or Right direction keys are pressed
    //  Default: rate[0] is strafing movement
    //    If tank controls are enabled, rate[0] drives rotation rate
    // this.pxlQuality.settings.leftRight == False : Tank Controls;  True : Strafing
    //   TODO : Yeah, I know.  There is a TODO in QualityController.js to decouple movement settings
    if((dir[0]+dir[2])==1){
      strafe=dir[2]-dir[0];
      // Subtract forward/back from strafing movement to reduce diagonal super-speed
      let turnRate=this.pxlQuality.settings.leftRight ?  this.cameraEasing[ easingMode ] : ( 1 - Math.min(1, Math.abs(this.cameraMovement[1]*.3)) ) *.5 ;
      rate[0]=( (this.pxlQuality.settings.leftRight ? 1.0 : 6.0) + (deltas[0]*(deltas[0])) * .1 ) * turnRate;
      rate[0]= Math.min( this.pxlUser.moveSpeed, rate[0] ) * this.movementScalar;
    }else{
      // Bother Left AND Right direction keys are pressed, cancel movement
      this.pxlDevice.keyDownCount[0]=curTime;
    }
    
    // Check if either Up or Down direction keys are pressed
    if((dir[1]+dir[3])==1){
      dolly=dir[3]-dir[1];

      // Subtract strafing movement from dolly movement to reduce diagonal super-speed
      let dollyRate=(1- Math.min(1, Math.abs(this.cameraMovement[0]*.07))) * this.cameraEasing[ easingMode ]; 
      rate[1]=( ((deltas[1]*(deltas[1]*3+2+this.pxlUser.moveSpeed))*.5) ) * dollyRate; 
      rate[1]= Math.min( this.pxlUser.moveSpeed, rate[1] ) * this.movementScalar;
    }else{
      // Both Up AND Down direction keys are pressed, cancel movement
      this.pxlDevice.keyDownCount[1]=curTime;
    }

    let moveSpeed = ( rate[0]**2 + rate[1]**2 ) ** 0.5;
    
    this.hasMovementLimit=true;
    this.movementMax = 10.0; // Meters per second

    this.cameraMovement[0]+=strafe*rate[0];
    this.cameraMovement[1]+=dolly*rate[1];
  }

  /**
   * Initializes the starting camera position per-frame.
   *   This is ran in `updateCamera()` 
   * @returns {Vector3} - The initial camera position.
   */
  initFrameCamPosition(){
    let curCamPos=this.cameraPos.clone();
    
    if(!this.cameraBooted){ // These should be set from Scene File, if not, initial values
      this.cameraAimTarget.position.set(0, 0, 0);//.add(new Vector3(0,0,0));
      this.cameraPrevPos = new Vector3(curCamPos.clone());
      this.cameraPrevLookAt = new Vector3(0,0,1);
      this.hasMoved = true;
      this.hasRotated = true;
    }else{
      let userMovement;
      /*if(this.pxlDevice.mobile){ // ## When Mobile is implemented, convert to this.cameraMovement
        userMovement=new Vector3(-this.pxlDevice.touchMouseData.curDistance.x*.01,0,-this.pxlDevice.touchMouseData.curDistance.y*.01);
        this.cameraMoveLength=userMovement.length();
      }else{*/
        //userMovement=new Vector3(this.cameraMovement[0],0,this.cameraMovement[1]);
        userMovement=new Vector3((this.pxlQuality.settings.leftRight?this.cameraMovement[0]*.5:0),0,this.cameraMovement[1]);
        this.cameraMoveLength=userMovement.length();
      //}
      userMovement.applyQuaternion(this.camera.quaternion);
      let moveScalar = this.cameraMoveLength*this.cameraMoveLengthMult;

      // Give some base movement to the camera
      //   This way it doesn't ramp up from 0, but from the minimum movement speed
      if( moveScalar!=0 ){
        let minimumMoveSpeed=0.1;
        moveScalar = moveScalar>0 ? Math.max(minimumMoveSpeed,moveScalar) : Math.min(-minimumMoveSpeed,moveScalar);
        userMovement.normalize().multiply(new Vector3(1,0,1)).multiplyScalar(moveScalar);
        curCamPos.add(userMovement);
        
        this.cameraMovement[0] = Math.abs(this.cameraMovement[0])<this.posRotEasingThreshold ? 0 : this.cameraMovement[0]*this.cameraMovementEase;
        this.cameraMovement[1] = Math.abs(this.cameraMovement[1])<this.posRotEasingThreshold ? 0 : this.cameraMovement[1]*this.cameraMovementEase;
        this.hasMoved=true;
      }
      
      //curCamPos=curCamPos.clone().multiplyScalar(this.camPosBlend).add(this.cameraPrevPos.clone().multiplyScalar(1-this.camPosBlend));
      // ## When GravitySource exists, apply cameraMovement offset
      //     Cam movement to Vector3( cm[0], 0, cm[1] ), rotated by Quaternion from Euler Normalize Vector (camPos - collider hit)
      //   DO NOT USE CAMERA QUATERNION, movement doesn't align to camera orientation
      curCamPos.y=this.cameraPos.y + this.cameraJumpVelocity;
      if( this.workerActive ){
          this.cameraJumpVelocity=0; // Additive from the worker thread
      }
    }
        
    this.cameraCross=new Vector3(1,0,0).applyQuaternion( this.camera.quaternion );
        
    return curCamPos;
  }

  /**
   * Updates the camera position based on gravity and collisions.
   *      Delta ( camPos + gravity direction * gravity rate ) > ( Distance camPos to Collider Hit )
   * @param {Vector3} curCamPos - The current camera position.
   * @returns {Vector3} - The updated camera position.
   */
  applyGravity( curCamPos ){
    if( this.hasGravity ){
      //curCamPos=this.checkColliderFail( curCamPos );
      
      let validDist=this.maxStepHeight+this.gravityRate;
      let jumpUpState=(curCamPos.y)<this.nearestFloorHit.y;
      /*if( jumpUpState || this.colliderFail ){
        //curCamPos.x = nPrev.x;
        //curCamPos.y = Math.max( nPrev.y, curCamPos.y-this.gravityRate );
        curCamPos.y = Math.max( 100, curCamPos.y-this.gravityRate );
        //curCamPos.z = nPrev.z;
        if( curCamPos.y == 100 ){//nPrev.y){
          let nPrev=this.nearestFloorHitPrev;
          curCamPos=nPrev.clone();
          this.resetGravity();
        }
        }*/
      if( jumpUpState ){
        let nPrev=this.nearestFloorHitPrev;//.nearestFloorHit;//this.nearestFloorHitPrev;
        //curCamPos.x = nPrev.x;
        curCamPos.y = Math.max( nPrev.y, curCamPos.y);//-this.gravityRate );
        //curCamPos.z = nPrev.z;
        if( curCamPos.y < 0 ){//nPrev.y){
          curCamPos.x=nPrev.x;//clone();
          curCamPos.z=nPrev.z;//clone();
          //this.resetGravity();
          //this.jumpLanding();
        }
      }else{
        curCamPos.y = Math.max( this.nearestFloorHit.y, curCamPos.y - this.gravityRate );
        if( curCamPos.y == this.nearestFloorHit.y && curCamPos.y<this.cameraPrevPos.y ){
          this.jumpLanding();
        }
      }
    }else{
      let distToFloor=curCamPos.distanceTo( this.nearestFloorHit );
      if( distToFloor < this.maxStepHeight){
        curCamPos.y = this.nearestFloorHit.y;
      }else{
        curCamPos=this.cameraPos.clone();
        
        let fallStatus=curCamPos.y > this.nearestFloorHit.y;
        this.hasGravity=fallStatus;
        this.hasMoved = this.hasMoved || fallStatus;
        this.colliderFail= !fallStatus;
        this.workerFunc("jumpLanding");
        //curCamPos=this.checkColliderFail( curCamPos );
      }
    }
    return curCamPos;
  }

  /**
   * Gets the standing height of the user.
   * Head to Foot only - No landing, gravity, or walk-bounce
   * @returns {number} - The standing height.
   */
  getStandingHeight(){
    let retHeight = this.standingHeight;
    if( this.roomStandingHeight.hasOwnProperty(this.pxlEnv.currentRoom) ){
      retHeight = this.roomStandingHeight[this.pxlEnv.currentRoom];
    }
    return retHeight * this.userScale;
  }
  
  /**
   * Gets the user height including jump and walking-bounce offsets.
   * @returns {number} - The user height.
   */
  getUserHeight(){
    // Add bob to movement to appear as taking steps
    let walkBounceAdd=Math.min(1, Math.abs(this.cameraMovement[1]));

    this.walkBouncePerc=this.walkBouncePerc>=1?1:this.walkBouncePerc + this.walkBounceEaseIn * walkBounceAdd;
    this.walkBounce+=walkBounceAdd * this.walkBounceRate;
    this.walkBouncePerc=this.walkBouncePerc * this.walkBounceEaseOut + walkBounceAdd;

    if(this.walkBouncePerc<.03){
      this.walkBouncePerc=0;
      this.walkBounce=0;
      this.walkBounceSeed=Math.random()*2351.3256;
    }
    //let walkBounceOffset=Math.sin(this.walkBounce*.4+this.walkBounceSeed+this.cameraMovement[1]*.2)*this.walkBouncePerc*.3;
    let walkBounceOffset=Math.sin(this.walkBounce+this.walkBounceSeed) * this.walkBouncePerc * this.walkBounceHeight;
    
    let curStandingHeight=this.getStandingHeight() - this.standingHeightGravInfluence + walkBounceOffset;
    
    return curStandingHeight;
  }
  
  
////////////////////////////////////
// Camera Rotational Functions   //
//////////////////////////////////

  /**
   * Applies mobile rotation to the camera.
   * Mobile currently doesn't support movement in Rooms
   * 
   * Currently unused; awaiting mobile-gyroscope implementation
   */
  camApplyMobileRotation(){
    if(this.cameraPose.alpha!=null){ 
      let dtor=0.017453292519943278; //   PI/180
      let halfSqrt=2.23606797749979; // Sqrt(5)
      
      let camPoseQuat=new Quaternion();
      
      let a=this.cameraPose.alpha*dtor+this.cameraPose.alphaOffset+2.1;
      let b=this.cameraPose.beta*dtor;
      let g=this.cameraPose.gamma*dtor;
      let viewNormal=new Vector3(0,0,1);
      let poseQuat=new Quaternion();
      let initPoseQuat=new Quaternion(-halfSqrt,0,0,halfSqrt);
      let euler=new Euler();
      euler.set(b,a,-g,'YXZ'); // Device returns YXZ for deviceOrientation
      camPoseQuat.setFromEuler(euler);
      camPoseQuat.multiply(initPoseQuat);
      camPoseQuat.multiply(poseQuat.setFromAxisAngle(viewNormal,-this.cameraPose.orientation));
      camPoseQuat.normalize();
      
      let smoothedQuat=new Quaternion();
      Quaternion.slerp(this.camera.quaternion,camPoseQuat,smoothedQuat,0.35);

      let cameraLimit = new Euler().setFromQuaternion(smoothedQuat);
      cameraLimit.x = Math.max(-0.95 * Math.PI / 2, Math.min(0.95 * Math.PI / 2, cameraLimit.x));
      smoothedQuat.setFromEuler(cameraLimit);

      this.camera.setRotationFromQuaternion(smoothedQuat);
      
      this.hasRotated=true;
    }
  }

  /**
   * Updates the camera rotation; Look At(Aim) Target
   * 
   * Note: Known bug, static camera rotation is based on the current camera rotation
   *         This causes an inate rotation when the camera is moved to a new position
   */  
  updateRoamCameraRotation(){
    if(this.cameraPose.alpha==null){ // ## Should gyro exist, don't run.  But need to allow controlled look around on mobile
      let xGrav=this.pxlDevice.gyroGravity[2];//*this.gravityRate;//*PI;
      
      let viewNormal=new Vector3(0,0,1);
      let poseQuat=new Quaternion();
      // ## Theres a better place for this....
      this.pxlDevice.touchMouseData.velocity.y=Math.min(this.touchSensitivityLimits, Math.max(-this.touchSensitivityLimits, this.pxlDevice.touchMouseData.velocity.y));
      let euler=new Euler();
      let camPoseQuat;
      if( this.pxlDevice.mobile ){
        euler.set(
            (this.pxlDevice.touchMouseData.netDistance.y/this.pxlDevice.sH*2),
            (this.pxlDevice.touchMouseData.netDistance.x/this.pxlDevice.sW*2),
            0,
            'YXZ'
          ); // Device returns YXZ for deviceOrientation
        camPoseQuat=new Quaternion();
        camPoseQuat.setFromEuler(euler);
        camPoseQuat=this.pxlDevice.touchMouseData.initialQuat.clone().multiply(camPoseQuat);
        //camPoseQuat.multiply(poseQuat.setFromAxisAngle(viewNormal,-this.cameraPose.orientation));
      }else{
        euler.set(
            this.pxlDevice.touchMouseData.velocity.y*.005,
            this.pxlDevice.touchMouseData.velocity.x*.008+xGrav,
            0,
            'YXZ'// Device returns YXZ for deviceOrientation
          ); 
        camPoseQuat=new Quaternion();
        camPoseQuat.setFromEuler(euler);
        //camPoseQuat=this.pxlDevice.touchMouseData.initialQuat.clone().multiply(camPoseQuat);
        camPoseQuat=this.camera.quaternion.clone().multiply(camPoseQuat);
      }
      camPoseQuat.normalize();
      
      let lookAt= new Vector3(0,0,-10).applyQuaternion( camPoseQuat ).add( this.camera.position );
      this.camera.setRotationFromQuaternion(camPoseQuat);
      this.camera.lookAt(lookAt);
      this.camera.up.set( 0,1,0 );

      this.hasRotated=true;
    }
  }
  
  updateStaticCameraRotation(){
      // this.pxlDevice.touchMouseData.startPos;
      // this.pxlDevice.touchMouseData.endPos;
      // this.pxlDevice.touchMouseData.netDistance;
      let blendOut=1;
      if( this.touchBlender ){
        // Camera rotation easing logic-
        blendOut=Math.min(1, Math.max(0, this.pxlTimer.curMS - this.pxlDevice.touchMouseData.releaseTime ));
        blendOut*=blendOut;
        this.pxlDevice.touchMouseData.netDistance.multiplyScalar(1-blendOut);
        this.touchBlender=blendOut<1;
      }else{
        this.pxlDevice.touchMouseData.netDistance.multiplyScalar(.5);
      }
     let euler=new Euler();
      euler.set(
          (this.pxlDevice.touchMouseData.netDistance.y/this.pxlDevice.sH*2),
          (this.pxlDevice.touchMouseData.netDistance.x/this.pxlDevice.sW*2),
          0,
          'YXZ'
        ); // Device returns YXZ for deviceOrientation
      // Limit Up/Down looking
      let camPoseQuat=new Quaternion().clone( this.camera.quaternion );
      camPoseQuat.setFromEuler(euler);
      camPoseQuat=this.camera.quaternion.clone().multiply(camPoseQuat);
      //camPoseQuat.multiply(poseQuat.setFromAxisAngle(viewNormal,-this.cameraPose.orientation));
      camPoseQuat.normalize();
      
      // let smoothedQuat=new Quaternion();
          
      if( this.touchBlender ){
        camPoseQuat.slerp(this.camera.quaternion.clone(),blendOut).normalize();
      }
      let lookAt= new Vector3(0,0,-10).applyQuaternion( camPoseQuat ).add( this.camera.position );
          
      this.camera.setRotationFromQuaternion(camPoseQuat);//smoothedQuat);
      this.camera.lookAt(lookAt);
      this.camera.up.set( 0,1,0 );
      
      this.hasRotated=true;
    }

  /**
   * Locks the camera to look at a target.
   */
  lookAtTargetLock(){
    if(!this.lookAtTargetActive){ return; }
    
    if(this.lookAtTargetActive){
      if(this.lookAtLockFader!=0){
        this.lookAtLockPerc+=(this.lookAtLockFader+Math.min(1,this.pxlDevice.touchMouseData.velocity.length()*.001))*this.lookAtLockFadeRate;
        if(this.lookAtLockPerc<0 || this.lookAtLockPerc>1){
          this.lookAtLockPerc=this.lookAtLockPerc<0?0:1;
          this.lookAtLockFader=0;
        }
        this.lookAtPerc.x = this.lookAtLockPerc;
      }
        
      // If Look At is locked
      //    set the offset in rotation
      //  slerpin some quats!
      if(this.lookAtLockPerc>0){
        let origCamQuat=this.camera.quaternion.clone();
        this.camera.lookAt(this.cameraAimTarget.position);
        let targetCamQuat=this.camera.quaternion.clone();
        if(this.lookAtLockPerc==1){
          this.camera.setRotationFromQuaternion( targetCamQuat );
        }else{
          this.camera.setRotationFromQuaternion( targetCamQuat.slerp(origCamQuat,Math.cos(this.lookAtLockPerc*pi)*.5+.5) );
        }

        this.hasRotated=true;
      }
    }
  }
  
///////////////////////////////////////////
// Render Effects / Quality Functions   //
/////////////////////////////////////////
  /**
   * Triggers a Room Warp / Portal Screen Effect event.
   * This will initiate the visual effect and set the end warp object and target.
   * The actual warp will be run in the `warpCamRun()` function on following frames.
   * @param {number} [visualType=0] - The type of visual effect.
   * @param {Object} [warpObj=null] - The warp object.
   * @param {string} [target='init'] - The target of the warp.
   */
  warpEventTriggered( visualType=0, warpObj=null, target='init' ){
    if( !this.warpActive ){
      this.pxlEnv.mapComposerWarpPass.needsSwap=true;
      this.warpType=visualType;
      this.warpObj=warpObj;
      this.warpTarget=target;
      this.warpActive=true;
      this.pxlEnv.initWarpVisual( visualType );
    }
  }
  /**
   * Runs the room warping camera effects.
   */
  warpCamRun(){
    if(this.warpType==0){
      this.setToObj( this.warpObj );
    }else if(this.warpType==1){
      let init=this.warpTarget=='init';
      this.warpToRoom( this.warpObj, init, this.warpTarget );
    }
    this.pxlEnv.setExposure( this.uniformScalars.exposureUniformBase );
    this.warpObj=null;
    this.warpTarget=null;
    this.warpActive=false;
        
  }

  /**
   * Updates low-quality render events.
   */
  lowQualityUpdates(){
    if(this.HDRView){
      let uPitch=new Vector3(0,0,-1).applyQuaternion( this.camera.quaternion );
      let uRot=uPitch.clone().multiply(new Vector3(1,0,1)).normalize();
      let ptr=0.1591549430918955;
      
      // Update shader uniforms -
      this.camRotPitch.set(
        -Math.atan2(uRot.x,uRot.z)*ptr,
        uPitch.y*.5 );
    }
  }

  /**
   * Updates mid-quality render events.
   */
  midQualityUpdates(){
    // Trailing Effects; Fake Motion Blur
    if( this.pxlQuality.settings.motion ){ // Don't run blur pass if the quality setting is under 50%
      let shaderCamRot=new Vector3(0,0,0);
      shaderCamRot.applyQuaternion(this.camera.quaternion);//.add(camOrigQuat).multiplyScalar(.5);
      this.camRotXYZ.multiplyScalar(.8).add( shaderCamRot.multiplyScalar(.2) );
      
      let viewDirection;
      if(this.pxlDevice.mobile){
        let sWHalf = sW*.5
        let sHHalf= sH*.5;
        let  fromWorldPos=new Vector3(0,0,10);
        let  toWorldPos=new Vector3(0,0,10);
        //fromWorldPos.applyMatrix4( this.camera.matrixWorld.clone() ).project(this.camera);
        //toWorldPos.applyMatrix4( this.prevWorldMatrix ).project(this.camera);
        fromWorldPos.applyQuaternion( this.camera.quaternion.clone() ).project(this.camera);
        toWorldPos.applyQuaternion( this.prevQuaternion ).project(this.camera);
      
        fromWorldPos.x=(fromWorldPos.x+1)*sWHalf;
        fromWorldPos.y=-(fromWorldPos.y-1)*sHHalf;
        toWorldPos.x=(toWorldPos.x+1)*sWHalf;
        toWorldPos.y=-(toWorldPos.y-1)*sHHalf;
        viewDirection=toWorldPos.clone().sub(fromWorldPos.clone()).multiplyScalar(.6).multiply(new Vector3(this.pxlDevice.screenRes.x,this.pxlDevice.screenRes.y,0));
        let motionBlurMaxDist=.1;
        if(viewDirection.length>motionBlurMaxDist){
          viewDirection.normalize().multiplyScalar(motionBlurMaxDist);
        }
        
        //viewDirection=this.pxlDevice.touchMouseData.velocityEase.clone().multiplyScalar( Math.max(this.screenRes[1],this.screenRes[0]) );
      }else{
        //viewDirection=this.pxlDevice.touchMouseData.velocityEase.clone().multiplyScalar( Math.max(this.pxlDevice.screenRes.x,this.pxlDevice.screenRes.y) );
        viewDirection=this.pxlDevice.touchMouseData.velocity.clone().multiplyScalar( Math.max(this.pxlDevice.screenRes.x,this.pxlDevice.screenRes.y) );
      }
      let toDir=new Vector2( viewDirection.x, -viewDirection.y);
      let blurDir=new Vector2(0,0).lerpVectors( this.pxlEnv.blurDirPrev, toDir, .85 );
      
      // Update motionBlur direction uniforms -
      this.pxlEnv.blurDirPrev.set( this.pxlEnv.blurDirCur );
      this.pxlEnv.blurDirCur.set( blurDir );
    }
  }
  
///////////////////////////////////////////////////////
// WebSocket Emit for Position and Rotation Changes //
/////////////////////////////////////////////////////
  // Notify Server of Position / Rotation Changes
  /**
   * Emits camera transforms to the server.
   * NETWORKING HAS BEEN REMOVED, you'll need to implement your own server-side logic.
   * @param {Vector3} cameraPos - The camera position.
   * @param {number} standingHeight - The standing height.
   * @param {boolean} [force=false] - Whether to force the emission.
   */
  emitCameraTransforms( cameraPos, standingHeight, force=false ){
    // Networking scripting removed
  }
  /**
   * Jog the server memory with the current camera position.
   *   Originally the server would use this event to update remote client's positions of the local user.
   *   Also as a server-side sanity check that the user is in the correct "chat" room and other data that may have gone stale.
   * You'll need to implement your own usage of this function with server-side logic.
   * CURRENTLY UNUSED
   */
  jogServerMemory(){
    let curCamPos=this.cameraPos.clone();
    let standingHeight=this.getUserHeight();
    this.emitCameraTransforms( curCamPos, standingHeight, true );
  }
  
///////////////////////////////////
// Main Camera Update Function  //
/////////////////////////////////
  /**
   * Main update function for the camera.
   */
  updateCamera(){
    //this.updateStaticCameraRotation();
    //let velEaseMag=this.pxlDevice.touchMouseData.velocityEase.length();
    let velEaseMag = this.pxlDevice.touchMouseData.velocity.length();
    this.hasRotated = this.hasRotated || velEaseMag > 0;
    this.camUpdated = this.camUpdated || this.hasRotated;

    // Fade out touchMouseData, likely to be removed in later versions
    this.pxlDevice.touchMouseData.curFadeOut.multiplyScalar( .7 );

    // Check if the camera has been updated; step camera values, apply gravity, check for colliders, and interact with objects
    if( this.camUpdated ){ // || this.pxlDevice.touchMouseData.active){// || this.lookAtLockPerc>0 ){ // ## Not using any cam locking yet
      
      // Camera checks are initiating
      this.camUpdated=false;
      
      let didUpdate=false;
        
      this.updateDeviceValues( velEaseMag );
      // TODO : Enable when User class is updated
      //this.pxlUser.localUserTurned=this.pxlDevice.touchMouseData.velocity.length() == 0;
      
      this.prevQuaternion.copy( this.camera.quaternion );
      //this.prevWorldMatrix.set( this.camera.matrixWorld ); // Only used if running higher quality motion blur, not needed
      
      // For Gyro enabled devices; Mobile / Tablet / Surface devices
      // ## Work in progress, waste of calculations acurrently
      //this.camApplyMobileRotation();

      let cameraPos=this.initFrameCamPosition();
      
      // Appy Gravity Height Offset
      let standingHeight=this.getUserHeight();
      
      // Movement checks
      if( this.hasMoved || this.hasGravity ){//&& this.canMove ){

        // Check if the camera is in a valid position
        cameraPos=this.colliderCheck( cameraPos );
        

        // If in air, gravity grows 
        //   This only updates gravity prior to jump calculations
        // User vertical based calculations are ran in `applyGravity()`
        this.updateGravity( this.pxlTimer.deltaTime );
      
        // When Jumping / Falling, Collion Hit Position and Object are marked as Invalid
        if( !this.colliderValid && !this.colliderValidityChecked ){
          // Check if within maxStepHeight+gravityRate distance of collider hit position
          this.jump=this.checkColliderValid( cameraPos ); // Sets colliderValid 
        }else{
          this.jump=0;
        }
        
        this.eventCheckStatus=true;
              
        // Apply gravity rate to current camera position
        cameraPos=this.applyGravity(cameraPos);

        // Check length of Camera Movement, `**.5` is the square root of the sum of the squares
        // TODO : Implement when User class is updated
        //this.pxlUser.localUserMoved= this.hasGravity || ((this.cameraMovement[0]**2 + this.cameraMovement[1]**2) ** .5) > 0;
        
            
        this.cameraPrevPos=this.cameraPos.clone();
        this.cameraPos=cameraPos.clone();
        didUpdate = this.cameraPos.distanceTo(this.cameraPrevPos) > 0;
        cameraPos.y+=standingHeight+this.cameraJumpHeight;
        this.camera.position.copy(cameraPos);
      }

      // Performing different rotation logic based on if the camera is in Roam or Static mode
      //   Roaming orients the camera up in Y
      //   Static keeps the camera oriented with Camera Position -to- LookAt cross product
      //    `cross( cross( normalized(LookAt-Pos), Up), Up )`
      if( this.hasRotated && this.canMove ){ // Roam Camera Mode
        this.updateRoamCameraRotation();
        didUpdate = didUpdate || this.hasRotated;
      }else if( this.hasRotated ){ // Static Camera Mode
        this.updateStaticCameraRotation();
        didUpdate = didUpdate || this.hasRotated;
      }
      //this.lookAtTargetLock(); // Camera lookAt target locking
      
      if( didUpdate ){
        this.camera.updateMatrixWorld(); // ## Only needed for lobby geo... Fix
        
        this.emitCameraTransforms( cameraPos, standingHeight );
      }
      
      // Calculations completed, reset flags
      this.hasMoved = false;
      this.hasRotated = false;

      this.cameraBooted=true;

    }/*else{
      // TODO : User class still not updated to utilize these
      this.pxlUser.localUserMoved=false;
      this.pxlUser.localUserTurned=false;
    }*/
  }


  // -- -- --

  // pxlNav Callbacks
  //   `event` should be of `pxlEnum.CAMERA_EVENT` type
  subscribe( event, callback ){
    if( !this.callbacks.hasOwnProperty(event) ){
      this.callbacks[event] = [];
    }
    this.callbacks[event].push( callback );
  }

  emit( event, data ){
    if( this.callbacks.hasOwnProperty(event) ){
      this.callbacks[event].forEach( (callback) => {
        callback( data );
      });
    }
  }

  // -- -- --

}