import React, { useState, useEffect, useMemo } from 'react';
import PxlNavComponentClean from './components/PxlNavComponentClean';
import { getPxlPrep } from './components/pxlNavLoader.js';
import { usePxlNavConfig } from './hooks/usePxlNavConfig';

function App() {
  const [pxlNavStatus, setPxlNavStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [pxlConstants, setPxlConstants] = useState<any>(null);

  // Load pxlEnums and pxlOptions at the top level
  useEffect(() => {
    const loadPxlPrep = async () => {
      try {
        const constants = await getPxlPrep();
        setPxlConstants(constants);
      } catch (error) {
        setError(error as Error);
        setPxlNavStatus('error');
      }
    };

    loadPxlPrep();
  }, []);

  // Memoize options objects to prevent recreation on every render
  const customOptions = useMemo(() => ({
    verbose: pxlConstants?.pxlEnums?.VERBOSE_LEVEL.DEBUG,
    fps: {
      'pc': 60,
      'mobile': 30
    },
    renderScale: {
      'pc': 0.8,
      'mobile': 1.2
    },
    antiAliasing: pxlConstants?.pxlEnums?.ANTI_ALIASING.HIGH,
    skyHaze: pxlConstants?.pxlEnums?.SKY_HAZE.CLEAR,
    shadowMapBiasing: pxlConstants?.pxlEnums?.SHADOW_MAP.SOFT,
  }), [pxlConstants]);

  const projectSettings = useMemo(() => ({
    pxlRoomRootPath: "./pxlRooms",
    pxlAssetRootPath: "./pxlAssets",
    showOnboarding: true,
    enableStaticCamera: false
  }), []); // Empty dependency array since these are static

  // Use the custom hook for configuration logic (React best practice)
  const configuredOptions = usePxlNavConfig({
    pxlEnums: pxlConstants?.pxlEnums,
    pxlOptions: pxlConstants?.pxlOptions,
    customOptions,
    projectSettings
  });

  const handlePxlNavBooted = () => {
    console.log(' React App : pxlNav has fully booted!');
    setPxlNavStatus('ready');
  };

  const handlePxlNavError = (err: Error) => {
    console.error(' React App : pxlNav failed to initialize:', err);
    setError(err);
    setPxlNavStatus('error');
  };
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
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
        <h3 style={{ margin: '0 0 5px 0' }}>pxlNav React App</h3>
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
        {pxlConstants && (
          <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8 }}>
            Constants loaded ✓
          </div>
        )}
      </header>

      {/* Only render PxlNavComponent when we have configured options */}
      {configuredOptions && (
        <PxlNavComponentClean 
          projectTitle={"pxlNav React Test"}
          startingRoom={"SaltFlatsEnvironment"}
          roomBootList={["SaltFlatsEnvironment"]}
          pxlNavOptions={configuredOptions}
          onBooted={handlePxlNavBooted}
          onError={handlePxlNavError}
        />
      )}
    </div>
  );
}

export default App;