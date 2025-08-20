// pxlNav Shader
//  -- -- -- --
// Written by Kevin Edzenga; 2020; 2024

import {shaderHeader} from "../../../shaders/core/ShaderHeader.js";

export const smokeSettings = {
    'BaseSpread' : 200.0,
    'SmokeBrightness' : 0.65,
    'InnerBulster' : -0.05,
    'SmokeDensity' : 0.12,
    'WindInfluenceBoost' : 0.45,
    'TightenBaseSpread' : 1.0,
    'TightenMidSpread' : 0.08,
    'TightenTipSpread' : 0.20
  };


export function smokeVert( shaderSettings = {} ){

  shaderSettings = Object.assign( {}, smokeSettings, shaderSettings );

  // -- -- --

  let toFloatStr = ( num ) => {
    return (num+"").includes(".") ? num : num+".0";
  };

  // -- -- --

  let ret=`
// Billowy goodness!
  const float BaseSpread = ${toFloatStr(shaderSettings.BaseSpread)};
  const float SmokeBrightness = ${toFloatStr(shaderSettings.SmokeBrightness)};
  const float InnerBulster = ${toFloatStr(shaderSettings.InnerBulster)};
  const float SmokeDensity = ${toFloatStr(shaderSettings.SmokeDensity)};
  const float WindInfluenceBoost = ${toFloatStr(shaderSettings.WindInfluenceBoost)};

  const float TightenBaseSpread = ${toFloatStr(shaderSettings.TightenBaseSpread)};
  const float TightenMidSpread = ${toFloatStr(shaderSettings.TightenMidSpread)};
  const float TightenTipSpread = ${toFloatStr(shaderSettings.TightenTipSpread)};

  // -- -- --
  `;
  ret += shaderHeader();
  ret+=` 

  // -- -- --
         
    uniform sampler2D noiseTexture;
    uniform vec2 time;
    uniform float rate;
    uniform vec3 windDir;
    uniform vec3 offsetPos;
    uniform vec2 pointScale;
    uniform vec3 sliders;
    
    attribute vec4 seeds;
    attribute vec2 atlas;
    
    varying vec2 vAtlas;
    varying vec2 vRot;
    varying float vAlpha;
    varying float vBrightness;
    
    
    #define PROX 6.0
    
    
    float colDetect( vec2 pos, vec2 pt, vec2 n1, vec2 n2 ){
      vec2 ref=pos-pt;
      float ret = step( dot( ref, n1 ), 0.0 );
      ret *= step( dot( ref, n2 ), 0.0 );
      
      return ret;
    }
     
        
    void main(){
      vAtlas=atlas;
      
      float rot=seeds.z+time.x*(seeds.z*2.);
      vRot=vec2( sin(rot), cos(rot) );
      
      vec3 pOff=vec3(seeds.z, seeds.y, seeds.w) ;
      
      vec2 sinUV=abs(sin(pOff.xz*.5+seeds.zw+time.x*.1)*.5+.5);
      vec3 noiseCd=texture2D(noiseTexture, sinUV ).rgb*4.5 + 0.50;
      
      float t=time.x*rate;
      float shiftY= mod( t+t*seeds.x+seeds.z*24.0+noiseCd.r+noiseCd.b+(seeds.x+seeds.y)*2.0, 14.0);
      float life = max(0.0,(shiftY-seeds.x)*0.07142857142857142)*.9+.2;
      float alphaMult = (1.0-(1.0-life)*(1.0-life))*SmokeDensity;
      
      pOff.y=shiftY*seeds.y*life - (1.0-life);
      
      pOff.y=(pOff.y)+shiftY; 
      vec3 pos= pOff ;
      
      
      // Magic numbers!  Boo!!
      float tightenTip = max(0.0,life-.73);
      tightenTip = 1.0 - (1.0-tightenTip) * (1.0-tightenTip);
      //tightenTip *= tightenTip;
      float tightenBase = max(0.0, (1.0-life)*InnerBulster);
      float tightenMid = max(0.0, TightenBaseSpread - tightenTip - tightenBase - seeds.x*.2);
      
      float curBaseSpread = BaseSpread * tightenBase +
                            BaseSpread * tightenMid * TightenMidSpread +
                            BaseSpread * tightenTip * TightenTipSpread ;
      
      //pos.xz=clamp((noiseCd.rg*noiseCd.b)*seeds.w, vec2(0.0), vec2(1.0))*curBaseSpread*(life*(seeds.zy*.6));
      pos.xz=(noiseCd.rg*noiseCd.b)*seeds.w*curBaseSpread*life;
      
      // Wind -- Forces
      //   Magic numbers, yarb!
      float windInf = life * life * (life*.5+.5);
      vec2 curWindDir = windInf * windDir.xz ;
      
      float yPush = ( life * (life*.5+.5))* min(1.0,pos.y*.12) * .08;
      pos.xz += curWindDir*life + curWindDir * WindInfluenceBoost ;
      
      
      // Alpha with cam distance inf
      float pScalar = 1.0-min( 1.0, (length(pos-cameraPosition )*0.004) );
      pScalar=1.0-(pScalar*pScalar);
      float aMult = min(1.0, pScalar*2.0);
      vAlpha = (seeds.x*.5+.7) * aMult;

      
      // Alpha from gettin' old
      vAlpha=(1.0-life)*min(1.0,alphaMult);
      vec3 doubleCd=texture2D(noiseTexture, sinUV+pos.xz*.5+vec2(seeds.y,pos.y)).rgb ;
      pos.xz=(pos.xz*(0.9+seeds.xy*.2)+doubleCd.rb*10.0)*min(1.0,life+seeds.y);
      
      
      // Draw size, particle scale
      pScalar = 1.0-(1.0-pScalar)*.75*(1.0-pScalar);
      float pScale = pointScale.x * seeds.w * 0.6 * pScalar + (175.0+125.0*life*pScalar)*(1.0-pScalar);
      pScale += 150.0*(clamp(-(pScalar-.45)*10.0,0.0,1.0));

      gl_PointSize = pScale;
      
      // Brightness multiplier
      vBrightness = 1.0-tightenMid*.1 - tightenTip + tightenBase;
      float originDelta = length(pos)*(-InnerBulster);
      vBrightness *= max(0.0, 1.0-originDelta * life * 0.807) * SmokeBrightness;
      
      // Apply Offset Position and move to camera space
      vec4 mvPos=modelViewMatrix * vec4(pos+offsetPos, 1.0);
      gl_Position = projectionMatrix*mvPos;
    }`;
  return ret;
}

export function smokeFrag( hasAlphaMap = false ){
  let ret = shaderHeader();
  ret +=`
    // -- -- --
    
    uniform sampler2D atlasTexture;
    uniform sampler2D atlasAlphaTexture;
    uniform vec2 time;
    uniform float rate;
    
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
        float alpha=dustCd.a*vAlpha;
        vec4 Cd=vec4( dustCd.rgb, alpha );

        float lumaCd = luma( Cd.rgb );

        Cd.rgb = mix( vec3( lumaCd ), Cd.rgb, vBrightness*.2 );

        Cd.rgb *= vec3(vBrightness);
        //Cd.rgb *= Cd.rgb*.5+.5;
        
        gl_FragColor=Cd;
    }`;
  return ret;
}