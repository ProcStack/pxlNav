# pxlNav Docs - pxlOptions
### Options & User Settings objects
This is the rundown of the default options object you pass to the `pxlNav` constructor

### `pxlUserSettings` object -
```
import { pxlNav, pxlUserSettings, pxlOptions } from './pxlNav.###.js';

// -- -- --

// To be safe, clone the imported `pxlUserSettings` object
const userSettings = Object.assign({}, pxlUserSettings);

// Standing height in units; any camera in your room's FBX will override this height once loaded
userSettings['height']['standing'] = 1.75; 

// Max step height in units
userSettings['height']['stepSize'] = 5; 

// Overall movement rate scalar
userSettings['movement']['scalar'] = 1.0; 

// Max movement speed
userSettings['movement']['max'] = 10.0; 

// Easing rate between Step() calls
userSettings['movement']['easing'] = 0.55; 

// Bounce magnitude in units
userSettings['headBounce']['height'] = 0.3; 

// Bounce rate per Step()
userSettings['headBounce']['rate'] = 0.025; 

// When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
userSettings['headBounce']['easeIn'] = 0.03; 

// When move key is let go, the ease back to no bounce; `bounce * easeOut`
userSettings['headBounce']['easeOut'] = 0.95; 

// Jump impulse force applied to the player while holding the jump button
userSettings['jump']['impulse'] = 0.75; 

// Max influence of holding the jump button on current jump; in seconds
userSettings['jump']['holdMax'] = 2.85; 

// Delay between jumps when holding the jump button
userSettings['jump']['repeatDelay'] = 0.08;

// Units per Step() per Step()
userSettings['gravity']['UPS'] = 0.3; 

// Max gravity rate
userSettings['gravity']['Max'] = 15.5;

// - - -

// To be safe, clone the imported `pxlOptions` object
let pxlNavOptions = Object.assign( {}, pxlOptions );
pxlNavOptions.userSettings = userSettings;

const pxlNavEnv = new pxlNav( pxlNavOptions, "Your Project Title", "StartingRoomName", ["StartingRoomName","AnotherRoomName"] );

```



### Defaults -

```
export const pxlUserSettings = {
  'height' : {
      'standing' : 1.75,
      'stepSize' : 5
    },
  'movement' : {
      'scalar' : 1.0,
      'max' : 10.0,
      'easing' : 0.55
    },
  'headBounce' : {
      'height' : 0.3,
      'rate' : 0.025,
      'easeIn' : 0.03,
      'easeOut' : 0.95
    },
  'jump' : {
      'impulse' : 0.75,
      'holdMax' : 2.85,
      'repeatDelay' : 0.08
    },
  'gravity' : {
      'UPS' : 0.3, // Units per Step()
      'Max' : 15.5
    },
  };
```


```
export const pxlOptions = {
  'verbose' : pxlEnums.VERBOSE_LEVEL.NONE,
  'fps' : {
    'PC' : 60,
    'Mobile' : 30
  },
  'subTickCalculations' : false,
  'pxlRoomRoot' : "./pxlRooms",
  'pxlAssetRoot' : "./pxlAssets",
  'showOnboarding' : true,
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
```