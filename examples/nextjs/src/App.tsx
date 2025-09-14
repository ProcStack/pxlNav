// Test Example NextJS App using pxlNav
//   Created by Kevin Edzenga; 2045
//
// This NextJS App is an example of loading the OutletEnvironment room through `pxlNav`
// 
// It's primarily expected that you edit the `pxlRoom` javascript itself and leave the component alone,
//   Aside from changing settings and adding new rooms to load.


import React, { useRef, useState, useEffect, useMemo } from 'react';
import PxlNavComponent from './components/PxlNavComponent';

import pxlNav, { pxlEnums, pxlOptions, pxlNavVersion } from 'pxlnav';

import { OutletEnvironment } from './pxlRooms/OutletEnvironment/OutletEnvironment';

// Centralized pxlNav options builder for React devs
// Keep all defaults and override logic here so developers know to look in App.tsx
const buildPxlNavOptions = ({
  pxlEnums,
  pxlOptions,
  customOptions,
  userSettings,
  projectSettings
}: any) => {
  if (!pxlEnums || !pxlOptions) return null;

  // Default user settings
  const defaultUserSettings = Object.assign({}, pxlOptions.userSettings || {});
  defaultUserSettings['height'] = defaultUserSettings['height'] || {};
  defaultUserSettings['height']['standing'] = userSettings?.standingHeight || 1.75;
  defaultUserSettings['height']['stepSize'] = userSettings?.stepSize || 5;

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
  options.userSettings = Object.assign({}, defaultUserSettings, userSettings);
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
  options.pxlRoomRoot = projectSettings?.pxlRoomRootPath || "../pxlRooms";
  options.pxlAssetRoot = projectSettings?.pxlAssetRootPath || "./pxlAssets";
  options.showOnboarding = projectSettings?.showOnboarding ?? true;
  options.staticCamera = projectSettings?.enableStaticCamera ?? false;

  // Apply custom options last
  if (customOptions) Object.assign(options, customOptions);

  return options;
};

function App() {
  const [pxlNavStatus, setPxlNavStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [localPxlEnums, setLocalPxlEnums] = useState<any>(null);
  const [localPxlOptions, setLocalPxlOptions] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const OutletEnv = new OutletEnvironment( "OutletEnvironment", "pxlRooms/OutletEnvironment/" )
  const roomList = [ OutletEnv ];

  const versionDisp = pxlNavVersion ? ` v${pxlNavVersion}` : "";

  // Load pxlEnums and pxlOptions at the top level
  useEffect(() => {
    const loadPxlPrep = async () => {
      try {
        setLocalPxlEnums(pxlEnums);
        setLocalPxlOptions(pxlOptions);
      } catch (error) {
        setError(error as Error);
        setPxlNavStatus('error');
      }
    };

    loadPxlPrep();
  }, []);

  // Memoize options objects to prevent recreation on every render
  // All pxlNav defaults and overrides live here in App.tsx
  const customOptions = useMemo(() => ({}), [localPxlEnums, localPxlOptions]);

  const projectSettings = useMemo(() => ({
  // Use root-relative paths so Next.js (which serves `public/` at `/`) finds assets the same as CRA
  pxlRoomRootPath: "/pxlRooms",
  pxlAssetRootPath: "/pxlAssets",
    showOnboarding: true,
    enableStaticCamera: false
  }), []);

  // Build configured options here so this file is the single source for pxlNav config
  const configuredOptions = useMemo(() => buildPxlNavOptions({
    pxlEnums: localPxlEnums,
    pxlOptions: localPxlOptions,
    customOptions,
    projectSettings
  }), [localPxlEnums, localPxlOptions, customOptions, projectSettings]);

  const handlePxlNavBooted = () => {
    console.log(' NextJS App : pxlNav has fully booted!');
    setPxlNavStatus('ready');
  };

  const handlePxlNavError = (err: Error) => {
    console.error(' NextJS App : pxlNav failed to initialize:', err);
    setError(err);
    setPxlNavStatus('error');
  };
  
  return (
    <div className="App pxlNav-app">
      {/* Status header */}
      <header style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ margin: '0 0 5px 0' }}>pxlNav{versionDisp} NextJS App</h3>
        <div>
          Status: {
            pxlNavStatus === 'loading' ? ' Loading...' :
            pxlNavStatus === 'ready' ? ' Ready' :
            ' Error'
          }
        </div>
        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px' }}>
            {error.message}
          </div>
        )}
      </header>

      <div
        ref={containerRef}
        id="pxlnav-react-container"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {configuredOptions && containerRef.current && (
        <PxlNavComponent
          projectTitle={"pxlNav NextJS Test"}
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

export default App;