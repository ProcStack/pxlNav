

import { pxlEnums } from './Enums.js';

export const pxlUserSettings = {
  'height' : {
      'standing' : 1.75, // Standing height in units; any camera in your room's FBX will override this height once loaded
      'stepSize' : 5 // Max step height in units
    },
  'movement' : {
      'scalar' : 1.0, // Overall movement rate scalar
      'max' : 10.0, // Max movement speed
      'easing' : 0.55 // Easing rate between Step() calls
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
      'UPS' : 0.3, // Units per Step() per Step()
      'Max' : 15.5 // Max gravity rate
    },
  };


export const pxlOptions = {
  'verbose' : pxlEnums.VERBOSE_LEVEL.NONE,
  'fps' : {
    'PC' : 60,
    'Mobile' : 30
  },
  'subTickCalculations' : false,
  'pxlRoomRoot' : "./pxlRooms",
  'staticCamera' : false,
  'autoCamera' : false,
  'userSettings' : Object.assign({}, pxlUserSettings),
  'antiAliasing' : pxlEnums.ANTI_ALIASING.LOW,
  'collisionScale' : {
    'gridSize' : 50,
    'gridReference' : 1000
  },
  'shadowMapBiasing' : pxlEnums.SHADOW_MAP.BASIC,
  'LoadEnvAssetFile' : false,
  'skyHaze' : pxlEnums.SKY_HAZE.OFF,
  'loaderPhrases' : ['...loading the pixels...']
}