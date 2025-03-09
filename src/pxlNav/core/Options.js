
import { pxlEnums } from './Enums.js';

/**
 * @global
 * @name pxlUserSettings
 * @description User settings for pxlNav
 * @property {object} height - User height settings
 * @property {number} height.standing - Standing height in units; any camera in your room's FBX will override this height once loaded
 * @property {number} height.stepSize - Max step height in units
 * @property {object} movement - User movement settings
 * @property {number} movement.scalar - Overall movement rate scalar
 * @property {number} movement.max - Max movement speed
 * @property {number} movement.easing - Easing rate between Step() calls
 * @property {object} look - User look settings
 * @property {boolean} look.pc - Look settings for desktop
 * @property {boolean} look.pc.invert - Invert ( Southpaw ) look on desktop
 * @property {boolean} look.mobile - Look settings for mobile
 * @property {boolean} look.mobile.invert - Invert look on mobile
 * @property {object} headBounce - User head bounce settings
 * @property {number} headBounce.height - Bounce magnitude in units
 * @property {number} headBounce.rate - Bounce rate per Step()
 * @property {number} headBounce.easeIn - When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
 * @property {number} headBounce.easeOut - When move key is let go, the ease back to no bounce; `bounce * easeOut`
 * @property {object} jump - User jump settings
 * @property {number} jump.impulse - Jump impulse force applied to the player while holding the jump button
 * @property {number} jump.holdMax - Max influence of holding the jump button on current jump; in seconds
 * @property {number} jump.repeatDelay - Delay between jumps when holding the jump button
 * @property {object} gravity - User gravity settings
 * @property {number} gravity.ups - Units per Step() per Step()
 * @property {number} gravity.max - Max gravity rate
 * @property {object} deadZone - User dead zone settings
 * @property {number} deadZone.controller - Dead zone for controller input, in stick tilt
 * @property {number} deadZone.touch - Dead zone for touch input, in pixels
 * @property {number} deadZone.xr - Dead zone for XR input, in hand detection precision
 * @example
 * // Example usage
 *  import { pxlNav, pxlUserSettings, pxlOptions } from './pxlNav.js';
 * 
 * // Project name
 * const projectTitle = "Test Project";
 * 
 * // Booting rooms
 * const startingRoom = "YourEnvironment";
 * const bootRoomList = [startingRoom];
 * 
 * // User settings for the default/initial pxlNav environment
 * //   These can be adjusted from your `pxlRoom` but easily set defaults here
 * const userSettings = Object.assign({}, pxlUserSettings);
 * userSettings['height']['standing'] = 1.75; // Standing height in units; any camera in your room's FBX will override this height once loaded
 * userSettings['height']['stepSize'] = 5; // Max step height in units
 * 
 * // Copy the default options
 * let pxlNavOptions = Object.assign({},pxlOptions);
 * pxlNavOptions.userSettings = userSettings;
 * 
 * const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );
 * pxlNavEnv.init();
 * @example
 * export const pxlUserSettings = {
 *   'height' : {
 *      'standing' : 1.75, // Standing height in units; any camera in your room's FBX will override this height once loaded
 *      'stepSize' : 5 // Max step height in units
 *    },
 *   'movement' : {
 *      'scalar' : 1.0, // Overall movement rate scalar
 *      'max' : 10.0, // Max movement speed
 *      'easing' : 0.55, // Easing rate between Step() calls
 *    },
 *   'look' : {
 *      'pc' : {
 *         'invert' : false // Invert ( Southpaw ) look on desktop
 *       },
 *      'mobile' : {
 *         'invert' : false // Invert look on mobile
 *       }
 *    },
 *   'headBounce' : {
 *      'height' : 0.3, // Bounce magnitude in units
 *      'rate' : 0.025, // Bounce rate per Step()
 *      'easeIn' : 0.03, // When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
 *      'easeOut' : 0.95 // When move key is let go, the ease back to no bounce; `bounce * easeOut`
 *    },
 *   'jump' : {
 *      'impulse' : 0.75, // Jump impulse force applied to the player while holding the jump button
 *      'holdMax' : 2.85, // Max influence of holding the jump button on current jump; in seconds
 *      'repeatDelay' : 0.08 // Delay between jumps when holding the jump button
 *    },
 *   'gravity' : {
 *      'ups' : 0.3, // Units per Step() per Step()
 *      'max' : 15.5 // Max gravity rate
 *    },
 *   'deadZone' : {
 *      'controller' : 0.10, // Dead zone for controller input, in stick tilt
 *      'touch' : 20, // Dead zone for touch input, in pixels
 *      'xr' : 0.10 // Dead zone for XR input, in hand detection precision
 *    },
 *  }
 */
