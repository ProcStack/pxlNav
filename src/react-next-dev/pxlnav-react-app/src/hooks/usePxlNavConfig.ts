// Custom hook for pxlNav configuration logic
// This separates business logic from UI components
import { useMemo } from 'react';

interface PxlNavConfigOptions {
  pxlEnums: any;
  pxlOptions: any;
  customOptions?: Record<string, any>;
  userSettings?: Record<string, any>;
  projectSettings?: {
    pxlRoomRootPath?: string;
    pxlAssetRootPath?: string;
    showOnboarding?: boolean;
    enableStaticCamera?: boolean;
  };
}

export const usePxlNavConfig = ({
  pxlEnums,
  pxlOptions,
  customOptions,
  userSettings,
  projectSettings
}: PxlNavConfigOptions) => {
  
  const configuredOptions = useMemo(() => {
    if (!pxlEnums || !pxlOptions) {
      return null;
    }

    console.log(' Building pxlNav configuration...');

    // Default user settings
    const defaultUserSettings = Object.assign({}, pxlOptions.userSettings || {});
    defaultUserSettings['height'] = defaultUserSettings['height'] || {};
    defaultUserSettings['height']['standing'] = userSettings?.standingHeight || 1.75;
    defaultUserSettings['height']['stepSize'] = userSettings?.stepSize || 5;

    // Default technical settings
    const defaultTargetFPS = {
      'pc': 45,
      'mobile': 30
    };

    const defaultRenderScale = {
      'pc': 1.0,
      'mobile': 1.3
    };

    const defaultCollisionScale = {
      'gridSize': 150,
      'gridReference': 1000
    };

    // Default loader phrases
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

    // Build the complete options object
    const options = Object.assign({}, pxlOptions);
    
    // Apply defaults
    options.userSettings = Object.assign({}, defaultUserSettings, userSettings);
    options.verbose = pxlEnums.VERBOSE_LEVEL.INFO;
    options.fps = defaultTargetFPS;
    options.renderScale = defaultRenderScale;
    options.antiAliasing = pxlEnums.ANTI_ALIASING.LOW;
    options.collisionScale = defaultCollisionScale;
    options.allowStaticRotation = false;
    options.skyHaze = pxlEnums.SKY_HAZE.VAPOR;
    options.shadowMapBiasing = pxlEnums.SHADOW_MAP.SOFT;
    options.loaderPhrases = defaultLoaderPhrases;
    
    // Apply project settings
    options.pxlRoomRoot = projectSettings?.pxlRoomRootPath || "../pxlRooms";
    options.pxlAssetRoot = projectSettings?.pxlAssetRootPath || "./pxlAssets";
    options.showOnboarding = projectSettings?.showOnboarding ?? true;
    options.staticCamera = projectSettings?.enableStaticCamera ?? false;

    // Apply custom options last (highest priority)
    if (customOptions) {
      Object.assign(options, customOptions);
    }

    console.log(' Configuration complete:', options);
    return options;
  }, [
    pxlEnums, 
    pxlOptions, 
    customOptions,
    userSettings,
    projectSettings
  ]);

  return configuredOptions;
};
