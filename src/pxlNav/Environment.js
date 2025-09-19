// -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
// --   The Core pxlNav Engine File          --
// --    -- -- -- -- -- -- -- --             --
// --  Written by Kevin Edzenga; 2020-2024   --
// --    Using js as its backbone      --
// --                                        --
// --  The 'Environment' class manages       --
// --    engine management & render stack    --
// --  This is the class that interprets     --
// --    the rooms found in -                --
// --     ./Source/js/pxlRooms               --
// --  To make a custom room,                --
// --    See the 'templateRoom' project      --
// --                                        --
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- --




import {
  Vector2,
  Vector3,
  WebGLRenderTarget,
  RGBAFormat,
  LinearFilter,
  DepthTexture,
  DepthFormat,
  UnsignedShortType,
  FloatType,
  HalfFloatType,
  Scene,
  Group,
  Color,
  FogExp2,
  ShaderMaterial,
  FrontSide,
  LinearSRGBColorSpace,
  PlaneGeometry,
  DoubleSide,
  Mesh
} from "three";

import { ANTI_ALIASING, VERBOSE_LEVEL, COLLIDER_TYPE } from "./core/Enums.js";
import { pxlOptions } from "./core/Options.js";



// TODO : This class needs breaking up into BaseEnvironment & MainEnvironment expand

/**
 * @namespace pxlEnv
 * @description pxlNav Environment
 */
export class Environment{
  constructor( options, mainRoom='Default', mobile ){
    this.engine=null;
    this.scene=null;
    this.parentGroupList={};
    this.parentGroupList[mainRoom]=[];
    this.parentNameList=[];
    this.pxlOptions=options;
    this.pxlRendering=null;



    // -- -- -- --

    // TODO : Move to pxlQuality, when I finally get to that module
    this.prevRenderMS=0;
    this.prevRuntimeMS=0;
    this.nextRenderMS=0;

    // Max frame rate - 
    this.fps = 30;
    if( this.pxlOptions.fps.hasOwnProperty("mobile") ){
      this.fps = mobile ? this.pxlOptions.fps.mobile : this.pxlOptions.fps.pc;
    }else if( this.pxlOptions.fps.hasOwnProperty("Mobile") ){ // Legacy
      this.fps = mobile ? this.pxlOptions.fps.Mobile : this.pxlOptions.fps.PC;
    }
    this.renderInterval = 1.0 / this.fps;

    // -- -- -- --

    let pxlRoomName = "Default";
    if( this.pxlOptions.hasOwnProperty("pxlRoomName") ){
      pxlRoomName = this.pxlOptions.pxlRoomName;
    }else{
      pxlRoomName = mainRoom || "Default";
    }

    this.pxlRoomAbsRoot = pxlRoomName;
    let splitRoot = pxlRoomName.split("/");
    splitRoot.splice(0,1);
    splitRoot = splitRoot.join("/");
    pxlRoomName = pxlRoomName.startsWith('./') ? pxlRoomName.slice(1) : pxlRoomName;
    
    if( this.pxlOptions.hasOwnProperty("pxlRoomRoot") ){
      this.pxlRoomLclRoot = this.pxlOptions.pxlRoomRoot;
    }else{
      this.pxlRoomLclRoot = "./"+pxlRoomName.split("/").pop().join("/");
    }
    
    this.mainRoom=mainRoom; // Main environment room
    this.bootRoom=mainRoom; // Room to start pxlNav in
    this.bootLocation=null; // Camera Position to start pxlNav at
    this.currentRoom=mainRoom; // Current residing room
    this.roomNameList=[mainRoom]; // Room name list
    this.roomSubList={};
    this.roomSceneList={}; // Room Object list; [ Environment Object, ... ]
    this.roomSceneList[mainRoom]=this;
    this.roomPostGuiCalls=[];
    this.jmaCheckConnection=false;
        
    this.checkContext=0;
    this.activeContext=false;
    
    this.warpPortalTextures={};
    this.warpZoneRenderTarget=null;
    this.currentAudioZone=0;
    
    this.pxlUtils=null;
    this.pxlEnums=null;
    this.pxlTimer=null;
    this.pxlAnim=null;
    this.pxlColliders=null;
    this.pxlAutoCam=null;
    this.pxlAudio=null;
    this.pxlFile=null;
    this.pxlVideo=null;
    this.pxlQuality=null;
    this.pxlUser=null;
    this.pxlShaders=null;
    this.pxlDevice=null;
    this.pxlCamera=null;
    this.pxlGuiDraws=null;
    
    
    this.cloud3dTexture=null;
    this.softNoiseTexture=null;
    this.detailNoiseTexture=null;
    this.chroAberUVTexture=null;
    this.chroAberUVAlpha=null;
    this.blockAnimTexture=null;
    this.userScreenIntensity=new Vector2(0,.8); // User Screen Multi, x=Base Color Mult, y=Added Boost
    this.portaluserScreenIntensity=new Vector2(1,0);
    this.portalMtlRate=.7;
    this.mobile=mobile;
    
    this.camNear=.1;
    this.camFar=5000;
    
    this.fogMult = new Vector2(0,0);
    this.fogColor=new Color(.07,.07,.10);//new Color(.07,.07,.10);
    this.fogColorSky=new Color(.1,.1,.12);
    this.fogExp=.0003;
    this.fog=new FogExp2( this.fogColor, this.fogExp);

    this.listener=null;
    this.posted=false;
    this.postIntro=false;
    
    this.camLocation = {};
    this.camInitPos=new Vector3(0,15,0);
    this.camInitLookAt=new Vector3(0,15,0);
    this.camThumbPos=new Vector3(0,0,0);
    this.camThumbLookAt=new Vector3(0,20,0);
    this.camReturnPos=new Vector3(0,0,0);
    this.camReturnLookAt=new Vector3(0,0,0);
    this.camLobbyPos=new Vector3(0, 15, 0);
    this.camLobbyLookAt=new Vector3(0, 15, -100);
    this.pxlCamFOV={ 'PC':60, 'MOBILE':80 };
    this.pxlCamZoom=1;
    this.pxlCamAspect=1;
    this.pxlCamNearClipping = this.camNear;
    this.pxlCamFarClipping = this.camFar;
    
    this.groupList=[];
    this.geoList=[];
    this.geoLoadList=[]; // 0 Not loaded, 1 Loaded, 2 Loaded and Processed (Setting Dependants)
    this.geoLoadListComplete=0;
    this.lightList=[];
    this.returnPortalGlowList=[];
    this.roomWarpVisuals={};
    this.proximityGeo=null;
    this.userAvatarGroup=new Group();
    
    // ## Warp visuals to dict
    this.warpVisualActive=false;
    this.warpVisualMaxTime=[1.5,1];
    this.warpVisualStartTime=0;
    this.warpVisualFader=new Vector2(0,1);
    this.warpVisualCmd=null;

    this.exposureShiftActive=false;

    this.delayComposer=null;
    this.delayPass=null;
    
    this.chroAberMult=new Vector2(1,0);
    this.blurDirCur=new Vector2(0,0);
    this.blurDirPrev=new Vector2(0,0);
    
    this.roomComposer=null;
    this.roomRenderPass=null;
    this.roomBloomPass=null;
    this.glowPass=null;
    
    this.blurComposer=null;
    this.glowPassMask = new Vector2(1.0,0.0);
    
    this.objectClickable=[];
    this.objectClickableObjectList={};
    this.clickablePrevActiveObject=null;
        
    this.promoClickable=[];
    this.promoClickableObjectList={};
    this.promoPrevActiveObject=null;
    this.promoClickableLinks={};

    // Test Web Cam
    this.remoteVideoTextureList=[];
    this.remoteUserNameList=[];
    this.remoteUserMediaList={};
    this.remoteUserVideoList=[];
    this.remoteUserAudioList=[];
    this.camScreenData={
      count:0,
      prevCount:0,
      checkUserCount:true,
      checkVideoStatus:true,
      findCamCount:()=>{},
      videoObjectList:[],
      screenGeoList:[],
      screenClickable:[],
      screenMtlUniforms:[],
      userDataList:[],
      camFindInfoList:[]
    };
    
    this.curUserCount=0;
    this.prevUserCount=0;

    this.emit=(type,value)=>{};
    
  }
  
