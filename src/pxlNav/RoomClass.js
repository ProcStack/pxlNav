
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
// --   Base Room Class Object File          --
// --    -- -- -- -- -- -- -- --             --
// --  Written by Kevin Edzenga; 2020-2024   --
// --                                        --
// --  This class is meant to keep your      --
// --    room file cleaner,                  --
// --  All veriables here are accesible      --
// --    from your file.                     --
// --                                        --
// --  To make your own room;                --
// --    Copy the template room folder -     --
// --     ./Source/js/pxlRooms/templateRoom  --
// --    Then read the 'README.md' file      --
// --                                        --
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- --



import {
  Vector2,
  Vector3,
  Object3D,
  Color,
  FogExp2,
  Group,
  RepeatWrapping,
  AmbientLight,
  UniformsUtils,
  UniformsLib
} from "../libs/three/three.module.min.js";
import { pxlPrincipledVert, pxlPrincipledFrag } from "./shaders/objects/PxlPrincipled.js";

import { RENDER_LAYER, COLLIDER_TYPE } from "./core/Enums.js";

/**
 * Class representing a Room Environment.
 * @alias pxlRoom RoomEnvironment
 * @class
 * @description Core functionality and base classes
 */
class RoomEnvironment{
  /**
   * Create a Room Environment.
   * @param {string} roomName - The name of the room.
   * @param {string|null} assetPath - The path to the assets.
   * @param {Object|null} msRunner - The millisecond runner.
   * @param {Object|null} camera - The camera object.
   * @param {Object|null} scene - The scene object.
   * @param {Object|null} cloud3dTexture - The 3D cloud texture.
   */
  constructor( roomName='pxlRoomEnvironment', assetPath=null, msRunner=null, camera=null, scene=null, cloud3dTexture=null ){
    this.roomName=roomName;
    this.pxlFile=null;
    this.pxlUtils=null;
    this.pxlTimer=null;
    this.pxlAnim=null;
    this.pxlColliders=null;
    this.pxlDevice=null;
    this.pxlHUD=null;
    this.pxlEnv=null;
    this.booted=false;
    this.initScene=true;
    this.active=true;
    this.assetPath=assetPath+"Assets/";
    this.mobile=false;
    
    this.sceneFile = null;
    this.animFile = null;
    this.animClips = {};
    this.animMixer = null;
    
    // Environment Shader 
    this.spiralizerUniforms = {};
    this.materialList = {};
    
    // Room warp data
    this.camInitPos = null;
    this.camInitLookAt = null;
    this.camThumbPos = new Vector3(0,0,-30);
    this.camThumbLookAt = new Vector3(0,35,-1000);
    this.cameraBooted = false;
    this.cameraPrevPos = new Vector3(0,0,0);
    this.cameraAimTarget = new Object3D(0,0,0);
    this.camHoldWarpPos = true;
    this.defaultCamLocation = "default";
    this.camLocation  =  {};
    
    this.pxlCamFOV = { 'PC':60, 'MOBILE':80 };
    this.pxlCamZoom = 1;
    this.pxlCamAspect = 1;
    this.pxlCamNearClipping = 5;
    this.pxlCamFarClipping = 10000;

    // this.fogColor=new Color(.3,.3,.3);
    this.fogColor = new Color(.01,.02,.05);
    this.fogExp = .0007;
    this.fog = new FogExp2( this.fogColor, this.fogExp);
        
    this.userAvatarGroup = new Group();
    this.packedTextureMaterial = null;
    this.coreTextureMaterial = null;
    this.projectedMaterial = null;
    this.voidMaterial = null;
    this.holoMaterial = null;
    this.aspectRatio = null;
    this.flag = null;
    this.initPos = [];
    this.finalPos = [];
    this.midPos = new Vector3(0,30,-50);

    this.perspectiveInstances = 160;
    
    this.startTime = 0;
    this.runTime = new Vector2(0, 0);
    this.msRunner = msRunner;
    this.camera = camera;
    this.autoCamPaths = {};
    this.scene = scene;
    this.lightList = {}
    this.geoList = {}
    this.glassGroup = null;
    this.glassList = []
    this.particleList = {};
    this.lodList = [];
    

    this.enableRaycast = false;
    this.hasHoverables=false;
    this.hoverableList=[];
    this.hoverableObj=null;
    
    this.hasClickables=false;
    this.clickableList=[];
    this.clickableObj=null;
    
    
    this.collidersExist=false;
    this.colliderActive=false;
    this.colliderHashMap={};
    this.colliderList= [];
    this.antiColliderActive=false;
    this.antiColliderList= [];
    this.antiColliderTopActive=false;
    this.antiColliderTopList= [];
    
    this.hasPortalExit=false;
    this.portalList={};

    this.hasRoomWarp=false;
    this.roomWarp=[];
    this.warpPortalTexture=null;
    this.warpZoneRenderTarget=null;
        
    this.worldPosMaterial=null;
    this.worldPosRenderTarget=null;
    this.spiralizerPass=null;
    
    this.bloomPreState=false;
        
    this.cloud3dTexture=null;
    this.smoothNoiseTexture=null;
        
    // Helper objects for debug visualizations
    this.hasHelpers = false;
    this.helperObjects = {};

    //%=
    this.currentShader=null;
    //%
  }

