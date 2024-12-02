# pxlNav
Javascript + Three.js player controller for first &amp; third person navigation.

**`pxlNav` is still being isolated into a package;**
<br/>**Please see the [procstack.github.io](https://github.com/ProcStack/procstack.github.io) repo for the current `pxlNav` status &amp; working example.**
<br/><br/>

### Features -
&nbsp;\_ **FPV Camera Control** on PC & Mobile
<br/>&nbsp;\_ **Navigation using W,A,S,D or Arrow Keys**
<br/>&nbsp;\_ Easily load any **FBX file** for a Room (Scene / Level) or Objects
<br/>&nbsp;&nbsp;&nbsp; \*FBXs are 3d scene files you can make in most CGI programs; like Maya or Blender 
<br/>&nbsp;\_ **Animation Rig & Clip Files** are easily managed
<br/>&nbsp;\_ A simple **Animation State Machine** to set the next **Clip**
<br/>&nbsp;&nbsp;&nbsp; \*Once the current animation clip finishes, set what the animating Rig/Object does next.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; Loop the clip infinitely, play a specific clip after, or pick a random clip from an array you set in javascript.
<br/>&nbsp;\_ **Motion Blur**, **Chromatic Aberrations**, & more premade **Post-Processes** *( Off by default, available through `this.pxlEnv` )*
<br/>&nbsp;\_ **Shader Editor**
<br/>&nbsp;&nbsp;&nbsp; \*Hit `Y` in browser to open the shader editor with regex added editing
<br/>&nbsp;\_ **Subscribe to Callback** & **Trigger** events through the top pxlNav module
<br/>&nbsp;&nbsp;&nbsp; \*You can subscribe & trigger your own custom events & code for your Room as well
<br/>



### Features added through your CGI program of choice -
&nbsp;\_ **Instanced geometry**
<br/>&nbsp;\_ **Camera Position & Aim**
<br/>&nbsp;\_ **Auto Camera Rails**
<br/>&nbsp;&nbsp;&nbsp; \*Animated Camera Paths for Position, Look At, & Up for animation sequencing
<br/>&nbsp;\_ **Glowing Materials**
<br/>&nbsp;\_ **Item Pickups**
<br/>&nbsp;\_ **Jump Pads**
<br/>&nbsp;\_ **Ground Collider Objects**
<br/>&nbsp;&nbsp;&nbsp; \*Floor terrain, things to jump on top of, walls to limit movement 
<br/>&nbsp;\_ **Point-to-Point Warp Pads** *( Teleporters / Portals )*
<br/>&nbsp;&nbsp;&nbsp; \*Link a Collision Surface to a target Transform to move the user to once they step on the surface.
<br/>&nbsp;\_ **Point-to-Room Warp Pads**
<br/>&nbsp;&nbsp;&nbsp; \*Move between other Rooms like changing game levels ( separate FBX files & javascript )
<br/>&nbsp;\_ **Clickable Objects to run javascript functions**
<br/>&nbsp;\_ **Scriptable Objects**
<br/>&nbsp;&nbsp;&nbsp; \*Access these objects by their name in your Room's javascript code; `this.geoList[*Your_Object_Name*]`
*<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- `this` refers to you Room's Javascript object in code*
<br/>



### Shader Editor Keyboard Shortcuts -
&nbsp;\_ Browser default Copy, Cut, Paste, Undo, Redo, etc.
<br/>&nbsp;\_ `Enter` - New lines use the existing indent type (Spaces or Tabs)
<br/>&nbsp;\_ `Ctrl + Enter` - Update Shader on Material
<br/>&nbsp;\_ `Ctrl + D` -  Duplicate current line
<br/>&nbsp;\_ `Ctrl + K` - Comment current/selected lines
<br/>&nbsp;\_ `Ctrl + Shift + K` - Uncomment current/selected lines
<br/>&nbsp;\_ `Ctrl + NumPad {1,2,3}` - Add selection or '.0' into float(), vec2(), vec3()
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  Select `myVar` & Ctrl+3 -> `vec3(myVar)`
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  No Selection & Ctrl+2 -> `vec2(.0, .0)`
<br/>&nbsp;\_ `Ctrl + {Up,Down,Left,Right}` - Quick search
<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Searches for your current selection in that direction
<br/>&nbsp;\_ Click off the editor & hit `Y` - To close the Shader Editor
