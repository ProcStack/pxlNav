// pxlNav Module Loader
// This file provides a safe way to load the pxlNav module and handle initialization issues

let cachedModule = null;

async function attemptImport(maxRetries = 5, delay = 200) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add progressively longer delays to help with timing and circular dependency issues
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
      
      // Import from local file for development
      let module;
      try {
        // For webpack initialization issues, try with a cache-busting parameter
        const cacheBuster = i > 0 ? `?t=${Date.now()}` : '';
        // Try importing with .js extension first
        module = await import(`./pxlNav.js${cacheBuster}`);
      } catch (err) {
        // Check if this is a webpack initialization error
        if (err.message && err.message.includes('__WEBPACK_DEFAULT_EXPORT__')) {
          console.warn(`Webpack initialization error on attempt ${i + 1}, retrying...`);
          throw err; // Let it retry
        }
        console.warn('Failed to import ./pxlNav.js, trying without extension:', err.message);
        // If that fails, try without extension
        const cacheBuster = i > 0 ? `?t=${Date.now()}` : '';
        module = await import(`./pxlNav${cacheBuster}`);
      }

      // Validate the module is properly initialized
      if (!module || (typeof module === 'object' && Object.keys(module).length === 0)) {
        throw new Error('Module imported but appears empty or uninitialized');
      }

      return module;
    } catch (error) {
      console.warn(`Import attempt ${i + 1} failed:`, error.message);
      
      // For webpack initialization errors, add extra delay
      if (error.message && error.message.includes('__WEBPACK_DEFAULT_EXPORT__')) {
        console.warn('Detected webpack initialization issue, adding extra delay...');
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * 2));
        }
      }
      
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
    
    // Add extra validation for webpack initialization
    if (module.default && typeof module.default === 'object') {
      console.log(' Default keys:', Object.keys(module.default));
      
      // Check if default export is properly initialized
      const defaultKeys = Object.keys(module.default);
      if (defaultKeys.length === 0) {
        throw new Error('Default export exists but appears empty - possible initialization issue');
      }
    }
    
    // Validate that all required exports exist
    let pxlNav, pxlEnums, pxlOptions, pxlUserSettings, pxlNavVersion, pxlEffects, pxlShaders, pxlBase, RoomEnvironment;
    
    // Attempt to access the default export
    if (module.default) {
      try {
        // The default export is now a factory function that returns all exports
        let exports;
        if (typeof module.default === 'function') {
          exports = module.default();
        } else {
          // Fallback if it's not a function (shouldn't happen with new structure)
          exports = module.default;
        }
        
        // Validate the exports object
        if (!exports || typeof exports !== 'object') {
          throw new Error('Factory function did not return a valid exports object');
        }
        
        // Access properties from the factory function result
        pxlNav = exports.pxlNav;
        pxlEnums = exports.pxlEnums;
        pxlOptions = exports.pxlOptions;
        pxlUserSettings = exports.pxlUserSettings;
        pxlNavVersion = exports.pxlNavVersion;
        pxlEffects = exports.pxlEffects;
        pxlShaders = exports.pxlShaders;
        pxlBase = exports.pxlBase;
        RoomEnvironment = exports.RoomEnvironment;
        
        console.log(' Factory function exports accessed successfully');
        
      } catch (accessError) {
        console.error(' Error accessing default exports:', accessError);
        
        // If it's a webpack initialization error, provide specific guidance
        if (accessError.message.includes('__WEBPACK_DEFAULT_EXPORT__') || 
            accessError.message.includes('initialization')) {
          throw new Error(`Webpack module initialization issue: ${accessError.message}. This may indicate a circular dependency or timing issue.`);
        }
        
        throw new Error(`Failed to access default exports: ${accessError.message}`);
      }
    } else {
      throw new Error('pxlNav module does not have a default export');
    } // Close the main try block that started at line ~78

    // Verify critical exports exist (some may be null initially due to lazy loading)
    const criticalMissingExports = [];
    if (!pxlNav) criticalMissingExports.push('pxlNav');
    if (!pxlEnums) criticalMissingExports.push('pxlEnums');
    if (!pxlOptions) criticalMissingExports.push('pxlOptions');
    if (!RoomEnvironment) criticalMissingExports.push('RoomEnvironment');

    if (criticalMissingExports.length > 0) {
      throw new Error(`Critical exports missing or not initialized: ${criticalMissingExports.join(', ')}`);
    }
    
    // Log warnings for optional exports that might be null
    const optionalExports = [];
    if (!pxlUserSettings) optionalExports.push('pxlUserSettings');
    if (!pxlNavVersion) optionalExports.push('pxlNavVersion');
    if (!pxlEffects) optionalExports.push('pxlEffects');
    if (!pxlShaders) optionalExports.push('pxlShaders');
    if (!pxlBase) optionalExports.push('pxlBase');
    
    if (optionalExports.length > 0) {
      console.warn(`Optional exports not yet initialized: ${optionalExports.join(', ')}`);
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