export const pxlUserSettings = {
    'height' : {
        'standing' : 1.75, // Standing height in units; any camera in your room's FBX will override this height once loaded
        'stepSize' : 5 // Max step height in units
      },
    'movement' : {
        'scalar' : 1.0, // Overall movement rate scalar
        'max' : 10.0, // Max movement speed
        'easing' : 0.55, // Easing rate between Step() calls
      },
    'look' : {
        'pc' : {
            'invert' : false // Invert ( Southpaw ) look on desktop
          },
        'mobile' : {
            'invert' : false // Invert look on mobile
          }
      },
    'headBounce' : {
        'height' : 0.3, // Bounce magnitude in units
        'rate' : 0.025, // Bounce rate per Step()
        'easeIn' : 0.03, // When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
        'easeOut' : 0.95 // When move key is let go, the ease back to no bounce; `bounce * easeOut`
      },
    'jump' : {
        'impulse' : 0.75, // Jump impulse force applied to the player while holding the jump button
        'holdMax' : 2.85, // Max influence of holding the jump button on current jump; in seconds
        'repeatDelay' : 0.08 // Delay between jumps when holding the jump button
      },
    'gravity' : {
        'ups' : 0.3, // Units per Step() per Step()
        'max' : 15.5 // Max gravity rate
      },
    'deadZone' : {
        'controller' : 0.10, // Dead zone for controller input, in stick tilt
        'touch' : 20, // Dead zone for touch input, in pixels
        'xr' : 0.10 // Dead zone for XR input, in hand detection precision
      },
  };

/**
 * @global
 * @name pxlOptions
 * @description Default options for pxlNav
 * 
 * Pass a pxlOptions object to the pxlNav constructor to override these defaults.
 * @property {number} verbose - Verbosity level for console logging
 * @property {object} fps - Frames per second settings
 * @property {number} fps.pc - FPS for desktop
 * @property {number} fps.mobile - FPS for mobile
 * @property {boolean} staticCamera - Whether the camera is static
 * @property {boolean} autoCamera - Whether the camera is automatically controlled
 * @property {boolean} allowStaticRotation - Whether static rotation is allowed
 * @property {pxlUserSettings} userSettings - User settings for pxlNav; set to a `pxlUserSettings` object
 * @property {boolean} subTickCalculations - Whether to calculate sub-ticks
 * @property {string} pxlRoomRoot - Path to room assets
 * @property {string} pxlAssetRoot - Path to asset assets
 * @property {boolean} showOnboarding - Whether to show onboarding
 * @property {object} onboarding - Onboarding settings
 * @property {object} onboarding.pc - Onboarding settings for desktop
 * @property {string} onboarding.pc.message - Onboarding message for desktop
 * @property {string[]} onboarding.pc.messageStyle - Onboarding message style for desktop
 * @property {string} onboarding.pc.buttonText - Onboarding button text for desktop
 * @property {string[]} onboarding.pc.buttonStyle - Onboarding button style for desktop
 * @property {object} onboarding.mobile - Onboarding settings for mobile
 * @property {string} onboarding.mobile.message - Onboarding message for mobile
 * @property {string[]} onboarding.mobile.messageStyle - Onboarding message style for mobile
 * @property {string} onboarding.mobile.buttonText - Onboarding button text for mobile
 * @property {string[]} onboarding.mobile.buttonStyle - Onboarding button style for mobile
 * @property {string[]} loaderPhrases - Loader phrases
 * @property {string} antiAliasing - Anti-aliasing level
 * @property {object} collisionScale - Collision scale settings
 * @property {number} collisionScale.gridSize - Grid size for collision
 * @property {number} collisionScale.gridReference - Grid reference for collision
 * @property {string} shadowMapBiasing - Shadow map biasing level
 * @property {boolean} loadEnvAssetFile - Whether to load environment asset file
 * @property {string} skyHaze - Sky haze level
 * @property {object} postProcessPasses - Post-process passes settings
 * @property {boolean} postProcessPasses.roomGlowPass - Whether to enable room glow pass
 * @property {boolean} postProcessPasses.mapComposerWarpPass - Whether to enable map composer warp pass
 * @property {boolean} postProcessPasses.chromaticAberrationPass - Whether to enable chromatic aberration pass
 * @property {boolean} postProcessPasses.lizardKingPass - Whether to enable lizard king pass
 * @property {boolean} postProcessPasses.starFieldPass - Whether to enable star field pass
 * @property {boolean} postProcessPasses.crystallinePass - Whether to enable crystalline pass
 * @example
 * // Example usage
 *  import { pxlNav, pxlOptions } from './pxlNav.js';
 * 
 * // Project name
 * const projectTitle = "Test Project";
 * 
 * // Booting rooms
 * const startingRoom = "YourEnvironment";
 * const bootRoomList = [startingRoom];
 * 
 * // Target FPS (Frames Per Second)
 * //   Default is - PC = 60  -&-  Mobile = 30
 * const targetFPS = {
 *   'pc' : 45,
 *   'mobile' : 30
 * };
 * 
 * // Copy the default options
 * let pxlNavOptions = Object.assign({},pxlOptions);
 * pxlNavOptions.fps = targetFPS;
 * 
 * const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );
 * pxlNavEnv.init();
 * @example
 * export const pxlOptions = {
 *   'verbose' : pxlEnums.VERBOSE_LEVEL.NONE,
 *   'fps' : {
 *      'pc' : 60,
 *      'mobile' : 30
 *    },
 *    'renderScale' : {
 *      'pc' : 1.0,
 *      'mobile' : 1.0
 *    },
 *   'staticCamera' : false,
 *   'autoCamera' : false,
 *   'allowStaticRotation' : false,
 *   'userSettings' : Object.assign({}, pxlUserSettings),
 *   'subTickCalculations' : false,
 *   'pxlRoomRoot' : "./pxlRooms",
 *   'pxlAssetRoot' : "./pxlAssets",
 *   'showOnboarding' : true,
 *   'onboarding' : {
 *      'pc' : {
 *         'message' : "Welcome to<br>%projectTitle%",
 *         'messageStyle' : ['pxlGui-welcome-message'],
 *         'buttonText' : "close",
 *         'buttonStyle' : ['guiButton']
 *       },
 *      'mobile' : {
 *         'message' : "Welcome to<br>%projectTitle%",
 *         'messageStyle' : ['pxlGui-mobile-body'],
 *         'buttonText' : "start",
 *         'buttonStyle' : ['guiButton', 'pxlGui-mobile-welcomeButton']
 *       }
 *    },
 *   'loaderPhrases' : ['...loading the pixels...'],
 *   'antiAliasing' : pxlEnums.ANTI_ALIASING.LOW,
 *   'collisionScale' : {
 *      'gridSize' : 50,
 *      'gridReference' : 1000
 *    },
 *   'shadowMapBiasing' : pxlEnums.SHADOW_MAP.BASIC,
 *   'loadEnvAssetFile' : false,
 *   'skyHaze' : pxlEnums.SKY_HAZE.OFF,
 *   'postProcessPasses' : { // Enabling these use assets from ` pxlAssetRoot : './pxlAssets' `
 *      'roomGlowPass' : false,
 *      'mapComposerWarpPass' : false,
 *      'chromaticAberrationPass' : false,
 *      'lizardKingPass' : false,
 *      'starFieldPass' :  false,
 *      'crystallinePass' : false
 *    }
 * }
 */
