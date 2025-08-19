// Event Manager; Class determined event handling
//   Written by Kevin Edzenga; 2025
// -- -- -- -- -- -- -- -- -- -- -- -- --
//
// ** NOT INTEGRATED YET **
//
// This is a simple event manager for handling events.
//   Each pxlNav class will pass accepted events to this manager
//     Event types are determined in `Enums.js`
//
// `subscribe` - Subscribe to an event type
// `subscribeOnce` - Subscribe to an event type until the next trigger of the event type
// `subscribeTimeout` - Subscribe to an event type after a given time
// `subscribeInterval` - Subscribe to an event type at a given interval
//
// TODO : Requires fixes, specifics not here
//          First integration should be pxlNav/gui/HUD.js
//            Then gamepad + vr controls
// TODO : Upgrade global pxlNav callback & trigger events to use EventManager class
// TODO : Add async callback event handling


export class EventManager {
  constructor( ){
    this.pxlOptions = null;
    this.pxlEnums = null;
    this.pxlTimer = null;

    this.verbose = false;

    // Object based event handling
    //   Class Object -> Event type -> [ Callbacks ]

    // Complete class callback map
    this.events = new Map();

    // Run once and de-register callbacks
    this.singleTriggerEvents = new Map();

    // -- -- --

    // Time based event handling

    // Order by time left
    //   It's expected to be a small list at any given time
    this.triggerTimeoutTimes = [];
    this.triggerTimeouts = {};

    // Order by time left
    //   Key management is a bit more complex, Map for key management
    //     Further unit test benchmarking will be needed to determine if Map is faster than Object in this case
    this.triggerIntervalTimes = [];
    this.triggerIntervals = new Map();

    // -- -- --

    this.defaultMessage = {
      'type': -1, // Filled with pxlEnum on trigger
      'value': null
    }
  }

  // -- -- --

  setDependencies( pxlEnv ){
    this.pxlOptions = pxlEnv.pxlOptions;
    this.pxlEnums = pxlEnv.pxlEnums;
    this.pxlTimer = pxlEnv.pxlTimer;
  }

  log(...logger){
    if( this.pxlOptions.verbose >= this.pxlEnums.VERBOSE_LEVEL.INFO || this.verbose ){
      if( logger.length === 1 && typeof logger[0] === 'string' ){
        logger[0] = `-- pxlNav Event Manager -- \n${logger[0]}`;
      }else{
        console.log('-- pxlNav Event Manager --');
      }
      logger.forEach(( log )=>{ console.log(log); });
    }
  }

  error(...logger){
    if( this.pxlOptions.verbose >= this.pxlEnums.VERBOSE_LEVEL.ERROR || this.verbose ){
      if( logger.length === 1 && typeof logger[0] === 'string' ){
        logger[0] = `-- pxlNav Event Manager -- \n${logger[0]}`;
      }else{
        console.error('-- pxlNav Event Manager --');
      }
      logger.forEach(( log )=>{ console.error(log); });
    }
  }

  // Raw debug logging
  debug(...logger){
    if( this.pxlOptions.verbose >= this.pxlEnums.VERBOSE_LEVEL.DEBUG ){
      logger.forEach(( log )=>{ console.log(log); });
    }
  }

  // -- -- --

  getRuntime(){
    return this.pxlTimer.curMS - this.pxlTimer.bootMS;
  }

  // -- -- --

  // Keeping to class standards for pxlNav
  init(){}

  // Good ol' LSP; gotta be `Adventure Time`
  //   https://www.youtube.com/watch?v=2zwfxx94MIw
  step(){
    this.checkTimeouts();
    this.checkIntervals();
  }


  // -- -- --

  registerClass( eventClass ){
    if(  !eventClass.EVENTS ){
      this.log('Event class must have an EVENTS enum');
    }
    this.events.set( eventClass, new Map() );
    this.singleTriggerEvents.set( eventClass, new Map() );
  }

  // -- -- --

  subscribe( eventClass, eventType, callback ){
    if( !this.events.has(eventClass) ){
      this.log('Event class not registered');
    }
    let eventMap = this.events.get(eventClass);
    if( !eventMap.has(eventType) ){
      eventMap.set( eventType, [] );
    }
    eventMap.get( eventType ).push( callback );
  }

  unsubscribe( eventClass, eventType, callback ){
    if( !this.events.has( eventClass ) ) return;

    let eventMap = this.events.get(eventClass);
    if( !eventMap.has( eventType ) ) return;

    let callbacks = eventMap.get( eventType );
    eventMap.set( eventType, callbacks.filter(( cb )=>{ return cb !== callback; }) );
  }

  // -- -- --

  subscribeOnce( eventClass, eventType, callback ){
    if( !this.singleTriggerEvents.has(eventClass) ){
      this.log('Event class not registered');
    }
    let eventMap = this.singleTriggerEvents.get(eventClass);
    if( !eventMap.has(eventType) ){
      eventMap.set(eventType, []);
    }
    eventMap.get(eventType).push(callback);
  }

