/*!
 * Process.js v13
 *
 * Copyright (c) 2018 toshi (https://github.com/k08045kk)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 *
 * The inherits() function is:
 * ISC license | https://github.com/isaacs/inherits/blob/master/LICENSE
 */

/**
 * polyfill
 * 最低限使いそうなもののみ(これ以外は、es5-shim.js等を使用する)
 */
Object.keys = Object.keys || function (obj) {
  if (obj !== Object(obj))  throw new TypeError('Object.keys called on a non-object');
  var key, keys = [];
  for (key in obj)  if (obj.hasOwnProperty(key))  keys.push(key);
  return keys;
};
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
Function.prototype.bind = Function.prototype.bind || function(oThis) {
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }
  var aArgs   = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP    = function() {},
      fBound  = function() {
        return fToBind.apply(this instanceof fNOP
               ? this
               : oThis,
               aArgs.concat(Array.prototype.slice.call(arguments)));
      };
  if (this.prototype) {
    fNOP.prototype = this.prototype; 
  }
  fBound.prototype = new fNOP();
  return fBound;
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" && 
    isFinite(value) && 
    Math.floor(value) === value;
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
String.prototype.startsWith = String.prototype.startsWith || function (search, pos){
  pos = !pos || pos < 0 ? 0 : +pos;
  return this.substring(pos, pos + search.length) === search;
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
String.prototype.endsWith = String.prototype.endsWith || function (search, len) {
  if (len === undefined || len > this.length) {
    len = this.length;
  }
  return this.substring(len - search.length, len) === search;
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim
String.prototype.trim = String.prototype.trim || function () {
  return this.replace(/^\s+|\s+$/g, '');
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
Array.isArray = Array.isArray || function (arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement, fromIndex) {
  if (this == null) throw new TypeError('"array" is null or not defined');
  var o = Object(this);
  var len = o.length >>> 0;
  if (len === 0)  return -1;
  var n = fromIndex | 0;
  if (n >= len)  return -1;
  var k = n >= 0 ? n : Math.max(len + n, 0);
  for (; k < len; k++)  if (k in o && o[k] === searchElement) return k;
  return -1;
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
Array.prototype.forEach = Array.prototype.forEach || function(callback/*, thisArg*/) {
  var T, k;
  if (this == null) {
    throw new TypeError('this is null or not defined');
  }
  var O = Object(this);
  var len = O.length >>> 0;
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  if (arguments.length > 1) {
    T = arguments[1];
  }
  k = 0;
  while (k < len) {
    if (k in O) callback.call(T, O[k], k, O);
    k++;
  }
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/now
Date.now = Date.now || function () {
  return new Date().getTime();
};
// see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
if (!Date.prototype.toISOString) {
  (function() {
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
  }());
}

if (typeof(global   ) === 'undefined') {
  global = Function('return this')();
}
if (!global.document) {
  document = new ActiveXObject('htmlfile');
  document.write('<html><head><meta http-equiv="x-ua-compatible" content="IE=10"/></head><body></body></html>');
  // VBScriptの呼び出しはIE10までのため、IE10にしてみた
}
if (!global.window) {
  window = document.parentWindow;
  setTimeout  = function(callback, millisec){
    return window.setTimeout((function(params){
      return function(){callback.apply(null, params);};
    })([].slice.call(arguments,2)), millisec);
  };
  setInterval = function(callback, millisec){
    return window.setInterval((function(params){
      return function(){callback.apply(null, params);};
    })([].slice.call(arguments,2)), millisec);
  };
  clearTimeout  = window.clearTimeout;
  clearInterval = window.clearInterval;
  // 補足:window.setTimeout関数を上書きできなかったため、グローバル関数のみ
}
fs = global.fs || new ActiveXObject('Scripting.FileSystemObject');
sh = global.sh || new ActiveXObject('WScript.Shell');
if (!global.JSON) {
  // see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON
  global.JSON = {
    parse: function(sJSON) { return eval('(' + sJSON + ')'); },
    stringify: (function () {
      var toString = Object.prototype.toString;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
      var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
      var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
      var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
      return function stringify(value) {
        if (value == null) {
          return 'null';
        } else if (typeof value === 'number') {
          return isFinite(value) ? value.toString() : 'null';
        } else if (typeof value === 'boolean') {
          return value.toString();
        } else if (typeof value === 'object') {
          if (typeof value.toJSON === 'function') {
            return stringify(value.toJSON());
          } else if (isArray(value)) {
            var res = '[';
            for (var i = 0; i < value.length; i++)
              res += (i ? ',' : '') + stringify(value[i]);
            return res + ']';
          } else if (toString.call(value) === '[object Object]') {
            var tmp = [];
            for (var k in value) {
              // in case "hasOwnProperty" has been shadowed
              if (hasOwnProperty.call(value, k))
                tmp.push(stringify(k) + ':' + stringify(value[k]));
            }
            return '{' + tmp.join(',') + '}';
          }
        }
        return '"' + value.toString().replace(escRE, escFunc) + '"';
      };
    })()
  };
}
if (!global.inherits) {
  // 継承
  // see https://github.com/isaacs/inherits/blob/master/inherits_browser.js
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}
if (!global.extend) {
  /**
   * オブジェクトを上書き
   * @param {Object} dst - 登録先
   * @param {Object} src - 登録元
   * @param {boolean} undefinedOnly - 未定義のみ上書き
   * @return {Object} 上書き済みオブジェクト
   */
  function extend(dst, src, undefinedOnly) {
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
}
if (!global.random) {
  /**
   * 乱数
   * min <= x <= max
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @return {number} 乱数(整数値)
   */
  function random(min, max) {
    if (Array.isArray(min)) {
      return min[Math.floor(Math.random() * min.length)];
    } else {
      return min + Math.floor(Math.random() * (max - min + 1));
    }
  };
}
if (!global.shuffle) {
  /**
   * 配列をシャッフル
   * @param {Array} array - 配列
   * @return {Array} シャッフル後の配列
   */
  function shuffle(array) {
    var shuffled = Array(array.length);
    for (var i=0, r; i<array.length; i++) {
      r = Math.floor(Math.random() * (i+1));
      if (r !== i) shuffled[i] = shuffled[r];
      shuffled[r] = array[i];
    }
    return shuffled;
  };
}
Object.isObject = Object.isObject || function (obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};
Boolean.isBoolean = Boolean.isBoolean || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Boolean]';
};
String.isString = String.isString || function (obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
};
Number.isNumber = String.isNumber || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Number]';
};
Date.isDate = Date.isDate || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Date]';
};
Function.isFunction = Function.isFunction || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};
Error.isError = Error.isError || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Error]';
};


