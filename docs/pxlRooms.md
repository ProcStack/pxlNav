# pxlNav Docs - pxlRooms
### Your custom FBX environment
This is the rundown of your `pxlRoom` and loading your resources.
<br/>&nbsp;&nbsp; FBX Scene File, pxlRoom, and interact!


## <br/>**Index**
* [Intro](#intro)
* [Common Variable Rundown](#run-down-of-common-variables)
* [pxlRoom Simple Template](#pxlroom-simple-template)
* [pxlRoom Full Template](#pxlroom-full-template)
<br/>

## Intro

Your room is where all your custom JavaScript can be added.

If you are familiar with game engine `Unity`, the functions in your pxlRoom are ran in response to the `pxlNav` runtime.
<br/>`init()`, `build()`, `start()`, `stop()`, `step()`, etc.

Make sure that if your textures arn't baked into your FBX,
<br/>&nbsp;&nbsp; You'll need to include your textures along side your FBX file
<br/>The default location for your assets folder is --
<br>`./js/pxlRooms/YourRoomName/Assets`
<br/>&nbsp;&nbsp; You'll need to include your textures along side your FBX file
<br/>Change where your Assets live by updating  -
<br/>&nbsp;&nbsp; ```this.assetPath=assetPath+"Assets/";```


If you have any hoverable or clickable objects in your scene,
<br/>&nbsp;&nbsp; By adding `Hover=1` or `Click=1` to any objects in your FBX,
<br/>Make sure to enable ` this.enableRaycasting = true; `
<br/>&nbsp;&nbsp; Mouse move and drag events will automatically trigger the `castRay()` function.

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------


## Run down of common variables
<br/>&nbsp;&nbsp; This is not all of the variables, just the ussual variables you'll be accessing.


### Commonly Accessed Variables --
<br/>- Set when your scene's FBX Loads -
<br/>&nbsp;&nbsp; `this.startTime = 0;`
<br/>&nbsp;&nbsp; `this.runTime = new Vector2(0, 0);`
<br/>&nbsp;&nbsp; `this.msRunner = msRunner;`
<br/>&nbsp;&nbsp; `this.camera = camera;`
<br/>&nbsp;&nbsp; `this.scene = scene;`
<br/>&nbsp;&nbsp; `this.geoList = {};`
<br/>&nbsp;&nbsp; `this.autoCamPaths = {};`
<br/>&nbsp;&nbsp; `this.lightList = {};`
<br/>&nbsp;&nbsp; `this.glassList = [];`


### pxlNav Noise Texture Assets --
<br/>&nbsp;&nbsp;   Auto-assigned before `this.build()` is ran

<br/>&nbsp;&nbsp; `this.cloud3dTexture = null;`
<br/>&nbsp;&nbsp; `this.smoothNoiseTexture = null;`

<br/>&nbsp;&nbsp; -- -- --

### Less Common Variables--

<br/>&nbsp;&nbsp; `this.portalList = {};`
<br/>&nbsp;&nbsp; `this.hasHoverables = false;`
<br/>&nbsp;&nbsp; `this.hoverableList = [];`
<br/>&nbsp;&nbsp; `this.hoverableObj = null;`
<br/>&nbsp;&nbsp; `this.hasClickables = false;`
<br/>&nbsp;&nbsp; `this.clickableList = [];`
<br/>&nbsp;&nbsp; `this.clickableObj = null;`

<br/>&nbsp;&nbsp; `this.roomWarp = [];`
<br/>&nbsp;&nbsp; `this.warpPortalTexture = null;`
<br/>&nbsp;&nbsp; `this.warpZoneRenderTarget = null;`

<br/>&nbsp;&nbsp; `this.worldPosMaterial = null;`
<br/>&nbsp;&nbsp; `this.worldPosRenderTarget = null;`


##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------


---

## pxlRoom Simple Template

```

import {
  Color,
  Group,
  AmbientLight,
  FogExp2,
} from "../../libs/three/three.module.min.js";

import { RoomEnvironment, pxlEffects } from "../../pxlNav.js";

// To add in some particle effects, you can use the `pxlEffects` module
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
        
		// For more information on the `pxlRoom Environment` class, see the documentation -
    //   './docs/pxlRooms.md'
		
	}

// -- -- --

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


// -- -- -- -- -- -- -- -- --
// -- Helper Functions  -- -- --
// -- -- -- -- -- -- -- -- -- -- --


buildDust(){
  let vertexCount = 1200; // Point Count
  let pScale = 11;  // Point Base Scale

  let systemName = "floatingDust";
  let dustSystem = new FloatingDust( this, systemName, 200 );

  // Use a texture from the internal pxlNav asset folder
  dustSystem.setAtlasPath( "sprite_dustLiquid_rgb.jpg", "sprite_dustLiquid_alpha.jpg" );
  
  // Generate geometry and load texture resources
  dustSystem.build( vertexCount, pScale );

  this.particleList[systemName] = dustSystem;
}
    

// -- -- -- -- -- -- -- -- -- --
// -- Post FBX Load & Build - -- --
// -- -- -- -- -- -- -- -- -- -- -- --
    
	fbxPostLoad(){
    super.fbxPostLoad();

    // Add a particle system of dust in the scene
    // this.buildDust()
    
    // Adding a basic ambient light
    //var ambientLight = new AmbientLight( 0x383838 ); // soft white light
    //this.scene.add( ambientLight );
    
    // Created a ground collider helper to display the collision mesh in your scene
    //this.addColliderHelper( this.geoList['colliderHelper'] );

    this.setUserHeight( 22.5 );
  }
	

// -- -- -- -- -- -- -- -- --
// -- Build Scene & Assets -- --
// -- -- -- -- -- -- -- -- -- -- --

	build(){
		this.pxlFile.loadRoomFBX( this ) ;;
	}
}

```

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------




## pxlRoom Full Template
```
import * as THREE from "../../three.module.min.js";
import { pxlEffects, RoomEnvironment } from "../../pxlNav.esm.js";

// Lets add a particle effect to the room
//   This is lingering dust that floats around the user to give a sense of movement
// See `buildDust()` below for more details
const FloatingDust = pxlEffects.pxlParticles.FloatingDust;

export class OutletEnvironment extends RoomEnvironment{
  constructor( roomName='OutletEnvironment', assetPath=null, pxlFile=null, pxlAnim=null, pxlUtils=null, pxlDevice=null, pxlEnv=null, msRunner=null, camera=null, scene=null, cloud3dTexture=null ){
    super( roomName, assetPath, pxlFile, pxlAnim, pxlUtils, pxlDevice, pxlEnv, msRunner, camera, scene, cloud3dTexture );
    
		this.assetPath=assetPath+"Assets/";
    
    this.sceneFile = this.assetPath+"OutletEnvironment.fbx";
		
    // This is 
		this.envObjName="CabinEnv";

		// For your Geometry object Material overrides -
    //   Assign your ''
		this.materialList={};
		
    // Your camera settings
    this.pxlCamFOV=(pxlDevice.mobile?80:60);
		this.pxlCamZoom=1;
		this.pxlCamAspect=1;
    this.pxlCamNearClipping = 5;
    this.pxlCamFarClipping = 10000;

    // Your fog color
    this.fogColor=new THREE.Color(.01,.02,.05);


    // Animation Source & Clips are managed under the hood,
    //   So you only need to set your rig, animations, and connections in one room.
    // Current issue, re-imports will re-read the file from disk/url,
    //   But wont overwrite the data if it exists from a prior Room's load.
    /*
    this.animRigName = "RabbitDruidA";
    this.animSource = {};
    this.animSource[ this.animRigName ] = {
      "rig" : this.assetPath+"RabbitDruidA/RabbitDruidA_rig.fbx",
      "anim" : {
        "Sit_Idle" : this.assetPath+"RabbitDruidA/RabbidDruidA_anim_sit_idle.fbx",
        "Sit_Stoke" : this.assetPath+"RabbitDruidA/RabbidDruidA_anim_sit_stoke.fbx"
      },
      "stateConnections"  : {
        // Non existing states will be ignored and loop'ed, ie "Walk"
        "Sit_Idle" : [ "Sit_Idle", "Sit_Stoke" ],
        "Sit_Stoke" : ["Sit_Idle"]
      }
    };
    this.animInitCycle = "Sit_Idle";
    */


    // If you have Clickable or Hoverable objects in your room's FBX file
    //   Set this true to enable raycasting for them, see `castRay()` below
    // this.enableRaycasting=true;
	}

// -- -- --

	init(){
    super.init();  // Required

    // This is ran early in the boot process, before the main run loop begins
    //   You can use this to set up any initial values or assets you need for the room
    
    // Add your custom initialization code here --

  }

// -- -- --

// Build Scene and Assets
  build(){
      
    // This will load the FBX file and call fbxPostLoad() when done loading
    //   This will read the fbx from `this.sceneFile` and load it into the scene
    this.pxlFile.loadRoomFBX( this );
    
  }

// -- -- --

// Runs if initial boot room on boot -or- when room-warps between pxlRooms occur
	start(){
    // Start running any animations if needed
    /*
    if( this.pxlAnim && this.pxlAnim.hasClip( animKey, this.animInitCycle ) ){
      this.pxlAnim.playClip( animKey, this.animInitCycle );
    }
    */
  }

// Runs when leaving the room
  stop(){}
	
// -- -- --

// Per-Frame Render updates
	step(){
    super.step(); // Required
		
    // If you have animations running, you can step them here
    //   Cycle changes occur during the `pxlAnim.step()` call
    /*
    if(this.animMixer){
      this.pxlAnim.step( this.animRigName );
      this.checkEyeBlink();
    }
    */

    // Add your custom per-frame code here --

	}

// -- -- --

// Runs after the FBX file is fully loaded and processed
  fbxPostLoad(){

    // Lets add an effect to the room
    //   See `buildDust()` below for more details
    this.buildDust();

    // Do any Three.js post processing if desired
    var ambientLight = new THREE.AmbientLight( 0x101010 ); // soft white light
    this.scene.add( ambientLight );

    // Set your 'Free-Roam' player height for the room
    //   If you are using the 'Static' camera mode, you don't need to run this.
    this.setUserHeight( 15 );

    // Confirm the room is booted to complete the loading process
    this.booted=true; 

  }
	
// -- -- --

  // Spawn in some floating dust into the scene
  //   This is ran after the FBX file is loaded in `fbxPostLoad()`
  buildDust(){
    let vertexCount = 1200; // Point Count
    let pScale = 11;  // Point Base Scale
    let proxDist = 120; // Proximity the particles pass by the camera
    let windDirection = [0.0,1.0]; // Wind Direction in [x, z]

    let systemName = "floatingDust";
    let dustSystem = new FloatingDust( this, systemName );

    // Use a texture from the internal pxlNav asset folder
    dustSystem.setAtlasPath( "sprite_dustLiquid_rgb.jpg", "sprite_dustLiquid_alpha.jpg" );
    
    // Set Texture Picks from the Atlas
    let atlasPicks = [
      ...super.dupeArray([0.0,0.],4), ...super.dupeArray([0.25,0.],4),
      ...super.dupeArray([0.5,0.0],2), ...super.dupeArray([0.5,0.25],2),
      ...super.dupeArray([0.5,0.5],2), ...super.dupeArray([0.5,0.75],2)
    ];

    // Generate geometry and load texture resources
    //   This will add the system to the scene, you don't need to manage it yourself
    dustSystem.build( vertexCount, pScale, proxDist, windDirection, atlasPicks );

    // If you'd like to access the system later,
    //   `this.particleList` is a known {} object that you can add it to
    this.particleList[systemName] = dustSystem;
  }
    

// -- -- --

// Runs when the animation Rig & Cycle FBX files are ready to play
//   `animKey` is the key you set in `this.animSource`
//     For this example, it is `this.animRigName`
  animPostLoad( animKey ){
    super.animPostLoad( animKey ); // Optional
    
    // If you need to modify the material of a mesh or rig in the scene
    //   You can access the mesh & rig from the `pxlAnim` object
    let curMesh = this.pxlAnim.getMesh( animKey );
    if(curMesh){
      let curMtl = curMesh.material;
      curMtl.side = THREE.DoubleSide;
      let newSkinnedMtl = this.setSkinnedMaterial( curMesh, rabbitDruidVert(), rabbitDruidFrag() );
      this.materialList[ "RabbitDruidA" ] = newSkinnedMtl;
    }
  }

// -- -- --
    
// Runs when the window resizes
resize( sW, sH ){}
	
    
// -- -- --


// Recive outside messages with -
//  `pxlNav.trigger( "roomMessage", *this room's name*, {'your' : 'data'} );`
//   Custom implementation of HTML/GUI in conjunction with pxlNav
//     Lets get some incoming messages to trigger some stuffs!
  onMessage( msgType, msgValue ){
    console.log("Room : "+this.roomName+" - Message Received: "+msgType);
    console.log("Message : "+msgValue);
  }


// -- -- --
    

// If you have Clickable or Hoverable objects in your room's FBX file
//  `isClick` is true if the mouse button is down and false if it is just hovering
//  `mButton` is the mouse button that is down, 0 for left, 1 for middle, 2 for right
  castRay( isClick, mButton ){
    super.castRay( isClick, mButton ); // Required
    if( this.mouseRayHits.length > 0 ){
      //console.log( this.mouseRayHits );
    }
  }
  
// -- -- --

// If you'd like to add a custom post processing effect to the room
//   Return the ShaderPass object to apply it to the room
applyRoomPass( roomComposer=null ){
  /*if(roomComposer){
       = new ShaderPass(
          new THREE.ShaderMaterial( {
              uniforms: {
                  tDiffuse: { value: null }, // The base sampler2d uniform of your rendered room, leave as `null`
                  noiseTexture: { value: this.pxlEnv.cloud3dTexture },
                  time:{ value:this.msRunner },
                  screenRes: { value: this.pxlDevice.screenRes },
              },
              vertexShader: StandInShadert_Vert(),
              fragmentShader: StandInShadert_Frag(),
              defines: {}
          } ), "tDiffuse"
      );
      this.spiralizerPass.enabled=false;
      
      return this.spiralizerPass;
  }*/
}

	
// -- -- -- -- -- -- -- -- -- -- -- -- -- //
	
}
```

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------


