import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadPxlNavModule, getPxlEnums } from './pxlNavLoader.js';

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

  const [pxlEnums, setPxlEnums] = useState<any>(null);

  // Localized print helper — avoids overwriting global console.log
  // print() obeys the pxlNav verbose level and is safe to call anywhere inside this component.
  const print = React.useCallback((...args: any[]) => {
    try {
      const infoLevel = pxlEnums?.VERBOSE_LEVEL?.INFO;
      const currentVerbose = pxlNavOptions?.verbose;

      if (typeof infoLevel === 'number' && typeof currentVerbose === 'number') {
        if (currentVerbose >= infoLevel) {
          console.log(...args);
        }
      }
    } catch (e) {
      // swallow logging errors to avoid breaking the app
      // fallback to native console.log
      console.log(...args);
    }
  }, [pxlEnums, pxlNavOptions?.verbose]);

  // Load and initialize pxlNav - only run once when options are available
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || pxlNavInstanceRef.current || !pxlNavOptions) {
      return;
    }

    const initializePxlNav = async () => {
      try {
        
        // Load the module
  const moduleData = await loadPxlNavModule();
  const { pxlNav, pxlEnums } = moduleData;
  // expose enums to the component-level state for logging and other checks
  setPxlEnums(pxlEnums);

        if( pxlNavOptions?.verbose >= pxlEnums.VERBOSE_LEVEL.INFO ){
          print(' Starting pxlNav initialization...');
        }

        // Wait a moment to ensure canvas is properly mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create pxlNav instance with pre-configured options
        // Ensure the engine receives the actual DOM container managed by this component
        const instanceOptions = Object.assign({}, pxlNavOptions, {
          container: containerRef.current
        });

        // Guard against double-instantiation in environments that mount twice
        // (Next.js dynamic import + React StrictMode in development can cause this).
        // Store a single instance on window.__pxlNavInstance so subsequent mounts reuse it.
        let pxlNavManager: any = null;
        let createdByThisComponent = false;
        if (typeof window !== 'undefined' && (window as any).__pxlNavInstance) {
          pxlNavManager = (window as any).__pxlNavInstance;
          print(' Reusing existing pxlNav instance from window.__pxlNavInstance');
        } else {
          pxlNavManager = new pxlNav(
            instanceOptions,
            projectTitle,
            startingRoom,
            roomBootList
          );
          createdByThisComponent = true;
          if (typeof window !== 'undefined') {
            try { (window as any).__pxlNavInstance = pxlNavManager; } catch (e) { /* ignore */ }
          }
          print(' pxlNav instance created:', pxlNavManager);
        }

        pxlNavInstanceRef.current = pxlNavManager;

        // Subscribe to booted event (avoid duplicate subscriptions on the same instance)
        const bootedCallback = () => {
          print(' pxlNav has booted successfully!');
          setIsInitialized(true);
          setIsLoading(false);
          setErrorCount(0); // Reset error count on success

          if (onBooted) {
            onBooted();
          }

          // Debug: Check if the engine is rendering properly
          setTimeout(() => {
            if (pxlNavInstanceRef.current?.pxlTimer?.active) {
              print(' Current room:', pxlNavInstanceRef.current?.pxlEnv?.currentRoom);
              print(' Engine exists:', !!pxlNavInstanceRef.current?.pxlEnv?.engine);
              print(' Scene exists:', !!pxlNavInstanceRef.current?.pxlEnv?.scene);
            } else {
              console.warn(' pxlNav Timer is not active - this may be the render issue!');
              if (pxlNavInstanceRef.current?.start) {
                print(' Attempting to restart pxlNav timer...');
                pxlNavInstanceRef.current.start();
              }
            }
          }, 1000);
        };

        // Only add the subscription if it isn't already present on the engine
        try {
          const existingList = pxlNavManager?.callbacks?.['booted'];
          const alreadySubscribed = Array.isArray(existingList) && existingList.includes(bootedCallback);
          if (!alreadySubscribed) {
            pxlNavManager.subscribe('booted', bootedCallback);
            subscriptionsRef.current.push({ eventType: 'booted', callback: bootedCallback });
          } else {
            print(' booted callback already registered on pxlNav instance; skipping duplicate subscribe');
          }
        } catch (e) {
          // If the engine doesn't expose callbacks, fall back to always subscribing (best-effort)
          pxlNavManager.subscribe('booted', bootedCallback);
          subscriptionsRef.current.push({ eventType: 'booted', callback: bootedCallback });
        }

        // Initialize pxlNav only when we created it or if the engine is not already running
        print(' Initializing pxlNav...');
        const isEngineRunning = !!pxlNavManager?.pxlTimer?.active;
        if (createdByThisComponent || !isEngineRunning) {
          pxlNavManager.init();
        } else {
          // If the engine is already running/booted, invoke the booted path immediately
          print(' pxlNav instance already running; invoking booted handler immediately for this component');
          // Ensure component state matches running engine
          setIsInitialized(true);
          setIsLoading(false);
          setErrorCount(0);
          if (onBooted) onBooted();
        }
        
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
        print(`- Cleaned up ${cleanedCount} pxlNav subscriptions for ${componentId.current}`);
      }
      
      subscriptionsRef.current = [];
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentComponentId = componentId.current;
    
    return () => {
  print(`- Cleaning up pxlNav component ${currentComponentId} on unmount`);
      
      cleanupSubscriptions();
      
      if (pxlNavInstanceRef.current) {
        try {
          print('- Stopping pxlNav instance');
          // Only stop if this component created the global instance
          if (typeof window !== 'undefined' && (window as any).__pxlNavInstance === pxlNavInstanceRef.current) {
            pxlNavInstanceRef.current.stop();
            try { delete (window as any).__pxlNavInstance; } catch(e) { (window as any).__pxlNavInstance = null; }
          } else {
            print('- Not stopping pxlNav instance because it is not owned by this component');
          }
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