/**
 * WSH(JScript)用ライブラリ：Process.js
 * 初期化処理、実行/デバッグ補助、機能拡充処理、簡易polyfill
 * 入れる場所のない、便利機能詰め合わせ
 * 注意：原型をなくすほど仕様変更する可能性あり
 * @requires    module:ActiveXObject('Scripting.FileSystemObject')
 * @requires    module:ActiveXObject('WScript.Shell')
 * @requires    module:ActiveXObject('MSXML.DOMDocument')
 * @requires    module:WScript
 * @requires    module:FileUtility.js
 * @requires    Console.js
 * @auther      toshi (https://github.com/k08045kk)
 * @version     13
 * @see         1.20180504 - 初版
 * @see         2.20180504 - 設定ファイルの配置を指定可能とする
 * @see         2.20180507 - inherits()、Object.keys()、他を変更 - ライセンス関連
 * @see         3.20180512 - exec関数がconsoleなしで動作するように修正
 * @see         4.20180515 - isCScript(), isWScript()を切出し
 * @see         5.20180521 - fix - Process_dateFormatが無限ループしていたため、修正
 * @see         6.20180602 - fix - _dateFormat()の数値判定が機能していない問題を修正
 * @see         7.20180603 - update - TRACE廃止に伴う修正
 * @see         7.20180603 - update - global.fs, shを使用しないように変更
 * @see         7.20180605 - fix - Array.prototype.indexOfが動作していなかった
 * @see         7.20180605 - update - Process_loadConfigを階層化
 * @see         7.20180605 - update - Process_echoを追加
 * @see         8.20180606 - update - Process_getNamedArgument無指定時戻り値をundefinedからtrueに変更
 * @see         9.20180702 - update - XXX.isXXXを追加
 * @see         10.20180922 - fix - XXX.isXXXがString.isXXXとなっていたため、修正
 * @see         10.20180922 - fix - Object.createを削除(非対応のObject.definePropertiesを使用していた)
 * @see         10.20181228 - update - Number.isNumber追加
 * @see         11.20190105 - update - JSONをpolyfillからIE取得に変更
 * @see         12.20190823 - update - Process.debug()を追加
 * @see         12.20190823 - update - Date.toISOString()を追加
 * @see         13.20190928 - update - currentTime()を追加
 * @see         13.20191009 - fix - JSONをpolyfillに戻す（文字列化失敗パターンがあったため）
 */
