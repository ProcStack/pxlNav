// Test Example React App using pxlNav
//   Created by Kevin Edzenga; 2045
//
// This React App is an example of loading the OutletEnvironment room through `pxlNav`
// 
// This is the settings and launching point for the example app.
//   Look for `options` below to see how to configure `pxlNav` for your project.
// Since this file is the "display" page,
//   You can find `App_Clean.tsx` for a minimal example without the status header and other UI elements.
//
// You can use this file to launch `pxlNav`
//   While you edit the `pxlRoom` javascript itself and leave the component alone,


import React, { useRef, useState, useEffect, useMemo } from 'react';
import PxlNavComponent from './components/PxlNavComponent';

import pxlNav, { pxlEnums, pxlOptions, pxlNavVersion } from 'pxlnav';

// pxlRoom imports
import { OutletEnvironment } from './pxlRooms/OutletEnvironment/OutletEnvironment';

// Centralized pxlNav options builder
const buildPxlNavOptions = ({ pxlEnums, pxlOptions, customOptions }: any) => {
  if (!pxlEnums || !pxlOptions) return null;

  // Default user settings
  const defaultUserSettings = Object.assign({}, pxlOptions.userSettings || {});
  defaultUserSettings['height'] = defaultUserSettings['height'] || {};
  defaultUserSettings['height']['standing'] = 1.75;
  defaultUserSettings['height']['stepSize'] = 5;

  const defaultTargetFPS = { pc: 45, mobile: 30 };
  const defaultRenderScale = { pc: 1.0, mobile: 1.3 };
  const defaultCollisionScale = { gridSize: 150, gridReference: 1000 };

  const defaultLoaderPhrases = [
    "...chasing the bats from the belfry...",
    "...shuffling the deck...",
    "...checking the air pressure...",
    "...winding the clock...",
    "...tuning the strings...",
    "...ringing the quartz...",
    "...crashing the glasses...",
    "...sharpening the pencils...",
  ];

  const options = Object.assign({}, pxlOptions);
  options.userSettings = Object.assign({}, defaultUserSettings);
  options.verbose = pxlEnums.VERBOSE_LEVEL.NONE;
  options.fps = defaultTargetFPS;
  options.renderScale = defaultRenderScale;
  options.antiAliasing = pxlEnums.ANTI_ALIASING.HIGH;
  options.collisionScale = defaultCollisionScale;
  options.allowStaticRotation = false;
  options.skyHaze = pxlEnums.SKY_HAZE.VAPOR;
  options.shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;
  options.loaderPhrases = defaultLoaderPhrases;

  // Project settings
  options.pxlRoomRoot = "../pxlRooms";
  options.pxlAssetRoot = "./pxlAssets";
  options.showOnboarding = true;
  options.staticCamera = false;

  // Apply custom options last
  if (customOptions) Object.assign(options, customOptions);

  return options;
};

function App_Clean() {
  const [pxlConstants, setPxlConstants] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize room environment
  const OutletEnv = new OutletEnvironment("OutletEnvironment", "pxlRooms/OutletEnvironment/");
  const roomList = [OutletEnv];

  // Load pxlNav constants
  useEffect(() => {
    setPxlConstants({ pxlEnums, pxlOptions });
  }, []);

  // Configure pxlNav options
  const customOptions = useMemo(() => ({}), []);
  const configuredOptions = useMemo(() => buildPxlNavOptions({
    pxlEnums: pxlConstants?.pxlEnums,
    pxlOptions: pxlConstants?.pxlOptions,
    customOptions
  }), [pxlConstants, customOptions]);

  const handlePxlNavBooted = () => {
    console.log('pxlNav has booted successfully!');
  };

  const handlePxlNavError = (err: Error) => {
    console.error('pxlNav failed to initialize:', err);
  };
  
  return (
    <div className="App_Clean pxlNav-app">

      <div
        ref={containerRef}
        id="pxlnav-react-container"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {configuredOptions && containerRef.current && (
        <PxlNavComponent
          projectTitle={"pxlNav React Test"}
          startingRoom={roomList[0]}
          roomBootList={roomList}
          // merge the DOM node into the options object:
          pxlNavOptions={configuredOptions}
          onBooted={handlePxlNavBooted}
          onError={handlePxlNavError}
        />
      )}
    </div>
  );
}

export default App_Clean;