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
 * @namespace pxlCookie
 * @description Cookie management
 */

// This is only used for `CookieManager.log()`
//   Alter the verbose check in `log()` to make this file standalone
import { VERBOSE_LEVEL } from "./Enums.js";

export class CookieManager{
  constructor(verbose=false, prefix="pxlNav-", path="/", expiration=30){
    // Suffix name to help searching and avoid cookie name conflictions
    let prepPrepend= prefix.substring(-1)=="-" ? prefix : prefix+"-" ;
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
  getExpiration(){ 
    let d = new Date();
    d.setTime( d.getTime() + (this.exp*24*60*60*1000) );
    return "expires=" + d.toGMTString() + ";";
  }

  // Is the cookie value equal to a given input?
  isEqual( cName ){ 
    if( this.hasCookie(cName) ){
      this.log( cName );
      return this.readCookie( cName ) == this.variableToString( cName );
    }
    return false;
  }

  getRegexp( cName ){
    return new RegExp( '(?=' + cName + ').*?((?=;)|(?=$))', 'g' );
  }

  // TODO : Validate this opposed to `getRegexp()`
  getClearCookieRegexp( cName ){
    return new RegExp( '(?=' + cName + ').*?(?==)', 'g' );
  }

  // -- -- --
  
  // Read all of CookieManager's controlled cookies
  //   Returns a dictionary of `this.prepend` cookies
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
  valueToString(val){ 
    let type = typeof(val);
    
    if( !isNaN(Number(val)) ){
      return val;
    }else if( type=="string" ){
      return "'" + val + "'";
    }else if( type=="boolean" ){
      return ( val ? "true" : "false" );
    }else if(val==null){ // Non-Strict Null Check; null==undefined true; null===undefined false
      return "null";
    }else if( isNaN(Number(val) )){
      return "NaN";
    }else{
      return val;
    }
  }

  // Convert a given variable to a string; account for arrays or not
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
  hasCookie( cName ){ 
    return document.cookie.includes( this.prepend + cName );
  }
  // Read the value of the cookie; returns string
  readCookie( cName ){ 
    if(this.hasCookie(cName)){
      let reg = this.getRegexp( this.prepend + cName );
      
      let val = document.cookie.match( reg )[0].split( "=" )[1].replace( this.prepend, '' ).replace( this.sub, ';' );
      
      return val;
    }
    return null;
  }
  // Read the value of the cookie; returns rectified value
  parseCookie( cName ){ 
    if( this.hasCookie(cName) ){
      let reg = this.getRegexp( this.prepend + cName );
      
      let val=document.cookie.match(reg)[0].split("=")[1].replace(this.prepend,'').replace(this.sub,';');
      
      if( val=="true" ){
        val = true;
      }else if( val=="false" ){
        val = false;
      }else if( parseInt(val)==val ){
        val=parseInt(val);
      }else if( parseFloat(val)==val ){
        val = parseFloat(val);
      }
      return val;
    }
    return null;
  }

  // -- -- --

  // Read all cookie entries with the given suffix
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
  setCookie(cName, cData){ 
    cData = this.variableToString(cData);
    if( cData.replace ){
      cData.replace( ";", this.sub );
    }
    document.cookie = this.prepend + cName + "=" + cData + ";" + this.getExpiration() + this.path;
  }
  
  // Add dictionary keys and values to cookies
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
  clearCookie( cName ){ 
    if(!cName){
      let reg = this.getClearCookieRegexp( this.prepend );
      let curCookies = document.cookie.match( reg );
      curCookies.forEach( c =>{ document.cookie = c + "=;" + this.deleteDate + this.path; });
    }else{
      if( typeof(cName) == "string" ){
        cName=[cName];
      }
      cName.forEach( c =>{ document.cookie = c + "=;" + this.deleteDate + this.path; });
    }
  }
}
