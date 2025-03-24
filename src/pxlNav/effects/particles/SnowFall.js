
import {
  Vector2,
  Vector3,
  DoubleSide,
  NearestFilter,
  NearestMipmapNearestFilter
} from "../../../libs/three/three.module.min.js";

import ParticleBase from './ParticleBase.js';
import { snowSettings, snowFallVert, snowFallFrag } from './shaders/SnowShader.js';

// Free floaties in the environment
//   Dust balls & flakes

export class SnowFall extends ParticleBase{
  constructor( room=null, systemName='snowFall' ){
    super( room, systemName );
    this.name=systemName;
    this.room=room;
  }
  
  // 'vertexCount' - Point Count
  // 'pScale' - Point Base Scale
  build( vertexCount=1000, pScale=7, proxDist=120, wind=[0.0,1.0], pOffset=[0.0,0.0,0.0], atlasPicks=null, randomAtlas=true ){
    
    if( !atlasPicks ){
      atlasPicks = [...super.dupeArray([0.0,0.],4), ...super.dupeArray([0.25,0.],4),
                    ...super.dupeArray([0.5,0.0],2), ...super.dupeArray([0.5,0.25],2),
                    ...super.dupeArray([0.5,0.5],2), ...super.dupeArray([0.5,0.75],2),
                    ...super.dupeArray([0.75,0.75],4), ...super.dupeArray([0.75,0.25],3),
                    ...super.dupeArray([0.75,0.25],3) ];
    }


    let lightPosArr = super.findLightPositions();

    if( typeof wind !== Vector2 ){
      wind = new Vector2( wind[0], wind[1] );
    }

    if( !pOffset ){
      pOffset = new Vector3( 0, 0, 0 );
    }else if( typeof pOffset !== Vector3 ){
      pOffset = new Vector3( pOffset[0], pOffset[1], pOffset[2] );
    }

    let dustUniforms={
      atlasTexture:{type:"t",value: null },
      noiseTexture:{type:"t",value: null },
      time:{type:"f",value: this.room.msRunner },
      pointScale:{type:"f",value: this.pscale },
      intensity:{type:"f",value:1.0},
      rate:{type:"f",value:.035},
      positionOffset:{type:"v",value:pOffset},
      windDir:{type:"v",value:wind},
      lightPos:{value:lightPosArr}
    };
        //let mtl = this.pxlFile.pxlShaderBuilder( snowUniforms, snowFallFrag( true ), snowFallFrag() );
    

    let curSnowSettings = Object.assign( {}, snowSettings, { "ProxDist": proxDist, "CalculateCollisions": true } );
    let mtl = this.room.pxlFile.pxlShaderBuilder( dustUniforms, snowFallVert( curSnowSettings ), snowFallFrag() );
    mtl.side=DoubleSide;
    mtl.transparent=true;
    // mtl.blending=AdditiveBlending;
      
    mtl.uniforms.atlasTexture.value = this.room.pxlUtils.loadTexture( this.atlasPath, 4, {"magFilter":NearestFilter, "minFilter":NearestMipmapNearestFilter} );

    mtl.uniforms.noiseTexture.value = this.room.softNoiseTexture;
    mtl.depthTest=true;
    mtl.depthWrite=false;
    
    this.room.materialList[ this.name ]=mtl;

    super.addToScene( vertexCount, pScale, mtl, 4, atlasPicks, randomAtlas );
  }
}
