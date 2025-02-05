# pxlNav Change Log :: 0.0.19 - 0.0.20
---------------------

 - Changed the example name from `FieldEnvironment` to `OutletEnvironment`
<br/>&nbsp;&nbsp; - It wasn't really a field anymore hah

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

 - `FileIO.js` has the begining's of spot light implementation
<br/>&nbsp;&nbsp; - Not in the scope of this version, to be added soon.

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