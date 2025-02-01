// pxlNav GamePad Controller
//   Written by Kevin Edzenga; 2025
// -- -- -- -- -- -- -- -- -- -- -- -- --
//
// This is a simple controller for gamepads.
//   It will emit events for button presses & axial movement.


export default class Controller {
  constructor(){
    this.enabled = false;

    // Gamepad Deadzone
    //   Allows for some drift in the controller's thumbsticks
    //     Drift is a common issue, make sure this is set above 0
    this.deadZone = 0.15;

    // -- -- --

    // Input Gamepads
    this.controllers = {};

    this.eventTypes = [ "buttonPress", "axisMove", "connect", "disconnect" ];

    // Standard callback key-value dict
    this.callbacks = {};

  }

  init(){
    let hasSSL = this.checkSSL();
    if( !hasSSL ){
      console.error("GamePad Controller requires SSL for security reasons.");
      return;
    }

    // Trigger when a gamepad is connected
    window.addEventListener( "gamepadconnected", (e) => this.connectHandler(e) );

    // Trigger when a gamepad is disconnected
    window.addEventListener( "gamepaddisconnected", (e) => this.disconnectHandler(e) );

    this.step();

    this.enabled = true;
  }
  
  // Most browers require SSL for GamePad API, yet is still experimental as of Janurary 2025
  //   As I look at my chrome running 132, and was required in chrome version 86
  //     This will likely be required for all browsers in the near future;
  //       Locking in the security for the API
  checkSSL(){
    return window.location.protocol === "https:";
  }

  // -- -- --

  step(){
    this.scanGamepads();
    let controllerKeys = Object.keys(this.controllers);
    controllerKeys.forEach(( index ) => {
      this.handleInputs( this.controllers[index] );
    });
  }
  
  // -- -- --

  connectHandler( event ){
    let gamepad = event.gamepad;
    this.controllers[ gamepad.index ] = gamepad;
    console.log( gamepad );
    this.emit( "connect", { 'id': gamepad.id, 'index': gamepad.index } );
  }

  disconnectHandler( event ){
    let gamepad = event.gamepad;
    delete this.controllers[gamepad.index];
    this.emit( "disconnect", { id: gamepad.id, index: gamepad.index } );
  }

  // -- -- --

  scanGamepads(){
    let gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let controllerKeys = Object.keys(this.controllers);
    for( let x=0; x<gamepads.length; ++x ){
      if( gamepads[x] ){
        let curIndex = gamepads[x].index;
        if( !controllerKeys.includes( curIndex ) ){
          this.controllers[ curIndex ] = gamepads[x];
        }else{
          this.controllers[ curIndex ] = gamepads[x];
        }
      }
    }
  }

  // -- -- --

  handleInputs( controller ){
    controller.buttons.forEach((button, index) => {
      if (button.pressed) {
        this.emit("buttonPress", { index, value: button.value, controller });
      }
    });

    controller.axes.forEach((axis, index) => {
      if( Math.abs(axis) > this.deadZone ){
        this.emit("axisMove", { index, value: axis, controller });
      }
    });
  }

  // -- -- --

  subscribe( eventType, callback ){
    if( !this.eventTypes.includes( eventType ) ){
      console.error( "Event type not subscribable: ", eventType );
      return;
    }
    if( !this.callbacks[ eventType ] ) {
      this.callbacks[ eventType ] = [];
    }
    this.callbacks[ eventType ].push( callback );
  }

  unsubscribe( eventType, callback ){
    if( this.callbacks[eventType] ){
      let index = this.callbacks[eventType].indexOf( callback );
      if( index >= 0 ){
        this.callbacks[ eventType ].splice( index, 1 );
      }
    }
  }

  // -- -- --

  emit( eventType, data ){
    if( this.callbacks.hasOwnProperty(eventType) ){
      this.callbacks[ eventType ].forEach( (callback) => callback(data) );
    }
  }
}