  setDependencies( pxlNav ){
    this.scene=pxlNav.scene;
    this.pxlUtils=pxlNav.pxlUtils;
    this.pxlEnums=pxlNav.pxlEnums;
    this.pxlTimer=pxlNav.pxlTimer;
    this.pxlAnim=pxlNav.pxlAnim;
    this.pxlRendering=pxlNav.pxlRendering;
    this.pxlColliders=pxlNav.pxlColliders;
    this.pxlAutoCam=pxlNav.pxlAutoCam;
    this.pxlAudio=pxlNav.pxlAudio;
    this.pxlFile=pxlNav.pxlFile;
    this.pxlVideo=pxlNav.pxlVideo;
    this.pxlQuality=pxlNav.pxlQuality;
    this.pxlUser=pxlNav.pxlUser;
    this.pxlShaders=pxlNav.pxlShaders;
    this.pxlDevice=pxlNav.pxlDevice;
    this.pxlCamera=pxlNav.pxlCamera;
    this.pxlGuiDraws=pxlNav.pxlGuiDraws;
    this.emit=pxlNav.emit.bind(pxlNav);
  }
  
  log( ...msg ){
    if( this.pxlOptions.verbose > VERBOSE_LEVEL.INFO ){
      console.log( msg );
    }
  }

  debug( ...msg ){
    if( this.pxlOptions.verbose > VERBOSE_LEVEL.DEBUG ){
      console.log( msg );
    }
  }
  warn( ...msg ){
    if( this.pxlOptions.verbose > VERBOSE_LEVEL.WARN ){
      console.warn( msg );
    }
  }
  error( ...msg ){
    if( this.pxlOptions.verbose > VERBOSE_LEVEL.ERROR ){
      console.error( msg );
    }
  }

  // Function required
  init(){

    let optionKeys=Object.keys( this.pxlOptions );
    let defaultKeys=Object.keys( pxlOptions );
    defaultKeys.forEach( (k)=>{
      if( !optionKeys.includes( k ) ){
        this.pxlOptions[k]=pxlOptions[k];
      }
    });

    //this.setExposure( 0 );
    let subList=Object.keys( this.roomSubList );
    subList.forEach( (s)=>{
        this.roomSubList[ s ].init();
    });
  }
    
  boot(){
    //this.pxlQuality.attachModule( this );
  }
    
  setBootRoom(bootRoom, bootLocation){
      this.bootRoom=bootRoom;
      this.bootLocation=bootLocation;
  }
    
