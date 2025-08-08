import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadPxlNavModule } from './pxlNavLoader.js';

interface PxlNavComponentProps {
  projectTitle: string;
  startingRoom: string;
  roomBootList: string[];
  pxlNavOptions: Record<string, any>; // Pre-configured options from parent
  onBooted?: () => void;
  onError?: (error: Error) => void;
}

const PxlNavComponent: React.FC<PxlNavComponentProps> = ({ 
  projectTitle,
  startingRoom,
  roomBootList,
  pxlNavOptions,
  onBooted,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pxlNavInstanceRef = useRef<any>(null);
  const subscriptionsRef = useRef<Array<{eventType: string, callback: Function}>>([]);
  const componentId = useRef(`pxlnav-${Date.now()}`);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Load and initialize pxlNav - only run once when options are available
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || pxlNavInstanceRef.current || !pxlNavOptions) {
      return;
    }

    const initializePxlNav = async () => {
      try {
        console.log(' Starting pxlNav initialization...');
        
        // Load the module
        const moduleData = await loadPxlNavModule();
        const { pxlNav } = moduleData;

        // Wait a moment to ensure canvas is properly mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create pxlNav instance with pre-configured options
        const pxlNavManager = new pxlNav(
          pxlNavOptions,
          projectTitle,
          startingRoom,
          roomBootList
        );
        
        pxlNavInstanceRef.current = pxlNavManager;
        console.log(' pxlNav instance created:', pxlNavInstanceRef.current);

        // Subscribe to booted event
        const bootedCallback = () => {
          console.log(' pxlNav has booted successfully!');
          setIsInitialized(true);
          setIsLoading(false);
          setErrorCount(0); // Reset error count on success
          
          if (onBooted) {
            onBooted();
          }
          
          // Debug: Check if the engine is rendering properly
          setTimeout(() => {
            if (pxlNavInstanceRef.current?.pxlTimer?.active) {
              console.log(' Current room:', pxlNavInstanceRef.current?.pxlEnv?.currentRoom);
              console.log(' Engine exists:', !!pxlNavInstanceRef.current?.pxlEnv?.engine);
              console.log(' Scene exists:', !!pxlNavInstanceRef.current?.pxlEnv?.scene);
            } else {
              console.warn(' pxlNav Timer is not active - this may be the render issue!');
              if (pxlNavInstanceRef.current?.start) {
                console.log(' Attempting to restart pxlNav timer...');
                pxlNavInstanceRef.current.start();
              }
            }
          }, 1000);
        };

        // Subscribe to the booted event
        pxlNavManager.subscribe('booted', bootedCallback);
        subscriptionsRef.current.push({ eventType: 'booted', callback: bootedCallback });

        // Initialize pxlNav
        console.log(' Initializing pxlNav...');
        pxlNavManager.init();
        
      } catch (error) {
        console.error('Failed to initialize pxlNav:', error);
        const finalError = error instanceof Error ? error : new Error('pxlNav initialization failed');
        setLoadError(finalError);
        setIsLoading(false);
        onError?.(finalError);
      }
    };

    initializePxlNav();
  }, [pxlNavOptions, projectTitle, startingRoom, roomBootList, onBooted, onError, isInitialized]); // Added isInitialized to dependencies

  // Cleanup helper
  const cleanupSubscriptions = useCallback(() => {
    if (pxlNavInstanceRef.current && subscriptionsRef.current.length > 0) {
      let cleanedCount = 0;
      subscriptionsRef.current.forEach(({ eventType, callback }) => {
        if (typeof pxlNavInstanceRef.current.unsubscribe === 'function') {
          const success = pxlNavInstanceRef.current.unsubscribe(eventType, callback);
          if (success) cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`- Cleaned up ${cleanedCount} pxlNav subscriptions for ${componentId.current}`);
      }
      
      subscriptionsRef.current = [];
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentComponentId = componentId.current;
    
    return () => {
      console.log(`- Cleaning up pxlNav component ${currentComponentId} on unmount`);
      
      cleanupSubscriptions();
      
      if (pxlNavInstanceRef.current) {
        try {
          console.log('- Stopping pxlNav instance');
          pxlNavInstanceRef.current.stop();
        } catch (err) {
          console.warn('Warning during pxlNav cleanup:', err);
        }
        pxlNavInstanceRef.current = null;
      }
    };
  }, [cleanupSubscriptions]);

  // Error display
  if (loadError) {
    return (
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: '#ff6b6b',
          flexDirection: 'column',
          fontFamily: 'monospace'
        }}
      >
        <h3>- pxlNav Error</h3>
        <p>{loadError.message}</p>
        {errorCount > 0 && (
          <p style={{ fontSize: '12px', opacity: 0.8 }}>
            Failed after {errorCount} attempts
          </p>
        )}
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#333',
            color: 'white',
            border: '1px solid #666',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute'
        }}
      >
        <canvas 
          id="pxlNav-coreCanvas"
          width={800}
          height={600}
          className='pxlNav-coreCanvasStyle'
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />
      </div>
      
      {/* Loading indicator */}
      {(isLoading || !isInitialized) && !loadError && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            textAlign: 'center',
            zIndex: 1000
          }}
        >
          <div>- Loading pxlNav...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Initializing 3D environment...
          </div>
        </div>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && isInitialized && (
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 1000
          }}
        >
          <div>- pxlNav Ready</div>
          <div>Component: {componentId.current.substring(0, 8)}...</div>
          <div>Subscriptions: {subscriptionsRef.current.length}</div>
        </div>
      )}
    </>
  );
};

export default PxlNavComponent;
