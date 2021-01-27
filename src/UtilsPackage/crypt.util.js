'use strict'
const
  CryptoJS  = require('crypto-js'),
  config = require('../../config')

module.exports = class CryptoUtil{
  
  constructor() { }
 
  static encryptData(data) { 
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), config.cryptojs_key).toString();
    } catch (e) { 
    } 
  }

  static decryptData(data) { 
    try {
      const bytes = CryptoJS.AES.decrypt(data,config.cryptojs_key); 
      if (bytes.toString()) { 
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }else{
        return null;
      }
    } catch (e) {
      console.log(e);
    } 
  }
}