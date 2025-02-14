# pxlNav Change Log :: 0.0.20 - 0.0.21
---------------------

### Hotfix & Change
  - `FileIO.js` hotfix, camera locations were getting lower case'd then checking their scene object regular cased names
<br/>&nbsp;&nbsp; - This prevented camera positions from loading right if named incorrectly, with no information about naming
  - `FileIO.js` Camera positions & top level group names are now case-insensitive

---