/**
 * WMI(Windows Management Instrumentation)
 * @auther toshi2limu@gmail.com (toshi)
 */
(function(global, factory) {
	global.WMIUtility = factory();
})(this, function WMIUtility_factory() {
	"use strict";
	
	var _this = void 0;
	_this = function WMIUtility_constructor() {};
	
	_this.mypid = null;	// 自身のプロセスID
	
	var locator = new ActiveXObject("WbemScripting.SWbemLocator");
	var service = locator.ConnectServer();
	
	_this.getDate = function WMIUtility_getDate(str) {
		// 想定値:"20170902135602.687944+540"
		var m = str.match(/^(\d+)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\./);
		return (m!=null)? new Date(m[1]|0, m[2]-1|0, m[3]|0, m[4]|0, m[5]|0, m[6]|0): new Date(str);
	};
	_this.getSelfProcessId = function WMIUtility_getSelfProcessId() {
		if (_this.mypid == null) {												// 1回のみ実行
			var text = '(function(){while(true)WScript.Sleep(60*1000);})();';	// 停止プログラム
			var temp = FileUtility.getTempFilePath(null, "jse");
			FileUtility.storeText(text, temp, true, FileUtility.UTF_16);		// プログラム保存
			
			var obj = sh.Exec('cscript "'+temp+'"');
			var process = _this.get(obj.ProcessId);
			_this.mypid = _this.getProperty(process, "ParentProcessId");		// 親プロセス取得
			_this.Terminate(process);	// 強制終了
			process	= null;
			obj		= null;
			
			fs.DeleteFile(temp);		// プログラム削除
		}
		return _this.mypid;
	};
	_this.getProcessId = function WMIUtility_getProcessId(name) {
		if (!name) {
			return _this.getSelfProcessId();
		}
		var ret = null;
		var set = service.ExecQuery("SELECT * FROM Win32_Process"
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
	_this.get = function WMIUtility_get(pid) {
		var ret = null;
		var set = service.ExecQuery("SELECT * FROM Win32_Process WHERE ProcessId = '"+pid+"'");
		
		for (var e=new Enumerator(set); !e.atEnd(); e.moveNext()) {
			ret = e.item();
			break;	// pidの重複はないはず
		}
		
		set = null;
		return ret;
	};
	_this.getProperties = function WMIUtility_getProperties(pid) {
		var obj = {};
		var process = (Atom.isObject(pid))? pid: _this.get(pid);
		if (process != null) {
			for (var e=new Enumerator(process.Properties_); !e.atEnd(); e.moveNext()) {
				var item = e.item();
				obj[item.Name] = item.Value;
			}
		}
		process = null;
		return obj;
	};
	_this.getProperty = function WMIUtility_getProperty(pid, property) {
		var ret = null;
		var process = (Atom.isObject(pid))? pid: _this.get(pid);
		if (process != null) {
			ret = process[property];
		}
		process = null;
		return ret;
	};
	_this.Terminate = function WMIUtility_Terminate(pid) {
		var ret = -1;
		var process = (Atom.isObject(pid))? pid: _this.get(pid);
		if (process != null) {
			ret = process.Terminate();
		}
		process = null;
		return ret;
	};
	
	_this.Create = function WMIUtility_Create(command, current, startup) {
		var process = service.Get("Win32_Process");
		var ret = process.Create(command, current, startup);
//		ret = (ret == 0)? process.ProcessId: -ret;
		process = null;
		return ret;
		// 補足:Create関数の第4引数のProcessIdを取得したかったが、out引数のため、無理？
	};
	
	_this.Run = function WMIUtility_Create(commandline, current) {
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
		current		= current.split('\\').join('\\\\');
		commandline	= commandline.split('\\').join('\\\\');
		var text='('+exec.toString()+'})("'+commandline+'", "'+current+'");';
		
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
	// 引数は、文字列のみ
	_this.exec = function WMIUtility_exec(app) {
		var def = {
			args:		[],
			func:		function(){},
			commandline:'cscript //Nologo //B "%file%"',
			style:		0,
			current:	sh.CurrentDirectory,
		};
		Atom.extend(app, def, true);
		var ret = 0;
		
		var argtext = '';
		for (var i=0; i<app.args.length; i++) {
			argtext += (i != 0)? ', ': '';
			argtext += JSON.stringify(app.args[i]);
		}
		var text='('+app.func.toString()+'})('+argtext+');';
		
		// 一時実行ファイル作成 & 実行 & 削除
		var temppath = FileUtility.getTempFilePath(app.current, "jse");
		FileUtility.storeText(text, temppath, true, FileUtility.UTF_16);
		
		var bkup = sh.CurrentDirectory;
		sh.CurrentDirectory = fs.GetParentFolderName(temppath);
		var commandline = app.commandline.replace("%file%", temppath);
		if (true) {
			ret = sh.Run(commandline, app.style, true);
			// 補足:retは、実行プログラムのエラー応答を返す。
			//		例:WScript.Quit(123);で終了した場合、「123」を返す。
		} else {
			var obj = sh.Exec(commandline)
			var text = obj.StdOut.ReadAll();
			var ret  = obj.ExitCode;
			// 補足:実行関数側でStdErrを使用しないこと。
			//		デッドロックの可能性があるため、上記実装では取り逃すため
			// 補足:Execでは、StdOutの読み込みをせずに、
			//		子プロセスが標準出力に4KB以上書き込むと、
			//		子プロセスが停止(待機)状態となる。(StdOutを読み込めば、動き出す)
			// 補足:Execでは、親プロセスが死亡すると、子プロセスも死亡する。
			//		Execでは、親プロセスが終了しても、子プロセスは終了しない。
			// 補足:ReadAll()は、子プロセス終了まで戻ってこない。
		}
		sh.CurrentDirectory = bkup;
		shell = null;
		
		fs.DeleteFile(temppath);
		return ret;
		// 補足:sh.CurrentDirectoryを変更するため、setTimeout関数等で割り込み処理を行う場合、
		//		sh.CurrentDirectoryの値に注意
		//		WScript.Shellクラスを複数作成しても、CurrentDirectoryは、共有されるため、回避不可
	}
	
	return _this;
});
