// pxlNav Networking
//   Written by Kevin Edzenga; 2024
//
// -- -- -- -- -- -- -- -- -- -- -- --
//
//  Since I ripped my networking implementation out of the main project,
//    I was worried of network holes and other security concerns.
//  So here is a barebones implementation of a networking class for Stream Elements.
//    Encase you want to run pxlNav as your v-tuber engine.
//
//  This module needs to be connected to the pxlNav.trigger and pxlNav.emit system.

import { ExtensionBase } from "./ExtensionBase.js";

// IO Dummy Class
class io {
  constructor(url, options) {
    this.url = url;
    this.options = options;
  }

  on(event, callback) {
    // Dummy implementation
  }

  emit(event, data) {
    // Dummy implementation
  }
}


export default class Networking extends ExtensionBase {
  constructor( socketio ){
    super("Networking");
    this.status=false;
    // AccessToken is grabbed from OAuth2 authentication of the account.
    this.accessToken = "";
    this.jwtToken ="";


    this.socket = io('https://www.www.com', {
      transports: ['websocket']
    });
  }

  init(){

    // Use this function to see what messages are recieved when running test events in OBS or Streamlabs or which ever streaming software you use.
    //   Look in the console for the event:##### submessages that come in for specific levels of events.
    this.socket.on('event', (data) => {
      console.log(data);
      // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-event
    });

    /*
    this.socket.on('event:test', (data) => {
      console.log(data);
      // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-event
    });
    
    this.socket.on('event:update', (data) => {
      console.log(data);
      // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
    });

    this.socket.on('event:reset', (data) => {
      console.log(data);
      // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
    });
    */


    // Default events --
    // Socket connected
    this.socket.on('connect', this.onConnect);
    // Socket unplugged
    this.socket.on('disconnect', this.onDisconnect);
    // Socket is the correct cat in the tubes
    this.socket.on('authenticated', this.onAuthenticated);
    // We don't accept dogs here sir
    this.socket.on('unauthorized', console.error);

  }

  onConnect() {
    console.log('Successfully connected to the websocket');
    //this.socket.emit('authenticate', {method: 'oauth2', token: this.accessToken});
    this.socket.emit('authenticate', {method: 'jwt', token: this.jwtToken});
  }

  onDisconnect() {
    console.log('Disconnected from websocket');
    this.status = false;
    this.onConnect()
  }

  onAuthenticated(data) {
    const {
      channelId
    } = data;
    console.log(`Successfully connected to channel ${channelId}`);
    this.status = true;
  }
}