export const pxlOptions = {
    'verbose' : pxlEnums.VERBOSE_LEVEL.NONE,
    'fps' : {
        'pc' : 60,
        'Mobile' : 30
      },
    'renderScale' : {
        'pc' : 1.0,
        'mobile' : 1.0
      },
    'staticCamera' : false,
    'autoCamera' : false,
    'allowStaticRotation' : false,
    'userSettings' : Object.assign({}, pxlUserSettings),
    'subTickCalculations' : false,
    'pxlRoomRoot' : "./pxlRooms",
    'pxlAssetRoot' : "./pxlAssets",
    'showOnboarding' : true,
    'onboarding' : {
        'pc' : {
            'message' : "Welcome to<br>%projectTitle%",
            'messageStyle' : ['pxlGui-welcome-message'],
            'buttonText' : "close",
            'buttonStyle' : ['guiButton']
          },
        'mobile' : {
            'message' : "Welcome to<br>%projectTitle%",
            'messageStyle' : ['pxlGui-mobile-body'],
            'buttonText' : "start",
            'buttonStyle' : ['guiButton', 'pxlGui-mobile-welcomeButton']
          }
      },
    'loaderPhrases' : ['...loading the pixels...'],
    'antiAliasing' : pxlEnums.ANTI_ALIASING.LOW,
    'collisionScale' : {
        'gridSize' : 50,
        'gridReference' : 1000
      },
    'shadowMapBiasing' : pxlEnums.SHADOW_MAP.BASIC,
    'loadEnvAssetFile' : false,
    'skyHaze' : pxlEnums.SKY_HAZE.OFF,
    'postProcessPasses' : { // Enabling these use assets from ` pxlAssetRoot : './pxlAssets' `
        'roomGlowPass' : false,
        'mapComposerWarpPass' : false,
        'chromaticAberrationPass' : false,
        'lizardKingPass' : false,
        'starFieldPass' :  false,
        'crystallinePass' : false
      }
  };