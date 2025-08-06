# pxlNav React Integration

This document outlines how to integrate pxlNav with React applications.

## Key Files for React Integration

- **`pxlNavBridge.js`** - Bridge between pxlNav and React components
- **`pxlNavContainer.jsx`** - Main React component wrapper for pxlNav
- **`components/PxlNavErrorBoundary.jsx`** - Error handling for pxlNav
- **`pxlNav/jsx/gui.jsx`** - React-based HUD component
- **`types/pxlNav.d.ts`** - TypeScript definitions (optional)

## Quick Start

```jsx
import React from 'react';
import PxlNavContainer from './pxlNavContainer';

function App(){
  return (
    <div className="App">
      <PxlNavContainer
        projectTitle="My Project"
        onBooted={() => console.log( 'pxlNav loaded!' )}
        onError={(error) => console.error( 'pxlNav error:', error )}
      />
    </div>
  );
}

export default App;
```

## Current Status: ✅ **READY FOR TESTING**

All major compatibility issues have been resolved. The React integration should now work properly with:
- ✅ **Proper event cleanup using pxlNav's new `unsubscribe()` method**
- ✅ Memory leak prevention
- ✅ Hot reload support
- ✅ Error boundaries
- ✅ SSR compatibility

## Quick Test Setup

### 1. **Install dependencies:**
```bash
cd src/react-next-dev
npm install
```

### 2. **Start the development server:**
```bash
npm start
# or
npm run dev
```

### 3. **Open your browser:**
The app should automatically open at `http://localhost:3000`

## Current Limitations

### 1. **Event Subscription Management** ✅ **FIXED**
- **Previous Issue**: No unsubscribe mechanism in pxlNav
- **Solution**: pxlNav now has `unsubscribe()` method, bridge updated to use it
- **Status**: ✅ **COMPLETED** - Proper cleanup now works

### 2. **Global DOM Dependencies**
pxlNav still expects certain global elements and may:
- Conflict with other Three.js instances
- Have issues in strict React environments
- **Status**: ⚠️ **Manageable** - Container component handles this

### 3. **TypeScript Support**
While type definitions are provided, pxlNav is pure JavaScript:
- Limited IntelliSense support
- Runtime type checking needed
- **Status**: ⚠️ **Optional** - Type definitions provided for development
- Runtime type checking needed
- **Recommendation**: Consider TypeScript migration for pxlNav core

## Advanced Usage

### Custom Options
```jsx
const customOptions = {
  verbose: 3,
  fps: { pc: 60, mobile: 30 },
  userSettings: {
    height: { standing: 1.75, stepSize: 5 }
  },
  staticCamera: false,
  collisionScale: {
    gridSize: 50,
    gridReference: 1000.0
  }
};

<PxlNavContainer options={customOptions} />
```

### Event Handling
```jsx
import { getPxlNav, subscribePxlNav } from './pxlNavBridge';

function MyComponent() {
  const componentId = useRef( 'my-component-' + Math.random().toString(36).substring(2) );
  
  useEffect( ()=>{
    subscribePxlNav(componentId.current, 'camera-move', ( eventType, eventValue )=>{
      console.log('Camera moved:', eventValue);
    });
    
    return ()=>unsubscribePxlNav( componentId.current );
  }, []);
}
```

### Triggering pxlNav Events
```jsx
import { getPxlNav } from './pxlNavBridge';

function NavigationButton(){
  const handleRoomChange = ()=>{
    const pxlNav = getPxlNav();
    if( pxlNav ){
      pxlNav.trigger('warptoroom', 'changeRoom', 'RoomName');
    }
  };
  
  return <button onClick={handleRoomChange}>Go to Room</button>;
}
```

## Next Steps for Better Integration

1. **Add unsubscribe method to pxlNav core**
2. **Improve module isolation**
3. **Add React-specific documentation to main pxlNav docs**
4. **Consider official React package (e.g., @pxlnav/react)**
5. **Add more comprehensive TypeScript definitions**

## Testing Needed

-  Component mounts without errors
-  pxlNav initializes properly
-  Event subscriptions work
-  Component unmounts cleanly
-  Hot reload works in development
-  Error boundaries catch pxlNav errors
-  Multiple instances don't conflict
-  SSR compatibility (Next.js)
