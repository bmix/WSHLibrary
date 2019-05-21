/*!
 * FileUtility.Shell.js v1
 *
 * Copyright (c) 2019 toshi - https://www.bugbugnow.net/p/profile.html
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

/**
 * WSH(JScript)用ファイル関連（シェル関連）ライブラリ
 * 送る、ゴミ箱へ送る、zip圧縮、zip解凍の機能を提供する。
 * @requires    module:ActiveXObject('Scripting.FileSystemObject')
 * @requires    module:ActiveXObject('Shell.Application')
 * @requires    module:WScript
 * @requires    module:FileUtility.js
 * @auther      toshi(https://www.bugbugnow.net/p/profile.html)
 * @license     MIT License
 * @version     1
 * @see         1 - add - 初版
 */
(function(root, factory) {
  if (root.FileUtility && !root.FileUtility.ShellSpecialFolderConstants) {
    // FileUtilityにShell関連機能を追加
    factory(root.FileUtility);
  }
})(this, function(_this) {
  "use strict";
  
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var shell = new ActiveXObject("Shell.Application");
  
  // Shell.Application関連定義
  _this.ShellSpecialFolderConstants = {
    ssfDESKTOP:   0,    // デスクトップ(仮想)
    ssfIE:        1,    // Internet Explorer
    ssfPROGRAMS:  2,    // プログラム
    ssfCONTROLS:  3,    // コントロールパネル
    ssfPRINTERS:  4,    // プリンタ
    ssfPERSONAL:  5,    // マイドキュメント
    ssfFAVORITES: 6,    // お気に入り
    ssfSTARTUP:   7,    // スタートアップ
    ssfRECENT:    8,    // 最近使ったファイル
    ssfSENDTO:    9,    // 送る
    ssfBITBUCKET: 10,   // ごみ箱
    ssfSTARTMENU: 11,   // スタートメニュー
    ssfDESKTOPDIRECTORY: 16,  // デスクトップ(フォルダ)
    ssfDRIVES:    17,   // マイコンピュータ
    ssfNETWORK:   18,   // ネットワークコンピュータ
    ssfNETHOOD:   19,   // NetHood
    ssfFONTS:     20,   // フォント
    ssfTEMPLATES: 21    // テンプレート
  };
  
  /**
   * 送る
   * @param {string} path - ファイル/フォルダパス
   * @param {number} sendto - 送り先(ShellSpecialFolderConstants)
   * @return {boolean} 成否
   */
  _this.sendTo = function FileUtility_sendTo(path, sendto) {
    var ret = false;
    var fullpath = fs.GetAbsolutePathName(path);
    var isFile   = fs.FileExists(fullpath);
    if (isFile ||  fs.FolderExists(fullpath)) {
      shell.NameSpace(sendto).MoveHere(fullpath, 4);
      
      // 完了待機(ファイル存在確認)
      if (isFile) { while (fs.FileExists(fullpath)) {   WScript.Sleep(100); } }
      else {        while (fs.FolderExists(fullpath)) { WScript.Sleep(100); } }
      
      shell = null;
      ret = true;
    }
    return ret;
  }
  
  /**
   * ゴミ箱へ送る
   * ファイル・フォルダをゴミ箱へ送る（削除する）
   * @param {string} path - ファイル/フォルダパス
   * @return {boolean} 成否
   */
  _this.sendToTrash = function FileUtility_sendToTrash(path) {
    return _this.sendTo(path, _this.ShellSpecialFolderConstants.ssfBITBUCKET);
  };
  
  /**
   * zip圧縮
   * Windows標準機能のみでzip圧縮する。(Microsoftサポート対象外)
   * 圧縮が終わるまで処理を抜けない。
   * @param {string} zipfile - 作成するzipファイルパス
   * @param {string[]} files - 格納ファイルパス配列(フォルダも可)
   * @return {boolean}          成否
   */
  _this.zip = function FileUtility_zip(zipfile, files) {
    var names = [];
    for (var i=0; i<files.length; i++) {
      // ファイルの存在確認
      files[i] = fs.GetAbsolutePathName(files[i]);
      if (!fs.FileExists(files[i]) && !fs.FolderExists(files[i])) {
        return false;                           // ファイルがない
      }
      // ファイル名重複確認
      var name = fs.GetFileName(files[i]);
      for (var n=0; n<i; n++) {
        if (names[n] == name) {
          return false;                         // 同名ファイルがある
        }
      }
      names.push(name);
    }
    
    // zipファイル作成
    var zipfullpath = fs.GetAbsolutePathName(zipfile);
    if (!fs.FileExists(zipfullpath) && !fs.FolderExists(zipfullpath)) {
      var ts = null;
      try {
        ts = fs.OpenTextFile(zipfullpath, _this.OpenTextFileIomode.ForWriting, true);
        ts.Write(String.fromCharCode(80,75,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0));
      } catch (e) {
        throw e;
      } finally {
        try {
          if (ts != null) {  ts.Close();  }     // ファイル閉じる
        } catch (e) {
          throw e;
        } finally {
          ts = null;
        }
      }
    } else {
      return false;
    }
    
    // ファイル格納
    var zipfolder = shell.NameSpace(zipfullpath);
    for (var i=0; i<files.length; i++) {
      zipfolder.CopyHere(files[i], 4);          // zipへコピー(進歩バー非表示)
      
      // 書き込み待機(Sleepがないと動作しない、正常なzipが作成されない)
      while (true) {
        try {
          WScript.Sleep(100);
          fs.OpenTextFile(zipfullpath, _this.OpenTextFileIomode.ForAppending, false).Close();
          WScript.Sleep(100);
          break;
        } catch (e) {}
      }
    }
    
    return true;
  };
  
  /**
   * zip解凍
   * Windows標準機能のみでzip解凍する。(Microsoftサポート対象外)
   * 解凍が終わるまで処理を抜けない。
   * @param {string} zipfile - 作成するzipファイルパス
   * @param {string|boolean} [opt_output=true] - 出力パス(true:zipフォルダ作成/false:直下に出力)
   * @return {boolean} 成否
   */
  _this.unzip = function FileUtility_unzip(zipfile, opt_output) {
    // zip確認
    var zipfullpath = fs.GetAbsolutePathName(zipfile);
    if (!fs.FileExists(zipfullpath) || fs.GetExtensionName(zipfullpath).toLowerCase() != 'zip') {
      return false;
    }
    
    var output = opt_output;
    if (!(output === true || output === false || String.isString(output))) {
      output = true;
    }
    var zipfolder = shell.NameSpace(zipfullpath);
    
    // 出力確認
    var outfullpath = null;
    if (output === true) {                      // フォルダ作成
      var name = fs.GetBaseName(zipfullpath);
      var path = fs.BuildPath(fs.GetParentFolderName(zipfullpath), name);
      if (fs.FileExists(path) || fs.FolderExists(path)) {
        return false;
      }
      
      var newfolder = true;
      var items = zipfolder.Items();
      if (items.Count === 1) {                  // 中身が1つのみの時
        var item = items.item();
        if (item.IsFolder) {                    // フォルダの時
          if (name == item.Name) {              // 同名の時
            newfolder = false;                  // フォルダ未作成
          }
        }
      }
      
      outfullpath = path;
      if (newfolder) {
        _this.createFolder(path);
      }
    } else {                                    // フォルダ未作成
      if (output === false) {
        outfullpath = fs.GetParentFolderName(zipfullpath);
      } else if (String.isString(output)) {
        outfullpath = output;
      }
      for(var e=new Enumerator(zipfolder.Items());!e.atEnd();e.moveNext()) {
        var item = e.item();
        var path = fs.BuildPath(outfullpath, item.Name);
        if (fs.FileExists(path) || fs.FolderExists(path)) {     // 重複ファイル確認
          return false;
        }
      }
    }
    
    // ファイル解凍
    var folder = shell.NameSpace(outfullpath);
    for(var e=new Enumerator(zipfolder.Items());!e.atEnd();e.moveNext()) {
      folder.CopyHere(e.item(), 4);             // zipからコピー(進歩バー非表示)
    }
    
    return true;
  };
});
