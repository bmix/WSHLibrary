/*!
 * ErrorUtility.FileInfo.js v1
 *
 * Copyright (c) 2019 toshi (https://github.com/k08045kk)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

/**
 * WSH(JScript)用エラー出力ファイル情報付加
 * エラー出力用のトレース文字列にファイル情報を付加する。
 * 実行中のWSF/JS/JSEファイルを読み込んで指定関数を検索し、関数のファイルパス、行数、列数を返す。
 * @requires    ErrorUtility.js
 * @auther      toshi (https://github.com/k08045kk)
 * @version     1
 * @see         1.20190823 - add - 初版（ErrorUtility.js v4、Process.js v12、FileUtility.js v16分離）
 */
(function(root, factory) {
  if (root.ErrorUtility && !root.ErrorUtility._plugin_FileInfo) {
    root.ErrorUtility._plugin_FileInfo = true;
    factory(root.ErrorUtility);
  }
})(this, function(_this) {
  "use strict";
  
  // -------------------- private --------------------
  
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var _codes = null;            // 実行ソースコード {ファイルパス:ソースコード, ...}
  
  /**
   * PrivateUnderscore.js
   * @version   4
   */
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
  
  
  // -------------------- static --------------------
  
  
  /**
   * スタックトレース
   * @param {Array} frame - エラー情報
   * @return {string} トレース文字列
   * @override
   */
  _this._createStackTraceText = function ErrorUtility$FileInfo__createStackTraceText(frame) {
    var msg = [];
    
    msg.push(_this.trace(frame, true));
    
    // 拡張情報(ファイル名:行数:列数/文字列)
    try {
      var scripts = _this.searchScripts(frame[0]);
      if (scripts.length == 1) {
        msg.push(' - '+scripts[0].name+':'+scripts[0].row+':'+scripts[0].column+'');
      }
      // 補足:0個の可能性あり、2個以上の可能性あり、全部表示するのもあり？
    } catch (e) {}  // エラー出力処理中であるため、なにもしない
    
    return msg.join('');
  };
  
  
  /**
   * エラー作成
   * エラー作成と同時にキャプチャする。
   * エラー作成箇所は、本関数を直接コールすること。
   * @param {string} opt_message - エラーメッセージ
   * @param {Function} opt_root - トレースを開始する直前の関数(null:本関数)
   * @param {(string|Function)} opt_error - エラー
   * @return {Error} エラー
   * @override
   */
  _this._create_Backup = _this.create;
  _this.create = function ErrorUtility$FileInfo_create(opt_message, opt_root, opt_error) {
    var error = _this._create_Backup(opt_message, opt_root, opt_error);
    
    // 補助情報を追加
    try {
      var scripts = _this.searchScripts(error.stackframes[0][0]);
      if (scripts.length === 1) {
        error.fileName = scripts[0].name;
        error.lineNumber = scripts[0].row;
        error.columnNumber = scripts[0].column;
      }
    } catch (e) {}  // エラー出力処理中であるため、なにもしない
    
    return error;
  };
  
  /**
   * スクリプトをロードする
   * searchScripts()用のため、wsfファイルは、XML構造を消去して保存する。
   * @return {Object} コード
   */
  _this.loadScripts = function ErrorUtility$FileInfo_loadScripts() {
    if (_codes == null) {
      _codes = {};
      
      var wsf = WScript.ScriptFullName;
      var ext = fs.GetExtensionName(wsf).toLowerCase();
      if (ext == 'wsf') {
        // wsfを解析
        var text = _loadText(wsf)
                              .replace(/\r\n?/g,'\n');
        var xml  = _Process_createDOMDocument();
        xml.loadXML(text);
        
        _codes[wsf] = '';
        var idx = 0;
        var scripts = xml.selectNodes('//script');
        for (var i=0; i<scripts.length; i++) {
          var src = scripts[i].getAttribute('src');
          if (src != null) {
            // 外部ファイル読み込み
            _codes[src] = _loadText(src);
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
        _codes[wsf] = _loadText(wsf);
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
  _this.searchScripts = function ErrorUtility$FileInfo_searchScripts(func) {
    // 関数文字列化 && 改行文字統一
    var text = func.toString().replace(/\r\n?/g,'\n');
    var fi   = text.indexOf('function');
    text = (fi > 0)? text.substring(fi): text;
    
    var ret   = [];
    var codes = _this.loadScripts();
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
});
