// pxlNav v0.0.18 -  Javascript Launcher
//  Written by Kevin Edzenga; 2024,2025
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//   This is an example implementation of `pxlNav` in a project;
//     Tieing in `ProcPages` to manage the pages of the site,
//       Listening to / triggering events on `pxlNav`
//   For `pxlNav` scripting, the entry-point is `./Source/js/pxlNavCore.js`
//

import { pxlNav, pxlNavVersion, pxlEnums, pxlUserSettings, pxlOptions } from './pxlNavs.js';


// Console logging level
//   Options are - NONE, ERROR, WARN, INFO
const verbose = pxlEnums.VERBOSE_LEVEL.INFO;

// The Title of your Project
//   This will be displayed on the load bar
const projectTitle = "pxlNav : The Outlet";

// pxlRoom folder path, available to change folder names or locations if desired
const pxlRoomRootPath = "../pxlRooms";

// Asset root path
const pxlAssetRoot = "../../dist/pxlAssets";

// Show the onboarding screen after the loading bar completes
const showOnboarding = false;

// Current possible rooms - "OutletEnvironment", "VoidEnvironment"
const bootRoomList = ["CampfireEnvironment","VoidEnvironment"];
const startingRoom = bootRoomList[0];

// -- -- --

// Set a list of phrases to display during the loading process
//   The loader with randomly pick a phrase from the list
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

// -- -- --

// User settings for the default/initial pxlNav environment
//   These can be adjusted from your `pxlRoom` but easily set defaults here
const userSettings = Object.assign({}, pxlUserSettings);
userSettings['height']['standing'] = 1.75; // Standing height in units; any camera in your room's FBX will override this height once loaded
userSettings['height']['stepSize'] = 5; // Max step height in units
userSettings['movement']['scalar'] = 1.0; // Overall movement rate scalar
userSettings['movement']['max'] = 10.0; // Max movement speed
userSettings['movement']['easing'] = 0.55; // Easing rate between Step() calls
userSettings['headBounce']['height'] = 0.3; // Bounce magnitude in units
userSettings['headBounce']['rate'] = 0.025; // Bounce rate per Step()
userSettings['headBounce']['easeIn'] = 0.03; // When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
userSettings['headBounce']['easeOut'] = 0.95; // When move key is let go, the ease back to no bounce; `bounce * easeOut`
userSettings['jump']['impulse'] = 0.75; // Jump impulse force applied to the player while holding the jump button
userSettings['jump']['holdMax'] = 2.85; // Max influence of holding the jump button on current jump; in seconds
userSettings['jump']['repeatDelay'] = 0.08; // Delay between jumps when holding the jump button
userSettings['gravity']['UPS'] = 0.3; // Units per Step() per Step()
userSettings['gravity']['Max'] = 15.5; // Max gravity rate

// -- -- --

// Target FPS (Frames Per Second)
//   Default is - PC = 60  -&-  Mobile = 30
const targetFPS = {
  'pc' : 60,
  'mobile' : 30
};

// Render Resolution Scale
//   Since mobile devices have a lower resolution, up scaling may help
// Default is - PC = 1.0  -&-  Mobile = 1.0
pxlNavOptions.renderScale = renderScale;
  'pc' : 1.0,
  'mobile' : 1.5
}

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

// If using static cameras, allow the user to rotate the camera
//  Default is `false`
const allowStaticRotation = false;

// Visual effect for the sky
// Default is `OFF`
//  Options are - OFF, VAPOR
const skyHaze = pxlEnums.SKY_HAZE.VAPOR;

// Collision Detection Grid
//   Collision objects are split into a grid for faster collision detection
//   gridSize - The size of the grid
//   gridReference - Grid scene reference threshold to scale `gridSize`
const collisionScale = {
  'gridSize' : 100,
  'gridReference' : 1000
};


// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //



// -- Below are the initialization and event handling for pxlNav
// --   No need to edit the below code unless you're adding custom event handling

// -- Prepare pxlNav options --

let pxlNavOptions = Object.assign({},pxlOptions);
pxlNavOptions.verbose = verbose;
pxlNavOptions.fps = targetFPS;
pxlNavOptions.renderScale = renderScale;
pxlNavOptions.userSettings = userSettings;
pxlNavOptions.antiAliasing = antiAliasing;
pxlNavOptions.collisionScale = collisionScale;
pxlNavOptions.pxlRoomRoot = pxlRoomRootPath;
pxlNavOptions.pxlAssetRoot = pxlAssetRoot;
pxlNavOptions.showOnboarding = showOnboarding;
pxlNavOptions.staticCamera = enableStaticCamera;
pxlNavOptions.allowStaticRotation = allowStaticRotation;
pxlNavOptions.skyHaze = skyHaze;
pxlNavOptions.shadowMapBiasing = shadowMapBiasing;
pxlNavOptions.loaderPhrases = loaderPhrases;



// Create the pxlNav environment manager
const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );


// -- -- --

// <div id="roomToggle" roomToggles="VoidEnvironment:Void Space;OutletEnvironment:Field">Void Space</div>

let switchButton = document.getElementById("roomToggle");
if( switchButton && switchButton.hasAttribute("roomToggles") ){
  let roomValues = switchButton.getAttribute("roomToggles").split(";");
  let roomLabelDict = {};
  roomValues.forEach(curVal => {
    let curPair = curVal.split(":");
    roomLabelDict[curPair[0]] = curPair[1];
  });
  
  switchButton.addEventListener("click", function(){
    let switchButtonObj = document.getElementById("roomToggle");
    if( switchButtonObj && switchButtonObj.hasAttribute("curRoom") ){ 
      let curVal = switchButtonObj.getAttribute("curRoom");
      let nextVal = "";
      let labelKeys = Object.keys(roomLabelDict);
      let curIndex = labelKeys.indexOf(curVal);
      curIndex = (curIndex + 1) % labelKeys.length;
      nextVal = labelKeys[curIndex];
      switchButtonObj.innerText = roomLabelDict[nextVal];
      switchButtonObj.setAttribute("curRoom", nextVal);
      //console.log( "Switching to room: ", nextVal );  
      pxlNavEnv.trigger( 'warptoroom', nextVal );
    }
  });
}


// -- -- --


function pxlNav_init(){
  // Start pxlNav
  pxlNavEnv.init();

  // -- -- --

  // -- Add pxlNav versioning to the page --
  // Set the version number
  //   Remove this section if you are using this file as a template
  let version = pxlNavVersion;
  if( version[0] != "v" ){
    version = "v" + version;
  }
  let pnv = [...document.getElementsByClassName("pxlNavVersion")];
  pnv.forEach(curPNV => {
    curPNV.innerText = version;
  });
  // -- End of versioning --

}

window.addEventListener('load', function() {
  pxlNav_init();
});