  /**
   * Set pxlNav dependencies.
   * @param {Object} pxlNav - The pxlNav object.
   */
  setDependencies( pxlNav ){
    this.pxlEnv = pxlNav;
    this.pxlFile = pxlNav.pxlFile;
    this.pxlAnim = pxlNav.pxlAnim;
    this.pxlTimer = pxlNav.pxlTimer;
    this.pxlUtils = pxlNav.pxlUtils;
    this.pxlDevice = pxlNav.pxlDevice;
    this.pxlHUD = pxlNav.pxlHUD;
    this.pxlColliders = pxlNav.pxlColliders;
    this.mobile = pxlNav.mobile;

    this.cloud3dTexture=this.pxlEnv.cloud3dTexture;
    this.cloud3dTexture.wrapS = RepeatWrapping;
    this.cloud3dTexture.wrapT = RepeatWrapping;
    
    this.smoothNoiseTexture=this.pxlEnv.softNoiseTexture;
    this.smoothNoiseTexture.wrapS = RepeatWrapping;
    this.smoothNoiseTexture.wrapT = RepeatWrapping;
  }
  
  // -- -- --
  
  /**
   * Get the delta time.
   * @returns {number} The delta time.
   */
  get deltaTime(){
    return this.pxlTimer.deltaTime;
  }

  /**
   * Get the average delta time.
   * @returns {number} The average delta time.
   */
  get avgDeltaTime(){
    return this.pxlTimer.avgDeltaTime;
  }

  /**
   * Get the lerp rate.
   * @param {number} rate - The rate.
   * @returns {number} The lerp rate.
   */
  getLerpRate( rate ){
    return this.pxlTimer.getLerpRate( rate );
  }

  /**
   * Get the average lerp rate.
   * @param {number} rate - The rate.
   * @returns {number} The average lerp rate.
   */
  getLerpAvgRate( rate ){
    return this.pxlTimer.getLerpAvgRate( rate );
  }
  // -- -- --

  /**
   * Initialize the room environment.
   * Ran after core `pxlNav` modules have been loaded and initialized
   *   But before the render composers / post-processing
   */
  init(){
    this.scene.fog=this.fog;
    this.scene.background = this.fogColor ;//pxlEnv.fogColor;
  }

  /**
   * Start the room environment.
   * Run on init room warp; reset room values
   */
  start(){
    if( !this.booted ){
      //this.resetCamera();
    }

    this.pxlEnv.engine.setClearColor(this.fogColor, 0);

    /*this.spiralizerPass.enabled=true;
    this.bloomPreState=this.pxlEnv.roomBloomPass.enabled;  
    this.pxlEnv.roomBloomPass.enabled=false;  */
  }
  
