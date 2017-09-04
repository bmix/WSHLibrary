/**
 * WMI
 * @auther toshi2limu@gmail.com (toshi)
 */
(function(global, factory) {
	global.WMIUtility = factory();
})(this, function WMIUtility_factory() {
	"use strict";
	
	var _this = function WMIUtility_constructor() {};
	
	var locator = new ActiveXObject("WbemScripting.SWbemLocator");
	var service = locator.ConnectServer();
	
	_this.getDate = function WMIUtility_getDate(str) {
		// 想定値:"20170902135602.687944+540"
		var m = str.match(/^(\d+)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\./);
		return (m!=null)? new Date(m[1]|0, m[2]-1|0, m[3]|0, m[4]|0, m[5]|0, m[6]|0): new Date(str);
	};
	_this.getProcessId = function WMIUtility_getProcessId(name) {
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
		if (typeof pid == "number") {
			var set = service.ExecQuery("SELECT * FROM Win32_Process WHERE ProcessId = '"+pid+"'");
			
			for (var e=new Enumerator(set); !e.atEnd(); e.moveNext()) {
				ret = e.item();
				break;	// pidの重複はないはず
			}
			
			set = null;
		}
		return ret;
	};
	_this.getProperties = function WMIUtility_getProperties(pid) {
		var obj = {};
		var process = (typeof pid == "number")? _this.get(pid): pid;
		if (process != null) {
			for (var e=new Enumerator(process.Properties_); !e.atEnd(); e.moveNext()) {
				var item = e.item();
				obj[item.Name] = item.Value;
			}
		}
		process = null;
		return obj;
	};
	_this.Terminate = function WMIUtility_Terminate(pid) {
		var ret = -1;
		var process = (typeof pid == "number")? _this.get(pid): pid;
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
	
	return _this;
});
