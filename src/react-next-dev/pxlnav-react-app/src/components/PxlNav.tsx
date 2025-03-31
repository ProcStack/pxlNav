import React, { useEffect, useRef } from 'react';
import * as PXLNAV from 'pxlnav';
console.log( PXLNAV );
import { pxlNav, pxlEnums, pxlOptions, pxlUserSettings } from 'pxlnav';

interface pxlNavProps {
  projectTitle: string;
  startingRoom: string;
  roomBootList: string[];
  pxlRoomRootPath?: string;
  pxlAssetRootPath?: string;
  showOnboarding?: boolean;
  enableStaticCamera?: boolean;
}

const PxlNavComponent: React.FC<pxlNavProps> = ({ 
      projectTitle = "pxlNav Environment", 
      startingRoom = "Default", 
      roomBootList = ["Default"],
      pxlRoomRootPath = process.env.PUBLIC_URL + "/assets/pxlRooms", 
      pxlAssetRootPath = process.env.PUBLIC_URL + "/assets/pxlAssets",
      showOnboarding = true,
      enableStaticCamera = false,
    }) => {

  const containerRef = useRef<HTMLDivElement>(null);


  // Console logging level
  //   Options are - NONE, ERROR, WARN, INFO
  const verbose = pxlEnums.VERBOSE_LEVEL.INFO;


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
  userSettings['height']['standing'] = 22.5; // Standing height in units; any camera in your room's FBX will override this height once loaded
  userSettings['height']['stepSize'] = 5; // Max step height in units
  userSettings['movement']['scalar'] = 1.0; // Overall movement rate scalar
  userSettings['movement']['max'] = 10.0; // Max movement speed
  userSettings['movement']['easing'] = 0.55; // Easing rate between Step() calls
  userSettings['look']['mobile']['invert'] = true; // Invert the look controls on mobile devices
  userSettings['headBounce']['height'] = 0.3; // Bounce magnitude in units
  userSettings['headBounce']['rate'] = 0.025; // Bounce rate per Step()
  userSettings['headBounce']['easeIn'] = 0.03; // When move key is pressed, the ease into bounce; `bounce * ( boundInf + easeIn )`
  userSettings['headBounce']['easeOut'] = 0.95; // When move key is let go, the ease back to no bounce; `bounce * easeOut`
  userSettings['jump']['impulse'] = 0.60; // Jump impulse force applied to the player while holding the jump button
  userSettings['jump']['holdMax'] = 2.85; // Max influence of holding the jump button on current jump; in seconds
  userSettings['jump']['repeatDelay'] = 0.085; // Delay between jumps when holding the jump button
  userSettings['gravity']['ups'] = 0.28; // Units per Step() per Step()
  userSettings['gravity']['max'] = 15.5; // Max gravity rate

  // -- -- --

  // Target FPS (Frames Per Second)
  //   Default is - PC = 30  -&-  Movile = 30
  const targetFPS = {
    'pc' : 60,
    'mobile' : 30
  };

  // Render Resolution Scale
  //   Since mobile devices have a lower resolution, up scaling may help
  // Default is - PC = 1.0  -&-  Mobile = 1.0
  const renderScale = {
    'pc' : 1.0,
    'mobile' : 1.3
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
  //const enableStaticCamera = false;

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
    'gridSize' : 150,
    'gridReference' : 1000
  };


  const options = Object.assign( {}, pxlOptions );
  options.userSettings = userSettings;
  options.verbose = verbose;
  options.fps = targetFPS;
  options.renderScale = renderScale;
  options.userSettings = userSettings;
  options.antiAliasing = antiAliasing;
  options.collisionScale = collisionScale;
  options.pxlRoomRoot = pxlRoomRootPath;
  options.pxlAssetRoot = pxlAssetRootPath;
  options.showOnboarding = showOnboarding;
  options.staticCamera = enableStaticCamera;
  options.allowStaticRotation = allowStaticRotation;
  options.skyHaze = skyHaze;
  options.shadowMapBiasing = shadowMapBiasing;
  options.loaderPhrases = loaderPhrases;

  // Example: Set user settings


  useEffect(() => {
    if (containerRef.current) {
      const pxlNavManager = new pxlNav(
        options,
        projectTitle,
        startingRoom,
        roomBootList
      );

      // Initialize your PxlNav instance
      pxlNavManager.init(); 

      // Cleanup on unmount
      //  TODO : Add `.destroy()` method to pxlNav
      return () => {
        pxlNavManager.stop();
      };
    }
  }, [ projectTitle,startingRoom, roomBootList ]);

  return <div 
  id="pxlNav-coreCanvas"
  ref={containerRef}
  style={{
    width: '100%',
    height: '100%',
    position: 'absolute'
  }} />;
};

export default PxlNavComponent;