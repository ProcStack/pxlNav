// Base Particle Class for pxlNav
//   Written by Kevin Edzenga; 2024,2025

import {
  Points,
  Float32BufferAttribute,
  Vector2,
  Vector3,
  NearestFilter,
  NearestMipmapNearestFilter,
  BufferGeometry,
  AdditiveBlending
} from "../../../libs/three/three.module.min.js";

import { RENDER_LAYER } from "../../core/Enums.js";

import { dustVert, dustFrag } from './shaders/FloatingDust.js';

/**
 * Default Particle System Class
 * 
 * Outputs a basic system expecting uniforms, vertex shader, and fragment shader to be passed into `build()`
 * @alias ParticleBase
 * @class
 * @memberof pxlNav.pxlEffects.pxlParticles
 */
export default class ParticleBase{
  /**
   * Create a ParticleBase instance.
   * @constructor
   * @param {Object} room - The room object where the particle system will be added.
   * @param {string} [systemName='particles'] - The name of the particle system.
   * @property {string} name - The name of the particle system.
   * @property {Object} room - The room object where the particles will be added.
   * @property {BufferGeometry} geometry - The geometry of the particle system.
   * @property {Material} material - The material of the particle system.
   * @property {Points} points - The points object of the particle system.
   * @property {number} count - The number of particles.
   * @property {Vector2} pscale - The scale of the particles.
   * @property {Vector3} position - The position of the particle system.
   * @property {string} atlasPath - The path to the atlas texture file.
   * @property {string} atlasAlphaPath - The path to the atlas alpha texture file.
   * @property {boolean} hasAlphaMap - Flag for whether the atlas texture has an alpha map.
   * @property {Object} shaderSettings - Shader settings for the particle system.
   * @property {Array<string>} knownKeys - Known keys for shader settings.
   */
  constructor( room=null, systemName='particles' ){
    this.name=systemName;
    this.room=room;
    
    this.geometry = null;
    this.material = null;
    
    this.points = null;
    this.count = -1;
    this.pscale = new Vector2(0,0);
    this.position = new Vector3(0,0,0);
    
    // Default atlas texture file path
    this.atlasPath = "sprite_dustAtlas_rgb.jpg";
    this.atlasAlphaPath = "sprite_dustAtlas_alpha.jpg";
    this.hasAlphaMap = true;

    /**
     * Shader settings for the floating dust particles.
     * @type {Object}
     * @property {number} vertCount - Number of vertices.
     * @property {number} pScale - Scale of the particles.
     * @property {number} atlasRes - Atlas resolution.
     * @property {Array} atlasPicks - Atlas picks.
     * @property {boolean} randomAtlas - Random atlas flag.
     * @property {boolean} additiveBlend - Additive blending flag.
     * @property {boolean} hasLights - Lights flag.
     */
    this.shaderSettings = {
      "vertCount" : 1000,
      "pScale" : 7,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : false,
      "additiveBlend" : false,
      "hasLights" : false,
    }
    /**
     * Known keys for shader settings.
     * @type {Array<string>}
     */
    this.knownKeys = Object.keys( this.shaderSettings );
  }
  
  // 'vertexCount' - Point Count
  // 'pScale' - Point Base Scale
  // 'atlasRes' - Sprite Texture Width Count (Square atlas' only)
  // 'atlasPicks' - Atlas Pick's Origin Array
  //                  Starting corners from upper left of image
  //                    Sprite texture size given - 1/atlasRes
  /**
   * Build the particle system with the given shader settings.
   * @method
   * @memberof ParticleBase
   * @param {Object} [curShaderSettings={}] - Current shader settings to override the default settings.
   * @param {string} [vertShader=null] - The vertex shader for the particle system.
   * @param {string} [fragShader=null] - The fragment shader for the particle system.
   */
  build( uniforms={}, vertShader=null, fragShader=null ){
    if( !vertShader || !fragShader ){
      console.error("No Shader Found; Cannot Build Particle System");
      return;
    }
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

    if( !this.shaderSettings["atlasPicks"] || this.shaderSettings["atlasPicks"].length < 1 ){
      this.shaderSettings["atlasPicks"] = this.elementDuplicator([ [0.0,0.75], [0.0,0.5], [0.25,0.75], [0.25,0.5] ],4);
    }
    
    let mtl = this.room.pxlFile.pxlShaderBuilder( uniforms, vertShader, fragShader );

    this.addToScene( vertexCount, pScale, atlasRes, atlasPicks );
  }

