
import {
  Vector2,
  Vector3,
  Color,
  Group,
  Object3D,
  AmbientLight,
  FogExp2,
  SRGBColorSpace,
  RepeatWrapping,
  ClampToEdgeWrapping,
  UniformsUtils,
  UniformsLib,
  FrontSide,
  DoubleSide
} from "../../libs/three/three.module.min.js";
/*ShaderMaterial*/

import {
        envGroundVert, envGroundFrag,
        grassClusterVert, grassClusterFrag,
        creekWaterVert, creekWaterFrag,
        pondWaterVert, pondWaterFrag,
        woodenDockVert, woodenDockFrag,
      } from "./Shaders.js";
import { RoomEnvironment, pxlShaders, pxlEffects } from "../../pxlNav.js";

const pxlPrincipledVert = pxlShaders.objects.pxlPrincipledVert;
const pxlPrincipledFrag = pxlShaders.objects.pxlPrincipledFrag;
const FloatingDust = pxlEffects.pxlParticles.FloatingDust;

export class OutletEnvironment extends RoomEnvironment{
  constructor( roomName='OutletEnvironment', assetPath=null, msRunner=null, camera=null, scene=null, cloud3dTexture=null ){
    super( roomName, assetPath, msRunner, camera, scene, cloud3dTexture );

    // Your `Assets` folder path
    //   Defaults to " ./ pxlRooms / *YourRoomEnv* / Assets "
		this.assetPath= assetPath + "Assets/";

    // The FBX file to load for your room
    //   Defaults to " ./ pxlRooms / *YourRoomEnv* / Assets / *YourSceneFile.fbx* "
    this.sceneFile = this.assetPath+"OutletEnvironment.fbx";
		
		// Environment Shader 
		this.spiralizerUniforms={};
		this.materialList={};
    
		// Device Field-of-View
    this.pxlCamFOV={ 'PC':60, 'MOBILE':80 };
    
    // Near-Far Clipping Planes for your room
    this.pxlCamNearClipping = 3;
    this.pxlCamFarClipping = 12000;

    // Room Fog Settings
    this.fogColor=new Color( 0x48415d );
    this.fogExp=.0007;
    this.fog=new FogExp2( this.fogColor, this.fogExp);
        
		
    // Commonly Accessed Variables --
    //   Set when your scene's FBX Loads
    //
		// this.startTime=0;
		// this.runTime=new Vector2(0, 0);
		// this.msRunner=msRunner;
		// this.camera=camera;
		// this.scene=scene;
		// this.geoList={}
		// this.autoCamPaths={};
		// this.lightList={}
		// this.glassList=[]
		

    // pxlNav Noise Texture Assets --
    //   Auto-assigned before `this.build()` is ran
    //
		// this.cloud3dTexture=null;
		// this.smoothNoiseTexture=null;

    // -- -- --

    // Less Common Variables--
    //
		// this.portalList={};
		// this.hasHoverables=false;
		// this.hoverableList=[];
    // this.hoverableObj=null;
		// this.hasClickables=false;
		// this.clickableList=[];
    // this.clickableObj=null;
		
		// this.roomWarp=[];
		// this.warpPortalTexture=null;
		// this.warpZoneRenderTarget=null;
        
    // this.worldPosMaterial=null;
		// this.worldPosRenderTarget=null;
		
	}


// Ran after core `pxlNav` modules have been loaded and initialized
//   But before the render composers / post-processing
	init(){
    super.init();
    // -- Put your room initialization code here --
  }

// Run on init room warp; reset room values
	start(){
    super.start();
    // -- Put your room starting code here --
  }
	
// Per-Frame Render updates
	step(){
    super.step();
    // -- Put your per-frame code here --
	}

// When leaving the room
	stop(){
    super.stop();
    // -- Put your room stopping code here --
  }
	
// Runs on window resize
  resize( sW, sH ){
    super.resize( sW, sH );
    // -- Put your resize code here --
  }
	
