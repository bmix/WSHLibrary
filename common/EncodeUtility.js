// require(ActiveXObject("System.Text.UTF8Encoding"));
// require(ActiveXObject("System.Security.Cryptography.MD5CryptoServiceProvider"));
// require(ActiveXObject("System.Security.Cryptography.SHA1CryptoServiceProvider"));
// require(ActiveXObject("System.Security.Cryptography.SHA256CryptoServiceProvider"));
// require("../common/Utility.js");

/**
 * 変換系
 * @auther toshi2limu@gmail.com (toshi)
 */
(function(global, factory) {
	global.EncodeUtility = global.EncodeUtility || factory();
})(this, function EncodeUtility_factory() {
	"use strict";
	
	var _this = void 0;
	_this = function EncodeUtility_constrcutor() {};
	
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
	_this.str2bin = function EncodeUtility_string2bytes(string) {
		return encorde.GetBytes_4(string);
	};
	
	/**
	 * 「byte配列」から「文字列」へ変換
	 * @public
	 * @param {Array} bytes		byte配列
	 * @return {string}			文字列(UTF-8)
	 */
	_this.bin2str = function EncodeUtility_bytes2string(bytes) {
		return encorde.GetString(bytes);
	};
	
	// 「byte配列」から「16進数文字列」
	_this.bin2hex = function EncodeUtility_bytes2hex(bytes) {
		return value2text("bin.hex", bytes);
	}
	
	// 「16進数文字列」から「byte配列」
	_this.hex2bin = function EncodeUtility_hex2bytes(hex) {
		return text2value("bin.hex", hex);
	}
	
	// 「byte配列」から「Base64文字列」
	_this.bin2base64 = function EncodeUtility_bytes2base64(bytes) {
		return value2text("bin.base64", bytes);
	}
	
	// 「Base64文字列」から「byte配列」
	_this.base642bin = function EncodeUtility_base642bytes(base64) {
		return text2value("bin.base64", base64);
	}
	
	function hash(objname, bytes, type) {
		var provider = new ActiveXObject(objname);
		
		if (Atom.isString(bytes)) {						// bytesが文字列(パス)指定の場合
			bytes = FileUtility.loadBinary(bytes);
		}
		if (bytes == null) {							// 値が未取得の時(ファイルなしor空ファイル)
			bytes = _this.str2bin("");					// 空のバイト配列を設定
		}
		provider.ComputeHash_2(bytes);
		var hashs = provider.Hash;
		provider.Clear();
		provider  = null;	// ActiveXObject開放
		bytes     = null;	// ファイルデータ開放
		
		var ret = hashs;
		type = (type)? type.toLowerCase(): "hex";
		switch (type) {
		case "str":
		case "string":
			ret = _this.bin2str(hashs);
			break;
		case "hex":
			ret = _this.bin2hex(hashs);
			break;
		case "base64":
			ret = _this.bin2base64(hashs);
			break;
		}
		hashs = null;
		return ret;
	};
	
	// md5
	_this.md5 = function EncodeUtility_md5(bytes, type) {
		return hash("System.Security.Cryptography.MD5CryptoServiceProvider", bytes, type);
	};
	
	// sha1
	_this.sha1 = function EncodeUtility_sha1(bytes, type) {
		return hash("System.Security.Cryptography.SHA1CryptoServiceProvider", bytes, type);
	};
	
	// 暗号化/復号化(Rijndael暗号)
	function crypto(enc, passBytes, srcBytes) {
		var crypt	= new ActiveXObject("System.Security.Cryptography.RijndaelManaged");
		
		// 共有キー設定
		var keyHash	= new ActiveXObject("System.Security.Cryptography.SHA256Managed");
		keyHash.ComputeHash_2(passBytes);
		crypt.Key = keyHash.Hash;
		keyHash.Clear();
		keyHash = null;
		
		// 初期化ベクター設定
		var ivHash = new ActiveXObject("System.Security.Cryptography.MD5CryptoServiceProvider");
		ivHash.ComputeHash_2(passBytes);
		crypt.IV = ivHash.Hash;
		ivHash.Clear();
		ivHash = null;
		
		// 暗号化/復号化
		var len	= value2text("bin.hex", srcBytes).length / 2
		var ts	= (enc)? crypt.CreateEncryptor(): crypt.CreateDecryptor();
		var destBytes = null;
		try {
			destBytes = transform.TransformFinalBlock(srcBytes, 0, len);
		} catch (e) {}		// 復号化失敗など
		crypt.Clear();
		crypt = ts = null;
		
		return destBytes;
	};
	
	// 「byte配列」暗号化(Rijndael暗号)
	_this.encrypt = function EncodeUtility_encrypt(passBytes, srcBytes) {
		return crypto(true, passBytes, srcBytes);
	};
	
	// 「byte配列」復号化(Rijndael暗号)
	// 復号化に失敗すると、nullを返すことがある(値を返したからと言って成功したとは限らない)
	_this.dencrypt = function EncodeUtility_decrypt(passBytes, srcBytes) {
		return crypto(false, passBytes, srcBytes);
	};
	
	return _this;
});
