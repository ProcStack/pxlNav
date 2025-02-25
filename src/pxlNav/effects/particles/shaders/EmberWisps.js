// pxlNav Shader
//  -- -- -- --
// Written by Kevin Edzenga; 2020; 2024, 2025

import {shaderHeader} from "../../../shaders/core/ShaderHeader.js";
 
export function emberWispsVert( shaderSettings ){
  let ret=`
// Ember Settings
  const vec3 EmberEarlyCd = vec3( 0.8, 0.5, .1 );
  const vec3 EmberOldCd = vec3( 0.634, 0.20, 0.20 );
  const float BaseSpeed = 0.77;
  const float EmberSpread = 4.0;
  const float EmberFadeDistance = 0.04;

// -- -- --
  `;
  ret += shaderHeader();
  ret +=`
// -- -- --

uniform sampler2D noiseTexture;
uniform vec2 time;
uniform vec3 windDir;
uniform vec3 offsetPos;
uniform float rate;
uniform float pointScale;

attribute vec4 seeds;
attribute vec2 atlas;

varying vec3 vCd;
varying vec2 vAtlas;
varying vec2 vRot;
varying float vAlpha;
varying float vBrightness;

float colDetect( vec2 pos, vec2 pt, vec2 n1, vec2 n2 ){
    vec2 ref=pos-pt;
    float ret = step( dot( ref, n1 ), 0.0 );
    ret *= step( dot( ref, n2 ), 0.0 );
    
    return ret;
}

void main(){
    vAtlas=atlas;
    
    float rot=seeds.z+time.x*seeds.z*3.;
    vRot=vec2( sin(rot), cos(rot) );
    
    vec3 pOff=vec3(seeds.z, seeds.y, seeds.w) ;
    
    vec2 sinUV=abs(sin(pOff.xz*.5+seeds.zw+time.x*.1)*.5+.5);
    vec3 noiseCd=texture2D(noiseTexture, sinUV ).rgb*4.5 + 0.50;
    
    float rateShift = (BaseSpeed*(seeds.x*.4+.6));
    float t=time.x*rate*rateShift;
    
    // Random shift to a cycle y movement
    //float shiftY= mod( t+t*seeds.x+seeds.z*8.0+noiseCd.r*10.20*(seeds.y*2.0-1.0)+noiseCd.b+(-seeds.x+seeds.y)*4.0, 10.0);
    
    float shiftY = (t+t*seeds.x+seeds.z*8.0+noiseCd.r*10.20*(seeds.y*2.0-1.0)+noiseCd.b+(-seeds.x+seeds.y)*4.0) * 0.1;
    float lifePerc = fract( shiftY );
    float loopSeed = floor( shiftY ) * seeds.w * 20.0;
    shiftY = lifePerc * 10.0;
    
    // Change up ages of embers
    float fadeDrop = min(1.0, lifePerc*lifePerc*4. ); 
    //
    float life = 1.0-max(0.0,abs(shiftY-seeds.x*.1)*(1.0-(seeds.x*1.0)) );
    life = 1.0-((shiftY*.001-seeds.x*.2) );
    
    pOff.y=shiftY*seeds.y;
    
    pOff.y=(pOff.y)+shiftY; 
    vec3 pos= pOff ;
    

    float spreadPerc = min(1.0, life*2.) * EmberSpread;
    pos.xz=fract(noiseCd.rg*noiseCd.r + loopSeed)*(seeds.x)*(life*seeds.zy*(seeds.w*3.0 )) * spreadPerc ;
    
    
    // Directional push
    float yPush = ( life * (life*.5+.5))  * min(1.0,pos.y*.03) * 3.2;
    pos.xz += windDir.xz * yPush * max(0.0,pos.y-.5)*(.5+life*.5);
    pos.y += yPush;
    
    float pToCamLen = length(pos-cameraPosition);
    float pScalar = max( 0., (1.-pToCamLen *  0.0806 )); // 0.0385
    pScalar += max(0.0,pToCamLen - 0.4) * 0.005;
    
    vAlpha = min(1.0, (seeds.x*.15+.7) * pScalar*3.0 );

    
    vAlpha=max(0.0, life*life-seeds.z-seeds.z);
    float distMult = ( length( pos )*EmberFadeDistance );
    distMult = 1.0 - ( distMult * distMult );
    vAlpha *= distMult;
    
    
    float pScale = pointScale * seeds.w * pScalar + 2.0;
    
    gl_PointSize =  pScale*fadeDrop ;
    
    
    float tightenBase = min( 1.0, pos.y* 0.12 + .2 );
    pos.xz *= tightenBase*tightenBase;
    
    pos += modelMatrix[3].xyz + vec3( -.5, -0.2269, 0.0);
    vec4 mvPos=viewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix*mvPos;
    
    float cdAge = clamp( 1.0 - life, 0.0, 1.0);
    
    vCd = mix( EmberEarlyCd, EmberOldCd, cdAge )  ;
    
    vBrightness = 1.045 + fadeDrop*2.;
}`;
  return ret;
}

export function emberWispsFrag(){
  let ret=shaderHeader();
  ret+=`
    uniform sampler2D atlasTexture;
    uniform vec2 time;
    uniform float rate;
    
    varying vec3 vCd;
    varying vec2 vAtlas;
    varying vec2 vRot;
    varying float vAlpha;
    varying float vBrightness;
    
    
    
    // -- -- --
    
    // Human Eye Adjusted Luminance
    //   https://en.wikipedia.org/wiki/Grayscale
    float luma(vec3 color) {
      return dot( color, vec3(0.2126, 0.7152, 0.0722) );
    }
      
    // -- -- --
    
    
    void main(){
        vec2 uv=gl_PointCoord;

        vec2 pos = (uv-.5)*.85;

        vec2 rotUV;
        rotUV.x = vRot.y * pos.x - vRot.x * pos.y;
        rotUV.y = vRot.x * pos.x + vRot.y * pos.y;
        rotUV=(rotUV+.5)*.25+vAtlas;
        
        
        vec4 dustCd=texture2D(atlasTexture,rotUV);
        float alpha= clamp( dustCd.a*vAlpha, 0.0, 1.0) ;
        
        dustCd.rgb *= vBrightness;
        
        float dirtLuma = luma( dustCd.rgb );
        vec4 Cd=vec4( dirtLuma * vCd * vBrightness, alpha );
        
        gl_FragColor=Cd;
    }`;
  return ret;
}