  postBoot(){
		
		this.pxlGuiDraws.togglePageDisplay();

    this.roomSceneList[this.bootRoom].start();
    
    this.posted=true;

    //this.buildSnow();

    // Trigger Mobile or PC How-To 
    if( this.pxlOptions.showOnboarding ){
      if( this.pxlDevice.mobile || this.pxlAutoCam.enabled){
        this.pxlGuiDraws.toggleMobileWelcome(true);
      }else{
        this.pxlGuiDraws.iconEvent( "click", this.pxlGuiDraws.hudIcons.helpIcon, "help" );
      }
    }
  }
    

  postHelpIntro(){
    // If the device is a computer, without autocam, send player details to the server
    //   TODO : This will need to be accessible from the room object and set-up networking as an extention
    if( !this.pxlDevice.mobile && !this.pxlAutoCam.enabled ){
      this.pxlCamera.jogServerMemory();
    
    // If the device is a mobile, or autocam is enabled,
    //   Trigger a valid collider to allow the camera to be placed.
    }else{
      this.pxlCamera.colliderValid=true;
      this.pxlCamera.eventCheckStatus=true;
      this.pxlCamera.colliderShiftActive=true;
      this.pxlCamera.nearestFloorObjName="mobile";
      this.pxlCamera.colliderCurObjHit="AudioTrigger_2";
      this.pxlCamera.proximityScaleTrigger=true;
      this.exposureShiftActive=true;
      
      // TODO : Media (audio, video, music) needs to be an setting on the pxlOptions object
      if( !this.pxlDevice.mobile ){
        this.pxlAudio.play();
        setTimeout( ()=>{
          this.pxlAudio.initPlay();
        },100);
      }
    }
    this.postIntro=true;
  }

  start(){
    this.init();
  }
    
  step(){
        
    // ## Should just have a stepper system set up...
    //      Easier for modular installations
    this.pxlTimer.step();
    this.pxlAudio.step();
    this.pxlQuality.step();
    this.pxlDevice.step();
    if( this.pxlAutoCam.step() ){
        this.pxlCamera.step();
    }
    this.pxlGuiDraws.step();

    this.stepWarpPass();
        
    if( this.pxlTimer.msRunner.x > this.checkContext && this.activeContext ){
      this.checkContext=this.pxlTimer.msRunner.x+1;
      let tmpCanvas=document.createElement('canvas');
      let ctxVal=false;
      try{
        ctxVal=!!tmpCanvas.getContext('webgl');
      }catch(err){
        this.activeContext=true;
        this.pxlGuiDraws.pxlNavCanvas.style.display='none';
      }
      if( !ctxVal ){
        console.warn("WebGL Context lost, reloading pxlNav");
      }
    }
    
    //if( this.pxlDevice.mobile && this.exposureShiftActive ){
      //this.pxlCamera.colliderShiftActive=!(this.pxlCamera.colliderAdjustPerc===1 || this.pxlCamera.colliderAdjustPerc===0);
      //this.pxlRendering.updateCompUniforms(curExp);
    //}

    this.emit( "step", {
      'time': this.pxlTimer.curMS,
      'delta': this.pxlTimer.msRunner.y,
    });

  }
  
  // Function required, stoping functions
  async stop(){
    this.setExposure( 0 );
    let subList=Object.keys( this.roomSubList );
    subList.forEach( (s)=>{
      this.roomSubList[ s ].stop();
    });
  }
  
  loadRoomByName( roomName ){
    let roomListNames = Object.keys( this.roomSceneList );
    if( roomListNames.includes( roomName ) ){
      let roomObj = this.roomSceneList[ roomName ];
      this.loadRoom( roomObj );
    }else{
      this.warn("Room '"+roomName+"' not found, cannot load.");
    }
  }

  loadRoom(roomObj){
    return new Promise( async (resolve, reject) => {

      let roomName = roomObj.roomName;

      this.log("Loading Room - ", roomName);
      
      try {
        // Updated in v1.0.1 to use RoomEnvironment class objects
        //   This means the rooms must be imported as modules and passed to pxlNav when built

        /*let roomObj = new module[roomName]( 
          roomName, 
          `${this.pxlRoomLclRoot}/${roomName}/`, 
          this.pxlTimer.msRunner, 
          null, 
          null, 
          this.cloud3dTexture
        );*/
        roomObj.setDependencies( this );

        roomObj.camera=this.pxlCamera.camera;
        roomObj.scene=new Scene();
        if( !roomObj.userAvatarGroup ){
            roomObj.userAvatarGroup=new Group();
        }
        roomObj.scene.add( roomObj.userAvatarGroup );
          
        var options = {
            format : RGBAFormat,
            antialias: false,
            sortObjects:true,
            alpha:true,
            type : /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType
        };
        
        roomObj.scene.renderTarget=new WebGLRenderTarget( this.pxlDevice.sW*this.pxlQuality.screenResPerc, this.pxlDevice.sH*this.pxlQuality.screenResPerc,options);
        roomObj.scene.renderTarget.texture.format=RGBAFormat;
        roomObj.scene.renderTarget.texture.minFilter=LinearFilter;
        roomObj.scene.renderTarget.texture.magFilter=LinearFilter;
        roomObj.scene.renderTarget.texture.generateMipmaps=false;
        //roomObj.scene.renderTarget.texture.type=FloatType;
        roomObj.scene.renderTarget.depthBuffer=true;
        roomObj.scene.renderTarget.depthTexture = new DepthTexture( this.pxlDevice.sW*this.pxlQuality.screenResPerc, this.pxlDevice.sH*this.pxlQuality.screenResPerc );
        roomObj.scene.renderTarget.depthTexture.format=DepthFormat;
        //roomObj.scene.renderTarget.depthTexture.type=UnsignedIntType;
        roomObj.scene.renderTarget.depthTexture.type=UnsignedShortType;
        
        // World Pos Target
        //   Remains from a Portal Room Snapshot Display system
        //     Would be desired tech, but needs re-implementation
        // roomObj.scene.renderWorldPos=new WebGLRenderTarget( this.pxlDevice.sW*this.pxlQuality.screenResPerc, this.pxlDevice.sH*this.pxlQuality.screenResPerc,options);
        // roomObj.scene.renderWorldPos.texture.format=RGBAFormat;
        // roomObj.scene.renderWorldPos.texture.minFilter=NearestFilter;
        // roomObj.scene.renderWorldPos.texture.magFilter=NearestFilter;
        // roomObj.scene.renderWorldPos.texture.generateMipmaps=false;
        
        //roomObj.cloud3dTexture=this.cloud3dTexture;
        if( !this.roomNameList.includes( roomName ) ){
          this.roomNameList.push( roomName );
        }
        this.roomSceneList[ roomName ]=roomObj;
        this.debug(this.roomSceneList[ roomName ]);

        resolve(true);
        
      } catch (err) {
        console.error("Error Loading Room - ", roomName);
        console.error("Error details:", err.message);
        if(this.pxlOptions.verbose >= VERBOSE_LEVEL.ERROR){
          console.error("Full error:", err);
        }
        reject(err);
      }
    });
  }
  
