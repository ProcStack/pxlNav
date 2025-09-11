// pxlNav v1.0.0 -  Javascript Launcher
//  Written by Kevin Edzenga; 2024,2025
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//   This is an example implementation of `pxlNav` in a project;
//     Tieing in `ProcPages` to manage the pages of the site,
//       Listening to / triggering events on `pxlNav`
//   For `pxlNav` scripting, the entry-point is `./src/js/pxlNav.js`
//

import { pxlNav, pxlNavVersion, pxlEnums, pxlUserSettings, pxlOptions } from './pxlNav.esm.js';


// Console logging level
//   Options are - NONE, ERROR, WARN, INFO
const verbose = pxlEnums.VERBOSE_LEVEL.NONE;

// The Title of your Project
//   This will be displayed on the load bar
const projectTitle = "pxlNav : The Outlet";

// pxlRoom folder path, available to change folder names or locations if desired
const pxlRoomRootPath = "../pxlRooms";

// Asset root path
const pxlAssetRoot = "../../builds/pxlAssets";

// Show the onboarding screen after the loading bar completes
const showOnboarding = false;

// Current possible rooms - "OutletEnvironment", "VoidEnvironment"
const bootRoomList = ["CampfireEnvironment","VoidEnvironment"];
const startingRoom = bootRoomList[0];

// -- -- --

// Optional : Display a Frame Rate (FPS) counter in a console
//              This is an example callback to show the FPS in a div
// You can also enable this with `?showfps=1` in the URL
//   If you leave the `uriSearch` code below vvv

// Name of the div to display verbose messages
//   This uses callback events from `pxlNav` to display messages
const verboseDivName = 'verbErrorConsole';

// Display FPS in the `verboseDivName` div
//   Useful for debugging and performance testing
const enableFPSDisplay = false;

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
userSettings['look']['mobile']['invert'] = true; // Invert the look controls on mobile; Default is `True`
userSettings['headBounce']['height'] = 0.3; // Bounce magnitude in units
userSettings['headBounce']['rate'] = 0.025; // Bounce rate per Step()
userSettings['headBounce']['easeIn'] = 0.03; // When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
userSettings['headBounce']['easeOut'] = 0.95; // When move key is let go, the ease back to no bounce; `bounce * easeOut`
userSettings['jump']['impulse'] = 0.75; // Jump impulse force applied to the player while holding the jump button
userSettings['jump']['holdMax'] = 2.85; // Max influence of holding the jump button on current jump; in seconds
userSettings['jump']['repeatDelay'] = 0.08; // Delay between jumps when holding the jump button
userSettings['gravity']['ups'] = 0.3; // Units per Step() per Step()
userSettings['gravity']['max'] = 15.5; // Max gravity rate

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
const renderScale = {
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
const enableStaticCamera = true;

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


// Add some search uri parameters to the page
//   These are used to set the target FPS and renderScale
// This is not needed for pxlNav, but is useful for testing
//
// Find search parameters in the URL for procstack.github.io
//   Not needed for pxlNav
// Note : procPages clears the search parameters on the page
//          So search is lost on page change,
//            Running before procPages.init() is needed
let uriSearch = window.location.search;

// Check hash for fps and renderScale
let searchParams = new URLSearchParams(uriSearch);
let showFPS = searchParams.has('showfps') ? !!parseInt(searchParams.get('showfps')) : false;
if( searchParams.has('fps') ){
  let fps = parseInt(searchParams.get('fps'));
  if( fps > 0 ){
    targetFPS.pc = fps;
    targetFPS.mobile = fps;
  }
}
if( searchParams.has('scale') ){
  let scale = parseFloat(searchParams.get('scale'));
  if( scale > 0 ){
    renderScale.pc = scale;
    renderScale.mobile = scale;
  }
}


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

// Subscribe to events emitted from pxlNav for callback handling
//   Non loop - pxlNavObj.subscribe("pxlNavEventNameHere", procPages.functionName.bind(procPages));

/* Uncomment to add custom event handling */
/*
const pageListenEvents = [ "booted", "shaderEditorVis", "roomChange-End", "fromRoom" ];
pageListenEvents.forEach( (e)=>{
  pxlNavEnv.subscribe( e, procPages.eventHandler.bind(procPages) );
});
*/

// -- -- --

// Display the frame rate (FPS) in the `verboseDivName` div
//   This is useful for debugging and performance testing
// Listen to the `render-prep` call, occuring before the render occurs per frame
//   Then have it update with a 4-frame average of the FPS
// Display the frame rate (FPS) in the `verboseDivName` div
function setupFPSDisplay( pxlNavEnv, verboseDivName, avgCount = 4 ){
  let verboseConsole = document.getElementById(verboseDivName);
  if( !verboseConsole ){
    if( verbose >= pxlEnums.VERBOSE_LEVEL.WARN ){
      console.warn("No verbose console found with id: " + verboseDivName);
    }
    return;
  }

  let skipRunner = 0;
  let avgFPS = 0;
  let prevTime = 0;

  pxlNavEnv.subscribe('render-prep', (e) => {
    skipRunner++;
    let delta = (1 / (e.value.time - prevTime));
    prevTime = e.value.time;
    avgFPS += delta;
    if (skipRunner >= avgCount) {
      avgFPS = (avgFPS / skipRunner).toFixed(2);
      verboseConsole.innerText = avgFPS;
      avgFPS = 0;
      skipRunner = 0;
    }
  });
}

// Then in the initialization code:
if( enableFPSDisplay || showFPS ){
  setupFPSDisplay(pxlNavEnv, verboseDivName);
}


// -- -- --

// Function to warp to the given camera location in the starting room
function switchToCameraLocation( cameraName ){
  pxlNavEnv.trigger( "warpToRoom", startingRoom, cameraName );
}

// Bind the `warpToRoom` event to the `pxlNav` object once it is fully loaded
//   Listen to the `booted` event to know when the `pxlNav` object is ready to set the camera location
pxlNavEnv.subscribe( "booted", ( e ) => {
  // Switch to the starting camera location
  switchToCameraLocation( "init" );
});



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