// pxlNav Enums
//   Written by Kevin Edzenga; 2024
// -- -- -- -- -- -- -- -- -- -- -- --
//


export const VERBOSE_LEVEL = {
	'NONE' : 0,
	'ERROR' : 1,
	'WARN' : 2,
	'INFO' : 3
}

// Anti-aliasing settings
//   Low - cross kernal sampling, 1 center sample + 4 samples diangonally from center pixel
//   medium - 1 center sample + 8 samples diangonally from center pixel
export const ANTI_ALIASING = {
  'OFF' : 0,
  'LOW' : 1,
  'MEDIUM' : 2,
  'HIGH' : 3
}

// Sky Haze settings should be passed through the pxlNav.Options
export const SKY_HAZE = {
  'OFF' : 0,
  'VAPOR' : 1
}

// Shadow edge softness, currently mapped to THREE.PCFSoftShadowMap THREE.PCFShadowMap
// Set in pxlNav.js, used in pxlNav.Environment.js
export const SHADOW_MAP = {
  'OFF' : 0,
  'BASIC' : 1,
  'SOFT' : 2
}


// 'COLOR_SHIFT' is used in Utils.js, inturn used when loading assets through FileIO.js
//
// Upgrade from Three.133 -to- Three.172 introduced color issues from Three.152 for pxlNav ---
//   Since Three.152, by-default color space is converted on import.
//     Please don't assume color spaces for me.
//
//   So, given how I'm rendering things,
//     `FBXLoader.js` has been significantly altered to remove any auto color space conversion.
//   I don't like needing to edit third-party files
//     But I don't want to have to undo what it does just half a second later.
//   ```ColorManagement.toWorkingColorSpace( new Color().fromArray( materialNode.SpecularColor.value ), SRGBColorSpace )```
//         Why?  Please stop.
//   And given how much else I've needed to change-
//     TODO : Custom FBX Loader for pxlNav
//
// TODO : Add color correction to pxlNav to re-implement Three's pre-152 asset processing behavior
//          Tech artists will prep assets for the color spaces they need...
//            We know if a color is linear or sRGB for the use-case of that asset.
//              Each individual asset may required sRGB -or- Linear as it was created.
//
//    TLDR; Re-implement THREE.GammaFactor -> pxlNav.Device.GammaFactor + pxlNav.Utils.gammeCorrectColor()
//      Then use in pxlNav/Environment.js + pxlNav/core/FileIO.js for color conversion.
//        Then figure out which of the post process needs the gamma correct and any extra shaders...
export const COLOR_SHIFT = {
  'KEEP' : 0,
  'sRGB_TO_LINEAR' : 1,
  'LINEAR_TO_sRGB' : 2,
  'WINDOWS_TO_UNIX' : 3,
  'UNIX_TO_WINDOWS' : 4,
  'LINEAR_TO_WINDOWS' : 5,
  'WINDOWS_TO_LINEAR' : 6,
  'LINEAR_TO_UNIX' : 7,
  'UNIX_TO_LINEAR' : 8
}

// -- -- --

// Easy access to the enums
//   Reduce the need to import the enums individually
export const pxlEnums = {
  'VERBOSE_LEVEL' : VERBOSE_LEVEL,
  'ANTI_ALIASING' : ANTI_ALIASING,
  'SKY_HAZE' : SKY_HAZE,
  'SHADOW_MAP' : SHADOW_MAP,
  'COLOR_SHIFT' : COLOR_SHIFT
}
