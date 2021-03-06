/*!
 * Console.Animation.js v5
 *
 * Copyright (c) 2018 toshi (https://github.com/k08045kk)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

/**
 * WSH(JScript)用コンソールアニメーション
 * @requires    module:ActiveXObject('htmlfile')
 * @requires    module:WScript
 * @requires    module:Console.js
 * @auther      toshi (https://github.com/k08045kk)
 * @version     5
 * @see         1 - add - Console.jsから分離 - 単純化のため
 * @see         2 - update - Console.jsの_printCore修正対応 - 機能拡張
 * @see         3 - update - Console.jsの_printCore修正対応
 * @see         4 - update - TRACE廃止に伴う修正
 * @see         5 - update - getAnimation関連をリファクタリング
 */
(function(root, factory) {
  if (root.Console && !root.Console.getAnimation) {
    // Consoleにアニメーション機能を追加
    factory(root.Console);
  }
})(this, function(_this) {
  "use strict";
  
  var global = Function('return this')();
  var _document;
  var _window;
  var _tempMessage = '';        // 一時表示中の文字列
  var _animeSet = {};           // アニメーションのインスタンスセット
  var _TEMP   = -1;             // 出力レベル:コンソール上のみ出力し、次の出力時に削除する
  
  /**
   * PrivateUnderscore.js
   * @version   1
   */
  {
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
    // see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
    function _Number_isInteger(value) {
      return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
    function _mlength(str) {
      var len=0,
          i;
      for (i=0; i<str.length; i++) {
        len += (str.charCodeAt(i) > 255) ? 2: 1;
      }
      return len;
    };
  }
  
  /**
   * ストリーム書き出し(一時表示対応)
   * 一時表示中にWScript.Echo(), WScript.Stdout.Write()等で
   * 別途出力すると、表示が崩れる。
   * 制約: print(), println()以外から、_printCore()を呼び出さないこと。
   * @param {!string} message - 出力文字列
   * @param {number} [opt_level=INFO(6)] - 出力レベル
   */
  _this.prototype._printCore_AnimationBackup = _this.prototype._printCore;
  _this.prototype._printCore = function Console$Animation__printCore(message, opt_level) {
    var level = (opt_level == null)? _this.INFO: opt_level;
    var tlen0 = _mlength(_tempMessage);
    
    if (level === _TEMP) {
      // 一時表示(標準出力の削除+出力)
      var tlen1 = _mlength(_tempMessage.replace(/\s+$/,''));
      var mlen  = _mlength(message);
      var lack  = Math.max(0, tlen1 - mlen);
      // 一時表示の出力
      if (this.propertySet.stdout) {
        try {
          WScript.StdOut.Write(
                  Array(tlen0+1).join('\b')       // カーソルを戻す(前回の一時表示分)
                + message                         // 表示
                + Array(lack+1).join(' ')         // 不足分をスペース埋め
                + Array(lack+1).join('\b'));      // カーソルを戻す(不足分)
        } catch (e) {}
        _tempMessage = message;
      }
    } else if (this.isOutput(level)) {
      if (this.propertySet.stderr && _this.ERROR <= level) {
        // エラー出力のため、削除しない
      } else if (this.propertySet.stdout) {
        // 標準出力のため、一時表示を削除する
        if (tlen0 > 0) {
          try {
            WScript.StdOut.Write(
                  Array(tlen0+1).join('\b')       // カーソルを戻す(前回の一時表示分)
                + Array(tlen0+1).join(' ')        // スペース埋め
                + Array(tlen0+1).join('\b'));     // カーソルを戻す(スペース分)
          } catch (e) {}
          _tempMessage = '';
        }
      }
    }
    
    // ストリーム書き出し(オリジナル)
    this._printCore_AnimationBackup(message, level);
  };
  
  /**
   * 一時表示
   * コンソール上のみ出力し、次の出力時に削除する。
   * 出力文字列に改行文字を含むと、改行より前の文字列を削除できません。
   * @param {string} message - 出力文字列(改行文字を含まない文字列)
   * @param {boolean} [opt_newline=false] - 新規行
   */
  _this.prototype.temp = function Console$Animation_temp(message, opt_newline) {
    // 新規行 && 改行直後でない -> 改行する
    if (opt_newline === true && !this.isNewLine()) { this.println(''); }
    this.print(message, _TEMP);
  };
  
  /**
   * アニメーション(Console内部クラス)
   * 一時表示を利用した、CUIアニメーションを行う。
   * 同期処理中は、アニメーションを更新できない可能性がある。
   * 一時表示中に、別途出力すると、表示が崩れる可能性がある。
   */
  var Animation = (function Console$Animation_factory(_parent) {
    "use strict";
    
    var _this = void 0;
    
    _this = function Console$Animation_constructor() {
      this.initialize.apply(this, arguments);
    };
    
    // 初期化
    _this.prototype.initialize = function Console$Animation_initialize(opt_name) {
      // 変更可の変数(ただし、start()前に変更しておくこと)
      this.name     = (opt_name != null)? opt_name: 'default';  // 名前(外部識別用)
      this.created  = false;      // インスタンス作成完了
      this.delay    = 0;          // 初回待機時間(ms単位)
      this.interval = 1000;       // 継続待機時間(ms単位)
      this.count    = 0;          // カウント値(0<=value)
      this.max      = -1;         // 最大回数(-1:無効)
      //this.createAnimeText;       // 表示文字列作成関数
      
      // 変更不可の変数
      this.delayId    = null;     // private: timeoutのid
      this.intervalId = null;     // private: intervalのid
      this.console    = _parent.getConsole();
    }
    // クローン作成
    _this.prototype.clone = function Console$Animation_clone() {
      var obj  = Object(this);
      var copy = new _this();
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
    }
    // アニメーションの文字列作成
    _this.prototype.createAnimeText = function Console$Animation_createAnimeText() {
      return ''+this.count;
    };
    // カウンタをリセットする
    _this.prototype.reset = function Console$Animation_reset(opt_milliseconds) {
      this.count = 0;
      if (_Number_isInteger(opt_milliseconds)) {
        this.max   = Math.floor(opt_milliseconds / this.interval);
        this.delay = opt_milliseconds - (this.max * this.interval);
      } else {
        this.max = -1;
        this.delay = 0;
      }
    };
    // カウンタを開始する(非同期)
    // @return {boolean} 動作中
    _this.prototype.start = function Console$Animation_start() {
      if (this.delayId !== null || this.intervalId !== null) {
        return true;                    // 稼働中
      }
      if (0 <= this.max && this.max <= this.count) {
        return false;                   // 未稼働(既に回数超過)
      }
      
      // 周期処理を登録
      var _this = this;
      var _args = arguments;
      function intervalfunc() {
        _this.count++;
        if (_this.intervalId === null) {
        } else if (0 <= _this.max && _this.max <= _this.count) {
          _this.stop();
        } else {
          _this.console.temp(_this.createAnimeText.apply(_this, _args));
        }
      }
      if (_this.delay > 0) {
        _this.delayId = _setTimeout(
          function () {
            if (_this.delayId === null) {
              // キャンセルされた？
            } else {
              _this.console.temp(_this.createAnimeText.apply(_this, _args));
              _this.intervalId = _setInterval(intervalfunc, _this.interval);
            }
          }, _this.delay);
      } else {
        _this.console.temp(_this.createAnimeText.apply(_this, _args));
        _this.intervalId = _setInterval(intervalfunc, _this.interval);
      }
      return true;                      // 稼働開始
    };
    // カウンタを開始して停止する(疑似同期)
    _this.prototype.exec = function Console$Animation_exec() {
      // 実行
      this.start.apply(this, arguments);
      
      // 待機
      WScript.Sleep(1); // 微調整(タイミング関係で1週遅れる対策、これでも遅れたらむりぽ)
      if (this.delayId !== null) {
        WScript.Sleep(this.delay);
      }
      while (this.intervalId !== null) {
        WScript.Sleep(this.interval);
      }
    };
    // カウンタを停止する
    _this.prototype.stop = function Console$Animation_stop() {
      var ret = -1;
      if (this.delayId !== null || this.intervalId !== null) {
        if (this.delayId !== null) {
          _clearTimeout(this.delayId);
        }
        if (this.intervalId !== null) {
          _clearInterval(this.intervalId);
          this.console.temp('');        // 一時表示を削除
        }
        
        this.delayId = null;
        this.intervalId = null;
        ret = this.count;
      }
      return ret;
    };
    
    return _this;
  })(_this);
    
  /**
   * アニメーションインスタンスの取得
   * nameインスタンスが未生成の場合、superインスタンスのクローンを返す。
   * @param {string} opt_name - 機能名
   * @param {string} opt_super - 親機能名
   * @return {Console$Animation} アニメーション
   */
  _this.getAnimation = function Console$Animation_getAnimation(opt_name, opt_super) {
    var name = (opt_name != null)? opt_name: 'default';
    
    // インスタンスの取得
    var anime = null;
    if (opt_name != null && _animeSet[opt_name]) {
      anime = _animeSet[opt_name];
    } else if (opt_super != null && _animeSet[opt_super]) {
      anime = _animeSet[opt_super].clone();
      anime.name = name;
      anime.created = false;
    } else {
      // インスタンス作成
      anime = new Animation(name);
    }
    
    // 登録(再登録)
    if (opt_name != null) {
      _animeSet[opt_name] = anime;
    }
    return anime;
    // 注意：インスタンスを変更すると、実行するアプリ内のすべてのインスタンスを変更する
  };
  
  /**
   * アニメーション付き待機
   * Console.getAnimation('sleep')のアニメーションを使用して指定時間待機する。
   * @param {number} milliseconds - 待機時間(ms)
   */
  _this.sleep = 
  _this.Sleep = 
  _this.prototype.sleep = 
  _this.prototype.Sleep = function Console$Animation_sleep(milliseconds) {
    var anime = _this.getAnimation('Console.sleep');
    if (anime.created !== true) {
      // コンソール用待機関数
      anime.createAnimeText = function Console$Sleep_createAnimeText() {
        var digits = Math.max(3, (this.max+'').length);
        return ''
          + 'Console.sleep('+(this.max*this.interval+this.delay)+'ms):'
          + (Array(digits+1).join(' ')+(this.max-this.count)).slice(-digits)
          + 's';
      };
      anime.created = true;
    }
    if (milliseconds > 0) {
      anime.reset(milliseconds);
      anime.exec();
    }
  };
  
  (function Console$Animation_main() {
    // 標準アニメーションの作成
    
    // アニメーション文字列
    // 固定文字列長：カーソル位置を固定する(末尾にスペースを付加することで実現可能)
    // 可変文字列長：カーソル位置がアニメーション毎に移動する
    var animation = _this.getAnimation('Console.animation');
    if (animation.created !== true) {
      animation.animations = ['   ','.  ','.. ','...'];
      //animation.animations = ['-','\\','|','/'];  // フォント次第で￥になるため、注意
      animation.prefix = '';
      animation.suffix = '';
      animation.createAnimeText = function Console$AnimeText_createAnimeText() {
        return this.prefix + this.animations[this.count%this.animations.length] + this.suffix;
      };
      animation.created = true;
    }
    _this.getAnimation('animation', 'Console.animation');
    
    // カウントアップ・カウントダウン
    var countup = _this.getAnimation('Console.countup');
    if (countup.created !== true) {
      countup.digits = 2;     // 最低桁数
      countup.padding = ' ';  // パディング文字(半角1文字)
      countup.prefix = ' ';   // 前方
      countup.suffix = 's';   // 後方
      countup.createAnimeText = function Console$Countdown_createAnimeText() {
        var digits = Math.max(this.digits, (this.max+'').length);
        var count = this.count+1;
        return ''
          + this.prefix
          + (Array(digits+1).join(this.padding)+count).slice(-digits)
          + this.suffix;
      };
      countup.created = true;
    }
    var countdown = _this.getAnimation('Console.countdown', 'Console.countup');
    if (countdown.created !== true) {
      countdown.createAnimeText = function Console$Countdown_createAnimeText() {
        var digits = Math.max(this.digits, (this.max+'').length);
        var count = this.max-this.count;
        return ''
          + this.prefix
          + (Array(digits+1).join(this.padding)+count).slice(-digits)
          + this.suffix;
      };
      countdown.created = true;
    }
    _this.getAnimation('countup', 'Console.countup');
    _this.getAnimation('countdown', 'Console.countdown');
  })();
});
