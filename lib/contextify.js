// Generated by CoffeeScript 1.10.0
var contextify, global;

global = this;

global.global = global.GLOBAL = global.root = global;

global.SANDBOX = true;


/*
Contextify is similar to deep clone, but changes context of all objects to vm's context.
 */

contextify = (function(_this) {
  return function(value, addtoglobal) {
    'use strict';
    var desc, i, j, key, len, o, ref, ut;
    ut = require('util');
    switch (typeof value) {
      case 'object':
        if (value === null) {
          o = null;
        } else if (ut.isDate(value)) {
          o = new Date(value.getTime());
        } else if (ut.isError(value)) {
          o = new Error(value.message);
        } else if (ut.isArray(value)) {
          o = (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = value.length; j < len; j++) {
              i = value[j];
              results.push(contextify(i));
            }
            return results;
          })();
        } else if (ut.isRegExp(value)) {
          o = new RegExp(value.source, "" + (value.global ? "g" : "") + (value.ignoreCase ? "i" : "") + (value.multiline ? "i" : ""));
        } else if (ut.isBuffer(value)) {
          if (_this.Buffer) {
            o = new _this.Buffer(value.length);
            value.copy(o);
          } else {
            o = null;
          }
        } else {
          o = {};
          ref = Object.getOwnPropertyNames(value);
          for (j = 0, len = ref.length; j < len; j++) {
            key = ref[j];
            desc = Object.getOwnPropertyDescriptor(value, key);
            if (desc.value != null) {
              desc.value = contextify(desc.value);
            }
            if (desc.get != null) {
              desc.get = contextify(desc.get);
            }
            if (desc.set != null) {
              desc.set = contextify(desc.set);
            }
            Object.defineProperty(o, key, desc);
          }
        }
        break;
      case 'function':
        o = function() {
          return value.apply(null, arguments);
        };
        break;
      case 'undefined':
        o = void 0;
        break;
      default:
        o = value;
    }
    if (addtoglobal) {
      _this[addtoglobal] = o;
    }
    return o;
  };
})(this);

return contextify;