  startAllRooms(){
    this.roomNameList.forEach( (roomName)=>{
        this.startRoom( this.roomSceneList[ roomName ] );
    });
  }
  
  startRoom( room ){
    room.active=false;
    room.startTime=this.pxlTimer.msRunner.x;
  }
    
  newSubRoom( roomObject ){
    this.roomSubList[ roomObject.getName() ]=roomObject;
  }
  addToRooms( obj ){
    let roomObjDict={};
    
    this.roomNameList.forEach( (n)=>{
      let dupe=obj.clone();
      this.roomSceneList[ n ].scene.add( dupe );
      roomObjDict[n]=dupe;
    });
    return roomObjDict;
  }
  
  addToRoomLayers( obj, layer=1 ){
    let roomObjDict={};
    
    this.roomNameList.forEach( (n)=>{
      let dupe=obj.clone();
      this.roomSceneList[ n ].scene.add( dupe );
      roomObjDict[n]=dupe;
      dupe.layers.set( layer );
    });
    return roomObjDict;
  }
  
  addToRoomParents( obj, parent ){
    let roomObjDict={};
    
    if( !this.parentNameList.includes( parent ) ){
      this.parentNameList.push( parent );
    }
    
    this.roomNameList.forEach( (n)=>{
      let dupe=obj.clone();
      if( !this.parentGroupList[ n ] ){
        this.parentGroupList[ n ]={};
      }
      if( !this.parentGroupList[ n ][ parent ] ){
        let newGroup = new Group();
        this.parentGroupList[ n ][ parent ]=newGroup;
        this.roomSceneList[ n ].scene.add( newGroup );
      }
      this.parentGroupList[ n ][ parent ].add( dupe );
      roomObjDict[n]=dupe;
    });
    return roomObjDict;
  }
  
  // Initially, main room was loaded as a nexus room
  //   Should see if this is still necessary
  buildRoomEnvironments(){
    
    this.debug("Building Room Environments - ");
    this.debug(this.roomNameList);
    
    this.roomNameList.forEach( (r)=>{
      if( this.roomSceneList[ r ].init ){
        this.roomSceneList[ r ].init();
      }
      if( this.roomSceneList[ r ].build ){
        this.roomSceneList[ r ].build();
      }
    });
  }
  
  getArtistInfo(){
    return null;
  }
    
  setFogHue( orig=[0,0], rot=[1,1] ){
    //let hsl=this.fog.color.getHSL();

    let atanVals=[ rot[0]-orig[0], rot[1]-orig[1] ];
    //let scalar=(atanVals[0]+atanVals[1]);
    //atanVals= [ atanVals[0]/scalar, atanVals[0]/scalar ]
    let hRot=Math.abs(Math.atan2( atanVals[0], atanVals[1] ) * 0.3183098861837907 ); // 1/pi
    
    let scale= (atanVals[0]**2+atanVals[1]**2)**.5 / Math.max(this.pxlDevice.sW, this.pxlDevice.sH);
    this.fog.color.setHSL( hRot, scale*.5+.3, scale*.5 );
    
    if( this.roomSceneList[this.currentRoom] && this.roomSceneList[this.currentRoom].setFog ){
      this.roomSceneList[this.currentRoom].setFog( this.fog.color );
    }
  }
    