(function(root, factory) {
  if (!root.Process) {
    root.Process = factory(root.FileUtility);
  }
})(this, function(FileUtility) {
  "use strict";
  
  var global = Function('return this')();
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var sh = new ActiveXObject('WScript.Shell');
  var _this = void 0;
  var _config = {};             // 設定ファイル
  var _codes = null;            // 実行ソースコード[{ファイルパス:ソースコード},...]
  var _WorkDirectory = null;    // 作業用ディレクトリ(sh.CurrentDirectoryの位置)
  var _ModuleDirectory = null;  // モジュールディレクトリ(実行プログラムの位置)
  
  _WorkDirectory = sh.CurrentDirectory;
  _ModuleDirectory = fs.GetParentFolderName(WScript.ScriptFullName);
  // カレントディレクトリをプログラム配置ディレクトリに変更
  // ドラッグ&ドロップ or ダブルクリック時に、パスがC:/Windows/system32になるのを回避
  sh.CurrentDirectory = _ModuleDirectory;
  
  /**
   * PrivateUnderscore.js
   * @version   4
   */
  {
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
  
  _this = function Process_constructor() {};
  
  _this._startTime = new Date();                // 開始時間
  _this.WorkDirectory = _WorkDirectory;         // 作業ディレクトリ
  _this.ModuleDirectory = _ModuleDirectory;     // プログラム配置ディレクトリ
  
  _this.configpath = _Process_getScriptPath('json');   // 設定ファイルパス
  
  /**
   * 日時のフォーマット
   * @param {string} format - フォーマット文字列
   * @param {(Date|number|string)} [opt_date=new Date()] - 日時
   * @param {string} [opt_prefix=''] - 前置語(例:'$'の場合、format='$yyyy/$MM/$dd')
   * @param {string} [opt_prefix=''] - 接尾語(例:'$'の場合、format='yyyy$/MM$/dd$')
   * @return {string} 書式文字列
   */
  _this.dateFormat =  function Process_dateFormat(format, opt_date, opt_prefix, opt_suffix) {
    return _dateFormat(format, opt_date, opt_prefix, opt_suffix);
  };
  
  /**
   * 時間のフォーマット
   * @param {string} format - フォーマット文字列
   * @param {number} time - 時間(ms単位)
   * @param {string} [opt_prefix=''] - 前置語(例:'$'の場合、format='$~H:$mm:$ss.$S')
   * @param {string} [opt_prefix=''] - 接尾語(例:'$'の場合、format='~H$:mm$:ss$.S$')
   * @return {string} 書式文字列
   */
  _this.timeFormat =  function Process_timeFormat(format, time, opt_prefix, opt_suffix) {
    return _timeFormat(format, time, opt_prefix, opt_suffix);
  };
  
  /**
   * ActiveXObject作成
   * @param {string[]} progIDs - プログラムID配列
   * @return {ActiveXObject} オブジェクト
   */
  _this.createActiveXObjects = function Process_createActiveXObjects(progIDs) {
    return _Process_createActiveXObjects(progIDs);
  };
  _this.createDOMDocument = function Process_createDOMDocument() {
    return _Process_createDOMDocument();
  };
  
  /**
   * 稼働時間を返す
   * @return {number} プログラム稼働時間(ms単位)
   */
  _this.currentTime = function Process_currentTime() {
    return new Date().getTime() - _this._startTime.getTime();
  };
  
  /**
   * 名前付きコマンドライン引数の取得
   * デフォルト値がなく、値の指定がない場合、trueを返す。
   * @param {string} name - 名前
   * @param {(boolean|number|string)} def - デフォルト値
   * @param {number} min - 最小値(defがnumberの場合に有効)
   * @param {number} max - 最大値(defがnumberの場合に有効)
   * @return {(boolean|number|string)} コマンドライン引数
   */
  _this.getNamedArgument = function Process_getNamedArgument(name, def, min, max) {
    return _Process_getNamedArgument(name, def, min, max);
  };
  
  /**
   * コマンドライン引数を配列で取得
   * @return {string[]} コマンドライン引数
   */
  _this.getArguments = function Process_getArguments() {
    var arg = [];
    for (var i=0; i<WScript.Arguments.Unnamed.length; i++) {
      arg.push(WScript.Arguments.Unnamed.Item(i));
    }
    return arg;
  };
  
  /**
   * すべてのコマンドライン引数の取得
   * @return {string[]} コマンドライン引数
   */
  _this.getAllArguments = function Process_getAllArguments() {
    var arg = [];
    for (var i=0; i<WScript.Arguments.length; i++) {
      arg.push(WScript.Arguments.Item(i));
    }
    return arg;
  };
  
  /**
   * スクリプトのパス取得
   * スクリプトのパスまたは、拡張子を変更したスクリプトパスを返す。
   * @param {string} opt_ext - 拡張子
   * @return {string} パス
   */
  _this.getScriptPath = function Process_getScriptPath(opt_ext) {
    return _Process_getScriptPath(opt_ext);
  }
  
  /**
   * 設定ファイルの読み込み
   * 個別設定、共通設定の順で設定ファイルを読み込む。
   * 先勝で設定を保持する。(個別設定を優先する)
   * JSON, FileUtilityが存在しない場合、動作しない。
   * @param {string} [opt_path=_this.getScriptPath('json')] - 読み込み設定パス
   */
  _this.loadConfig = function Process_loadConfig(opt_path) {
    var path = (!opt_path)? _this.configpath: opt_path;
    if (global.JSON && FileUtility) {
      // スクリプト設定ファイル(動的)
      var fullpath = fs.GetAbsolutePathName(path);
      var name = fs.GetFileName(fullpath);
      var folder = fs.GetParentFolderName(fullpath);
      for (var i=name.length-1; (i=name.lastIndexOf('.', i)) != -1; i--) {
        var subpath = fs.BuildPath(folder, name.substr(0, i)+'.json');
        if (fs.FileExists(subpath)) {
          extend(_config, FileUtility.loadJSON(subpath), true);
        }
      }
      // 共通設定ファイル(静的)
      var config = fs.GetAbsolutePathName('./.config.json');
      if (fs.FileExists(config)) {
        extend(_config, FileUtility.loadJSON(config), true);
      }
    }
    return _config;
  };
  _this.storeConfig = function Process_storeConfig(opt_path) {
    var path = (!opt_path)? _this.configpath: opt_path;
    if (global.JSON && FileUtility) {
      // 「.」で始まる要素を削除
      var temp = {};
      for (var key in _config) {
        if (_config.hasOwnProperty(key)) {
          if (!key.startsWith('.')) {
            temp[key] = _config[key];
          }
        }
      }
      // 保存
      var fullpath = fs.GetAbsolutePathName(path);
      FileUtility.storeJSON(temp, fullpath, true);
    }
  };
  _this.getConfig = function Process_getConfig() {
    return _config;
  };
  _this.setConfigPath = function Process_setConfigPath(path) {
    _this.configpath = path;
  };
  
  /**
   * 実行
   * debugは、廃止予定の引数です。（Process.debug()関数を利用するように変更願います）
   * logfile, formatは、廃止予定の引数です。（Console.jsを直接コールするように変更願います）
   * @param {Function} func - 開始関数(main関数)
   * @param {(null|boolean)} [opt_debug=null] - デバッグモード(null:本番/false:確認/true:デバッグ)
   * @param {boolean} [opt_logfile=false] - ログファイル
   * @param {boolean} [opt_format=null] - 文字コード(null:SystemDefault/true:UTF-16/false:ASCII)
   */
  _this.exec = function Process_exec(func, opt_debug, opt_logfile, opt_format) {
    if (Boolean.isBoolean(opt_debug) && global.console) {
      console.propertySet.format 
          = '[${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}]${prefix} ${indent}${message}';
      console.prefixSet[Console.FATAL] = '[致命的]';
      console.prefixSet[Console.ERROR] = '[エラー]';
      console.prefixSet[Console.WARN]  = '[警告]';
      console.prefixSet[Console.INFO]  = '[情報]';
      console.prefixSet[Console.CONF]  = '[構成]';
      console.prefixSet[Console.FINE]  = '[普通]';
      console.prefixSet[Console.FINER] = '[詳細]';
      console.prefixSet[Console.FINEST]= '[最も詳細]';
    }
    if (opt_logfile === true && global.console) {
      console.addOutFile(null, false, opt_format);
    }
    if (opt_debug === true && global.console) {
      console.config('Process start.');
    }
    
    var ret = -1;
    var args = _this.getArguments();
    
    if (opt_debug === true) {
      ret = func.apply(global, args);
      // 補足:停止位置を確認するため、try-catchしない
    } else {
      try {
        ret = func.apply(global, args);
      } catch (e) {
        if (opt_debug === false && global.console) {
          console.printStackTrace(e);
        }
      } finally {
      }
    }
    
    // 数値(int)ならば、戻り値に渡す
    ret = (Number.isInteger(ret))? ret: 0;
    
    if (opt_debug === true && global.console) {
      console.config('Process end.');
      console.config('exit: '+ret);
    }
    WScript.Quit(ret);
  };
  
  /**
   * デバッグ実行
   * @param {Function} func - 開始関数(main関数)
   */
  _this.debug = function Process_debug(func) {
    return _this.exec(func, true);
  };
  
  /**
   * cscriptで実行中であるか
   * @return {boolean} cscriptで実行中であるか
   */
  _this.isCScript = function Process_isCScript() {
    return WScript.FullName.toLowerCase().endsWith('cscript.exe');
  };
  
  /**
   * wscriptで実行中であるか
   * @return {boolean} wscriptで実行中であるか
   */
  _this.isWScript = function Process_isWScript() {
    return WScript.FullName.toLowerCase().endsWith('wscript.exe');
  };
  
  /**
   * cscriptで再実行
   * cscript以外から実行した場合、cscriptを非同期実行後、自身を強制終了する
   * @param {number} [style=0] - sh.Run関数の引数(0:非表示/...)
   * @param {boolean} [keep=false] - 実行後コマンドプロンプトを残すかいなか
   */
  _this.restartCScript = function Process_restartCScript(style, keep) {
    if (!_this.isCScript()) {
      var args = _this.getAllArguments();
      args.push('/wscript+');           // wscriptを設定(同一属性が設定済みの場合、先勝)
      
      style = (style)? style: 0;
      var commandline = '';
      if (style > 0) {
        commandline = (keep === true)? 'cmd /K ': 'cmd /C';
      }
      commandline += 'cscript "'+WScript.ScriptFullName+'"';
      for (var i=0; i<args.length; i++) {
        if (args[i].startsWith('/')) {
          var idx = args[i].indexOf(':');
          if (idx != -1) {
            commandline += ' '+args[i].substr(0, idx+1)+'"'+args[i].substr(idx+1)+'"';
          } else {
            commandline += ' '+args[i];
          }
        } else {
          commandline += ' "'+args[i]+'"';
        }
      }
      sh.Run(commandline, style, false);      // 非同期実行
      WScript.Quit(0);                        // 強制終了
    }
    // 補足:ログ設定後では、書き込みロックの関係で問題が起こる可能性があるため、
    //      ログ設定前に呼び出すこと
    // 補足:wscriptでの実行を考慮しているため、//B //JOB等のcscript側の起動オプションは考慮しない
    // 補足:WScriptがない環境で呼び出した場合、エラーとする(動作しないことを是とする)
  };
  
  /**
   * wscriptの実行を停止する
   * ダブルクリックでの誤動作防止などを想定
   * @param {number} [ret=0] - 戻り値
   * @param {string} message - ダイアログメッセージ
   */
  _this.stopWScript = function Process_stopWScript(ret, message) {
    if (_this.isWScript()) {
      if (message !== void 0) {
        WScript.Echo(''+message);
      }
      WScript.Quit(Number.isInteger(ret)? ret: 0);
    }
  };
  
  /**
   * ポップアップメッセージを表示する
   * wscript: GUIメッセージを表示する
   * cscript: CUIメッセージを表示する
   * cscript+wscript: GUIメッセージを表示する
   * @return {string} message - メッセージ
   */
  _this.echo =
  _this.Echo = function Process_echo(message) {
    if (_this.isWScript() || _this.getNamedArgument('wscript', false)) {
      // wscript
      sh.Popup(message);
    } else {
      // cscript
      WScript.Echo(message);
    }
  };
  
  /**
   * スクリプトをロードする
   * searchScripts()用のため、wsfファイルは、XML構造を消去して保存する。
   * @return {Object} コード
   */
  _this.loadScripts = function Process_loadScripts() {
    if (_codes == null) {
      _codes = {};
      
      var wsf = WScript.ScriptFullName;
      var ext = fs.GetExtensionName(wsf).toLowerCase();
      if (!FileUtility) {
      } else if (ext == 'wsf') {
        // wsfを解析
        var text = FileUtility.loadText(wsf)
                              .replace(/\r\n?/g,'\n');
        var xml  = _this.createDOMDocument();
        xml.loadXML(text);
        
        _codes[wsf] = '';
        var idx = 0;
        var scripts = xml.selectNodes('//script');
        for (var i=0; i<scripts.length; i++) {
          var src = scripts[i].getAttribute('src');
          if (src != null) {
            // 外部ファイル読み込み
            _codes[src] = FileUtility.loadText(src);
          }
          if (scripts[i].text != '') {
            // wsfをjseに変換
            // XML部分を削除(行番号を揃える)
            var eidx = text.indexOf(scripts[i].text, idx);
            while ((idx=text.indexOf('\n', idx)+1) < eidx && idx != -1) {
              _codes[wsf] += '\n';
            }
            idx = eidx + scripts[i].text.length;
            _codes[wsf] += scripts[i].text;
            // 補足:複数のスクリプト記述がある場合、
            //      スクリプトの実行順を維持できない可能性がある(実行しなければOK)
          }
        }
        text = xml = scripts = null;
      } else if (ext == 'js' || ext == 'jse') {
        _codes[wsf] = FileUtility.loadText(wsf);
      }
      for (var key in _codes) {
        if (_codes.hasOwnProperty(key)) {
          // 改行文字統一
          _codes[key] = _codes[key].replace(/\r\n?/g,'\n');
        }
      }
    }
    return _codes;
  };
  
  /**
   * 関数検索
   * 実行中のスクリプトの関数を検索する。
   * ソースコードのファイル名、行数、列数を返す。
   * @param {Functionn} func - 戻り値
   * @param {Object[]} 検索結果
   */
  _this.searchScripts = function Process_searchScripts(func) {
    // 関数文字列化 && 改行文字統一
    var text = func.toString().replace(/\r\n?/g,'\n');
    var fi   = text.indexOf('function');
    text = (fi > 0)? text.substr(fi): text;
    
    var ret   = [];
    var codes = Process_loadScripts();
    for (var key in codes) {
      if (codes.hasOwnProperty(key)) {
        var code = codes[key];
        for (var idx=0; ; idx++) {
          idx  = code.indexOf(text, idx);
          if (idx != -1) {
            var row =  1;
            var col = -1;
            for (var i=0,n=0; ; i=n+1,row++) {
              // 関数の行番号取得(\nを探す)
              n = code.indexOf('\n', i);
              if (n > idx || n == -1) {
                // 直前の改行文字からの文字数
                col = 1 + (idx - i);
                break;
              }
            }
            ret.push({
              'path': key, 
              'name': fs.GetFileName(key), 
              'index': idx, 'row': row, 'column': col});
          } else {
            break;
          }
        }
      }
    }
    return ret;
    // 補足:func.toString()は、時々失敗する。
    //      末尾の'}'がなくなる。タブが別の文字に置き換わる等
  };
  
  return _this;
});
