
import {
  Vector3,
  AdditiveBlending,
  DoubleSide,
  NearestFilter,
  NearestMipmapNearestFilter
} from "../../../libs/three/three.module.min.js";

import ParticleBase from './ParticleBase.js';
import { smokeVert, smokeFrag } from './shaders/Smoke.js';

// Campfire's spiralling smoke sprites

export class BillowSmoke extends ParticleBase{
  constructor( room=null, systemName='billowSmoke' ){
    super( room, systemName );
    this.name=systemName;
    this.room=room;

    this.shaderSettings = {
      "vertCount" : 600,
      "pScale" : 56,
      "pOpacity" : 1.0,
      "proxDist" : 200,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : true,
      "additiveBlend" : false,

      "windDir" : new Vector3( 0, 0, 1 ),
      "offsetPos" : new Vector3( 0, 0, 0 ),
    }
    this.knownKeys = Object.keys( this.shaderSettings );
  }
  
  // 'vertexCount' - Point Count
  // 'pScale' - Point Base Scale
  // 'atlasRes' - Sprite Texture Width Count (Square atlas' only)
  // 'atlasPicks' - Atlas Pick's Origin Array
  //                  Starting corners from upper left of image
  //                    Sprite texture size given - 1/atlasRes
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

    // Starting corners from the upper left for the given 1/atlasRes
    if( !this.shaderSettings.atlasPicks || this.shaderSettings.atlasPicks.length == 0 ){
      this.shaderSettings.atlasPicks = [...super.dupeArray([0.5,0.0],2), ...super.dupeArray([0.5,0.25],2),
                    ...super.dupeArray([0.5,0.5],2), ...super.dupeArray([0.5,0.75],2),
                    ...super.dupeArray([0.75,0.75],4), ...super.dupeArray([0.75,0.25],3),
                    ...super.dupeArray([0.75,0.25],3) ];
    }
    
    
    let smokeUniforms={
      atlasTexture:{type:"t",value: null },
      noiseTexture:{type:"t",value: null },
      time:{type:"f",value: this.room.msRunner },
      windDir:{type:"f",value: curShaderSettings.windDir },
      offsetPos:{type:"f",value: curShaderSettings.offsetPos },
      pointScale:{type:"f",value: this.pscale },
      intensity:{type:"f",value:0.8},
      rate:{type:"f",value:2.85}
    };

    if( this.hasAlphaMap ){
      smokeUniforms['atlasAlphaTexture'] = {type:"t",value: null };
    }
    
    let mtl = this.room.pxlFile.pxlShaderBuilder( smokeUniforms, smokeVert(), smokeFrag( this.hasAlphaMap ) );
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
