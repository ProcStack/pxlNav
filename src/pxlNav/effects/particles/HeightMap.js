// Height-Map based, Bound Box fit, Particle System for pxlNav
//   Written by Kevin Edzenga; 2025

import {
  Vector3,
  NearestFilter,
  LinearFilter,
  NearestMipmapNearestFilter,
  LinearMipmapLinearFilter,
  AdditiveBlending
} from "../../../libs/three/three.module.min.js";

import { ParticleBase } from './ParticleBase.js';
import { heightMapVert, heightMapFrag } from './shaders/HeightMap.js';


/**
 * Class representing a HeightMap particle system.
 * Extends the ParticleBase class.
 * 
 * Access at - `pxlNav.pxlEffects.pxlParticles.HeightMap`
 * 
 * Extends - [ParticleBase]{@link ParticleBase}
 * 
 * @alias pxlParticles/HeightMap
 * @class
 * @memberof pxlNav.pxlEffects.pxlParticles
 * @example
 * this.shaderSettings = {
 *   "vertCount" : 1000,
 *   "pScale" : 7,
 *   "pOpacity" : 1.0,
 *   "proxDist" : 200,
 *   "atlasRes" : 4,
 *   "atlasPicks" : [],
 *   "randomAtlas" : false,
 *   "additiveBlend" : false,
 *
 *   "jumpHeightMult" : 0,
 *   "offsetPos" : new Vector3( 0, 0, 0 ),
 *   "windDir" : new Vector3( 0, 0, 0 ),
 *
 *   "size" : new Vector3( 0, 0, 0 ),
 *
 *   "hasLights" : false,
 *   "fadeOutScalar" : 1.59 , 
 *   "wanderInf" : 1.0 , 
 *   "wanderRate" : 1.0 , 
 *   "wanderFrequency" : 2.85 
 * }
 *@example
 * // HeightMap particle system
 * //   Generate a system that uses a height map to set the Y position of the particles
 * //   With a spawn map to determine the density of the particles
 * //   Set noise and other settings to alter the particles
 * import { Object3D } from "three";
 * import { pxlEffects } from "pxlNav.esm.js";
 * const HeightMap = pxlEffects.pxlParticles.HeightMap; 
 * 
 * // You can put this in yuor `fbxPostLoad()` or `build()` function
 * fbxPostLoad(){
 *   
 *   // Create the HeightMap system
 *   let heightMapSystem = new HeightMap( this, "heightMap" );
 *   
 *   // Set the paths for the height map
 *   heightMapSystem.setHeightMapPath( "path/to/heightMap.jpg" );
 *   
 *   // Set the paths for the spawn map
 *   heightMapSystem.setSpawnMapPath( "path/to/spawnMap.jpg", 1 ); // 1 for single channel map, 3 for RGB
 *   
 *   // Get a copy of the current particle systems settings
 *   //   Update the settings as needed
 *   let curShaderSettings = heightMapSystem.getSettings();
 *   curShaderSettings["vertCount"] = 600; // Number of particles
 *   curShaderSettings["pScale"] = 9; // Scale of the particles
 *   curShaderSettings["pOpacity"] = 0.8; // Opacity of the particles
 *   curShaderSettings["proxDist"] = 400; // Proximity distance
 *   curShaderSettings["additiveBlend"] = true; // Additive blending for the particles
 *   
 *   // Create a 3D object to use as a reference for the particle system
 *   //   The position is used for the system's position
 *   //   The scale is used for bounding box size of the system 
 *   let objectRef = new Object3D();
 *   objectRef.position.set( 0, 0, 0 );
 *   objectRef.scale.set( 1000, 100, 1000 );
 *   
 *   // If you used a 3D object in your FBX file, you can use it to set the size
 *   //   The object should have a userData property with `Scripted`{bool}
 *   //   To set the bounding box size, set your objects scale
 *   //     Or use these user attributes - `SizeX`{num}, `SizeY`{num}, & `SizeZ`{num}
 *   // let objectRef = this.geoList[ "Scripted" ][ "YouObjectName" ];
 *   
 *   heightMapSystem.build( curShaderSettings, objectRef );
 * 
 * }
 */
