// Generated by CoffeeScript 1.10.0
var NATIVE_MODULES, Script, fakeHandlers, noop,
  slice = [].slice,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Script = parent.require('vm').Script;

noop = function() {};

fakeHandlers = {};

NATIVE_MODULES = parent.process.binding('natives');


/*
@param {Object} parent Parent's global object.
 */

return (function(_this) {
  return function(vm, parent) {
    'use strict';
    var EXTENSIONS, _prepareRequire, _requireNative, _resolveFilename, fs, global, pa, ref;
    EXTENSIONS = {
      ".json": function(module, filename) {
        return module.exports = JSON.parse(fs.readFileSync(filename, "utf8"));
      }
    };
    global = _this;
    global.global = global.GLOBAL = global.root = global;
    global.isVM = true;

    /*
    	Resolve filename.
     */
    _resolveFilename = function(path) {
      var error, ex, exists, isdir, pkg;
      path = pa.resolve(path);
      exists = fs.existsSync(path);
      isdir = exists ? fs.statSync(path).isDirectory() : false;
      if (exists && !isdir) {
        return path;
      }
      if (fs.existsSync(path + ".js")) {
        return path + ".js";
      }
      if (fs.existsSync(path + ".node")) {
        return path + ".node";
      }
      if (fs.existsSync(path + ".json")) {
        return path + ".json";
      }
      if (fs.existsSync(path + "/package.json")) {
        try {
          pkg = JSON.parse(fs.readFileSync(path + "/package.json", "utf8"));
          if (pkg.main == null) {
            pkg.main = "index.js";
          }
        } catch (error) {
          ex = error;
          throw new VMError("Module '" + modulename + "' has invalid package.json", "EMODULEINVALID");
        }
        return _resolveFilename(path + "/" + pkg.main);
      }
      if (fs.existsSync(path + "/index.js")) {
        return path + "/index.js";
      }
      if (fs.existsSync(path + "/index.node")) {
        return path + "/index.node";
      }
      return null;
    };

    /*
    	Prepare require.
     */
    _requireNative = function(modulename) {
      'use strict';
      var module, script;
      if (vm.natives[modulename]) {
        return vm.natives[modulename].exports;
      }
      script = new Script("(function (exports, require, module, process) { 'use strict'; " + NATIVE_MODULES[modulename] + " \n});", {
        filename: modulename + ".sb.js"
      });
      vm.natives[modulename] = module = {
        exports: {},
        require: _requireNative
      };
      script.runInContext(global)(module.exports, module.require, module, parent.process);
      return module.exports;
    };
    _prepareRequire = function(current_dirname) {
      var _require;
      _require = function(modulename) {
        'use strict';
        var closure, code, dirname, error, error1, error2, ex, extname, filename, module, path, paths, requiredPath, script, strictText;
        if (!vm.options.require) {
          throw new VMError("Access denied to require '" + modulename + "'", "EDENIED");
        }
        if (modulename == null) {
          throw new VMError("Module '' not found.", "ENOTFOUND");
        }
        if (typeof modulename !== 'string') {
          throw new VMError("Invalid module name '" + modulename + "'", "EINVALIDNAME");
        }
        if (NATIVE_MODULES[modulename]) {
          if (vm.options.requireNative) {
            if (vm.options.requireNative[modulename]) {
              return _requireNative(modulename);
            }
          }
          throw new VMError("Access denied to require '" + modulename + "'", "EDENIED");
        }
        if (!vm.options.requireExternal) {
          throw new VMError("Access denied to require '" + modulename + "'", "EDENIED");
        }
        if (/^(\.\/|\.\.\/)/.exec(modulename)) {
          if (!current_dirname) {
            throw new VMError("You must specify script path to load relative modules.", "ENOPATH");
          }
          filename = _resolveFilename(current_dirname + "/" + modulename);
        } else if (/^(\/|\\|[a-zA-Z]:\\)/.exec(modulename)) {
          filename = _resolveFilename(modulename);
        } else {
          if (!current_dirname) {
            throw new VMError("You must specify script path to load relative modules.", "ENOPATH");
          }
          paths = current_dirname.split(pa.sep);
          while (paths.length) {
            path = paths.join(pa.sep);
            filename = _resolveFilename("" + path + pa.sep + "node_modules" + pa.sep + modulename);
            if (filename) {
              break;
            }
            paths.pop();
          }
        }
        if (!filename) {
          throw new VMError("Module '" + modulename + "' not found", "ENOTFOUND");
        }
        if (vm.cache[filename]) {
          return vm.cache[filename].exports;
        }
        dirname = pa.dirname(filename);
        extname = pa.extname(filename);
        if (vm.options.requireRoot) {
          requiredPath = pa.resolve(vm.options.requireRoot);
          if (dirname.indexOf(requiredPath) !== 0) {
            throw new VMError("Module '" + modulename + "' is not allowed to be required. The path is outside the border!", "EDENIED");
          }
        }
        vm.cache[filename] = module = {
          filename: filename,
          exports: {},
          require: _prepareRequire(dirname)
        };
        if (EXTENSIONS[extname]) {
          try {
            EXTENSIONS[extname](module, filename);
            return module.exports;
          } catch (error) {
            ex = error;
            throw new VMError("Failed to load '" + filename + "': [" + ex.message + "]", "ELOADFAIL");
          }
        }
        if (extname === '.node') {
          try {
            parent.process.dlopen(module, filename);
            return module.exports;
          } catch (error1) {
            ex = error1;
            throw new VMError("Failed to load '" + filename + "': [" + ex.message + "]", "ELOADFAIL");
          }
        }
        try {
          strictText = vm.options.useStrict ? "'use strict'; " : "";
          code = "(function (exports, require, module, __filename, __dirname) { " + strictText + (fs.readFileSync(filename, "utf8")) + " \n});";
        } catch (error2) {
          ex = error2;
          throw new VMError("Failed to load '" + filename + "': [" + ex.message + "]", "ELOADFAIL");
        }
        script = new Script(code, {
          filename: filename != null ? filename : "vm",
          displayErrors: false
        });
        closure = script.runInContext(global, {
          filename: filename != null ? filename : "vm",
          displayErrors: false
        });
        closure(module.exports, module.require, module, filename, dirname);
        return module.exports;
      };
      _require.cache = vm.cache;
      _require.extensions = EXTENSIONS;
      return _require;
    };

    /*
    	Prepare sandbox.
     */
    global.setTimeout = function(callback) {
      var tmr;
      arguments[0] = function() {
        return callback.apply(null, arguments);
      };
      tmr = parent.setTimeout.apply(parent, arguments);
      return {
        ref: function() {
          return tmr.ref();
        },
        unref: function() {
          return tmr.unref();
        }
      };
    };
    global.setInterval = function(callback) {
      arguments[0] = function() {
        return callback.call(null);
      };
      parent.setInterval.apply(parent, arguments);
      return {
        ref: function() {
          return tmr.ref();
        },
        unref: function() {
          return tmr.unref();
        }
      };
    };
    global.setImmediate = function(callback) {
      arguments[0] = function() {
        return callback.call(null);
      };
      parent.setImmediate.apply(parent, arguments);
      return {
        ref: function() {
          return tmr.ref();
        },
        unref: function() {
          return tmr.unref();
        }
      };
    };
    global.clearTimeout = function() {
      parent.clearTimeout.apply(parent, arguments);
      return null;
    };
    global.clearInterval = function() {
      parent.clearInterval.apply(parent, arguments);
      return null;
    };
    global.clearImmediate = function() {
      parent.clearImmediate.apply(parent, arguments);
      return null;
    };
    global.process = {
      argv: [],
      title: parent.process.title,
      version: parent.process.version,
      versions: contextify(parent.process.versions),
      arch: parent.process.arch,
      platform: parent.process.platform,
      env: {},
      pid: parent.process.pid,
      features: contextify(parent.process.features),
      nextTick: function(callback) {
        return parent.process.nextTick(function() {
          return callback.call(null);
        });
      },
      hrtime: function() {
        return parent.process.hrtime();
      },
      cwd: function() {
        return parent.process.cwd();
      },
      on: function(name, handler) {
        var fake;
        if (name !== 'beforeExit' && name !== 'exit') {
          throw new Error("Access denied to listen for '" + name + "' event.");
        }
        fake = function() {
          return handler.call(null);
        };
        if (fakeHandlers[name] == null) {
          fakeHandlers[name] = new Map();
        }
        fakeHandlers[name].set(handler, fake);
        parent.process.on(name, fake);
        return this;
      },
      once: function(name, handler) {
        var fake, ref;
        if (name !== 'beforeExit' && name !== 'exit') {
          throw new Error("Access denied to listen for '" + name + "' event.");
        }
        if ((ref = fakeHandlers[name]) != null ? ref.has(handler) : void 0) {
          return this;
        }
        fake = function() {
          fakeHandlers[name]["delete"](handler);
          return handler.call(null);
        };
        if (fakeHandlers[name] == null) {
          fakeHandlers[name] = new Map();
        }
        fakeHandlers[name].set(handler, fake);
        parent.process.once(name, fake);
        return this;
      },
      listeners: function(name) {
        var array;
        if (!fakeHandlers[name]) {
          return [];
        }
        array = [];
        fakeHandlers[name].forEach(function(value, key) {
          return array.push(key);
        });
        return array;
      },
      removeListener: function(name, handler) {
        var fake, ref;
        fake = (ref = fakeHandlers[name]) != null ? ref.get(handler) : void 0;
        if (fake == null) {
          return this;
        }
        fakeHandlers[name]["delete"](handler);
        parent.process.removeListener(name, fake);
        return this;
      },
      umask: function() {
        if (arguments.length) {
          throw new Error("Access denied to set umask.");
        }
        return parent.process.umask();
      }
    };
    if (vm.options.console === 'inherit') {
      global.console = {
        log: function() {
          var ref;
          (ref = parent.console).log.apply(ref, arguments);
          return null;
        },
        info: function() {
          var ref;
          (ref = parent.console).info.apply(ref, arguments);
          return null;
        },
        warn: function() {
          var ref;
          (ref = parent.console).warn.apply(ref, arguments);
          return null;
        },
        error: function() {
          var ref;
          (ref = parent.console).error.apply(ref, arguments);
          return null;
        },
        dir: function() {
          var ref;
          (ref = parent.console).dir.apply(ref, arguments);
          return null;
        },
        time: function() {
          var ref;
          (ref = parent.console).time.apply(ref, arguments);
          return null;
        },
        timeEnd: function() {
          var ref;
          (ref = parent.console).timeEnd.apply(ref, arguments);
          return null;
        },
        trace: function() {
          var ref;
          (ref = parent.console).trace.apply(ref, arguments);
          return null;
        }
      };
    } else if (vm.options.console === 'redirect') {
      global.console = {
        log: function() {
          vm.emit.apply(vm, ['console.log'].concat(slice.call(arguments)));
          return null;
        },
        info: function() {
          vm.emit.apply(vm, ['console.info'].concat(slice.call(arguments)));
          return null;
        },
        warn: function() {
          vm.emit.apply(vm, ['console.warn'].concat(slice.call(arguments)));
          return null;
        },
        error: function() {
          vm.emit.apply(vm, ['console.error'].concat(slice.call(arguments)));
          return null;
        },
        dir: function() {
          vm.emit.apply(vm, ['console.dir'].concat(slice.call(arguments)));
          return null;
        },
        time: noop,
        timeEnd: noop,
        trace: function() {
          vm.emit.apply(vm, ['console.trace'].concat(slice.call(arguments)));
          return null;
        }
      };
    }
    if (parent.DTRACE_HTTP_SERVER_RESPONSE) {
      global.DTRACE_HTTP_SERVER_RESPONSE = function() {
        return parent.DTRACE_HTTP_SERVER_RESPONSE.apply(parent, arguments);
      };
      global.DTRACE_HTTP_SERVER_REQUEST = function() {
        return parent.DTRACE_HTTP_SERVER_REQUEST.apply(parent, arguments);
      };
      global.DTRACE_HTTP_CLIENT_RESPONSE = function() {
        return parent.DTRACE_HTTP_CLIENT_RESPONSE.apply(parent, arguments);
      };
      global.DTRACE_HTTP_CLIENT_REQUEST = function() {
        return parent.DTRACE_HTTP_CLIENT_REQUEST.apply(parent, arguments);
      };
      global.DTRACE_NET_STREAM_END = function() {
        return parent.DTRACE_NET_STREAM_END.apply(parent, arguments);
      };
      global.DTRACE_NET_SERVER_CONNECTION = function() {
        return parent.DTRACE_NET_SERVER_CONNECTION.apply(parent, arguments);
      };
      global.DTRACE_NET_SOCKET_READ = function() {
        return parent.DTRACE_NET_SOCKET_READ.apply(parent, arguments);
      };
      global.DTRACE_NET_SOCKET_WRITE = function() {
        return parent.DTRACE_NET_SOCKET_WRITE.apply(parent, arguments);
      };
    }
    if (parent.COUNTER_NET_SERVER_CONNECTION) {
      global.COUNTER_NET_SERVER_CONNECTION = function() {
        return parent.COUNTER_NET_SERVER_CONNECTION.apply(parent, arguments);
      };
      global.COUNTER_NET_SERVER_CONNECTION_CLOSE = function() {
        return parent.COUNTER_NET_SERVER_CONNECTION_CLOSE.apply(parent, arguments);
      };
      global.COUNTER_HTTP_SERVER_REQUEST = function() {
        return parent.COUNTER_HTTP_SERVER_REQUEST.apply(parent, arguments);
      };
      global.COUNTER_HTTP_SERVER_RESPONSE = function() {
        return parent.COUNTER_HTTP_SERVER_RESPONSE.apply(parent, arguments);
      };
      global.COUNTER_HTTP_CLIENT_REQUEST = function() {
        return parent.COUNTER_HTTP_CLIENT_REQUEST.apply(parent, arguments);
      };
      global.COUNTER_HTTP_CLIENT_RESPONSE = function() {
        return parent.COUNTER_HTTP_CLIENT_RESPONSE.apply(parent, arguments);
      };
    }
    if (vm.options.require && ((ref = vm.options.requireNative) != null ? ref['buffer'] : void 0) === true) {
      global.Buffer = _requireNative('buffer').Buffer;
    }
    fs = parent.require('fs');
    pa = parent.require('path');

    /*
    	VMError definition.
     */
    global.VMError = (function(superClass) {
      extend(VMError, superClass);

      function VMError(message, code) {
        this.name = this.constructor.name;
        this.message = message;
        this.code = code;
        VMError.__super__.constructor.call(this);
        Error.captureStackTrace(this, this.constructor);
      }

      return VMError;

    })(Error);
    return {

      /*
      	Return contextized variables.
       */
      cache: {},
      module: {
        filename: __filename,
        exports: {},
        require: _prepareRequire(__dirname)
      },
      proxy: function() {
        var arg, args, i, index, len, method;
        method = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        for (index = i = 0, len = args.length; i < len; index = ++i) {
          arg = args[index];
          args[index] = contextify(arg);
        }
        return method.apply(null, args);
      }
    };
  };
})(this)(vm, parent);
