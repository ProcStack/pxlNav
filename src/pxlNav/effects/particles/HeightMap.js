
import {
  Vector3,
  NearestFilter,
  LinearFilter,
  NearestMipmapNearestFilter,
  LinearMipmapLinearFilter,
  AdditiveBlending
} from "../../../libs/three/three.module.min.js";

import ParticleBase from './ParticleBase.js';
import { heightMapVert, heightMapFrag } from './shaders/HeightMap.js';

// Free floaties in the environment
//   Dust balls & flakes

export class HeightMap extends ParticleBase{
  constructor( room=null, systemName='heightMap'){
    super( room, systemName );
    this.name=systemName;
    this.room=room;

    this.heightMapPath = null;
    this.spawnMapPath = null;
    this.spawnMapMode = 1;

    this.material = null;

    this.shaderSettings = {
      "vertCount" : 1000,
      "pScale" : 7,
      "pOpacity" : 1.0,
      "proxDist" : 200,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : false,
      "additiveBlend" : false,

      "offsetPos" : new Vector3( 0, 0, 0 ),

      "hasLights" : false,
      "fadeOutScalar" : 1.59 , 
      "wanderInf" : 1.0 , 
      "wanderRate" : 1.0 , 
      "wanderFrequency" : 2.85 
    }
    this.knownKeys = Object.keys( this.shaderSettings );
  }
  
  setHeightMapPath( path ){
    this.heightMapPath = path;
  }

  setSpawnMapPath( path, channels=1 ){
    this.spawnMapPath = path;

    // If the spawnMap includes wind direction data in Green & Blue channels
    if( channels == 3 ){
      channels = 4;
    }
    this.spawnMapMode = channels;
  }

  // 'vertexCount' - Point Count
  // 'pScale' - Point Base Scale
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
    if( objectRef && objectRef.hasOwnProperty("userData") ){
      if( objectRef.userData.hasOwnProperty("SizeX") ){
        sizeX = objectRef.userData.SizeX;
      }
      if( objectRef.userData.hasOwnProperty("SizeY") ){
        sizeY = objectRef.userData.SizeY;
      }
      if( objectRef.userData.hasOwnProperty("SizeZ") ){
        sizeZ = objectRef.userData.SizeZ;
      }
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
      rate:{ type:"f", value:.035 },
      positionOffset:{ type:"v", value:this.shaderSettings["offsetPos"] }
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
    pSystem.position.set( objectRef.position.x, objectRef.position.y, objectRef.position.z );
    pSystem.userData["tankRes"] = tankSize;

    return pSystem;
  }
}
