// pxlNav Enums
//   Written by Kevin Edzenga; 2024,2025
// -- -- -- -- -- -- -- -- -- -- -- --
//

/**
 * pxlNav Enums
 * 
 * When a 'type' needs to be determined, enums help to show the available options.
 * 
 * Please see the [pxlEnums]{@link pxlEnums} class document for all the enum values.
 * 
 * @link pxlEnums
 * 
 * @name #pxlEnums
 * @global
 * @type {Object}
 * @property {Object} pxlEnums - pxlNav {Enums} contains all the enums used in pxlNav
 * @property {Object} VERBOSE_LEVEL - Console logging levels
 * @property {Object} ANTI_ALIASING - Anti-aliasing settings
 * @property {Object} RENDER_LAYER - Render Order Layers
 * @property {Object} SKY_HAZE - Sky Haze settings
 * @property {Object} SHADOW_MAP - Shadow edge softness settings
 * @property {Object} CAMERA_EVENT - Camera event types
 * @property {Object} COLLIDER_TYPE - Collider internal types
 * @property {Object} GEOMETRY_SIDE - Geometry side types
 * @property {Object} COLOR_SHIFT - Color space conversion options
 * @property {Object} USER_SPEED - User speed settings
 * @property {Object} DEVICE_TYPE - Input-Device Types
 * @property {Object} DEVICE_EVENT - Input-Device Events
 * @property {Object} DEVICE_BUTTON - Input-Device Buttons
 * @property {Object} DEVICE_ACTION - Input-Device Actions
 * @property {Object} HUD_ELEMENT - GUI & HUD Element types
 * @property {Object} HUD_ACTION - GUI & HUD Element actions
 * @property {Object} HUD_DRAW - GUI & HUD Element draw types
 */


/**
 * pxlNav Enums
 * 
 * When a 'type' needs to be determined, enums help to show the available options.
 * 
 * @name pxlEnums
 * @class
 * @type {Object}
 * 
 * @property {Object} pxlEnums - pxlNav {Enums} contains all the enums used in pxlNav
 * @property {Object} VERBOSE_LEVEL - Console logging levels
 * @property {Object} ANTI_ALIASING - Anti-aliasing settings
 * @property {Object} RENDER_LAYER - Render Order Layers
 * @property {Object} SKY_HAZE - Sky Haze settings
 * @property {Object} SHADOW_MAP - Shadow edge softness settings
 * @property {Object} CAMERA_EVENT - Camera event types
 * @property {Object} COLLIDER_TYPE - Collider internal types
 * @property {Object} GEOMETRY_SIDE - Geometry side types
 * @property {Object} COLOR_SHIFT - Color space conversion options
 * @property {Object} USER_SPEED - User speed settings
 * @property {Object} DEVICE_TYPE - Input-Device Types
 * @property {Object} DEVICE_EVENT - Input-Device Events
 * @property {Object} DEVICE_BUTTON - Input-Device Buttons
 * @property {Object} DEVICE_ACTION - Input-Device Actions
 * @property {Object} HUD_ELEMENT - GUI & HUD Element types
 * @property {Object} HUD_ACTION - GUI & HUD Element actions
 * @property {Object} HUD_DRAW - GUI & HUD Element draw types
 */

// -- -- --


/**
 * Console logging levels
 * @name VERBOSE_LEVEL
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} NONE - No console logging
 * @property {number} ERROR - Log only errors
 * @property {number} WARN - Log errors and warnings
 * @property {number} INFO - Log errors, warnings, and info
 * @property {number} DEBUG - Log all console messages
 */
export const VERBOSE_LEVEL = {
	'NONE' : 0,
	'ERROR' : 1,
	'WARN' : 2,
	'INFO' : 3,
	'DEBUG' : 4
};


/**
 * Known File Types in pxlNav
 * 
 * Used internally to determine the file type when loading scene + asset files.
 * 
 * More to come as support changes,
 * 
 * Note: GLB can support WEBP textures while most CGI programs cannot.
 *         If your CGI program cannot support WEBP,
 *           Build + use Three.js or pxlNav materials in your pxlRoom
 * 
 * @name FILE_TYPE
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} AUTO - Auto detect file type on pre-load
 * @property {number} JPG - JPG file type
 * @property {number} JPEG - JPEG file type
 * @property {number} PNG - PNG file type
 * @property {number} WEBP - WEBP file type
 * @property {number} FBX - FBX file type
 * @property {number} GLTF - GLTF file type
 * @property {number} GLB - GLB file type
 */
