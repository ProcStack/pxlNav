export const __webpack_id__=26;export const __webpack_ids__=[26];export const __webpack_modules__={26:(e,r,t)=>{function asyncGeneratorStep(e,r,t,o,n,i,s){try{var a=e[i](s),c=a.value}catch(e){return void t(e)}a.done?r(c):Promise.resolve(c).then(o,n)}function _asyncToGenerator(e){return function(){var r=this,t=arguments;return new Promise((function(o,n){var i=e.apply(r,t);function _next(e){asyncGeneratorStep(i,o,n,_next,_throw,"next",e)}function _throw(e){asyncGeneratorStep(i,o,n,_next,_throw,"throw",e)}_next(void 0)}))}}t.r(r),t.d(r,{MediaPipePlugin:()=>MediaPipePlugin});class MediaPipePlugin{constructor(){this.workerScriptUrl="./PoseEngine_worker.js",this.worker=null,this.booted=!1}static loadScriptWithProgress(e,r){return _asyncToGenerator((function*(){return new Promise(((t,o)=>{var n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="text",n.onprogress=e=>{if(e.lengthComputable&&"function"==typeof r){var t=Math.round(e.loaded/e.total*100);r(t)}},n.onload=()=>{if(200===n.status){var r=document.createElement("script");r.textContent=n.responseText,document.head.appendChild(r),t()}else o(new Error("Failed to load script: ".concat(e)))},n.onerror=()=>o(new Error("Network error while loading: ".concat(e))),n.send()}))}))()}init(e){var r=this;return _asyncToGenerator((function*(){try{console.log("Loading MediaPipe..."),yield MediaPipePlugin.loadScriptWithProgress("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",e),r.worker=new Worker(r.workerScriptUrl),r.booted=!0,console.log("MediaPipe Plugin Initialized")}catch(e){console.error("Error initializing MediaPipePlugin:",e)}}))()}sendMessage(e){this.booted?this.worker.postMessage(e):console.warn("MediaPipePlugin is not initialized.")}onMessage(e){this.worker?this.worker.onmessage=r=>e(r.data):console.warn("WebWorker not initialized.")}terminateWorker(){this.worker&&(this.worker.terminate(),this.worker=null,console.log("WebWorker terminated."))}}}};