	// -- -- --
      
    

// -- -- -- -- -- -- -- -- -- -- -- -- -- //
// -- -- -- -- -- -- -- -- -- -- -- -- -- //
// -- -- -- -- -- -- -- -- -- -- -- -- -- //


// OutletEnvironment Helper Functions

buildDust(){
  let vertexCount = 1200; // Point Count
  let pScale = 11;  // Point Base Scale

  let systemName = "floatingDust";
  let dustSystem = new FloatingDust( this, systemName, 200 );

  // Use a texture from the internal pxlNav asset folder
  dustSystem.useInternalAsset( "sprite_dustAtlas.png" );
  
  // Generate geometry and load texture resources
  dustSystem.build( vertexCount, pScale );

  this.particleList[systemName] = dustSystem;
}


// -- -- --
    

// -- -- -- -- -- -- -- -- -- --
// -- Post FBX Load & Build - -- --
// -- -- -- -- -- -- -- -- -- -- -- --
    
	fbxPostLoad(){
    super.fbxPostLoad();

    // Add some floating dust particles around the camera
    this.buildDust();
    
    // Adding a basic ambient light
    var ambientLight = new AmbientLight( 0x383838 ); // soft white light
    this.scene.add( ambientLight );
    
    //this.addColliderHelper( this.geoList['colliderHelper'] );
    this.setUserHeight( 22.5 );

  }
	


// -- -- -- -- -- -- -- -- --
// -- Build Scene & Assets -- --
// -- -- -- -- -- -- -- -- -- -- --