export const FILE_TYPE = {
  'AUTO' : -1,
  'JPG' : 0,
  'JPEG' : 0,
  'PNG' : 1,
  'WEBP' : 2,
  'FBX' : 3,
  'GLTF' : 4,
  'GLB' : 5
};


// Anti-aliasing settings
//   Low - cross kernal sampling, 1 center sample + 4 samples diangonally from center pixel
//   medium - 1 center sample + 8 samples diangonally from center pixel
/**
 * Anti-aliasing settings
 * @name ANTI_ALIASING
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} OFF - No anti-aliasing
 * @property {number} LOW - Low anti-aliasing
 * @property {number} MEDIUM - Medium anti-aliasing
 * @property {number} HIGH - High anti-aliasing
 */
export const ANTI_ALIASING = {
  'OFF' : 0,
  'LOW' : 1,
  'MEDIUM' : 2,
  'HIGH' : 3
};

// Render Order Layers
/**
 * Render Order Layers
 * @name RENDER_LAYER
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} SKY - Sky layer
 * @property {number} SCENE - Scene layer
 * @property {number} PARTICLES - Particle layer
 * @property {number} GLOW - Glow layer
 * @property {number} GLOW_MASK - Glow mask layer
 */
export const RENDER_LAYER = {
  'SKY': 0,
  'SCENE': 1,
  'PARTICLES': 5,
  'GLOW': 6,
  'GLOW_MASK' : 7
}


// Sky Haze settings should be passed through pxlNav.pxlOptions
/**
 * Sky Haze settings
 * @name SKY_HAZE
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} OFF - No sky haze
 * @property {number} VAPOR - Vapor sky haze
 */
export const SKY_HAZE = {
  'OFF' : 0,
  'VAPOR' : 1
};

// Shadow edge softness, currently mapped to THREE.PCFSoftShadowMap THREE.PCFShadowMap
// Set in pxlNav.js, used in pxlNav.Environment.js
/**
 * Shadow edge softness settings
 * @name SHADOW_MAP
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} OFF - No shadow edge softness
 * @property {number} BASIC - Basic shadow edge softness
 * @property {number} SOFT - Soft shadow edge softness
 */
export const SHADOW_MAP = {
  'OFF' : 0,
  'BASIC' : 1,
  'SOFT' : 2
};

// Collder internal types
/**
 * Collider internal types
 * @name COLLIDER_TYPE
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} FLOOR - Default ground/floor type collider
 * @property {number} WALL - Can't walk through, even if there is 'FLOOR' beneath it
 * @property {number} WALL_TOP - The Wall Top; Will be removed in future versions, use 'FLOOR' instead
 * @property {number} CEILING - Not implemented yet
 * @property {number} PORTAL_WARP - Warp to another location in the same room
 * @property {number} ROOM_WARP - Warp to another location in a different room
 * @property {number} ITEM - Callback to item list managed by pxlNav & from Room FBX
 * @property {number} SCRIPTED - Callback to current room on collision
 * @property {number} HOVERABLE - Mouse hoverable, but not clickable
 * @property {number} CLICKABLE - Mouse clickable
 */
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
/**
 * Geometry side types
 * @name GEOMETRY_SIDE
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} FRONT - Front side of the geometry
 * @property {number} BACK - Back side of the geometry
 * @property {number} DOUBLE - Both sides of the geometry
 */
export const GEOMETRY_SIDE = {
  'FRONT' : 0,
  'BACK' : 1,
  'DOUBLE' : 2
};

