// pxlNav Shader
//  -- -- -- --
// Written by Kevin Edzenga; 2020; 2024-2025

import {shaderHeader} from "../../../shaders/core/ShaderHeader.js";
 
///////////////////////////////////////////////////////////
// Floating Dust Shaders                                //
/////////////////////////////////////////////////////////

export const dustSettings = {
  "pOpacity" : 1.0,
  "proxDist" : 200,
  "hasLights" : false,
  "fadeOutScalar" : 1.59 , 
  "wanderInf" : 1.0 , 
  "wanderRate" : 1.0 , 
  "wanderFrequency" : 2.85 
};

export function dustVert( userDustData = {} ){
  
  userDustData = Object.assign( {}, dustSettings, userDustData );
  
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

        #define PROX ${userDustData.proxDist.toFixed(3)}
        #define PROX_INV 1.0/${(userDustData.proxDist * 0.80).toFixed(3)}

    // -- -- --
  `;
  ret += shaderHeader();
  ret +=`
    // -- -- --

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
    
    varying vec2 vAtlas;
    varying vec2 vRot;
    varying float vScalar;
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
    
    void main(){
        vAtlas=atlas;
        
        float rot=seeds.z+time.x*(seeds.z*2.);
        vRot=vec2( sin(rot), cos(rot) );
        
        float t=time.x*rate*0.;
        
        vec3 pOff=seeds.xyz * vec3(PROX);
        
        // Loop point positions based on camera location
        float yFract=fract(t+seeds.x);
        pOff.xyz += time.x * windDir.xyz; 
        vec3 pos= pOff ;
        
        vec3 noiseCd=texture2D(noiseTexture, sin(pos.xz*.05+seeds.xz+time.x*2.1) ).rgb-.5;
        vec3 noiseCdb=texture2D(noiseTexture, sin((1.0-pos.xz)*.05+seeds.yw+time.x*.1) ).rgb-.5;
        
        // -- -- --
        
        // Meandering points
        
        
        vec3 randDirA = randomVec( seeds.xyz );
        vec3 randDirB = randomVec( seeds.wyz );
        vec3 randDirC = randomVec( seeds.zxy );
        vec3 randDirBlend = mix( randDirA, randDirB, sin( randDirC * time.x * WanderFrequency ) ) * WanderInf;
        
        // -- -- --
        
        pos += randDirBlend * sin( seeds.x+seeds.z+noiseCd.r*noiseCd.g*seeds.y+noiseCdb.b + (time.x+seeds.y*10.) * WanderRate * seeds.w*noiseCdb.g ) * WanderRate * ( 5. + seeds.z );

        pos += (noiseCd * noiseCdb ) * 50. * ( (seeds.w+.75)*4.);

        pos = mod( pos-cameraPosition, PROX) + cameraPosition - PROX*.5;
        pos+=positionOffset;
        
        
        float pScalar = clamp( (1.-length(pos-cameraPosition )*PROX_INV) * FadeOutScalar, 0.0, 1.0  );
        float aMult = min(1.0, pScalar*3.0);
        vAlpha = (seeds.x*.5+.7) * aMult;

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
        vScalar = pScalar * ParticleOpacity ;
        float pScale = pointScale.x * (seeds.w*.5+.5)*pScalar + 1.0;
        pScale *= 1.0 - clamp( ((1.0-pScalar)-.5)*10.0 * FadeOutScalar, 0.0, 1.0 );
        pScale *= step( .5, atlas.x )*.5+1.;

        gl_PointSize = pScale;
        
        vec4 mvPos=viewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix*mvPos;
    }`;
  return ret;
}

export function dustFrag( hasAlphaMap = false ){
  let ret=shaderHeader();
  ret+=`
    uniform sampler2D atlasTexture;
    uniform sampler2D atlasAlphaTexture;
    uniform vec2 time;
    uniform float rate;
    
    varying vec2 vAtlas;
    varying vec2 vRot;
    varying float vScalar;
    varying float vAlpha;
    
    void main(){

        if( vAlpha < .01 ){
          discard;
        }


        vec2 uv=gl_PointCoord;

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
        float alpha = dustCd.a * vAlpha * vScalar;
        vec4 Cd=vec4( dustCd.rgb, alpha );

        gl_FragColor=Cd;
    }`;
  return ret;
}
