# pxlNav Change Log :: 0.0.26 - 0.0.27
---------------------


  - `Camera.js` Look invert was implemented in `Device.js`, then removed to be moved into `Camera.js` but never got in there; added.

  - `Device.js` + `Camera.js` made mobile move & look controls ~20% more sensitive

  - `Options.js` + `Device.js` added `pxlOptions.overscan.pc` & `pxlOptions.overscan.mobile`
<br/>&nbsp;&nbsp; - Overscan is applied in `Device.js` --

```
// Scale the screen's base resolution
 screenXY = XYres * this.pxlQuality.screenResPerc * overscan;

// Then scale back down in css -
 transform: scale( 1/overscan );
```

 - `Devices.js` screen resize now emits the raw `window.innerWidth` and `window.innerHeight`

 ```
    emitMessage --
      Event Type - "resize"
      Event Value - {
        "rawWidth" - window.innerWidth
        "rawHeight" - window.innerHeight
        "width" - pxlNav render width - window.innerWidth * renderScale
        "height" - pxlNav render height - window.innerHeight * renderScale
        "xPixelPerc" - 1 / render width
        "yPixelPerc" - 1 / render height
        "aspectRatio" - render width / render height
      }
```

 - `OutletEnvironment` updated with shader changes and a lighthouse