// require(ActiveXObject("System.Text.UTF8Encoding"));
// require(ActiveXObject("System.Security.Cryptography.MD5CryptoServiceProvider"));
// require(ActiveXObject("System.Security.Cryptography.SHA1CryptoServiceProvider"));
// require(ActiveXObject("System.Security.Cryptography.SHA256CryptoServiceProvider"));
// require("../common/Utility.js");

/**
 * 変換系
 * @auther toshi2limu@gmail.com (toshi)
 */
var EncodeUtility = function EncodeUtility_constrcutor() {
};
(function EncodeUtility_factory(_this) {
	"use strict";
	
	var doc		= XUtility.createDOMDocument();
	var encorde	= new ActiveXObject("System.Text.UTF8Encoding");
	
	// 文字列→値
	function text2value(type, text) {
		var element = doc.createElement("temp");
		element.dataType		= type;						// 種別を設定
		element.text			= text;						// 変換元を設定
		var ret = element.nodeTypedValue;					// 値を取り出す
		element = null;
		return ret;
	};
	
	// 値→文字列
	function value2text(type, value) {
		var element = doc.createElement("temp");
		element.dataType		= type;						// 種別を設定
		element.nodeTypedValue	= value;					// 変換元を設定
		var ret = element.text;								// 値を取り出す
		element = null;
		return ret;
	};
	
	/**
	 * 「文字列」から「byte配列」へ変換
	 * @public
	 * @param {string} string	文字列(UTF-8)
	 * @return {Array}			byte配列
	 */
	_this.string2bytes = function EncodeUtility_string2bytes(string) {
		return encorde.GetBytes_4(string);
	};
	
	/**
	 * 「byte配列」から「文字列」へ変換
	 * @public
	 * @param {Array} bytes		byte配列
	 * @return {string}			文字列(UTF-8)
	 */
	_this.bytes2string = function EncodeUtility_bytes2string(bytes) {
		return encorde.GetString(bytes);
	};
	
	// 「byte配列」から「16進数文字列」
	_this.bytes2hex = function EncodeUtility_bytes2hex(bytes) {
		return value2text("bin.hex", bytes);
	}
	
	// 「16進数文字列」から「byte配列」
	_this.hex2bytes = function EncodeUtility_hex2bytes(hex) {
		return text2value("bin.hex", hex);
	}
	
	// 「byte配列」から「Base64文字列」
	_this.bytes2base64 = function EncodeUtility_bytes2base64(bytes) {
		return value2text("bin.base64", bytes);
	}
	
	// 「Base64文字列」から「byte配列」
	_this.base642bytes = function EncodeUtility_base642bytes(base64) {
		return text2value("bin.base64", base64);
	}
	
	function crypto(objname, bytes, type) {
		var provider = new ActiveXObject(objname);
		provider.ComputeHash_2(bytes);
		var hash = provider.Hash;
		provider.Clear();
		provider = null;
		
		type = (type)? type.toLowerCase(): "bin";
		switch (type) {
		case "hex":
			hash = value2text("bin.hex", hash);
			break;
		case "bin":
		default:
			break;
		}
		return hash;
	};
	
	// md5
	_this.md5 = function EncodeUtility_md5(bytes, type) {
		return crypto("System.Security.Cryptography.MD5CryptoServiceProvider", bytes, type);
	};
	
	// sha1
	_this.sha1 = function EncodeUtility_sha1(bytes, type) {
		return crypto("System.Security.Cryptography.SHA1CryptoServiceProvider", bytes, type);
	};
	
	// sha256
	_this.sha256 = function EncodeUtility_sha256(bytes, type) {
		return crypto("System.Security.Cryptography.SHA256CryptoServiceProvider", bytes, type);
	};
})(EncodeUtility);
