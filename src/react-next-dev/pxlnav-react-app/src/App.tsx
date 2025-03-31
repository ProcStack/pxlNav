import React from 'react';
import PxlNavComponent from './components/PxlNav';

function App() {
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <PxlNavComponent 
        projectTitle = {"The Outlet"}
        startingRoom = {"OutletEnvironment"}
        roomBootList = {["OutletEnvironment"]}
        pxlRoomRootPath = {"../js/pxlRooms"}
        pxlAssetRootPath={"./js/pxlAssets"}
        showOnboarding={true}
      />
    </div>
  );
}

export default App;