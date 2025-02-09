# pxlNav Change Log :: 0.0.19 - 0.0.20
---------------------

### Major Changes
  - `pxlNav` no longer has chunks, single file output `pxlNav.esm.js`
    - `pxlNav.cjs.js` & `pxlNav.umd.js` haven't been tested, only ~40kb each; *WIP*
  - `FileIO.js` Implemented model & instance-to-mesh LODs
  - `ParticleBase.js` has `shaderSettings` object to make working with an particles easier
  - To see how the 2 LOD types work, open this FBX in a CGI program ->
<br/>&nbsp;&nbsp;&nbsp;&nbsp; `./examples/js/pxlRooms/OutletEnvironment/Assets/OutletEnvironment.fbx`

---


### All Changes

 - Changed the example name from `FieldEnvironment` to `OutletEnvironment`
<br/>&nbsp;&nbsp; - It wasn't really a field anymore hah
 - `OutletEnvironment` had a major facelift while implementing the below features

---


 - `webpack.config.js` + `./builds` + `./dist` the pxlNav files were being chunked before due to `three.js` being taken for the compression ride some versions back.  Updated to single file output per version.
 <br/>&nbsp;&nbsp; _This will change again when togglable `extensions` are added for `pxlNav`
 <br/>&nbsp;&nbsp; _Tests for `umd` + `cjs` still don't exist, but the files seem tied to `esm`

---

 - `Options.js` now has `allowStaticRotation` for allowing click + drag to static cameras
<br/>&nbsp;&nbsp; - `pxlOptions.allowStaticRotation = false` by default

---

 - `Enums.js` + `Options.js` now has `VERBOSE_LEVEL.DEBUG` for dumping all logging data
<br/>&nbsp;&nbsp; - You can still use the verbose flag when loading FBXs from your pxlRoom without being in debug mode
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `this.pxlFile.loadRoomFBX( this, null, null, true );`

 - `pxlNav.js` + `Environment.js` + `QualityController.js` + `Devices.js` better asset and post-process handling
<br/>&nbsp;&nbsp; - It no longer loads all the assets for the optional post-process passes
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Still needs updates to handle loading during a run, but can be set through `pxlOptions.postProcessPasses`

---

 - `Utils.js` bug preventing texture mods from being applied has been fixed

---

 - `Device.js` bug preventing looking around in firefox fixed with missed `canvas.requestPointerLock().catch(err)`

---

 - `FloatingDust.js` third argument has been removed
```
   FloatingDust( room=null, systemName='floatingDust' )
```
 - `ParticleBase.js` + `FloatingDust.js` + `BillowSmoke.js` + `EmberWisps.js` changed over to using a "settings" object to maintain all of the particle emitter code data.
<br/>&nbsp;&nbsp; - `this.build()` functions accept a `this.shaderSettings={}` object --
 ```
  let dustSystem = new FloatingDust( this, systemName );

  let dustSystemSettings = dustSystem.getSettings();
  dustSystemSettings["vertCount"] = 300;

  dustSystem.build( dustSystemSettings );
```

 - `ParicleBase.js` & Extentions now have `this.shaderSettings` to hold the settings & used with `this.build( *shaderSettings* )`
<br/>&nbsp;&nbsp; - Request a particle systems settings with `particleSystem.getSettings()`
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `pxlEffects.pxlParticles.FloatingDust.getSettings()`
<br/>&nbsp;&nbsp; - All particle systems have this; But `FloatingDust()` has the most functionality -
 ```
  let systemName = "floatingDust";
  let dustSystem = new FloatingDust( this, systemName );
  let dustSystemSettings = dustSystem.getSettings();

  // Default Values -
    dustSystemSettings = {
      "vertCount" : 1000,
      "pScale" : 7,
      "pOpacity" : 1.0,
      "proxDist" : 200,
      "atlasRes" : 4,
      "atlasPicks" : [],
      "randomAtlas" : true,
      "additiveBlend" : false,

      "windDir" : new Vector3( 0, 0, 1 ),
      "offsetPos" : new Vector3( 0, 0, 0 ),

      "hasLights" : false,
      "fadeOutScalar" : 1.59 , 
      "wanderInf" : 1.0 , 
      "wanderRate" : 1.0 , 
      "wanderFrequency" : 2.85 
    };
```
  
---


  - `ParticleBase.js` + `FloatingDust.js` support RGBA single texture maps -or- RGB+A 2 texture maps
```
  // RGB + Alpha Maps
    dustSystem.setAtlasPath( "sprite_dustLiquid_rgb.jpg", "sprite_dustLiquid_alpha.jpg" );

  // Single PNG with RGBA
  //   A PNG from your room's `Assets` folder -
    dustSystem.setAtlasPath( this.assetPath + "YourTextureAtlas.png" );
```

 - `FloatingDust.js` & `SnowFall.js` swapped `pOffset` & `wind` flag places, easier to use
```
  FloatingDust.build( vertexCount=1000, pScale=7, proxDist=null, wind=[0.0,1.0], pOffset=[0.0,0.0], atlasPicks=null, randomAtlas=true, setAdditive=false ){}
  SnowFall.build( vertexCount=1000, pScale=7, proxDist=120, wind=[0.0,1.0], pOffset=[0.0,0.0,0.0], atlasPicks=null, randomAtlas=true ){}
```

    

---

 - `FileIO.js` has the begining's of spot light implementation
<br/>&nbsp;&nbsp; - Not in the scope of this version, to be added soon.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - FBXs have limited support for Spotlights in general

 - `FileIO.js` now supports LODs in your instance objects in your scene FBX
<br/>&nbsp;&nbsp; - Support for N-number of LOD levels, simply add User-Details / Parameters -
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `instLOD1` ; String of your `Instance` mesh name to use at this level
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `instLOD1Dist` ; Distance to trigger this level
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `instLOD1Skip` ; Verts count to skip over spawning the instance to the points of this mesh

<br/>&nbsp;&nbsp; - Simply update the `*` to the desired number LOD you are making the parameter for
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `instLOD*` ; `instLOD*Dist` ; `instLOD*Skip` ; 

<br/>&nbsp;&nbsp; - With 2 methods of assigning your base instance mesh inst-to-mesh
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Use a child mesh as the instance-base mesh to use as point locations
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - No child mesh and set `Skip` number to reduce how many verts as skipped when creating the LOD instance-base mesh. 

<br/>&nbsp;&nbsp; - For mesh LODs, put the LOD as children under your instance-to-mesh objects
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Your object-mesh with the `Instance` parameter is the parent transform.
<br/>&nbsp;&nbsp; - Add a float User Detail of - `instLOD1Dist`, `instLOD2Dist`,  `instLOD[...]Dist`
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Float value is the distance the LOD level displays at


---


 - `uv_RelativeOffsetLookup_rgOnly.jpg` & `Noise_Soft3d.jpg` didn't tile seamlessly
 - Many `pxlAssets` reduced in size & cleaned up for need / file organization