# pxlNav Docs - pxlShaders

*-Stand-In-*

The pxlShaders object holds all of the shaders that can be user from render passes to animated textures using images set up for animation using Red Green and Blue channels to drive the animation.

More information to come shortly.

```
pxlShaders={
  'animated':{
      animTextureVert, animTextureFrag,
      clickableBevelVert, clickableBevelFrag,
      portalBaseVert, portalBaseFrag
    },
  'core':{
      defaultVert, defaultShiftVert,
      camPosVert, discardFrag,
      shaderHeader
    },
  'objects':{
      itemBaseVert, itemBaseFrag,
      itemVert, itemFrag, itemZoomFrag,
      pxlPrincipledVert, pxlPrincipledFrag
    },
  'particles':{ 
    emberWispsVert, emberWispsFrag,
    dustVert, dustFrag,
    smokeVert, smokeFrag,
    snowVert, snowFrag 
    },
  'rendering':{
      worldPositionVert, worldPositionFrag, 
      glowPassPostProcess, textureStorePass, 
      compLayersPostProcess, boxAntiAliasPass, 
      crossAntiAliasPass, directionalBlurPass, 
      mixBlurShaderPass, motionBlurPostProcess, 
      chroAberPostProcess, lKingPostProcess, 
      iZoomPostProcess, sFieldPostProcessVert, 
      sFieldPostProcessFrag, warpPostProcess, 
      finalOverlayHeavyShader, finalOverlayShader, 
      finalOverlaySlimShader 
    },
  'scene':{
      bgScreenVert, bgScreenFrag,
      skyObjectVert, skyObjectFrag
    }
}
```