/**
 * WMI(Windows Management Instrumentation)
 * @auther toshi2limu@gmail.com (toshi)
 */
(function(global, factory) {
  if (!global.WMIUtility) {
    global.WMIUtility = factory();
  }
})(this, function() {
	"use strict";
	
	var _this = void 0;
	var _locator = new ActiveXObject("WbemScripting.SWbemLocator");
	var _service = _locator.ConnectServer();
	
	_this = function WMIUtility_constructor() {};
	
  /**
   * 選択
   * 配列の最初の要素を返す。
   * @param {string} query              クエリー
   * @return                            wmiObject
   */
	_this.select = function WMIUtility_select(query) {
		var items = _this.selects(query);
		return (items.length != 0)? items[0]: null;
	};
	
  /**
   * 選択
   * @param {string} query              クエリー
   * @return                            wmiObject[]
   */
	_this.selects = function WMIUtility_selects(query) {
		var ret = [];
		var set = _service.ExecQuery(query);
		
		for (var e=new Enumerator(set); !e.atEnd(); e.moveNext()) {
			ret.push(e.item());
		}
		set = null;
		return ret;
	};
  /**
   * プロパティ一覧
   * @param {wmiObject} item            アイテム
   * @return {Object}                   アイテムプロパティのオブジェクト({Name: Value, ...})
   */
	_this.getProperties = function WMIUtility_getProperties(item) {
		var ret = {};
		if (item != null) {
			for (var e=new Enumerator(item.Properties_); !e.atEnd(); e.moveNext()) {
				var item = e.item();
				ret[item.Name] = item.Value;
			}
		}
		item = null;
		return ret;
	};
  /**
   * プロパティ一覧
   * @param {string} query              クエリー
   * @return {Object}                   アイテムプロパティのオブジェクト([{Name: Value, ...}, ...])
   */
	_this.getQueryProperties = function WMIUtility_getQueryProperties(query) {
		var ret = [];
		var set = _service.ExecQuery(query);
		
		for (var e=new Enumerator(set); !e.atEnd(); e.moveNext()) {
			ret.push(_this.getProperties(e.item()));
		}
		set = null;
		return ret;
	};
	
	_this.Process = function WMIUtility$Process_constructor() {};
	(function WMIUtility$Process_factory(_this, _parent) {
		_this.mypid = null;	// 自身のプロセスID
		
		// プロセスの取得
		_this.getProcess = function WMIUtility_getProcess(pid) {
			return _parent.select("SELECT * FROM Win32_Process WHERE ProcessId = '"+pid+"'");
		};
		_this.getProcessProperties = function WMIUtility_getProcessProperties(pid) {
			var process = _this.getProcess(pid);
			var ret = _parent.getProperties(process);
			process = null;
			return ret;
		};
		// 日付の解釈
		_this.getDate = function WMIUtility_getDate(str) {
			// 想定値:"20170902135602.687944+540"
			var m = str.match(/^(\d+)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\./);
			return (m!=null)? new Date(m[1]|0,m[2]-1|0,m[3]|0,m[4]|0,m[5]|0,m[6]|0): new Date(str);
		};
		// 自身のプロセスID取得
		_this.getSelfProcessId = function WMIUtility_getSelfProcessId() {
			if (_this.mypid == null) {												// 1回のみ実行
				var text = '(function(){while(true)WScript.Sleep(60*1000);})();';	// 停止プログラム
				var temp = FileUtility.getTempFilePath(null, "jse");
				FileUtility.storeText(text, temp, true, FileUtility.UTF_16);		// プログラム保存
				
				var obj = sh.Exec('cscript "'+temp+'"');
				var process = _this.getProcess(obj.ProcessId);
				_this.mypid = process.ParentProcessId;				// 親プロセス取得
				_this.Terminate(process);							// 強制終了
				process	= null;
				obj		= null;
				
				fs.DeleteFile(temp);								// プログラム削除
			}
			return _this.mypid;
		};
		// プロセスID取得(特別な引数で実行している機能限定)
		_this.getProcessId = function WMIUtility_getProcessId(name) {
			if (!name) {
				return _this.getSelfProcessId();
			}
			var ret = null;
			var set = _service.ExecQuery("SELECT * FROM Win32_Process"
									+ " WHERE Caption = 'cscript.exe' OR Caption = 'wscript.exe'");
			
			process: for (var e=new Enumerator(set); !e.atEnd(); e.moveNext()) {
				var item = e.item();
				if (item.CommandLine) {
					var commands = item.CommandLine.split(" ");
					for (var i=0; i<commands.length; i++) {
						if (commands[i].startsWith("/wminame:")) {
							if (commands[i].substr(9) == name) {
								ret = item.ProcessId;
								break process;
							}
						}
					}
				}
			}
			
			set = null;
			return ret;
		};
		// 強制終了
		_this.Terminate = function WMIUtility_Terminate(pid) {
			var ret = -1;
			var process = (Atom.isObject(pid))? pid: _this.getProcess(pid);
			if (process != null) {
				ret = process.Terminate();
			}
			process = null;
			return ret;
		};
		// プロセスID取得の実行
		_this.Create = function WMIUtility_Create(commandline, current, startup) {
//		var process = _service.Get("Win32_Process");
//		var ret = process.Create(commandline, current, startup);
//		ret = (ret == 0)? process.ProcessId: -ret;
//		process = null;
//		return ret;
			// 補足:Create関数の第4引数のProcessIdを取得したかったが、out引数のため、無理？
			
			current = (current)? current: sh.CurrentDirectory;
			
			// 実行プログラム
			function exec(commandline, current) {
				var sh = new ActiveXObject("WScript.Shell");
				sh.CurrentDirectory = current;
				var obj = sh.Exec(commandline);
				if (obj && obj.ProcessId) {
					WScript.Quit(obj.ProcessId);
				}
				obj = null;
				WScript.Quit(-1);
			}
			var text='('+exec.toString()+'})('
						+JSON.stringify(commandline)+', '+JSON.stringify(current)+');';
			
			// 一時実行ファイル作成 & 実行 & 削除
			var temp = FileUtility.getTempFilePath(null, "jse");
			FileUtility.storeText(text, temp, true, FileUtility.UTF_16);
			
			var bkup = sh.CurrentDirectory;
			sh.CurrentDirectory = fs.GetParentFolderName(temp);
			var ret = sh.Run('cscript "'+temp+'"', 0, true);
			sh.CurrentDirectory = bkup;
			
			fs.DeleteFile(temp);
			return ret;
		};
	
	})(_this.Process, _this);
	
	_this.Volume = function WMIUtility$Volume_constructor() {};
	(function WMIUtility$Volume_factory(_this, _parent) {
		// ValumeのGUIDを16進数文字列で返す
		_this.getGUID = function WMIUtility$Volume_getGUID(fullpath) {
			var guid	= null;
			var drive	= fs.GetDriveName(fullpath);
			var drives= WMIUtility.getQueryProperties(
																	"SELECT DeviceID FROM Win32_Volume"
																+ " WHERE DriveLetter = '"+drive+"'");
			for (var i=0; i<drives.length; i++) {
				guid = drives[i].DeviceID.match(/{(.+)}/)[1].split("-").join("");
				break;
			}
			drives = null;
			return guid;
		};
	})(_this.Volume, _this);
	
	return _this;
});
