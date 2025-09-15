// pxlNav Timer
//   Written by Kevin Edzenga; 2020,2024,2025
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//  Since there are a few different ways to calculate `deltaTime` in a runtime loop,
//    This take the time difference at the begining of the runtime loop step()
//      Incorporating real time user input detection, independent of frame rendering
//        Running at "browser animation frame" time
//
//  This may change in the future, since input detection and frame calculations run
//    While frame renders are locked to a given frame rate
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//  For runtime clock and time-based operations
//    Current time - `pxlNav.pxlTimer.curMS`
//    Delta time between frames - `pxlNav.pxlTimer.deltaTime`
//    An averaged delta time between frames - `pxlNav.pxlTimer.avgDeltaTime`
//      By default, averaging is 0.7 -
//        `this.avgDeltaTime = PreviousDeltaTime * (1.0-avgDeltaRate) + CurrentDeltaTime * avgDeltaRate`
//      This provides a blending between the absolute delta times, so this easing isn't a "lingering" blending
//        Averaging only takes into considering the prior 3 frames, being 2 delta times
//
//  When blending (Lerp / Slerp) operations,
//    Blending with deltaTime will cause a stuttering effects or mis-matched rates
//      Situations could arrise where `Value * deltaTime` may go above 1.0
//        This will cause blending (Lerp / Slerp) to blend instantly to the target value
//  To remedy this, pass your 'rate' for blending to -
//    deltaTime - `pxlNav.timer.getLerpRate( rate )`
//      -or-
//    avgDeltaTime - `pxlNav.timer.getLerpAvgRate( rate )`
//  This will return a deltaTime influenced rate using -
//    `1.0 - Math.pow( 0.5, deltaTime * rate )`
//      Providing a scalled rate better for blending operations



import { Vector2 } from "three";

/**
 * @alias pxlTimer
 * @class
 * @description Timer and time management
 * <br/>Automatically managed when `pxlNav` is not paused.
 * 
 * From your pxlRoom, you can access the current time and delta times with:
 * <br/>`this.msRunner.x` - Current time in milliseconds since initialization
 * <br/>`this.msRunner.y` - Delta time in milliseconds since the last frame
 * 
 * You do not need to run `this.pxlTimer.curMS` to get the current time, as `this.msRunner.x` is automatically updated in your room.
 */
export class Timer{
  /**
   * Initializes a new instance of the Timer class.
   *
   * @constructor
   * @property {boolean} booted - Indicates if the timer has completed booting.
   * @property {boolean} active - Indicates if the timer is currently active.
   * @property {Vector2} msRunner - Stores timing information as a Vector2.
   * @property {number} curMS - Read-Only; Current time in milliseconds since the last frame update.
   * @property {number} prevMS - Time in milliseconds at the previous frame update.
   * @property {number} runtime - Read-Only; Time in milliseconds since the timer was initialized.
   * @property {number} msLog - Log of milliseconds.
   * @property {number} fpsStats - Stores frames per second statistics.
   * @property {number} deltaTime - Time elapsed between the current and previous frame, in seconds.
   * @property {number} avgDeltaTime - Averaged delta time, in seconds.
   * @property {number} [avgDeltaRate=0.7] - Rate used for averaging delta time.
   */
  constructor(){
    this.active=false;
    this.msRunner=new Vector2(0,0);
    this.msLog=0;
    this.fpsStats=-1;
    
    this._msRate = 0.001; // MS to Seconds
    this.baseRate = 0.001; // MS to Seconds

		let msTime=new Date().getTime() * this._msRate; // Current time in seconds
    this._bootMS=msTime;
    this._prevWorldMS=msTime;
		this._curMS=msTime;
    this._prevMS=msTime;
    this.deltaTime=0;
    this.avgDeltaTime=0;

    this.avgDeltaRate = 0.7;  // Rate of averaging prior delta time with current delta time

    
    this.videoFeeds=[];
    this.booted=false;
  }
  
  // Reset pxlNav clock
  //   Benchmarking steps the timer
  init(){
    if(!this.booted){
      this.prevMS=this.curMS;
      this.msRunner.x=0;
      this.msRunner.y=0;
      this.step();
      this.booted=true;
    }
  }
  