  //%=
  // Return Primary Shader Material
  readShader( objShader="" ){
    if( objShader==="script_fog" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
        
      if( this.pxlRendering.mapOverlayHeavyPass.enabled === true ){
        return this.pxlRendering.mapOverlayHeavyPass.material ;
      }else if( this.pxlRendering.mapOverlayPass.enabled === true ){
        return this.pxlRendering.mapOverlayPass.material ;
      }else if( this.pxlRendering.mapOverlaySlimPass.enabled === true ){
        return this.pxlRendering.mapOverlaySlimPass.material ;
      }

    }else if( objShader==="script_dArrows" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.geoList[ "dArrows" ][0].material;
    }else if( objShader==="script_userScreens" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.camScreenData.screenGeoList[0].material;
    }else if( objShader==="script_warpZonePortals" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.returnPortalGlowList[0].material;

    }else if( objShader==="script_lizardking" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.pxlRendering.lizardKingPass.material;
    }else if( objShader==="script_majorTom" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.pxlUser.starFieldPass.material;
    }else if( objShader==="script_fractalSubstrate" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.pxlUser.crystallinePass.material;
    }else if( objShader==="script_fractalEcho" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.pxlRendering.delayPass.material;
        
    }else{
      let geoRead=objShader.split("_");
      geoRead.shift();
      geoRead=geoRead.join("_");
      if( this.geoList[ geoRead ] ){
          this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
          return this.geoList[ geoRead ].material ;
      }
    }
        
        
    //return this.pxlUser.starFieldPass.material;
  }
  setShader( unis, vert, frag ){
        let setShaderMtl;
        
        let objShader=this.pxlGuiDraws.guiWindows["shaderGui"].currentShader;
        if( objShader==="script_fog" ){
            if( this.pxlRendering.mapOverlayHeavyPass.enabled === true ){
                setShaderMtl= this.pxlRendering.mapOverlayHeavyPass.material ;
            }else if( this.pxlRendering.mapOverlayPass.enabled === true ){
                setShaderMtl= this.pxlRendering.mapOverlayPass.material ;
            }else if( this.pxlRendering.mapOverlaySlimPass.enabled === true ){
                setShaderMtl= this.pxlRendering.mapOverlaySlimPass.material ;
            }
        }else if( objShader==="script_dArrows" ){
            this.geoList[ "dArrows" ].forEach( (o)=>{
                setShaderMtl=o.material;
                setShaderMtl.vertexShader=vert;
                setShaderMtl.fragmentShader=frag;
                setShaderMtl.needsUpdate=true;
            });
            return;
        }else if( objShader==="script_userScreens" ){
            this.camScreenData.screenGeoList.forEach( (o)=>{
                setShaderMtl=o.material;
                setShaderMtl.vertexShader=vert;
                setShaderMtl.fragmentShader=frag;
                setShaderMtl.needsUpdate=true;
            });
            return;
        }else if( objShader==="script_warpZonePortals" ){
            this.returnPortalGlowList.forEach( (o)=>{
                setShaderMtl=o.material;
                setShaderMtl.vertexShader=vert;
                setShaderMtl.fragmentShader=frag;
                setShaderMtl.needsUpdate=true;
            });
            return;
            
        }else if( objShader==="script_lizardking" ){
                setShaderMtl=this.pxlRendering.lizardKingPass.material;
        }else if( objShader==="script_majorTom" ){
                setShaderMtl=this.pxlUser.starFieldPass.material;
        }else if( objShader==="script_fractalSubstrate" ){
                setShaderMtl=this.pxlUser.crystallinePass.material;
        }else if( objShader==="script_fractalEcho" ){
                setShaderMtl=this.pxlRendering.delayPass.material;
            
        }else{
            let geoRead=objShader.split("_");
            geoRead.shift();
            geoRead=geoRead.join("_");
            if( this.geoList[ geoRead ] ){
                setShaderMtl = this.geoList[ geoRead ].material ;
            }
        }
        
        if(setShaderMtl){
            setShaderMtl.vertexShader=vert;
            setShaderMtl.fragmentShader=frag;
            setShaderMtl.needsUpdate=true;
        }
  }
  //%
  
  // Load the given texture file from the internal pxlNav 'assetRoot'
  //   Default is "./assets/" from the web root.
  //     Please pass the path to your asset folder when creating your pxlNav object.
  // It would be best if you pass channel count and mods
  //   But you can tell it attempts to mitigate the issue.
    getAssetTexture( assetName, channels=null, mods=null ){
      this.log("Get Internal Texture - ", assetName);
      let curTexturePath = this.pxlUtils.assetRoot + assetName;
      if(!channels){
        let assetSplit = assetName.split(".");
        let assetExt = assetSplit.pop().toLowerCase();
        if( assetExt==="jpg" || assetExt==="jpeg"  ){
          channels=3;
        }else if( assetExt==="png" ){
          channels=4;
        }
      }
      if(!mods){
        mods={"encoding":LinearSRGBColorSpace, "magFilter":LinearFilter, "minFilter":LinearFilter};
      }

      let textureRead = this.pxlUtils.loadTexture( curTexturePath, channels, mods );
      return textureRead;
    }
    
    
    // A screen filled plane to render outside of effect composer passes
    buildBackgroundObject( customUniforms={}, bgVert=null, bgFrag=null){
        let geo = new PlaneGeometry();
        
        let bgUniforms={}
        Object.assign( bgUniforms, customUniforms );
        
        if( bgVert===null || typeof(bgVert)!="string"){
            bgVert=this.pxlShaders.scene.bgScreenVert();
        }
        if( bgFrag===null || typeof(bgFrag)!="string"){
            bgFrag=this.pxlShaders.scene.bgScreenFrag();
        }
        
        let mtl = this.pxlFile.pxlShaderBuilder( bgUniforms, bgVert, bgFrag );
        mtl.side=DoubleSide;
        mtl.depthTest=true;
        mtl.depthWrite=false;
        //mtl.transparent=true;
        let bgMesh = new Mesh( geo, mtl );
        bgMesh.frustumCulled = false;
        
        return bgMesh;
    }
    
