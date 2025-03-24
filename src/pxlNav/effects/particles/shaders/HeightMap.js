// pxlNav Shader
//  -- -- -- --
// Written by Kevin Edzenga; 2020; 2024-2025

import {shaderHeader} from "../../../shaders/core/ShaderHeader.js";
 
///////////////////////////////////////////////////////////
// Floating Dust Shaders                                //
/////////////////////////////////////////////////////////

export const heightMapSettings = {
  "pOpacity" : 1.0,
  "proxDist" : 200,
  "hasLights" : false,
  "fadeOutScalar" : 1.59 , 
  "wanderInf" : 1.0 , 
  "wanderRate" : 1.0 , 
  "wanderFrequency" : 2.85,
  "jumpHeightMult" : 15.0 
};

export function heightMapVert( userDustData = {} ){
  
  userDustData = Object.assign( {}, heightMapSettings, userDustData );
  
  let toFloatStr = ( num ) => {
    return (num+"").includes(".") ? num : num+".0";
  }

  let ret =`
    // Fade-Out Influence multiplier
        const float ParticleOpacity = ${ toFloatStr( userDustData.pOpacity ) };
        const float FadeOutScalar = ${ toFloatStr( userDustData.fadeOutScalar ) };
        const float WanderInf = ${ toFloatStr( userDustData.wanderInf ) };
        const float WanderRate = ${ toFloatStr( userDustData.wanderRate ) };
        const float WanderFrequency = ${ toFloatStr( userDustData.wanderFrequency ) };
        const float JumpHeightMult = ${ toFloatStr( userDustData.jumpHeightMult ) };

        #define PROX ${userDustData.proxDist.toFixed(3)}
        #define PROX_INV 1.0/${(userDustData.proxDist * 0.98).toFixed(3)}

    // -- -- --
  `;
  ret += shaderHeader();
  ret +=`
    // -- -- --

    uniform sampler2D heightMap;
    uniform sampler2D spawnMap;
    uniform vec3 tankSize;
    
    uniform sampler2D noiseTexture;
    uniform vec2 time;
    uniform float rate;
    uniform vec2 pointScale;
    uniform vec3 positionOffset;
    uniform vec3 windDir;
  `;
  if( !!userDustData.hasLights ){
    ret+=`
  #if NUM_POINT_LIGHTS > 0
    struct PointLight {
      vec3 color;
      float decay;
      float distance;
      vec3 position;
    };
    uniform PointLight pointLights[NUM_POINT_LIGHTS];
  #endif
    `;
  }
  ret+=`
    
    attribute vec4 seeds;
    attribute vec2 atlas;
    
    varying vec3 vCd;
    varying vec2 vAtlas;
    varying vec2 vRot;
    varying float vAlpha;
    
    
    // -- -- --

    float colDetect( vec2 pos, vec2 pt, vec2 n1, vec2 n2 ){
        vec2 ref=pos-pt;
        float ret = step( dot( ref, n1 ), 0.0 );
        ret *= step( dot( ref, n2 ), 0.0 );
        
        return ret;
    }
    
    vec3 randomVec( vec3 seed ) {
      return vec3(
        fract( dot(seed,vec3(12.9898, 78.233, 45.164)) * 43758.5453 ),
        fract( dot(seed,vec3(93.9898, 67.345, 12.345)) * 43758.5453 ),
        fract( dot(seed,vec3(54.123, 98.765, 32.123)) * 43758.5453 )
      );
    }

    // -- -- --
    
    #define oneThird 0.3333333333333333
    #define srgbLow 1.0 / 12.92
    #define srgbHigh 1.0 / 1.055

    vec3 sRGBToLinear(vec3 srgb) {
      return vec3(
        mix( srgb.r * srgbLow,  pow((srgb.r + 0.055) * srgbHigh, 2.4), step(0.04045, srgb.r) ),
        mix( srgb.g * srgbLow,  pow((srgb.g + 0.055) * srgbHigh, 2.4), step(0.04045, srgb.g) ),
        mix( srgb.b * srgbLow,  pow((srgb.b + 0.055) * srgbHigh, 2.4), step(0.04045, srgb.b) )
      );
    }

    void main(){
      vAtlas=atlas;
      
      float rot=seeds.z+time.x*(seeds.z*2.);
      vRot=vec2( sin(rot), cos(rot) );
      
      float t=time.x*rate;
      vec2 sizeXZ = tankSize.xz;
      vec2 scaleXZ = 1.0 / (sizeXZ);
      
      vec3 pOff= (seeds.xyz - vec3(0.5,0.0,0.5)) * vec3(PROX);
      
      
      // Loop point positions based on camera location
      float yFract=fract(t+seeds.x);
      pOff.xyz += time.x * windDir.xyz; 
      vec3 pos= pOff ;
      
      vec3 noiseCd=texture2D(noiseTexture, sin(pos.xz*.05+seeds.xz+(time.x + seeds.y)*2.1) ).rgb-.5;
      vec3 noiseCdb=texture2D(noiseTexture, sin((1.0-pos.xz)*.05+seeds.yw+time.x*.1) ).rgb-.5;
      
      // -- -- --
      
      // Meandering points
      
      
      vec3 randDirA = randomVec( seeds.xyz );
      vec3 randDirB = randomVec( seeds.wyz );
      vec3 randDirC = randomVec( seeds.zxy );
      vec3 randDirBlend = mix( randDirA, randDirB, sin( randDirC * (time.x + seeds.w) * WanderFrequency ) ) * WanderInf;
      
      float jumpHeight = randDirBlend.y * abs(max(noiseCd.x,noiseCd.y));
      
      // -- -- --
      

      pos += randDirBlend * sin( seeds.x+seeds.z+noiseCd.r*noiseCd.g*seeds.y+noiseCdb.b + (time.x+seeds.y*10.) * WanderRate * seeds.w*noiseCdb.g ) * WanderRate * ( 5. + seeds.z );
      pos += (noiseCd * noiseCdb ) * 50. * ( (seeds.w+.75)*4.);

      vec3 mPos = modelMatrix[3].xyz;
      pos.xz = mod( pos.xz - cameraPosition.xz , PROX) + cameraPosition.xz - PROX*.5 + positionOffset.xz;
      
      
      vec2 fitPos = clamp( ( pos.xz - mPos.xz  ) * scaleXZ + .5, vec2(0.0), vec2(1.0));

      
      vec3 heightCd=texture2D(heightMap, fitPos ).rgb;
      vec2 spawnOffset = vec2( 0.0161 );
      float spawnInf= min(1.0, texture2D(spawnMap, fitPos ).r +
                      texture2D(spawnMap, fitPos + spawnOffset ).r +
                      texture2D(spawnMap, fitPos - spawnOffset ).r );
      heightCd = sRGBToLinear( heightCd );
      float heightVal = heightCd[0] * oneThird + heightCd[1] * oneThird + heightCd[2] * oneThird;

      pos.y = tankSize.y * heightVal + mPos.y;
      
      
      float pScalar = clamp( (1.-length(pos-cameraPosition )*PROX_INV) * FadeOutScalar, 0.0, 1.0  );
      float aMult = min(1.0, pScalar*pScalar*4.0);
      vAlpha = min( 1.0, (seeds.x*.5+.75) * aMult * spawnInf * 2.5 * ParticleOpacity );

      pos.y += max(1.0, (jumpHeight*pScalar + positionOffset.y) * JumpHeightMult * WanderInf);

  `;

  if(  !!userDustData.hasLights ){
    ret+=`
      #if NUM_POINT_LIGHTS > 0
        float lightInf = 1.0;
        for(int x = 0; x < NUM_POINT_LIGHTS; ++x ){
            vec3 lightVector = normalize(pos - pointLights[i]);
            lightInf = min(lightInf, length(pos - pointLights[i]) *.05 );
        }
        vAlpha*=(1.0-lightInf)*.8+.2;
      #endif

    `;
  }

  ret+=`
        float pScale = pointScale.x * (seeds.w*.25+1.0) * pScalar * 2.;
        pScale *= 1.0 - clamp( ((1.0-pScalar)-.5)*10.0 * FadeOutScalar, 0.0, 1.0 );

        gl_PointSize = pScale;
        
        vec4 mvPos=viewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix*mvPos;
    }`;
  return ret;
}

