// Floating Dust Particle System for pxlNav
//   Written by Kevin Edzenga; 2024,2025

import {
  Vector3,
  NearestFilter,
  NearestMipmapNearestFilter,
  AdditiveBlending
} from "../../../libs/three/three.module.min.js";

import ParticleBase from './ParticleBase.js';
import { dustVert, dustFrag } from './shaders/FloatingDust.js';

/**
 * Class representing floating dust particles in the environment.
 * Extends the ParticleBase class.
 * @alias FloatingDust
 * @class
 * @extends ParticleBase
 * @memberof pxlNav.pxlEffects.pxlParticles
 */
export class FloatingDust extends ParticleBase{
  /**
   * Creates an instance of FloatingDust.
   * 
   * @param {Object} room - The room object where the particles will be added.
   * @param {string} [systemName='floatingDust'] - The name of the particle system.
   * @property {Object} room - The room object.
   * @property {string} name - The name of the particle system.
   * @property {Object} material - The material for the particle system.
   * @property {Object} shaderSettings - The shader settings for the particle system.
   * @property {Array<string>} knownKeys - Known keys for shader settings.
   */
  constructor( room=null, systemName='floatingDust'){
    super( room, systemName );
    this.name=systemName;
    this.room=room;

    this.material = null;

    /**
     * Shader settings for the floating dust particles.
     * @type {Object}
     * @property {number} vertCount - Number of vertices.
     * @property {number} pScale - Scale of the particles.
     * @property {number} pOpacity - Opacity of the particles.
     * @property {number} proxDist - Proximity distance.
     * @property {number} atlasRes - Atlas resolution.
     * @property {Array} atlasPicks - Atlas picks.
     * @property {boolean} randomAtlas - Random atlas flag.
     * @property {boolean} additiveBlend - Additive blending flag.
     * @property {Vector3} windDir - Wind direction.
     * @property {Vector3} offsetPos - Offset position.
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

      "windDir" : new Vector3( 0, 0, 1 ),
      "offsetPos" : new Vector3( 0, 0, 0 ),

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
   * Builds the floating dust particle system with the given shader settings.
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


    if( !this.shaderSettings["atlasPicks"] || this.shaderSettings["atlasPicks"].length < 1 ){
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

    // Clean up any {} settings that should be Vector3s
    let windDir = curShaderSettings["windDir"];
    if( windDir && typeof windDir === Object && typeof windDir !== Vector3 && windDir.length === 3 ){
      this.shaderSettings["windDir"].set( windDir[0], windDir[1], windDir[2] );
    }

    let offsetPos = curShaderSettings["offsetPos"];
    if( offsetPos && typeof offsetPos === Object && typeof offsetPos !== Vector3 && offsetPos.length === 3 ){
      this.shaderSettings["offsetPos"].set( offsetPos[0], offsetPos[1], offsetPos[2] );
    }

    // -- -- --

    let dustUniforms={
      atlasTexture:{ type:"t", value: null },
      atlasAlphaTexture:{type:"t", value: null },
      noiseTexture:{ type:"t", value: null },
      time:{ type:"f", value: this.room.msRunner },
      pointScale:{ type:"f", value: this.pscale },
      intensity:{ type:"f", value:1.0 },
      rate:{ type:"f", value:.035 },
      positionOffset:{ type:"v", value:this.shaderSettings["offsetPos"] },
      windDir:{ type:"v", value:this.shaderSettings["windDir"] }
    };
    //let mtl = this.pxlFile.pxlShaderBuilder( snowUniforms, snowFallVert( true ), snowFallVert() );

    
    let mtl = this.room.pxlFile.pxlShaderBuilder( dustUniforms, dustVert( this.shaderSettings ), dustFrag( this.hasAlphaMap ) );
    mtl.transparent=true;

    if( this.hasAlphaMap ){
      mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
      if( this.atlasAlphaPath ){
        mtl.uniforms.atlasAlphaTexture.value = this.room.pxlUtils.loadTexture( this.atlasAlphaPath, 1, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
      }
    }else{
      mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasAlphaPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );
    }

    if( this.shaderSettings["additiveBlend"] ){
      mtl.blending=AdditiveBlending; 
    }

    mtl.uniforms.noiseTexture.value = this.room.softNoiseTexture;

    mtl.depthTest=true;
    mtl.depthWrite=false;
    
    this.room.materialList[ this.name ]=mtl;

    this.material = mtl;


    super.addToScene();
  }
}