  /**
   * Per-frame render updates.
   */
  step(){
    this.runTime.x=this.msRunner.x;

    // Update helper objects, if they exist
    //this.stepColliderHelper( COLLIDER_TYPE.FLOOR );

    // Update LODs manually with camera position
    /*if( this.lodList.length > 0 ){
      this.lodList.forEach( (lod)=>{
        if( lod.getCurrentLevel()>0 ){
        lod.update( this.camera );
        }
      });
    }*/
    
    //this.pxlEnv.engine.setClearColor(this.pxlEnv.fogColor, 0);
    
    // Render world positions for composer
    //   There must be a better way to get world positions,
    //     The render pass must have an option for this... Or could be added hHmmMMmmm
    /*this.scene.overrideMaterial=this.worldPosMaterial;
    this.pxlEnv.engine.setRenderTarget(this.worldPosRenderTarget);
    this.pxlEnv.engine.clear();
    this.pxlEnv.engine.render( this.scene, this.camera );
    this.scene.overrideMaterial=null;
    this.pxlEnv.engine.setRenderTarget(null);*/
        
  }

  /**
   * Stop the room environment.
   * Ran When leaving the room
   */
  stop(){
    //this.spiralizerPass.enabled=false;
    //this.pxlEnv.roomBloomPass.enabled=this.bloomPreState;
  }
  
  // -- -- --

  /**
   * Handle window resize.
   * @param {number} sW - The width of the window.
   * @param {number} sH - The height of the window.
   */
  resize( sW, sH ){
    /*if(this.worldPosRenderTarget){
      this.worldPosRenderTarget.setSize( sW, sH );
    }
    if(this.spiralizerPass){
      this.spiralizerPass.setSize( sW, sH );
    }*/
  }
  
  /**
   * Set the user height.
   * @param {number} [toHeight=1] - The height to set.
   */
  setUserHeight( toHeight=1 ){
    this.pxlEnv.pxlCamera.setUserHeight( toHeight, this.roomName );
  }

  /**
   * Reset the camera.
   */
  resetCamera(){
    this.pxlEnv.pxlCamera.setTransform( this.camInitPos, this.camInitLookAt );
    /*if( !this.pxlEnv.pxlOptions["staticCamera"] ){
      this.pxlEnv.pxlCamera.camUpdated = true;
      this.pxlEnv.pxlCamera.hasMoved = true;
      this.pxlEnv.pxlCamera.hasGravity = true;
    }*/
  }
    
  /**
   * Prepare Warp Zone Portal Texture
   */
  prepPortalRender(){
    this.geoList['intro'].visible=false;
    this.geoList['MainRoomWarp'].visible=false;
  }
  /**
   * Cleanup portal render.
   */
  cleanupPortalRender(){
    this.geoList['intro'].visible=true;
    this.geoList['MainRoomWarp'].visible=true;
  }
  /**
   * Set the portal texture.
   * Set the Room Warp Portal plane to display the render from the main room
   * @param {Object} texture - The texture.
   * @param {string|null} [toRoom=null] - The room to set.
   */
  setPortalTexture(texture, toRoom=null){
    this.geoList['MainRoomWarp'].material.map=texture;
  }
    
  /**
   * Apply composer's room pass.
   * @param {Object|null} [roomComposer=null] - The room composer.
   * @returns {Object|null} The shader pass.
   */
  applyRoomPass( roomComposer=null ){
    /*if(roomComposer){
      this.worldPosMaterial=new ShaderMaterial({
        uniforms:{
          camNear: { type:"f", value: 1 },
          camFar: { type:"f", value: 900 } // Measured in the Scene file, 885.61
        },
        vertexShader: worldPositionVert(),
        fragmentShader: worldPositionFrag()
      });
      //this.worldPosMaterial.side=DoubleSide;
      //this.worldPosMaterial.side=FrontSide;
      
      this.spiralizerPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            tDiffuse: { value: null },
            localPos: { value: this.pxlUtils.loadTexture(this.assetPath+"SpiralizerFadeMap_1k.jpg") },
            worldPos: { value: this.worldPosRenderTarget.texture },
            noiseTexture: { value: this.pxlEnv.cloud3dTexture },
            camMat:{ value:this.camera.matrixWorld },
            marker: { value: new Vector3( -619.01, 67.856, 240.177) },
            time:{ value:this.msRunner },
            screenRes: { value: this.pxlDevice.screenRes },
          },
          vertexShader: cameraCalcVert(),
          fragmentShader: spiralizerPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      this.spiralizerPass.enabled=false;
      
      return this.spiralizerPass;
    }*/
  }
  
