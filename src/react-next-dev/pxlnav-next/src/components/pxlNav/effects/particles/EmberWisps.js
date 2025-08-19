// Ember Wisp Particle System for pxlNav
//   Written by Kevin Edzenga; 2024,2025


import {
  Vector3,
  AdditiveBlending,
  DoubleSide,
  NearestFilter,
  NearestMipmapNearestFilter
} from "../../../libs/three/three.module.min.js";

import { ParticleBase } from './ParticleBase.js';
import { emberWispsVert, emberWispsFrag } from './shaders/EmberWisps.js';


/**
 * Class representing EmberWisps, a type of particle effect that simulates fire embers wisping into the air.
 * 
 * Access at - `pxlNav.pxlEffects.pxlParticles.EmberWisps`
 * 
 * Extends - [ParticleBase]{@link ParticleBase}
 * 
 * @alias pxlParticles/EmberWisps
 * @class
 * @memberof pxlNav.pxlEffects.pxlParticles
 * @example
 * this.shaderSettings = {
 *   "vertCount" : 600,
 *   "pScale" : 7,
 *   "pOpacity" : 1.0,
 *   "proxDist" : 200,
 *   "atlasRes" : 4,
 *   "atlasPicks" : [],
 *   "randomAtlas" : true,
 *   "additiveBlend" : false,
 *
 *   "windDir" : new Vector3( 0, 0, 1 ),
 *   "offsetPos" : new Vector3( 0, 0, 0 ),
 * }
 * @example
 * // Floating Dust Particle System for pxlNav
 * import { pxlEffects } from "pxlNav.esm.js";
 * const EmberWisps = pxlEffects.pxlParticles.EmberWisps; 
 * 
 * // You can put this in yuor `fbxPostLoad()` or `build()` function
 * fbxPostLoad(){
 * 
 *   let emberWispsSystem = new EmberWisps( room, 'emberWisps' );
 *  
 *   let curShaderSettings = emberWispsSystem.getSettings();
 *   curShaderSettings["vertCount"] = 1200; // Number of particles
 *   curShaderSettings["pScale"] = 9; // Scale of the particles
 *   curShaderSettings["pOpacity"] = 0.8; // Opacity of the particles
 *   curShaderSettings["proxDist"] = 400; // Proximity distance
 *   curShaderSettings["additiveBlend"] = true; // Additive blending for the particles
 * 
 *   emberWispsSystem.build( curShaderSettings );
 * }
 */
export class EmberWisps extends ParticleBase{
  /**
   * Create an EmberWisps instance.
   * @param {Object} room - The room object where the particle system will be added.
   * @param {string} [systemName='emberWisps'] - The name of the particle system.
   * @property {Object} room - The room object.
   * @property {string} name - The name of the particle system.
   * @property {Object} shaderSettings - The shader settings for the particle system.
   * @property {Array<string>} knownKeys - Known keys for shader
   */
  constructor( room=null, systemName='emberWisps' ){
    super( room, systemName );
    this.name=systemName;
    this.room=room;
    
    /**
     * Shader settings for the EmberWisps particle effect.
     * @type {Object}
     * @property {number} vertCount - Point Count
     * @property {number} pScale - Point Base Scale
     * @property {number} pOpacity - Point Opacity
     * @property {number} proxDist - Proximity Distance
     * @property {number} atlasRes - Sprite Texture Width Count (Square atlas' only)
     * @property {Array} atlasPicks - Atlas Pick's Origin Array
     * @property {boolean} randomAtlas - Random Atlas Flag
     * @property {boolean} additiveBlend - Additive Blend Flag
     * @property {Vector3} windDir - Wind Direction
     * @property {Vector3} offsetPos - Offset Position
     */
    this.shaderSettings = {
      "vertCount" : 600,
      "pScale" : 7,
      "pOpacity" : 1.0,
      "proxDist" : 200,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : true,
      "additiveBlend" : false,

      "windDir" : new Vector3( 0, 0, 1 ),
      "offsetPos" : new Vector3( 0, 0, 0 ),
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
   * Build the EmberWisps particle effect with the given shader settings.
   * @method
   * @memberof pxlParticles/EmberWisps
   * @param {Object} [curShaderSettings={}] - Current shader settings to override the default settings.
   */
  build( curShaderSettings={} ){
    
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

    if( !this.shaderSettings['atlasPicks'] || this.shaderSettings['atlasPicks'].length === 0 ){
      this.shaderSettings['atlasPicks']=super.elementDuplicator([ [0.0,0.75], [0.0,0.5], [0.25,0.75], [0.25,0.5] ],4);
    }
    
    let emberUniforms={
      atlasTexture:{type:"t",value: null },
      noiseTexture:{type:"t",value: null },
      time:{type:"f",value: this.room.msRunner },
      windDir:{type:"v",value: this.shaderSettings.windDir },
      offsetPos:{type:"v",value: this.shaderSettings.offsetPos },
      pointScale:{type:"f",value: this.shaderSettings.pScale },
      intensity:{type:"f",value:1.0},
      rate:{type:"f",value:5.5}
    };

    if( this.hasAlphaMap ){
      emberUniforms['atlasAlphaTexture'] = {type:"t",value: null };
    }
    
    let mtl = this.room.pxlFile.pxlShaderBuilder( emberUniforms, emberWispsVert(), emberWispsFrag( this.hasAlphaMap ) );
    mtl.side=DoubleSide;
    mtl.transparent=true;
    
    if( this.shaderSettings["additiveBlend"] ){
      mtl.blending=AdditiveBlending; 
    }

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
    this.room.materialList[ this.name ]=mtl;

    this.material = mtl;

    super.addToScene();
  }
}