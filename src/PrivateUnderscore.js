/*!
 * PrivateUnderscore.js v7
 *
 * Copyright (c) 2018 toshi (https://github.com/k08045kk)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

/*!
 * PrivateUnderscore.js
 * クラス内のprivate関数郡
 * 必要な部分のみクラスに定義する
 *
 * 不具合があった場合、すべての使用関数を修正すること
 * ライブラリ以外では使用しないこと
 * polyfill不要の処理を記載すること
 * PrivateUnderscore内の別関数に依存しないこと(できるだけ)
 *
 * @auther      toshi (https://github.com/k08045kk)
 * @version     7
 * @see         2 - fix - _Process_getScriptPath()修正 - 引数なし時のスクリプト拡張子を取得できない
 * @see         3 - fix - _dateFormat()修正 - Integer判定が正常に動作していない
 * @see         4 - update - _Process_getNamedArgumentの無指定時の戻り値をundefinedからtrueに変更
 * @see         5 - fix - _FileUtility_createFolder - パス長が規定値を超えた場合、エラーする
 * @see         6 - update - _FileUtility_loadText()追加
 * @see         6 - update - _getParentElement()の処理改善
 * @see         7 - update - _FileUtility_createFolder()を再帰処理しないように修正
 */
(function(global, factory) {
  factory(global);
})(this, function(global) {
  "use strict";
  
  var fs = void 0;
  var sh = void 0;
  var _document;
  var _window;
  
  /**
   * PrivateUnderscore.js
   * @version   6
   */
  {
    try {
      fs = new ActiveXObject('Scripting.FileSystemObject');
    } catch (e) {}
    try {
      sh = new ActiveXObject('WScript.Shell');
    } catch (e) {}
    if (typeof(global   ) === 'undefined') {
      global = Function('return this')();
    }
    if (global.document) {
      _document = document;
    } else {
      _document = new ActiveXObject('htmlfile');
      _document.write('<html><head></head><body></body></html>');
    }
    _window = global.window || _document.parentWindow;
    function _setTimeout(callback, millisec){
      return _window.setTimeout((function(params){
        return function(){callback.apply(null, params);};
      })([].slice.call(arguments,2)), millisec);
    };
    function _setInterval(callback, millisec){
      return _window.setInterval((function(params){
        return function(){callback.apply(null, params);};
      })([].slice.call(arguments,2)), millisec);
    };
    function _clearTimeout(id){
      _window.clearTimeout(id);
    }
    function _clearInterval(id){
      _window.clearInterval(id);
    }
    global.fs = global.fs || new ActiveXObject('Scripting.FileSystemObject');
    global.sh = global.sh || new ActiveXObject('WScript.Shell');
    // see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    function _Array_indexOf(array, searchElement, fromIndex) {
      if (array == null) throw new TypeError('"array" is null or not defined');
      var o = Object(array);
      var len = o.length >>> 0;
      if (len === 0) return -1;
      var n = fromIndex | 0;
      if (n >= len) return -1;
      var k = n >= 0 ? n : Math.max(len + n, 0);
      for (; k < len; k++)  if (k in o && o[k] === searchElement) return k;
      return -1;
    };
    // see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
    function _Number_isInteger(value) {
      return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
    // see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
    function _Date_toISOString() {
      function pad(number) {
        return ((number < 10)? '0': '') + number;
      }
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
    
    function _getGlobalObject(obj, name) {
      return (obj != null)? obj: Function('return this')()[name];
    };
    /**
     * 対象であるかを判定
     * @param obj - 対象
     * @return 結果
     */
    function _isObject(obj) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
    };
    function _isBoolean(obj) {
      return Object.prototype.toString.call(obj) === '[object Boolean]';
    };
    function _isString(obj) {
      return Object.prototype.toString.call(obj) === '[object String]';
    };
    function _isDate(obj) {
      return Object.prototype.toString.call(obj) === '[object Date]';
    };
    function _isArray(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
    function _isFunction(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    };
    function _isError(obj) {
      return Object.prototype.toString.call(obj) === '[object Error]';
    };
    function _isElement(obj) {
      return !!(obj && obj.nodeType === 1);
    };
    
    /**
     * 呼び出し関数を返す
     * 補足:再帰呼び出し目的では使用禁止
     *      再帰呼び出しの場合、「var callee = 関数名;」として使用する
     *      呼び出し履歴目的の場合、変数毎に異なる関数のため、本関数を使用する
     *      arguments.calleeは、strictモードでは使用禁止
     * @return 呼び出し関数
     */
    function _getCallee() {
      var args = arguments;
      var func = args.callee;
      return func.caller;
    };
    
    /**
     * オブジェクトを上書き
     * @param {Object} dst - 登録先
     * @param {Object} src - 登録元
     * @param {boolean} undefinedOnly - 未定義のみ上書き
     * @return 上書き済みオブジェクト
     */
    function _extend(dst, src, undefinedOnly) {
      if (dst != null && src != null) {
        for (var key in src) {
          if (src.hasOwnProperty(key)) {
            if (!undefinedOnly || dst[key] === void 0) {
              dst[key] = src[key];
            }
          }
        }
      }
      return dst;
    };
    
    /**
     * 乱数
     * min <= x <= max
     * @param {number} min - 最小値
     * @param {number} max - 最大値
     * @return 乱数(整数値)
     */
    function _random(min, max) {
      return min + Math.floor(Math.random() * (max - min + 1));
    };
    function _shuffle(array) {
      var shuffled = Array(array.length);
      for (var i=0, r; i<array.length; i++) {
        r = Math.floor(Math.random() * (i+1));
        if (r !== i) shuffled[i] = shuffled[r];
        shuffled[r] = array[i];
      }
      return shuffled;
    };
    
    
    /**
     * 関数名を取得
     * 補足:functionの前方には、記号/空白がくる可能性あり
     * @param {Function} func - 関数
     * @return 関数名
     */
    function _getFunctionName(func) {
      var name = 'anonymous';
      if (func === Function || func === Function.prototype.constructor) {
        name = 'Function';
      } else if (func !== Function.prototype) {
        var match = ('' + func).match(/^(?:\s|[^\w])*function\s+([^\(\s]*)\s*/);
        if (match != null && match[1] !== '') {
          name = match[1];
        }
      }
      return name;
    };
    
    /**
     * オブジェクト要素の変数名を取得
     * 関数の変数名を取得することを前提に作成
     * @param {Object} obj - オブジェクト
     * @param {*} val - 要素
     * @return 変数名
     */
    function _getVariableName(obj, v) {
      var ret = null;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === v) {
            ret = key;
            break;
          }
        }
      }
      return ret;
    };
    
    /**
     * オブジェクトに含まれる関数名を返す
     * @param {Object} obj - オブジェクト
     * @return {string[]} 関数名の配列
     */
    function _functions(obj) {
      var funcs = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (Object.prototype.toString.call(obj) === '[object Function]') {
            funcs.push(key);
          }
        }
      }
      return funcs;
    };
    
    function _mlength() {
      var len=0,
          i;
      for (i=0; i<this.length; i++) {
        len += (this.charCodeAt(i) > 255) ? 2: 1;
      }
      return len;
    };
    function _msubstr(start, length) {
      var s = 0;
      if (start != 0) {
        var mstart = Math.abs(start),
            direct = start/mstart,
            len = 0,
            i1 = (start < 0)? this.length-1: 0;
        for (; 0<=i1 && i1<this.length; i1+=direct) {
          len += (this.charCodeAt(i1) > 255)? 2: 1;
          if (mstart < len) {
            i1 -= direct;
            break;
          }
        }
        s = Math.max(0, i1);
      }
      var i2 = this.length;
      if (length !== void 0) {
        var len = 0;
        for (i2=s; i2<this.length; i2++) {
          len += (this.charCodeAt(i2) > 255) ? 2: 1;
          if (length < len) {
            break;
          }
        }
      }
      return this.substr(s, i2-s);
    };
    /**
     * 短縮文字列作成
     * 全角文字を考慮する
     * @param {string} [type='tail'] - 種別('head':前方/'middle':中間/'tail':後方)
     * @param {string} msg - 対象文字列
     * @param {number} max - 最大桁数(全角文字を2桁として解釈する)
     * @return {string} 短縮文字列
     */
    function _shortMessage(type, msg, max) {
      var length = _mlength;
      var substr = _msubstr;
      
      msg = msg+'';
      var m = substr.call(msg, 0, max);
      if (m.length < msg.length) {
        if (max <= 2) {
          m = '..'.substr(0, max);
        } else if (type === 'middle') {
          var m1 = substr.call(msg, 0, Math.ceil((max/2)-1)),
              m2 = (Math.floor((max/2)-1) == 0) ? 
                    '': 
                    substr.call(msg,-Math.floor((max/2)-1)),
              dn = max - length.call(m1) - length.call(m2);
          m = m1 + Array(dn + 1).join('.') + m2;
        } else if (type === 'head') {
          m = substr.call(msg, -(max - 2));
          m = Array(max - length.call(m) + 1).join('.') + m;
        } else {
          m = substr.call(msg, 0, max - 2);
          m = m + Array(max - length.call(m) + 1).join('.');
        }
      }
      return m;
    };
    
    /**
     * 日時のフォーマット
     * @param {string} format - フォーマット文字列
     * @param {(Date|number|string)} [opt_date=new Date()] - 日時
     * @param {string} [opt_prefix=''] - 前置語(例:'$'の場合、format='$yyyy/$MM/$dd')
     * @param {string} [opt_prefix=''] - 接尾語(例:'$'の場合、format='yyyy$/MM$/dd$')
     * @return {string} 書式文字列
     */
    function _dateFormat(format, opt_date, opt_prefix, opt_suffix) {
      var pre = (opt_prefix != null)? opt_prefix: '';
      var suf = (opt_suffix != null)? opt_suffix: '';
      var fmt = {};
      fmt[pre+'yyyy'+suf] = function(date) { return ''  + date.getFullYear(); };
      fmt[pre+'MM'+suf]   = function(date) { return('0' +(date.getMonth() + 1)).slice(-2); };
      fmt[pre+'dd'+suf]   = function(date) { return('0' + date.getDate()).slice(-2); };
      fmt[pre+'hh'+suf]   = function(date) { return('0' +(date.getHours() % 12)).slice(-2); };
      fmt[pre+'HH'+suf]   = function(date) { return('0' + date.getHours()).slice(-2); };
      fmt[pre+'mm'+suf]   = function(date) { return('0' + date.getMinutes()).slice(-2); };
      fmt[pre+'ss'+suf]   = function(date) { return('0' + date.getSeconds()).slice(-2); };
      fmt[pre+'SSS'+suf]  = function(date) { return('00'+ date.getMilliseconds()).slice(-3); };
      fmt[pre+'yy'+suf]   = function(date) { return(''  + date.getFullYear()).slice(-2); };
      fmt[pre+'M'+suf]    = function(date) { return ''  +(date.getMonth() + 1); };
      fmt[pre+'d'+suf]    = function(date) { return ''  + date.getDate(); };
      fmt[pre+'h'+suf]    = function(date) { return ''  +(date.getHours() % 12); };
      fmt[pre+'H'+suf]    = function(date) { return ''  + date.getHours(); };
      fmt[pre+'m'+suf]    = function(date) { return ''  + date.getMinutes(); };
      fmt[pre+'s'+suf]    = function(date) { return ''  + date.getSeconds(); };
      fmt[pre+'S'+suf]    = function(date) { return ''  + date.getMilliseconds(); };
      
      var date = opt_date;
      if (date == null) {
        date = new Date();
      } else if (typeof date === 'number' && isFinite(date) && Math.floor(date) === date) {
        date = new Date(date);
      } else if (Object.prototype.toString.call(date) === '[object String]') {
        date = new Date(date);
      }
      
      var result = format;
      for (var key in fmt) {
        if (fmt.hasOwnProperty(key)) {
          result = result.replace(key, fmt[key](date));
        }
      }
      return result;
    };
    
    /**
     * 時間のフォーマット
     * @param {string} format - フォーマット文字列
     * @param {number} time - 時間(ms単位)
     * @param {string} [opt_prefix=''] - 前置語(例:'$'の場合、format='$~H:$mm:$ss.$S')
     * @param {string} [opt_prefix=''] - 接尾語(例:'$'の場合、format='~H$:mm$:ss$.S$')
     * @return {string} 書式文字列
     */
    function _timeFormat(format, time, opt_prefix, opt_suffix) {
      var pre = (opt_prefix != null)? opt_prefix: '';
      var suf = (opt_suffix != null)? opt_suffix: '';
      var fmt = {};
      fmt[pre+'~d'+suf] = function(time) { return ''  + Math.floor(time/86400000);  };
      fmt[pre+'~H'+suf] = function(time) { return ''  + Math.floor(time/3600000); };
      fmt[pre+'~h'+suf] = function(time) { return ''  + Math.floor(time/1800000); };
      fmt[pre+'~m'+suf] = function(time) { return ''  + Math.floor(time/60000); };
      fmt[pre+'~s'+suf] = function(time) { return ''  + Math.floor(time/1000);  };
      fmt[pre+'~S'+suf] = function(time) { return ''  +(time);  };
      fmt[pre+'HH'+suf] = function(time) { return('0' +(Math.floor(time/3600000)%24)).slice(-2);  };
      fmt[pre+'hh'+suf] = function(time) { return('0' +(Math.floor(time/1800000)%24)).slice(-2);  };
      fmt[pre+'mm'+suf] = function(time) { return('0' +(Math.floor(time/60000)%60)).slice(-2);  };
      fmt[pre+'ss'+suf] = function(time) { return('0' +(Math.floor(time/1000)%60)).slice(-2); };
      fmt[pre+'SSS'+suf]= function(time) { return('00'+(time%1000)).slice(-3);  };
      fmt[pre+'d'+suf]  = fmt[pre+'~d'+suf];
      fmt[pre+'H'+suf]  = function(time) { return ''  +(Math.floor(time/3600000)%24); };
      fmt[pre+'h'+suf]  = function(time) { return ''  +(Math.floor(time/1800000)%24); };
      fmt[pre+'m'+suf]  = function(time) { return ''  +(Math.floor(time/60000)%60); };
      fmt[pre+'s'+suf]  = function(time) { return ''  +(Math.floor(time/1000)%60);  };
      fmt[pre+'S'+suf]  = function(time) { return ''  +(time%1000); };
      
      var result = format;
      for (var key in fmt) {
        if (fmt.hasOwnProperty(key)) {
          result = result.replace(key, fmt[key](time));
        }
      }
      return result;
    };
    
    /**
     * エラー作成
     * ErrorUtility.jsがある場合、
     * ErrorUtility.create()を使用してエラーを作成する。
     * @param {string} opt_message - エラーメッセージ
     * @param {?Function} opt_root - トレースを開始する直前の関数(null:本関数)
     * @param {(string|Error)} opt_error - エラー名称
     * @return {Error} エラー
     */
    function _error(opt_message, opt_root, opt_error) {
      if (ErrorUtility != null) {
        return ErrorUtility.create(opt_message, opt_root, opt_error);
      } else if (Object.prototype.toString.call(opt_error) === '[object Error]') {
        return new opt_error(opt_message);
      } else {
        var e = new Error(opt_message);
        if (Object.prototype.toString.call(opt_error) === '[object String]') {
          e.name = opt_error;
        }
        return e;
      }
    };
    function _errormessage(error) {
      return ''
          + (error.name? error.name: 'UnknownError')
          + '('
            // 機能識別符号(上位16bit).エラーコード(下位16bit)
          + (error.number? ((error.number>>16)&0xFFFF)+'.'+(error.number&0xFFFF): '')
          + ')'
          + (error.message? ': '+error.message: '');
    };
    // _Array_indexOf
    // _getCallee
    // _getFunctionName
    function _stack(callee, message, prefix) {
      callee = callee || _getCallee();
      var stack = [message];
      var funcs = []; // 再帰呼び出し検出用
      for (var func=callee.caller; func; func=func.caller) {
        // 再帰呼び出し検出
        if (_Array_indexOf(funcs, func) !== -1) {
          stack.push(prefix+_getFunctionName(func)+'()...');
          break;
        }
        funcs.push(func);
        stack.push(prefix+_getFunctionName(func)+'()');
      }
      return stack.join('\n');
    };
    // _Date_toISOString
    // _getFunctionName
    function _toString(message, isString) {
      var callee = _toString;
      function propertyList(obj) {
        var a = [];
        for (var key in obj) {
          try {
            if (obj.hasOwnProperty(key)) {  a.push(key+':'+callee(obj[key], true));  }
          } catch (e) {}  // native method
        }
        return a;
      }
      
      var msg = ''+message;
      switch (Object.prototype.toString.call(message)) {
      case '[object Null]':
      case '[object Undefined]':
      case '[object Boolean]':
      case '[object Number]':
      case '[object RegExp]':
        break;
      case '[object String]':
        msg = (isString === true)? '"' + msg + '"': msg;
        break;
      case '[object Date]':
        msg = _Date_toISOString.call(message);
        msg = (isString === true)? '"' + msg + '"': msg;
        break;
      case '[object Math]':
        msg = 'Math';
        break;
      case '[object Error]':
        msg = (message.name == null)? 'Error': ''+message.name;
        msg += '{'+propertyList(message).join(',')+'}';
        break;
      case '[object Function]':
        msg = _getFunctionName(message)+'()';
        var temp = propertyList(message);
        if (temp.length != 0) {
          msg += '{'+temp.join(',')+'}';
        }
        break;
      case '[object Array]':
        msg = '[';
        for (var i=0; i<message.length; i++) {
          msg += (i? ',': '') + callee(message[i], true);
        }
        msg += ']';
        break;
      default:
        if (message === Function('return this')()) {
          msg = 'Global';
        } else if (typeof message === 'function' || typeof message === 'object' && !!message) {
          msg = '{'+propertyList(message).join(',')+'}';
        }
        break;
      }
      return msg;
    };
  }
  
  {
    function _FileUtility_createFolder(folderpath) {
      var ret = false,
          buffer = [],
          path = fs.GetAbsolutePathName(folderpath);
      while (path != '' && !(fs.FolderExists(path) || fs.FileExists(path))) {
        buffer.push(path);
        path = fs.GetParentFolderName(path);
      }
      if (fs.FolderExists(path)) {
        while ((path = buffer.pop()) != null) {
          try {
            fs.CreateFolder(path);
            ret = true;
          } catch (e) {
            // ファイルが見つかりません(パス長問題) || パスが見つかりません(パス不正 || 存在しない)
            ret = false;
            break;
          }
        }
      } // else ファイルが存在する場合、子フォルダを作成できない
      return ret;
    };
    function _FileUtility_createFileFolder(filepath) {
      return _FileUtility_createFolder(fs.GetParentFolderName(filepath));
    };
    function _storeText(src, path, opt_option, opt_charset, opt_bom) {
      var option  = (opt_option === true)?  2:
                    (opt_option === false)? 1:
                    (opt_option == null)?   1: opt_option;
      var charset = (opt_charset== null)?   'utf-8': opt_charset;
      var bom     = (opt_bom    == null)?   true: opt_bom;
      var fullpath, skip, bin;
      var ret = true;
      
      // 前処理
      charset = charset.toLowerCase();
      skip = {};
      skip['utf-8'] = 3;
      skip['utf-16'] = 2;
      skip['utf-16le'] = 2;
      // UTF-16BEは、スキップ不要(ADODB.StreamがBOMを書き込まないため)
      fullpath = fs.GetAbsolutePathName(path);
      
      // (存在しない場合)フォルダを作成する
      //_FileUtility_createFileFolder(fullpath);
      {
        var _buffer = [],
            _path = fs.GetAbsolutePathName(fs.GetParentFolderName(fullpath));
        while (_path != '' && !(fs.FolderExists(_path) || fs.FileExists(_path))) {
          _buffer.push(_path);
          _path = fs.GetParentFolderName(_path);
        }
        if (fs.FolderExists(_path)) {
          while ((_path = _buffer.pop()) != null) {
            try {
              fs.CreateFolder(_path);
            } catch (e) {
              break;
            }
          }
        }
      }
      
      // ファイルに書き込む。
      var sr = new ActiveXObject('ADODB.Stream');
      sr.Type = 2;
      sr.Charset = charset;
      sr.Open();
      sr.WriteText(src);
      if (bom === true && charset == 'utf-16be') {
        // ADODB.Streamは、UTF-16BEのBOMを書き込まないため、自力でBOMを書き込む
        // LEのBOMを確保
        var le = new ActiveXObject('ADODB.Stream');
        le.Type = 2;
        le.Charset = 'utf-16le';
        le.Open();
        le.WriteText('');
        le.Position = 0;
        le.Type = 1;
        
        // BEのバイナリを確保
        var be = sr;
        be.Position = 0;
        be.Type = 1;
        bin = be.Read();
        be.Close();
        be  = null;
        sr  = null;
        
        // 再度BOMありを書き込み
        sr = new ActiveXObject('ADODB.Stream');
        sr.Type = 1;
        sr.Open();
        
        // BOM(LEの1Byteと2Byteが逆)を書き込み
        // BEのバイナリを書き込み
        le.Position = 1;
        sr.Write(le.Read(1));
        le.Position = 0;
        sr.Write(le.Read(1));
        if (bin != null)  sr.Write(bin);
        
        le.Close();
        le  = null;
      }
      if (bom === false && skip[charset]) {
        // BOMなし書込処理
        var pre = sr;
        pre.Position = 0;
        pre.Type = 1;
        // skipバイト(BOM)を読み飛ばす
        pre.Position = skip[charset];
        bin = pre.Read();
        pre.Close();
        pre = null;
        sr  = null;
        
        // 再度BOMなしを書き込み
        sr = new ActiveXObject('ADODB.Stream');
        sr.Type = 1;
        sr.Open();
        if (bin != null)  sr.Write(bin);
      }
      try {
        sr.SaveToFile(fullpath, option);
      } catch (e) {       // ADODB.Stream: ファイルへ書き込めませんでした。
        // ファイルあり時、上書きなし
        ret = false;
      }
      sr.Close();
      sr = null;
      return ret;
      // 補足:LineSeparatorプロパティは、全行読み出しのため、無意味
    };
    function _loadText(path, opt_charset) {
      var ret, fullpath, 
          charset = opt_charset,
          skip = false;
      
      if (charset == null) { charset = '_autodetect_all'; }
      charset = charset.toLowerCase();
      
      fullpath = fs.GetAbsolutePathName(path);
      if (!fs.FileExists(fullpath)) {
        // ファイルなし
        return null;
      } else if (fs.GetFile(fullpath).size === 0) {
        // 空ファイル
        return '';
      }
      
      var sr = new ActiveXObject('ADODB.Stream');
      sr.Type = 2;
      if (charset == '_autodetect_all' || charset == 'utf-16be') {
        // BOMを確認してUTF-8とUTF-16だけ、手動で判定する
        // UTF-16BEは、BOMあり時にBOM削除されないため、手動でスキップする
        var pre = new ActiveXObject('ADODB.Stream');
        pre.Type = 2;
        pre.Charset = 'us-ascii';
        pre.Open();
        pre.LoadFromFile(fullpath);
        var bom = [];
        bom.push(pre.EOS || escape(pre.ReadText(1)));
        bom.push(pre.EOS || escape(pre.ReadText(1)));
        bom.push(pre.EOS || escape(pre.ReadText(1)));
        if (charset == 'utf-16be') {
          if (bom[0] == '%7E' && bom[1]== '%7F') {
            skip = true;
          }
        } else if (bom[0] == 'o'   && bom[1]== '%3B' && bom[2]== '%3F') {
          charset = 'utf-8';
        } else if (bom[0] == '%7F' && bom[1]== '%7E') {
          charset = 'utf-16le';
        } else if (bom[0] == '%7E' && bom[1]== '%7F') {
          charset = 'utf-16be';
          skip = true;
        }
        pre.Close();
        pre = null;
      }
      sr.Charset = charset;
      
      // ファイルから読み出し
      sr.Open();
      sr.LoadFromFile(fullpath);
      if (skip) {
        // 先頭一文字(BOM)を空読み
        sr.ReadText(1);
        ret = sr.ReadText();
      } else {
        ret = sr.ReadText();
      }
      
      // 終了処理
      sr.Close();
      sr = null;
      return ret;
    };
  }
  
  {
    function _Process_createActiveXObjects(progIDs) {
      for (var i=0; i<progIDs.length; ++i) {
        try {
          return new ActiveXObject(progIDs[i]);
        } catch (e) {
          if (i == progIDs.length - 1) {  throw e;  }
        }
      }
      return null;
    };
    function _Process_createDOMDocument() {
      return _Process_createActiveXObjects([
        'MSXML2.DOMDocument.6.0',
        'MSXML2.DOMDocument.3.0',
        'Msxml2.DOMDocument',
        'Msxml.DOMDocument',
        'Microsoft.XMLDOM']);
    };
    function _Process_getNamedArgument(name, def, min, max) {
      if (WScript.Arguments.Named.Exists(name)) {
        var arg = WScript.Arguments.Named.Item(name);
        
        // 型が一致する場合、代入する
        if (def === void 0) {                   // 未定義の時
          def = (arg === void 0)? true: arg;
        } else if (typeof def == typeof arg) {  // string or boolean の時
          def = arg;
        } else if (typeof def == 'number') {
          try {
            arg = new Number(arg);
            if (isNaN(arg)) {
            } else if (min !== void 0 && arg < min) {
            } else if (max !== void 0 && arg > max) {
            } else {
              def = arg;
            }
          } catch (e) {}  // 変換失敗
        }
      }
      return def;
    };
    // TODO: MakeExe対応が必要
    function _Process_getScriptPath(opt_ext) {
      var parent= fs.GetParentFolderName(WScript.ScriptFullName);
      var base  = fs.GetBaseName(WScript.ScriptFullName);
      var ext   = (!opt_ext)? fs.GetExtensionName(WScript.ScriptFullName): opt_ext;
      if (ext.length != 0 && ext.substr(0, 1) !== '.') {
        ext = '.'+ext;
      }
      return fs.BuildPath(parent, base + ext);
    };
  }
  
  {
    function _getParentElement(element, tagName) {
      for (; element; element=element.parentElement) {
        if (element.tagName === tagName) {      // 大文字
          return element;
        }
      }
      return null;
    }
  }
});
