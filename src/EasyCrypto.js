/*!
 * EasyCrypto.js v2
 *
 * Copyright (c) 2018 toshi (https://github.com/k08045kk)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

/**
 * WSH(JScript)用簡易暗号化／復号
 * 実行ファイル格納ボリューム(HDD等)のGUIDを使用した簡易暗号、
 * 実行ファイル格納ボリュームを変更しなければ、暗号化した文字列を正常に復号できる。
 * 他人のPC(別ドライブ)上では、復号に失敗する。
 * ソースや設定ファイルにパスワード等を平文のまま記入することを避けるために作成した。
 * 注意：実行ファイル格納ボリュームが流出した場合、復号される危険性があります。
 * @requires    module:ActiveXObject('Scripting.FileSystemObject')
 * @requires    module:ActiveXObject('WScript.Shell')
 * @requires    module:ActiveXObject('WbemScripting.SWbemLocator')
 * @requires    module:WScript
 * @requires    module:EncodeUtility.js
 * @auther      toshi (https://github.com/k08045kk)
 * @version     2
 * @see         1.20180723 - add - 初版
 * @see         2.20190524 - update - WMIUtilityから分離
 * @see         2.20190524 - update - 接頭辞を任意指定可能に変更
 * @see         2.20190524 - update - 接尾辞を任意指定可能に変更
 */
