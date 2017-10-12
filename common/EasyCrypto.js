/**
 * 簡易暗号
 * ボリューム(HDD等)のGUIDを使用した簡易暗号、
 * 保存ボリュームを変更しなければ、正常に復号可能となる。
 * 他人のPC上では失敗する。(別ドライブへ移動した場合も失敗する)
 * 
 * ソースor設定ファイルにパスワード等を
 * 平文のまま記入しない目的で使用することを想定して作成した。
 * @auther toshi2limu@gmail.com (toshi)
 */
(function(factory) {
	global.EasyCrypto = global.EasyCrypto 
									 || factory(global['EncodeUtility'], global['WMIUtility']);
})(function EasyCrypto_factory(encode, wmi) {
	"use strict";
	
	var _this = void 0;
	_this = function EasyCrypto_constrcutor() {};
	
	var prefix	= 'EasyCrypto:';
	var guid		= null;
	
	/**
	 * 暗号化有無
	 * @param {string} text								暗号化文字列
	 * @return {boolean}									暗号化有無
	 */
	_this.isEncrypted = function EasyCrypto_isEncrypted(text) {
		return text.startsWith(prefix);
	};
	
	
	/**
	 * 鍵取得
	 * 実行ファイル格納ボリュームのGUID文字列を返す。
	 * @return {string}										暗号化鍵
	 */
	_this.getKey = function EasyCrypto_getKey() {
		if (guid == null) {
			guid = wmi.Volume.getGUID(ModulePath());
		}
		return guid;
	};
	
	/**
	 * 暗号化
	 * @param {string} text								平文
	 * @return {string}										暗号化文字列
	 */
	_this.encrypt = function EasyCrypto_encrypt(text) {
		var uid = encode.hex2bin(_this.getKey());
		var src = encode.str2bin(text);
		var bin = encode.encrypt(uid, src);
		return prefix + encode.bin2base64(bin);
	};
	
	/**
	 * 復号化
	 * encrypt()で暗号化した文字列を復号化する。
	 * 平文を引数に渡した場合、平文のまま返す。
	 * @param {string} text								暗号化文字列
	 * @return {string}										復号化文字列
	 */
	_this.decrypt = function EasyCrypto_decrypt(text) {
		var ret = text;
		if (_this.isEncrypted(text)) {
			try {
				var uid = encode.hex2bin(_this.getKey());
				var src = encode.base642bin(text.substr(prefix.length));
				var bin = encode.decrypt(uid, src);
				ret = encode.bin2str(bin);
			} catch (e) {	// base64復号エラー or ブロック不正 or ...
				var level = console.Logger.FINE;
				if (console.isOutput(level)) {
					console.stackStamp('Decoding failure.', level);
					console.printStackTrace(e, level);
				}
			}
		}
		return ret;
	};
	
	return _this;
});