  /**
   * Get the room name.
   * @returns {string} The room name.
   */
  getName(){
    return this.roomName;
  }

  /**
   * Get artist information.
   * @returns {Object|null} The artist information.
   */
  getArtistInfo(){
    return null;
  }
  
  /**
   * Set the fog color.
   * @param {Object} color - The color.
   */
  setFog( color ){
    // this.geoList["skySemiSphere"].material.uniforms.skyColor.value.x= this.fog.color.r*10.0 ;
    // this.geoList["skySemiSphere"].material.uniforms.skyColor.value.y= this.fog.color.g*10.0 ;
    // this.geoList["skySemiSphere"].material.uniforms.skyColor.value.z= this.fog.color.b*10.0 ;
    // this.geoList["skySemiSphere"].material.uniforms.fogColor.value.r=this.fog.color.r*5;
    // this.geoList["skySemiSphere"].material.uniforms.fogColor.value.g=this.fog.color.g*5;
    // this.geoList["skySemiSphere"].material.uniforms.fogColor.value.b=this.fog.color.b*5;
  }
      
  //%=
  /**
   * Get the geometry shader list.
   * @returns {Object} The shader list.
   */
  getShaderList(){
    let retList={}
    let objList=Object.keys( this.materialList );
    objList.forEach( (k)=>{
      retList[k]=k
    });
    return retList;
  }
  /**
   * Get the currently editing shader.
   * @returns {string} The current shader.
   */
  getCurrentShader(){
    return this.currentShader || Object.keys( this.materialList )[0];
  }
  /**
   * Read the shader from the object.
   * @param {string} [objShader=""] - The shader object.
   * @param {Object|null} [sliderVectorObj=null] - The slider vector object.
   * @returns {Object} The shader material.
   */
  readShader( objShader="", sliderVectorObj=null ){
    if( this.currentShader!=null && this.materialList[ this.currentShader ].hasOwnProperty('uniforms')){
      if( !sliderVectorObj ){
        sliderVectorObj=new Vector3();
      }
      this.materialList[ this.currentShader ].uniforms.sliders.value=sliderVectorObj;
      this.materialList[ this.currentShader ].needsUpdate=true;
    }
    this.currentShader=objShader;
    return this.materialList[ this.currentShader ];
  }
  /**
   * Set the geometry's material vertex & fragment shaders.
   * @param {Object} unis - The uniforms.
   * @param {string} vert - The vertex shader.
   * @param {string} frag - The fragment shader.
   */
  setShader( unis, vert, frag ){
    if( this.emitterList && this.emitterList[ this.currentShader ] ){
      if( this.emitterList[ this.currentShader ].Particles.length > 0 ){
        this.emitterList[ this.currentShader ].Particles.forEach( (p)=>{
          let mtl = p.material;
          mtl.vertexShader=vert;
          mtl.fragmentShader=frag;
          mtl.needsUpdate=true;
        });
      }
    }
    
    this.materialList[ this.currentShader ].vertexShader=vert;
    this.materialList[ this.currentShader ].fragmentShader=frag;
    this.materialList[ this.currentShader ].needsUpdate=true;
  }
  //%
  
    
  /**
   * Cast a ray using pxlNav's raycaster.
   * For Three.js' raycaster, please use the Three.js raycaster directly
   * Note - pxlNav's raycaster requires object's are registered,
   *   All object's are pre-processes for faster raycasting
   * @param {boolean} isClick - Whether it is a click.
   * @param {number} mButton - The mouse button.
   */
  castRay( isClick, mButton ){
    if(!this.enableRaycast){
      return;
    }
    if( ( !isClick && !this.hasHoverables ) || ( isClick && !this.hasClickables ) ){
      //console.log("No Cickable / Hoverable Objects Found");
      this.mouseRayHits=[];
      return;
    }
    
    let castableObjects = []
    if( !isClick && this.hasHoverables ) {
      castableObjects = this.hoverableList;
    }else if( isClick && this.hasClickables ){
      castableObjects = this.clickableList;
    }
    
    var rayHits=[];
    if(castableObjects.length>0){
    
      let mouseScreenSpace=new Vector2( this.pxlDevice.mouseX/this.pxlDevice.sW*2-1, -this.pxlDevice.mouseY/this.pxlDevice.sH*2+1 );
      this.pxlEnv.pxlCamera.objRaycast.setFromCamera(mouseScreenSpace, this.pxlEnv.pxlCamera.camera );
    
      rayHits=this.pxlEnv.pxlCamera.objRaycast.intersectObjects(castableObjects);
    }

    this.mouseRayHits=rayHits;
  }

