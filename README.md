# pxlNav v1.0.0
Javascript Player Controller & Environment Manager for Three.js

#### Visit the [pxlNav Documentation](https://procstack.github.io/pxlNav-docs/)

**Since the docs are still being written,**
**<br>&nbsp;&nbsp; If you have any questions / feedback, feel free to join the [pxlNav Support](https://discord.gg/UqEY9mpZ9x) discord group.**

**Visit [procstack.github.io site](https://procstack.github.io/) to see camera location switching action.**

**Now with React & NextJS support, see `./src/next-react-dev` for project examples**

<p align='center'>
 <b>If you'd like to roam around a coastal environment,</b>
 <br/><sub>vvv&nbsp;&nbsp; </sub><b>visit <a href="https://procstack.github.io/Outlet.htm" alt="pxlNav Example The Outlet">procstack.github.io/Outlet.htm</a></b><sub>&nbsp;&nbsp; vvv</sub>
 <h5><a href="https://procstack.github.io/Outlet.htm"><img src='./docs/assets/pxlNav_The Outlet_2025-3-6_Coastline.webp' alt="pxlNav Example The Outlet" /></a></h5></p>

## <br/>**Index**
* [Install Files](#install-files)
* [Quick Links](#the-good-bits)
* [Intention For pxlNav](#intention)
* [In-Browser / Javascript Features](#in-browser--javascript-features)
* [3d Scene File Features](#features-added-through-your-cgi-program-of-choice)
* [Shader Editor Keyboard Shortcuts](#shader-editor-keyboard-shortcuts)
* [In-Progress Features](#work-in-progress-features)
<br/>

--------------------------------------------------------------------------------------------

## Install Files
 - `./dist/pxlNav.esm.js` - JS Module file
 - `./dist/pxlNavStyle.min.css` - CSS Style for things like Loading bar, Shader Editor, and more
 - `./dist/pxlNavLoader_basic.js` - Basic implementation of pxlNav; import, set options, and build.
 - `./examples/pxlNavLoader_switchSpace.js` - Basic implementation of a external trigger to swap room environments
 - `./dist/libs/three/...` - Some changes needed to be made to the FBXLoader.js file, please include the `libs` folder along side `pxlNav.esm.js` to run pxlNav

&nbsp;&nbsp; **CJS & UMD versions needs testing, see `./builds` for these versions.**
<br/>&nbsp;&nbsp; **Please bare with me while I work out any NPM packaging issues.**

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## The Good Bits
**Wanna see example rooms using 3d fbx files?**
<br/>&nbsp;&nbsp;&nbsp; [procstack.github.io Rooms](https://github.com/ProcStack/pxlNav/tree/main/examples/js/pxlRooms)

<br/>&nbsp;&nbsp;**For `pxlNav` Documentation -**
<br/>&nbsp;&nbsp;&nbsp;&nbsp;[pxlNav Documentation](https://github.com/ProcStack/pxlNav/tree/main/docs)

<br/>&nbsp;&nbsp;**For `pxlNav` changes between versions -**
<br/>&nbsp;&nbsp;&nbsp;&nbsp;[pxlNav Change Log](https://github.com/ProcStack/pxlNav/blob/main/ChangeLog.md)

<br/>&nbsp;&nbsp;`pxlNav` dev entry point is -
<br/>&nbsp;&nbsp;&nbsp;&nbsp;`./src/pxlNav.js`

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## Intention
`pxlNav` is an interactive layer built on top of Three.js' render engine.
<br/>Creating a framework which understands FBX files created with object tags set in Maya or Blender or *[Name your CGI program here]*.
<br/>Turning your 3d modeling software into a level editor for Three.js
<br/>
<br/>It's basically a game engine for Three.js

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## In-Browser / Javascript Features
&nbsp; _ **FPV Camera Control** on PC & Mobile
<br/>&nbsp; _ **Navigation using W,A,S,D or Arrow Keys**
<br/>&nbsp; _ Easily load any **FBX file** for a pxlRoom (Scene / Level) or Objects
<br/>&nbsp;&nbsp;&nbsp; \*FBXs are 3d scene files you can make in most CGI programs; like Maya or Blender 

<br/>&nbsp; _ **Animation Rig & Clip Files** are easily managed
<br/>&nbsp; _ A simple **Animation State Machine** to set the next **Clip**
<br/>&nbsp;&nbsp;&nbsp; \*Once the current animation clip finishes, set what the animating Rig/Object does next.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; Loop the clip infinitely, play a specific clip after, or pick a random clip from an array you set in javascript.

<br/>&nbsp; _ Pre-made **Particle Effects** or customize the particle system through Shaders
<br/>&nbsp;&nbsp;&nbsp; \*Pre-made particle effects - Billowing smoke, fire embers, floating environment dust, & snow with floor collider
<br/>&nbsp; _ **Motion Blur**, **Chromatic Aberrations**, multiple **Anti-Aliasing** options, & more premade **Post-Processes**
<br/>&nbsp;&nbsp;&nbsp;&nbsp; *( Off by default, available through `this.pxlEnv` )*
<br/>&nbsp; _ **OpenGL ES Shader Editor**
<br/>&nbsp;&nbsp;&nbsp; \*Hit `Y` in browser to open the Shader Editor with regex enabled [Keyboard Shortcuts](#shader-editor-keyboard-shortcuts) for easier editing

<br/>&nbsp; _ Subscribe to **Callback** events & run **Triggers** to listen or control pxlNav from outside of pxlNav.
<br/>&nbsp;&nbsp;&nbsp; \*You can subscribe & trigger your own custom events & code for your pxlRoom as well
<br/>&nbsp; _ Easily assign custom materials (like OpenGL ES Shaders) to objects in your FBX when the file loads.
<br/>&nbsp;&nbsp;&nbsp; \*Your object will be listed under the Shader Editor's `Edit Shader` pulldown.
*<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- `this` refers to your pxlRoom's Javascript object in code*
<br/>

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## Features added through your CGI program of choice
<br/>&nbsp; _ **Camera Position & Aim** initial locations and named locations you can warp to.
<br/>&nbsp; _ **Auto Camera Rails** 
<br/>&nbsp;&nbsp;&nbsp; \*Animated Camera Paths for Position, Look At, & Up for animation sequencing
<br/>&nbsp;&nbsp;&nbsp; *(Open Geometry or Nurb Curve)*

&nbsp; _ **Instanced geometry**
<br/>&nbsp;&nbsp;&nbsp; \*Instance individually to Locator/Null Objects; or in mass to every Vertex in an object
<br/>&nbsp; _ **Glowing Objects**
<br/>&nbsp; _ **Item Pickups**
<br/>&nbsp; _ **Jump Pads**

<br/>&nbsp; _ **Point-to-Point Warp Pads** *( Teleporters / Portals )*
<br/>&nbsp;&nbsp;&nbsp; \*Link a Collision Surface to a target Transform to move the user to once they step on the surface.
<br/>&nbsp; _ **Point-to-Room Warp Pads**
<br/>&nbsp;&nbsp;&nbsp; \*Move between other pxlRooms like changing game levels ( separate FBX files & javascript )

<br/>&nbsp; _ **Ground Collider Objects**
<br/>&nbsp;&nbsp;&nbsp; \*Floor terrain, things to jump on top of, floors of a building, and Walls to limit user movement.
<br/>&nbsp;&nbsp;&nbsp; 'Walls' being lack of a collider object under the player, preventing the users from walking off the ground.
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This gives an easy way to lock the user's camera due to environmental design,
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Like, if there was no collider under a named Camera Position, then warp to that location for a still camera shot.

<br/>&nbsp; _ **Clickable Objects to run javascript functions**
<br/>&nbsp; _ **Scriptable Objects**
<br/>&nbsp;&nbsp;&nbsp; \*Access these objects by their name in your pxlRoom's javascript code; `this.geoList[*Your_Object_Name*]`
*<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- `this` refers to your pxlRoom's Javascript object in code*
<br/>


##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## Shader Editor Keyboard Shortcuts
<p align='center'><img src='./docs/assets/glslScriptEditor.webp' alt="pxlNav Example The Outlet" /></p>

&nbsp; _ Browser default Copy, Cut, Paste, Undo, Redo, etc.
<br/>&nbsp; _ **`Enter`** - New lines use the existing indent type (Spaces or Tabs)
<br/>&nbsp; _ **`Ctrl + Enter`** - Update Shader on Material
<br/>&nbsp; _ **`Ctrl + D`** -  Duplicate current line
<br/>&nbsp; _ **`Ctrl + K`** - Comment current/selected lines
<br/>&nbsp; _ **`Ctrl + Shift + K`** - Uncomment current/selected lines
<br/>&nbsp; _ **`Ctrl + NumPad {1,2,3}`** - Add selection or '.0' into float(), vec2(), vec3()
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  Select `myVar` & Ctrl+3 -> `vec3(myVar)`
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  No Selection & Ctrl+2 -> `vec2(.0, .0)`
<br/>&nbsp; _ **`Ctrl + {Up,Down,Left,Right}`** - Quick search
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Searches for your current selection in that direction
<br/>&nbsp; _ Click off the editor -or- hit **`Y`** - To Open / Close the Shader Editor



##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------

## Work-in-Progress Features
&nbsp; _ **Third person control** is not easily available, access it through `this.pxlCamera`
<br/>&nbsp; _ No movement controls on **Mobile** yet
<br/>&nbsp;&nbsp;&nbsp; \*Mobile will use your Camera Position & Aim locators in your FBX file
<br/>&nbsp;&nbsp;&nbsp; \*If you add an Auto Camera Rail, it'll use that by default and loop the camera on the found Curve object

<br/>&nbsp; _ **Networking** as mostly been removed for safety concerns -
<br/>&nbsp;&nbsp;&nbsp; Avatars, WebCam Video Streaming, & Mic Audio, but it can be implemented through pxlNav `Extensions`
<br/>&nbsp;&nbsp;&nbsp; \*Enable specific extensions with `pxlNav.initExtension("Networking", *Your_Extension_Loaded_Callback*)`
<br/>&nbsp;&nbsp;&nbsp; \*The default socket messages for `Stream Elements` is currently set up in `./src/pxlNav/extensions/Networking.js`

<br/>&nbsp; _ **Music** & **Video** streams have no Callbacks & Triggers yet.
<br/>&nbsp;&nbsp;&nbsp; They can be enabled from your pxlRoom, but they will be converted into 'Extensions' soon, `this.pxlEnv.pxlAudio` &  `this.pxlEnv.pxlVideo`
<br/>&nbsp;&nbsp;&nbsp; \*Music can be streamed in through a .m3u link online
<br/>&nbsp;&nbsp;&nbsp; \*Video can be streamed most video bridge relays with accessable URLs, like Amazon Web Services' IVS generated stream URLs.
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; The video feed can be assigned to a material/shader like any other texture map in Three.js
<br/>&nbsp;&nbsp;&nbsp; \*Music & Video streams will attempt to reconnect automatically if a feed drops.
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Prioritizing any Audio found in Video Streams as the primary Audio Source to play in pxlNav.
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This means you can have a constant Music stream playing over the internet,
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Then interupt that Music feed by starting a Video Stream to your target video streaming service.
*<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- `this` refers to your pxlRoom's Javascript object in code*
<br/>

##### <p align="right">[^ Top](#index)</p>
--------------------------------------------------------------------------------------------
