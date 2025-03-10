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
  LinearSRGBColorSpace
} from "../libs/three/three.module.min.js";

import { ANTI_ALIASING, VERBOSE_LEVEL, COLLIDER_TYPE } from "./core/Enums.js";
import { pxlOptions } from "./core/Options.js";

import { EffectComposer } from '../libs/three/EffectComposer.js';
import { RenderPass } from '../libs/three/RenderPass.js';
import { ShaderPass } from '../libs/three/ShaderPass.js';
import { CopyShader } from '../libs/three/CopyShader.js';
// TODO : Remove all traces of bloom passes, implement Neurous Box Blur passes
import { UnrealBloomPass } from '../libs/three/UnrealBloomPass.js';


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



    // -- -- -- --
    // TODO : Move to pxlQuality, when I finally get to that module
    this.prevRenderMS=0;
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

    // ## Move passes to a dict
    this.stepShaderFuncArr=[];
    this.mapMotionBlurPass=null;
    this.mapCopyMotionBlurPass=null;
    this.mapOverlayHeavyPass=null;
    this.mapOverlayPass=null;
    this.mapOverlaySlimPass=null;
    this.mapBoxAAPass=null;
    this.mapCrossAAPass=null;
    this.mapWorldPosMaterial=null;
    this.mapGlowPass=null;
    this.mapGlowMotionBlur=null;
    this.mapComposer=null;
    this.mapComposerMotionBlur=null;
    this.mapComposerBloom=null;
    this.mapComposerGlow=null;
    this.chromaticAberrationPass=null;
    this.chroAberrationRoomPass=null;
    this.lizardKingPass=null;
    this.lizardKingRoomPass=null;
    this.mapComposerWarpPass=null;
    this.blurScreenMerge=null;
    this.pxlRenderSettings={
      'exposure':1.0,
      'mult':( mobile ? 1.0 : 1.0 ),
      'bloomStrength':0.5,
      'bloomThresh':.6,
      'bloomRadius':.05,
    }
    this.exposureShiftActive=false;

    this.delayComposer=null;
    this.delayPass=null;
    
    this.chroAberMult=new Vector2(1,0);
    this.blurDirCur=new Vector2(0,0);
    this.blurDirPrev=new Vector2(0,0);
    
    this.shaderPasses={};
    
    this.roomComposer=null;
    this.roomRenderPass=null;
    this.roomBloomPass=null;
    this.roomGlowPass=null;
    
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
  
  log( msg, level=VERBOSE_LEVEL.INFO ){
    if( this.pxlOptions.verbose > VERBOSE_LEVEL.INFO ){
      console.log( msg );
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
      try{
        let ctxVal=!!tmpCanvas.getContext('webgl');
      }catch(err){
        this.activeContext=true;
        this.pxlGuiDraws.pxlNavCanvas.style.display='none';
      }
    }
    
    //if( this.pxlDevice.mobile && this.exposureShiftActive ){
      //this.pxlCamera.colliderShiftActive=!(this.pxlCamera.colliderAdjustPerc==1 || this.pxlCamera.colliderAdjustPerc==0);
      //this.updateCompUniforms(curExp);
    //}
  }
  
  // Function required, stoping functions
  async stop(){
    this.setExposure( 0 );
    let subList=Object.keys( this.roomSubList );
    subList.forEach( (s)=>{
      this.roomSubList[ s ].stop();
    });
  }
  
  loadRoom(roomName){
    return new Promise( (resolve, reject) =>{

      this.log("Loading Room - ", roomName);
      
      let curImportPath=`${this.pxlRoomLclRoot}/${roomName}/${roomName}.js`;
      
      import( curImportPath )
        .then((module)=>{
          let roomObj=new module[roomName]( roomName, `${this.pxlRoomLclRoot}/${roomName}/`, this.pxlTimer.msRunner, null, null, this.cloud3dTexture);
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
          
          roomObj.cloud3dTexture=this.cloud3dTexture;
          if( !this.roomNameList.includes( roomName ) ){
            this.roomNameList.push( roomName );
          }
          this.roomSceneList[ roomName ]=roomObj;
      
          resolve(true);
        })
        .catch((err)=>{
          if(this.pxlOptions.verbose >= VERBOSE_LEVEL.ERROR){
            console.log(err);
          }
          reject(err);
        });
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
    
    this.log("Building Room Environments");
    this.log(this.roomNameList);
    let loadPromisList=[];
    
    this.roomNameList.forEach( (r)=>{
      this.roomSceneList[ r ].init();
      if( this.roomSceneList[ r ].build ){
        this.roomSceneList[ r ].build();
      }
    });
  }
  
  getArtistInfo(){
    return null;
  }
    
  setFogHue( orig=[0,0], rot=[1,1] ){
    let hsl=this.fog.color.getHSL();

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
    if( objShader=="script_fog" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
        
      if(this.mapOverlayHeavyPass.enabled==true){
        return this.mapOverlayHeavyPass.material ;
      }else if(this.mapOverlayPass.enabled==true){
        return this.mapOverlayPass.material ;
      }else if(this.mapOverlaySlimPass.enabled==true){
        return this.mapOverlaySlimPass.material ;
      }
    }else if( objShader=="script_dArrows" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.geoList[ "dArrows" ][0].material;
    }else if( objShader=="script_userScreens" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.camScreenData.screenGeoList[0].material;
    }else if( objShader=="script_warpZonePortals" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.returnPortalGlowList[0].material;
        
    }else if( objShader=="script_lizardking" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.lizardKingPass.material;
    }else if( objShader=="script_majorTom" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.pxlUser.starFieldPass.material;
    }else if( objShader=="script_fractalSubstrate" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.pxlUser.crystallinePass.material;
    }else if( objShader=="script_fractalEcho" ){
      this.pxlGuiDraws.guiWindows["shaderGui"].currentShader=objShader;
      return this.delayPass.material;
        
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
        if( objShader=="script_fog" ){
            if(this.mapOverlayHeavyPass.enabled==true){
                setShaderMtl= this.mapOverlayHeavyPass.material ;
            }else if(this.mapOverlayPass.enabled==true){
                setShaderMtl= this.mapOverlayPass.material ;
            }else if(this.mapOverlaySlimPass.enabled==true){
                setShaderMtl= this.mapOverlaySlimPass.material ;
            }
        }else if( objShader=="script_dArrows" ){
            this.geoList[ "dArrows" ].forEach( (o)=>{
                setShaderMtl=o.material;
                setShaderMtl.vertexShader=vert;
                setShaderMtl.fragmentShader=frag;
                setShaderMtl.needsUpdate=true;
            });
            return;
        }else if( objShader=="script_userScreens" ){
            this.camScreenData.screenGeoList.forEach( (o)=>{
                setShaderMtl=o.material;
                setShaderMtl.vertexShader=vert;
                setShaderMtl.fragmentShader=frag;
                setShaderMtl.needsUpdate=true;
            });
            return;
        }else if( objShader=="script_warpZonePortals" ){
            this.returnPortalGlowList.forEach( (o)=>{
                setShaderMtl=o.material;
                setShaderMtl.vertexShader=vert;
                setShaderMtl.fragmentShader=frag;
                setShaderMtl.needsUpdate=true;
            });
            return;
            
        }else if( objShader=="script_lizardking" ){
                setShaderMtl=this.lizardKingPass.material;
        }else if( objShader=="script_majorTom" ){
                setShaderMtl=this.pxlUser.starFieldPass.material;
        }else if( objShader=="script_fractalSubstrate" ){
                setShaderMtl=this.pxlUser.crystallinePass.material;
        }else if( objShader=="script_fractalEcho" ){
                setShaderMtl=this.delayPass.material;
            
        }else{
            let geoRead=objShader.split("_");
            geoRead.shift();
            geoRead=geoRead.join("_");
            if( this.geoList[ geoRead ] ){
                setShaderMtl= this.geoList[ geoRead ].material ;
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
        if( assetExt=="jpg" || assetExt=="jpeg"  ){
          channels=3;
        }else if( assetExt=="png" ){
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
        let geo = new PlaneBufferGeometry();
        
        let bgUniforms={}
        Object.assign( bgUniforms, customUniforms );
        
        if( bgVert==null || typeof(bgVert)!="string"){
            bgVert=this.pxlShaders.scene.bgScreenVert();
        }
        if( bgFrag==null || typeof(bgFrag)!="string"){
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
    if(action == "CallToAction" && this.clickablePrevActiveObject){
      this.pxlGuiDraws.ctaBuildPopup();
      this.objectClickableObjectList[this.clickablePrevActiveObject]['Inactive'].visible=true;
      this.objectClickableObjectList[this.clickablePrevActiveObject]['Hover'].visible=false;
      this.clickablePrevActiveObject=null;
    }
  }
    
  promoActions(pName=null){
        let pLink=pName.userData.video;
        let pScreen=pName.name;
        
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
        if(this.clickablePrevActiveObject==null){
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
        if(this.promoPrevActiveObject==null){
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

  // Set composer uniforms
  updateCompUniforms(exposure=null){
    if(exposure){
      this.pxlRenderSettings.exposure=exposure*this.pxlRenderSettings.mult;
    }
    if(this.mapOverlayPass){
      this.mapMotionBlurPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      this.mapOverlayHeavyPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      this.mapOverlayPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      this.mapOverlaySlimPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      //this.blurScreenMerge.uniforms.exposure.value = this.pxlRenderSettings.exposure;
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

  // Build composers and passes
  buildComposers(){
        
        // Set up swapable frame buffers, for prior frame reads
        /*EffectComposer.prototype.swapBuffer = ()=>{
            let tmpBuffer = this.renderTarget2;
            this.renderTarget2 = this.renderTarget1;
            this.renderTarget1 = tmpBuffer;
        };*/
        
    ///////////////////////////////////////////////////
    // -- SCENE WIDE MATERIALS  -- -- -- -- -- -- -- //
    ///////////////////////////////////////////////////

    this.mapWorldPosMaterial=new ShaderMaterial({
      uniforms:{
        camNear: { type:"f", value: this.pxlCamera.camera.near },
        camFar: { type:"f", value: this.pxlCamera.camera.far }
      },
      vertexShader: this.pxlShaders.rendering.worldPositionVert(),
      fragmentShader: this.pxlShaders.rendering.worldPositionFrag()
    });
    //this.mapWorldPosMaterial.side=DoubleSide;
    this.mapWorldPosMaterial.side=FrontSide;
    this.mapWorldPosMaterial.name="mapWorldPosMaterial";
      
    ///////////////////////////////////////////////////
    // -- 2-Step Blur Composer  -- -- -- -- -- -- -- //
    ///////////////////////////////////////////////////

    this.blurComposer = new EffectComposer(this.engine);
    
    this.shaderPasses.blurXShaderPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.time },
          tDiffuse: { value: null },
          pDiffuse: { value: null },
          resUV: { value: this.pxlDevice.screenRes },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.directionalBlurPass( "pDiffuse", [1,0], 4, 1.8 ),
        defines: {}
      } ), "tDiffuse"
    );
    this.shaderPasses.blurXShaderPass.material.uniforms.pDiffuse = this.scene.renderGlowTarget.texture;
    this.shaderPasses.blurXShaderPass.material.transparent = true;
    this.shaderPasses.blurXShaderPass.needsSwap = true;
    this.shaderPasses.blurXShaderPass.enabled=false;
    this.shaderPasses.blurXShaderPass.name="blurXShaderPass";
    this.blurComposer.addPass( this.shaderPasses.blurXShaderPass );
    
    
    this.shaderPasses.dirBlurCopyPass = new ShaderPass(CopyShader);
    this.shaderPasses.dirBlurCopyPass.enabled=false;
    this.shaderPasses.dirBlurCopyPass.name="dirBlurCopyPass";
    this.blurComposer.addPass(this.shaderPasses.dirBlurCopyPass);
    
    this.shaderPasses.blurYShaderPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.time },
          tDiffuse: { value: null },
          //pDiffuse: { value: this.scene.renderGlowTarget.texture },
          //pDiffuse: { value: this.blurComposer.writeBuffer.texture },
          pDiffuse: { value: null },
          resUV: { value: this.pxlDevice.screenRes },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.directionalBlurPass( "pDiffuse", [0,1], 4, 1.3 ),
        defines: {}
      } ), "tDiffuse"
    );
    this.shaderPasses.blurYShaderPass.material.uniforms.pDiffuse = this.scene.renderGlowTarget.texture;
    this.shaderPasses.blurYShaderPass.material.transparent = true;
    this.shaderPasses.blurYShaderPass.enabled=false;
    this.shaderPasses.blurYShaderPass.name="blurYShaderPass";
    this.blurComposer.addPass( this.shaderPasses.blurYShaderPass );
  
    
    this.shaderPasses.scatterMixShaderPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.time },
          tDiffuse: { value: null },
          pDiffuse: { value: null },
          resUV: { value: this.pxlDevice.screenRes },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.mixBlurShaderPass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.shaderPasses.scatterMixShaderPass.material.uniforms.pDiffuse = this.scene.renderGlowTarget.texture;
    this.shaderPasses.scatterMixShaderPass.material.transparent = true;
    this.shaderPasses.scatterMixShaderPass.enabled=false;
    this.shaderPasses.scatterMixShaderPass.name="scatterMixShaderPass";
    this.blurComposer.addPass( this.shaderPasses.scatterMixShaderPass );
    
      
    // Set Anti-Aliasing Quality
    if( this.pxlOptions.antiAliasing == ANTI_ALIASING.LOW){
      this.shaderPasses.scatterMixShaderPass.enabled=true;
    }else if( this.pxlOptions.antiAliasing == ANTI_ALIASING.MEDIUM){
      this.shaderPasses.blurXShaderPass.enabled=true;
      this.shaderPasses.dirBlurCopyPass.enabled=true;
      this.shaderPasses.blurYShaderPass.enabled=true;
    }else if( this.pxlOptions.antiAliasing == ANTI_ALIASING.HIGH ){
      this.shaderPasses.blurXShaderPass.enabled=true;
      this.shaderPasses.dirBlurCopyPass.enabled=true;
      this.shaderPasses.blurYShaderPass.enabled=true;
      this.shaderPasses.scatterMixShaderPass.enabled=true;
    }




    ///////////////////////////////////////////////////
    // -- POST PROCESSING; MAIN MENU  -- -- -- -- -- //
    ///////////////////////////////////////////////////
    // Post Processing
    
    this.mapComposerMotionBlur=new EffectComposer(this.engine);
    
    this.mapMotionBlurPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
          camRotXYZ:{ value:this.pxlCamera.camRotXYZ },
          blurDirCur:{ type:'f',value:this.blurDirCur },
          blurDirPrev:{ type:'f',value:this.blurDirPrev },
          noiseTexture: { value: this.cloud3dTexture },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.motionBlurPostProcess(this.pxlDevice.screenRes,this.pxlDevice.mobile),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapMotionBlurPass.material.uniforms.rDiffuse = this.scene.renderTarget.texture;
    this.mapMotionBlurPass.needsSwap = true;
    this.mapMotionBlurPass.name = "mapMotionBlurPass";
    this.mapComposerMotionBlur.addPass(this.mapMotionBlurPass);
    this.mapMotionBlurPass.enabled=false;
    this.mapComposerMotionBlur.renderToScreen=false;
    //this.mapComposerMotionBlur.autoClear=false;
    
    // -- -- -- -- -- -- -- -- -- -- //
    
    this.mapComposerGlow=new EffectComposer(this.engine);
    
    let renderGlowPass = new RenderPass(this.scene, this.pxlCamera.camera);
    this.mapComposerGlow.addPass(renderGlowPass);
    
    this.blurScreenMerge = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          mtDiffuse: { value: null },
          exposure:{type:"f",value:this.pxlRenderSettings.exposure}
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.compLayersPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
    this.blurScreenMerge.material.uniforms.rDiffuse = this.scene.renderTarget.texture;
    // TODO : Motion Blur pass, performance is slow but should be enableable through 'options'
    //this.blurScreenMerge.material.uniforms.mtDiffuse = this.mapComposerMotionBlur.renderTarget2.texture;
    this.blurScreenMerge.material.uniforms.mtDiffuse = this.scene.renderTarget.texture;
    this.blurScreenMerge.needsSwap = true;
    this.blurScreenMerge.name = "blurScreenMerge";
    this.mapComposerGlow.addPass(this.blurScreenMerge);
    
    let glowCopyPassBlur = new ShaderPass(CopyShader);
    glowCopyPassBlur.name = "glowCopyPassBlur";
    this.mapComposerGlow.addPass(glowCopyPassBlur);
    
    //this.mapGlowPass = new UnrealBloomPass( new Vector2( this.pxlDevice.mapW*this.pxlQuality.bloomPercMult, this.pxlDevice.mapH*this.pxlQuality.bloomPercMult ), .28, 0.08, 0.13 );
    //this.mapGlowPass.threshold = this.pxlRenderSettings.bloomThresh;
    //this.mapGlowPass.strength = this.pxlRenderSettings.bloomStrength;
    //this.mapGlowPass.radius = this.pxlRenderSettings.bloomRadius;
    /*this.mapGlowPass = new BloomPass( this.pxlRenderSettings.bloomStrength, 50, 4, 512);
    this.mapGlowPass.threshold = this.pxlRenderSettings.bloomThresh;
    this.mapGlowPass.strength = this.pxlRenderSettings.bloomStrength;
    this.mapGlowPass.radius = this.pxlRenderSettings.bloomRadius;*/
    //this.mapGlowPass.clear=true;
    
    //this.mapComposerGlow.addPass(this.mapGlowPass);
    this.mapComposerGlow.renderToScreen=false;
    this.mapComposerGlow.autoClear=true;

    this.mapOverlayHeavyPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
          camPos: { value: this.pxlCamera.camera.position },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          bloomTexture: { value: null },
          sceneDepth: { value: null },
          scenePos: { value: null },
          noiseTexture: { value: this.cloud3dTexture },
          fogMult: { value: this.fogMult },
          proximityMult: { value: 1 },
          //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.finalOverlayHeavyShader(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapOverlayHeavyPass.material.uniforms.rDiffuse = this.scene.renderTarget.texture;
    this.mapOverlayHeavyPass.material.uniforms.bloomTexture = this.mapComposerGlow.renderTarget2.texture;
    this.mapOverlayHeavyPass.material.uniforms.sceneDepth = this.scene.renderTarget.depthTexture;
    this.mapOverlayHeavyPass.material.uniforms.scenePos = this.scene.renderWorldPos.texture;
    this.mapOverlayHeavyPass.needsSwap = true;
    this.mapOverlayHeavyPass.name = "mapOverlayHeavyPass";

    this.mapOverlayPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
                    camPos: { value: this.pxlCamera.camera.position },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          bloomTexture: { value: null },
          sceneDepth: { value: null },
          scenePos: { value: null },
          noiseTexture: { value: this.cloud3dTexture },
          fogMult: { value: this.fogMult },
          proximityMult: { value: 1 },
          //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.finalOverlayShader(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapOverlayPass.material.uniforms.rDiffuse = this.scene.renderTarget.texture;
    this.mapOverlayPass.material.uniforms.bloomTexture = this.mapComposerGlow.renderTarget2.texture;
    this.mapOverlayPass.material.uniforms.sceneDepth = this.scene.renderTarget.depthTexture;
    this.mapOverlayPass.material.uniforms.scenePos = this.scene.renderWorldPos.texture;
    this.mapOverlayPass.needsSwap = true;
    this.mapOverlayPass.name = "mapOverlayPass";
    
    this.mapOverlaySlimPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
          camPos: { value: this.pxlCamera.camera.position },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          bloomTexture: { value: null },
          sceneDepth: { value: null },
          fogMult: { value: this.fogMult },
          proximityMult: { value: 1 },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.finalOverlaySlimShader(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapOverlaySlimPass.material.uniforms.rDiffuse = this.scene.renderTarget.texture;
    //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
    this.mapOverlaySlimPass.material.uniforms.bloomTexture = this.mapComposerGlow.renderTarget2.texture;
    this.mapOverlaySlimPass.material.uniforms.sceneDepth = this.scene.renderTarget.depthTexture;
    this.mapOverlaySlimPass.needsSwap = true;
    this.mapOverlaySlimPass.name = "mapOverlaySlimPass";

    // -- -- -- -- -- -- -- -- -- -- //
    
    this.mapGlowPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.pxlTimer.msRunner },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          sceneDepth: { value: null },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.glowPassPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapGlowPass.material.uniforms.rDiffuse = this.scene.renderGlowTarget.texture;
    this.mapGlowPass.material.uniforms.sceneDepth = this.scene.renderTarget.depthTexture;
    this.mapGlowPass.needsSwap = true;
    this.mapGlowPass.name = "mapGlowPass";

    // -- -- -- -- -- -- -- -- -- -- //
    
    this.mapComposer = new EffectComposer(this.engine);
    
    this.mapComposer.addPass( this.mapOverlayHeavyPass );
    this.mapComposer.addPass( this.mapOverlayPass );
    this.mapComposer.addPass( this.mapOverlaySlimPass );
    this.mapComposer.addPass( this.mapGlowPass );
    this.mapOverlayHeavyPass.enabled=false;
    this.mapOverlayPass.enabled=false;
    //this.mapOverlayPass.autoClear=true;
    //this.mapOverlaySlimPass.enabled=false;
    
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    this.pxlUser.lKingWarp=new Vector2( ...this.pxlUser.lKingInactive );
        
    this.lizardKingPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          time:{ value:this.pxlTimer.msRunner },
          ratio: { value: this.pxlDevice.screenRes },
          noiseTexture: { value: this.cloud3dTexture },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.lKingPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
        this.pxlUser.lizardKingPass=this.lizardKingPass;
        this.lizardKingPass.enabled=false;
        this.pxlUser.lizardKingPass.name = "lizardKingPass";
    
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    this.pxlUser.starFieldPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          time:{ value:this.pxlTimer.msRunner },
          ratio: { value: this.pxlDevice.screenRes },
          noiseTexture: { value: this.cloud3dTexture },
          starTexture: { value: this.pxlUtils.loadTexture(this.pxlUtils.assetRoot+"uv_starNoise.jpg", null, {"encoding":LinearSRGBColorSpace}) },
        },
        vertexShader: this.pxlShaders.rendering.sFieldPostProcessVert(),
        fragmentShader: this.pxlShaders.rendering.sFieldPostProcessFrag(),
        defines: {}
      } ), "tDiffuse"
    );
        this.pxlUser.starFieldPass.enabled=false;
        this.pxlUser.starFieldPass.name = "starFieldPass";
    
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    this.pxlUser.crystallinePass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          tDiffusePrev: {type:'t', value: null },
          time:{ value:this.pxlTimer.msRunner },
          ratio: { value: this.pxlDevice.screenRes },
          noiseTexture: { value: this.cloud3dTexture },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.iZoomPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
        this.pxlUser.crystallinePass.enabled=false;
        this.pxlUser.crystallinePass.name = "crystallinePass";
    
        
        
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

    
    if( this.pxlOptions.postProcessPasses.chromaticAberrationPass ){
      this.chromaticAberrationPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            tDiffuse: { value: null },
            ratio: { value: this.pxlDevice.screenRes },
            warpMult: { value: this.chroAberMult },
            chroAberUVTexture: { value: this.chroAberUVTexture },
            chroAberUVAlpha: { value: this.chroAberUVAlpha },
            lKing: { value: this.pxlUser.lKingWarp },
          },
          vertexShader: this.pxlShaders.core.defaultVert(),
          fragmentShader: this.pxlShaders.rendering.chroAberPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      this.chromaticAberrationPass.enabled=false;
      this.chromaticAberrationPass.name = "chromaticAberrationPass";
      this.mapComposer.addPass( this.chromaticAberrationPass );
    }
    
    if( this.pxlOptions.postProcessPasses.lizardKingPass ){
      this.mapComposer.addPass( this.lizardKingPass );
    }
    //if( !this.mobile ) {
    if( this.pxlOptions.postProcessPasses.starFieldPass ){
      this.mapComposer.addPass( this.pxlUser.starFieldPass );
    }
    if( this.pxlOptions.postProcessPasses.crystallinePass ){
      this.mapComposer.addPass( this.pxlUser.crystallinePass );
    }
    
    if( this.pxlOptions.postProcessPasses.mapComposerWarpPass ){
      this.mapComposerWarpPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            time:{ value:this.pxlTimer.msRunner },
            fader:{ value:this.warpVisualFader },
            tDiffuse: { value: null },
            noiseTexture: { value: this.cloud3dTexture },
            animTexture: { value: this.blockAnimTexture  },
            //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
          },
          vertexShader: this.pxlShaders.core.camPosVert(),
          fragmentShader: this.pxlShaders.rendering.warpPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      this.mapComposerWarpPass.needsSwap = true;
      this.mapComposerWarpPass.enabled=false;
      this.mapComposerWarpPass.name = "mapComposerWarpPass";
      this.mapComposer.addPass( this.mapComposerWarpPass );
    }
        // 8 Samples
    this.mapBoxAAPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          resUV:{ type:'f',value:this.pxlDevice.screenRes },
          ratio:{ type:'f',value: 1 },
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
        },
        vertexShader: this.pxlShaders.core.camPosVert(),
        fragmentShader: this.pxlShaders.rendering.boxAntiAliasPass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapBoxAAPass.enabled=false;
    this.mapBoxAAPass.name = "mapBoxAAPass";
    this.mapComposer.addPass( this.mapBoxAAPass );
        
        // 4 samples
    this.mapCrossAAPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          resUV:{ type:'f',value:this.pxlDevice.screenRes },
          ratio:{ type:'f',value: 1 },
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
        },
        vertexShader: this.pxlShaders.core.camPosVert(),
        fragmentShader: this.pxlShaders.rendering.crossAntiAliasPass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapCrossAAPass.enabled=false;
    this.mapCrossAAPass.name = "mapCrossAAPass";
    this.mapComposer.addPass( this.mapCrossAAPass );
    
    this.mapComposer.autoClear=true;
    
    // -- -- -- -- -- -- -- -- -- -- //
    
    // External Room composer
    let bootScene= this.roomSceneList[this.bootRoom].scene; // this.roomSceneList['ShadowPlanet'].scene ||
    this.roomComposer=new EffectComposer(this.engine);

    this.roomRenderPass = new RenderPass(bootScene, this.pxlCamera.camera);
    this.roomRenderPass.name = "roomRenderPass";
    this.roomComposer.addPass(this.roomRenderPass);
        
        
    this.roomNameList.forEach( (r)=>{
      if( r != this.mainRoom){
        let curPass=this.roomSceneList[ r ].applyRoomPass( this.roomComposer );
        if( curPass ){
            curPass.enabled=false;
            this.roomComposer.addPass( curPass );
        }
      }
    });
        
    
    this.roomBloomPass = new UnrealBloomPass( new Vector2( this.pxlDevice.mapW*.5, this.pxlDevice.mapH*.5 ), 1.5, 0.8, 0.85 );
    this.roomBloomPass.threshold = this.pxlRenderSettings.bloomThresh;
    this.roomBloomPass.strength = this.pxlRenderSettings.bloomStrength;
    this.roomBloomPass.radius = this.pxlRenderSettings.bloomRadius;
    this.roomBloomPass.name = "roomBloomPass";
    this.roomComposer.addPass( this.roomBloomPass );
    
    
    if( this.pxlOptions.postProcessPasses.roomGlowPass ){
      this.roomGlowPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            time:{ value:this.pxlTimer.msRunner },
            ratio:{ type:'f',value: 1 },
            tDiffuse: { value: null },
            gDiffuse: { value: null },
            rDiffuse: { value: null },
            sceneDepth: { value: null },
          },
          vertexShader: this.pxlShaders.core.defaultVert(),
          fragmentShader: this.pxlShaders.rendering.glowPassPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      
      //gDiffuse: { value: this.scene.renderGlowTarget.texture },
      //gDiffuse: { value: this.blurComposer.renderTarget1.texture },
      this.roomGlowPass.material.uniforms.gDiffuse = this.blurComposer.writeBuffer.texture;
      this.roomGlowPass.material.uniforms.rDiffuse = this.blurComposer.renderTarget2.texture;
      this.roomGlowPass.material.uniforms.sceneDepth = this.scene.renderTarget.depthTexture;
      this.roomGlowPass.needsSwap = true;
      this.roomGlowPass.name = "roomGlowPass";

      this.roomComposer.addPass( this.roomGlowPass );
    }
    
    if( this.pxlOptions.postProcessPasses.chromaticAberrationPass ){
      this.roomComposer.addPass( this.chromaticAberrationPass );
    }
    
    if( this.pxlOptions.postProcessPasses.lizardKingPass ){
      this.roomComposer.addPass( this.lizardKingPass );
    }
    
    if( this.pxlOptions.postProcessPasses.starFieldPass ){
      this.roomComposer.addPass( this.pxlUser.starFieldPass );
    }

    if( this.pxlOptions.postProcessPasses.crystallinePass ){
      this.roomComposer.addPass( this.pxlUser.crystallinePass );
    }

    if( this.pxlOptions.postProcessPasses.mapComposerWarpPass ){
      this.roomComposer.addPass( this.mapComposerWarpPass );
    }
        
    this.roomComposer.addPass( this.mapCrossAAPass );
    this.roomComposer.addPass( this.mapBoxAAPass );
        
    this.roomComposer.autoClear=true;
        
        // -- -- -- -- -- -- -- -- //
        
    
        // -- -- -- -- -- -- -- -- //
        // Set above, for pass to use renderTarget in uniforms
    this.delayComposer=new EffectComposer(this.engine);
    
    let renderDelayPass = new RenderPass(this.scene, this.pxlCamera.camera);
    //this.delayComposer.addPass(renderDelayPass);
        
    this.delayPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          roomComposer: { type:"f", value : 0 },
          tDiffusePrev: { value: null },
          tDiffusePrevRoom: { value: null },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.textureStorePass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.delayPass.material.uniforms.tDiffusePrev = this.mapComposer.renderTarget1.texture;
    this.delayPass.material.uniforms.tDiffusePrevRoom = this.roomComposer.renderTarget1.texture;
    //this.delayPass.needsSwap = true;
    this.delayPass.clear=false;
    this.delayComposer.addPass( this.delayPass );
    this.delayComposer.renderToScreen=false;
    this.delayComposer.autoClear=false;
        
    this.pxlUser.crystallinePass.uniforms.tDiffusePrev.value = this.delayComposer.renderTarget2.texture;
  }
  
  setExposure(curExp){
    let animPerc=1;
    //curExp= this.pxlCamera.uniformScalars.curExp + curExp*this.pxlCamera.uniformScalars.brightBase*animPerc; 
    curExp= curExp*animPerc; 
    this.pxlCamera.uniformScalars.exposureUniformBase=curExp;
    // Set scene exposure on post-process composer passes 
    this.updateCompUniforms(curExp);
  }
  
  stepWarpPass(){
    if( this.warpVisualActive ){
      let curPerc= ( this.pxlTimer.curMS - this.warpVisualStartTime ) / this.warpVisualMaxTime[this.pxlCamera.warpType];
      let fUp=Math.min( 1, curPerc*3 );
      let fDown=Math.min( 1, 3-curPerc*3 );
      
      if(fUp==1 && fDown==1 && this.pxlCamera.warpActive){
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
    
    
  stepShaderValues(){ // ## Switch variables in shaders to three variables to avoid this whole thing  
    this.stepShaderFuncArr.forEach((x)=>{
      if(typeof(x)=="object"){
        x.step();
      }else if(typeof(x)=="string"){
        console.log("shader trigger?");
        console.log(x);
        //(x);
      }
    });
    
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
    this.engine.setRenderTarget(prepRoom.warpZoneRenderTarget);
    //this.engine.clear();
    
    prepRoom.prepPortalRender();
    this.engine.render(  prepRoom.scene || prepRoom.scene, this.pxlCamera.camera );
    prepRoom.cleanupPortalRender();
    /*
    if( curScene == this.mainRoom ){
      //this.mapRender();
      
      //this.warpPortalTextures[ curScene ] = this.mapComposer.renderTarget1.texture.clone();
      
    }else{
      //prepRoom.step();
    
      prepRoom.prepPortalRender();
      this.engine.render(  prepRoom.scene, this.pxlCamera.camera );
      prepRoom.cleanupPortalRender();
      
      this.warpPortalTextures[ curScene ] = this.scene.renderTarget.clone();
    
      prepRoom.warpPortalTexture=this.warpPortalTextures[ curScene ];
      //prepRoom.setPortalTexture( prepRoom.warpPortalTexture );
      //prepRoom.setPortalTexture( this.warpPortalTextures[ this.mainRoom ] );
      prepRoom.setPortalTexture( this.cloud3dTexture );//  this.warpPortalTextures[ this.mainRoom ] );
      this.setPortalTexture( this.warpPortalTextures[ curScene ], curScene );
    }*/
    
    this.engine.setRenderTarget(null);
  
  }

  mapRender(anim=true){
    if(this.pxlTimer.active){
        this.step();
    }
    
    if( this.pxlTimer.curMS > this.nextRenderMS || anim==false ){
      this.prevRenderMS = this.nextRenderMS;
      this.nextRenderMS = this.pxlTimer.curMS + this.renderInterval;

      // Render appropriate room
      this.stepShaderValues();
      this.stepAnimatedObjects();
      
      let curRoom=this.roomSceneList[this.currentRoom];
      if(curRoom && curRoom.booted){
        curRoom.step();
        curRoom.camera.layers.disable( this.pxlEnums.RENDER_LAYER.SKY );
        this.engine.setRenderTarget(curRoom.scene.renderTarget);
        this.engine.clear();
        this.engine.render( curRoom.scene, curRoom.camera);
        this.engine.setRenderTarget(null);
        curRoom.camera.layers.enable( this.pxlEnums.RENDER_LAYER.SKY );
        
        if( false && this.pxlQuality.settings.fog>0 ){
          this.pxlCamera.camera.layers.disable( 1 );
          
          curRoom.scene.overrideMaterial=this.mapWorldPosMaterial;
          this.engine.setRenderTarget(this.scene.renderWorldPos);
          this.engine.clear();
          this.engine.render( curRoom.scene, this.pxlCamera.camera);
          curRoom.scene.overrideMaterial=null;
        
          this.pxlCamera.camera.layers.enable( 1 );
          this.engine.setRenderTarget(null);
        }
        
        if( this.mapComposerGlow && ( this.pxlQuality.settings.bloom || this.pxlQuality.settings.fog ) ){ //  || this.pxlQuality.settings.motion ){ 
          this.mapComposerGlow.render();
        }
        
        this.mapRenderBlurStack( curRoom, curRoom.camera, curRoom.scene, this.scene.renderGlowTarget)
        
        this.roomComposer.render();
        //this.engine.render( this.roomSceneList[this.currentRoom].scene, this.pxlCamera.camera);
      }
      
      if( this.pxlUser.iZoom ){
        this.delayComposer.render();
      }
    }else if( this.pxlOptions.subTickCalculations ){
      // Step room calculations for render-independent user input and collision calculations
      let curRoom=this.roomSceneList[this.currentRoom];
      if(curRoom && curRoom.booted){
        curRoom.step();
      }
    }
        
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
      
      this.engine.setRenderTarget(target);
      let bgCd=0x000000;
      let curgb = scene.background.clone()
      scene.background.set( bgCd );
      this.engine.setClearColor(bgCd, 0);
      //this.engine.clear();
      this.engine.render( scene, camera);
      //this.scene.overrideMaterial=null;
      scene.background.r=curgb.r;
      scene.background.g=curgb.g;
      scene.background.b=curgb.b;
      
      camera.layers.enable( this.pxlEnums.RENDER_LAYER.SCENE );
      camera.layers.enable( this.pxlEnums.RENDER_LAYER.PARTICLES );
      camera.layers.enable( this.pxlEnums.RENDER_LAYER.SKY );
      this.engine.setRenderTarget(null);
      
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
