# pxlNav Docs - Launcher Options
### Available Options / Settings for `pxlNav`;
This is the rundown of how to interact with `pxlNav` and your `pxlRoom`'s custom javascript.
<br/>&nbsp;&nbsp; Import, make a pxlNav object, and launch!

<br/>For pxlNav room information
<br/>&nbsp;&nbsp; See [pxlRoom's Documentation](pxlRooms.md)

<br/>For core `pxlNav` source
<br/>&nbsp;&nbsp; Entry-point is `./src/js/pxlNavCore.js`

## <br/>**Index**
* [Available Imports](#available-imports)
* [pxlNav Object](#pxlnav-object)
* [Enums & Options](#enums--options)
* [Events for Callback Subscriptions](#events-for-callback-subscriptions)
* [Triggerable Events](#triggerable-events)
* [pxlBase Object](#pxlbase-object)
* [Full Launcher Example](#launcher-example)
<br/>

## Available Imports

```
import { pxlNav, pxlNavVersion, pxlEnums, pxlOptions, RoomEnvironment, pxlEffects, pxlShaders, pxlBase } from './pxlNav.###.js';
```

List of exports from `pxlNav` -
<br/> _`pxlNav` - Main pxlNav object to manage your environments
<br/> _`pxlNavVersion` - The version number for pxlNav; `0.0.16`
<br/> _`pxlEnums` - Available enums in a single object
<br/> _`pxlOptions` - Options Objects with Default settings
<br/> _`pxlEffects` - Particle Systems you can add to your room
<br/> _`pxlShaders` - Shader Materials you can assign to objects in your scene
<br/> _`RoomEnvironment` - Options Objects with Default settings
<br/> _`pxlBase` - All available `pxlNav` sub-classes


 * *Note* : No need to import three.js for this version of pxlNav.
<br/>&nbsp;&nbsp; The `./js/libs/three` folder holds the needed files for Three.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; Due to needed changes to the `FBXLoader`, the files have been localized.
<br/>&nbsp;&nbsp; Change the files to change your version of Three,
<br/>&nbsp;&nbsp;&nbsp;&nbsp; However changes to the `FBXLoader` would need to be made if replaced.


##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## pxlNav Object

**Import and Start pxlNav -**
```
import { pxlEnums, pxlOptions, pxlNav } from './pxlNav.js';

const projectTitle = "Your Project Name";
const bootRoomList = ["YourRoomA", "YourRoomB"];
const startingRoom = bootRoomList[0];

const pxlNavEnv = new pxlNav( PXLNAV_OPTIONS, projectTitle, startingRoom, bootRoomList );
pxlNavEnv.init();
```

**The Title of your Project**
<br/>&nbsp;&nbsp; This will be displayed over-top the load bar
<br/>```const projectTitle = "Your Project Name";```

**`pxlRoomRootPath` - Your `pxlRoom` folder path**
<br/>&nbsp;&nbsp; by default is the same folder as `pxlNav.esm.js`**
<br/>&nbsp;&nbsp; Available to change relative to the location of your `pxlNav.###.js`
<br/>```const pxlRoomRootPath = "../pxlRooms";```

**`bootRoomList` - Your Room folder name + main javascript file names**
<br/>&nbsp;&nbsp; This must be a list object; [,]
<br/>```const bootRoomList = ["YourRoomA", "YourRoomB"];```
<br/>Loading the js file from- `./pxlRooms/YourRoomA/YourRoomA.js`

**`startingRoom` - Set which of your rooms will load the user into.**
<br/>&nbsp;&nbsp; The `startingRoom` must be in your `bootRoomList`
<br/>```const startingRoom = bootRoomList[0];```

**`pxlNavEnv` - Create your `pxlNav` object-**
<br/>```const pxlNavEnv = new pxlNav( PXLNAV_OPTIONS, projectTitle, startingRoom, bootRoomList );```

**`pxlNavEnv.init()` - Initialize & Start Running the `pxlNav` runtime;**
<br/>&nbsp;&nbsp; Puts up the load screen with your title and any loader phrases
<br/>&nbsp;&nbsp; Load your pxlRooms from `bootRoomList`
<br/>&nbsp;&nbsp; And let the system run!
<br/>```pxlNavEnv.init();```

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## Enums & Options

```
import { pxlEnums, pxlOptions } from './pxlNav.js;

let yourOptions = Object.assign({},pxlOptions);

// -- Default Values --
yourOptions.verbose = pxlEnums.VERBOSE_LEVEL.NONE;
yourOptions.pxlRoomRoot = "./pxlRooms";
yourOptions.staticCamera = false;
yourOptions.autoCamera = false;
yourOptions.antiAliasing = pxlEnums.ANTI_ALIASING.LOW;
yourOptions.shadowMapBiasing = pxlEnums.SHADOW_MAP.BASIC;
yourOptions.LoadEnvAssetFile = false;
yourOptions.skyHaze = pxlEnums.SKY_HAZE.OFF;
yourOptions.loaderPhrases = ['...loading the pixels...'];

const pxlNavEnv = new pxlNav( yourOptions, *projectTitle*, *startingRoom*, *bootRoomList* );
```

<br/>Assign a new object with `pxlOptions` to isolate out a copy of the Default settings-
<br/>```let yourOptions = Object.assign({},pxlOptions);```

<br/>**Console logging level**
<br/>&nbsp;&nbsp; Options are - `NONE`, `ERROR`, `WARN`, `INFO`
<br/>```yourOptions.verbose = pxlEnums.VERBOSE_LEVEL.INFO;```

<br/>**If you'd like to move your `pxlRooms` folder**
<br/>&nbsp;&nbsp; Update with your Relative path
<br/>```yourOptions.pxlRoomRoot = './pxlRooms';```
   
<br/>**Set a list of phrases to display during the loading process**
<br/>&nbsp;&nbsp; The loader with randomly pick a phrase from the list
```
const loaderPhrases = [
  "...chasing the bats from the belfry...",
  "...shuffling the deck...",
  "...checking the air pressure...",
  "...winding the clock...",
  "...tuning the strings...",
  "...ringing the quartz...",
  "...crashing the glasses...",
  "...sharpening the pencils...",
];
yourOptions.loaderPhrases = loaderPhrases;
```

<br/>**Anti-aliasing level**
<br/>&nbsp;&nbsp; Options are - `NONE`, `LOW`, `MEDIUM`, `HIGH`
```yourOptions.antiAliasing = pxlEnums.ANTI_ALIASING.LOW;```

**Shadow + Edge softness**
<br/>&nbsp;&nbsp; Default is `BASIC` - a simple shadow edge
<br/>&nbsp;&nbsp; Options are - `OFF`, `BASIC`, `SOFT`
<br/>&nbsp;&nbsp;&nbsp;&nbsp; *Mobile devices are limited to `OFF` or `BASIC` automatically
<br/>```yourOptions.shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;```

**Set camera to static Camera Positions**
<br/>&nbsp;&nbsp; Locations pulled from the 'Camera' group in the pxlRoom's FBX file
<br/>&nbsp;&nbsp; Default is `false`
<br/>```yourOptions.staticCamera = false;```

**Visual effect for the sky**
<br/>&nbsp;&nbsp; Default is `OFF`
<br/>&nbsp;&nbsp; Options are - `OFF`, `VAPOR`
<br/>```yourOptions.skyHaze = pxlEnums.SKY_HAZE.VAPOR;```

<br/>Then pass your options object when creating `pxlNav`
<br/>```const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );```


##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------


## Events for Callback Subscriptions

List of available events to subscribe to -

<br/> _`booted` - Emitted after the engine has fully booted and is ready to be addressed.
<br/> _`shaderEditorVis` - Returns a [bool]; Emitted when the shader editor is toggled on or off.
<br/> _`roomChange-Start` - Emitted when the room change transition begins.
<br/> _`roomChange-Middle` - Emitted when the room change process occurs mid transition.
<br/> _`roomChange-End` - Returns a [bool]; Emitted when the room change transition ends.
<br/> _`fromRoom` - Returns a custom object; Emitted from your Room code you choose to emit during run time.
<br/> _`device-keydown` - Returns an [int]; The just pressed key.
<br/> _`device-keyup` - Returns an [int]; The just released key.
<br/> _`device-resize` - Returns an [{height:#,width:#}]; Height Width object of the new window size.
<br/> _`pxlNavEventNameHere` - Never emitted; You did some copy'pasta.
<br/> _`help` - Hello! I'm here to help you!
<br/> _`pingPong` - Send 'ping', Get 'pong'! - pxlNav.trigger('ping');


The shape of the event object is -
<br/>```yourCallbackFn( event ) => event == { 'type' : *eventName*, 'value' : *data* }"```


Subscribe to events emitted from pxlNav for callback handling
<br/>```pxlNavObj.subscribe("pxlNavEventNameHere", (event)=>{ console.log(event); });```

Loop the events to make it easier to subscribe with an custom eventHandler
```
const pageListenEvents = [ "booted", "shaderEditorVis", "roomChange-End", "fromRoom" ];
pageListenEvents.forEach( (e)=>{
  pxlNavEnv.subscribe( e, yourObject.eventHandler.bind(yourObject) );
});
```

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------



## Triggerable Events

List of available Trigger Events-
<br/> _`warptoroom` - Change pxlRooms with a provided Camera Location name.
<br/> ```pxlNav.trigger( 'warptoroom', *pxlRoomName*, *cameraLocationName* );```
 
<br/> _`camera` - "Static" or "Roam" to toggle the camera from still cam to controlable
<br/> ```pxlNav.trigger( 'camera', 'Roam' );```

<br/> _`ping` - Trigger's the `PingPong` callback subscription event; with a value of 'pong'
<br/> ```pxlNav.trigger( 'ping' );```

<br/> _`roommessage` - Send data to your room's `onMessage( event )` function.
<br/>&nbsp;&nbsp; If there is no added `onMessage` function, the message contents will print to the console.
<br/> ```pxlNav.trigger( 'roommessage', 'yourCustomEventName', *eventData* );```

 
You can use `pxlNav.trigger()` directly or pass it to another object to handle trigger emits-
<br/>```yourObject.bindTriggerEmits( pxlNavEnv.trigger.bind(pxlNavEnv) );```



##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## pxlBase Object

This object will only really be used by individuals doing more web dev than needed to run `pxlNav` as intended.
<br/>&nbsp;&nbsp; These are the base classes that you can create your own object for your own purposes outside of the `pxlNav` framework.

All available `pxlNav` sub-classes
```
pxlBase = {
   Utils, FileIO, QualityController, CookieManager, Timer, User,
   Device, Animation, Environment, GUI, Camera, AutoCamera,
   Extensions, MusicUtils, Audio, Video
};
```
Only needed if you want to use the functionality outside of pxlNav's framework itself.
<br/>&nbsp;&nbsp; Like in a non-pxlRoom javascript file. 


##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------


## Launcher Example
```
// pxlNav Launcher
//   Help docs - https://github.com/ProcStack/pxlNav/tree/main/docs

import { pxlNav, pxlNavVersion, pxlEnums, PXLNAV_OPTIONS } from './pxlNav.js';

// Console logging level
//   Options are - NONE, ERROR, WARN, INFO
const verbose = pxlEnums.VERBOSE_LEVEL.INFO;

// The Title of your Project
//   This will be displayed on the load bar
const projectTitle = "pxlNav Booting...";

// Set a list of phrases to display during the loading process
//   The loader with randomly pick a phrase from the list
const loaderPhrases = [ "...loading the pixels..." ];

// pxlRoom folder path, available to change folder names or locations if desired
const pxlRoomRootPath = "./pxlRooms";

// pxlRoom listing -
const bootRoomList = ["FieldEnvironment"];
const startingRoom = bootRoomList[0];


// -- -- --


// Anti-aliasing level
//   Options are - NONE, LOW, MEDIUM, HIGH
const antiAliasing = pxlEnums.ANTI_ALIASING.LOW;

// Shadow + Edge softness
// Default is `BASIC` - a simple shadow edge
//   Options are - OFF, BASIC, SOFT
//     *Mobile devices are limited to `OFF` or `BASIC` automatically
const shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;

// Set camera to static Camera Positions
//   Locations pulled from the 'Camera' group in the pxlRoom's FBX file
// Default is `false`
const enableStaticCamera = false;

// Visual effect for the sky
// Default is `OFF`
//  Options are - OFF, VAPOR
const skyHaze = pxlEnums.SKY_HAZE.VAPOR;


// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //


// -- Prepare pxlNav options --

let pxlNavOptions = Object.assign({},PXLNAV_OPTIONS);
pxlNavOptions.verbose = verbose;
pxlNavOptions.antiAliasing = antiAliasing;
pxlNavOptions.pxlRoomRoot = pxlRoomRootPath;
pxlNavOptions.staticCamera = enableStaticCamera;
pxlNavOptions.skyHaze = skyHaze;
pxlNavOptions.shadowMapBiasing = shadowMapBiasing;
pxlNavOptions.loaderPhrases = loaderPhrases;


// Create the pxlNav environment manager
const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );


// -- -- --


function pxlNav_init(){
  // Start the timer and initilize pxlNav
  pxlNavEnv.init();
}

// Run init after the page fully loads
window.addEventListener('load', function() {
  pxlNav_init();
});

```

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------