  /**
   * Set the position of the particle system.
   * @method
   * @memberof ParticleBase
   * @param {Vector3} position - The position of the particle system.
   */
  setPosition( ...args ){
    if( args.length === 1 ){
      this.position = args[0];
    }else{
      this.position = new Vector3( ...args );
    }
    if( this.points ){
      this.points.position.copy( this.position );
    }
  }
  
  /**
   * Set the shader settings for the particle system.
   * @method
   * @memberof ParticleBase
   * @returns {Object} The shader settings for the particle system.
   */
  getSettings(){
    return this.shaderSettings;
  }


  // -- -- -- -- -- -- -- --
  // -- Add To Scene Function  -- --
  // -- -- -- -- -- -- -- -- -- --
  
  // 'vertexCount' - Point Count
  // 'pScale' - Point Base Scale
  /**
   * Add the particle system to the scene.
   * @method
   * @memberof ParticleBase
   * @param {number} vertexCount - The number of vertices.
   * @param {number} pScale - The scale of the particles.
   * @param {number} atlasRes - The atlas resolution.
   * @param {Array} atlasPicks - The atlas picks.
   * @returns {Object} The particle system added to the scene.
   */
  addToScene(){
    
    if( !this.shaderSettings ){
      console.error("No Shader Settings Found; Somehow deleted?");
      return;
    }


    let vertexCount = this.shaderSettings.vertCount;
    let pScale = this.shaderSettings.pScale;
    let atlasMtl = this.material;
    let atlasRes = this.shaderSettings.atlasRes;
    let atlasPicks = this.shaderSettings.atlasPicks;
    let randomRanges = this.shaderSettings.randomAtlas;
    let blendAdditive = this.shaderSettings.additiveBlend;

    
    this.count = vertexCount;
    this.pscale.x = pScale * this.room.pxlEnv.pxlQuality.screenResPerc ;

    let atlasPicker=null;
    // Set random/list atlas picking function as variable 
    if( randomRanges ){
      atlasPicker = this.atlasRandomGen;
      atlasPicks = atlasRes;
    }else{
      atlasPicker = this.atlasArrayPicker;
    }
    
    // If no atlas based material is set, create a new one
    if( !atlasMtl ){
      atlasMtl = this.newMaterial();
    }
    
    let verts = [];
    let seeds = [];
    let atlasId = [];
    

    for( let x=0; x<vertexCount; ++x ){
      verts.push( 0,0,0 );
      seeds.push( (Math.random()), (Math.random()*2-1), (Math.random()), (Math.random()*2-1) );
      atlasId.push( ...atlasPicker( atlasPicks ) );
    }
    
    let posAttribute = new Float32BufferAttribute( verts, 3 );
    let seedAttribute = new Float32BufferAttribute( seeds, 4 );
    let atlasAttribute = new Float32BufferAttribute( atlasId, 2 );
    //let idAttribute = new Uint8BufferAttribute( pId, 1 ); // ## would only be 0-65536; set up vector array for ids
    let geo = new BufferGeometry();
    geo.setAttribute( 'position', posAttribute );
    geo.setAttribute( 'seeds', seedAttribute );
    geo.setAttribute( 'atlas', atlasAttribute );
    //geo.setAttribute( 'id', idAttribute );

    let psystem = new Points( geo, atlasMtl );
    psystem.sortParticles = false;
    psystem.frustumCulled = false;
    
    this.room.scene.add( psystem );

    psystem.layers.set(1);
    psystem.renderOrder = RENDER_LAYER.PARTICLES;

    psystem.pBaseScale=pScale;
    this.room.geoList[ this.name ]=psystem;
    
    this.geometry = geo;
    this.material = atlasMtl;
    this.points = psystem;

    psystem.position.copy( this.position );
    
    if( blendAdditive ){
      psystem.material.blending = AdditiveBlending;
    }


    return psystem;
  }
  
  // -- -- -- -- -- -- -- --
  // -- Helper Functions  -- --
  // -- -- -- -- -- -- -- -- -- --
  