  // -- -- --

  subscribeTimeout( eventClass, eventType, callback, timeout ){
    let currentTime = this.getRuntime();
    let triggerTime = currentTime + timeout;

    this.triggerTimeoutTimes.push(triggerTime);
    this.triggerTimeouts[triggerTime] = { eventClass, eventType, callback };

    this.triggerTimeoutTimes.sort(( a, b )=>{ return a-b });
  }

  unsubscribeTimeout( eventClass, eventType, callback ){
    let triggerTimes = Object.keys(this.triggerTimeouts);
    triggerTimes.forEach(( triggerTime )=>{
      let { eventClass: ec, eventType: et, callback: cb } = this.triggerTimeouts[triggerTime];
      if( ec === eventClass && et === eventType && cb === callback ){
        delete this.triggerTimeouts[ triggerTime ];
        this.triggerTimeoutTimes = this.triggerTimeoutTimes.filter(( toTime )=>{ return toTime !== triggerTime });
      }
    });
  }

  checkTimeouts(){
    let currentTime = this.getRuntime();
    while( this.triggerTimeoutTimes.length > 0 && this.triggerTimeoutTimes[0] <= currentTime ){
      let triggerTime = this.triggerTimeoutTimes.shift();
      let { eventClass, eventType, callback } = this.triggerTimeouts[triggerTime];
      callback(currentTime);
      delete this.triggerTimeouts[triggerTime];
    }
  }

  // -- -- --

  subscribeInterval( eventClass, eventType, callback, timeInterval ){
    let currentTime = this.getRuntime();
    let triggerTime = currentTime + timeInterval;

    if( !this.triggerIntervals.has(eventClass) ){
      this.triggerIntervals.set( eventClass, new Map() );
    }
    let eventMap = this.triggerIntervals.get( eventClass );
    if( !eventMap.has(eventType) ){
      eventMap.set( eventType, [] );
    }
    eventMap.get(eventType).push({ callback, triggerTime });

    this.triggerIntervalTimes.push( triggerTime );
    this.triggerIntervalTimes.sort(( a, b )=>{ return a-b });
  }

  unsubscribeInterval( eventClass, eventType, callback ){
    if( this.triggerIntervals.has(eventClass) ){
      let eventMap = this.triggerIntervals.get(eventClass);
      if( eventMap.has(eventType) ){
        let callbacks = eventMap.get(eventType);
        eventMap.set(eventType, callbacks.filter( (cb) => cb.callback !== callback ) );
      }
    }
  }

  checkIntervals(){
    let currentTime = this.getRuntime();
    while( this.triggerIntervalTimes.length > 0 && this.triggerIntervalTimes[0] <= currentTime ){

      let triggerTime = this.triggerIntervalTimes.shift();
      let eventClasses = [ ...this.triggerIntervals.keys() ];
      eventClasses.forEach(( eventClass )=>{

        let eventMap = this.triggerIntervals.get( eventClass );
        let eventTypes = [ ...eventMap.keys() ];
        eventTypes.forEach(( eventType )=>{

          let callbacks = eventMap.get( eventType );
          let newCallbacks = callbacks.filter(( cb )=>{
            if( cb.triggerTime <= currentTime ){
              cb.callback(currentTime);
              return false;
            }
            return true;
          });
          eventMap.set( eventType, newCallbacks );

        });
      });
    }
  }

  // -- -- --

  buildMessage( type, value ){
    let message = Object.assign({}, this.defaultMessage);
    message.type = type;
    message.value = value;
    return message;
  }

  // -- -- --

  trigger( eventClass, eventType, ...args ){
    //let currentTime = this.getRuntime();

    // Run multi-trigger events
    if( this.events.has(eventClass) ){
      let eventMap = this.events.get(eventClass);
      if( eventMap.has(eventType) ){
        let message = this.buildMessage( eventType, args );
        eventMap.get( eventType ).forEach(( callback )=>{ this.triggerCallback( callback, message ).bind(this) });
      }
    }

    // Run single trigger events; then remove them
    if( this.singleTriggerEvents.has(eventClass) ){
      let eventMap = this.singleTriggerEvents.get(eventClass);
      if( eventMap.has(eventType) ){
        let message = this.buildMessage( eventType, args );
        eventMap.get( eventType ).forEach(( callback )=>{ callback( message ) });
        eventMap.delete( eventType );
      }
    }
  }

  triggerCallback( callback, message ){
    return new Promise(( resolve, reject )=>{
      try{
        callback( message );
        resolve();
      }catch( err ){
        this.error('pxlNav EventManager :: Error in callback', err);
        this.debug( callback );
        reject(err);
      }
    });
  }
}