  // -- -- --

  /**
   * Handle pxlColliders collider hits.
   * @param {Array} colliderList - The list of colliders.
   * @param {number} [colliderType=COLLIDER_TYPE.FLOOR] - The type of collider.
   */
  hitColliders( colliderList=[], colliderType=COLLIDER_TYPE.FLOOR ){
    if( colliderList.length == 0 ){
      return;
    }
    // Implement custom-event logic in this function to handle collisions in your room
    /* switch( colliderType ){
      case COLLIDER_TYPE.FLOOR:
        break;
      case COLLIDER_TYPE.WALL:
        break;
      case COLLIDER_TYPE.WALL_TOP:
        break;
      case COLLIDER_TYPE.CEILING:
        break;
      case COLLIDER_TYPE.PORTAL_WARP:
        break;
      case COLLIDER_TYPE.ROOM_WARP:
        break;
      case COLLIDER_TYPE.ITEM:
        break;
      case COLLIDER_TYPE.SCRIPTED:
        break;
      case COLLIDER_TYPE.HOVERABLE:
        break;
      case COLLIDER_TYPE.CLICKABLE:
        break;
      default:
        break;
    } */
  }

  // -- -- --

  /**
   * Check if colliders exist.
   * @returns {boolean} Whether colliders exist.
   */
  hasColliders(){
    return this.collidersExist
  }

  /**
   * Check if a specific type of collider exists.
   * @param {number} [colliderType=COLLIDER_TYPE.FLOOR] - The type of collider.
   * @returns {boolean} Whether the specific type of collider exists.
   */
  hasColliderType( colliderType=COLLIDER_TYPE.FLOOR ){
    let hasCollidersOfType = false;
    if( !this.hasColliders() ){
      return hasCollidersOfType;
    }

    switch( colliderType ){
      case COLLIDER_TYPE.FLOOR:
        hasCollidersOfType = this.colliderActive;
        break;
      case COLLIDER_TYPE.WALL:
        hasCollidersOfType = this.antiColliderActive;
        break;
      case COLLIDER_TYPE.WALL_TOP:
        hasCollidersOfType = this.antiColliderTopActive;
        break;
      case COLLIDER_TYPE.CEILING:
        // Not implemented yet
        break;
      case COLLIDER_TYPE.PORTAL_WARP:
        hasCollidersOfType = this.hasPortalExit;
        break;
      case COLLIDER_TYPE.ROOM_WARP:
        hasCollidersOfType = this.hasRoomWarp;
        break;
      case COLLIDER_TYPE.ITEM:
        // Not implemented yet
        break;
      case COLLIDER_TYPE.SCRIPTED:
        // Not implemented yet
        break;
      case COLLIDER_TYPE.HOVERABLE:
        hasCollidersOfType = this.hasHoverables;
        break;
      case COLLIDER_TYPE.CLICKABLE:
        hasCollidersOfType = this.hasClickables;
        break;
    }

    return hasCollidersOfType;
  }

  // -- -- --