  /**
   * Generate random atlas values.
   * @method
   * @memberof ParticleBase
   * @param {number} [atlasRes=4] - The atlas resolution.
   * @param {number} [dSize=2] - The size of the atlas.
   * @returns {Array} Random atlas values.
   * @example
   * // Generate random atlas values
   * import { pxlNav } from 'pxlNav.esm.js';
   * const pxlParticleBase = pxlNav.pxlEffects.pxlParticles.pxlParticle
   * 
   * build(){
   *  pxlParticleBase.atlasRandomGen( 4, 2 );
   * // Output: [0.0,0.75]
   * }
   */
  atlasRandomGen( atlasRes=4, dSize=2 ){
    let atlasDiv = 1.0/atlasRes;
    return Array.from({length:dSize}).map(()=>{
      return Math.floor( (Math.random() * 648405.710 ) % atlasRes )*atlasDiv;
    });
  }
  
  // !!
  /**
   * Generate a list of random atlas values.
   * @method
   * @memberof ParticleBase
   * @param {number} [count=4] - The number of random atlas values to generate.
   * @param {number} [res=4] - The atlas resolution.
   * @param {number} [size=2] - The size of the atlas.
   * @returns {Array} A list of random atlas values.
   * @example
   * // Generate a list of random atlas values
   * import { pxlNav } from 'pxlNav.esm.js';
   * const pxlParticleBase = pxlNav.pxlEffects.pxlParticles.pxlParticle
   * 
   * build(){
   *   pxlParticleBase.atlasRandomList( 4, 4, 2 );
   *   // Output: [ [0.0,0.75], [0.0,0.5], [0.25,0.75], [0.25,0.5] ]
   * }
   */
  atlasRandomList( count=4, res=4, size=2 ){
    return Array.from({length:count}).map((c)=>{
      return this.atlasRandomGen( res, size );
    });
  }
  
  /**
   * Pick a random atlas value from an array.
   * @method
   * @memberof ParticleBase
   * @param {Array} arr - The array of atlas values.
   * @returns {Array} A random atlas value from the array.
   * @example
   * // Pick a random atlas value from an array
   * import { pxlNav } from 'pxlNav.esm.js';
   * const pxlParticleBase = pxlNav.pxlEffects.pxlParticles.pxlParticle
   * 
   * build(){
   *   pxlParticleBase.atlasArrayPicker( [ [0.0,0.75], [0.0,0.5], [0.25,0.75], [0.25,0.5] ] );
   *   // Output 1: [0.0,0.75]
   *   // Output 2: [0.0,0.5]
   *   // Output 3: [0.25,0.75]
   *   // Output 4: [0.0,0.5]
   * }
   * 
   */
  atlasArrayPicker( arr ){
    return arr[Math.floor( (Math.random() * 92314.75) % arr.length )];
  }
  
  /**
   * Duplicate an array.
   * @method
   * @memberof ParticleBase
   * @param {Array} val - The array to duplicate.
   * @param {number} count - The number of times to duplicate the array.
   * @returns {Array} The duplicated array.
   * @example
   * // Duplicate an array
   * import { pxlNav } from 'pxlNav.esm.js';
   * const pxlParticleBase = pxlNav.pxlEffects.pxlParticles.pxlParticle
   * 
   * build(){
   *  pxlParticleBase.dupeArray( [0.0,0.75], 4 );
   *  // Output: [0.0,0.75], [0.0,0.75], [0.0,0.75], [0.0,0.75]
   * }
   */
  dupeArray( val, count ){
    return Array.from({length:count}).fill(val);
  }
  
  /**
   * Duplicate an element in an array.
   * @method
   * @memberof ParticleBase
   * @param {Array} arr - The array to duplicate.
   * @param {number} [count=4] - The number of times to duplicate the array.
   * @returns {Array} The duplicated array.
   * @example
   * // Duplicate an element in an array
   * import { pxlNav } from 'pxlNav.esm.js';
   * const pxlParticleBase = pxlNav.pxlEffects.pxlParticles.pxlParticle
   * 
   * build(){
   *   pxlParticleBase.elementDuplicator([ [0.0,0.75], [0.0,0.5], [0.25,0.75], [0.25,0.5] ],4);
   *   // Output: [
   *   //    [0.0,0.75], [0.0,0.75], [0.0,0.75], [0.0,0.75],
   *   //    [0.0,0.5], [0.0,0.5], [0.0,0.5], [0.0,0.5],   
   *   //    [0.25,0.75], [0.25,0.75], [0.25,0.75], [0.25,0.75], 
   *   //    [0.25,0.5], [0.25,0.5], [0.25,0.5], [0.25,0.5]
   *   // ]
   * }
   */
  elementDuplicator( arr, count=4 ){
    return arr.map((c)=>{
      return this.dupeArray( c, count );
    }).flat(1);
  }
  