// Camera event types
//   Subscribe to the pxlCamera object using these event types
//    `pxlNav.pxlCamera.subscribe( CAMERA_EVENT.MOVE, function() { ... } );`
/**
 * Camera event types
 * @name CAMERA_EVENT
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} MOVE - Camera movement event
 * @property {number} ROTATE - Camera rotation event
 * @property {number} JUMP - Camera jump event
 * @property {number} FALL - Camera fall event
 * @property {number} LANDED - Camera landed event
 * @property {number} COLLISION - Camera collision event
 */
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
//   The color shift is used to convert color spaces between different platforms
// TODO : Add color correction to pxlNav to re-implement Three's pre-152 asset processing behavior...
/**
 * Color space conversion options
 * @name COLOR_SHIFT
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} KEEP - Keep the color as is
 * @property {number} sRGB_TO_LINEAR - Convert sRGB to Linear color space
 * @property {number} LINEAR_TO_sRGB - Convert Linear to sRGB color space
 * @property {number} WINDOWS_TO_UNIX - Convert Windows color space to Unix color space
 * @property {number} UNIX_TO_WINDOWS - Convert Unix color space to Windows color space
 * @property {number} LINEAR_TO_WINDOWS - Convert Linear color space to Windows color space
 * @property {number} WINDOWS_TO_LINEAR - Convert Windows color space to Linear color space
 * @property {number} LINEAR_TO_UNIX - Convert Linear color space to Unix color space
 * @property {number} UNIX_TO_LINEAR - Convert Unix color space to Linear color space
 */
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
/**
 * User speed settings
 * @name USER_SPEED
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} STOP - Stop movement
 * @property {number} SLOW - Slow movement
 * @property {number} BASE - Base movement
 * @property {number} BOOST - Boosted movement
 */
export const USER_SPEED = {
  'STOP' : 0,
  'SLOW' : 1,
  'BASE' : 2,
  'BOOST' : 3
};

// -- -- --

// Device Options

// Input-Device Types
/**
 * Input-Device Types
 * @name DEVICE_TYPE
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} KEYBOARD - Keyboard input device
 * @property {number} MOBILE - Mobile input device
 * @property {number} GAMEPAD - Gamepad input device ( Unused )
 * @property {number} XR - Extended Reality input device ( Unused )
 * @property {number} VR - Virtual Reality input device ( Unused )
 * @property {number} AR - Augmented Reality input device ( Unused )
 * @property {number} OTHER - Other input device ( Unused )
 */
export const DEVICE_TYPE = {
  'KEYBOARD' : 0,
  'MOBILE' : 1,
  'GAMEPAD' : 2,
  'XR' : 3,
  'VR' : 3, // Future Proofing - Alias for XR; VRs are XR devices
  'AR' : 3, // Future Proofing - Alias for XR; ARs are XR devices
  'OTHER' : 4
};

// Input-Device Events
/**
 * Input-Device Events
 * @name DEVICE_EVENT
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} CONNECT - Device connected
 * @property {number} DISCONNECT - Device disconnected
 * @property {number} BUTTON_PRESS - Button pressed
 * @property {number} AXIS_MOVE - Axis moved
 * @property {number} AXIS_LOOK - Axis looking
 */
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
/**
 * Input-Device Buttons
 * @name DEVICE_BUTTON
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @private
 * @property {number} B_L - Button Left
 * @property {number} B_U - Button Up
 * @property {number} B_R - Button Right
 * @property {number} B_D - Button Down
 * @property {number} L1 - Left Bumper
 * @property {number} R1 - Right Bumper
 * @property {number} L2 - Left Trigger
 * @property {number} R2 - Right Trigger
 * @property {number} SELECT - Select Button
 * @property {number} START - Start Button
 * @property {number} L3 - Left Stick Click
 * @property {number} R3 - Right Stick Click
 * @property {number} UP - D-Pad Up
 * @property {number} DOWN - D-Pad Down
 * @property {number} LEFT - D-Pad Left
 * @property {number} RIGHT - D-Pad Right
 */
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

/**
 * Input-Device Actions
 * @name DEVICE_ACTION
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} MOVE - Move action
 * @property {number} MOVE_X - Move X axis ( Unused )
 * @property {number} MOVE_Y - Move Y axis ( Unused )
 * @property {number} LOOK - Look action
 * @property {number} LOOK_X - Look X axis ( Unused )
 * @property {number} LOOK_Y - Look Y axis ( Unused )
 * @property {number} JUMP - Jump action
 * @property {number} RUN - Run action
 * @property {number} ACTION - Action button
 * @property {number} ACTION_ALT - Alternate action button ( Unused )
 * @property {number} ITEM - Item button
 * @property {number} MENU - Menu button ( Unused )
 * @property {number} PAUSE - Pause button
 * @property {number} MAP - Map button ( Unused )
 */
