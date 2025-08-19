// pxlNav Shader
//  -- -- -- --
// Written by Kevin Edzenga; 2025

import {shaderHeader} from "../core/ShaderHeader.js";
 
///////////////////////////////////////////////////////////
// RGB & Alpha Map Frag Shader                          //
/////////////////////////////////////////////////////////

export function rgbaMapFrag(){
  let ret=shaderHeader();
  ret+=`
    uniform sampler2D rgbMap;
    uniform sampler2D alphaMap;

    varying vec2 vUv;

    main(){
      vec3 rgb=texture2D( rgbMap, vUv ).rgb;
      float alpha=texture2D( alphaMap, vUv ).r;

      vec4 outCd = vec4( rgb, alpha );
      gl_FragColor=outCd;
    }
  `;
  return ret;
}


