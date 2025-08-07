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

  // Subscription helper with cleanup tracking
  const subscribeToPxlNav = useCallback((eventType: string, callback: Function) => {
    if (pxlNavInstanceRef.current) {
      pxlNavInstanceRef.current.subscribe(eventType, callback);
      subscriptionsRef.current.push({ eventType, callback });
    }
  }, []);

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

  // Initialize pxlNav when module is loaded
  useEffect(() => {
    if (!pxlNavModule || isInitialized) return;

    const { pxlNav, pxlEnums, pxlOptions, pxlUserSettings } = pxlNavModule;

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

    // User settings for the default/initial pxlNav environment
    //   These can be adjusted from your `pxlRoom` but easily set defaults here
    const userSettings = Object.assign({}, pxlUserSettings);
    userSettings['height']['standing'] = 1.75; // Standing height in units; any camera in your room's FBX will override this height once loaded
    userSettings['height']['stepSize'] = 5; // Max step height in units

    // Target FPS (Frames Per Second)
    // Default is - PC = 60  -&-  Mobile = 30
    const targetFPS = {
      'pc' : 45,
      'mobile' : 30
    };

    // Render Scale / Resolution Scaling
    // Default is - PC = 1.0  -&-  Mobile = 1.0
    const renderScale = {
      'pc' : 1.0,
      'mobile' : 1.3
    };

    // Anti-aliasing level
    //   Options are - NONE, LOW, MEDIUM, HIGH
    const antiAliasing = pxlEnums.ANTI_ALIASING.LOW;

    // Shadow + Edge softness
    // Default is `BASIC` - a simple shadow edge
    //   Options are - OFF, BASIC, SOFT
    //     *Mobile devices are limited to `OFF` or `BASIC` automatically
    const shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;

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

    let mounted = true;
    
    const initializePxlNav = async () => {
      try {
        if (containerRef.current && !pxlNavInstanceRef.current) {
          const pxlNavManager = new pxlNav(
            options,
            projectTitle,
            startingRoom,
            roomBootList
          );

          if (!mounted) return;
          
          pxlNavInstanceRef.current = pxlNavManager;

          // Subscribe to booted event
          subscribeToPxlNav('booted', () => {
            if (mounted) {
              console.log(' pxlNav has booted successfully!');
              setIsInitialized(true);
              if (onBooted) onBooted();
            }
          });

          // Initialize your PxlNav instance
          pxlNavManager.init(); 
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('pxlNav initialization failed');
          console.error('- pxlNav initialization error:', error);
          setLoadError(error);
          if (onError) onError(error);
        }
      }
    };

    initializePxlNav();

    // Cleanup on unmount
    return () => {
      mounted = false;
      
      // Clean up subscriptions first
      cleanupSubscriptions();
      
      // Stop pxlNav
      if (pxlNavInstanceRef.current) {
        try {
          pxlNavInstanceRef.current.stop();
        } catch (err) {
          console.warn('Warning during pxlNav cleanup:', err);
        }
        pxlNavInstanceRef.current = null;
      }
    };
  }, [pxlNavModule, isInitialized, projectTitle, startingRoom, roomBootList, pxlRoomRootPath, pxlAssetRootPath, showOnboarding, enableStaticCamera, subscribeToPxlNav, cleanupSubscriptions, onBooted, onError]);

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