  // -- -- --
    
  /**
   * Find the light positions in the room.
   * @method
   * @memberof ParticleBase
   * @returns {Array} The light positions in the room.
   * @private
   */
  findLightPositions(){
    let lightPos=[];
    let lightCount=0;
    if( this.room.lightList.hasOwnProperty("PointLight") ){
      lightCount = this.room.lightList.PointLight.length;
      this.room.lightList.PointLight.forEach( (l)=>{
        lightPos.push( l.position.clone() );
      })
    }
    return lightPos;
  }
  
  /**
   * Check if the room has point lights.
   * @method
   * @memberof ParticleBase
   * @returns {boolean} Flag for whether the room has point lights.
   */
  hasPointLights(){
    return this.room.lightList.hasOwnProperty("PointLight");
  }

  // -- -- --
  
  // Set image path
  /**
   * Set the path for the atlas texture file.
   * @method
   * @memberof ParticleBase
   * @param {string} path - The path to the atlas texture file.
   * @param {string} [alphaPath=null] - The path to the atlas alpha texture
   * @returns {void}
   * @example
   * // Run from your pxlRoom javascript file
   * // Set the path for the atlas texture file
   * build(){
    * let dust = pxlNav.pxlEffects.pxlParticles.pxlParticleBase.newParticle();
    * dust.setAtlasPath( "sprite_dustAtlas_rgb.jpg", "sprite_dustAtlas_alpha.jpg" );
   * }
   */
  setAtlasPath( path, alphaPath=null ){
    this.atlasPath = path;
    if( alphaPath ){
      this.atlasAlphaPath = alphaPath;
      this.hasAlphaMap = true;
    }else{
      this.hasAlphaMap = false;
    }
  }
  
  // -- -- --
  
  // Set the material for the system
  /**
   * Set the material for the particle system.
   * @method
   * @memberof ParticleBase
   * @param {Material} mtl - The material for the particle system.
   * @returns {void}
   * @example
   * // Run from your pxlRoom javascript file
   * // Create an Atlas Material
   * import { SphereGeometry, Mesh } from 'three';
   * 
   * build(){
   *  let sphere = new SphereGeometry( 1, 32, 32 );
   *  let mtl = pxlNav.pxlEffects.pxlParticles.pxlParticleBase.newMaterial();
   *  let mesh = new Mesh( sphere, mtl );
   *  this.scene.add( mesh );
   * }
   */
  newMaterial(setSystemMtl=true){
    let lightPosArr = this.hasPointLights();
    let dustUniforms={
      atlasTexture:{type:"t",value: null },
      noiseTexture:{type:"t",value: null },
      time:{type:"f",value: this.room.msRunner },
      pointScale:{type:"f",value: this.pscale },
      intensity:{type:"f",value:1.0},
      rate:{type:"f",value:0.035},
      lightPos:{value:lightPosArr},
    };

    if( this.hasAlphaMap ){
      dustUniforms['atlasAlphaTexture'] = {type:"t",value: null };
    }


    //let mtl = this.pxlFile.pxlShaderBuilder( snowUniforms, snowFallVert( true ), snowFallFrag() );
    let mtl = this.room.pxlFile.pxlShaderBuilder( dustUniforms, dustVert( this.shaderSettings ), dustFrag( this.hasAlphaMap ) );

    mtl.transparent=true;
    // mtl.blending=AdditiveBlending;
    
    if( this.hasAlphaMap ){
      mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
      if( this.atlasAlphaPath ){
        mtl.uniforms.atlasAlphaTexture.value = this.room.pxlUtils.loadTexture( this.atlasAlphaPath, 1, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
      }
    }else{
      mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasAlphaPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
    }


    mtl.uniforms.noiseTexture.value = this.room.softNoiseTexture;
    mtl.depthTest=true;
    mtl.depthWrite=false;
    if( setSystemMtl ){
      this.room.materialList[ this.name ]=mtl;
    }
    return mtl ;
  }
}
