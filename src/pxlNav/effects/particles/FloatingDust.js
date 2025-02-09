
import {
  Vector3,
  NearestFilter,
  NearestMipmapNearestFilter,
  AdditiveBlending
} from "../../../libs/three/three.module.min.js";

import ParticleBase from './ParticleBase.js';
import { dustVert, dustFrag } from './shaders/FloatingDust.js';

// Free floaties in the environment
//   Dust balls & flakes

export class FloatingDust extends ParticleBase{
  constructor( room=null, systemName='floatingDust'){
    super( room, systemName );
    this.name=systemName;
    this.room=room;

    this.material = null;

    this.shaderSettings = {
      "vertCount" : 1000,
      "pScale" : 7,
      "pOpacity" : 1.0,
      "proxDist" : 200,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : true,
      "additiveBlend" : false,

      "windDir" : new Vector3( 0, 0, 1 ),
      "offsetPos" : new Vector3( 0, 0, 0 ),

      "hasLights" : false,
      "fadeOutScalar" : 1.59 , 
      "wanderInf" : 1.0 , 
      "wanderRate" : 1.0 , 
      "wanderFrequency" : 2.85 
    }
    this.knownKeys = Object.keys( this.shaderSettings );
  }
  
  // 'vertexCount' - Point Count
  // 'pScale' - Point Base Scale
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