  /**
   * Get the colliders of a specific type.
   * @param {number} [colliderType=COLLIDER_TYPE.FLOOR] - The type of collider.
   * @returns {Array} The list of colliders.
   */
  getColliders( colliderType=COLLIDER_TYPE.FLOOR ){
    let forHashing = [];
    if( !this.hasColliders() ){
      return forHashing;
    }

    // Kick out if the collider type is not active
    //  ( No colliders of the given type exist )
    if( colliderType == COLLIDER_TYPE.WALL && !this.antiColliderActive ){
      forHashing = this.antiColliderList;
      return forHashing;
    }else if( colliderType == COLLIDER_TYPE.WALL_TOP && !this.antiColliderTopActive ){
      forHashing = this.antiColliderTopList;
      return forHashing;
    }else if( colliderType == COLLIDER_TYPE.PORTAL_WARP && !this.hasPortalExit ){
      forHashing = this.portalList;
      return forHashing;
    }else if( colliderType == COLLIDER_TYPE.ROOM_WARP && !this.hasRoomWarp ){
      forHashing = this.roomWarp;
      return forHashing;
    }else if( colliderType == COLLIDER_TYPE.HOVERABLE && !this.hasHoverables ){
      forHashing = this.hoverableList;
      return forHashing;
    }else if( colliderType == COLLIDER_TYPE.CLICKABLE && !this.hasClickables ){
      forHashing = this.clickableList;
      return forHashing;
    }
    
    // TODO : Quadrant hashing for colliders should be removed from pxlNav support, with new grid hashing system implemented
    // TODO : Maya tools and FBX requirements needs updating for the new collider system
    switch( colliderType ){
      case COLLIDER_TYPE.FLOOR:
        forHashing = [ ...this.colliderList ];
        break;
      case COLLIDER_TYPE.WALL:
        forHashing = [ ...this.colliderList ];
        break;
      case COLLIDER_TYPE.WALL_TOP:
        forHashing = [ ...this.antiColliderTopList ];
        break;
      case COLLIDER_TYPE.CEILING:
        // Not implemented yet
        break;
      case COLLIDER_TYPE.PORTAL_WARP:
        forHashing = this.portalList;
        break;
      case COLLIDER_TYPE.ROOM_WARP:
        forHashing = this.roomWarp;
        break;
      case COLLIDER_TYPE.ITEM:
        // Not implemented yet
        break;
      case COLLIDER_TYPE.SCRIPTED:
        // Not implemented yet
        break;
      default:
        break;
    }

    //forHashing = this.colliderHashMap;
    return forHashing;
  }

  // -- -- --

  /**
   * Add a visual collider helper.
   * @param {number} [colliderType=COLLIDER_TYPE.FLOOR] - The type of collider.
   * @example
   * // To add a floor collider helper
   * //   To visualize collider triangles in blue & green
   * // Run these helper functions in your rooms `build()` & `step()`-
   * build(){
   *  this.addColliderHelper( COLLIDER_TYPE.FLOOR );
   * }
   * 
   * step(){
   *  this.stepColliderHelper( COLLIDER_TYPE.FLOOR );
   * }
   */
  addColliderHelper( colliderType=COLLIDER_TYPE.FLOOR ){
    if( !this.hasColliders() ){
      return;
    }
    if( !this.helperObjects.hasOwnProperty('colliders') ){
      this.helperObjects['colliders'] = {};
      this.helperObjects['colliders'][colliderType] = null;
    }else if( !this.helperObjects['colliders'].hasOwnProperty(colliderType) ){
      this.helperObjects['colliders'][colliderType] = null;
    }

    // This is only used to easierly reveal the helper objects to the pxlRoom
    //   This is only for debugging purposes
    this.helperObjects['colliders'][colliderType] = this.pxlColliders.buildHelper( this, colliderType );

    if( this.helperObjects['colliders'][colliderType] ){
      this.scene.add( this.helperObjects['colliders'][colliderType] );
      this.hasHelpers = true;
    }
  }

  /**
   * Step the collider helper.
   * @param {number} [colliderType=COLLIDER_TYPE.FLOOR] - The type of collider.
   * @example
   * // To add a floor collider helper
   * //   To visualize collider triangles in blue & green
   * // Run these helper functions in your rooms `build()` & `step()`-
   * build(){
   *  this.addColliderHelper( COLLIDER_TYPE.FLOOR );
   * }
   * 
   * step(){
   *  this.stepColliderHelper( COLLIDER_TYPE.FLOOR );
   * }
   */
  stepColliderHelper( colliderType=COLLIDER_TYPE.FLOOR ){
    if( !this.hasHelpers ||
        !this.hasColliders() ||
        !this.helperObjects.hasOwnProperty('colliders') ||
        !this.helperObjects['colliders'].hasOwnProperty(colliderType) ){
      return;
    }

    this.helperObjects['colliders'][colliderType].stepHelper( this, colliderType );
  }


  // -- -- --
    
