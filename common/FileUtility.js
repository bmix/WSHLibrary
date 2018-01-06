/**
 * ファイル操作
 * @auther			toshi(http://bugbugnow.niimizo.net/)
 * @license			MIT License
 * @version			1
 */
(function(factory) {
	var global = Function('return this')();
	var fs = global.fs || new ActiveXObject('Scripting.FileSystemObject');
	var sh = global.sh || new ActiveXObject('WScript.Shell');
	global.FileUtility = global.FileUtility || factory(global, fs, sh);
	global.fu = global.FileUtility;
})(function FileUtility_factory(global, fs, sh) {
	"use strict";
	
	var _this = void 0;
	_this = function FileUtility_constructor() {};
	
	// FileUtility_search関数用の定義
	var separator		= '\\';
	var subfolder		= 0x01;
	var filelist		= 0x02;
	var folderlist	= 0x04;
	var rootfolder	= 0x08;
	var branchfolder= 0x10;
	var leaffolder	= 0x20;
	var folderorder = 0x01;
	var fileorder		= 0x02;
	var suborder		= 0x03;
	var levelorder	= 0x04;
	
	// 定数定義
	_this.ASCII			= 'US-ASCII';
	_this.AUTODETECT= '_autodetect_all';	// 文字コード自動検出
	_this.UTF_8			= 'UTF-8';
	_this.EUC_JP		= 'EUC-JP';
	_this.SHIFT_JIS = 'SHIFT-JIS';
	_this.UTF_16		= 'UTF-16';
	_this.orderFront	= (folderorder <<  0) | (fileorder <<  8) | (suborder << 16);
	_this.orderPost		= (folderorder <<  8) | (fileorder << 16) | (suborder <<  0);
	_this.orderLevel	= levelorder;
	_this.targetFiles				=						filelist;				// 直下のファイル
	_this.targetAllFiles		= subfolder|filelist;				// サブフォルダを含む全ファイル
	_this.targetFolders			=						folderlist|branchfolder;// 直下のフォルダ
	_this.targetLeafFolders = subfolder|folderlist|leaffolder;	// 末端フォルダ
	_this.targetSubFolders	= subfolder|folderlist|branchfolder;// ルート以外の全フォルダ
	_this.targetAllFolders	= subfolder|folderlist|branchfolder|rootfolder;
																// ルートを含む全フォルダ
	_this.targetFileFolders			= filelist|folderlist|branchfolder;	// 直下のファイルフォルダ
	_this.targetSubFileFolders	= subfolder|filelist|folderlist|branchfolder;
																// ルート除く全ファイルフォルダ
	_this.targetAllFileFolders	= subfolder|filelist|folderlist|branchfolder|rootfolder;
																// ルート含む全ファイルフォルダ
	_this.adTypeBinary		= 1;	// StreamTypeEnum: バイナリデータ
	_this.adTypeText			= 2;	// StreamTypeEnum: テキストデータ(既定)
	_this.adModeRead							= 1;	// ConnectModeEnum: 読み取り専用の権限
	_this.adModeReadWrite					= 3;	// ConnectModeEnum: 読み取り/書き込み両方の権限
	_this.adModeShareDenyNone 		= 16; // ConnectModeEnum: 他のユーザーにも読み取り/書き込みの許可
	_this.adModeShareDenyRead 		= 4;	// ConnectModeEnum: 読み取り権限による他ユーザー禁止
	_this.adModeShareDenyWrite		= 8;	// ConnectModeEnum: 書き込み権限による他ユーザー禁止
	_this.adModeShareExclusive		= 12; // ConnectModeEnum: ほかのユーザーの接続を禁止します。
	_this.adModeUnknown						= 0;	// ConnectModeEnum: 設定が不明であることを表します。(既定)
	_this.adModeWrite							= 2;	// ConnectModeEnum: 書き込み専用の権
	_this.adReadAll				= -1;	// StreamReadEnum: ストリームからすべてのバイトを読取(既定)
	_this.adReadLine			= -2;	// StreamReadEnum: ストリームから次の行を読み取り
	_this.adWriteChar 		= 0;	// StreamWriteEnum: テキスト文字列を書き込みます。(既定)
	_this.adWriteLine 		= 1;	// StreamWriteEnum: テキスト文字列と行区切り文字書き込み
	_this.adSaveCreateNotExist		=	1;	// SaveOptionsEnum: ファイルない時、新しいファイル作成(既定)
	_this.adSaveCreateOverWrite 	=	2;	// SaveOptionsEnum: ファイルある時、ファイルが上書き
	_this.adCR						= 13;	// LineSeparatorsEnum: 改行文字: CR
	_this.adCRLF					= -1;	// LineSeparatorsEnum: 改行文字: CRLF(既定)
	_this.adLF						= 10;	// LineSeparatorsEnum: 改行文字: LF
	_this.ForReading			= 1;	// iomode: ファイルを読み取り専用として開きます。
	_this.ForWriting			= 2;	// iomode: ファイルを書き込み専用として開きます。
	_this.ForAppending		= 8;	// iomode: ファイルを開き、ファイルの最後に追加
	_this.ReadOnly	= 1;	// Attributes: 読み取り専用ファイル
	_this.Hidden		= 1;	// Attributes: 隠しファイル
	_this.System		= 1;	// Attributes: システム・ファイル
	_this.Volume		= 1;	// Attributes: ディスクドライブ・ボリューム・ラベル
	_this.Directory	= 1;	// Attributes: フォルダ／ディレクトリ
	_this.Archive		= 1;	// Attributes: 前回のバックアップ以降に変更されていれば1
	_this.Alias			= 1;	// Attributes: リンク／ショートカット
	_this.Compressed= 1;	// Attributes: 圧縮ファイル
	
	/**
	 * フォルダパスからフォルダを作成する
	 * @param {string} folderpath					フォルダパス
	 */
	_this.createFolder = function FileUtility_createFolder(folderpath) {
		var callee = FileUtility_createFolder;
		var fullpath = fs.GetAbsolutePathName(folderpath);
		if (!fs.FolderExists(fullpath)) {
			var parentpath = fs.GetParentFolderName(fullpath);
			if (parentpath != '') {
				// 再帰：親フォルダ作成
				callee(parentpath);
				fs.CreateFolder(fullpath);
			}
		}
	};
	
	/**
	 * ファイルパスからフォルダを作成する
	 * @param {string} filepath						ファイルパス
	 */
	_this.createFileFolder = function FileUtility_createFileFolder(filepath) {
		var fullpath  = fs.GetAbsolutePathName(filepath);
		var parentpath= fs.GetParentFolderName(fullpath);
		if (parentpath != '') {
			_this.createFolder(parentpath);					 // 親フォルダ作成
		}
	};
	
	/**
	 * 空のフォルダパス判定する
	 * @param {string} folderpath					パス
	 * @return {boolean}									成否
	 */
	_this.isEmptyFolder = function FileUtility_isEmptyFolder(folderpath) {
		var ret = false,
				folder,
				fullpath = fs.GetAbsolutePathName(folderpath);
		if (fs.FolderExists(fullpath)) {
			folder = fs.GetFolder(fullpath);
			// ファイルなし && フォルダなし
			ret = ((folder.Files.Count == 0) && (folder.SubFolders.Count == 0));
		}
		return ret;
	};
	
	/**
	 * 存在しないファイルパスを返す。
	 * @param {string} [opt_folderpath=sh.CurrentDirectory]				フォルダパス
	 * @param {string} [opt_ext='']				拡張子
	 */
	_this.getTempFilePath = function FileUtility_getTempFilePath(opt_folderpath, opt_ext) {
		var folderpath = (opt_folderpath)?
						fs.GetAbsolutePathName(opt_folderpath):
						sh.CurrentDirectory;
		var ext = (opt_ext && opt_ext.length!=0)? '.'+opt_ext: '';
		
		// 存在しないファイル名を返す
		var fullpath = '';
		do {
			fullpath = fs.BuildPath(folderpath, fs.GetTempName()+ext);
		} while (fs.FileExists(fullpath) || fs.FolderExists(fullpath));
		return fullpath;
		// 補足:fs.GetTempName()関数は、単純にランダムな文字列を返すだけで、
		//			存在有無を意識しないため、存在するかの判定をする。
	};
	_this.getTempFileName = function FileUtility_getTempFileName(opt_folderpath, opt_ext) {
		return fs.GetFileName(_this.getTempFilePath(opt_folderpath, opt_ext));
	};
	
	/**
	 * ユニークなファイルパスを返す。
	 * ファイル名を維持しつつ、末尾に数値を付加したユニークなファイルパスを返す。
	 * @param {string} path								フォルダパス
	 */
	_this.getUniqFilePath = function FileUtility_getUniqFilePath(path) {
		var uniqpath = fs.GetAbsolutePathName(path);				// フルフォルダパス
		
		if (fs.FileExists(uniqpath) || fs.FolderExists(uniqpath)) {	// ファイル存在チェック
			var fullpath = uniqpath;
			var ext = fs.GetExtensionName(uniqpath);					// 拡張子
			if (ext.length !== 0) {
				ext = '.'+ext;
				fullpath = fs.GetBaseName(fullpath);
			}
			
			var idx = 1;
			do {
				idx++;
				uniqpath = fullpath + '_'+idx + ext;
			} while (fs.FileExists(uniqpath) || fs.FolderExists(uniqpath));
		}
		return uniqpath;
	};
	_this.getUniqFileName = function FileUtility_getUniqFileName(path) {
		return fs.GetFileName(_this.getUniqFilePath(path));
	};
	// 有効なファイル名を返す
	// 無効な文字を削除します。
	_this.getValidFileName = function FileUtility_getValidFileName(name) {
		var marks = ['\\','/',':','*','?','"','<','>','|'];
		for (var i=0; i<marks.length; i++) {
			name = name.replace(marks[i], '');
		}
		return name;
	};
	
	/**
	 * ファイルを読み込み
	 * @private
	 * @param {integer} type							種別(1:Bynary/2:Text)
	 * @param {string} path								ファイルパス
	 * @param {string} [opt_charset='_autodetect_all']		文字セット('UTF-8'/'SHIFT_JIS'/...)
	 * @return {string|Variant}						ファイルデータ
	 */
	function FileUtility_loadFile(type, path, opt_charset) {
		var __this = _this;	// jsc.exe(errorJS1187対策)
		var charset = (opt_charset != null)? opt_charset: __this.AUTODETECT;
		
		var ret,
				sr,
				pre, bom,
				fullpath = fs.GetAbsolutePathName(path);
		if (fs.FileExists(fullpath) === false) {
			// ファイルなし
			return null;
		} else if (fs.GetFile(fullpath).size === 0) {
			// ファイルの中身なし
			return (type == __this.adTypeText)? '': null;
		}
		
		sr = new ActiveXObject('ADODB.Stream');
		sr.Type = type;
		
		if (type == __this.adTypeText) {
			if (charset == __this.AUTODETECT) {
				// BOMを確認してUTF-8とUTF-16だけ、手動で判定する
				pre = new ActiveXObject('ADODB.Stream');
				pre.Type = __this.adTypeText;
				pre.Charset = __this.ASCII;
				pre.Open();
				pre.LoadFromFile(fullpath);
				bom = pre.ReadText(3);
				if (bom.length < 2) {
				} else if (escape(bom.substr(0, 2)) == '%7F%7E') {
					charset = __this.UTF_16;
				} else if (escape(bom.substr(0, 2)) == '%7E%7F') {
					charset = __this.UTF_16;
				} else if (bom.length < 3) {
				} else if (escape(bom) == 'o%3B%3F') {
					charset = __this.UTF_8;
				}
				pre.Close();
				pre = null;
			}
			sr.Charset = charset;
		}
		
		// ファイルから読み出し
		sr.Open();
		sr.LoadFromFile(fullpath);
		ret = (type == __this.adTypeText)? sr.ReadText(): sr.Read();
		
		// 終了処理
		sr.Close();
		sr = null;
		return ret;
	}
	
	/**
	 * バイナリファイルを読み込み
	 * @param {string} path								ファイルパス
	 * @return {Variant}									byte配列
	 */
	_this.loadBinary = function FileUtility_loadBinary(path) {
		return FileUtility_loadFile(_this.adTypeBinary, path);
	};
	
	/**
	 * テキストファイルを読み込み
	 * @param {string} path								ファイルパス
	 * @param {string} opt_charset				文字セット
	 * @return {string}										ファイルデータ(文字列)
	 */
	_this.loadText = function FileUtility_loadText(path, opt_charset) {
		return FileUtility_loadFile(_this.adTypeText, path, opt_charset);
	};
	
	/**
	 * ファイルに書き込み
	 * @private
	 * @param {integer} type							種別(1:Bynary/2:Text)
	 * @param {bytes|string} src					書き込むデータ
	 * @param {string} path								書き込むパス
	 * @param {integer} [opt_option=1]		オプション(1:上書きなし/2:上書きあり)
	 * @param {string} [opt_charset='UTF-8']			文字コード
	 * @param {boolean} [opt_bom=true]		BOM(true/false)
	 */
	function FileUtility_storeFile(type, src, path, opt_option, opt_charset, opt_bom) {
		opt_option	= (opt_option === true)?	_this.adSaveCreateOverWrite: opt_option;
		opt_option	= (opt_option === false)? _this.adSaveCreateNotExist:	opt_option;
		opt_option	= (opt_option != null)?	 opt_option:	_this.adSaveCreateNotExist;
		opt_charset = (opt_charset!= null)?	 opt_charset: _this.UTF_8;
		opt_bom			= (opt_bom		!= null)?	 opt_bom: true;
		var skip = {};
		skip[_this.UTF_8] = 3;
		skip[_this.UTF_16]= 2;
		
		// 前処理
		var fullpath = fs.GetAbsolutePathName(path);// 絶対パスの取得
		_this.createFileFolder(fullpath);						// フォルダがない場合、作成する。
		
		// ファイルに書き込む。
		var sr = new ActiveXObject('ADODB.Stream');
		sr.Type = type;															// ファイル種別設定
		if (type == _this.adTypeText) {
			sr.Charset		= opt_charset;							// 文字コード設定
			sr.Open();																// ストリーム：開く
			sr.WriteText(src);
			if ((opt_bom === false) && skip[opt_charset]) {		// BOMなし && スキップ数がある
				// BOMなし書込処理
				var pre = sr;
				pre.Position	= 0;
				pre.Type		= _this.adTypeBinary;
				pre.Position	= skip[opt_charset];			// skipバイトを読み飛ばす
				var bin = pre.Read();										// バイナリデータを取得
				pre.Close();
				pre = null;
				sr	= null;
				
				sr = new ActiveXObject('ADODB.Stream');
				sr.Type = _this.adTypeBinary;
				sr.Open();
				sr.Write(bin);													// バイナリデータを書き込む
			}
		} else {																		// 上記以外(バイナリ)の時
			sr.Open();																// ストリーム：開く
			sr.Write(src);
		}
		sr.SaveToFile(fullpath, opt_option);				// 保存
		sr.Close();																	// ストリーム：閉じる
		sr = null;
		// 補足:LineSeparatorプロパティは、全行読み出しのため、無意味
	}
	
	/**
	 * バイナリファイルを書き込む
	 * @param {bytes} bytes								書き込むデータ
	 * @param {string} path								ファイルへのパス
	 * @param {integer} [opt_option=1]		オプション(1:上書きなし/2:上書きあり)
	 */
	_this.storeBinary = function FileUtility_storeBinary(bytes, path, opt_option) {
		FileUtility_storeFile(_this.adTypeBinary, bytes, path, opt_option);
	};
	
	/**
	 * テキストファイルに書き込む
	 * @param {string} text								書き込むデータ
	 * @param {string} path								ファイルへのパス
	 * @param {integer} [opt_option=1]		オプション(1:上書きなし/2:上書きあり)
	 * @param {string} [opt_charset='UTF-8']			文字コード
	 * @param {boolean} [opt_bom=true]		BOM(true/false)
	 */
	_this.storeText = function FileUtility_storeText(text, path, opt_option, opt_charset, opt_bom) {
		FileUtility_storeFile(_this.adTypeText, text, path, opt_option, opt_charset, opt_bom);
	};
	
	/**
	 * 書き込み禁止を判定します。
	 * @param {string} path								ファイルへのパス
	 * @return {boolean}									結果(true:書き込み禁止)
	 */
	_this.isWriteProtected = function FileUtility_isWriteProtected(path) {
		var ret = false;
		var fullpath = fs.GetAbsolutePathName(path);
		if (fs.FileExists(fullpath)) {
			// 読み取り専用ファイルを判定
			ret = !!(fs.GetFile(fullpath).Attributes & _this.ReadOnly);
		}
		return ret;
	};
	
	/**
	 * 検索
	 * @param {string} callback						コールバック関数(該当ファイル/フォルダ時に呼び出す)
	 *																		想定関数(function (fullpath, folder) {})
	 *																		fullpath:ファイルフォルダのフルパス
	 *																		folder:(true:フォルダ/false:ファイル)
	 * @param {string} path								検索開始パス
	 * @param {string} target							検索対象(targetFiles/targetAllFiles/...)
	 * @param {integer} [opt_order=orderFront]	検索順序(orderFront:前方検索/orderPost:後方検索)
	 * @param {string[]} [opt_extensions]	拡張子(例:['jpg', 'png'])(大文字小文字を区別なく判断する)
	 * @return {boolean}									結果(true:検索完了/false:途中中断)
	 */
	_this.search = function FileUtility_search(callback, path, target, opt_order, opt_extensions) {
		var order	= (opt_order)?	opt_order:	_this.orderFront;
		var callee = FileUtility_search,
				fullpath = fs.GetAbsolutePathName(path),
				ret = true;
		
		if (fs.FolderExists(fullpath)) {
			var folder = fs.GetFolder(fullpath),
					flag = order,
					e1, e2, e3, e4;
			while (flag !== 0) {
				switch (flag & 0xff) {
				case folderorder: // フォルダ
					if (target & folderlist) {
						if (target & rootfolder) {
							ret = callback(fullpath, true) !== false;
						} else if ((target & leaffolder) && (folder.SubFolders.Count == 0)) {
							ret = callback(fullpath, true) !== false;
						}
					}
					break;
				case fileorder: // ファイル
					// ファイル一覧の時
					if (target & filelist) {
						if (!opt_extensions) {
							for (e1=new Enumerator(folder.Files); !e1.atEnd()&&ret; e1.moveNext()) {
								ret = callback(e1.item().Path, false) !== false;
							}
							e1 = null;
						} else {
							for (e2=new Enumerator(folder.Files); !e2.atEnd()&&ret; e2.moveNext()) {
								var path2 = e2.item().Path;
								var ext = fs.GetExtensionName(path2).toLowerCase();
								if (opt_extensions.indexOf(ext) !== -1) {
									ret = callback(path2, false) !== false;
								}
							}
							e2 = null;
						}
					}
					break;
				case suborder:
					if (target & subfolder) {
						for (e3=new Enumerator(folder.SubFolders); !e3.atEnd()&&ret;e3.moveNext()) {
							var path3 = e3.item().Path;
							var t3 = (target & branchfolder)?target|rootfolder:target&(~rootfolder);
																// 枝を追加する場合、ルート(枝)追加
																// 上記以外、ルートを削除
							ret = callee(callback, path3, t3, order, opt_extensions) !==false;
																// サブフォルダ(再帰呼出し)
						}
						e3 = null;
					} else if ((target & folderlist) && (target & branchfolder)) {
						for (e4=new Enumerator(folder.SubFolders); !e4.atEnd()&&ret;e4.moveNext()) {
							ret = callback(e4.item().Path, true) !== false;	// サブなしフォルダ一覧
						}
						e4 = null;
					}
					break;
				}
				if (ret === false) {
					// 中断
					break;
				}
				flag = flag >>> 8;
			}
		} else if (fs.FileExists(fullpath)) {
			// ファイル一覧の時
			if (target & filelist) {
				ret = callback(fullpath, false) !== false;
			}
		}
		
		return ret;
	};
	
	_this.searchFolder = function FileUtility_searchFolder(callback, folderpath, opt_target, opt_order) {
		_this.search(callback, folderpath, 
				((opt_target != null)?	target: _this.targetSubFolders), 
																opt_order);
	};
	
	_this.searchFolderLevel = function FileUtility_searchFolderLevel(callback, folderpath, deep) {
		deep	= (deep)? deep: 0;
		var ret = true,
				list = [folderpath];
		for (var i=0; ((deep == 0) || (i<deep)) && (list.length != 0); i++) {
			var next = [];
			for (var n=0; n<list.length; n++) {
				if (fs.FolderExists(list[n])) {
					var folders = fs.GetFolder(list[n]).SubFolders;
					for (var e=new Enumerator(folders); !e.atEnd(); e.moveNext()) {
						var path = e.item().Path;
						ret = callback(path, i);
						next.push(path);
						if (ret === false) {	return ret;	}	// 中断
					}
				}
			}
			
			// 明示的な開放
			list = null;
			list = next;
			next = null;
		}
		return ret;
	};
	
	_this.getFiles = function FileUtility_getFiles(folderpath) {
		var list = [];
		var fullpath = fs.GetAbsolutePathName(folderpath);
		if (fs.FolderExists(fullpath)) {
			var e;
			for (e=new Enumerator(fs.GetFolder(fullpath).Files); !e.atEnd(); e.moveNext()) {
				list.push(e.item().Path);
			}
			e = null;
		}
		return list;
	};
	
	_this.getFolders = function FileUtility_getFolders(folderpath) {
		var list = [];
		var fullpath = fs.GetAbsolutePathName(folderpath);
		if (fs.FolderExists(fullpath)) {
			var e;
			for (e=new Enumerator(fs.GetFolder(fullpath).SubFolders); !e.atEnd(); e.moveNext()){
				list.push(e.item().Path);
			}
			e = null;
		}
		return list;
	};
	_this.Exists = function FileUtility_Exists(path) {
		var fullpath = fs.GetAbsolutePathName(path);
		return (fs.FileExists(fullpath) || fs.FolderExists(fullpath));	// ファイル/フォルダあり
	}
	/**
	 * 移動
	 * @param {string} src								移動前のパス(例:'C:\\A\\B.txt')
	 * @param {string} dst								移動後のパス(例:'C:\\B\\C.txt')
	 */
	_this.Move = function FileUtility_Move(src, dst) {
		var ret = false;
		src = fs.GetAbsolutePathName(src);
		dst = fs.GetAbsolutePathName(dst);
		
		try {
			if (fs.FileExists(dst) || fs.FolderExists(dst)) {	// 移動先が存在する
			} else if (fs.FileExists(src)) {					// 移動元ファイルがある
				_this.createFileFolder(dst);
				fs.MoveFile(src, dst);
				ret = true;
			} else if (fs.FolderExists(src)) {				// 移動元フォルダがある
				var sp = fs.GetParentFolderName(src);
				var dp = fs.GetParentFolderName(dst);
				if ((sp != dp) && sp.startsWith(dp)) {	// 下位のフォルダに移動する時
					if (!dst.endsWith(separator)) {				// 移動先フォルダ末尾が区切りでない
						dst += separator;
					}
					_this.createFolder(dst);
					var oldfolder = fs.GetFolder(src);
					for (var e=new Enumerator(oldfolder.Files); !e.atEnd(); e.moveNext()) {
						fs.MoveFile(e.item().Path, dst);
					}
					for (var e=new Enumerator(oldfolder.SubFolders); !e.atEnd(); e.moveNext()) {
						fs.MoveFolder(e.item().Path, dst);
					}
					fs.DeleteFolder(src);
				} else {
					fs.MoveFolder(src, dst);
				}
				ret = true;
			}
		} catch (e) {
			ret = false;
		}
		return ret;
		// 補足:fs.Move関数は同期のため、移動完了後に処理は復帰する
		//			フォルダパスが長すぎると処理を完了できない
		//			下位フォルダに移動する場合、「書き込みできません。」エラーがでる
		//			(例: ./aaa/xxx (move)-> ./xxx)
	};
	_this.Rename = function FileUtility_Rename(src, name) {
		var parent= fs.GetParentFolderName(src);
		var dist	= fs.BuildPath(parent, name);
		_this.Move(src, dist);							// リネーム(移動)
	};
	/**
	 * ファイル/フォルダ削除
	 * 非同期
	 */
	_this.Delete = function FileUtility_Delete(path) {
		var callee = FileUtility_Delete,
				ret = false,
				fullpath, file, folder, e;
		if (!path || path == '') {					// 誤動作防止用
			return ret;
		}
		fullpath = fs.GetAbsolutePathName(path);
		if (fs.FileExists(fullpath)) {
			file = fs.GetFile(fullpath);
			file.Attributes = 0;							// 読取り専用だと削除できないため、属性削除
			file.Delete();
			ret	= true;
		} else if (fs.FolderExists(fullpath)) {
			try {
				fs.DeleteFolder(fullpath);
				ret = true;
			} catch (e) {
				// フォルダ内の全ファイルフォルダを削除
				(function(folderpath) {
					folder = fs.GetFolder(folderpath);
					for (e=new Enumerator(folder.SubFolders); !e.atEnd(); e.moveNext()) {
						callee(e.item().Path);			// 再帰呼び出し
					}
					for (e=new Enumerator(folder.Files); !e.atEnd(); e.moveNext()) {
						file =fs.GetFile(e.item().Path);
						file.Attributes = 0;
						file.Delete();
					}
					folder.Attributes = 0;
					folder.Delete();
				})(fullpath);
				ret = true;
			}
		}
		return ret;
	};
	
if ('JSON' in global) {
	/**
	 * JSONファイルを読み込んで返します。
	 * @param {Object} dist								上書き先のJSONデータ
	 * @param {string} path								ファイルパス
	 * @param {string} opt_charset				文字コード
	 * @return {Object}										読み込んだJSONデータ(null:読み込み失敗)
	 */
	_this.loadJSON = function FileUtility_loadJSON(dist, path, opt_charset) {
		if (Object.prototype.toString.call(dist) === '[object String]') {
			opt_charset = path;										// 第一引数をファイルパスとして扱う
			path = dist;
			dist = null;
		}
		var text = FileUtility_loadFile(_this.adTypeText, path, opt_charset);
		if (text && text.length !== 0) {
			try {
				var src = JSON.parse(text);
				if (dist) {
					var keys = Object.keys(src);
					for (var i=0; i<keys.length; i++) {
						if (dist[keys[i]] === void(0)) {
							dist[keys[i]] = src[keys[i]];
						}
					}
				} else {
					dist = src;
				}
			} catch (e) {
				dist = null;
			}
		}
		return dist;
	};
	/**
	 * JSONファイルを書き込みます。
	 * @param {Object} json								書き込むデータ
	 * @param {string} path								ファイルへのパス
	 * @param {string} option							オプション
	 * @param {string} charset						文字コード
	 * @param {boolean} bom								BOM有無
	 */
	_this.storeJSON = function FileUtility_storeJSON(json, path, opt_option, opt_charset, opt_bom) {
		var text = JSON.stringify(json);
		FileUtility_storeFile(_this.adTypeText, text, path, opt_option, opt_charset, opt_bom);
	};
}
	
	return _this;
});
