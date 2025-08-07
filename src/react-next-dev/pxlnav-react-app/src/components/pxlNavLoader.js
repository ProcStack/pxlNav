// pxlNav Module Loader
// This file provides a safe way to load the pxlNav module and handle initialization issues

let cachedModule = null;

async function attemptImport(maxRetries = 3, delay = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add a small delay to help with timing issues
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * i));
      }
      
      // Import from local file for development
      let module;
      try {
        // Try importing with .js extension first
        module = await import('./pxlNav.js');
      } catch (err) {
        console.warn('Failed to import ./pxlNav.js, trying without extension:', err.message);
        // If that fails, try without extension
        module = await import('./pxlNav');
      }

      return module;
    } catch (error) {
      console.warn(`Import attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
}

export async function loadPxlNavModule() {
  if (cachedModule) {
    return cachedModule;
  }

  try {
    // Import the actual pxlNav module with retry logic
    const module = await attemptImport();
    
    console.log(' Module imported successfully');
    console.log(' Module keys:', Object.keys(module));
    console.log(' Has pxlNav property:', module.hasOwnProperty('pxlNav'));
    console.log(' Has default property:', module.hasOwnProperty('default'));
    
    if (module.default) {
      console.log(' Default keys:', Object.keys(module.default));
    }
    
    // Validate that all required exports exist
    let pxlNav, pxlEnums, pxlOptions, pxlUserSettings, pxlNavVersion, pxlEffects, pxlShaders, pxlBase, RoomEnvironment;

    if (module.hasOwnProperty('pxlNav')) {
      console.log(' Using named exports');
      // Named exports are available - but be careful accessing them
      try {
        pxlNav = module.pxlNav;
        pxlEnums = module.pxlEnums;
        pxlOptions = module.pxlOptions;
        pxlUserSettings = module.pxlUserSettings;
        pxlNavVersion = module.pxlNavVersion;
        pxlEffects = module.pxlEffects;
        pxlShaders = module.pxlShaders;
        pxlBase = module.pxlBase;
        RoomEnvironment = module.RoomEnvironment;
      } catch (accessError) {
        console.error(' Error accessing named exports:', accessError);
        throw new Error(`Failed to access named exports: ${accessError.message}`);
      }
    } else if (module.default) {
      console.log(' Using default exports');
      // Use default export
      try {
        ({ pxlNav, pxlEnums, pxlOptions, pxlUserSettings, pxlNavVersion, pxlEffects, pxlShaders, pxlBase, RoomEnvironment } = module.default);
      } catch (accessError) {
        console.error(' Error accessing default exports:', accessError);
        throw new Error(`Failed to access default exports: ${accessError.message}`);
      }
    } else {
      throw new Error('pxlNav module does not export the expected members');
    }

    // Verify all exports exist
    const missingExports = [];
    if (!pxlNav) missingExports.push('pxlNav');
    if (!pxlEnums) missingExports.push('pxlEnums');
    if (!pxlOptions) missingExports.push('pxlOptions');
    if (!pxlUserSettings) missingExports.push('pxlUserSettings');
    if (!pxlNavVersion) missingExports.push('pxlNavVersion');
    if (!pxlEffects) missingExports.push('pxlEffects');
    if (!pxlShaders) missingExports.push('pxlShaders');
    if (!pxlBase) missingExports.push('pxlBase');
    if (!RoomEnvironment) missingExports.push('RoomEnvironment');

    if (missingExports.length > 0) {
      throw new Error(`Missing exports: ${missingExports.join(', ')}`);
    }

    // Cache the successfully loaded module
    cachedModule = {
      pxlNav,
      pxlEnums,
      pxlOptions,
      pxlUserSettings,
      pxlNavVersion,
      pxlEffects,
      pxlShaders,
      pxlBase,
      RoomEnvironment
    };

    return cachedModule;
  } catch (error) {
    // Clear cache on error so we can retry
    cachedModule = null;
    throw error;
  }
}

// Helper to clear cache (useful for development/testing)
export function clearPxlNavCache() {
  cachedModule = null;
}
