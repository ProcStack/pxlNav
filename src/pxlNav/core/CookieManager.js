/////////////////////////////////////
// pxlCookieManager -
//  Written by Kevin Edzenga; 2020, 2025
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
//  Read, Write, Clear, a Check if a cookie exists
//  Will prepend a given name to isolate cookies,
//    That said, cookies should be set per room if this is used in pxlNav
//      This way dynamic rooms can maintain
//        cookies between Networking rooms / Environments
//      This would be your "per room" user data
//    If not used in pxlNav, just provide a unique prefix to the constructor

/**
 * @alias pxlCookie
 * @class
 * @description Cookie management
 */

// This is only used for `CookieManager.log()`
//   Alter the verbose check in `log()` to make this file standalone
import { VERBOSE_LEVEL } from "./Enums.js";

/**
 * @alias pxlCookie
 * @class
 * @description CookieManager class for managing browser cookies with a specific prefix.
 * <br/>Provides methods to read, write, clear, and check the existence of cookies.
 * <br/>Handles value serialization, expiration, and path management.
 * 
 * Use this class if you want to store user data between sessions.
 */
export class CookieManager{
  /**
   * @memberof pxlCookie
   * @constructor
   * @description Creates an instance of CookieManager.
   * @param {boolean} [verbose=false] - Enable verbose logging.
   * @param {string} [prefix="pxlNav-"] - Prefix to prepend to all cookie names.
   * @param {string} [path="/"] - Path for which the cookie is valid.
   * @param {number} [expiration=30] - Number of days until the cookie expires.
   */
  constructor(verbose=false, prefix="pxlNav-", path="/", expiration=30){
    // Suffix name to help searching and avoid cookie name conflictions
    let prepPrepend= prefix.substring(-1)==="-" ? prefix : prefix+"-" ;
    this.prepend=prepPrepend; 
    this.verbose=verbose;
    
    // Days till expiration
    this.exp=expiration; 
    
    // Update this with the folder name from your domain
    this.path="path="+path; 
    
    // Do not edit this--
    //  This forces cookies to be removed when the expiration value
    //    is set prior to the current date
    this.deleteDate="expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    
    // If variables contain a ';'
    //   The variable will break the cookies for the site
    // Substitute ; with _%_
    this.sub="_%_";
  }

  // -- -- --

  // Simple logger with verbose check
  log( ...logger ){
    if( this.verbose >= VERBOSE_LEVEL.INFO ){
      console.log("-- Cookie Manager --");
      logger.forEach( (l)=>{ console.log(l); } );
    }
  }

  // -- -- --

  // Set expiration date for the new cookie
  /**
   * @method
   * @memberof pxlCookie
   * @function getExpiration
   * @description Returns the expiration string for a new cookie.
   * @returns {string} Expiration string for the cookie.
   */
  getExpiration(){ 
    let d = new Date();
    d.setTime( d.getTime() + (this.exp*24*60*60*1000) );
    return "expires=" + d.toGMTString() + ";";
  }

  // Is the cookie value equal to a given input?
  /**
   * @method
   * @memberof pxlCookie
   * @function isEqual
   * @description Checks if the value of a cookie is equal to a given input.
   * @param {string} cName - Cookie name (without prefix).
   * @returns {boolean} True if the cookie value matches the input.
   */
  isEqual( cName ){ 
    if( this.hasCookie(cName) ){
      this.log( cName );
      return this.readCookie( cName ) === this.variableToString( cName );
    }
    return false;
  }

  
  /**
   * @method
   * @memberof pxlCookie
   * @function getRegexp
   * @description Returns a RegExp to match cookies with the given name.
   * @param {string} cName - Cookie name (with or without prefix).
   * @returns {RegExp} Regular expression for matching the cookie.
   */
  getRegexp( cName ){
    return new RegExp( '(?=' + cName + ').*?((?=;)|(?=$))', 'g' );
  }

