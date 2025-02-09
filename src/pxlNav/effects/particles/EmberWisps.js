
import {
  Vector3,
  AdditiveBlending,
  DoubleSide,
  NearestFilter,
  NearestMipmapNearestFilter
} from "../../../libs/three/three.module.min.js";

import ParticleBase from './ParticleBase.js';
import { emberWispsVert, emberWispsFrag } from './shaders/EmberWisps.js';

// The fire embers wisping into the air from a fire

export class EmberWisps extends ParticleBase{
  constructor( room=null, systemName='emberWisps' ){
    super( room, systemName );
    this.name=systemName;
    this.room=room;
    
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

    if( !this.shaderSettings['atlasPicks'] || this.shaderSettings['atlasPicks'].length == 0 ){
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