// Generated by CoffeeScript 1.6.2
/*
    File: fjs-runtime.cof -- Module used by every compiled fjs file
	coffee -c fjs-runtime.cof
*/


(function() {
  var Context, Frame,
    __slice = [].slice;

  Frame = (function() {
    function Frame(codeFuncSegs, segIdx, stack) {
      this.codeFuncSegs = codeFuncSegs;
      this.segIdx = segIdx != null ? segIdx : 0;
      this.stack = stack != null ? stack : [];
    }

    Frame.prototype.clone = function() {
      return new Frame(this.codeFuncSegs, this.segIdx, this.stack.slice(0));
    };

    return Frame;

  })();

  Context = (function() {
    function Context(curFrame) {
      this.curFrame = curFrame != null ? curFrame : null;
      this.frames = [];
      this.callbacksPending = 0;
    }

    Context.prototype.clone = function() {
      var newCtxt;

      newCtxt = new Context(this.curFrame.clone());
      return newCtxt;
    };

    Context.prototype.stack = function() {
      return this.curFrame.stack;
    };

    Context.prototype.pop = function() {
      return this.curFrame.stack.shift();
    };

    Context.prototype.popAll = function() {
      var stk;

      stk = this.curFrame.stack;
      this.curFrame.stack = [];
      return stk;
    };

    Context.prototype.popN = function(n) {
      n || (n = this.curFrame.stack.length);
      return this.curFrame.stack.splice(0, n);
    };

    Context.prototype.push = function(v) {
      return this.curFrame.stack.unshift(v);
    };

    Context.prototype.pushOuter = function(n) {
      var items, outerStk;

      outerStk = this.frames[this.frames.length - 1].stack;
      n || (n = outerStk.length);
      items = outerStk.splice(0, n);
      return this.curFrame.stack = items.concat(this.curFrame.stack);
    };

    Context.prototype["new"] = function(Class, args) {
      return (function() {
        var construct;

        construct = function() {
          return Class.apply(this, args);
        };
        construct.prototype = Class.prototype;
        return new construct;
      })();
    };

    Context.prototype.pushArray = function(array) {
      return this.curFrame.stack = array.concat(this.curFrame.stack);
    };

    Context.prototype.pushReturnValue = function(val) {
      if (typeof val === 'undefined') {
        return;
      }
      if (val instanceof Array) {
        return this.pushArray(val);
      } else if (toString.call(val) === '[object Arguments]') {
        return this.pushArray(Array.prototype.slice(call(val)));
      } else {
        return this.curFrame.stack.unshift(val);
      }
    };

    Context.prototype.pushArgsAndExec = function(f, n) {
      if (n == null) {
        n = this.curFrame.stack.length;
      }
      this.overrideDefault = true;
      this.pushReturnValue(f.apply(this, this.curFrame.stack.splice(0, n)));
      return delete this.overrideDefault;
    };

    Context.prototype.execOrPush = function(word) {
      var stk;

      if (typeof word === 'function') {
        stk = this.curFrame.stack;
        this.curFrame.stack = [];
        return this.pushReturnValue(word.apply(this, stk));
      } else {
        return this.push(word);
      }
    };

    Context.prototype.pushCB = function(debugFunc) {
      this.curFrame.stack.unshift(this._callback.bind(this, debugFunc));
      return this.callbacksPending++;
    };

    Context.prototype._callback = function() {
      var args, ctxt, debugFunc;

      debugFunc = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (--this.callbacksPending > 0) {
        return;
      }
      ctxt = (this.callbacksPending === 0 ? this : ctxt = this.savedCtxt);
      this.savedCtxt = ctxt.clone();
      ctxt.curFrame.stack = args.concat(ctxt.curFrame.stack);
      if (debugFunc) {
        console.log();
        debugFunc.call(ctxt, '<callback>');
      }
      return ctxt._run();
    };

    Context.prototype.funcCall = function(debugFunc, segments) {
      this.frames.push(this.curFrame);
      this.curFrame = new Frame(segments);
      if (debugFunc) {
        debugFunc.call(this, '(');
      }
      return this._run();
    };

    Context.prototype._run = function(args) {
      var _ref;

      return (_ref = this.curFrame.codeFuncSegs[this.curFrame.segIdx++]) != null ? _ref.call(this) : void 0;
    };

    Context.prototype.wait = function() {
      if (this.callbacksPending < 1) {
        return this._run();
      }
    };

    Context.prototype.funcReturn = function() {
      var stack;

      stack = this.curFrame.stack;
      if ((this.curFrame = this.frames.pop())) {
        return this.curFrame.stack = stack.concat(this.curFrame.stack);
      }
    };

    return Context;

  })();

  module.exports = new Context;

}).call(this);