  get runtime(){
    return this._curMS-this._bootMS;
  }

  get curMS(){
      return this._curMS;
  }
  updateTime(){
      this._curMS=new Date().getTime() * this._msRate;
  }
  
  get prevMS(){
      return this._prevMS;
  }
  set prevMS( val ){
      this._prevMS=val;
  }
  
  // -- -- --
  
  // Scale the time rate
  //   Since time is scaled, 
  /**
   * @method
   * @memberof pxlTimer
   * @function scaleTime
   * @description Scale the time rate of `pxlNav`
   * @param {number} scale Multiplier value
   */
  scaleTime( scale ){
    this._msRate=this.baseRate*scale;
  }

  // -- -- --
  
  /**
   * @method
   * @memberof pxlTimer
   * @function start
   * @description Start pxlNav's timer; alias for `play()`
   */
  start(){
    this.play();
  }
  
  /**
   * @method
   * @memberof pxlTimer
   * @function pause
   * @description Pause pxlNav's timer. If no state is provided, it will toggle the current active state.
   * @param {boolean|null} [state=null] If `null`, toggle the current state. If `true` or `false`, set the state directly.
   * @returns {boolean} The current active state after the operation.
   */
  pause( state=null){
    if( state === null ){
      this.active=!this.active;
    }else{
      this.active=!!state;
    }
    return this.active;
  }
  
  /**
   * @method
   * @memberof pxlTimer
   * @function play
   * @description Run pxlNav's timer, alias for `start()`
   * @returns {boolean} The current active state after the operation.
   */
  play(){
    this.active=true;
    return this.active;
  }
  
  /**
   * @method
   * @memberof pxlTimer
   * @function stop
   * @description Stop pxlNav's timer.
   * @returns {boolean} The current active state after the operation.
   */
  stop(){
    this.active=false;
    return this.active;
  }
  
  /**
   * @method
   * @memberof pxlTimer
   * @function toggleMSLog
   * @description Toggle the millisecond console logging state between `0` (off) and `1` (on).
   */
  toggleMSLog(){
    this.msLog=(this.msLog+1)%2;
  }

  // -- -- --
  
  // Run time step calculations
  /**
   * @memberof pxlTimer
   * @function step
   * @description Run frame calculations for pxlNav's timer. *(Automatic when pxlNav is not paused)*
   * @returns {void}
   */
  step(){
    let prevTime = this._curMS; 
		this.updateTime();

    // If the time was stepped multiple times in a single frame, ignore the step
    if( this._curMS === prevTime ){
      this._curMS = prevTime;
      return;
    }

		this.prevMS=prevTime;
        
    if(this.fpsStats!==-1){
      this.fpsStats.update();
    }
    

    let msDelta= this.curMS - this.prevMS;

    this.avgDeltaTime = this.deltaTime * (1.0-this.avgDeltaRate) + msDelta * this.avgDeltaRate;
    this.deltaTime = msDelta;
    this.msRunner.x += (msDelta>0?msDelta:0);
    this.msRunner.y = this.avgDeltaTime; // Prior-frame biased delta time
  }

  // -- -- --

  // In the case of changing rates of a Lerp,
  //  This will return a "deltaTime" influenced lerp rate
  // Note: Using deltaTime alone will cause a missmatch for your lerp rate
  /**
   * @memberof pxlTimer
   * @function getLerpRate
   * @description Get a deltaTime influenced rate for blending (Lerp / Slerp) operations. This helps prevent stuttering or mis-matched rates when using deltaTime directly.
   * @param {number} rate 
   * @returns {number}
   */
  getLerpRate( rate ){
    return 1.0 - Math.pow( 0.5, this.deltaTime * rate );
  }

  // If the Average Delta Time works better for your needs --
  /**
   * @memberof pxlTimer
   * @function getLerpAvgRate
   * @description Get an avgDeltaTime influenced rate for blending (Lerp / Slerp) operations. This helps prevent stuttering or mis-matched rates when using avgDeltaTime directly.
   * @param {number} rate 
   * @returns {number}
   */
  getLerpAvgRate( rate ){
    return 1.0 - Math.pow( 0.5, this.avgDeltaTime * rate );
  }

}