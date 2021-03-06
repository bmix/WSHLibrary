/*!
 * HTTPUtility.js v3
 *
 * Copyright (c) 2018 toshi (https://github.com/k08045kk)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 *
 * The querySelectorAllPolyfill function is:
 * MIT license | https://github.com/mtsyganov/queryselector-polyfill/blob/master/LICENSE
 */

/**
 * WSH(JScript)用HTTPライブラリ
 * @requires    module:ActiveXObject('MSXML2.XMLHTTP')
 * @requires    module:ActiveXObject('MSXML.DOMDocument')
 * @requires    module:ActiveXObject('htmlfile')
 * @requires    module:WScript
 * @requires    ErrorUtility.js
 * @auther      toshi (https://github.com/k08045kk)
 * @version     3
 * @see         1 - add - 初版
 * @see         2 - update - テキスト編集処理を追加
 * @see         3 - update - _getParentElement() の処理改善
 */
(function(root, factory) {
  if (!root.HTTPUtility) {
    root.HTTPUtility = factory(root.ErrorUtility);
  }
})(this, function(ErrorUtility) {
  "use strict";
  
  var _this = void 0;
  
  /**
   * PrivateUnderscore.Process.js
   * @version   1
   */
  {
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
    function _getCallee() {
      var args = arguments;
      var func = args.callee;
      return func.caller;
    };
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
    function _errormessage(error) {
      return ''
          + (error.name? error.name: 'UnknownError')
          + '('
          + (error.number? ((error.number>>16)&0xFFFF)+'.'+(error.number&0xFFFF): '')
          + ')'
          + (error.message? ': '+error.message: '');
    };
    function _stack(callee, message, prefix) {
      callee = callee || _getCallee();
      var stack = [message];
      var funcs = [];
      for (var func=callee.caller; func; func=func.caller) {
        if (_Array_indexOf(funcs, func) !== -1) {
          stack.push(prefix+_getFunctionName(func)+'()...');
          break;
        }
        funcs.push(func);
        stack.push(prefix+_getFunctionName(func)+'()');
      }
      return stack.join('\n');
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
    function _getParentElement(element, tagName) {
      for (; element; element=element.parentElement) {
        if (element.tagName === tagName) {      // 大文字
          return element;
        }
      }
      return null;
    }
  }
  
  /**
   * コンストラクタ
   * @constructor
   */
  _this = function HTTPUtility_constructor() {};
  
  // 定数
  _this.GET = 'GET';
  _this.POST= 'POST';
  _this.READYSTATE_UNINITIALIZED= 0;
  _this.READYSTATE_LOADING      = 1;  // open呼び出し完了
  _this.READYSTATE_LOADED       = 2;  // send呼び出し完了、ヘッダ受信完了
  _this.READYSTATE_INTERACTIVE  = 3;  // ボディ受信中
  _this.READYSTATE_COMPLETE     = 4;  // 通信完了(成功失敗問わず)
  
  /**
   * UserAgent
   * Desktop: IE11(Windows)
   * Mobile:  Firefox(Android)
   * TODO:随時更新が必要
   *      https://developer.mozilla.org/ja/docs/Web/HTTP/Gecko_user_agent_string_reference
   */
  _this.Desktop = 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko';
  _this.Mobile  = 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';
  _this.UserAgent = _this.Desktop;
  
  function HTTPUtility_createXMLHttpRequest() {
    return _Process_createActiveXObjects([
      'Msxml2.ServerXMLHTTP.6.0',
      'Msxml2.ServerXMLHTTP.5.0',
      'Msxml2.ServerXMLHTTP.4.0',
      'Msxml2.ServerXMLHTTP.3.0',
      'Msxml2.ServerXMLHTTP',
      'Microsoft.ServerXMLHTTP',
      'Msxml2.XMLHTTP.6.0',
      'Msxml2.XMLHTTP.5.0',
      'Msxml2.XMLHTTP.4.0',
      'Msxml2.XMLHTTP.3.0',
      'Msxml2.XMLHTTP',
      'Microsoft.XMLHTTP']);
  };
  
  /**
   * 簡易パーサー
   * 開始文字列と終了文字列に挟まれた文字列を返す。
   * @param {string} html - 入力文字列
   * @param {string} start - 開始文字列
   * @param {string} end - 終了文字列
   * @return {string[]} 検索文字列の配列
   */
  _this.finds = function HTTPUtility_finds(html, start, end) {
    var results = [];
    var index = 0;
    while (true) {
      var s = html.indexOf(start, index);
      if (s != -1) {
        var e = html.indexOf(end, s + start.length);
        if (e != -1) {
          results.push(html.substring(s + start.length, e));
          index = e + end.length;
          continue;
        }
      }
      break;
    }
    return results;
  };
  
  /**
   * html文字列からHTMLタグを削除
   * @param {string} html - 入力文字列
   * @return {string} タグ削除済み文字列
   */
  _this.innerText = function HTTPUtility_innerText(html) {
    return html.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
  };
  
  /**
   * 親要素のタグを探す
   * @param {Element} element - 要素
   * @param {string} tagName - 探すタグ
   * @return {Element} 親要素
   */
  _this.getParentElement = function HTTPUtility_getParentElement(element, tagName) {
    return _getParentElement(element, tagName.toUpperCase());
  };
  
  /**
   * パラメータ作成
   * @param {Element} form - 要素
   * @param {Element} submit - 要素
   * @return {Object} パラメータ
   */
  _this.createParams = function HTTPUtility_createParams(form, submit) {
    var params = {};
    var inputs = form.getElementsByTagName('input');
    for (var i=0; i<inputs.length; i++) {
      if ((submit !== void 0) && (inputs[i].type == 'submit') && (inputs[i].name != submit)) {
        continue;
      }
      params[inputs[i].name] = inputs[i].value;
    }
    return params;
    // 補足:クリックしたsubmitボタンの値のみ送付する。
    //      複数submitボタンがある場合、クリックしたボタンのみ送付すべき。
  };
  
  /**
   * パラメータ文字列作成
   * @param {Object} params - パラメータ
   * @return {string} パラメータ文字列
   */
  _this.escapeParams = function HTTPUtility_escapeParams(params) {
    var param = null;
    if (params) {
      param = '';
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          if (param.length > 0) { param += '&'; }
          param += encodeURIComponent(key).replace(/%20/g, '+')
                + '=' + encodeURIComponent(params[key]).replace(/%20/g, '+');
        }
      }
    }
    return param;
  };
  
  function HTTPUtility__standbyUnsync(xhr, state, opt) {
    var timeout  = (state === _this.READYSTATE_COMPLETE)? opt.receiveTimeout:  opt.sendTimeout;
    var interval = (state === _this.READYSTATE_COMPLETE)? opt.receiveInterval: opt.sendInterval;
    var count = Math.floor(timeout / interval);
    var delay = timeout - (count * interval);
    WScript.Sleep(delay);
    for (var c=0; (timeout==0) || (c<count); c++) {
      if (xhr.readyState >= state) {  break;  }
      WScript.Sleep(interval);
    }
    return (xhr.readyState >= state);
  }
  function HTTPUtility__standbySync(xhr, state, opt) {
    return (xhr.readyState >= state);
  }
  
  /**
   * HTTP要求
   * 注意: option.unsync=trueを指定しても、本関数としては、同期処理を行う。
   * @param {string} method - メソッド
   * @param {string} url - URL
   * @param {Object} option - オプション
   * @return {Object} 結果
   */
  _this.httpMethod = function HTTPUtility_httpMethod(method, url, option) {
    // オプションの初期値
    if (!option)
      option = {};
    if (!option.headers)
      option.headers = {};
    if (option.sendTimeout === void 0)
      option.sendTimeout = 30*1000;
    if (option.sendInterval === void 0)
      option.sendInterval = 50;
    if (option.receiveTimeout === void 0)
      option.receiveTimeout = 30*1000;
    if (option.receiveInterval === void 0)
      option.receiveInterval = 100;
    
    // キャッシュ無効 304対策
    if (option.headers['Pragma'] === void 0)
      option.headers['Pragma'] = 'no-cache';
    if (option.headers['Cache-Control'] === void 0)
      option.headers['Cache-Control'] = 'no-cache';
    if (option.headers['If-Modified-Since'] === void 0)
      option.headers['If-Modified-Since'] = 'Thu, 01 Jun 1970 00:00:00 GMT';
    
    // GET/POST用処理
    if (option.content === void 0)
      option.content = null;
    else if (option.headers['Content-Type'] === void 0)
      option.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // 待機(既定状態まで待つ)
    if (option.unsync === void 0)
      option.unsync = false;
    if (option.standby === void 0)
      option.standby = (option.unsync)? HTTPUtility__standbyUnsync: HTTPUtility__standbySync;
    
    // 処理本体
    var ret = null,
        xhr;
    try {
      xhr = HTTPUtility_createXMLHttpRequest();
      xhr.open(method, url, option.unsync);
      
      // ヘッダを設定
      for (var key in option.headers) {
        if (option.headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, option.headers[key]);
        }
      }
      
      // 送信
      xhr.send(option.content);
      
      // 受信待ち
      if (option.standby(xhr, _this.READYSTATE_INTERACTIVE, option) === false) {
      } else if (option.standby(xhr, _this.READYSTATE_COMPLETE, option) === false) {
      } else if (option.unsync) {
        // 追加待機(完了直後に処理すると、エラーとなることがある)
        WScript.Sleep(500);
      }
      
      // 戻り値作成
      // ヘッダ作成
      ret = {'status':xhr.status,'statusText':xhr.statusText,headers:{}};
      var headers = xhr.getAllResponseHeaders().replace(/\r\n?/g,'\n').split('\n');
      for (var h=0; h<headers.length; h++) {
        var m = headers[h].split(': ');
        if (m.length == 2) {
          ret.headers[m[0]] = m[1];
        }
      }
      
      // 受信データ作成
      if (ret.headers['Content-Type'] && ret.headers['Content-Type'].indexOf('text') == 0) {
        ret.responseText = xhr.responseText;
      } else {
        ret.responseBody = xhr.responseBody;
      }
    } catch (e) {
      // 要求キャンセル
      try {
        xhr.abort();
      } catch (e2) {}
      
      // エラー処理
      ret = {'status':-1};
      if (ErrorUtility != null) {
        if (!e.stackframes) {
          ErrorUtility.captureStackTrace(e);
        }
        ret.error = ErrorUtility.stack(e);
      } else {
        ret.error = _stack(null, _errormessage(e), '    at ');
      }
    }
    xhr = null; // 開放(10000個のハンドラの取り尽くしを回避)
    return ret;
    // {status: number, statusText, string, headers: {header: string, ..}, 
    //  responseText, string, responseBody: Blob[], error: string}
  };
  
  /**
   * GET通信用
   * @param {string} url - URL
   * @param {Object} params - パラメータ
   * @param {Object} option - オプション
   * @return {Object} データ
   */
  _this.httpGET = function HTTPUtility_httpGET(url, params, option) {
    if (option == null)
      option = {};
    if (option['User-Agent'] === void 0)
      option['User-Agent'] = _this.UserAgent;
    if (params)
      url += '?' + _this.escapeParams(params);
    return _this.httpMethod(_this.GET, url, option);
  };
  
  /**
   * POST通信用
   * @param {string} url - URL
   * @param {Object} params - パラメータ
   * @param {Object} option - オプション
   * @return {Object} 結果
   */
  _this.httpPOST = function HTTPUtility_httpPOST(url, params, option) {
    if (option == null)
      option = {};
    if (option['User-Agent'] === void 0)
      option['User-Agent'] = _this.UserAgent;
    if (option['content'] === void 0)
      option['content'] = _this.escapeParams(params);
    return _this.httpMethod(_this.POST, url, option);
  };
  
  /**
   * HTMLドキュメントを取得する
   * 補足:IE7程度のjsで動作するため、querySelectorが使えない。
   *      Google検索するとCookieのダイアログがでるため、注意。
   * @param {string} text - HTMLデータ
   * @return {ActiveXObject('htmlfile')} html
   */
  _this.html = function HTTPUtility_html(text) {
    // IE11互換
    //text = text.replace(/(<head.*>)/i, '$1<meta http-equiv="x-ua-compatible" content="IE=11"/>');
    
    var doc = new ActiveXObject('htmlfile');
    doc.write(text);
    
    if (!doc.querySelectorAll) {
      // see https://github.com/mtsyganov/queryselector-polyfill/blob/master/index.js
      doc.querySelectorAll = 
      function querySelectorAllPolyfill(r, c, i, j, a) {
        var d=doc, 
            s=d.createStyleSheet();
        a = d.all;
        c = [];
        r = r.replace(/\[for\b/gi, '[htmlFor').split(',');
        for (i = r.length; i--;) {
          s.addRule(r[i], 'k:v');
          for (j = a.length; j--;) {
            a[j].currentStyle.k && c.push(a[j]);
          }
          s.removeRule(0);
        }
        return c.reverse();     // 逆順で取得するため、リバース
      };
    }
    if (!doc.querySelector) {
      doc.querySelector = 
      function querySelectorPolyfill(selectors) {
        var elements = this.querySelectorAll(selectors);
        return (elements.length) ? elements[0]: null;
      };
    }
    if (!doc.getElementsByClassName) {
      doc.getElementsByClassName = 
      function getElementsByClassNamePolyfill(classNames) {
        classNames = String(classNames).replace(/^|\s+/g, '.');
        return this.querySelectorAll(classNames);
      };
    }
    return doc;
  };
  
  /**
   * XMLドキュメントを取得する
   * @param {string} text - HTMLデータ
   * @return {ActiveXObject('DOMDocument')} xml
   */
  _this.xml = function HTTPUtility_xml(text) {
    var xml = _Process_createDOMDocument();
    xml.loadXML(text);
    return xml;
  };
  
  // ファイル取得
  function HTTPUtility_httpDocument(type, url, method, params, option) {
    method = (method === void 0)? _this.GET: method;
    
    var ret = null;
    if (method === _this.GET) {       ret = _this.httpGET(url, params, option);   }
    else if (method === _this.POST) { ret = _this.httpPOST(url, params, option);  }
    
    var doc = null;
    if (ret && ret.responseText) {
      switch (type) {
      case 'TEXT':  doc = ret.responseText; break;
      case 'HTML':  doc = _this.html(ret.responseText); break;
      case 'XML':   doc = _this.xml(ret.responseText);  break;
      default:      break;
      }
    }
    ret = null;
    return doc;
  };
  
  /**
   * TEXTファイルの取得
   * @param {string} url - URL
   * @param {string} method - メソッド
   * @param {Object} params - パラメータ
   * @param {Object} option - オプション
   * @return {ActiveXObject('htmlfile')} 結果
   */
  _this.httpTEXT = function HTTPUtility_httpTEXT(url, method, params, option) {
    return HTTPUtility_httpDocument('TEXT', url, method, params, option);
  };
  
  /**
   * HTMLファイルの取得
   * @param {string} url - URL
   * @param {string} method - メソッド
   * @param {Object} params - パラメータ
   * @param {Object} option - オプション
   * @return {ActiveXObject('htmlfile')} 結果
   */
  _this.httpHTML = function HTTPUtility_httpHTML(url, method, params, option) {
    return HTTPUtility_httpDocument('HTML', url, method, params, option);
  };
  
  /**
   * XMLファイルの取得
   * @param {string} url - URL
   * @param {string} method - メソッド
   * @param {Object} params - パラメータ
   * @param {Object} option - オプション
   * @return {ActiveXObject('DOMDocument')} xml
   */
  _this.httpXML = function HTTPUtility_httpXML(url, method, params, option) {
    return HTTPUtility_httpDocument('XML', url, method, params, option);
  };
  
  return _this;
});