export class HeightMap extends ParticleBase{
  /**
   * Creates an instance of HeightMap.
   * 
   * @param {Object} room - The room object.
   * @param {string} [systemName='heightMap'] - The name of the particle system.
   * @property {Object} room - The room object.
   * @property {string} name - The name of the particle system.
   * @property {Object} heightMapPath - The path to the height map texture.
   * @property {Object} spawnMapPath - The path to the spawn map texture.
   * @property {number} spawnMapMode - The number of channels in the spawn map texture.
   * @property {Object} material - The material for the particle system.
   * @property {Object} shaderSettings - The shader settings for the particle system.
   * @property {Array<string>} knownKeys - Known keys for shader settings.
   */
  constructor( room=null, systemName='heightMap'){
    super( room, systemName );
    this.name=systemName;
    this.room=room;

    this.heightMapPath = null;
    this.spawnMapPath = null;
    this.spawnMapMode = 1;

    this.material = null;

    /**
     * Shader settings for the height map particles.
     * @type {Object}
     * @property {number} vertCount - Number of vertices.
     * @property {number} pScale - Scale of the particles.
     * @property {number} pOpacity - Opacity of the particles.
     * @property {number} proxDist - Proximity distance.
     * @property {number} atlasRes - Atlas resolution.
     * @property {Array} atlasPicks - Atlas picks.
     * @property {boolean} randomAtlas - Random atlas flag.
     * @property {boolean} additiveBlend - Additive blending flag.
     * @property {number} jumpHeightMult - Jump height multiplier
     * @property {Vector3} offsetPos - Offset position.
     * @property {Vector3} windDir - Wind direction.
     * @property {boolean} hasLights - Lights flag.
     * @property {number} fadeOutScalar - Fade out scalar.
     * @property {number} wanderInf - Wander influence.
     * @property {number} wanderRate - Wander rate.
     * @property {number} wanderFrequency - Wander frequency.
     */
    this.shaderSettings = {
      "vertCount" : 1000,
      "pScale" : 7,
      "pOpacity" : 1.0,
      "proxDist" : 200,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : false,
      "additiveBlend" : false,

      "tint" : new Vector3( 1, 1, 1 ),
      "jumpHeightMult" : 0,
      "offsetPos" : new Vector3( 0, 0, 0 ),
      "windDir" : new Vector3( 0, 0, 0 ),

      "size" : new Vector3( 0, 0, 0 ),

      "hasLights" : false,
      "fadeOutScalar" : 1.59 , 
      "wanderInf" : 1.0 , 
      "wanderRate" : 1.0 , 
      "wanderFrequency" : 2.85 
    }
    /**
     * Known keys for shader settings.
     * @type {Array<string>}
     */
    this.knownKeys = Object.keys( this.shaderSettings );
  }
  
  /**
   * Sets the path for the height map texture.
   * @method
   * @memberof pxlParticles/HeightMap
   * @param {string} path - The path to the height map texture.
   */
  setHeightMapPath( path ){
    this.heightMapPath = path;
  }

  /**
   * Sets the path for the spawn map texture and its mode.
   * @method
   * @memberof pxlParticles/HeightMap
   * @param {string} path - The path to the spawn map texture.
   * @param {number} [channels=1] - The number of channels in the spawn map texture.
   */
  setSpawnMapPath( path, channels=1 ){
    this.spawnMapPath = path;

    // If the spawnMap includes wind direction data in Green & Blue channels
    if( channels == 3 ){
      channels = 4;
    }
    this.spawnMapMode = channels;
  }

