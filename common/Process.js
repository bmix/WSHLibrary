/**
 * polyfill
 * 本ファイル内で使用するor最低限使いそうなもののみ(それ以外は、polyfill.jsを使用すること)
 */
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/create
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
Object.keys = Object.keys || function(o) {
  if (o !== Object(o)) throw new TypeError('Object.keys called on a non-object');
  var k=[],p;
  for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
  return k;
};
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
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
// 参考:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' && 
    isFinite(value) && 
    Math.floor(value) === value;
};
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
String.prototype.startsWith = String.prototype.startsWith || function(searchString, position){
  position = position || 0;
  return this.substr(position, searchString.length) === searchString;
};
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
String.prototype.endsWith = String.prototype.endsWith || function(searchString, position) {
  var subjectString = this.toString();
  if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
    position = subjectString.length;
  }
  position -= searchString.length;
  var lastIndex = subjectString.lastIndexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
// 参考:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement /*, fromIndex */ ) {
  "use strict";
  if (this == null)  throw new TypeError();
  var t = Object(this);
  var len = t.length >>> 0;
  if (len === 0)  return -1;
  var n = 0;
  if (arguments.length > 0) {
    n = Number(arguments[1]);
    if (n != n) { // shortcut for verifying if it's NaN
      n = 0;
    } else if (n != 0 && n != Infinity && n != -Infinity) {
      n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
  }
  if (n >= len)  return -1;
  var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
  for (; k < len; k++)  if (k in t && t[k] === searchElement)  return k;
  return -1;
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
// json3.js用
dontEnums = global.dontEnums || [
  'toString',
  'toLocaleString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'constructor'
];
if (!global.ModuleDirectory) {
  WorkingDirectory = sh.CurrentDirectory;
  // MakeExe/ModulePath.js
  if (WScript && WScript.ScriptFullName) {
    ModuleDirectory = fs.getParentFolderName((function() {
      var ret,
          T, fHandle;
      ret = WScript.ScriptFullName;
      T   = ret.toLowerCase();
      T   = T.substring(0,T.length-3);
      if (T.charAt(T.length-1) == '.') {
        T = T.substring(0,T.length-1);
      }
      if (T.substring(T.length-4,T.length) == '.tmp') {
        try {
          fHandle = fs.OpenTextFile(T);
          T = fHandle.ReadLine();
          fHandle.Close();
          ret = T;
        } catch (e) {}
      }
      return ret;
    })());
    // カレントディレクトリを補正
    sh.CurrentDirectory = global.ModuleDirectory;
  } else {
    ModuleDirectory = sh.CurrentDirectory;
  }
}

// https://github.com/google/closure-library/blob/master/closure/goog/base.js
inherits = global.inherits || function(childCtor, parentCtor) {
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

/**
 * Process
 * @requires    module:WScript
 * @auther      toshi(http://www.bugbugnow.net/)
 * @license     MIT License
 * @version     1
 */
(function(global, factory) {
  if (!global.Process) {
    global.Process = factory(global);
  }
})(this, function(global) {
  "use strict";
  
  /**
   * PrivateUnderscore.js
   * @version   1
   */
  {
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
    function _isInteger(value) {
      return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
    function _isBoolean(obj) {
      return Object.prototype.toString.call(obj) === '[object Boolean]';
    };
    function _isString(obj) {
      return Object.prototype.toString.call(obj) === '[object String]';
    };
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
    function _createDOMDocument() {
      return (function _createActiveXObject(progIDs) {
        for (var i=0; i<progIDs.length; ++i) {
          try {
            return new ActiveXObject(progIDs[i]);
          } catch (e) {
            if (i == progIDs.length - 1) {  throw e;  }
          }
        }
        return null;
      })([
        'MSXML2.DOMDocument.6.0',
        'MSXML2.DOMDocument.3.0',
        'Msxml2.DOMDocument',
        'microsoft.XMLDOM']);
    };
    function _WScript_getNamedArgument(name, def, min, max) {
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
    // TODO: MakeExe対応が必要
    function _getScriptPath(opt_ext) {
      var ext = (opt_ext && opt_ext.length !== 0)? '.'+opt_ext: '';
      var parent = fs.GetParentFolderName(WScript.ScriptFullName);
      var base = fs.GetBaseName(WScript.ScriptFullName);
      return fs.BuildPath(parent, base + ext);
    };
  }
  
  var _this = void 0;
  var _codes = null;    // 実行ソースコード[{ファイルパス:ソースコード},...]
  
  _this = function Process_constructor() {};
  
  _this.type = {};
  _this.type.start    = 'start';
  _this.type.execute  = 'execute';
  _this.type.completed= 'completed';
  _this.type.error    = 'error';
  _this.type.end      = 'end';
  
  _this.config = {};
  
  /**
   * 名前付きコマンドライン引数の取得
   * @param {string} name - 名前(例:「cscript sample.wsf /test+」ならば'test')
   * @param {(boolean|number|string)} def - デフォルト値
   * @param {number} min - 最小値(defがnumberの場合に有効)
   * @param {number} max - 最大値(defがnumberの場合に有効)
   * @returns {(boolean|number|string)} コマンドライン引数
   */
  _this.getNamedArgument = function Process_getNamedArgument(name, def, min, max) {
    return _WScript_getNamedArgument(name, def, min, max);
  };
  
  /**
   * コマンドライン引数を配列で取得
   * @returns {string[]} コマンドライン引数
   */
  _this.getArguments = function Process_getArguments() {
    var arg = [];
    for (var i=0; i<WScript.Arguments.Unnamed.length; i++) {
      arg.push(WScript.Arguments.Unnamed.Item(i));
    }
    return arg;
  };
  _this.getAllArguments = function Process_getAllArguments() {
    var arg = [];
    for (var i=0; i<WScript.Arguments.length; i++) {
      arg.push(WScript.Arguments.Item(i));
    }
    return arg;
  };
  
  /**
   * スクリプトの
   * @returns {(boolean|number|string)} コマンドライン引数
   */
  _this.getScriptPath = function Process_getScriptPath(opt_ext) {
    return _getScriptPath(opt_ext);
  }
  
  /**
   * 設定ファイルの読み込み
   * 個別設定、共通設定の順で設定ファイルを読み込む。
   * 先勝で設定を保持する。(個別設定を優先する)
   */
  _this.loadConfig = function Process_loadConfig() {
    if ('JSON' in global) {
      // スクリプト設定ファイル(動的)
      var path1 = _this.getScriptPath('json');
      if (fs.FileExists(path1)) {
        var config1 = FileUtility.loadJSON(path1);
        _extend(_this.config, config1, true);
      }
      // 共通設定ファイル(静的)
      var path0 = fs.GetAbsolutePathName('./.config.json');
      if (fs.FileExists(path0)) {
        var config0 = FileUtility.loadJSON(path0);
        _extend(_this.config, config0, true);
      }
    }
    return _this.config;
  };
  _this.storeConfig = function Process_storeConfig() {
    if ('JSON' in global) {
      var path1 = _this.getScriptPath('json');
      var temp = {};
      for (var key in _this.config) {
        if (_this.config.hasOwnProperty(key)) {
          if (!key.startsWith('.')) {
            temp[key] = _this.config[key];
          }
        }
      }
      FileUtility.storeJSON(temp, path1, true);
    }
  };
  _this.getConfig = function Process_getConfig() {
    return _this.config;
  };
  /**
   * 
   * @param {Function} func              開始関数(main関数)
   * @param {(null|boolean)} [opt_debug=null]  デバッグモード(null:本番/false:確認/true:デバッグ)
   * @param {boolean} [opt_logfile=false]  ログファイル
   */
  _this.exec = function Process_exec(func, opt_debug, opt_logfile) {
    if (_isBoolean(opt_debug)) {
      console.logformat = '[${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}]${prefix} ${message}';
    }
    if (opt_logfile === true) {
      console.addOutFile(null, false);
    }
    if (opt_debug === true) {
      console.config('Process start.');
    }
    
    _this.dispatchEvent(_this.type.start, true);
    
    var args = _this.getArguments();
    _this.dispatchEvent({'type':_this.type.execute,'func':func,'args':args}, true);
    
    var ret = -1;
    if (opt_debug === true) {
      ret = func.apply(global, args);
      _this.dispatchEvent({'type':_this.type.completed,'ret':ret}, false);
      _this.dispatchEvent(_this.type.end, false);
      // 補足:停止位置を確認するため、try-catchしない
    } else {
      try {
        ret = func.apply(global, args);
        _this.dispatchEvent({'type':_this.type.completed,'ret':ret}, false);
      } catch (e) {
        if (opt_debug === false) {
          console.printStackTrace(e);
        }
        _this.dispatchEvent({'type':_this.type.error,'e':e}, false);
      } finally {
        _this.dispatchEvent(_this.type.end, false);
      }
    }
    
    if (opt_debug === true) {
      console.config('Process end.');
    }
    
    // 数値(int)ならば、戻り値に渡す
    ret = (_isInteger(ret))? ret: 0;
    WScript.Quit(ret);
  };
  
  _this.listenerSet = {};
  _this.addEventListener = function Process_addEventListener(type, listener) {
    if (_this.listenerSet[type] === void 0) {  _this.listenerSet[type] = [];  }
    _this.listenerSet[type].push(listener);
  };
  _this.removeEventListener = function Process_removeEventListener(type, listener) {
    if (_this.listenerSet[type]) {
      var listeners = _this.listenerSet[type];
      for (var i=listeners.length-1; i>=0; i--) {       // 逆順(最近登録が削除されやすい？)
        if (listeners[i] === listener) {
          listeners.splice(i, 1);                       // 取り除く
          break;
        }
      }
    }
  };
  _this.dispatchEvent = function Process_dispatchEvent(e, order) {
    if (_isString(e)) {  e = {'type':e};  }         // 引数が文字列ならば、オブジェクト化
    if (_this.listenerSet[e.type]) {
      var listeners = _this.listenerSet[e.type];
      if (order !== false) {    // 登録順
        for (var i=0; i<listeners.length; i++) {  listeners[i](e);  }
      } else {                  // 逆順
        for (var i=listeners.length-1; i>=0; i--) {  listeners[i](e);  }
      }
    }
  };
  /**
   * cscriptで再実行
   * cscriptを非同期実行後、自身を強制終了する
   * @param {number} [style=0] - sh.Run関数の引数(0:非表示/...)
   * @param {boolean} [keep=false] - 実行後コマンドプロンプトを残すかいなか
   */
  _this.cscript = function Process_cscript(style, keep) {
    if (WScript.FullName.substr(-11).toLowerCase() !== 'cscript.exe') {
      style = (style)? style: 0;
      var args = _this.getAllArguments();
      var commandline = '';
      if (style > 0) {
        commandline = (keep === true)? 'cmd /K ': 'cmd /C';
      }
      commandline += 'cscript "'+WScript.ScriptFullName+'" //nologo';
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
  
  _this.loadScripts = function Process_loadScripts() {
    if (_codes == null) {
      _codes = {};
      
      var wsf = WScript.ScriptFullName;
      var ext = fs.GetExtensionName(wsf).toLowerCase();
      if (ext == 'wsf') {
        // wsfを解析
        var text = FileUtility.loadText(wsf);
        var xml  = _createDOMDocument();
        xml.loadXML(text);
        
        _codes[wsf] = '';
        var idx = 0;
        var scripts = xml.selectNodes('//script');
        for (var i=0; i<scripts.length; i++) {          // scriptタグをループ
          var src = scripts[i].getAttribute('src');
          if (src != null) {
            _codes[src] = FileUtility.loadText(src);    // 外部ファイル読み込み
          }
          if (scripts[i].text != '') {                  // wsfをjseに変換
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
          _codes[key] = _codes[key].replace(/\r\n?/g,'\n');    // 改行文字統一
        }
      }
    }
    return _codes;
  };
  _this.searchScripts = function Process_searchScripts(func) {
    var text = func.toString().replace(/\r\n?/g,'\n');  // 関数文字列化 && 改行文字統一
    var fi   = text.indexOf('function');
    text = (fi > 0)? text.substr(fi): text;             // functionを先頭にする
    
    var ret   = [];
    var codes = _this.loadScripts();
    for (var key in codes) {
      if (codes.hasOwnProperty(key)) {
        var code = codes[key];
        for (var idx=0; ; idx++) {
          idx  = code.indexOf(text, idx);               // 関数を検索
          if (idx != -1) {
            var row =  1;
            var col = -1;
            for (var i=0, n=0; ; i=n+1, row++) {
              n = code.indexOf('\n', i);                // 関数の行番号取得(\nを探す)
              if (n > idx || n == -1) {
                col = 1 + (idx - i);                    // 直前の改行文字からの文字数
                break;
              }
            }
            ret.push({
              'path':key, 
              'name':fs.GetFileName(key), 
              'index':idx, 'row':row, 'column':col});
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
