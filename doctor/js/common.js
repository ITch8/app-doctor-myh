var nodataHtmlInfo = "<div class='noContent'><div class='mui-icon iconfont icon-comiiszanwushuju'></div><div>暂无数据</div></div>";
var ASKURL = "https://api.du-ms.com/";
var token = '85FBCA0D01D6EB76A3888C5F8E4118D5';
(function(w, _, u, owner) {
	w.openView = function(url, extras, aniShow, autoShow) {
		var web = null,
			id = url.split('?')[0].replace(/(.*)\//g, '').split('.')[0];
		extras = extras ? extras : {};
		web = plus.webview.getWebviewById(id);
		if(web) {
			if("index" == id) {
				w.toIndex(0)
			} else {
				_.fire(web, "event", extras);
				web.show('slide-in-right', 300)
			}
		} else {
			_.openWindow({
				id: id,
				url: url,
				extras: extras,
				styles: {
					popGesture: "colse"
				},
				show: {
					duration: 300
				},
				waiting: {
					autoShow: false
				}
			})
		}
	};
	w.showWaiting = function() {
		plus.nativeUI.showWaiting("努力加载中...")
	};
	w.closeWaiting = function() {
		plus.nativeUI.closeWaiting()
	};
	w.setItem = function(key, value) {
		w.plus ? plus.storage.setItem(key, value) : localStorage.setItem(key, value)
	};
	w.getItem = function(key) {
		return w.plus ? plus.storage.getItem(key) : localStorage.getItem(key)
	};
	w.clearItem = function() {
		w.plus ? plus.storage.clear() : localStorage.clearItem()
	};
	w.removeItem = function(key) {
		w.plus ? plus.storage.removeItem(key) : localStorage.removeItem(key)
	};
	w.getUser = function() {
		return w.getItem("privateToken")
	};
	w.setUser = function(privateToken) {
		return w.setItem("privateToken", privateToken)
	};
	u.mypost = function(postUrl, pdata, show, success, error) {
		if(show) {
			plus.nativeUI.showWaiting("努力加载中...")
		}
		_.extend(true, pdata, {
			'token': token
		});
		setTimeout(function() {
			_.ajax({
				url: ASKURL + postUrl,
				type: 'post',
				data: pdata,
				timeout: 6000,
				success: function(data) {
					plus.nativeUI.closeWaiting();
					data = JSON.parse(data);
					_.isFunction(success) ? success(data) : ''
				},
				error: function(xhr) {
					console.log(JSON.stringify(xhr));
					plus.nativeUI.closeWaiting();
					_.isFunction(error) ? error() : _.toast('网络连接超时')
				}
			})
		}, 100)
	};
	u.close = function(wid) {
		var thisweb = null;
		if(w.plus) {
			if(wid) {
				thisweb = plus.webview.getWebviewById(wid);
				if(thisweb) {
					thisweb.close("slide-out-right",300)
				}
			} else {
				plus.webview.currentWebview().close("slide-out-right",300)
			}
		}
	};
	var wait = 60;
	u.time = function(o) {
		if(wait == 0) {
			o.removeAttribute("disabled");
			o.textContent = "获取验证码";
			o.value = "获取验证码";
			wait = 60
		} else {
			o.setAttribute("disabled", true);
			o.textContent = "倒计时(" + wait + "s)";
			o.value = "倒计时(" + wait + "s)";
			wait -= 1;
			setTimeout(function() {
				u.time(o)
			}, 1000)
		}
	};
	u.upImg = function(self, type, ind) {
		ind = new Date().getTime();
		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: [{
				title: "拍照上传"
			}, {
				title: "相册选择"
			}]
		}, function(e) {
			if(e.index == 0) {
				return
			}
			if(e.index == 1) {
				var cmr = plus.camera.getCamera();
				cmr.captureImage(function(p) {
					plus.io.resolveLocalFileSystemURL(p, function(entry) {
						var src = entry && entry.toLocalURL();
						var dst = "_doc/temp" + ind + ".jpg";
						plus.zip.compressImage({
							src: src,
							dst: dst,
							width: '50%',
							overwrite: true
						}, function(even) {
							self.src = even.target
						});
						if(type != 3) {
							self.className = 'add-img update';
							self.setAttribute("certificateImg", self.src);
							self.setAttribute("data-preview-src", '');
							self.setAttribute("data-preview-group", '1')
						}
					}, function(e) {
						mui.toast("读取拍照文件错误");
						console.log("读取拍照文件错误：" + e.message)
					})
				}, function(e) {
					mui.toast("拍照失败");
					console.log("失败：" + e.message)
				}, {
					filename: "_doc/camera/",
					index: 1
				})
			} else if(e.index == 2) {
				plus.gallery.pick(function(p) {
					var dst = "_doc/temp" + ind + ".jpg";
					plus.zip.compressImage({
						src: p,
						dst: dst,
						width: '50%',
						overwrite: true
					}, function(even) {
						self.src = even.target
					});
					if(type != 3) {
						self.className = 'add-img update';
						self.setAttribute("certificateImg", self.src);
						self.setAttribute("data-preview-src", '');
						self.setAttribute("data-preview-group", '1')
					}
				}, {
					filter: "image",
					multiple: false
				})
			}
		})
	};
	u.choseDate = function(dateinfo) {
		var dDate = new Date();
		dDate.setFullYear(2010, 1, 1);
		var minDate = new Date();
		minDate.setFullYear(1960, 0, 1);
		var maxDate = new Date();
		maxDate.setFullYear(2016, 12, 31);
		plus.nativeUI.pickDate(function(e) {
			var d = e.date;
			dateinfo.value = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
		}, function(e) {}, {
			title: "请选择日期",
			date: dDate,
			minDate: minDate,
			maxDate: maxDate
		})
	};
	u.exitApp = function() {
		if(plus.os.name == "Android") {
			plus.runtime.quit()
		}
	};
	w.toIndex = function(i) {
		var i = i || 0;
		var idArr = ["gohome", "goClinic", "goInfo", "goMycenter"];
		var main = plus.webview.getWebviewById("index");
		mui.fire(main, 'goIndex', {
			id: idArr[i]
		});
		main.show("slide-out-right",300);
	};
	w.doubleTapExit = function() {
		var backButtonPress = 0;
		_.back = function() {
			++backButtonPress > 1 ? u.exitApp() : _.toast('再按一次退出应用');
			setTimeout(function() {
				backButtonPress = 0
			}, 1000)
		}
	};
	u.emptyHtml = function(list) {
		if(list) {
			list.innerHTML = "";
		}
	};
	u.checkPhone = function(phone) {
		var pReg = /^1[0-9]{10}$/;
		return pReg.test(phone)
	};
	u.checkCall = function(call) {
		var pReg = /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/;
		return pReg.test(call)
	};
	u.isNull = function(value) {
		value = value.replace(/(^\s*)|(\s*$)/g, "");
		return(value === "null" || value === null || value === "" || value === "undefined") ? true : false
	};
	u.hasClass = function(obj, cls) {
		return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
	};
	u.addClass = function(obj, cls) {
		if(!this.hasClass(obj, cls)) {
			obj.className += " " + cls
		}
	}
	u.removeClass = function(obj, cls) {
		if(hasClass(obj, cls)) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			obj.className = obj.className.replace(reg, ' ')
		}
	};
	u.toggleClass = function(obj, cls) {
		if(hasClass(obj, cls)) {
			removeClass(obj, cls)
		} else {
			addClass(obj, cls)
		}
	}
})(window, mui, window.util = {}, window.app = {});

function myerror() {
	mui.toast("获取数据异常,请重试")
}

function gettask(server, callback) {
	return plus.uploader.createUpload(ASKURL + server, {
		method: "POST"
	}, callback)
}

function checkNet() {
	var network = plus.networkinfo.getCurrentType();
	if(network == 1) {
		btnArray = ["设置", "取消"];
		mui.confirm('网络异常，是否前往设置？', '名医肿瘤科', btnArray, function(e) {
			if(e.index == 0) {
				if(plus.os.name == "Android") {
					var main = plus.android.runtimeMainActivity();
					var Intent = plus.android.importClass("android.content.Intent");
					var mIntent = new Intent('android.settings.SETTINGS');
					main.startActivity(mIntent)
				} else {
					plus.runtime.launchApplication({
						action: 'prefs:root=MOBILE_DATA_SETTINGS_ID'
					}, function(e) {});
				}
			}
		})
	}
	if(this.network == 3 && network > 3) {
		plus.nativeUI.toast('您网络已从wifi切换到蜂窝网络，浏览会产生流量')
	}
	this.network = network
}