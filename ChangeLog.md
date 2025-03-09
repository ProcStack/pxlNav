# pxlNav Change Log :: 0.0.27 - 0.0.28
---------------------

  - `package.json` prepping the repo for the Next.js + React.js projects to be added

  - `pxlNav.js` + `Environment.js` were never reaching load state for pxlRoom module
<br/>&nbsp;&nbsp; - Attempt to catch errors & check for methods added mostly to `Environment.js`

  - `Device.js` drops failed rejections in attempt a global catch for missed erroneous Promises / async 
<br/>&nbsp;&nbsp; - May error twice, but shouldn't error in the first place; saving potential heart ache.

---