(function(root, factory) {
  if (!root.EasyCrypto) {
    root.EasyCrypto = factory(root.EncodeUtility);
  }
})(this, function(EncodeUtility) {
  "use strict";
  
  // -------------------- private --------------------
  
  var global = Function('return this')();
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var sh = void 0;
  var locator = new ActiveXObject('WbemScripting.SWbemLocator');
  var service = locator.ConnectServer();
  var _this = void 0;
  
  /**
   * PrivateUnderscore.js
   * @version   1
   */
  {
    try {
      sh = new ActiveXObject('WScript.Shell');
    } catch (e) {}
    
    function _WMIUtility_getProperty(service, query) {
      var ret = null;
      
      if (Object.prototype.toString.call(query) === '[object String]') {
        // クエリを処理する
        var set = service.ExecQuery(query);
        var e1;
        for (e1=new Enumerator(set); !e1.atEnd(); e1.moveNext()) {
          query = e1.item();
          break;
        }
        e1 = null;
        set = null;
      }
      if (query != null) {
        // アイテムを処理する
        ret = {};
        var e2;
        for (e2=new Enumerator(query.Properties_); !e2.atEnd(); e2.moveNext()) {
          var item = e2.item();
          ret[item.Name] = item.Value;
          item = null;
        }
      }
      return ret;
    }
  }
  
  
  // -------------------- static --------------------
  
  _this = function EasyCrypto_constrcutor() {};
  _this.prefix = 'EasyCrypto:'; // 接頭辞
  _this.suffix = '';            // 接尾辞
  _this._guid = null;           // 実行ファイル格納ボリュームのGUID(ハッシュ値)
  
  /**
   * 暗号化有無
   * @param {string} text - 暗号化文字列
   * @param {string} opt_prefix - 暗号化に使用した接頭辞
   * @param {string} opt_suffix - 暗号化に使用した接尾辞
   * @return {boolean} 暗号化有無
   */
  _this.isEncrypted = function EasyCrypto_isEncrypted(text, opt_prefix, opt_suffix) {
    var prefix = (opt_prefix != null)? opt_prefix: _this.prefix;
    var suffix = (opt_suffix != null)? opt_suffix: _this.suffix;
    
    //return text.startsWith(prefix) && text.endsWith(suffix);
    return text.substring(0, prefix.length) === prefix
        && text.substring(text.length - suffix.length, text.length) === suffix;
  };
  
  /**
   * 鍵取得
   * 実行ファイル格納ボリュームのGUID文字列を返す。
   * @return {string} 暗号化鍵
   */
  _this.getKey = function EasyCrypto_getKey() {
    if (_this._guid == null) {
      var path = ('WScript' in global)? WScript.ScriptFullName: sh.CurrentDirectory
      var drive = fs.GetDriveName(path);
      var volume = _WMIUtility_getProperty(service, 
                                          "SELECT DeviceID FROM Win32_Volume"
                                        + " WHERE DriveLetter = '"+drive+"'");
      if (volume != null) {
        _this._guid = volume.DeviceID.match(/{(.+)}/)[1].split('-').join('');
        // 最終的に数値として利用するため、GUIDをハッシュ値として取得する。
        // 取得想定文字列例
        // \\?\Volume{08590fae-6596-45a4-8103-fdc673aed396}\
        // 想定GUID例
        // 08590fae659645a48103fdc673aed396
      }
      volume = null;
    }
    return _this._guid;
  };
  
  /**
   * 暗号化
   * 接頭辞と接尾辞を付加しない。
   * 注意：平文には、1桁以上の文字列を指定すること。
   * @param {string} text - 平文
   * @return {string} 暗号化文字列
   */
  _this.pureEncrypt = function EasyCrypto_pureEncrypt(text) {
    var uid = EncodeUtility.hex2bin(_this.getKey());
    var src = EncodeUtility.str2bin(text);
    var bin = EncodeUtility.encrypt(uid, src);
    return EncodeUtility.bin2base64(bin);
  };
  
  /**
   * 暗号化
   * 接頭辞と接尾辞を付加する。
   * 平文には、1桁以上の文字列を指定すること。
   * @param {string} text - 平文
   * @param {string} opt_prefix - 暗号化に使用する接頭辞
   * @param {string} opt_suffix - 暗号化に使用した接尾辞
   * @return {string} 暗号化文字列
   */
  _this.encrypt = function EasyCrypto_encrypt(text, opt_prefix, opt_suffix) {
    var prefix = (opt_prefix != null)? opt_prefix: _this.prefix;
    var suffix = (opt_suffix != null)? opt_suffix: _this.suffix;
    
    return prefix + _this.pureEncrypt(text) + suffix;
  };
  
  /**
   * 復号
   * 接頭辞と接尾辞を意識しない。
   * encrypt()で暗号化した文字列を復号する。
   * 平文を引数に渡した場合、平文のまま返す。
   * 復号途中でエラーが発生した場合、平文のまま返す（接頭辞を削除した文字列を返す）。
   * 平文以外が戻った場合でも、復号成功を保証するものではない。
   * @param {string} text - 暗号化文字列
   * @return {string} 復号文字列
   */
  _this.pureDecrypt = function EasyCrypto_pureDecrypt(text) {
    var ret = text;
    try {
      var uid = EncodeUtility.hex2bin(_this.getKey());
      var src = EncodeUtility.base642bin(ret);
      var bin = EncodeUtility.decrypt(uid, src);
      ret = EncodeUtility.bin2str(bin);
    } catch (e) {}    // base64復号エラー or ブロック不正 or ...
    return ret;
  };
  
  /**
   * 復号
   * 接頭辞と接尾辞を意識する。
   * @param {string} text - 暗号化文字列
   * @param {string} opt_prefix - 暗号化に使用した接頭辞
   * @param {string} opt_suffix - 暗号化に使用した接尾辞
   * @return {string} 復号文字列
   */
  _this.decrypt = function EasyCrypto_decrypt(text, opt_prefix, opt_suffix) {
    var prefix = (opt_prefix != null)? opt_prefix: _this.prefix;
    var suffix = (opt_suffix != null)? opt_suffix: _this.suffix;
    
    var ret = text;
    if (_this.isEncrypted(text, prefix, suffix)) {
      ret = text.substring(prefix.length);
      ret = _this.pureDecrypt(ret);
    }
    return ret;
  };
  
  return _this;
});