export function heightMapFrag( hasAlphaMap = false ){
  let ret=shaderHeader();
  ret+=`
    uniform sampler2D atlasTexture;
    uniform sampler2D atlasAlphaTexture;
    uniform vec3 tint;
    uniform vec2 time;
    uniform float rate;
    
    varying vec3 vCd;
    varying vec2 vAtlas;
    varying vec2 vRot;
    varying float vAlpha;
    
    void main(){

        if( vAlpha < .01 ){
          discard;
        }


        vec2 uv=gl_PointCoord;

        /*vec2 pos = uv*.25-.125;
        float vis = max(0.0, 1.0-max(0.0,length(pos)-.09)*20.);

        vec2 rotUV;
        rotUV.x = vRot.y * pos.x - vRot.x * pos.y;
        rotUV.y = vRot.x * pos.x + vRot.y * pos.y;
        rotUV=(rotUV+.125) + vAtlas;*/

        vec2 pos = (uv-.5)*.85;

        vec2 rotUV;
        rotUV.x = vRot.y * pos.x - vRot.x * pos.y;
        rotUV.y = vRot.x * pos.x + vRot.y * pos.y;
        rotUV=(rotUV+.5)*.25+vAtlas;
        

      `;
  if( hasAlphaMap ){
    // Split Color & Alpha maps
    ret+=`
        vec4 dustCd=vec4(
                        texture2D(atlasTexture,rotUV).rgb, // rgb
                        texture2D(atlasAlphaTexture,rotUV).r // alpha
                      ); 

    `;
  }else{
    // RGBA Texture Atlas; PNG
    ret+=`
        vec4 dustCd= texture2D(atlasTexture,rotUV);

    `;
  }

  ret+=`
        float alpha = min(1.0, dustCd.a*1.5) * vAlpha ;
        vec4 Cd=vec4( dustCd.rgb * tint, alpha );

        gl_FragColor=Cd;
    }`;
  return ret;
}