	build(){
    
    //
    // Three texture options for loading
    let textureOptionsRepeat = {
      'wrapS' : RepeatWrapping,
      'wrapT' : RepeatWrapping
    };
    let textureOptionsSRGB = {
      'encoding':SRGBColorSpace,
      'wrapS' : RepeatWrapping,
      'wrapT' : RepeatWrapping
    };
    let textureOptionsClamp = {
      'wrapS' : ClampToEdgeWrapping,
      'wrapT' : ClampToEdgeWrapping
    };

    // -- -- --

    let envGroundUniforms = UniformsUtils.merge(
      [
        UniformsLib[ "common" ],
        UniformsLib[ "lights" ],
        /*UniformsLib[ "shadowmap" ],*/
        {
          'diffuse' : { type:'t', value: null },
          'dirtDiffuse' : { type:'t', value: null },
          'crackedDirtDiffuse' : { type:'t', value: null },
          'hillDiffuse' : { type:'t', value: null },
          'grassDiffuse' : { type:'t', value: null },
          'mossDiffuse' : { type:'t', value: null },
          'dataTexture' : { type:'t', value: null },
          'mult': { type:'f', value:1 },
          'fogColor': { type:'c', value: null },
          'noiseTexture' : { type:'t', value: null },
          'uniformNoise' : { type:'t', value: null },
        }
      ]
    );

    envGroundUniforms.fogColor.value = this.scene.fog.color;
    envGroundUniforms.diffuse.value = this.pxlUtils.loadTexture( this.assetPath+"EnvGround_Diffuse.jpg", null, textureOptionsSRGB );

    envGroundUniforms.dirtDiffuse.value = this.pxlUtils.loadTexture( this.assetPath+"Dirt_Diffuse.jpg", null, textureOptionsSRGB );
    envGroundUniforms.crackedDirtDiffuse.value = this.pxlUtils.loadTexture( this.assetPath+"CrackedDirtGround_diffuse.jpg", null, textureOptionsSRGB );
    envGroundUniforms.hillDiffuse.value = this.pxlUtils.loadTexture( this.assetPath+"RockLayerDirtHill_diffuse.jpg", null, textureOptionsSRGB );
    envGroundUniforms.grassDiffuse.value = this.pxlUtils.loadTexture( this.assetPath+"GrassA_diffuse.jpg", null, textureOptionsSRGB );
    envGroundUniforms.mossDiffuse.value = this.pxlUtils.loadTexture( this.assetPath+"MossyGround_diffuse.jpg", null, textureOptionsSRGB );

    envGroundUniforms.dataTexture.value = this.pxlUtils.loadTexture( this.assetPath+"EnvGround_Data.jpg", null, textureOptionsClamp );

    envGroundUniforms.noiseTexture.value = this.cloud3dTexture;
    envGroundUniforms.uniformNoise.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg", null, textureOptionsRepeat );
    
		let environmentGroundMat=this.pxlFile.pxlShaderBuilder( envGroundUniforms, envGroundVert(), envGroundFrag(1) );
    environmentGroundMat.lights= true;

  //
    // -- -- -- 

    // -- -- -- -- -- -- -- -- -- -- -- -- --
    // -- Grass Cluster Instances Material -- --
    // -- -- -- -- -- -- -- -- -- -- -- -- -- -- --


    let grassCardsAUniforms = UniformsUtils.merge(
      [
      UniformsLib[ "lights" ],
      /*UniformsLib[ "shadowmap" ],*/
      {
        'diffuse' : { type:'t', value: null },
        'alphaMap' : { type:'t', value: null },
        /*'normalMap' : { type:'t', value: null },*/
        'noiseTexture' : { type:'t', value: null },
        'fogColor' : { type: "c", value: this.fogColor }
      }]
    )
    grassCardsAUniforms.noiseTexture.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg" );
    grassCardsAUniforms.diffuse.value = this.pxlUtils.loadTexture( this.assetPath+"grassCardsA_diffuse.jpg" );
    grassCardsAUniforms.alphaMap.value = this.pxlUtils.loadTexture( this.assetPath+"grassCardsA_alpha.jpg" );
    //grassCardsAUniforms.normalMap.value = this.pxlUtils.loadTexture( this.assetPath+"grassCardsA_normal.jpg" );

    let grassCardsMat=this.pxlFile.pxlShaderBuilder( grassCardsAUniforms, grassClusterVert(), grassClusterFrag( true ) );
    grassCardsMat.side = DoubleSide;
    grassCardsMat.lights = true;
    grassCardsMat.transparent = false;
    //grassCardsMat.alphaTest = .5;
    //grassCardsMat.blending = ;
    
        
    // -- -- --
    

    // -- -- -- -- -- -- -- -- -- -- -- -- --
    // -- Grass Cluster Instances Material -- --
    // -- -- -- -- -- -- -- -- -- -- -- -- -- -- --


    let grassClusterUniforms = UniformsUtils.merge(
      [
      UniformsLib[ "lights" ],
      /*UniformsLib[ "shadowmap" ],*/
      {
        'noiseTexture' : { type:'t', value: null },
        'fogColor' : { type: "c", value: this.fogColor },
      }]
    )
    grassClusterUniforms.noiseTexture.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg" );

    let grassMat=this.pxlFile.pxlShaderBuilder( grassClusterUniforms, grassClusterVert(), grassClusterFrag() );
    grassMat.side = FrontSide;
    grassMat.lights = true;
    grassMat.transparent = false;
    
        
    // -- -- --
    
    
    // -- -- -- -- -- -- -- -- -- --
    // -- Fishing Pond Material - -- --
    // -- -- -- -- -- -- -- -- -- -- -- --


    let woodenDockUniforms = UniformsUtils.merge(
      [
      UniformsLib[ "lights" ],
      {
        'noiseTexture' : { type:'t', value: null },
        'fogColor' : { type: "c", value: this.fogColor },
      }]
    )
    woodenDockUniforms.noiseTexture.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg" );

    let woodenDockMat=this.pxlFile.pxlShaderBuilder( woodenDockUniforms, woodenDockVert(), woodenDockFrag() );
    woodenDockMat.side = FrontSide;
    woodenDockMat.lights = true;
    
        
    // -- -- --
    
    
    // -- -- -- -- -- -- -- -- -- --
    // -- Fishing Pond Material - -- --
    // -- -- -- -- -- -- -- -- -- -- -- --


    let pondWaterUniforms = UniformsUtils.merge(
      [
      UniformsLib[ "lights" ],
      {
        'dataTexture' : { type:'t', value: null },
        'coastLineTexture' : { type:'t', value: null },
        'rippleTexture' : { type:'t', value: null },
        'noiseTexture' : { type:'t', value: null },
        'fogColor' : { type: "c", value: this.fogColor },
        'rate': { type:'f', value:1 },
        'intensity': { type:'f', value:1 },
      }]
    )
    pondWaterUniforms.dataTexture.value = this.pxlUtils.loadTexture( this.assetPath+"WaterWay_Data.jpg" );
    pondWaterUniforms.coastLineTexture.value = this.pxlUtils.loadTexture( this.assetPath+"WaterWay_CoastLine.jpg" );
    pondWaterUniforms.rippleTexture.value = this.pxlUtils.loadTexture( this.assetPath+"WaterRipples_CoastalB.jpg", textureOptionsRepeat );
    pondWaterUniforms.noiseTexture.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg", textureOptionsRepeat );

    let pondWaterMat=this.pxlFile.pxlShaderBuilder( pondWaterUniforms, pondWaterVert(), pondWaterFrag() );
    pondWaterMat.side = FrontSide;
    pondWaterMat.lights = true;
    pondWaterMat.transparent = true;
    pondWaterMat.frustumCulled = false;
    
    pondWaterMat.meshSettings = {
      'renderOrder' : 2,
    };
        
    // -- -- --
    
    
    // -- -- -- -- -- -- -- -- -- --
    // -- Fishing Pond Material - -- --
    // -- -- -- -- -- -- -- -- -- -- -- --


    let creekWaterUniforms = UniformsUtils.merge(
      [
      UniformsLib[ "lights" ],
      {
        'dataTexture' : { type:'t', value: null },
        'rippleTexture' : { type:'t', value: null },
        'noiseTexture' : { type:'t', value: null },
        'fogColor' : { type: "c", value: this.fogColor },
        'rate': { type:'f', value:1 },
        'intensity': { type:'f', value:1 },
      }]
    )
    creekWaterUniforms.dataTexture.value = this.pxlUtils.loadTexture( this.assetPath+"CreekWater_Data.jpg" );
    creekWaterUniforms.rippleTexture.value = this.pxlUtils.loadTexture( this.assetPath+"WaterRipples_CoastalB.jpg" );
    creekWaterUniforms.noiseTexture.value = this.pxlUtils.loadTexture( this.assetPath+"Noise_UniformWebbing.jpg" );

    let creekWaterMat=this.pxlFile.pxlShaderBuilder( creekWaterUniforms, creekWaterVert(), creekWaterFrag() );
    creekWaterMat.side = FrontSide;
    creekWaterMat.lights = true;
    creekWaterMat.transparent = true;
    creekWaterMat.frustumCulled = false;

    creekWaterMat.meshSettings = {
      'renderOrder' : 3,
    };


    // -- -- --
    
    // Assign which materials to which geometry

    this.materialList[ "EnvGround_geo" ] = environmentGroundMat;

    this.materialList[ "grassCardsA_lod0_geo" ] = grassCardsMat;
    this.materialList[ "grassCardsA_lod1_geo" ] = grassCardsMat;
    this.materialList[ "grassCardsA_lod2_geo" ] = grassCardsMat;

    this.materialList[ "grassClusterA_geo" ] = grassMat;

    this.materialList[ "swampGrassA_lod0_geo" ] = grassMat;
    this.materialList[ "swampGrassA_lod1_geo" ] = grassMat;

    this.materialList[ "tallSwampGrassA_lod0_geo" ] = grassMat;
    this.materialList[ "tallSwampGrassA_lod1_geo" ] = grassMat;
    
    this.materialList[ "catTailA_lod0_geo" ] = grassMat;
    this.materialList[ "catTailA_lod1_geo" ] = grassMat;

    this.materialList[ "woodenDock_geo" ] = woodenDockMat;
    this.materialList[ "pondWater_geo" ] = pondWaterMat;

    this.materialList[ "creekWater_geo" ] = creekWaterMat;
    
  //
    // -- -- -- 
        
		let fieldFbxLoader = this.pxlFile.loadRoomFBX( this ) ;//, null, null, true );
		
	// -- -- -- -- -- -- -- -- -- -- -- -- -- //
		
	}
    
    
}