  /**
   * Move the camera to a specific position.
   * @param {string|null} [positionName=null] - The name of the position.
   */
  toCameraPos( positionName = null ){
    if( positionName == null ){
      positionName = this.defaultCamLocation;
    }
    positionName = positionName.toLowerCase();

    if( this.cameraBooted && this.camLocation.hasOwnProperty( positionName ) ){
      
      let posName = this.mobile?"positionmobile":"position";
      let lookAtName = this.mobile?"lookatmobile":"lookat";
      let pos=this.camLocation[ positionName ][ posName ];
      let lookAt=this.camLocation[ positionName ][ lookAtName ];
      if( !lookAt ){
        lookAt=new Vector3(0,0,1);
        lookAt.addVectors( pos, lookAt );
      }

      this.pxlEnv.pxlCamera.setTransform( this.camLocation[positionName][posName], this.camLocation[positionName][lookAtName] );
      this.setUserHeight( this.camInitPos.y );
    }
  }
    
  /**
   * Ran after the room's FBX loads & processes.
   */
  fbxPostLoad(){
    
    // Let pxlNav know the room is ready
    this.booted=true;

    // Force Camera to init position with optional init look at
    this.toCameraPos( this.defaultCamLocation );

    // Find Point light count for adjusted shadowing
    let pointLightCount = 0;
    if( this.lightList.hasOwnProperty("PointLight") ){
      pointLightCount = this.lightList.PointLight.length;
    }
    
    
    
    /*var ambientLight = new AmbientLight( 0x303030 ); // soft white light
    //this.lightList.push( ambientLight );
    this.scene.add( ambientLight );*/
    
    let lightTypeList = Object.keys( this.lightList );
    if(lightTypeList.length>0){
      lightTypeList.forEach( (type)=>{
        this.lightList[type].forEach( (light)=>{
          if( type == "DirectionalLight" ){ 
            light.castShadow=false;
          }else if( type == "PointLight" ){ 
            if( light.castShadow){
              light.shadow.radius = 5;
              light.shadow.receiveShadow = true;
              light.shadow.mapSize.width = 512; // default
              light.shadow.mapSize.height = 512; // default
              light.shadow.camera.near = 0.5; // default
              light.shadow.camera.far = 35; // default
              light.shadow.bias = .025; // default
              light.shadow.radius = 5; // default
            }
          }
        });
      });
    }
    
    
    if( this.shaderGeoList ) {
      for( const x in this.shaderGeoList){
        let curObj = this.shaderGeoList[x];
        if( curObj.userData && curObj.userData.Shader == "pxlPrincipled"){
          
          let shaderUniforms = UniformsUtils.merge(
              [
                UniformsLib[ "common" ],
                UniformsLib[ "lights" ],
                UniformsLib[ "shadowmap" ],
                {
                  'dTexture' : { type:'t', value: null },
                  'noiseTexture' : { type:'t', value: null },
                  'detailTexture' : { type:'t', value: null },
                  'cdMult' : { type:'f', value: 1 },
                  'fogColor' : { type: "c", value: this.scene.fog.color },
                }
              ]
          )
          var defines = {};
          defines[ "USE_MAP" ] = "";
          
          let ShaderParms = {};
          let useLights = true
          let useShadows = curObj.userData.castShadow == true || curObj.userData.receiveShadow == true
          let useFog = true;
          
          let useColor = false;
          if( !curObj.material.map ){
            useColor = curObj.material.color.clone();
          }
          
          // Add ShaderParms support
          if( curObj.userData.ShaderParms && curObj.userData.ShaderParms != "" ){
            ShaderParms = JSON.parse(curObj.userData.ShaderParms);
          }
          
          let mat=this.pxlFile.pxlShaderBuilder(
              shaderUniforms,
              pxlPrincipledVert( useShadows ),
              pxlPrincipledFrag( ShaderParms, useColor, useFog, useLights, useShadows, pointLightCount ),
              defines
            );
          //mat.side=FrontSide;
          mat.transparent= false;
          mat.lights= true;
          if(!useColor){
            mat.uniforms.dTexture.value = curObj.material.map;
          }
          mat.uniforms.noiseTexture.value = this.cloud3dTexture;
          mat.uniforms.detailTexture.value = this.pxlEnv.detailNoiseTexture;
              
          curObj.material=mat;
          this.materialList[ curObj.name ] = mat;
        }
      }
    }
    
    
    
    
    
    
    /*
    let envGroundUniforms = UniformsUtils.merge(
            [
              UniformsLib[ "common" ],
              UniformsLib[ "lights" ],
              UniformsLib[ "shadowmap" ],
              {
                'diffuse' : { type:'t', value: null },
                'dirtDiffuse' : { type:'t', value: null },
                'mult': { type:'f', value:1 },
                'fogColor': { type:'c', value: null },
                'noiseTexture' : { type:'t', value: null },
                'uniformNoise' : { type:'t', value: null },
                'crossNoise' : { type:'t', value: null },
              }
            ]
        );
    let textureOptions = {
        "wrapS" : RepeatWrapping,
        "wrapT" : RepeatWrapping,
    };
    envGroundUniforms.fogColor.value = this.scene.fog.color;
    envGroundUniforms.diffuse.value = this.pxlUtils.loadTexture( this.assetPath+"EnvGround_Diffuse.jpg" );
    envGroundUniforms.dirtDiffuse.value = this.pxlUtils.loadTexture( this.assetPath+"Dirt_Diffuse.jpg" );
    envGroundUniforms.noiseTexture.value = this.cloud3dTexture;
    envGroundUniforms.uniformNoise.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg" );
    envGroundUniforms.crossNoise.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_NCross.jpg" );
    
    let environmentGroundMat=this.pxlFile.pxlShaderBuilder( envGroundUniforms, envGroundVert(), envGroundFrag(1) );
    environmentGroundMat.lights= true;
    
    envGroundUniforms.uniformNoise.value.wrapS = RepeatWrapping;
    envGroundUniforms.uniformNoise.value.wrapT = RepeatWrapping;
    envGroundUniforms.crossNoise.value.wrapS = RepeatWrapping;
    envGroundUniforms.crossNoise.value.wrapT = RepeatWrapping;
    envGroundUniforms.dirtDiffuse.value.wrapS = RepeatWrapping;
    envGroundUniforms.dirtDiffuse.value.wrapT = RepeatWrapping;
    
    this.materialList[ "EnvironmentGround_Geo" ]=environmentGroundMat;
    */
    
    
    
  }
  
