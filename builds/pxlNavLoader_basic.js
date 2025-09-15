// pxlNav v0.0.28 -  Javascript Launcher
//  Written by Kevin Edzenga; 2024,2025
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
// This is an example simple implementation of `pxlNav` in a project;
//

import { pxlNav, pxlEnums, pxlOptions } from './pxlNav.module.js';

import { OutletEnvironment } from './pxlRooms/OutletEnvironment/OutletEnvironment.js';

// Console logging level
//   Options are - NONE, ERROR, WARN, INFO
const verbose = pxlEnums.VERBOSE_LEVEL.INFO;

// The Title of your Project
//   This will be displayed on the load bar
const projectTitle = "pxlNav :: The Outlet";

// pxlRoom folder path, available to change folder names or locations if desired
const pxlRoomRootPath = "./pxlRooms";

// Asset root path
const pxlAssetRoot = "./pxlAssets";

// Show the onboarding screen after the loading bar completes
const showOnboarding = true;

// Create your pxlRoom list
//   This is where you create your pxlRoom file and pass it to `pxlNav`
const OutletRoom = new OutletEnvironment( "OutletEnvironment", "./js/pxlRooms/OutletEnvironment" );
const bootRoomList = [ OutletRoom ];
const startingRoom = bootRoomList[0];

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

// -- Prepare pxlNav options --

let pxlNavOptions = Object.assign({},pxlOptions);
pxlNavOptions.verbose = verbose;
pxlNavOptions.pxlRoomRoot = pxlRoomRootPath;
pxlNavOptions.pxlAssetRoot = pxlAssetRoot;
pxlNavOptions.showOnboarding = showOnboarding;

// Create the pxlNav environment manager
const pxlNavEnv = new pxlNav( pxlNavOptions, projectTitle, startingRoom, bootRoomList );

// -- -- --

window.addEventListener('load', function() {
  // Start pxlNav
  pxlNavEnv.init();
});