  // In-Scene clickables
  clickUserDetect(){
    
    // Current Room Obj
    let curRoomObj = this.roomSceneList[ this.currentRoom ];

    // Cast mouse or touch position to NDC
    let mouseScreenSpace = this.pxlUtils.screenToNDC( this.pxlDevice.mouseX, this.pxlDevice.mouseY, this.pxlDevice.sW, this.pxlDevice.sH );
    
    // Get clickable objects under mouse
    let rayHits={};
    if( curRoomObj?.hasColliderType && curRoomObj.hasColliderType( COLLIDER_TYPE.CLICKABLE ) ){
      let curObjList = curRoomObj.getColliders( COLLIDER_TYPE.CLICKABLE );
      rayHits = this.pxlColliders.castInteractRay( this.currentRoom, curObjList, this.pxlCamera.camera, mouseScreenSpace );
    }

    // Get nearest object hit,
    //   rayHits.order is an array of objects hit, in order of distance
    if( rayHits.hasOwnProperty("order") && rayHits.order.length > 0 ){
      let objHit = rayHits.order[0];
      this.clickableActions(objHit.name);
      return;
    }

    // -- -- --

    // If no clickable object hit, check for promo clickables
    rayHits = {};
    rayHits = this.pxlColliders.castInteractRay( this.currentRoom, this.promoClickable, this.pxlCamera.camera, mouseScreenSpace );

    if(rayHits.hasOwnProperty("order") && rayHits.order.length > 0){
      let promoHit = rayHits.order[0];
      this.promoActions( promoHit );
    }
  }

  clickableActions(action=null){
    if(action==="CallToAction" && this.clickablePrevActiveObject){
      this.pxlGuiDraws.ctaBuildPopup();
      this.objectClickableObjectList[this.clickablePrevActiveObject]['Inactive'].visible=true;
      this.objectClickableObjectList[this.clickablePrevActiveObject]['Hover'].visible=false;
      this.clickablePrevActiveObject=null;
    }
  }
    
  promoActions(pName=null){
        let pLink=pName.userData.video;
        //let pScreen=pName.name;
        
        if( this.promoClickableLinks.hasOwnProperty( pLink ) ){
            var link= window.open( this.promoClickableLinks[pLink], "_blank");
            link.focus();
        }
  }
  // Hover over clickable
  hoverUserDetect(){
    
    // Current Room Obj
    let curRoomObj = this.roomSceneList[ this.currentRoom ];

    // Cast mouse or touch position to NDC
    let mouseScreenSpace = this.pxlUtils.screenToNDC( this.pxlDevice.mouseX, this.pxlDevice.mouseY, this.pxlDevice.sW, this.pxlDevice.sH );
    
    // Get hoverable objects under mouse
    let rayHits={};
    if( curRoomObj?.hasColliderType && (curRoomObj.hasColliderType( COLLIDER_TYPE.CLICKABLE ) || curRoomObj.hasColliderType( COLLIDER_TYPE.HOVERABLE )) ){
      // Combine objectClickable with objectHoverable This may change
      let curObjList = [ ...curRoomObj.getColliders( COLLIDER_TYPE.CLICKABLE ), ...curRoomObj.getColliders( COLLIDER_TYPE.HOVERABLE ) ];
      rayHits = this.pxlColliders.castInteractRay( this.currentRoom, curObjList, this.pxlCamera.camera, mouseScreenSpace );
    }

    // Get nearest object hit,
    //   rayHits.order is an array of objects hit, in order of distance
    if( rayHits.hasOwnProperty("order") && rayHits.order.length > 0 ){
      let objHit = rayHits.order[0];
      this.pxlDevice.setCursor("help");
      if(this.objectClickableObjectList[objHit.name]){
        if(this.clickablePrevActiveObject===null){
          this.clickablePrevActiveObject=objHit.name;
        }
        this.objectClickableObjectList[objHit.name]['Inactive'].visible=false;
        this.objectClickableObjectList[objHit.name]['Hover'].visible=true;
      }
      return;
    }else{
      if(this.clickablePrevActiveObject){
        this.objectClickableObjectList[this.clickablePrevActiveObject]['Inactive'].visible=true;
        this.objectClickableObjectList[this.clickablePrevActiveObject]['Hover'].visible=false;
        this.clickablePrevActiveObject=null;
      }
      this.pxlDevice.setCursor("grab");
    }

    // -- -- --

    // If no clickable object hit, check for promo clickables
    rayHits = {};
    rayHits = this.pxlColliders.castInteractRay( this.currentRoom, this.promoClickable, this.pxlCamera.camera, mouseScreenSpace );

    if(rayHits.hasOwnProperty("order") && rayHits.order.length > 0){
      let promoHit = rayHits.order[0];
      this.pxlDevice.setCursor("alias");
      if(this.promoClickableObjectList[promoHit.name]){
        if(this.promoPrevActiveObject===null){
          this.promoPrevActiveObject=promoHit.name;
        }
        this.promoClickableObjectList[promoHit.name].x=1;
      }
    }else{
      if(this.promoPrevActiveObject){
        this.promoClickableObjectList[this.promoPrevActiveObject].x=.1;
        this.promoPrevActiveObject=null;
      }
      this.pxlDevice.setCursor("grab");
    }
  }


// -- -- -- -- -- -- -- -- -- -- -- //

  // Event Helpers
  sendRoomMessage( roomName, messageType, messageValue ){
    if( this.roomSceneList[ roomName ] ){
      this.roomSceneList[ roomName ].onMessage( messageType, messageValue );
    }
  }


// -- -- -- -- -- -- -- -- -- -- -- //

