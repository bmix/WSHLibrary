/**
 * polyfill
 * 最低限使いそうなもののみ(これ以外は、es5-shim.js等を使用する)
 */
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (typeof Object.create != 'function') {
  Object.create = (function(undefined) {
    var Temp = function() {};
    return function (prototype, propertiesObject) {
      if(prototype !== Object(prototype) && prototype !== null) {
        throw TypeError('Argument must be an object, or null');
      }
      Temp.prototype = prototype || {};
      var result = new Temp();
      Temp.prototype = null;
      if (propertiesObject !== undefined) {
        Object.defineProperties(result, propertiesObject); 
      } 
      // to imitate the case of Object.create(null)
      if(prototype === null) {
        result.__proto__ = null;
      } 
      return result;
    };
  })();
}
// http://tokenposts.blogspot.jp/2012/04/javascript-objectkeys-browser.html
Object.keys = Object.keys || function (o) {
  if (o !== Object(o)) throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
Function.prototype.bind = Function.prototype.bind || function (oThis) {
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }
  var aArgs = Array.prototype.slice.call(arguments, 1), 
    fToBind = this, 
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP && oThis
        ? this
        : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
Number.isInteger = Number.isInteger || function (value) {
  return typeof value === 'number' && 
    isFinite(value) && 
    Math.floor(value) === value;
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
String.prototype.startsWith = String.prototype.startsWith || function (searchString, position){
  position = position || 0;
  return this.substr(position, searchString.length) === searchString;
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
String.prototype.endsWith = String.prototype.endsWith || function (searchString, position) {
  var subjectString = this.toString();
  if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
    position = subjectString.length;
  }
  position -= searchString.length;
  var lastIndex = subjectString.lastIndexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/trim
String.prototype.trim = String.prototype.trim || function () {
  return this.replace(/^\s+|\s+$/g,'');
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
Array.isArray = Array.isArray || function (arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
Array.prototype.indexOf = Array.prototype.indexOf || function (array, searchElement, fromIndex) {
  if (array == null) throw new TypeError('"array" is null or not defined');
  var o = Object(array);
  var len = o.length >>> 0;
  if (len === 0)  return -1;
  var n = fromIndex | 0;
  if (n >= len)  return -1;
  var k = n >= 0 ? n : Math.max(len + n, 0);
  for (; k < len; k++)  if (k in o && o[k] === searchElement) return k;
  return -1;
};
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date/now
Date.now = Date.now || function () {
  return new Date().getTime();
};

if (typeof(global   ) === 'undefined') {
  global = Function('return this')();
}
if (typeof(document ) === 'undefined') {
  document = new ActiveXObject('htmlfile');
  document.write('<html><head></head><body></body></html>');
}
if (typeof(window   ) === 'undefined') {
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
  // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON
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
  // https://github.com/google/closure-library/blob/master/closure/goog/base.js
  function inherits(childCtor, parentCtor) {
    function tempCtor() {}
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
    
    childCtor.base = function(me, methodName, var_args) {
      var args = new Array(arguments.length - 2);
      for (var i = 2; i < arguments.length; i++) {
        args[i - 2] = arguments[i];
      }
      return parentCtor.prototype[methodName].apply(me, args);
    };
  };
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
    return min + Math.floor(Math.random() * (max - min + 1));
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

/*!
 * WSH(JScript)用ライブラリ：Process.js
 * 初期化処理、実行/デバッグ補助、機能拡充処理、簡易polyfill
 * 入れる場所のない、便利機能詰め合わせ
 * 注意：原型をなくすほど仕様変更する可能性あり
 * @requires    module:ActiveXObject('Scripting.FileSystemObject')
 * @requires    module:ActiveXObject('WScript.Shell')
 * @requires    module:ActiveXObject('MSXML.DOMDocument')
 * @requires    module:WScript
 * @requires    module:FileUtility.js
 * @auther      toshi(https://www.bugbugnow.net/)
 * @license     MIT License
 * @version     1
 */
(function(root, factory) {
  if (!root.Process) {
    root.Process = factory(root.FileUtility);
  }
})(this, function(FileUtility) {
  "use strict";
  
  var global = Function('return this')();
  var fs = global.fs || new ActiveXObject('Scripting.FileSystemObject');
  var sh = global.sh || new ActiveXObject('WScript.Shell');
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
   * @version   2
   */
  {
    function _isBoolean(obj) {
      return Object.prototype.toString.call(obj) === '[object Boolean]';
    };
    function _isString(obj) {
      return Object.prototype.toString.call(obj) === '[object String]';
    };
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
      } else if (date === 'number' && isFinite(date) && Math.floor(date) === date) {
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
          def = arg;
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
  
  _this.WorkDirectory = _WorkDirectory;         // 作業ディレクトリ
  _this.ModuleDirectory = _ModuleDirectory;     // プログラム配置ディレクトリ
  
  /**
   * 日時のフォーマット
   * @param {string} format - フォーマット文字列
   * @param {(Date|number|string)} [opt_date=new Date()] - 日時
   * @param {string} [opt_prefix=''] - 前置語(例:'$'の場合、format='$yyyy/$MM/$dd')
   * @param {string} [opt_prefix=''] - 接尾語(例:'$'の場合、format='yyyy$/MM$/dd$')
   * @return {string} 書式文字列
   */
  _this.dateFormat =  function _dateFormat(format, opt_date, opt_prefix, opt_suffix) {
    return _dateFormat(format, opt_date, opt_prefix, opt_suffix);
  }
  
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
  }
  
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
   * 名前付きコマンドライン引数の取得
   * @param {string} name - 名前(例:「cscript sample.wsf /test+」ならば'test')
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
   */
  _this.loadConfig = function Process_loadConfig() {
    if (global.JSON && FileUtility) {
      // スクリプト設定ファイル(動的)
      var path1 = _this.getScriptPath('json');
      if (fs.FileExists(path1)) {
        extend(_config, FileUtility.loadJSON(path1), true);
      }
      // 共通設定ファイル(静的)
      var path0 = fs.GetAbsolutePathName('./.config.json');
      if (fs.FileExists(path0)) {
        extend(_config, FileUtility.loadJSON(path0), true);
      }
    }
    return _config;
  };
  _this.storeConfig = function Process_storeConfig() {
    if (global.JSON && FileUtility) {
      var path1 = _this.getScriptPath('json');
      var temp = {};
      for (var key in _config) {
        if (_config.hasOwnProperty(key)) {
          if (!key.startsWith('.')) {
            temp[key] = _config[key];
          }
        }
      }
      FileUtility.storeJSON(temp, path1, true);
    }
  };
  _this.getConfig = function Process_getConfig() {
    return _config;
  };
  
  /**
   * 
   * @param {Function} func - 開始関数(main関数)
   * @param {(null|boolean)} [opt_debug=null]  デバッグモード(null:本番/false:確認/true:デバッグ)
   * @param {boolean} [opt_logfile=false]  ログファイル
   * @param {boolean} [opt_format=null] - 文字コード(null:SystemDefault/true:UTF-16/false:ASCII)
   */
  _this.exec = function Process_exec(func, opt_debug, opt_logfile, opt_format) {
    if (_isBoolean(opt_debug)) {
      console.propertySet.format 
          = '[${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}]${prefix} ${indent}${message}';
      console.prefixSet[Console.FATAL] = '[致命的]';
      console.prefixSet[Console.ERROR] = '[エラー]';
      console.prefixSet[Console.WARN]  = '[警告]';
      console.prefixSet[Console.INFO]  = '[情報]';
      console.prefixSet[Console.CONFIG]= '[構成]';
      console.prefixSet[Console.FINE]  = '[普通]';
      console.prefixSet[Console.FINER] = '[詳細]';
      console.prefixSet[Console.FINEST]= '[最も詳細]';
      console.prefixSet[Console.TRACE] = '[トレース]';
    }
    if (opt_logfile === true) {
      console.addOutFile(null, false, opt_format);
    }
    if (opt_debug === true) {
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
        if (opt_debug === false) {
          console.printStackTrace(e);
        }
      } finally {
      }
    }
    
    // 数値(int)ならば、戻り値に渡す
    ret = (Number.isInteger(ret))? ret: 0;
    
    if (opt_debug === true) {
      console.config('Process end.');
      console.config('exit: '+ret);
    }
    WScript.Quit(ret);
  };
  
  /**
   * cscriptで再実行
   * cscript以外から実行した場合、cscriptを非同期実行後、自身を強制終了する
   * @param {number} [style=0] - sh.Run関数の引数(0:非表示/...)
   * @param {boolean} [keep=false] - 実行後コマンドプロンプトを残すかいなか
   */
  _this.restartCScript = function Process_restartCScript(style, keep) {
    if (!WScript.FullName.toLowerCase().endsWith('cscript.exe')) {
      style = (style)? style: 0;
      var args = _this.getAllArguments();
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
    if (WScript.FullName.toLowerCase().endsWith('wscript.exe')) {
      if (message !== void 0) {
        WScript.Echo(''+message);
      }
      WScript.Quit(Number.isInteger(ret)? ret: 0);
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