export const DEVICE_ACTION = {
  'MOVE' : 0,
  'MOVE_X' : 1,
  'MOVE_Y' : 2,
  'LOOK' : 3,
  'LOOK_X' : 4,
  'LOOK_Y' : 5,
  'JUMP' : 6,
  'RUN' : 7,
  'ACTION' : 8,
  'ACTION_ALT' : 9,
  'ITEM' : 10,
  'MENU' : 11,
  'PAUSE' : 12,
  'MAP' : 13
}

// -- -- --

// GUI & HUD Enum Options
/**
 * GUI & HUD Element types
 * @name HUD_ELEMENT
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} REGION - Region element
 * @property {number} DRAG_REGION - Drag Region element
 * @property {number} BUTTON - Button element
 * @property {number} THUMBSTICK - Thumbstick element
 * @property {number} SLIDER - Slider element ( Unused )
 * @property {number} IMAGE - Image element ( Unused )
 * @property {number} TEXT - Text element ( Unused )
 */
export const HUD_ELEMENT = {
  'REGION' : 0,
  'DRAG_REGION' : 1,
  'BUTTON' : 2,
  'THUMBSTICK' : 3,
  'SLIDER' : 4,
  'IMAGE' : 5,
  'TEXT' : 6
};

/**
 * GUI & HUD Element actions
 * @name HUD_ACTION
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @property {number} NONE - No action
 * @property {number} CLICK - Click action
 * @property {number} HOVER - Hover action
 * @property {number} ACTIVE - Active action
 * @property {number} DRAG - Drag action
 * @property {number} DROP - Drop action ( Unused )
 */
export const HUD_ACTION = {
  'NONE' : 0,
  'CLICK' : 1,
  'HOVER' : 2,
  'ACTIVE' : 3,
  'DRAG' : 4,
  'DROP' : 5
};

/**
 * GUI & HUD Element draw types
 * @name HUD_DRAW
 * @type {Object}
 * @method
 * @memberof pxlEnums
 * @private
 * @property {number} DEFAULT - Default draw type
 * @property {number} BLENDED - Blended draw type
 */
export const HUD_DRAW = {
  'DEFAULT' : 0,
  'BLENDED' : 1
};

// -- -- --

// Easy access to the enums
//   Reduce the need to import the enums individually
/**
 * Full pxlNav Enums list
 * @type {Object}
 * @memberof pxlEnums
 * @property {Object} VERBOSE_LEVEL - Console logging levels
 * @property {Object} ANTI_ALIASING - Anti-aliasing settings
 * @property {Object} RENDER_LAYER - Render Order Layers
 * @property {Object} SKY_HAZE - Sky Haze settings
 * @property {Object} SHADOW_MAP - Shadow edge softness settings
 * @property {Object} CAMERA_EVENT - Camera event types
 * @property {Object} COLLIDER_TYPE - Collider internal types
 * @property {Object} GEOMETRY_SIDE - Geometry side types
 * @property {Object} COLOR_SHIFT - Color space conversion options
 * @property {Object} USER_SPEED - User speed settings
 * @property {Object} DEVICE_TYPE - Input-Device Types
 * @property {Object} DEVICE_EVENT - Input-Device Events
 * @property {Object} DEVICE_BUTTON - Input-Device Buttons
 * @property {Object} DEVICE_ACTION - Input-Device Actions
 * @property {Object} HUD_ELEMENT - GUI & HUD Element types
 * @property {Object} HUD_ACTION - GUI & HUD Element actions
 * @property {Object} HUD_DRAW - GUI & HUD Element draw types
 */
export const pxlEnums = {
  VERBOSE_LEVEL,
  FILE_TYPE,
  ANTI_ALIASING,
  RENDER_LAYER,
  SKY_HAZE,
  SHADOW_MAP,
  CAMERA_EVENT,
  COLLIDER_TYPE,
  GEOMETRY_SIDE,
  COLOR_SHIFT,
  USER_SPEED,
  DEVICE_TYPE,
  DEVICE_EVENT,
  DEVICE_BUTTON,
  DEVICE_ACTION,
  HUD_ELEMENT,
  HUD_ACTION,
  HUD_DRAW
};
