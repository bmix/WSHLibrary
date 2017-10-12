/**
 * 変換
 * @auther toshi2limu@gmail.com (toshi)
 */
(function(factory) {
	global.EncodeUtility = global.EncodeUtility || factory();
})(function EncodeUtility_factory() {
	"use strict";
	
	var _this = void 0;
	_this = function EncodeUtility_constrcutor() {};
	
	var doc			= XUtility.createDOMDocument();
	var encorde	= new ActiveXObject('System.Text.UnicodeEncoding');
	// 補足:プログラム内部では、UTF-16で処理するため、UTF-16を標準使用する。
	
	// 文字列→値
	function text2value(type, text) {
		var element = doc.createElement('temp');
		element.dataType = type;						// 種別を設定
		element.text = text;								// 変換元を設定
		var ret = element.nodeTypedValue;		// 値を取り出す
		element = null;
		return ret;
	};
	
	// 値→文字列
	function value2text(type, value) {
		var element = doc.createElement('temp');
		element.dataType = type;						// 種別を設定
		element.nodeTypedValue = value;			// 変換元を設定
		var ret = element.text;							// 値を取り出す
		element = null;
		return ret;
	};
	
	/**
	 * 「文字列」から「byte配列」へ変換
	 * @param {string} string							元データ
	 * @return {Byte[]}										変換データ(UTF-16)
	 */
	_this.str2bin = function EncodeUtility_string2bytes(string) {
		return encorde.GetBytes_4(string);
	};
	
	/**
	 * 「byte配列」から「文字列」へ変換
	 * @param {Byte[]} bytes							元データ
	 * @return {string}										変換データ(UTF-16)
	 */
	_this.bin2str = function EncodeUtility_bytes2string(bytes) {
		return encorde.GetString(bytes);
	};
	
	/**
	 * 「byte配列」から「16進数文字列」
	 * @param {Byte[]} bytes							元データ
	 * @return {string}										変換データ
	 */
	_this.bin2hex = function EncodeUtility_bytes2hex(bytes) {
		return value2text('bin.hex', bytes);
	}
	
	/**
	 * 「16進数文字列」から「byte配列」
	 * @param {string} hex								元データ
	 * @return {Byte[]}										変換データ
	 */
	_this.hex2bin = function EncodeUtility_hex2bytes(hex) {
		return text2value('bin.hex', hex);
	}
	
	/**
	 * 「byte配列」から「Base64文字列」
	 * @param {Byte[]} bytes							元データ
	 * @return {string}										変換データ
	 */
	_this.bin2base64 = function EncodeUtility_bytes2base64(bytes) {
		return value2text('bin.base64', bytes);
	}
	
	/**
	 * 「Base64文字列」から「byte配列」
	 * @param {string} base64							元データ
	 * @return {Byte[]}										変換データ
	 */
	_this.base642bin = function EncodeUtility_base642bytes(base64) {
		return text2value('bin.base64', base64);
	}
	
	// ハッシュ化
	function hash(objname, bytes, opt_type) {
		var provider = new ActiveXObject(objname);
		
		if (Atom.isString(bytes)) {									// bytesが文字列(パス)指定の場合
			bytes = FileUtility.loadBinary(bytes);
		}
		if (bytes == null) {												// 値が未取得の時(ファイルなしor空ファイル)
			bytes = _this.str2bin('');								// 空のバイト配列を設定
		}
		provider.ComputeHash_2(bytes);
		var hashs = provider.Hash;
		provider.Clear();
		provider = null;		// ActiveXObject開放
		bytes = null;				// ファイルデータ開放
		
		// 結果の変換
		var ret  = hashs;
		opt_type = (opt_type)? opt_type.toLowerCase(): 'hex';
		switch (opt_type) {
		case 'str':
		case 'string':
			ret = _this.bin2str(hashs);
			break;
		case 'hex':
			ret = _this.bin2hex(hashs);
			break;
		case 'base64':
			ret = _this.bin2base64(hashs);
			break;
		}
		hashs = null;
		return ret;
	};
	
	/**
	 * md5
	 * @param {Byte[]|string} bytes				元データ(string:ファイルパス)
	 * @param {string} [opt_type='hex']		結果種別('bin'/'str'/'string'/'hex'/'base64')
	 * @return {string|Byte[]}						暗号データ
	 */
	_this.md5 = function EncodeUtility_md5(bytes, opt_type) {
		return hash('System.Security.Cryptography.MD5CryptoServiceProvider', bytes, opt_type);
	};
	
	/**
	 * sha1
	 * @param {Byte[]|string} bytes				元データ(string:ファイルパス)
	 * @param {string} [opt_type='hex']		結果種別('bin'/'str'/'string'/'hex'/'base64')
	 * @return {string|Byte[]}						暗号データ
	 */
	_this.sha1 = function EncodeUtility_sha1(bytes, opt_type) {
		return hash('System.Security.Cryptography.SHA1CryptoServiceProvider', bytes, opt_type);
	};
	
	// 暗号化/復号化(Rijndael暗号)
	// 参考:http://qiita.com/tnakagawa/items/bba972e71cdc4f0f29f5
	function crypto(enc, key, src) {
		var crypt	= new ActiveXObject('System.Security.Cryptography.RijndaelManaged');
		
		// 共有キー設定
		var keyHash	= new ActiveXObject('System.Security.Cryptography.SHA256Managed');
		keyHash.ComputeHash_2(key);
		crypt.Key = keyHash.Hash;
		keyHash.Clear();
		keyHash = null;
		
		// 初期化ベクター設定
		var ivHash = new ActiveXObject('System.Security.Cryptography.MD5CryptoServiceProvider');
		ivHash.ComputeHash_2(key);
		crypt.IV = ivHash.Hash;
		ivHash.Clear();
		ivHash = null;
		
		// 暗号化/復号化
		var dst = null;
		var len	= value2text('bin.hex', src).length / 2
		var ts	= (enc)? crypt.CreateEncryptor(): crypt.CreateDecryptor();
		try {
			dst = ts.TransformFinalBlock(src, 0, len);
		} catch (e) {	// ブロック不正 or ...
			var level = console.Logger.FINE;
			if (console.isOutput(level)) {
				console.stackStamp('failure.', level);
				console.printStackTrace(e, level);
			}
		}
		ts = null
		
		crypt.Clear();
		crypt = null;
		return dst;
	};
	
	/**
	 * 暗号化(Rijndael暗号)
	 * @param {Byte[]} key								鍵
	 * @param {Byte[]} src								元データ
	 * @return {Byte[]}										暗号データ
	 */
	_this.encrypt = function EncodeUtility_encrypt(key, src) {
		return crypto(true, key, src);
	};
	
	/**
	 * 復号化(Rijndael暗号)
	 * 復号データがnull以外でも、復号失敗の可能性がある。
	 * @param {Byte[]} key								鍵
	 * @param {Byte[]} src								暗号データ
	 * @return {Byte[]|null}							復号データ(null:復号失敗)
	 */
	_this.decrypt = function EncodeUtility_decrypt(key, src) {
		return crypto(false, key, src);
	};
	
	return _this;
});