  /**
   * Ran after the room's animation FBX files load & process.
   * @param {string} animKey - The animation key.
   * @param {Object} animMixers - The animation mixers.
   */
  animPostLoad( animKey, animMixers ){
    if( this.pxlAnim.hasClip( animKey, this.animInitCycle ) ){
      let animMixer = this.pxlAnim.getMixer( animKey );
      this.animMixer = animMixer;
      
      this.pxlAnim.playClip( animKey, this.animInitCycle );
    }else{
      this.animInitCycle = fallback;
      this.log("No animation cycle '"+this.animInitCycle+"' found; Using '"+fallback+"' instead");
    }
  }
  
// -- -- -- -- -- -- -- -- -- -- -- -- -- //

  /**
   * Build the scene and assets.
   */
  build(){
    // Attempt to build the FBX if it exists
    if( !this.sceneFile ){
      return;
    }
    this.pxlFile.loadRoomFBX( this ) 
  }

// -- -- -- -- -- -- -- -- -- -- -- -- -- //

  /**
   * Handle incoming messages.
   * @param {string} msgType - The type of message.
   * @param {Object} msgValue - The value of the message.
   */
//   Custom implementation of HTML/GUI in conjunction with pxlNav
//     Lets get some incoming messages to trigger some stuffs!
  onMessage( msgType, msgValue ){
    console.log("Room : "+this.roomName+" - Message Received: "+msgType);
    console.log("Message : "+msgValue);
    msgType = msgType.toLowerCase();
    switch( msgType ){
      case "roomwarp":
        this.roomWarp=msgValue;
        break;
        default:
      case "roommessage":
        console.log( "-- Message Type Not Recognized -- " );
        console.log( "Room : "+this.roomName );
        console.log( "Message Received: "+msgType );
        console.log( "Message : "+msgValue );
        break;
    }
  }
}



export { RoomEnvironment };