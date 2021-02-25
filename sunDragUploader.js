(function () {
    var moduleName = "sunDrapUploader",
        version = "v1.0.0";
    var utils = {
        defauleFnRetFalse: function (fn) {
            fn.apply(null, arguments)
            return false
        },
        noop: function () {}
    };
    var pluginsLib = {};
    function OuterFac (options) {
      var fac = new Fac(options);
      this.FacSetCount = fac.setFileCount.bind(fac)
    };
    OuterFac.prototype = {
      setFileCount: this.FacSetCount
    };
    function Fac(options) {
        var souceInstance = new _Souce();
        this.options = options;
        this.getFile = options.getFile || utils.noop;
        this.rules = options.rules;
        this.fileAreaEnter = options.fileAreaEnter || utils.noop;
        this.fileAreaLeave = options.fileAreaLeave || utils.noop;
        this.filePageEnter = options.filePageEnter || utils.noop;
        this.eventTirrger = options.eventTirrger || utils.noop;
        this.fileType = options.fileType || "file";
        this.errFileFilter = options.errFileFilter || false;
        this.eventInstance = null;
        this.init(souceInstance);
    };
    Fac.prototype = {
        init: function (souceInstance) {
            var target = this.options.target;
            this.targetMount.apply(souceInstance, [target, this]);
            this.registerPlugins()
        },
        registerPlugins: function () {
            var _this = this;
            this.pluginInstalls.forEach(function (register) {
                register(_this);
            })
        },
        targetMount: function (selector, scope) {
            var selectorTag = selector.split("").shift(),
                targetMap = this.selectorMap[selectorTag](selector),
                target = targetMap.target,
                targetType = targetMap.type;
            var eventInstance = new EventSetter().setRelyOptions(["dragover", "dragenter", "dragleave", "drop", "click"]).bounds(target, targetType, scope).tirrger(function (e, moudle, type, text) {
                if (moudle == "dragover") return e.preventDefault();
                if (moudle == "dragenter") return utils.defauleFnRetFalse(scope.fileAreaEnter);
                if (moudle == "dragleave") return utils.defauleFnRetFalse(scope.fileAreaLeave);
                if (moudle == "drop") return this.dropFile(e, scope.getFile, scope.fileVerAction.bind(scope))
                if (moudle == "click") return this.clickFile(e, scope.getFile, scope.fileVerAction.bind(scope));
                if (moudle == "documentOver") return utils.defauleFnRetFalse(scope.filePageEnter);
            }).setDep(scope);
            this.eventInstance = eventInstance;
        },
        fileVerAction: function (files) {
            !this.rules && (this.rules = {});
            var fileKeys = Object.keys(files);
            var fileLen = fileKeys.length;
            var rule_size_max = this.rules.maxSize;
            var rule_size_min = this.rules.minSize;
            var rule_fileType = this.rules.fileType || [];
            var rule_file_num = this.rules.fileCount;
            if (rule_file_num && rule_file_num < fileLen) {
                return {
                    errType: "fileCount",
                    value: rule_file_num,
                    rule: fileLen
                }
            }
            fileKeys.forEach(function (idx) {
                var file = files[idx];
                var fileSize = file.size;
                var fileType = file.name.slice(file.name.lastIndexOf(".")).replace(".", "");
                var errNum = 0;
                file.verMsg = {
                    errList: [],
                    verState: 0
                }
                if (Array.isArray(rule_fileType) && rule_fileType.length > 0 && rule_fileType.indexOf(fileType) < 0) {
                    file.verMsg.errList.push({
                        errType: "fileType",
                        value: fileType,
                        rule: rule_fileType
                    });
                    errNum++;
                }
                ;
                if (rule_size_max && rule_size_max < fileSize) {
                    file.verMsg.errList.push({
                        errType: "maxSize",
                        value: fileSize,
                        rule: rule_size_max
                    });
                    errNum++;
                }
                ;
                if (rule_size_min && rule_size_min > fileSize) {
                    file.verMsg.errList.push({
                        errType: "minSize",
                        value: fileSize,
                        rule: rule_size_max
                    });
                    errNum++;
                }
                ;
                file.verMsg.verState = errNum == 0 ? 2 : 0;
            });
        },
        use: function (Factor) {
            Fac.prototype.pluginInstalls.push(Factor.install);
        },
        pluginInstalls: [],
        plugins: pluginsLib,
        _getAllFiles: function () {
          return this.files
        },
        _getFilterFiles: function () {
          var _this = this;
          var getSwicthFiles = function (ver) {
            return _this.files.filter(function (item) {
              return ver(item.file.verMsg.errList.length)
            });
          }
          return {
            acrossFiles: getSwicthFiles(function (len) { return len == 0 }),
            verErrFiles: getSwicthFiles(function (len) { return len > 0 }),
          }
        },
        getFiles: function () {
          return this.errFileFilter ? this._getFilterFiles() : this._getAllFiles();
        },
        setFileCount: function (count) {
          this.options.rules.fileCount = count;
        }
    };
    function _Souce() {};
    _Souce.prototype = {
        selectorMap: {
            "#": function (selector) {
                var selectorString = selector.slice(1);
                return {
                    target: document.getElementById(selectorString),
                    type: "HTMLElement"
                }
            },
            ".": function (selector) {
                var selectorString = selector.slice(1);
                return {
                    target: document.getElementsByClassName(selectorString),
                    type: "HTMLCollection"
                }
            }
        },
        logger: function (type, text) {

        },
    }
    function EventSetter(setterOptions) {
        this.globalScope = null;
        this.relyOptions = [];
        this.tirrgerFn = null;
        this.bounderState = 0; // 0 未绑定||已移除 1 已绑定 2 已更新
        this.defaultRet = {
            bounds: this.bounds.bind(this),
            setRelyOptions: this.setRelyOptions.bind(this),
            tirrger: this.tirrger.bind(this),
            setDep: this.setDep.bind(this)
        };
        this.createInputFile();
        this.fileTypeMap = {
          file: this.getDefaltFile,
          base64: this.getBase64File
        };
        this.dragCount = 0;
        this.depObject = null;
        return this.defaultRet
    };
    EventSetter.prototype = {
        bounds: function (target, type, scope) {
            this.globalScope = scope;
            if (this.relyOptions.length > 0) {
                var _this = this;
                type == "HTMLCollection"
                    ? Array.prototype.forEach.call(target, function (tar, index) {
                        _this.eventBounder(tar, index)
                    })
                    : this.eventBounder(target);
            }
            return this.defaultRet
        },
        tirrger: function (fn) {
            this.tirrgerFn = fn;
            return this.defaultRet
        },
        setDep: function (scope) {
          this.depObject = scope;
        },
        tirggerDefault: function (event, target, index) {
            var _this = this;
            return function (e) {
                _this.tirrgerFn.apply(_this, [e, event, target, index])
            }
        },
        eventBounder: function (target, index) {
            var _this = this;
            this.bounderState = 1;
            document.ondragover = _this.tirggerDefault("documentOver", target, index);
            this.relyOptions.forEach(function (event) {
                target["on" + event] = _this.tirggerDefault(event, target, index);
            })
        },
        setRelyOptions: function (arr) {
            this.relyOptions = arr;
            return this.defaultRet;
        },
        dropFile: function (e, callback, fileVerAction) {
          var oFile = e.dataTransfer.files;
            this.getFile(oFile, callback, fileVerAction)
            e.preventDefault();
            return false
        },
        getFile: function (oFile, callback, fileVerAction) {
            var _this = this;
            var retVerResult = fileVerAction(oFile);
            if (retVerResult) {
              this.globalScope.eventTirrger(retVerResult)
              return
            };
            this.dragCount++;
            var fileKeys = Object.keys(oFile);
            var fileLength = fileKeys.length;
            var readers = [];
            fileKeys.forEach(function (idx) {
                var fileResouce = oFile[idx];
                var SpecifiedType = _this.globalScope.fileType;
                var fileTypeMap = _this.fileTypeMap;
                var switchSpeciedType = fileTypeMap[SpecifiedType];
                switchSpeciedType(fileResouce, function (res) {
                    readers.push(res)
                    if (readers.length == fileLength)  {
                        _this.globalScope.files = readers;
                        callback(_this.depObject.getFiles(), _this.dragCount)
                    }
                })
            });
        },
        getDefaltFile: function (fileResouce, callback) {
            callback({
                fileName: fileResouce.name,
                fileType: fileResouce.type,
                fileSize: fileResouce.size,
                file: fileResouce,
                readedState: true,
                verMsg: fileResouce.verMsg
            })
        },
        getBase64File: function (fileResouce, callback) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
               callback({
                   fileName: fileResouce.name,
                   fileType: fileResouce.type,
                   fileSize: fileResouce.size,
                   fileBase64: fileReader.result,
                   readedState: fileResouce.readyState == 2,
                   verMsg: fileResouce.verMsg
               })
            }
            fileReader.readAsDataURL(fileResouce, "base64");
        },
        createInputFile: function () {
            var _input = document.createElement("input");
            _input.setAttribute("type", "file");
            _input.setAttribute("multiple", "multiplt");
            _input.style.cssText = 'position: absolute;top:0;z-index: -10; opacity:0;width:0';
            document.getElementsByTagName("body")[0].appendChild(_input);
            this.vInput = _input;
        },
        fileChange: function (e, callback, fileVerAction) {
          var oFile = e.target.files;
          this.getFile(oFile, callback, fileVerAction);
        },
        clickFile: function (e, callback, fileVerAction) {
            var _this = this;
            this.vInput.click();
            this.vInput.onchange = function (e) {
              _this.fileChange(e, callback, fileVerAction)
            };
        },
    };
    OuterFac.use = Fac.prototype.use;
    window[moduleName] = OuterFac;
})()