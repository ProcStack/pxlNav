import React, { useState } from 'react';
import PxlNavComponent from './components/PxlNavComponent';

function App() {
  const [pxlNavStatus, setPxlNavStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);

  const handlePxlNavBooted = () => {
    console.log(' pxlNav has fully booted!');
    setPxlNavStatus('ready');
  };

  const handlePxlNavError = (err: Error) => {
    console.error(' pxlNav failed to initialize:', err);
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
      </header>

      <PxlNavComponent 
        projectTitle={"pxlNav React Test"}
        startingRoom={"SaltFlatsEnvironment"}
        roomBootList={["SaltFlatsEnvironment"]}
        pxlRoomRootPath={"./pxlRooms"}
        pxlAssetRootPath={"./pxlAssets"}
        showOnboarding={true}
        onBooted={handlePxlNavBooted}
        onError={handlePxlNavError}
      />
    </div>
  );
}

export default App;