  // TODO : Validate this opposed to `getRegexp()`
  /**
   * @method
   * @memberof pxlCookie
   * @function getClearCookieRegexp
   * @description Returns a RegExp to match cookies for clearing.
   * @param {string} cName - Cookie name (with or without prefix).
   * @returns {RegExp} Regular expression for matching the cookie to clear.
   */
  getClearCookieRegexp( cName ){
    return new RegExp( '(?=' + cName + ').*?(?==)', 'g' );
  }

  // -- -- --
  
  // Read all of CookieManager's controlled cookies
  //   Returns a dictionary of `this.prepend` cookies
  /**
   * @method
   * @memberof pxlCookie
   * @function pullData
   * @description Reads all cookies managed by this CookieManager.
   * @returns {Object} Dictionary of cookie names and their values.
   */
  pullData(){ 
    let cur = document.cookie;
    let reg = this.getRegexp( this.prepend );
    let curCookies = cur.match( reg );
    
    let ret = {};
    if( curCookies ){
      curCookies.forEach( c =>{ 
        let cName = c.split("=")[0].replace(this.prepend,'');
        let cData = c.split("=")[1].replace(this.sub,';');
        ret[cName] = cData;
      });
    }
    
    return ret;
  }

  // -- -- --

  // Convert given value to a string
  
  /**
   * @method
   * @memberof pxlCookie
   * @function valueToString
   * @description Converts a given value to a string representation.
   * @param {any} val - Value to convert.
   * @returns {string} String representation of the value.
   */
  valueToString(val){ 
    let type = typeof(val);
    
    if( !isNaN(Number(val)) ){
      return val;
    }else if( type==="string" ){
      return "'" + val + "'";
    }else if( type==="boolean" ){
      return ( val ? "true" : "false" );
    }else if(val===null || val===undefined){ // Non-Strict Null Check; null===undefined true; null===undefined false
      return "null";
    }else if( isNaN(Number(val) )){
      return "NaN";
    }else{
      return val;
    }
  }

  // Convert a given variable to a string; account for arrays or not
  
  /**
   * @method
   * @memberof pxlCookie
   * @function variableToString
   * @description Converts a variable (including arrays) to a string representation.
   * @param {any} arr - Variable or array to convert.
   * @returns {string} String representation of the variable.
   */
  variableToString(arr){ 
    if( Array.isArray(arr) ){
      let ret = arr.map((x)=>{
        if( Array.isArray(x) ){
          return this.variableToString(x);
        }
        return this.valueToString(x);
      });
      return "[" + ret.join(",") + "]";
    }else{
      return this.valueToString( arr );
    }
  }

  // -- -- --

  // Check if a cookie exists
  
  /**
   * @method
   * @memberof pxlCookie
   * @function hasCookie
   * @description Checks if a cookie exists.
   * @param {string} cName - Cookie name (without prefix).
   * @returns {boolean} True if the cookie exists.
   */
  hasCookie( cName ){ 
    return document.cookie.includes( this.prepend + cName );
  }
  // Read the value of the cookie; returns string
  
  /**
   * @method
   * @memberof pxlCookie
   * @function readCookie
   * @description Reads the value of a cookie as a string.
   * @param {string} cName - Cookie name (without prefix).
   * @returns {string|null} Value of the cookie, or null if not found.
   */
  readCookie( cName ){ 
    if(this.hasCookie(cName)){
      let reg = this.getRegexp( this.prepend + cName );
      
      let val = document.cookie.match( reg )[0].split( "=" )[1].replace( this.prepend, '' ).replace( this.sub, ';' );
      
      return val;
    }
    return null;
  }
  // Read the value of the cookie; returns rectified value
  

  /**
   * @method
   * @memberof pxlCookie
   * @function parseCookie
   * @description Reads and parses the value of a cookie.
   * @param {string} cName - Cookie name (without prefix).
   * @returns {string|number|boolean|null} Parsed value of the cookie.
   */
  parseCookie( cName ){ 
    if( this.hasCookie(cName) ){
      let reg = this.getRegexp( this.prepend + cName );
      
      let val=document.cookie.match(reg)[0].split("=")[1].replace(this.prepend,'').replace(this.sub,';');
      
      if( val==="true" ){
        val = true;
      }else if( val==="false" ){
        val = false;
      }else if( parseInt(val)===val ){
        val=parseInt(val);
      }else if( parseFloat(val)===val ){
        val = parseFloat(val);
      }
      return val;
    }
    return null;
  }

