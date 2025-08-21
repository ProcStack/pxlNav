/* eslint-disable */
self.onmessage = function (event) {
    let {type, data}=event.data;
    if ( type === "urlExists") {
        urlExists( data );
    }else{
        let ret={ type, data };
        self.postMessage( ret );
        self.close();
    }
};

function xmlHttp(){
    if( window.XMLHttpRequest ){
        return new XMLHttpRequest();
    }else if( window.ActiveXObject ){
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        }catch(e){
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
}

function urlExists( url ){
    let xhrRequest= xmlHttp();
    xhrRequest.open('HEAD', url, false);
    xhrRequest.send();
    
    let ret={
        type:"urlExists",
        data: ( xhrRequest.status<400 )
    };
    self.postMessage( ret );
    self.close();
}