  buildComposers(){
    this.pxlRendering.buildComposers();
    
    this.mapOverlayHeavyPass=this.pxlRendering.mapOverlayHeavyPass;
    this.mapOverlayPass=this.pxlRendering.mapOverlayPass;
    this.mapOverlaySlimPass=this.pxlRendering.mapOverlaySlimPass;
    this.mapBoxAAPass=this.pxlRendering.mapBoxAAPass;
    this.mapCrossAAPass=this.pxlRendering.mapCrossAAPass;
    this.mapWorldPosMaterial=this.pxlRendering.mapWorldPosMaterial;
    this.mapGlowPass=this.pxlRendering.mapGlowPass;
    this.mapComposer=this.pxlRendering.mapComposer;
    this.mapComposerMotionBlur=this.pxlRendering.mapComposerMotionBlur;
    this.mapComposerGlow=this.pxlRendering.mapComposerGlow;
    this.chromaticAberrationPass=this.pxlRendering.chromaticAberrationPass;
    this.lizardKingPass=this.pxlRendering.lizardKingPass;
    this.mapComposerWarpPass=this.pxlRendering.mapComposerWarpPass;
    this.blurScreenMerge=this.pxlRendering.blurScreenMerge;
  }
  
  setExposure(curExp){
    let animPerc=1;
    //curExp= this.pxlCamera.uniformScalars.curExp + curExp*this.pxlCamera.uniformScalars.brightBase*animPerc; 
    curExp= curExp*animPerc; 
    this.pxlCamera.uniformScalars.exposureUniformBase=curExp;
    // Set scene exposure on post-process composer passes 
    this.pxlRendering.updateCompUniforms(curExp);
  }
  
  stepWarpPass(){
    if( this.warpVisualActive ){
      let curPerc= ( this.pxlTimer.curMS - this.warpVisualStartTime ) / this.warpVisualMaxTime[this.pxlCamera.warpType];
      let fUp=Math.min( 1, curPerc*3 );
      let fDown=Math.min( 1, 3-curPerc*3 );
      
      if(fUp===1 && fDown===1 && this.pxlCamera.warpActive){
        this.pxlCamera.warpCamRun();
      }
      
      this.warpVisualFader.x=fUp;
      this.warpVisualFader.y=fDown;
      if( fDown <= 0){
        this.stopWarpVisual();
      }
    }
  }
  
  checkUserVideoStatus(curId){
  }
    
  remoteUserUpdateMedia( curId, video=false, audio=null){
        //
  }
    
  userRemoveRemoteData( curId ){
      //
  }
    
    

  stepAnimatedObjects(){
    if(this.pxlUser.itemListNames.length > 0){
      this.pxlUser.itemListNames.forEach( (i)=>{
                this.pxlUser.itemList[i].rotation.y=this.pxlTimer.msRunner.x*this.pxlUser.itemRotateRate;
      });
    }
  }

  initWarpVisual( visualType ){
    this.warpVisualActive=true;
    this.warpVisualFader.x=0;
    this.warpVisualFader.y=1;
    this.warpVisualStartTime=this.pxlTimer.curMS;
    
    if( this.mapComposerWarpPass ){
      this.mapComposerWarpPass.enabled=true;
    }
  }
  stopWarpVisual(){
    this.warpVisualActive=false;
    this.warpVisualFader.x=1;
    this.warpVisualFader.y=0;
    
    if( this.mapComposerWarpPass ){
      this.mapComposerWarpPass.enabled= !!this.pxlUser.iZoom;
    }
  }
  
// Function required, but no prep needed
  prepPortalRender(){}
// Function required, but no cleanup needed
  cleanupPortalRender(){}
// Set the Room Warp Portal plane to display the render from that environment
  setPortalTexture(texture, toRoom){
    this.roomWarpVisuals[toRoom].material.map=texture;
  }
  warpPortalQueue(){
    return Object.keys(this.roomSceneList).reverse(); // So .pop'ing goes the correct direction
  }
    
  getSceneSnapshot(curScene){
    let prepRoom=this.roomSceneList[curScene];
    
    //this.pxlCamera.setTransform( prepRoom.camInitPos, prepRoom.camInitLookAt );
    this.pxlRendering.engine.setRenderTarget(prepRoom.warpZoneRenderTarget);
    //this.pxlRendering.engine.clear();
    
    prepRoom.prepPortalRender();
    this.pxlRendering.engine.render(  prepRoom.scene || prepRoom.scene, this.pxlCamera.camera );
    prepRoom.cleanupPortalRender();
    /*
    if( curScene===this.mainRoom ){
      //this.mapRender();
      
      //this.warpPortalTextures[ curScene ] = this.mapComposer.renderTarget1.texture.clone();
      
    }else{
      //prepRoom.step();
    
      prepRoom.prepPortalRender();
      this.pxlRendering.engine.render(  prepRoom.scene, this.pxlCamera.camera );
      prepRoom.cleanupPortalRender();
      
      this.warpPortalTextures[ curScene ] = this.scene.renderTarget.clone();
    
      prepRoom.warpPortalTexture=this.warpPortalTextures[ curScene ];
      //prepRoom.setPortalTexture( prepRoom.warpPortalTexture );
      //prepRoom.setPortalTexture( this.warpPortalTextures[ this.mainRoom ] );
      prepRoom.setPortalTexture( this.cloud3dTexture );//  this.warpPortalTextures[ this.mainRoom ] );
      this.setPortalTexture( this.warpPortalTextures[ curScene ], curScene );
    }*/
    
    this.pxlRendering.engine.setRenderTarget(null);
  
  }

