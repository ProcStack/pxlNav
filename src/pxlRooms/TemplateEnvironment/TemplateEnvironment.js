
import * as THREE from "../../three.module.min.js";
import { pxlEffects, RoomEnvironment } from "../../pxlNav.esm.js";

// Lets add a particle effect to the room
//   This is lingering dust that floats around the user to give a sense of movement
// See `buildDust()` below for more details
const FloatingDust = pxlEffects.pxlParticles.FloatingDust;

export class TemplateEnvironment extends RoomEnvironment{
  constructor( roomName='TemplateEnvironment', assetPath=null, pxlFile=null, pxlAnim=null, pxlUtils=null, pxlDevice=null, pxlEnv=null, msRunner=null, camera=null, scene=null, cloud3dTexture=null ){
    super( roomName, assetPath, pxlFile, pxlAnim, pxlUtils, pxlDevice, pxlEnv, msRunner, camera, scene, cloud3dTexture );
    
		this.assetPath=assetPath+"Assets/";
		this.assetPath="./js/pxlRooms/TemplateEnvironment/Assets/";
    
    this.sceneFile = this.assetPath+"TemplateEnvironment.fbx";
		
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
    dustSystem.useInternalAsset( "sprite_dustAtlas.png" );
    
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