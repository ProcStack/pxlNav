"use strict";(self.webpackChunkpxlNav=self.webpackChunkpxlNav||[]).push([[124,944],{124:(t,s,e)=>{e.r(s),e.d(s,{ExtensionBase:()=>ExtensionBase});class ExtensionBase{constructor(){this.active=!1,this.verbose=!1,this.callbacks={}}init(){}start(){this.active=!0}pause(){this.stop()}stop(){this.active=!1}subscribe(t,s){this.callbacks[t]||(this.callbacks[t]=[]),this.callbacks[t].push(s)}unsubscribe(t,s){this.callbacks[t]&&(this.callbacks[t]=this.callbacks[t].filter((t=>t!==s)))}emit(t,s){this.callbacks[t]&&this.callbacks[t].forEach((t=>t(s)))}destroy(){this.disable()}}},944:(t,s,e)=>{e.r(s),e.d(s,{default:()=>Networking});var c=e(124);class Networking extends c.ExtensionBase{constructor(t){this.status=!1,this.accessToken="",this.jwtToken="",this.socket=io("https://www.www.com",{transports:["websocket"]})}init(){socket.on("event",(t=>{console.log(t)})),socket.on("connect",onConnect),socket.on("disconnect",onDisconnect),socket.on("authenticated",onAuthenticated),socket.on("unauthorized",console.error)}onConnect(){console.log("Successfully connected to the websocket"),socket.emit("authenticate",{method:"jwt",token:this.jwtToken})}onDisconnect(){console.log("Disconnected from websocket"),this.status=!1,onConnect()}onAuthenticated(t){var{channelId:s}=t;console.log("Successfully connected to channel ".concat(s)),this.status=!0}}}}]);