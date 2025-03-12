# pxlNav Change Log :: 0.0.27 - 0.0.28
---------------------

  - `FileIO.js` split `loadRoomFBX()` into `loadPath()`, `loadRoom()`, `loadRoomGLTF()`, and `loadRoomFile()`
<br/>&nbsp;&nbsp; - `loadRoomFile()` performs all mesh + object checks in the scene file
<br/>&nbsp;&nbsp; - `loadRoom()` checks file extention and runs either `loadRoomFBX()` or `loadRoomGLTF()`
<br/>&nbsp;&nbsp; - `loadPath()` takes a file path and runs `loadRoom()`

  - `FileIO.js` all room loading functions take a settings[object] now, to aid with backwards compatability in the future
  - `FileIO.js` now has `setLogging( bool )`, `getSettings()`, & `readSettings()`
<br/>&nbsp;&nbsp; - `meshIsChild` (default `false`) is used when your GLB is optimized to split mesh + transforms, where the child of the named transform is the geometry itself.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Not all GLB's have split mesh + transforms by default, and would be a manual step in asset development.  If you aren't manually optimizing your GLB, then leave this `false` 
<br/>&nbsp;&nbsp; - `getSettings()` returns -

```
  let settingsObj = {
    'fileType' : this.pxlEnums.FILE_TYPE.AUTO,
    'filePath' : '',
    'meshKey' : '',
    'meshIsChild' : false, 
    'enableLogging' : false
  };
```

<br/>&nbsp;&nbsp; - Can be used -

```
  let loadSettings = Option.assign( {}, this.pxlFile.getSettings() );
  loadSettings['filePath'] = this.sceneFile;
  loadSettings['enableLogging'] = true;
  let fieldFbxLoader = this.pxlFile.loadRoom( this, loadSettings );

  // -- or file specific --

  // `fileType` is optional, default is `AUTO` 
  let loadSettings = {
    'filePath' : this.assetPath + "OutletEnvironment.glb",
    'fileType' : this.pxlEnums.FILE_TYPE.GLB,
    'meshIsChild' : true, 
    'enableLogging' : true
  };

  let fieldFbxLoader = this.pxlFile.loadRoomGLB( this, loadSettings );
```

  - `FileIO.js` removed enableLogging from the list of args to pass to loadRoomFBX
  - `FileIO.js` added GLTF + GLB support
<br/>&nbsp;&nbsp; - Use `this.pxlFile.loadRoomGLB`
<br/>&nbsp;&nbsp; - Or you can use `this.pxlFile.loadRoom` no matter your file type

```
    let loadSettings = Object.assign( {}, this.pxlFile.getSettings() );
    loadSettings['fileType'] = this.pxlEnums.FILE_TYPE.GLB; // Optional; Default is 'AUTO'
    loadSettings['filePath'] = this.assetPath+"OutletEnvironment.glb";
    loadSettings['meshIsChild'] = true; // If your GLB has been "optimized" to split transforms & meshes
    loadSettings['enableLogging'] = true;

		let fieldFbxLoader = this.pxlFile.loadRoom( this, loadSettings );
```

  - `package.json` prepping the repo for the Next.js + React.js projects to be added

  - `pxlNav.js` + `Environment.js` were never reaching load state for pxlRoom module
<br/>&nbsp;&nbsp; - Attempt to catch errors & check for methods added mostly to `Environment.js`

  - `Device.js` drops failed rejections in attempt a global catch for missed erroneous Promises / async 
<br/>&nbsp;&nbsp; - May error twice, but shouldn't error in the first place; saving potential heart ache.

---