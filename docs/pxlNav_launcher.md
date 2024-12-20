# pxlNav Docs - Launcher Options
   Available Options / Settings for `pxlNav`;
   For core `pxlNav` scripting, the entry-point is `./src/js/pxlNavCore.js`

## <br/>**Index**
* [Imports](#imports)
* [pxlNav Object](#pxlnav-object)
* [Enums & Options](#enums--options)
* [Events for Callback Subscriptions](#events-for-callback-subscriptions)
* [Triggerable Events](#triggerable-events)
* [Launcher Example](#launcher-example)
<br/>

## Imports

List of exports from `pxlNav`
 _`pxlNav` - Main pxlNav object to manage your environments
 _`pxlEnums` - Available enums in a single object
 _`PXLNAV_OPTIONS` - Options Objects with Default settings
```
import { pxlNav, pxlNavVersion, pxlEnums, PXLNAV_OPTIONS } from './pxlNav.js';
```

 * Note : No need to import three.js for this version of pxlNav.  It will be decoupled from pxlNav's environment in an upcoming version.  Please bare with me while I open up pxlNav to more usability.

---

## pxlNav Object

The Title of your Project
<br/>&nbsp;&nbsp; This will be displayed on the load bar
```const projectTitle = "Your Project Name";```


Your Room folder name + main javascript file names
<br/>&nbsp;&nbsp; This must be a list object; [,]
```const bootRoomList = ["YourRoomA", "YourRoomB"];```
Loading the js file from- `./pxlRooms/YourRoomA/YourRoomA.js`

Set which of your rooms will load the user into.
<br/>&nbsp;&nbsp; The `startingRoom` must be in your `bootRoomList`
```const startingRoom = bootRoomList[0];```

Create your `pxlNav` object-
```const pxlNavEnv = new pxlNav( PXLNAV_OPTIONS, projectTitle, startingRoom, bootRoomList );```

Initialize the `pxlNav` runtime;
<br/>&nbsp;&nbsp; Puts up the load screen with your title and any loader phrases
<br/>&nbsp;&nbsp; Load your pxlRooms from `bootRoomList`
<br/>&nbsp;&nbsp; And let the system run!
```pxlNavEnv.init();```

---

## Enums & Options

Assign a new object with `PXLNAV_OPTIONS` to isolate out a copy of the Default settings-
```let pxlNavOptions = Object.assign({},PXLNAV_OPTIONS);```

Console logging level
<br/>&nbsp;&nbsp; Options are - NONE, ERROR, WARN, INFO
```pxlNavOptions.verbose = pxlEnums.VERBOSE_LEVEL.INFO;```

If you'd like to move your `pxlRooms` folder
<br/>&nbsp;&nbsp; Update with your Relative path
```pxlNavOptions.pxlRoomRoot = './pxlRooms';```

Set a list of phrases to display during the loading process
<br/>&nbsp;&nbsp; The loader with randomly pick a phrase from the list
```const loaderPhrases = [
  "...chasing the bats from the belfry...",
  "...shuffling the deck...",
  "...checking the air pressure...",
  "...winding the clock...",
  "...tuning the strings...",
  "...ringing the quartz...",
  "...crashing the glasses...",
  "...sharpening the pencils...",
];
pxlNavOptions.loaderPhrases = loaderPhrases;```


Anti-aliasing level
<br/>&nbsp;&nbsp; Options are - NONE, LOW, MEDIUM, HIGH
```pxlNavOptions.antiAliasing = pxlEnums.ANTI_ALIASING.LOW;```

Shadow + Edge softness
<br/>&nbsp;&nbsp; Default is `BASIC` - a simple shadow edge
<br/>&nbsp;&nbsp; Options are - OFF, BASIC, SOFT
<br/>&nbsp;&nbsp;&nbsp;&nbsp; *Mobile devices are limited to `OFF` or `BASIC` automatically
```const shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;```

Set camera to static Camera Positions
<br/>&nbsp;&nbsp; Locations pulled from the 'Camera' group in the pxlRoom's FBX file
<br/>&nbsp;&nbsp; Default is `false`
```pxlNavOptions.staticCamera = false;```

Visual effect for the sky
<br/>&nbsp;&nbsp; Default is `OFF`
<br/>&nbsp;&nbsp; Options are - OFF, VAPOR
const skyHaze = pxlEnums.SKY_HAZE.VAPOR;


Then pass your options object when creating `pxlNav`
```const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );```


---
---

## Events for Callback Subscriptions

List of available events to subscribe to -

 _`booted` - Emitted after the engine has fully booted and is ready to be addressed.
 _`shaderEditorVis` - Returns a [bool]; Emitted when the shader editor is toggled on or off.
 _`roomChange-Start` - Emitted when the room change transition begins.
 _`roomChange-Middle` - Emitted when the room change process occurs mid transition.
 _`roomChange-End` - Returns a [bool]; Emitted when the room change transition ends.
 _`fromRoom` - Returns a custom object; Emitted from your Room code you choose to emit during run time.
 _`device-keydown` - Returns an [int]; The just pressed key.
 _`device-keyup` - Returns an [int]; The just released key.
 _`device-resize` - Returns an [{height:#,width:#}]; Height Width object of the new window size.
 _`pxlNavEventNameHere` - Never emitted; You did some copy'pasta.
 _`help` - Hello! I'm here to help you!
 _`pingPong` - Send 'ping', Get 'pong'! - pxlNav.trigger('ping');


The shape of the event object is -
```yourCallbackFn( event ) => event == { 'type' : *eventName*, 'value' : *data* }"```


Subscribe to events emitted from pxlNav for callback handling
```pxlNavObj.subscribe("pxlNavEventNameHere", (event)=>{ console.log(event); });```

Loop the events to make it easier to subscribe with an custom eventHandler
```const pageListenEvents = [ "booted", "shaderEditorVis", "roomChange-End", "fromRoom" ];
pageListenEvents.forEach( (e)=>{
  pxlNavEnv.subscribe( e, yourObject.eventHandler.bind(yourObject) );
});```



---


## Triggerable Events

List of available Trigger Events-

 _`warptoroom` - Change pxlRooms with a provided Camera Location name.
 ```pxlNav.trigger( 'warptoroom', *pxlRoomName*, *cameraLocationName* );```
 
 _`camera` - "Static" or "Roam" to toggle the camera from still cam to controlable
 ```pxlNav.trigger( 'warptoroom', *camera*, 'Roam' );```

 _`ping` - Trigger's the `PingPong` callback subscription event; with a value of 'pong'
 ```pxlNav.trigger( 'ping' );```

 _`roommessage` - Send data to your room's `onMessage( event )` function.  If there is no added `onMessage` function, the message contents will print to the console.
 ```pxlNav.trigger( 'roommessage', 'yourCustomEventName', *eventData* );```

 
You can use `pxlNav.trigger()` directly or pass it to another object to handle trigger emits-
```yourObject.bindTriggerEmits( pxlNavEnv.trigger.bind(pxlNavEnv) );```



---


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