  /**
   * Builds the particle system with the given shader settings and object reference.
   * @method
   * @memberof pxlParticles/HeightMap
   * @param {Object} [curShaderSettings={}] - The current shader settings.
   * @param {Object} [objectRef=null] - The reference object for positioning and sizing.
   * @returns {Object} The particle system added to the scene.
   */
  build( curShaderSettings={}, objectRef=null ){
    
    if( curShaderSettings && typeof curShaderSettings === Object ){
      let curSettingKeys = Object.keys( curShaderSettings );
      this.knownKeys.forEach( key => {
        if( curSettingKeys.includes( key ) ){
          this.shaderSettings[key] = curShaderSettings[key];
        }else{
          curShaderSettings[key] = this.shaderSettings[key];
        }
      });
    }
    if( curShaderSettings.hasOwnProperty("atlasPicks") ){
      this.shaderSettings["atlasPicks"] = curShaderSettings["atlasPicks"];
    }else if( !this.shaderSettings["atlasPicks"] || this.shaderSettings["atlasPicks"].length < 1 ){
      this.shaderSettings["atlasPicks"] = [
        ...super.dupeArray([0.0,0.],4), ...super.dupeArray([0.25,0.],4),
        ...super.dupeArray([0.5,0.0],2), ...super.dupeArray([0.5,0.25],2),
        ...super.dupeArray([0.5,0.5],2), ...super.dupeArray([0.5,0.75],2),
        ...super.dupeArray([0.75,0.75],4), ...super.dupeArray([0.75,0.25],3),
        ...super.dupeArray([0.75,0.25],3)
      ];
    }
    
    this.shaderSettings["hasLights"] = super.hasPointLights();

    // -- -- --

    let offsetPos = curShaderSettings["offsetPos"];
    if( offsetPos && typeof offsetPos === Object && typeof offsetPos !== Vector3 && offsetPos.length === 3 ){
      this.shaderSettings["offsetPos"].set( offsetPos[0], offsetPos[1], offsetPos[2] );
    }

    // -- -- --

    let sizeX = 100;
    let sizeY = 100;
    let sizeZ = 100;

    if( curShaderSettings.hasOwnProperty("size") ){
      if( curShaderSettings["size"].x > 0 ){
        sizeX = curShaderSettings["size"].x;
      }
      if( curShaderSettings["size"].y > 0 ){
        sizeY = curShaderSettings["size"].y;
      }
      if( curShaderSettings["size"].z > 0 ){
        sizeZ = curShaderSettings["size"].z;
      }
    }

    if( this.shaderSettings.pScale >=0 ){
      this.pscale.x = this.shaderSettings.pScale;
    }
    console.log( objectRef)
    // Object Reference has priority
    if( objectRef ){
      if( objectRef.hasOwnProperty("userData") && objectRef.userData.hasOwnProperty("SizeX")){
        sizeX = objectRef.userData.SizeX;
      }else{
        sizeX = objectRef.scale.x;
      }
      if( objectRef.hasOwnProperty("userData") && objectRef.userData.hasOwnProperty("SizeY")){
        sizeY = objectRef.userData.SizeY;
      }else{
        sizeY = objectRef.scale.y;
      }
      if( objectRef.hasOwnProperty("userData") && objectRef.userData.hasOwnProperty("SizeZ")){
        sizeZ = objectRef.userData.SizeZ;
      }else{
        sizeZ = objectRef.scale.z;
      }

      //this.shaderSettings["offsetPos"] = this.shaderSettings["offsetPos"].add( objectRef.position );

      this.pscale.x = objectRef.pScale;
    }

    let tankSize = new Vector3( sizeX, sizeY, sizeZ );



    // -- -- --

    let dustUniforms={
      heightMap:{ type:"t", value: null },
      spawnMap:{ type:"t", value: null },
      tankSize:{ type:"v", value: tankSize },

      atlasTexture:{ type:"t", value: null },
      atlasAlphaTexture:{type:"t", value: null },
      noiseTexture:{ type:"t", value: null },
      time:{ type:"f", value: this.room.msRunner },
      pointScale:{ type:"f", value: this.pscale },
      intensity:{ type:"f", value:1.0 },
      tint:{ type:"v", value:this.shaderSettings["tint"] },
      rate:{ type:"f", value:.035 },
      positionOffset:{ type:"v", value:this.shaderSettings["offsetPos"] },
      windDir:{ type:"v", value:this.shaderSettings["windDir"] }
    };
    //let mtl = this.pxlFile.pxlShaderBuilder( snowUniforms, snowFallVert( true ), snowFallVert() );

    
    let mtl = this.room.pxlFile.pxlShaderBuilder( dustUniforms, heightMapVert( this.shaderSettings ), heightMapFrag( this.hasAlphaMap ) );
    mtl.transparent=true;

    if( this.hasAlphaMap ){
      mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
      if( this.atlasAlphaPath ){
        mtl.uniforms.atlasAlphaTexture.value = this.room.pxlUtils.loadTexture( this.atlasAlphaPath, 1, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
      }
    }else{
      mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasAlphaPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
    }
    
    if( this.heightMapPath ){ // RGB Height Map
      mtl.uniforms.heightMap.value = this.room.pxlUtils.loadTexture( this.heightMapPath, 4, {"magFilter":LinearFilter, "minFilter":LinearMipmapLinearFilter} );
    }
    
    if( this.spawnMapPath ){ // A or RGB Spawn Map
      mtl.uniforms.spawnMap.value = this.room.pxlUtils.loadTexture( this.spawnMapPath, this.spawnMapMode, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
    }

    if( this.shaderSettings["additiveBlend"] ){
      mtl.blending=AdditiveBlending; 
    }

    mtl.uniforms.noiseTexture.value = this.room.softNoiseTexture;

    mtl.depthTest=true;
    mtl.depthWrite=false;
    
    this.room.materialList[ this.name ]=mtl;

    this.material = mtl;



    let pSystem = super.addToScene();
    if( objectRef ){
      pSystem.position.set( objectRef.position.x, objectRef.position.y, objectRef.position.z );
    }
    pSystem.userData["tankRes"] = tankSize;

    return pSystem;
  }
}
