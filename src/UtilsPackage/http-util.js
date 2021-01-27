'use strict'
module.exports = class HttpUtil {
    constructor(){}
    static errorFirst(error){    
        let keys =Object.keys(error);
        for (let i = 0 ; i < keys.length;i++){
        let key = keys[i];
        let keyarray = error[key];
        return keyarray.message; 
        } 
    }
}