  // -- -- --

  // Read all cookie entries with the given suffix
  

  /**
   * @method
   * @memberof pxlCookie
   * @function evalCookie
   * @description Evaluates the existence or value of cookies with the given suffix.
   * @param {string} [cName] - Cookie name (without prefix). If omitted, evaluates all managed cookies.
   * @returns {boolean} True if the cookie(s) exist.
   */
  evalCookie(cName){ 
    if( cName ){
      if( this.hasCookie(cName) ){
        let reg = this.getRegexp( this.prepend + cName );
        this.log("Eval Cookie has been limited, responce is: ");
        this.log(document.cookie.match(reg)[0].replace(this.prepend,'').replace(this.sub,';'));
        return true;
      }
      return false;
    }else{
      let reg = this.getRegexp( this.prepend );
      this.log( "Eval Cookie has been limited, may error." );
      document.cookie.match( reg ).forEach( e =>{ e.replace(this.prepend,'').replace(this.sub,';') });
      return true;
    }
  }

  // Set cookie value; setCookie( string, variable )
  /**
   * @method
   * @memberof pxlCookie
   * @function setCookie
   * @description Sets a cookie value.
   * @param {string} cName - Cookie name (without prefix).
   * @param {any} cData - Value to store in the cookie.
   */
  setCookie(cName, cData){ 
    cData = this.variableToString(cData);
    if( cData.replace ){
      cData.replace( ";", this.sub );
    }
    document.cookie = this.prepend + cName + "=" + cData + ";" + this.getExpiration() + this.path;
  }
  
  // Add dictionary keys and values to cookies
  /**
   * @method
   * @memberof pxlCookie
   * @function addDictionary
   * @description Adds multiple cookies from a dictionary.
   * @param {Object} cDict - Dictionary of key-value pairs to add as cookies.
   */
  addDictionary(cDict){ 
    let cKeys = Object.keys(cDict);
    for( let x=0; x<cKeys.length; ++x ){
      let cData = cDict[ cKeys[x] ];
      cData = this.variableToString(cData);
      if( cData.replace ){
        cData.replace( ";", this.sub );
      }
      document.cookie = this.prepend + cKeys[x] + "=" + cData + ";" + this.getExpiration() + this.path;
    }
  }
  
  // -- -- --

  // Parse Dict Values, Update if they exist
  //   Overwrites Input Dict
  // Returns if any items in the dict were set
  /**
   * @method
   * @memberof pxlCookie
   * @function parseDict
   * @description Parses and updates a dictionary with values from cookies if they exist.
   * @param {Object} cDict - Dictionary to update with cookie values.
   * @returns {boolean} True if any items in the dictionary were set from cookies.
   */
  parseDict(cDict){
    let keys = Object.keys( cDict );
    let ret = false;
    keys.forEach( (k)=>{
      if( this.hasCookie(k) ){
        cDict[k] = this.parseCookie(k);
        ret = true;
      }
    });
    return ret;
  }
  
  // -- -- --

  // Clear specific cookie entry
  /**
   * @method
   * @memberof pxlCookie
   * @function clearCookie
   * @description Clears a specific cookie or all managed cookies.
   * @param {string|string[]} [cName] - Cookie name(s) (without prefix) to clear. If omitted, clears all managed cookies.
   */
  clearCookie( cName ){ 
    if(!cName){
      let reg = this.getClearCookieRegexp( this.prepend );
      let curCookies = document.cookie.match( reg );
      curCookies.forEach( c =>{ document.cookie = c + "=;" + this.deleteDate + this.path; });
    }else{
      if( typeof(cName) === "string" ){
        cName=[cName];
      }
      cName.forEach( c =>{ document.cookie = c + "=;" + this.deleteDate + this.path; });
    }
  }
}