  mapRender(anim=true){
    if(this.pxlTimer.active){
        this.step();
    }
    
    if( this.pxlTimer.runtime > this.nextRenderMS || anim===false ){

      this.prevRenderMS = this.nextRenderMS;
      this.nextRenderMS = this.pxlTimer.runtime + this.renderInterval;


      // Render appropriate room
      this.pxlRendering.stepShaderValues();
      this.stepAnimatedObjects();
      
      // Send out event to allow for any pre-render calculations
      this.emit( "render-prep", {
        'time': this.pxlTimer.runtime
      });
      

      let curRoom=this.roomSceneList[this.currentRoom];
      if(curRoom && curRoom.booted){
        curRoom.step();
        curRoom.camera.layers.disable( this.pxlEnums.RENDER_LAYER.SKY );
        this.pxlRendering.engine.setRenderTarget(curRoom.scene.renderTarget);
        this.pxlRendering.engine.clear();
        this.pxlRendering.engine.render( curRoom.scene, curRoom.camera);
        this.pxlRendering.engine.setRenderTarget(null);
        curRoom.camera.layers.enable( this.pxlEnums.RENDER_LAYER.SKY );
        
        if( false && this.pxlQuality.settings.fog>0 ){
          this.pxlCamera.camera.layers.disable( 1 );
          
          curRoom.scene.overrideMaterial=this.pxlRendering.mapWorldPosMaterial;
          this.pxlRendering.engine.setRenderTarget(this.scene.renderWorldPos);
          this.pxlRendering.engine.clear();
          this.pxlRendering.engine.render( curRoom.scene, this.pxlCamera.camera);
          curRoom.scene.overrideMaterial=null;
        
          this.pxlCamera.camera.layers.enable( 1 );
          this.pxlRendering.engine.setRenderTarget(null);
        }
        
        if( this.mapComposerGlow && ( this.pxlQuality.settings.bloom || this.pxlQuality.settings.fog ) ){ //  || this.pxlQuality.settings.motion ){ 
          this.mapComposerGlow.render();
        }
        
        this.mapRenderBlurStack( curRoom, curRoom.camera, curRoom.scene, this.scene.renderGlowTarget)
        
        this.pxlRendering.roomComposer.render();
        //this.pxlRendering.engine.render( this.roomSceneList[this.currentRoom].scene, this.pxlCamera.camera);
      }
      
      if( this.pxlUser.iZoom ){
        this.delayComposer.render();
      }
    }else if( this.pxlOptions.subFrameCalculations ){
      // Step room calculations for render-independent user input and collision calculations
      let curRoom=this.roomSceneList[this.currentRoom];
      if(curRoom && curRoom.booted){
        curRoom.step();
      }
    }
        
    // Send out event to allow for any post-render calculations
    this.emit( "render-post", {
      'time': this.pxlTimer.runtime
    });
    
    if(this.pxlTimer.active && anim){
      requestAnimationFrame( ()=>{ this.mapRender(); });
    }
  }
  
  mapRenderBlurStack( curRoom, camera, scene, target ){
    if(this.blurComposer){
      if(curRoom.geoList["GlowPass"]){
        curRoom.geoList["GlowPass"].forEach((g)=>{
          if( g.userData.hasOwnProperty('GlowPerc') ){
            let multVal = g.userData['GlowPerc']
            console.log(g.material?.uniforms)
            if( g.material.hasOwnProperty('uniforms') && g.material.uniforms.mult ){
              g.material.uniforms.mult.value = multVal;
            }
          }
        });
        
        if( curRoom.geoList.hasOwnProperty('GlowPassMask') ){
          curRoom.geoList['GlowPassMask'].forEach( (m)=>{
            if( m.material.uniforms && m.material.uniforms.cdMult ){
              m.material.uniforms.cdMult.value = 0;
            }
          });
        }
      }
      
      //this.pxlEnv.pxlEnums.RENDER_LAYER SCENE PARTICLES GLOW
      camera.layers.disable( this.pxlEnums.RENDER_LAYER.SCENE );
      camera.layers.disable( this.pxlEnums.RENDER_LAYER.PARTICLES );
      camera.layers.disable( this.pxlEnums.RENDER_LAYER.SKY );
      
      this.pxlRendering.engine.setRenderTarget(target);
      let bgCd=0x000000;
      let curgb = scene.background.clone()
      scene.background.set( bgCd );
      this.pxlRendering.engine.setClearColor(bgCd, 0);
      //this.pxlRendering.engine.clear();
      this.pxlRendering.engine.render( scene, camera);
      //this.scene.overrideMaterial=null;
      scene.background.r=curgb.r;
      scene.background.g=curgb.g;
      scene.background.b=curgb.b;
      
      camera.layers.enable( this.pxlEnums.RENDER_LAYER.SCENE );
      camera.layers.enable( this.pxlEnums.RENDER_LAYER.PARTICLES );
      camera.layers.enable( this.pxlEnums.RENDER_LAYER.SKY );
      this.pxlRendering.engine.setRenderTarget(null);
      
      if(curRoom.geoList["GlowPass"]){
        curRoom.geoList["GlowPass"].forEach((g)=>{
          if( g.userData.hasOwnProperty('GlowPerc') ){
            if( g.material.hasOwnProperty('uniforms') && g.material.uniforms.mult ){
              g.material.uniforms.mult.value = 1;
            }
          }
        });
        if( curRoom.geoList.hasOwnProperty('GlowPassMask') ){
          curRoom.geoList['GlowPassMask'].forEach( (m)=>{
            if( m.material.uniforms && m.material.uniforms.cdMult ){
              m.material.uniforms.cdMult.value = 1;
            }
          });
        }
      }
      
      this.blurComposer.render();
      this.roomBloomPass.enabled = false;
    }
  }
}
