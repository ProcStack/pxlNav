# pxlNav Change Log :: 0.0.27 - 0.0.28
---------------------

# Major Changes
 - `FileIO.js` no longer auto applying diffuse map to emissive map
 - `pxlNav.js` has two new callbacks you can listen to, `step` & `render-prep`
 - `FileIO.js` instances use normal of instance-to-mesh, up = cross( (0,1,0), normal )

 - `FileIO.js` + `Room Environment` has mesh-to-particle support set in FBX using the `pSystem` (bool) custom attribute

# All Changes

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


 - `FileIO.js` instances use normal of instance-to-mesh, up = cross( (0,1,0), normal )
 <br/>&nbsp;&nbsp; - Up isn't imported or exported by default in Three / CGI programs
 <br/>&nbsp;&nbsp; - If no normals, a random vector * ( 1, 0, 1 ) is calculated

  - `package.json` prepping the repo for the Next.js + React.js projects to be added

  - `pxlNav.js` + `Environment.js` were never reaching load state for pxlRoom module
<br/>&nbsp;&nbsp; - Attempt to catch errors & check for methods added mostly to `Environment.js`

  - `Device.js` drops failed rejections in attempt a global catch for missed erroneous Promises / async 
<br/>&nbsp;&nbsp; - May error twice, but shouldn't error in the first place; saving potential heart ache.

---

  - `pxlNav.js` has two new callbacks you can listen to, `step` & `render-prep`
<br/>&nbsp;&nbsp; - `step` runs every frame, will return -
```
  event = {
      'time': #.# - Time since pxlNav started in seconds
      'delta': #.# - Time since last `step()`,
    }
```

<br/>&nbsp;&nbsp; - `render-prep` fires after shaders & animations update, but before the room `step()` -
```
  event = {
      'time': this.pxlTimer.runtime
    }
```

---


 - `File.js` no longer auto applying diffuse map to emissive map
<br/>&nbsp;&nbsp; - Was applying the diffuse map to emissive to quickly make objects brighter, but that was implemented for Antib0dy.Club, which didn't need shadows. Now it's hindering shadow influence. So it's been removed.

 - `File.js` + `room env` materialList items can store more mesh options on `*material*.meshSetting={}`
<br/>&nbsp;&nbsp; - `castShadow`, `receiveShadow`, `frontSided`, & `doubleSided` as booleans
<br/>&nbsp;&nbsp; - `frontSided` true is 'front', false is 'back'
<br/>&nbsp;&nbsp; - `doubleSided` true is 'double' sided, false is 'front'



 - `FileIO.js` + `Room Environment` has mesh-to-particle support set in FBX using the `pSystem` (bool) custom attribute
<br/>&nbsp;&nbsp; - This will parse a geometry object to a buffer object of merged verticies
<br/>&nbsp;&nbsp; - Access it from your Room --

```
import { fireflyVert, fireflyFrag } from "./Shaders.js";

// Build a mesh-to-particle system for the fireflies
//   Using the `fireflies_vfx` geometry from the CampfireEnvironment.fbx
//     Marked with the custom property `pSystem = true`
buildFireflies(){
  if( this.mobile ) return;

  let nameOfSystem = "fireflies_vfx";
  if( this.particleList?.hasOwnProperty( nameOfSystem ) && this.particleList[nameOfSystem].type == "BufferGeometry" ){
    let fireflyUniforms = {
        'atlasTexture' : { type:'t', value: null },
        'atlasAlphaTexture' : { type:'t', value: null },
        'noiseTexture' : { type:"t", value: null },
        'pointScale' : { type: "v", value: new Vector2( 5.0, 0.0 ) },
        'tint' : { type: "c", value: new Color( 1.5, 1.4, 0.6 ) },
        'fogColor' : { type: "c", value: this.fogColor },
        'rate' : { type:"f", value:.035 }
      };
    fireflyUniforms.atlasTexture.value = this.pxlUtils.loadTexture( "sprite_dustAtlas_rgb.jpg", null, {'encoding':SRGBColorSpace} );
    fireflyUniforms.atlasAlphaTexture.value = this.pxlUtils.loadTexture( "sprite_dustAtlas_alpha.jpg" );

    // -- -- --

    // Make the firefly system itself
    let fireflySystem = new ParticleBase( this, "fireflySystem" );

    // Build settings using the ParticleBase class's `getSettings()` method
    let fireflySettings = fireflySystem.getSettings();
    fireflySettings["atlasPicks"] = [
      ...fireflySystem.dupeArray([0.0,0.50],4), ...fireflySystem.dupeArray([0.25,0.50],4),
      ...fireflySystem.dupeArray([0.0,0.75],4), ...fireflySystem.dupeArray([0.25,0.75],4)
    ];
    fireflySettings["additiveBlend"] = true;

    // Assign your `userData.pSystem = true` geometry to the particle system to use
    fireflySystem.setGeometry( this.particleList[ nameOfSystem ] );

    // Build + Add the particle system to the scene using `ParticleBase.build( settings, uniforms, vertex shader, fragment shader )`
    fireflySystem.build( fireflySettings, fireflyUniforms, fireflyVert(), fireflyFrag()  );

    // Optional, overwrite the `pSystem` geometry with the built particle system
    this.particleList[ nameOfSystem ] = fireflySystem;
  }
}
```

 - `particles.js` now exporting `ParticleBase`
 - `ParticleBase.js` default behavior expects Uniform, Vertex, Fragment shaders + BufferGoemetry to use as the vertex locations to convert vertices to particles.