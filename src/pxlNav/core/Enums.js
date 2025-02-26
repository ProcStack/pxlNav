// pxlNav Enums
//   Written by Kevin Edzenga; 2024
// -- -- -- -- -- -- -- -- -- -- -- --
//


export const VERBOSE_LEVEL = {
	'NONE' : 0,
	'ERROR' : 1,
	'WARN' : 2,
	'INFO' : 3,
	'DEBUG' : 4
};

// Anti-aliasing settings
//   Low - cross kernal sampling, 1 center sample + 4 samples diangonally from center pixel
//   medium - 1 center sample + 8 samples diangonally from center pixel
export const ANTI_ALIASING = {
  'OFF' : 0,
  'LOW' : 1,
  'MEDIUM' : 2,
  'HIGH' : 3
};

// Render Order Layers
export const RENDER_LAYER = {
  'SKY': 0,
  'SCENE': 1,
  'PARTICLES': 5,
  'GLOW': 6,
  'GLOW_MASK' : 7
}


// Sky Haze settings should be passed through pxlNav.pxlOptions
export const SKY_HAZE = {
  'OFF' : 0,
  'VAPOR' : 1
};

// Shadow edge softness, currently mapped to THREE.PCFSoftShadowMap THREE.PCFShadowMap
// Set in pxlNav.js, used in pxlNav.Environment.js
export const SHADOW_MAP = {
  'OFF' : 0,
  'BASIC' : 1,
  'SOFT' : 2
};

// Collder internal types
//  'FLOOR' -> `colliderX` and `colliderZ` attributes from the FBX
export const COLLIDER_TYPE = {
  'FLOOR' : 0, // Default ground/floor type collider
  'WALL' : 1, // Can't walk through, even if there is 'FLOOR' beneath it
  'WALL_TOP' : 2, // The Wall Top; Will be removed in future versions, use 'FLOOR' instead
  'CEILING' : 3, // Not implemented yet
  'PORTAL_WARP' : 4, // Warp to another location in the same room
  'ROOM_WARP' : 5, // Warp to another location in a different room
  'ITEM' : 6, // Callback to item list managed by pxlNav & from Room FBX
  'SCRIPTED' : 7, // Callback to current room on collision
  'HOVERABLE' : 8, // Mouse hoverable, but not clickable
  'CLICKABLE' : 9 // Mouse clickable
};

// Geometry side types
//   Used when casting rays to determine which side of the geometry was hit
//     More specifics will be added as needed
export const GEOMETRY_SIDE = {
  'FRONT' : 0,
  'BACK' : 1,
  'DOUBLE' : 2
};

// Camera event types
//   Subscribe to the pxlCamera object using these event types
//    `pxlNav.pxlCamera.subscribe( CAMERA_EVENT.MOVE, function() { ... } );`
export const CAMERA_EVENT = {
  'MOVE' : 0,
  'ROTATE' : 1,
  'JUMP' : 2,
  'FALL' : 3,
  'LANDED' : 4,
  'COLLISION' : 5
};

// -- -- --

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
};

// -- -- --


// User Settings

// User Speed Settings
export const USER_SPEED = {
  'STOP' : 0,
  'SLOW' : 1,
  'BASE' : 2,
  'BOOST' : 3
};

// -- -- --

// Device Options

// Input-Device Types
export const DEVICE_TYPE = {
  'KEYBOARD' : 0,
  'MOBILE' : 1,
  'GAMEPAD' : 2,
  'XR' : 3,
  'VR' : 3, // Future Proofing - Alias for XR; VRs are XR devices
  'AR' : 3, // Future Proofing - Alias for XR; ARs are XR devices
  'HMD' : 3, // Future Proofing - Alias for XR; HMDs are XR devices
  'OTHER' : 4
};

// Input-Device Events
export const DEVICE_EVENT = {
  'CONNECT' : 0,
  'DISCONNECT' : 1,
  'BUTTON_PRESS' : 2,
  'AXIS_MOVE' : 3,
  'AXIS_LOOK' : 4
};

// Input-Device Buttons
//   Mapped to the GamePad API
//    https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
//  `B_` - Your action buttons
//     The right group of buttons; the 4 Lettered / Colored / Shaped buttons
//      'ABXY' -- 'Square, Triangle, Circle, X' -- 'Red, Green, Blue, Yellow' -- etc.
//  *They are ussually numbered-inputs clockwise starting from the left-top-left
export const DEVICE_BUTTON = {
  'B_L' : 0,
  'B_U' : 1,
  'B_R' : 2,
  'B_D' : 3,
  'L1' : 4,
  'R1' : 5,
  'L2' : 6,
  'R2' : 7,
  'SELECT' : 8,
  'START' : 9,
  'L3' : 10,
  'R3' : 11,
  'UP' : 12,
  'DOWN' : 13,
  'LEFT' : 14,
  'RIGHT' : 15
};

// -- -- --

// Easy access to the enums
//   Reduce the need to import the enums individually
export const pxlEnums = {
  'VERBOSE_LEVEL' : VERBOSE_LEVEL,
  'ANTI_ALIASING' : ANTI_ALIASING,
  'RENDER_LAYER' : RENDER_LAYER,
  'SKY_HAZE' : SKY_HAZE,
  'SHADOW_MAP' : SHADOW_MAP,
  'CAMERA_EVENT' : CAMERA_EVENT,
  'COLLIDER_TYPE' : COLLIDER_TYPE,
  'GEOMETRY_SIDE' : GEOMETRY_SIDE,
  'COLOR_SHIFT' : COLOR_SHIFT,
  'USER_SPEED' : USER_SPEED
};
