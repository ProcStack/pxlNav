'use client';

// Clean pxlNav App - Next.js Route
// Based on App_Clean.tsx from the React example

import React, { useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use browser APIs
const PxlNavComponent = dynamic(
  () => import('../../components/PxlNavComponent'),
  { 
    ssr: false,
    loading: () => <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1a1a1a',
      color: 'white',
      fontFamily: 'monospace'
    }}>Loading pxlNav...</div>
  }
);

export default function CleanPage() {
  const [isClient, setIsClient] = useState(false);
  const [pxlConstants, setPxlConstants] = useState<any>(null);
  const [OutletEnv, setOutletEnv] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load pxlNav modules only on client side
  useEffect(() => {
    if (!isClient) return;

    const loadPxlNav = async () => {
      try {
        const pxlNavModule = await import('pxlnav');
        setPxlConstants({ 
          pxlEnums: pxlNavModule.pxlEnums, 
          pxlOptions: pxlNavModule.pxlOptions 
        });

        // Initialize room environment
        const { OutletEnvironment } = await import('../../pxlRooms/OutletEnvironment/OutletEnvironment');
        const env = new OutletEnvironment("OutletEnvironment", "pxlRooms/OutletEnvironment/");
        setOutletEnv(env);
      } catch (error) {
        console.error('Failed to load pxlNav:', error);
      }
    };

    loadPxlNav();
  }, [isClient]);

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
    options.verbose = pxlEnums.VERBOSE_LEVEL.NONE; // Verbose Options are - NONE, ERROR, WARN, INFO
    options.fps = defaultTargetFPS;
    options.renderScale = defaultRenderScale;
    options.antiAliasing = pxlEnums.ANTI_ALIASING.HIGH;
    options.collisionScale = defaultCollisionScale;
    options.allowStaticRotation = false;
    options.skyHaze = pxlEnums.SKY_HAZE.VAPOR;
    options.shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;
    options.loaderPhrases = defaultLoaderPhrases;

    // Project settings
    options.pxlRoomRoot = "./pxlRooms";
    options.pxlAssetRoot = "./pxlAssets";
    options.showOnboarding = true;
    options.staticCamera = false;

    // Apply custom options last
    if (customOptions) Object.assign(options, customOptions);

    return options;
  };

  // Configure pxlNav options
  const customOptions = useMemo(() => ({}), []);
  const configuredOptions = useMemo(() => buildPxlNavOptions({
    pxlEnums: pxlConstants?.pxlEnums,
    pxlOptions: pxlConstants?.pxlOptions,
    customOptions
  }), [pxlConstants, customOptions]);


  // Show loading state
  if (!isClient || !pxlConstants || !OutletEnv) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1a1a1a',
        color: 'white',
        fontFamily: 'monospace'
      }}>
        ...Loading pxlNav Environment...
      </div>
    );
  }
  
  
  return (
    <div className="App_Clean pxlNav-app" style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <div
        ref={containerRef}
        id="pxlnav-react-container"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, background: '#111' }}
      />

      {configuredOptions && (
        <PxlNavComponent
          projectTitle="pxlNav React Test"
          startingRoom={OutletEnv}
          roomBootList={[OutletEnv]}
          pxlNavOptions={configuredOptions}
        />
      )}
    </div>
  );
}
