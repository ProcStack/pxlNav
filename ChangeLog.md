
# pxlNav Change Log :: 0.0.28 - 1.0.0
 React.js project futher implemented!
<br/> Major version reached! v1.0.0 baby!

 For `0.0.27 - 0.0.28` see below vvv


This milestone marks the addition of React and Next support for pxlNav.
<br/> Before now it was purely written as an ESM module, which React now supports!! (As of December 5th 2024)
<br/> The separation of ESM and CJS was a bit bothersome, especially for someone who doesn't know React or Next

<br/> I just know JavaScript
<br/> I'm an environment kitty, not a framework kitty

# Major Changes
 - pxlNav now loads as a component and attempts to draw to screen in `React`
 - pxlNav Bridge and Component files added; JSX & TS with D-Types
 - pxlNav is still formatted in ESM, and intended to be ran in Native JS as a Module for better dynamic loading of rooms.

# All Changes
Please note, if you are using `pxlNav` in `React` you need to run `npm run roomManifest`
<br/> This will run the file `generateRoomManifest.js` which will create an `index.js` file at -
<br/>  `pxlnav-react-app/src/components/pxlNav/index.js`

If you have the full repo, it'll be located at -
<br/>  `pxlNav/src/react-next-dev/pxlnav-react-app/src/components/pxlRooms/index.js`

If you are running pxlNav as an ESM module, you do not need to run `roomManifest`!
<br/> But it doesn't hurt to run for native JS, ESM mode, just not needed.

This `index.js` file contains imports of your `pxlNav` rooms for React.
<br/> Abbreviated example of `index.js` -
```
import { SaltFlatsEnvironment } from './SaltFlatsEnvironment/SaltFlatsEnvironment.js';

// Room exports
export {
  SaltFlatsEnvironment
};

// Room loader function for compatibility
export async function loadRoomModule( roomName ){ ... }

// Available room names
export const availableRooms = [ 'SaltFlatsEnvironment' ];
```

Implemented with -
```
import { loadRoomModule } from '../../pxlRooms/index.js';

const roomLoad = loadRoomModule( 'SaltFlatsEnvironment' );
```



The React app should be able to load `pxlNav` as a module to `node_modules` when installing the `pxlnav-react-app`'s nodes.
<br/> Next.js to come next.  Now with React more-or-less working, it should be easy to implement Next.

<br/> Again, if you want to use pxlNav with React, you must run `npm run roomManifest` from your React App root
<br/> Or just update the `pxlnav-react-app/src/components/pxlRooms/index.js` file manually.

# JSX & TypeScript notes
<br/> pxlNav is still formatted in ESM. I still intend for dynamic loads to be a primary strength of `pxlNav` to recieve server requests to load files on the fly from the server.  Building for React/Next requires all script files are known and compiled together.  This restricts the dynamicality of pxlNav, and some of the main reasons it was written outside of React to begin with.
<br/> If you don't need server derived loads, this doesn't pertain to you.
<br/> At that point, you'd already find what rooms are available on initial load, auth verification.

To run `pxlNav` in React or Next, you must agregate the room scene files before the site is compiled.
<br/> So if you get a server request to load a new, unknown, room, React will inform you the scene files can't be loaded.
<br/> Warning you that script files can't be loaded from outside of the module.

I'll do my best to test React & Next builds of pxlNav are stable with all core functionality
<br/> But please submit any bugs as `issues` on github should you come across 'em.



---------------------
# pxlNav Change Log :: 0.0.27 - 0.0.28
---------------------

# NOTE -
  React.js & Next.js support in `./src/react-next-dev` is initial pass of pxlNav as a component;
<br/>  These are in development and will be moved to `./examples` when working

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
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Not all GLB's have split mesh + transforms by default, and would be a manual step in asset development.
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; If you aren't manually optimizing your GLB, then leave this `false` 
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

  - `Device.js` catches failed promises / rejections; global catch for missed erroneous Promises / Async 
<br/>&nbsp;&nbsp; - May error twice, but shouldn't error in the first place; saving potential heart ache.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; Testing to be had still... unit test failed promises

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
  let nameOfSystem = "fireflies_vfx";
  if( this.particleList?.hasOwnProperty( nameOfSystem ) && this.particleList[nameOfSystem].type == "BufferGeometry" ){
    let fireflyUniforms = {
        'atlasTexture' : { type:'t', value: null },
        'atlasAlphaTexture' : { type:'t', value: null },
        'noiseTexture' : { type:"t", value: null },
        'pointScale' : { type: "v", value: new Vector2( 5.0, 0.0 ) },
        'tint' : { type: "c", value: new Color( 1.5, 1.4, 0.6 ) }
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

 - `EmberWisps.js` + `Smoke.js` particle systems now use `shaderSettings.offsetPos` [Vector3], only Smoke was using `offsetPos.xz`
 <br/>&nbsp;&nbsp; - Applied after all animation positioning calculated --
```
  vec4 mvPos = modelViewMatrix * vec4( animatedPosition + offsetPos, 1.0 );
```

 - `FloatingDust.js` clamps alpha after multiplying `FloatingDust.getSettings()['pOpacity']` into the frag

 - `shaders.js` + `pxlParticles` now export a settings objects that holds all the possible settings per Particle effect

 ```
  emberWispsSettings, emberWispsVert, emberWispsFrag,
  dustSettings, dustVert, dustFrag
  heightMapSettings, heightMapVert, heightMapFrag
  smokeSettings, smokeVert, smokeFrag
  snowSettings, snowFallVert, snowFallFrag
 ```

  - `pxlNavBridge.js` + `pxlNavContainer.jsx` first passes added to allow for React & Next usage with `pxlNav`
 <br/>&nbsp;&nbsp; - First pass added, to be updated for v0.0.29