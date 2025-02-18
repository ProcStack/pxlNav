# pxlNav Change Log :: 0.0.23 - 0.0.24
---------------------

  - `FloatingDust.js` moved where the `offsetPos` uniform is applied in `FloatingDust()` so it acts as a world space offset rather than a 'seed' in space

  - `FileIO.js` added object position, rotation, & scale to instance-to-mesh

---

  - `HeightMap.js` added, a heightmap enabled particle system
  
  
<br/>&nbsp;&nbsp; - With particle system specific settings on `HeightMapSpawner().getSettings()` --
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `jumpHeightMult` - How high the particles will move in Y randomly
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `offsetPos` - Position offset before height map limited ground applied
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `windDir` - Same with other systems, constant direction added
<br/>&nbsp;&nbsp; - Set the height map to spawn your particles at, currently packs the height into RGB color channels -
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Red is 0-33%
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Green is 33-66%
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Blue is 66-100%
<br/>&nbsp;&nbsp; - Set the spawn map 0-1 grayscale or rgb, but the red channel is used for spawn area of particles
<br/>&nbsp;&nbsp; - For FBX bounding box settings, provide an object with floats-
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `obj.userData.SizeX`, `obj.userData.SizeY`, & `obj.userData.SizeZ`
<br/>&nbsp;&nbsp; - From `./examples/js/pxlRooms/OutletEnvironment/OutletEnvironment.js` --
<br/>&nbsp;&nbsp;&nbsp;&nbsp; ( `this.assetPath` is `./examples/js/pxlRooms/OutletEnvironment/Assets/` )
```
import { pxlEffects } from "../../pxlNav.esm.js";
const HeightMapSpawner = pxlEffects.pxlParticles.HeightMap;

builBugs(){

  [...]

  let systemName = "grassBugs";
  let grassBugsSystem = new HeightMapSpawner( this, systemName );

  let grassBugsSettings = grassBugsSystem.getSettings();

  // Set height map
  grassBugsSystem.setHeightMapPath( this.assetPath + "bug_heightMap.jpg" );

  // Set spawn map
  grassBugsSystem.setSpawnMapPath( this.assetPath + "bug_spawnMap.jpg" );

  let bugObj = null; // No reference object
  
  // Loaded from a null/locator in the FBX marked `userData.Scripted = true`
  //   The locator also has userData floats - `SizeX`, `SizeY`, `SizeZ`
  //     Used as the bounding box for the height & spawn maps
  if( this.geoList['Scripted'] && this.geoList['Scripted']['bugParticles_loc'] ){
    bugObj = this.geoList['Scripted']['bugParticles_loc'];
  }

  // Generate geometry and load texture resources
  grassBugsSystem.build( grassBugsSettings, bugObj );
}
```

---