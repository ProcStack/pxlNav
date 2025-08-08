import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadPxlNavModule } from './pxlNavLoader.js';

// Import pxlNav using dynamic import for better ESM compatibility
interface PxlNavModule {
  pxlNav: any;
  pxlEnums: any;
  pxlOptions: any;
  pxlUserSettings: any;
  pxlNavVersion: string;
  pxlEffects: any;
  pxlShaders: any;
  pxlBase: any;
  RoomEnvironment: any;
}

interface pxlNavProps {
  projectTitle: string;
  startingRoom: string;
  roomBootList: string[];
  pxlRoomRootPath?: string;
  pxlAssetRootPath?: string;
  showOnboarding?: boolean;
  enableStaticCamera?: boolean;
  pxlOptions?: Record<string, any>; // Allow custom pxlOptions overrides
  onBooted?: () => void;
  onError?: (error: Error) => void;
}

const PxlNavComponent: React.FC<pxlNavProps> = ({ 
      projectTitle = "pxlNav Environment", 
      startingRoom = "SaltFlatsEnvironment", 
      roomBootList = ["SaltFlatsEnvironment"],
      pxlRoomRootPath = "../pxlRooms",
      pxlAssetRootPath = "./pxlAssets",
      showOnboarding = true,
      enableStaticCamera = false,
      pxlOptions = {},
      onBooted,
      onError
}) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const pxlNavInstanceRef = useRef<any>(null);
  const subscriptionsRef = useRef<Array<{eventType: string, callback: Function}>>([]);
  const componentId = useRef(`pxlnav-${Date.now()}`);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [pxlNavModule, setPxlNavModule] = useState<PxlNavModule | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(0);

  // Load the pxlNav module dynamically
  useEffect(() => {
    const loadPxlNav = async () => {
      try {
        const moduleData = await loadPxlNavModule();
        
        setPxlNavModule(moduleData);
        setIsLoading(false);
        setErrorCount(0); // Reset error count on success
      } catch (error) {
        const currentTime = Date.now();
        const timeSinceLastError = currentTime - lastErrorTime;
        
        // Throttle errors - only log if it's been more than 2 seconds since last error
        // or if we haven't hit the max error count yet
        setErrorCount(prev => prev + 1);
        setLastErrorTime(currentTime);
        
        if (timeSinceLastError > 2000 || errorCount < 5) {
          console.error(`Failed to load pxlNav module (attempt ${errorCount + 1}):`, error);
        }
        
        // Stop trying after 10 attempts
        if (errorCount >= 10) {
          console.error('Maximum error attempts reached. Stopping retries.');
          setLoadError(error as Error);
          setIsLoading(false);
          onError?.(error as Error);
          return;
        }
        
        // Don't update loading state immediately - allow for retry
        if (errorCount >= 3) {
          setLoadError(error as Error);
          setIsLoading(false);
          onError?.(error as Error);
        }
      }
    };

    // Only attempt to load if we haven't exceeded error threshold
    if (errorCount < 10 && !loadError) {
      loadPxlNav();
    }
  }, [onError, errorCount, lastErrorTime, loadError]);

  // Monitor module loading and trigger initialization
  useEffect(() => {
    if (pxlNavModule && !isInitialized && !pxlNavInstanceRef.current) {
      // Module is loaded and we haven't initialized yet
      const initializeNow = async () => {
        const { pxlNav, pxlEnums, pxlOptions, pxlUserSettings } = pxlNavModule;

        // Console logging level
        const verbose = pxlEnums.VERBOSE_LEVEL.INFO;

        // Set a list of phrases to display during the loading process
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

        // User settings for the default/initial pxlNav environment
        const userSettings = Object.assign({}, pxlUserSettings);
        userSettings['height']['standing'] = 1.75;
        userSettings['height']['stepSize'] = 5;

        // Target FPS
        const targetFPS = {
          'pc' : 45,
          'mobile' : 30
        };

        // Render Scale / Resolution Scaling
        const renderScale = {
          'pc' : 1.0,
          'mobile' : 1.3
        };

        const antiAliasing = pxlEnums.ANTI_ALIASING.LOW;
        const shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;
        const allowStaticRotation = false;
        const skyHaze = pxlEnums.SKY_HAZE.VAPOR;

        const collisionScale = {
          'gridSize' : 150,
          'gridReference' : 1000
        };

        const options = Object.assign( {}, pxlOptions );
        options.userSettings = userSettings;
        options.verbose = verbose;
        options.fps = targetFPS;
        options.renderScale = renderScale;
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

        // Apply custom pxlOptions overrides - these will override any defaults above
        if (pxlOptions && typeof pxlOptions === 'object') {
          console.log(' Applying custom pxlOptions:', pxlOptions);
          Object.assign(pxlOptions, options);
        }

        try {
          // Wait a moment to ensure canvas is properly mounted
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const pxlNavManager = new pxlNav(
            options,
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
            if (onBooted) {
              onBooted();
              console.log(' pxlNav has fully booted!'); // Add back the "pxlNav Booted" message
            }
            
            // Additional debug: Check if the engine is rendering properly
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

          // Subscribe directly to the pxlNav instance
          pxlNavManager.subscribe('booted', bootedCallback);
          subscriptionsRef.current.push({ eventType: 'booted', callback: bootedCallback });

          // Initialize your PxlNav instance
          console.log(' Initializing pxlNav...');
          pxlNavManager.init(); 
        } catch (err) {
          const error = err instanceof Error ? err : new Error('pxlNav initialization failed');
          console.error('- pxlNav initialization error:', error);
          setLoadError(error);
          if (onError) onError(error);
        }
      };

      initializeNow();
    }
  }, [pxlNavModule, isInitialized, projectTitle, startingRoom, roomBootList, pxlRoomRootPath, pxlAssetRootPath, showOnboarding, enableStaticCamera, pxlOptions, onBooted, onError]);

  // Cleanup helper using the new unsubscribe method
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

  // Main cleanup effect - only runs on component unmount
  useEffect(() => {
    // Copy the ref value to avoid stale closure
    const currentComponentId = componentId.current;
    
    // Cleanup on unmount ONLY
    return () => {
      console.log(`- Cleaning up pxlNav component ${currentComponentId} on unmount`);
      
      // Clean up subscriptions first
      cleanupSubscriptions();
      
      // Stop pxlNav
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
  }, [cleanupSubscriptions]); // Include cleanupSubscriptions dependency

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
            {isLoading ? 'Loading module...' : 'Initializing 3D environment'}
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