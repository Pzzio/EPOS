/*
Copyright (c) 2008-2016 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
let getJasmineRequireObj = (function (jasmineGlobal) {
    let jasmineRequire;

    if (typeof module !== 'undefined' && module.exports && typeof exports !== 'undefined') {
        if (typeof global !== 'undefined') {
            jasmineGlobal = global;
        } else {
            jasmineGlobal = {};
        }
        jasmineRequire = exports;
    } else {
        if (typeof window !== 'undefined' && typeof window.toString === 'function' && window.toString() === '[object GjsGlobal]') {
            jasmineGlobal = window;
        }
        jasmineRequire = jasmineGlobal.jasmineRequire = jasmineGlobal.jasmineRequire || {};
    }

    function getJasmineRequire() {
        return jasmineRequire;
    }

    getJasmineRequire().core = function (jRequire) {
        let j$ = {};

        jRequire.base(j$, jasmineGlobal);
        j$.util = jRequire.util();
        j$.errors = jRequire.errors();
        j$.formatErrorMsg = jRequire.formatErrorMsg();
        j$.Any = jRequire.Any(j$);
        j$.Anything = jRequire.Anything(j$);
        j$.CallTracker = jRequire.CallTracker(j$);
        j$.MockDate = jRequire.MockDate();
        j$.Clock = jRequire.Clock();
        j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler();
        j$.Env = jRequire.Env(j$);
        j$.ExceptionFormatter = jRequire.ExceptionFormatter();
        j$.Expectation = jRequire.Expectation();
        j$.buildExpectationResult = jRequire.buildExpectationResult();
        j$.JsApiReporter = jRequire.JsApiReporter();
        j$.matchersUtil = jRequire.matchersUtil(j$);
        j$.ObjectContaining = jRequire.ObjectContaining(j$);
        j$.ArrayContaining = jRequire.ArrayContaining(j$);
        j$.pp = jRequire.pp(j$);
        j$.QueueRunner = jRequire.QueueRunner(j$);
        j$.ReportDispatcher = jRequire.ReportDispatcher();
        j$.Spec = jRequire.Spec(j$);
        j$.SpyRegistry = jRequire.SpyRegistry(j$);
        j$.SpyStrategy = jRequire.SpyStrategy(j$);
        j$.StringMatching = jRequire.StringMatching(j$);
        j$.Suite = jRequire.Suite(j$);
        j$.Timer = jRequire.Timer();
        j$.TreeProcessor = jRequire.TreeProcessor();
        j$.version = jRequire.version();
        j$.Order = jRequire.Order();

        j$.matchers = jRequire.requireMatchers(jRequire, j$);

        return j$;
    };

    return getJasmineRequire;
})(this);

getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
  let availableMatchers = [
          'toBe',
          'toBeCloseTo',
          'toBeDefined',
          'toBeFalsy',
          'toBeGreaterThan',
          'toBeGreaterThanOrEqual',
          'toBeLessThanOrEqual',
          'toBeLessThan',
          'toBeNaN',
          'toBeNull',
          'toBeTruthy',
          'toBeUndefined',
          'toContain',
          'toEqual',
          'toHaveBeenCalled',
          'toHaveBeenCalledWith',
          'toHaveBeenCalledTimes',
          'toMatch',
          'toThrow',
          'toThrowError'
    ],
      matchers = {};

  for (let i = 0; i < availableMatchers.length; i++) {
    let name = availableMatchers[i];
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};

getJasmineRequireObj().base = function(j$, jasmineGlobal) {
  j$.unimplementedMethod_ = function() {
    throw new Error('unimplemented method');
  };

  j$.MAX_PRETTY_PRINT_DEPTH = 40;
  j$.MAX_PRETTY_PRINT_ARRAY_LENGTH = 100;
  j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

  j$.getGlobal = function() {
    return jasmineGlobal;
  };

  j$.getEnv = function(options) {
    //noinspection UnnecessaryLocalVariableJS
      let env = j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options);
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_('Array', value);
  };

  j$.isString_ = function(value) {
    return j$.isA_('String', value);
  };

  j$.isNumber_ = function(value) {
    return j$.isA_('Number', value);
  };

  j$.isFunction_ = function(value) {
    return j$.isA_('Function', value);
  };

  j$.isA_ = function(typeName, value) {
    return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
  };

  j$.isDomNode = function(obj) {
    return obj.nodeType > 0;
  };

  j$.fnNameFor = function(func) {
    if (func.name) {
      return func.name;
    }

    let matches = func.toString().match(/^\s*function\s*(\w*)\s*\(/);
    return matches ? matches[1] : '<anonymous>';
  };

  j$.any = function(clazz) {
    return new j$.Any(clazz);
  };

  j$.anything = function() {
    return new j$.Anything();
  };

  j$.objectContaining = function(sample) {
    return new j$.ObjectContaining(sample);
  };

  j$.stringMatching = function(expected) {
    return new j$.StringMatching(expected);
  };

  j$.arrayContaining = function(sample) {
    return new j$.ArrayContaining(sample);
  };

  j$.createSpy = function(name, originalFn) {

    let spyStrategy = new j$.SpyStrategy({
        name: name,
        fn: originalFn,
        getSpy: function () {
            return spy;
        }
        }),
        callTracker = new j$.CallTracker(),
        spy = function () {
          let callData = {
              object: this,
              args: Array.prototype.slice.apply(arguments)
          };
  
          callTracker.track(callData);
          let returnValue = spyStrategy.exec.apply(this, arguments);
          callData.returnValue = returnValue;
  
          return returnValue;
        };

    for (let prop in originalFn) {
      if (prop === 'and' || prop === 'calls') {
        throw new Error('Jasmine spies would overwrite the \'and\' and \'calls\' properties on the object being spied upon');
      }

      spy[prop] = originalFn[prop];
    }

    spy.and = spyStrategy;
    spy.calls = callTracker;

    return spy;
  };

  j$.isSpy = function(putativeSpy) {
    if (!putativeSpy) {
      return false;
    }
    return putativeSpy.and instanceof j$.SpyStrategy &&
      putativeSpy.calls instanceof j$.CallTracker;
  };

  j$.createSpyObj = function(baseName, methodNames) {
    if (j$.isArray_(baseName) && j$.util.isUndefined(methodNames)) {
      methodNames = baseName;
      baseName = 'unknown';
    }

    if (!j$.isArray_(methodNames) || methodNames.length === 0) {
      throw 'createSpyObj requires a non-empty array of method names to create spies for';
    }
    let obj = {};
    for (let i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
    }
    return obj;
  };
};

getJasmineRequireObj().util = function() {

  let util = {};

  util.inherit = function(childClass, parentClass) {
    let Subclass = function () {
    };
    Subclass.prototype = parentClass.prototype;
    childClass.prototype = new Subclass();
  };

  util.htmlEscape = function(str) {
    if (!str) {
      return str;
    }
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    let arrayOfArgs = [];
    for (let i = 0; i < args.length; i++) {
      arrayOfArgs.push(args[i]);
    }
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  util.arrayContains = function(array, search) {
    let i = array.length;
    while (i--) {
      if (array[i] === search) {
        return true;
      }
    }
    return false;
  };

  util.clone = function(obj) {
    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      return obj.slice();
    }

    let cloned = {};
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        cloned[prop] = obj[prop];
      }
    }

    return cloned;
  };

  return util;
};

getJasmineRequireObj().Spec = function(j$) {
  function Spec(attrs) {
    this.expectationFactory = attrs.expectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.description = attrs.description || '';
    this.queueableFn = attrs.queueableFn;
    this.beforeAndAfterFns = attrs.beforeAndAfterFns || function() { return {befores: [], afters: []}; };
    this.userContext = attrs.userContext || function() { return {}; };
    this.onStart = attrs.onStart || function() {};
    this.getSpecName = attrs.getSpecName || function() { return ''; };
    this.expectationResultFactory = attrs.expectationResultFactory || function() { };
    this.queueRunnerFactory = attrs.queueRunnerFactory || function() {};
    this.catchingExceptions = attrs.catchingExceptions || function() { return true; };
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;

    if (!this.queueableFn.fn) {
      this.pend();
    }

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: [],
      passedExpectations: [],
      pendingReason: ''
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data, isError) {
    let expectationResult = this.expectationResultFactory(data);
    if (passed) {
      this.result.passedExpectations.push(expectationResult);
    } else {
      this.result.failedExpectations.push(expectationResult);

      if (this.throwOnExpectationFailure && !isError) {
        throw new j$.errors.ExpectationFailed();
      }
    }
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete, enabled) {
    let self = this;

    this.onStart(this);

    if (!this.isExecutable() || this.markedPending || enabled === false) {
      complete(enabled);
      return;
    }

    let fns = this.beforeAndAfterFns();
    let allFns = fns.befores.concat(this.queueableFn).concat(fns.afters);

    this.queueRunnerFactory({
      queueableFns: allFns,
      onException: function() { self.onException.apply(self, arguments); },
      onComplete: complete,
      userContext: this.userContext()
    });

    function complete(enabledAgain) {
      self.result.status = self.status(enabledAgain);
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }
  };

  Spec.prototype.onException = function onException(e) {
    if (Spec.isPendingSpecException(e)) {
      this.pend(extractCustomPendingMessage(e));
      return;
    }

    if (e instanceof j$.errors.ExpectationFailed) {
      return;
    }

    this.addExpectationResult(false, {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: e
    }, true);
  };

  Spec.prototype.disable = function() {
    this.disabled = true;
  };

  Spec.prototype.pend = function(message) {
    this.markedPending = true;
    if (message) {
      this.result.pendingReason = message;
    }
  };

  Spec.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Spec.prototype.status = function(enabled) {
    if (this.disabled || enabled === false) {
      return 'disabled';
    }

    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  };

  Spec.prototype.isExecutable = function() {
    return !this.disabled;
  };

  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  let extractCustomPendingMessage = function (e) {
    let fullMessage = e.toString(),
        boilerplateStart = fullMessage.indexOf(Spec.pendingSpecExceptionMessage),
        boilerplateEnd = boilerplateStart + Spec.pendingSpecExceptionMessage.length;

    return fullMessage.substr(boilerplateEnd);
  };

  Spec.pendingSpecExceptionMessage = '=> marked Pending';

  Spec.isPendingSpecException = function(e) {
    return !!(e && e.toString && e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1);
  };

  return Spec;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Spec = jasmineRequire.Spec;
}

/*jshint bitwise: false*/

getJasmineRequireObj().Order = function() {
  function Order(options) {
    this.random = 'random' in options ? options.random : true;
    let seed = this.seed = options.seed || generateSeed();
    this.sort = this.random ? randomOrder : naturalOrder;

    function naturalOrder(items) {
      return items;
    }

    function randomOrder(items) {
      let copy = items.slice();
      copy.sort(function(a, b) {
        return jenkinsHash(seed + a.id) - jenkinsHash(seed + b.id);
      });
      return copy;
    }

    function generateSeed() {
      return String(Math.random()).slice(-5);
    }

    // Bob Jenkins One-at-a-Time Hash algorithm is a non-cryptographic hash function
    // used to get a different output when the key changes slighly.
    // We use your return to sort the children randomly in a consistent way when
    // used in conjunction with a seed

    function jenkinsHash(key) {
      let hash, i;
      for(hash = i = 0; i < key.length; ++i) {
        hash += key.charCodeAt(i);
        hash += (hash << 10);
        hash ^= (hash >> 6);
      }
      hash += (hash << 3);
      hash ^= (hash >> 11);
      hash += (hash << 15);
      return hash;
    }

  }

  return Order;
};

getJasmineRequireObj().Env = function(j$) {
  function Env(options) {
    options = options || {};

    let self = this;
    let global = options.global || j$.getGlobal();

    let totalSpecsDefined = 0;

    let catchExceptions = true;

    let realSetTimeout = j$.getGlobal().setTimeout;
    let realClearTimeout = j$.getGlobal().clearTimeout;
    this.clock = new j$.Clock(global, function () { return new j$.DelayedFunctionScheduler(); }, new j$.MockDate(global));

    let runnableResources = {};

    let currentSpec = null;
    let currentlyExecutingSuites = [];
    let currentDeclarationSuite = null;
    let throwOnExpectationFailure = false;
    let random = false;
    let seed = null;

    let currentSuite = function () {
        return currentlyExecutingSuites[currentlyExecutingSuites.length - 1];
    };

    let currentRunnable = function () {
        return currentSpec || currentSuite();
    };

    let reporter = new j$.ReportDispatcher([
        'jasmineStarted',
        'jasmineDone',
        'suiteStarted',
        'suiteDone',
        'specStarted',
        'specDone'
    ]);

    this.specFilter = function() {
      return true;
    };

    this.addCustomEqualityTester = function(tester) {
      if(!currentRunnable()) {
        throw new Error('Custom Equalities must be added in a before function or a spec');
      }
      runnableResources[currentRunnable().id].customEqualityTesters.push(tester);
    };

    this.addMatchers = function(matchersToAdd) {
      if(!currentRunnable()) {
        throw new Error('Matchers must be added in a before function or a spec');
      }
      let customMatchers = runnableResources[currentRunnable().id].customMatchers;
      for (let matcherName in matchersToAdd) {
        customMatchers[matcherName] = matchersToAdd[matcherName];
      }
    };

    j$.Expectation.addCoreMatchers(j$.matchers);

    let nextSpecId = 0;
    let getNextSpecId = function () {
        return 'spec' + nextSpecId++;
    };

    let nextSuiteId = 0;
    let getNextSuiteId = function () {
        return 'suite' + nextSuiteId++;
    };

    let expectationFactory = function (actual, spec) {
        return j$.Expectation.Factory({
        util: j$.matchersUtil,
        customEqualityTesters: runnableResources[spec.id].customEqualityTesters,
        customMatchers: runnableResources[spec.id].customMatchers,
        actual: actual,
        addExpectationResult: addExpectationResult
        });

        function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
        }
    };

    let defaultResourcesForRunnable = function (id, parentRunnableId) {
        let resources = {spies: [], customEqualityTesters: [], customMatchers: {}};

        if (runnableResources[parentRunnableId]) {
        resources.customEqualityTesters = j$.util.clone(runnableResources[parentRunnableId].customEqualityTesters);
        resources.customMatchers = j$.util.clone(runnableResources[parentRunnableId].customMatchers);
        }

        runnableResources[id] = resources;
    };

    let clearResourcesForRunnable = function (id) {
        spyRegistry.clearSpies();
        delete runnableResources[id];
    };

    let beforeAndAfterFns = function (suite) {
        return function () {
        let befores = [],
            afters = [];

        while (suite) {
            befores = befores.concat(suite.beforeFns);
            afters = afters.concat(suite.afterFns);

            suite = suite.parentSuite;
        }

        return {
            befores: befores.reverse(),
            afters: afters
        };
        };
    };

    let getSpecName = function (spec, suite) {
        let fullName = [spec.description],
            suiteFullName = suite.getFullName();

        if (suiteFullName !== '') {
        fullName.unshift(suiteFullName);
        }
        return fullName.join(' ');
    };

    // TODO: we may just be able to pass in the fn instead of wrapping here
    let buildExpectationResult = j$.buildExpectationResult,
        exceptionFormatter = new j$.ExceptionFormatter(),
        expectationResultFactory = function (attrs) {
            attrs.messageFormatter = exceptionFormatter.message;
            attrs.stackFormatter = exceptionFormatter.stack;

            return buildExpectationResult(attrs);
        };

    // TODO: fix this naming, and here's where the value comes in
    this.catchExceptions = function(value) {
      catchExceptions = !!value;
      return catchExceptions;
    };

    this.catchingExceptions = function() {
      return catchExceptions;
    };

    let maximumSpecCallbackDepth = 20;
    let currentSpecCallbackDepth = 0;

    function clearStack(fn) {
      currentSpecCallbackDepth++;
      if (currentSpecCallbackDepth >= maximumSpecCallbackDepth) {
        currentSpecCallbackDepth = 0;
        realSetTimeout(fn, 0);
      } else {
        fn();
      }
    }

    let catchException = function (e) {
        return j$.Spec.isPendingSpecException(e) || catchExceptions;
    };

    this.throwOnExpectationFailure = function(value) {
      throwOnExpectationFailure = !!value;
    };

    this.throwingExpectationFailures = function() {
      return throwOnExpectationFailure;
    };

    this.randomizeTests = function(value) {
      random = !!value;
    };

    this.randomTests = function() {
      return random;
    };

    this.seed = function(value) {
      if (value) {
        seed = value;
      }
      return seed;
    };

    let queueRunnerFactory = function (options) {
        options.catchException = catchException;
        options.clearStack = options.clearStack || clearStack;
        options.timeout = {setTimeout: realSetTimeout, clearTimeout: realClearTimeout};
        options.fail = self.fail;

        new j$.QueueRunner(options).execute();
    };

    let topSuite = new j$.Suite({
        env: this,
        id: getNextSuiteId(),
        description: 'Jasmine__TopLevel__Suite',
        expectationFactory: expectationFactory,
        expectationResultFactory: expectationResultFactory
    });
    defaultResourcesForRunnable(topSuite.id);
    currentDeclarationSuite = topSuite;

    this.topSuite = function() {
      return topSuite;
    };

    this.execute = function(runnablesToRun) {
      if(!runnablesToRun) {
        if (focusedRunnables.length) {
          runnablesToRun = focusedRunnables;
        } else {
          runnablesToRun = [topSuite.id];
        }
      }

      let order = new j$.Order({
          random: random,
          seed: seed
      });

      let processor = new j$.TreeProcessor({
          tree: topSuite,
          runnableIds: runnablesToRun,
          queueRunnerFactory: queueRunnerFactory,
          nodeStart: function (suite) {
              currentlyExecutingSuites.push(suite);
              defaultResourcesForRunnable(suite.id, suite.parentSuite.id);
              reporter.suiteStarted(suite.result);
          },
          nodeComplete: function (suite, result) {
              if (!suite.disabled) {
            clearResourcesForRunnable(suite.id);
              }
              currentlyExecutingSuites.pop();
              reporter.suiteDone(result);
          },
          orderChildren: function (node) {
              return order.sort(node.children);
          }
      });

      if(!processor.processTree().valid) {
        throw new Error('Invalid order: would cause a beforeAll or afterAll to be run multiple times');
      }

      reporter.jasmineStarted({
        totalSpecsDefined: totalSpecsDefined
      });

      currentlyExecutingSuites.push(topSuite);

      processor.execute(function() {
        clearResourcesForRunnable(topSuite.id);
        currentlyExecutingSuites.pop();

        reporter.jasmineDone({
          order: order,
          failedExpectations: topSuite.result.failedExpectations
        });
      });
    };

    this.addReporter = function(reporterToAdd) {
      reporter.addReporter(reporterToAdd);
    };

    this.provideFallbackReporter = function(reporterToAdd) {
      reporter.provideFallbackReporter(reporterToAdd);
    };

    this.clearReporters = function() {
      reporter.clearReporters();
    };

    let spyRegistry = new j$.SpyRegistry({
        currentSpies: function () {
            if (!currentRunnable()) {
                throw new Error('Spies must be created in a before function or a spec');
            }
            return runnableResources[currentRunnable().id].spies;
    }
    });

    this.allowRespy = function(allow){
      spyRegistry.allowRespy(allow);
    };

    this.spyOn = function() {
      return spyRegistry.spyOn.apply(spyRegistry, arguments);
    };

    let suiteFactory = function (description) {
        //noinspection UnnecessaryLocalVariableJS
        let suite = new j$.Suite({
            env: self,
            id: getNextSuiteId(),
            description: description,
            parentSuite: currentDeclarationSuite,
            expectationFactory: expectationFactory,
            expectationResultFactory: expectationResultFactory,
            throwOnExpectationFailure: throwOnExpectationFailure
        });

        return suite;
    };

    this.describe = function(description, specDefinitions) {
      let suite = suiteFactory(description);
      if (specDefinitions.length > 0) {
        throw new Error('describe does not expect any arguments');
      }
      if (currentDeclarationSuite.markedPending) {
        suite.pend();
      }
      addSpecsToSuite(suite, specDefinitions);
      return suite;
    };

    this.xdescribe = function(description, specDefinitions) {
      let suite = suiteFactory(description);
      suite.pend();
      addSpecsToSuite(suite, specDefinitions);
      return suite;
    };

    let focusedRunnables = [];

    this.fdescribe = function(description, specDefinitions) {
      let suite = suiteFactory(description);
      suite.isFocused = true;

      focusedRunnables.push(suite.id);
      unfocusAncestor();
      addSpecsToSuite(suite, specDefinitions);

      return suite;
    };

    function addSpecsToSuite(suite, specDefinitions) {
      let parentSuite = currentDeclarationSuite;
      parentSuite.addChild(suite);
      currentDeclarationSuite = suite;

      let declarationError = null;
      try {
        specDefinitions.call(suite);
      } catch (e) {
        declarationError = e;
      }

      if (declarationError) {
        self.it('encountered a declaration exception', function() {
          throw declarationError;
        });
      }

      currentDeclarationSuite = parentSuite;
    }

    function findFocusedAncestor(suite) {
      while (suite) {
        if (suite.isFocused) {
          return suite.id;
        }
        suite = suite.parentSuite;
      }

      return null;
    }

    function unfocusAncestor() {
      let focusedAncestor = findFocusedAncestor(currentDeclarationSuite);
      if (focusedAncestor) {
        for (let i = 0; i < focusedRunnables.length; i++) {
          if (focusedRunnables[i] === focusedAncestor) {
            focusedRunnables.splice(i, 1);
            break;
          }
        }
      }
    }

    let specFactory = function (description, fn, suite, timeout) {
        totalSpecsDefined++;
        let spec = new j$.Spec({
            id: getNextSpecId(),
            beforeAndAfterFns: beforeAndAfterFns(suite),
            expectationFactory: expectationFactory,
            resultCallback: specResultCallback,
            getSpecName: function (spec) {
                return getSpecName(spec, suite);
            },
            onStart: specStarted,
            description: description,
            expectationResultFactory: expectationResultFactory,
            queueRunnerFactory: queueRunnerFactory,
            userContext: function () {
                return suite.clonedSharedUserContext();
            },
            queueableFn: {
                fn: fn,
                timeout: function () {
                    return timeout || j$.DEFAULT_TIMEOUT_INTERVAL;
                }
            },
            throwOnExpectationFailure: throwOnExpectationFailure
        });

        if (!self.specFilter(spec)) {
        spec.disable();
        }

        return spec;

        function specResultCallback(result) {
        clearResourcesForRunnable(spec.id);
        currentSpec = null;
        reporter.specDone(result);
        }

        function specStarted(spec) {
        currentSpec = spec;
        defaultResourcesForRunnable(spec.id, suite.id);
        reporter.specStarted(spec.result);
        }
    };

    this.it = function(description, fn, timeout) {
      let spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      if (currentDeclarationSuite.markedPending) {
        spec.pend();
      }
      currentDeclarationSuite.addChild(spec);
      return spec;
    };

    this.xit = function() {
      let spec = this.it.apply(this, arguments);
      spec.pend('Temporarily disabled with xit');
      return spec;
    };

    this.fit = function(description, fn, timeout){
      let spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      currentDeclarationSuite.addChild(spec);
      focusedRunnables.push(spec.id);
      unfocusAncestor();
      return spec;
    };

    this.expect = function(actual) {
      if (!currentRunnable()) {
        throw new Error('\'expect\' was used when there was no current spec, this could be because an asynchronous test timed out');
      }

      return currentRunnable().expect(actual);
    };

    this.beforeEach = function(beforeEachFunction, timeout) {
      currentDeclarationSuite.beforeEach({
        fn: beforeEachFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.beforeAll = function(beforeAllFunction, timeout) {
      currentDeclarationSuite.beforeAll({
        fn: beforeAllFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.afterEach = function(afterEachFunction, timeout) {
      currentDeclarationSuite.afterEach({
        fn: afterEachFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.afterAll = function(afterAllFunction, timeout) {
      currentDeclarationSuite.afterAll({
        fn: afterAllFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.pending = function(message) {
      let fullMessage = j$.Spec.pendingSpecExceptionMessage;
      if(message) {
        fullMessage += message;
      }
      throw fullMessage;
    };

    this.fail = function(error) {
      let message = 'Failed';
      if (error) {
        message += ': ';
        message += error.message || error;
      }

      currentRunnable().addExpectationResult(false, {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        message: message,
        error: error && error.message ? error : null
      });
    };
  }

  return Env;
};

getJasmineRequireObj().JsApiReporter = function() {

  let noopTimer = {
    start: function () {
    },
    elapsed: function () {
        return 0;
    }
  };

  function JsApiReporter(options) {
    let timer = options.timer || noopTimer,
        status = 'loaded';

    this.started = false;
    this.finished = false;
    this.runDetails = {};

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
      timer.start();
    };

    let executionTime;

    this.jasmineDone = function(runDetails) {
      this.finished = true;
      this.runDetails = runDetails;
      executionTime = timer.elapsed();
      status = 'done';
    };

    this.status = function() {
      return status;
    };

    let suites = [],
        suites_hash = {};

    this.suiteStarted = function(result) {
      suites_hash[result.id] = result;
    };

    this.suiteDone = function(result) {
      storeSuite(result);
    };

    this.suiteResults = function(index, length) {
      return suites.slice(index, index + length);
    };

    function storeSuite(result) {
      suites.push(result);
      suites_hash[result.id] = result;
    }

    this.suites = function() {
      return suites_hash;
    };

    let specs = [];

    this.specDone = function(result) {
      specs.push(result);
    };

    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    this.specs = function() {
      return specs;
    };

    this.executionTime = function() {
      return executionTime;
    };

  }

  return JsApiReporter;
};

getJasmineRequireObj().CallTracker = function(j$) {

  function CallTracker() {
    let calls = [];
    let opts = {};

    function argCloner(context) {
      let clonedArgs = [];
      let argsAsArray = j$.util.argsToArray(context.args);
      for(let i = 0; i < argsAsArray.length; i++) {
        if(Object.prototype.toString.apply(argsAsArray[i]).match(/^\[object/)) {
          clonedArgs.push(j$.util.clone(argsAsArray[i]));
        } else {
          clonedArgs.push(argsAsArray[i]);
        }
      }
      context.args = clonedArgs;
    }

    this.track = function(context) {
      if(opts.cloneArgs) {
        argCloner(context);
      }
      calls.push(context);
    };

    this.any = function() {
      return !!calls.length;
    };

    this.count = function() {
      return calls.length;
    };

    this.argsFor = function(index) {
      let call = calls[index];
      return call ? call.args : [];
    };

    this.all = function() {
      return calls;
    };

    this.allArgs = function() {
      let callArgs = [];
      for(let i = 0; i < calls.length; i++){
        callArgs.push(calls[i].args);
      }

      return callArgs;
    };

    this.first = function() {
      return calls[0];
    };

    this.mostRecent = function() {
      return calls[calls.length - 1];
    };

    this.reset = function() {
      calls = [];
    };

    this.saveArgumentsByValue = function() {
      opts.cloneArgs = true;
    };

  }

  return CallTracker;
};

getJasmineRequireObj().Clock = function() {
  function Clock(global, delayedFunctionSchedulerFactory, mockDate) {
    let self = this,
        realTimingFunctions = {
          setTimeout: global.setTimeout,
          clearTimeout: global.clearTimeout,
          setInterval: global.setInterval,
          clearInterval: global.clearInterval
        },
        fakeTimingFunctions = {
          setTimeout: setTimeout,
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval
        },
        installed = false;
      let delayedFunctionScheduler,
          timer;


    self.install = function() {
      if(!originalTimingFunctionsIntact()) {
        throw new Error('Jasmine Clock was unable to install over custom global timer functions. Is the clock already installed?');
      }
      replace(global, fakeTimingFunctions);
      timer = fakeTimingFunctions;
      delayedFunctionScheduler = delayedFunctionSchedulerFactory();
      installed = true;

      return self;
    };

    self.uninstall = function() {
      delayedFunctionScheduler = null;
      mockDate.uninstall();
      replace(global, realTimingFunctions);

      timer = realTimingFunctions;
      installed = false;
    };

    self.withMock = function(closure) {
      this.install();
      try {
        closure();
      } finally {
        this.uninstall();
      }
    };

    self.mockDate = function(initialDate) {
      mockDate.install(initialDate);
    };

    self.setTimeout = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error('IE < 9 cannot support extra params to setTimeout without a polyfill');
        }
        return timer.setTimeout(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setTimeout, [global, arguments]);
    };

    self.setInterval = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error('IE < 9 cannot support extra params to setInterval without a polyfill');
        }
        return timer.setInterval(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setInterval, [global, arguments]);
    };

    self.clearTimeout = function(id) {
      return Function.prototype.call.apply(timer.clearTimeout, [global, id]);
    };

    self.clearInterval = function(id) {
      return Function.prototype.call.apply(timer.clearInterval, [global, id]);
    };

    self.tick = function(millis) {
      if (installed) {
        delayedFunctionScheduler.tick(millis, function(millis) { mockDate.tick(millis); });
      } else {
        throw new Error('Mock clock is not installed, use jasmine.clock().install()');
      }
    };

    return self;

    function originalTimingFunctionsIntact() {
      return global.setTimeout === realTimingFunctions.setTimeout &&
        global.clearTimeout === realTimingFunctions.clearTimeout &&
        global.setInterval === realTimingFunctions.setInterval &&
        global.clearInterval === realTimingFunctions.clearInterval;
    }

    function legacyIE() {
      //if these methods are polyfilled, apply will be present
      return !(realTimingFunctions.setTimeout || realTimingFunctions.setInterval).apply;
    }

    function replace(dest, source) {
      for (let prop in source) {
        dest[prop] = source[prop];
      }
    }

    function setTimeout(fn, delay) {
      return delayedFunctionScheduler.scheduleFunction(fn, delay, argSlice(arguments, 2));
    }

    function clearTimeout(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function setInterval(fn, interval) {
      return delayedFunctionScheduler.scheduleFunction(fn, interval, argSlice(arguments, 2), true);
    }

    function clearInterval(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function argSlice(argsObj, n) {
      return Array.prototype.slice.call(argsObj, n);
    }
  }

  return Clock;
};

getJasmineRequireObj().DelayedFunctionScheduler = function() {
  function DelayedFunctionScheduler() {
    let self = this;
    let scheduledLookup = [];
    let scheduledFunctions = {};
    let currentTime = 0;
    let delayedFnCount = 0;

    self.tick = function(millis, tickDate) {
      millis = millis || 0;
      let endTime = currentTime + millis;

      runScheduledFunctions(endTime, tickDate);
      currentTime = endTime;
    };

    self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
      let f;
      if (typeof(funcToCall) === 'string') {
        /* jshint evil: true */
        f = function() { return eval(funcToCall); };
        /* jshint evil: false */
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || (currentTime + millis);

      let funcToSchedule = {
          runAtMillis: runAtMillis,
          funcToCall: f,
          recurring: recurring,
          params: params,
          timeoutKey: timeoutKey,
          millis: millis
      };

      if (runAtMillis in scheduledFunctions) {
        scheduledFunctions[runAtMillis].push(funcToSchedule);
      } else {
        scheduledFunctions[runAtMillis] = [funcToSchedule];
        scheduledLookup.push(runAtMillis);
        scheduledLookup.sort(function (a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };

    self.removeFunctionWithId = function(timeoutKey) {
      for (let runAtMillis in scheduledFunctions) {
        let funcs = scheduledFunctions[runAtMillis];
        let i = indexOfFirstToPass(funcs, function (func) {
            return func.timeoutKey === timeoutKey;
        });

        if (i > -1) {
          if (funcs.length === 1) {
            delete scheduledFunctions[runAtMillis];
            deleteFromLookup(runAtMillis);
          } else {
            funcs.splice(i, 1);
          }

          // intervals get rescheduled when executed, so there's never more
          // than a single scheduled function with a given timeoutKey
          break;
        }
      }
    };

    return self;

    function indexOfFirstToPass(array, testFn) {
      let index = -1;

      for (let i = 0; i < array.length; ++i) {
        if (testFn(array[i])) {
          index = i;
          break;
        }
      }

      return index;
    }

    function deleteFromLookup(key) {
      let value = Number(key);
      let i = indexOfFirstToPass(scheduledLookup, function (millis) {
          return millis === value;
      });

      if (i > -1) {
        scheduledLookup.splice(i, 1);
      }
    }

    function reschedule(scheduledFn) {
      self.scheduleFunction(scheduledFn.funcToCall,
        scheduledFn.millis,
        scheduledFn.params,
        true,
        scheduledFn.timeoutKey,
        scheduledFn.runAtMillis + scheduledFn.millis);
    }

    function forEachFunction(funcsToRun, callback) {
      for (let i = 0; i < funcsToRun.length; ++i) {
        callback(funcsToRun[i]);
      }
    }

    function runScheduledFunctions(endTime, tickDate) {
      tickDate = tickDate || function() {};
      if (scheduledLookup.length === 0 || scheduledLookup[0] > endTime) {
        tickDate(endTime - currentTime);
        return;
      }

      do {
        let newCurrentTime = scheduledLookup.shift();
        tickDate(newCurrentTime - currentTime);

        currentTime = newCurrentTime;

        let funcsToRun = scheduledFunctions[currentTime];
        delete scheduledFunctions[currentTime];

        forEachFunction(funcsToRun, function(funcToRun) {
          if (funcToRun.recurring) {
            reschedule(funcToRun);
          }
        });

        forEachFunction(funcsToRun, function(funcToRun) {
          funcToRun.funcToCall.apply(null, funcToRun.params || []);
        });
      } while (scheduledLookup.length > 0 &&
              // checking first if we're out of time prevents setTimeout(0)
              // scheduled in a funcToRun from forcing an extra iteration
                 currentTime !== endTime  &&
                 scheduledLookup[0] <= endTime);

      // ran out of functions to call, but still time left on the clock
      if (currentTime !== endTime) {
        tickDate(endTime - currentTime);
      }
    }
  }

  return DelayedFunctionScheduler;
};

getJasmineRequireObj().ExceptionFormatter = function() {
  function ExceptionFormatter() {
    this.message = function(error) {
      let message = '';

      if (error.name && error.message) {
        message += error.name + ': ' + error.message;
      } else {
        message += error.toString() + ' thrown';
      }

      if (error.fileName || error.sourceURL) {
        message += ' in ' + (error.fileName || error.sourceURL);
      }

      if (error.line || error.lineNumber) {
        message += ' (line ' + (error.line || error.lineNumber) + ')';
      }

      return message;
    };

    this.stack = function(error) {
      return error ? error.stack : null;
    };
  }

  return ExceptionFormatter;
};

getJasmineRequireObj().Expectation = function() {

  function Expectation(options) {
    this.util = options.util || { buildFailureMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.isNot = options.isNot;

    let customMatchers = options.customMatchers || {};
    for (let matcherName in customMatchers) {
      this[matcherName] = Expectation.prototype.wrapCompare(matcherName, customMatchers[matcherName]);
    }
  }

  Expectation.prototype.wrapCompare = function(name, matcherFactory) {
    return function() {
      let args = Array.prototype.slice.call(arguments, 0);
        let expected = args.slice(0),
            message = '';

      args.unshift(this.actual);

      let matcher = matcherFactory(this.util, this.customEqualityTesters);
        let matcherCompare = matcher.compare;

      function defaultNegativeCompare() {
        let result = matcher.compare.apply(null, args);
        result.pass = !result.pass;
        return result;
      }

      if (this.isNot) {
        matcherCompare = matcher.negativeCompare || defaultNegativeCompare;
      }

      let result = matcherCompare.apply(null, args);

      if (!result.pass) {
        if (!result.message) {
          args.unshift(this.isNot);
          args.unshift(name);
          message = this.util.buildFailureMessage.apply(null, args);
        } else {
          if (Object.prototype.toString.apply(result.message) === '[object Function]') {
            message = result.message();
          } else {
            message = result.message;
          }
        }
      }

      if (expected.length == 1) {
        expected = expected[0];
      }

      // TODO: how many of these params are needed?
      this.addExpectationResult(
        result.pass,
        {
          matcherName: name,
          passed: result.pass,
          message: message,
          actual: this.actual,
          expected: expected // TODO: this may need to be arrayified/sliced
        }
      );
    };
  };

  Expectation.addCoreMatchers = function(matchers) {
    let prototype = Expectation.prototype;
    for (let matcherName in matchers) {
      let matcher = matchers[matcherName];
      prototype[matcherName] = prototype.wrapCompare(matcherName, matcher);
    }
  };

  Expectation.Factory = function(options) {
    options = options || {};

    let expect = new Expectation(options);

    // TODO: this would be nice as its own Object - NegativeExpectation
    // TODO: copy instead of mutate options
    options.isNot = true;
    expect.not = new Expectation(options);

    return expect;
  };

  return Expectation;
};

//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function() {
  function buildExpectationResult(options) {
    let messageFormatter = options.messageFormatter || function () {
            },
        stackFormatter = options.stackFormatter || function () {
            };

    let result = {
        matcherName: options.matcherName,
        message: message(),
        stack: stack(),
        passed: options.passed
    };

    if(!result.passed) {
      result.expected = options.expected;
      result.actual = options.actual;
    }

    return result;

    function message() {
      if (options.passed) {
        return 'Passed.';
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return messageFormatter(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return '';
      }

      let error = options.error;
      if (!error) {
        try {
          throw new Error(message());
        } catch (e) {
          error = e;
        }
      }
      return stackFormatter(error);
    }
  }

  return buildExpectationResult;
};

getJasmineRequireObj().MockDate = function() {
  function MockDate(global) {
    let self = this;
    let currentTime = 0;

    if (!global || !global.Date) {
      self.install = function() {};
      self.tick = function() {};
      self.uninstall = function() {};
      return self;
    }

    let GlobalDate = global.Date;

    self.install = function(mockDate) {
      if (mockDate instanceof GlobalDate) {
        currentTime = mockDate.getTime();
      } else {
        currentTime = new GlobalDate().getTime();
      }

      global.Date = FakeDate;
    };

    self.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
    };

    self.uninstall = function() {
      currentTime = 0;
      global.Date = GlobalDate;
    };

    createDateProperties();

    return self;

    function FakeDate() {
      switch(arguments.length) {
        case 0:
          return new GlobalDate(currentTime);
        case 1:
          return new GlobalDate(arguments[0]);
        case 2:
          return new GlobalDate(arguments[0], arguments[1]);
        case 3:
          return new GlobalDate(arguments[0], arguments[1], arguments[2]);
        case 4:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3]);
        case 5:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4]);
        case 6:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4], arguments[5]);
        default:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4], arguments[5], arguments[6]);
      }
    }

    function createDateProperties() {
      FakeDate.prototype = GlobalDate.prototype;

      FakeDate.now = function() {
        if (GlobalDate.now) {
          return currentTime;
        } else {
          throw new Error('Browser does not support Date.now()');
        }
      };

      FakeDate.toSource = GlobalDate.toSource;
      FakeDate.toString = GlobalDate.toString;
      FakeDate.parse = GlobalDate.parse;
      FakeDate.UTC = GlobalDate.UTC;
    }
	}

  return MockDate;
};

getJasmineRequireObj().pp = function(j$) {

  function PrettyPrinter() {
    this.ppNestLevel_ = 0;
    this.seen = [];
  }

  PrettyPrinter.prototype.format = function(value) {
    this.ppNestLevel_++;
    try {
      if (j$.util.isUndefined(value)) {
        this.emitScalar('undefined');
      } else if (value === null) {
        this.emitScalar('null');
      } else if (value === 0 && 1/value === -Infinity) {
        this.emitScalar('-0');
      } else if (value === j$.getGlobal()) {
        this.emitScalar('<global>');
      } else if (value.jasmineToString) {
        this.emitScalar(value.jasmineToString());
      } else if (typeof value === 'string') {
        this.emitString(value);
      } else if (j$.isSpy(value)) {
        this.emitScalar('spy on ' + value.and.identity());
      } else if (value instanceof RegExp) {
        this.emitScalar(value.toString());
      } else if (typeof value === 'function') {
        this.emitScalar('Function');
      } else if (typeof value.nodeType === 'number') {
        this.emitScalar('HTMLNode');
      } else if (value instanceof Date) {
        this.emitScalar('Date(' + value + ')');
      } else if (value.toString && typeof value === 'object' && !(value instanceof Array) && value.toString !== Object.prototype.toString) {
        this.emitScalar(value.toString());
      } else if (j$.util.arrayContains(this.seen, value)) {
        this.emitScalar('<circular reference: ' + (j$.isArray_(value) ? 'Array' : 'Object') + '>');
      } else if (j$.isArray_(value) || j$.isA_('Object', value)) {
        this.seen.push(value);
        if (j$.isArray_(value)) {
          this.emitArray(value);
        } else {
          this.emitObject(value);
        }
        this.seen.pop();
      } else {
        this.emitScalar(value.toString());
      }
    } finally {
      this.ppNestLevel_--;
    }
  };

  PrettyPrinter.prototype.iterateObject = function(obj, fn) {
    for (let property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) { continue; }
      fn(property, obj.__lookupGetter__ ? (!j$.util.isUndefined(obj.__lookupGetter__(property)) &&
          obj.__lookupGetter__(property) !== null) : false);
    }
  };

  PrettyPrinter.prototype.emitArray = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitObject = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitScalar = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitString = j$.unimplementedMethod_;

  function StringPrettyPrinter() {
    PrettyPrinter.call(this);

    this.string = '';
  }

  j$.util.inherit(StringPrettyPrinter, PrettyPrinter);

  StringPrettyPrinter.prototype.emitScalar = function(value) {
    this.append(value);
  };

  StringPrettyPrinter.prototype.emitString = function(value) {
    this.append('\'' + value + '\'');
  };

  StringPrettyPrinter.prototype.emitArray = function(array) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Array');
      return;
    }
    let length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    this.append('[ ');
    for (let i = 0; i < length; i++) {
      if (i > 0) {
        this.append(', ');
      }
      this.format(array[i]);
    }
    if(array.length > length){
      this.append(', ...');
    }

    let self = this;
    let first = array.length === 0;
    this.iterateObject(array, function(property, isGetter) {
      if (property.match(/^\d+$/)) {
        return;
      }

      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.formatProperty(array, property, isGetter);
    });

    this.append(' ]');
  };

  StringPrettyPrinter.prototype.emitObject = function(obj) {
    let constructorName = obj.constructor ? j$.fnNameFor(obj.constructor) : 'null';
    this.append(constructorName);

    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      return;
    }

    let self = this;
    this.append('({ ');
    let first = true;

    this.iterateObject(obj, function(property, isGetter) {
      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.formatProperty(obj, property, isGetter);
    });

    this.append(' })');
  };

  StringPrettyPrinter.prototype.formatProperty = function(obj, property, isGetter) {
      this.append(property);
      this.append(': ');
      if (isGetter) {
        this.append('<getter>');
      } else {
        this.format(obj[property]);
      }
  };

  StringPrettyPrinter.prototype.append = function(value) {
    this.string += value;
  };

  return function(value) {
    let stringPrettyPrinter = new StringPrettyPrinter();
    stringPrettyPrinter.format(value);
    return stringPrettyPrinter.string;
  };
};

getJasmineRequireObj().QueueRunner = function(j$) {

  function once(fn) {
    let called = false;
    return function() {
      if (!called) {
        called = true;
        fn();
      }
      return null;
    };
  }

  function QueueRunner(attrs) {
    this.queueableFns = attrs.queueableFns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    this.userContext = attrs.userContext || {};
    this.timeout = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
    this.fail = attrs.fail || function() {};
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.queueableFns, 0);
  };

  QueueRunner.prototype.run = function(queueableFns, recursiveIndex) {
    let length = queueableFns.length,
        self = this;
      let iterativeIndex;


    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      let queueableFn = queueableFns[iterativeIndex];
      if (queueableFn.fn.length > 0) {
        attemptAsync(queueableFn);
        return;
      } else {
        attemptSync(queueableFn);
      }
    }

    let runnerDone = iterativeIndex >= length;

    if (runnerDone) {
      this.clearStack(this.onComplete);
    }

    function attemptSync(queueableFn) {
      try {
        queueableFn.fn.call(self.userContext);
      } catch (e) {
        handleException(e, queueableFn);
      }
    }

    function attemptAsync(queueableFn) {
      let clearTimeout = function () {
              Function.prototype.apply.apply(self.timeout.clearTimeout, [j$.getGlobal(), [timeoutId]]);
          },
          next = once(function () {
              clearTimeout(timeoutId);
              self.run(queueableFns, iterativeIndex + 1);
          });
        let timeoutId;

      next.fail = function() {
        self.fail.apply(null, arguments);
        next();
      };

      if (queueableFn.timeout) {
        timeoutId = Function.prototype.apply.apply(self.timeout.setTimeout, [j$.getGlobal(), [function() {
          let error = new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.');
          onException(error);
          next();
        }, queueableFn.timeout()]]);
      }

      try {
        queueableFn.fn.call(self.userContext, next);
      } catch (e) {
        handleException(e, queueableFn);
        next();
      }
    }

    function onException(e) {
      self.onException(e);
    }

    function handleException(e, queueableFn) {
      onException(e);
      if (!self.catchException(e)) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  };

  return QueueRunner;
};

getJasmineRequireObj().ReportDispatcher = function() {
  function ReportDispatcher(methods) {

    let dispatchedMethods = methods || [];

    for (let i = 0; i < dispatchedMethods.length; i++) {
      let method = dispatchedMethods[i];
      this[method] = (function(m) {
        return function() {
          dispatch(m, arguments);
        };
      }(method));
    }

    let reporters = [];
    let fallbackReporter = null;

    this.addReporter = function(reporter) {
      reporters.push(reporter);
    };

    this.provideFallbackReporter = function(reporter) {
      fallbackReporter = reporter;
    };

    this.clearReporters = function() {
      reporters = [];
    };

    return this;

    function dispatch(method, args) {
      if (reporters.length === 0 && fallbackReporter !== null) {
          reporters.push(fallbackReporter);
      }
      for (let i = 0; i < reporters.length; i++) {
        let reporter = reporters[i];
        if (reporter[method]) {
          reporter[method].apply(reporter, args);
        }
      }
    }
  }

  return ReportDispatcher;
};


getJasmineRequireObj().SpyRegistry = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<spyOn>', 'spyOn(<object>, <methodName>)');

  function SpyRegistry(options) {
    options = options || {};
    let currentSpies = options.currentSpies || function () {
            return [];
        };

    this.allowRespy = function(allow){
      this.respy = allow;
    };

    this.spyOn = function(obj, methodName) {

      if (j$.util.isUndefined(obj)) {
        throw new Error(getErrorMsg('could not find an object to spy upon for ' + methodName + '()'));
      }

      if (j$.util.isUndefined(methodName)) {
        throw new Error(getErrorMsg('No method name supplied'));
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(getErrorMsg(methodName + '() method does not exist'));
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])  ) {
        if ( !!this.respy ){
          return obj[methodName];
        }else {
          throw new Error(getErrorMsg(methodName + ' has already been spied upon'));
        }
      }

      let descriptor;
      try {
        descriptor = Object.getOwnPropertyDescriptor(obj, methodName);
      } catch(e) {
        // IE 8 doesn't support `definePropery` on non-DOM nodes
      }

      if (descriptor && !(descriptor.writable || descriptor.set)) {
        throw new Error(getErrorMsg(methodName + ' is not declared writable or has no setter'));
      }

      let originalMethod = obj[methodName],
          spiedMethod = j$.createSpy(methodName, originalMethod);
        let restoreStrategy;

      if (Object.prototype.hasOwnProperty.call(obj, methodName)) {
        restoreStrategy = function() {
          obj[methodName] = originalMethod;
        };
      } else {
        restoreStrategy = function() {
          if (!delete obj[methodName]) {
            obj[methodName] = originalMethod;
          }
        };
      }

      currentSpies().push({
        restoreObjectToOriginalState: restoreStrategy
      });

      obj[methodName] = spiedMethod;

      return spiedMethod;
    };

    this.clearSpies = function() {
      let spies = currentSpies();
      for (let i = spies.length - 1; i >= 0; i--) {
        let spyEntry = spies[i];
        spyEntry.restoreObjectToOriginalState();
      }
    };
  }

  return SpyRegistry;
};

getJasmineRequireObj().SpyStrategy = function(j$) {

  function SpyStrategy(options) {
    options = options || {};

    let identity = options.name || 'unknown',
        originalFn = options.fn || function () {
            },
        getSpy = options.getSpy || function () {
            },
        plan = function () {
        };

    this.identity = function() {
      return identity;
    };

    this.exec = function() {
      return plan.apply(this, arguments);
    };

    this.callThrough = function() {
      plan = originalFn;
      return getSpy();
    };

    this.returnValue = function(value) {
      plan = function() {
        return value;
      };
      return getSpy();
    };

    this.returnValues = function() {
      let values = Array.prototype.slice.call(arguments);
      plan = function () {
        return values.shift();
      };
      return getSpy();
    };

    this.throwError = function(something) {
      let error = (something instanceof Error) ? something : new Error(something);
      plan = function() {
        throw error;
      };
      return getSpy();
    };

    this.callFake = function(fn) {
      if(!j$.isFunction_(fn)) {
        throw new Error('Argument passed to callFake should be a function, got ' + fn);
      }
      plan = fn;
      return getSpy();
    };

    this.stub = function(fn) {
      plan = function() {};
      return getSpy();
    };
  }

  return SpyStrategy;
};

getJasmineRequireObj().Suite = function(j$) {
  function Suite(attrs) {
    this.env = attrs.env;
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    this.description = attrs.description;
    this.expectationFactory = attrs.expectationFactory;
    this.expectationResultFactory = attrs.expectationResultFactory;
    this.throwOnExpectationFailure = !!attrs.throwOnExpectationFailure;

    this.beforeFns = [];
    this.afterFns = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];
    this.disabled = false;

    this.children = [];

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: []
    };
  }

  Suite.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Suite.prototype.getFullName = function() {
    let fullName = [];
    for (let parentSuite = this; parentSuite; parentSuite = parentSuite.parentSuite) {
      if (parentSuite.parentSuite) {
        fullName.unshift(parentSuite.description);
      }
    }
    return fullName.join(' ');
  };

  Suite.prototype.disable = function() {
    this.disabled = true;
  };

  Suite.prototype.pend = function(message) {
    this.markedPending = true;
  };

  Suite.prototype.beforeEach = function(fn) {
    this.beforeFns.unshift(fn);
  };

  Suite.prototype.beforeAll = function(fn) {
    this.beforeAllFns.push(fn);
  };

  Suite.prototype.afterEach = function(fn) {
    this.afterFns.unshift(fn);
  };

  Suite.prototype.afterAll = function(fn) {
    this.afterAllFns.push(fn);
  };

  Suite.prototype.addChild = function(child) {
    this.children.push(child);
  };

  Suite.prototype.status = function() {
    if (this.disabled) {
      return 'disabled';
    }

    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'finished';
    }
  };

  Suite.prototype.isExecutable = function() {
    return !this.disabled;
  };

  Suite.prototype.canBeReentered = function() {
    return this.beforeAllFns.length === 0 && this.afterAllFns.length === 0;
  };

  Suite.prototype.getResult = function() {
    this.result.status = this.status();
    return this.result;
  };

  Suite.prototype.sharedUserContext = function() {
    if (!this.sharedContext) {
      this.sharedContext = this.parentSuite ? clone(this.parentSuite.sharedUserContext()) : {};
    }

    return this.sharedContext;
  };

  Suite.prototype.clonedSharedUserContext = function() {
    return clone(this.sharedUserContext());
  };

  Suite.prototype.onException = function() {
    if (arguments[0] instanceof j$.errors.ExpectationFailed) {
      return;
    }

    if(isAfterAll(this.children)) {
      let data = {
          matcherName: '',
          passed: false,
          expected: '',
          actual: '',
          error: arguments[0]
      };
      this.result.failedExpectations.push(this.expectationResultFactory(data));
    } else {
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        child.onException.apply(child, arguments);
      }
    }
  };

  Suite.prototype.addExpectationResult = function () {
    if(isAfterAll(this.children) && isFailure(arguments)){
      let data = arguments[1];
      this.result.failedExpectations.push(this.expectationResultFactory(data));
      if(this.throwOnExpectationFailure) {
        throw new j$.errors.ExpectationFailed();
      }
    } else {
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        try {
          child.addExpectationResult.apply(child, arguments);
        } catch(e) {
          // keep going
        }
      }
    }
  };

  function isAfterAll(children) {
    return children && children[0].result.status;
  }

  function isFailure(args) {
    return !args[0];
  }

  function clone(obj) {
    let clonedObj = {};
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        clonedObj[prop] = obj[prop];
      }
    }

    return clonedObj;
  }

  return Suite;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Suite = jasmineRequire.Suite;
}

getJasmineRequireObj().Timer = function() {
  let defaultNow = (function (Date) {
    return function () {
        return new Date().getTime();
    };
  })(Date);

  function Timer(options) {
    options = options || {};

    let now = options.now || defaultNow;
      let startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};

getJasmineRequireObj().TreeProcessor = function() {
  function TreeProcessor(attrs) {
    let tree = attrs.tree,
        runnableIds = attrs.runnableIds,
        queueRunnerFactory = attrs.queueRunnerFactory,
        nodeStart = attrs.nodeStart || function () {
            },
        nodeComplete = attrs.nodeComplete || function () {
            },
        orderChildren = attrs.orderChildren || function (node) {
                return node.children;
            },
        stats = {valid: true},
        processed = false,
        defaultMin = Infinity,
        defaultMax = 1 - Infinity;

    this.processTree = function() {
      processNode(tree, false);
      processed = true;
      return stats;
    };

    this.execute = function(done) {
      if (!processed) {
        this.processTree();
      }

      if (!stats.valid) {
        throw 'invalid order';
      }

      let childFns = wrapChildren(tree, 0);

      queueRunnerFactory({
        queueableFns: childFns,
        userContext: tree.sharedUserContext(),
        onException: function() {
          tree.onException.apply(tree, arguments);
        },
        onComplete: done
      });
    };

    function runnableIndex(id) {
      for (let i = 0; i < runnableIds.length; i++) {
        if (runnableIds[i] === id) {
          return i;
        }
      }
    }

    function processNode(node, parentEnabled) {
      let executableIndex = runnableIndex(node.id);

      if (executableIndex !== undefined) {
        parentEnabled = true;
      }

      parentEnabled = parentEnabled && node.isExecutable();

      if (!node.children) {
        stats[node.id] = {
          executable: parentEnabled && node.isExecutable(),
          segments: [{
            index: 0,
            owner: node,
            nodes: [node],
            min: startingMin(executableIndex),
            max: startingMax(executableIndex)
          }]
        };
      } else {
        let hasExecutableChild = false;

        let orderedChildren = orderChildren(node);

        for (let i = 0; i < orderedChildren.length; i++) {
          let child = orderedChildren[i];

          processNode(child, parentEnabled);

          if (!stats.valid) {
            return;
          }

          let childStats = stats[child.id];

          hasExecutableChild = hasExecutableChild || childStats.executable;
        }

        stats[node.id] = {
          executable: hasExecutableChild
        };

        segmentChildren(node, orderedChildren, stats[node.id], executableIndex);

        if (!node.canBeReentered() && stats[node.id].segments.length > 1) {
          stats = { valid: false };
        }
      }
    }

    function startingMin(executableIndex) {
      return executableIndex === undefined ? defaultMin : executableIndex;
    }

    function startingMax(executableIndex) {
      return executableIndex === undefined ? defaultMax : executableIndex;
    }

    function segmentChildren(node, orderedChildren, nodeStats, executableIndex) {
      let currentSegment = {
          index: 0,
          owner: node,
          nodes: [],
          min: startingMin(executableIndex),
          max: startingMax(executableIndex)
      };
        let result = [currentSegment];
        let lastMax = defaultMax;
        let orderedChildSegments = orderChildSegments(orderedChildren);

      function isSegmentBoundary(minIndex) {
        return lastMax !== defaultMax && minIndex !== defaultMin && lastMax < minIndex - 1;
      }

      for (let i = 0; i < orderedChildSegments.length; i++) {
        let childSegment = orderedChildSegments[i],
            maxIndex = childSegment.max,
            minIndex = childSegment.min;

        if (isSegmentBoundary(minIndex)) {
          currentSegment = {index: result.length, owner: node, nodes: [], min: defaultMin, max: defaultMax};
          result.push(currentSegment);
        }

        currentSegment.nodes.push(childSegment);
        currentSegment.min = Math.min(currentSegment.min, minIndex);
        currentSegment.max = Math.max(currentSegment.max, maxIndex);
        lastMax = maxIndex;
      }

      nodeStats.segments = result;
    }

    function orderChildSegments(children) {
      let specifiedOrder = [],
          unspecifiedOrder = [];

      for (let i = 0; i < children.length; i++) {
        let child = children[i],
            segments = stats[child.id].segments;

        for (let j = 0; j < segments.length; j++) {
          let seg = segments[j];

          if (seg.min === defaultMin) {
            unspecifiedOrder.push(seg);
          } else {
            specifiedOrder.push(seg);
          }
        }
      }

      specifiedOrder.sort(function(a, b) {
        return a.min - b.min;
      });

      return specifiedOrder.concat(unspecifiedOrder);
    }

    function executeNode(node, segmentNumber) {
      if (node.children) {
        return {
          fn: function(done) {
            nodeStart(node);

            queueRunnerFactory({
              onComplete: function() {
                nodeComplete(node, node.getResult());
                done();
              },
              queueableFns: wrapChildren(node, segmentNumber),
              userContext: node.sharedUserContext(),
              onException: function() {
                node.onException.apply(node, arguments);
              }
            });
          }
        };
      } else {
        return {
          fn: function(done) { node.execute(done, stats[node.id].executable); }
        };
      }
    }

    function wrapChildren(node, segmentNumber) {
      let result = [],
          segmentChildren = stats[node.id].segments[segmentNumber].nodes;

      for (let i = 0; i < segmentChildren.length; i++) {
        result.push(executeNode(segmentChildren[i].owner, segmentChildren[i].index));
      }

      if (!stats[node.id].executable) {
        return result;
      }

      return node.beforeAllFns.concat(result).concat(node.afterAllFns);
    }
  }

  return TreeProcessor;
};

getJasmineRequireObj().Any = function(j$) {

  function Any(expectedObject) {
    if (typeof expectedObject === 'undefined') {
      throw new TypeError(
        'jasmine.any() expects to be passed a constructor function. ' +
        'Please pass one or use jasmine.anything() to match any object.'
      );
    }
    this.expectedObject = expectedObject;
  }

  Any.prototype.asymmetricMatch = function(other) {
    if (this.expectedObject == String) {
      return typeof other == 'string' || other instanceof String;
    }

    if (this.expectedObject == Number) {
      return typeof other == 'number' || other instanceof Number;
    }

    if (this.expectedObject == Function) {
      return typeof other == 'function' || other instanceof Function;
    }

    if (this.expectedObject == Object) {
      return typeof other == 'object';
    }

    if (this.expectedObject == Boolean) {
      return typeof other == 'boolean';
    }

    return other instanceof this.expectedObject;
  };

  Any.prototype.jasmineToString = function() {
    return '<jasmine.any(' + j$.fnNameFor(this.expectedObject) + ')>';
  };

  return Any;
};

getJasmineRequireObj().Anything = function(j$) {

  function Anything() {}

  Anything.prototype.asymmetricMatch = function(other) {
    return !j$.util.isUndefined(other) && other !== null;
  };

  Anything.prototype.jasmineToString = function() {
    return '<jasmine.anything>';
  };

  return Anything;
};

getJasmineRequireObj().ArrayContaining = function(j$) {
  function ArrayContaining(sample) {
    this.sample = sample;
  }

  ArrayContaining.prototype.asymmetricMatch = function(other) {
    let className = Object.prototype.toString.call(this.sample);
    if (className !== '[object Array]') { throw new Error('You must provide an array to arrayContaining, not \'' + this.sample + '\'.'); }

    for (let i = 0; i < this.sample.length; i++) {
      let item = this.sample[i];
      if (!j$.matchersUtil.contains(other, item)) {
        return false;
      }
    }

    return true;
  };

  ArrayContaining.prototype.jasmineToString = function () {
    return '<jasmine.arrayContaining(' + jasmine.pp(this.sample) +')>';
  };

  return ArrayContaining;
};

getJasmineRequireObj().ObjectContaining = function(j$) {

  function ObjectContaining(sample) {
    this.sample = sample;
  }

  function getPrototype(obj) {
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }

    if (obj.constructor.prototype == obj) {
      return null;
    }

    return obj.constructor.prototype;
  }

  function hasProperty(obj, property) {
    if (!obj) {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      return true;
    }

    return hasProperty(getPrototype(obj), property);
  }

  ObjectContaining.prototype.asymmetricMatch = function(other) {
    if (typeof(this.sample) !== 'object') { throw new Error('You must provide an object to objectContaining, not \''+this.sample+'\'.'); }

    for (let property in this.sample) {
      if (!hasProperty(other, property) ||
          !j$.matchersUtil.equals(this.sample[property], other[property])) {
        return false;
      }
    }

    return true;
  };

  ObjectContaining.prototype.jasmineToString = function() {
    return '<jasmine.objectContaining(' + j$.pp(this.sample) + ')>';
  };

  return ObjectContaining;
};

getJasmineRequireObj().StringMatching = function(j$) {

  function StringMatching(expected) {
    if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
      throw new Error('Expected is not a String or a RegExp');
    }

    this.regexp = new RegExp(expected);
  }

  StringMatching.prototype.asymmetricMatch = function(other) {
    return this.regexp.test(other);
  };

  StringMatching.prototype.jasmineToString = function() {
    return '<jasmine.stringMatching(' + this.regexp + ')>';
  };

  return StringMatching;
};

getJasmineRequireObj().errors = function() {
  function ExpectationFailed() {}

  ExpectationFailed.prototype = new Error();
  ExpectationFailed.prototype.constructor = ExpectationFailed;

  return {
    ExpectationFailed: ExpectationFailed
  };
};
getJasmineRequireObj().formatErrorMsg = function() {
  function generateErrorMsg(domain, usage) {
    let usageDefinition = usage ? '\nUsage: ' + usage : '';

    return function errorMsg(msg) {
      return domain + ' : ' + msg + usageDefinition;
    };
  }

  return generateErrorMsg;
};

getJasmineRequireObj().matchersUtil = function(j$) {
  // TODO: what to do about jasmine.pp not being inject? move to JSON.stringify? gut PrettyPrinter?

  return {
    equals: function(a, b, customTesters) {
      customTesters = customTesters || [];

      return eq(a, b, [], [], customTesters);
    },

    contains: function(haystack, needle, customTesters) {
      customTesters = customTesters || [];

      if ((Object.prototype.toString.apply(haystack) === '[object Array]') ||
        (!!haystack && !haystack.indexOf))
      {
        for (let i = 0; i < haystack.length; i++) {
          if (eq(haystack[i], needle, [], [], customTesters)) {
            return true;
          }
        }
        return false;
      }

      return !!haystack && haystack.indexOf(needle) >= 0;
    },

    buildFailureMessage: function() {
      let args = Array.prototype.slice.call(arguments, 0),
          matcherName = args[0],
          isNot = args[1],
          actual = args[2],
          expected = args.slice(3),
          englishyPredicate = matcherName.replace(/[A-Z]/g, function (s) {
              return ' ' + s.toLowerCase();
          });

      let message = 'Expected ' +
          j$.pp(actual) +
          (isNot ? ' not ' : ' ') +
          englishyPredicate;

      if (expected.length > 0) {
        for (let i = 0; i < expected.length; i++) {
          if (i > 0) {
            message += ',';
          }
          message += ' ' + j$.pp(expected[i]);
        }
      }

      return message + '.';
    }
  };

  function isAsymmetric(obj) {
    return obj && j$.isA_('Function', obj.asymmetricMatch);
  }

  function asymmetricMatch(a, b) {
    let asymmetricA = isAsymmetric(a),
        asymmetricB = isAsymmetric(b);

    if (asymmetricA && asymmetricB) {
      return undefined;
    }

    if (asymmetricA) {
      return a.asymmetricMatch(b);
    }

    if (asymmetricB) {
      return b.asymmetricMatch(a);
    }
  }

  // Equality function lovingly adapted from isEqual in
  //   [Underscore](http://underscorejs.org)
  function eq(a, b, aStack, bStack, customTesters) {
    let result = true;

    let asymmetricResult = asymmetricMatch(a, b);
    if (!j$.util.isUndefined(asymmetricResult)) {
      return asymmetricResult;
    }

    for (let i = 0; i < customTesters.length; i++) {
      let customTesterResult = customTesters[i](a, b);
      if (!j$.util.isUndefined(customTesterResult)) {
        return customTesterResult;
      }
    }

    if (a instanceof Error && b instanceof Error) {
      return a.message == b.message;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) { return a === b; }
    let className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) { return false; }
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }

    let aIsDomNode = j$.isDomNode(a);
    let bIsDomNode = j$.isDomNode(b);
    if (aIsDomNode && bIsDomNode) {
      // At first try to use DOM3 method isEqualNode
      if (a.isEqualNode) {
        return a.isEqualNode(b);
      }
      // IE8 doesn't support isEqualNode, try to use outerHTML && innerText
      let aIsElement = a instanceof Element;
      let bIsElement = b instanceof Element;
      if (aIsElement && bIsElement) {
        return a.outerHTML == b.outerHTML;
      }
      if (aIsElement || bIsElement) {
        return false;
      }
      return a.innerText == b.innerText && a.textContent == b.textContent;
    }
    if (aIsDomNode || bIsDomNode) {
      return false;
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    let length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) { return bStack[length] == b; }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    let size = 0;
    // Recursively compare objects and arrays.
    // Compare array lengths to determine if a deep comparison is necessary.
    if (className == '[object Array]') {
      size = a.length;
      if (size !== b.length) {
        return false;
      }

      while (size--) {
        result = eq(a[size], b[size], aStack, bStack, customTesters);
        if (!result) {
          return false;
        }
      }
    } else {

      // Objects with different constructors are not equivalent, but `Object`s
      // or `Array`s from different frames are.
      let aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isObjectConstructor(aCtor) &&
                               isObjectConstructor(bCtor))) {
        return false;
      }
    }

    // Deep compare objects.
    let aKeys = keys(a, className == '[object Array]');
      let key;
    size = aKeys.length;

    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b, className == '[object Array]').length !== size) { return false; }

    while (size--) {
      key = aKeys[size];
      // Deep compare each member
      result = has(b, key) && eq(a[key], b[key], aStack, bStack, customTesters);

      if (!result) {
        return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();

    return result;

    function keys(obj, isArray) {
      let allKeys = Object.keys ? Object.keys(obj) :
          (function (o) {
              let keys = [];
              for (let key in o) {
                  if (has(o, key)) {
                      keys.push(key);
                  }
              }
              return keys;
          })(obj);

      if (!isArray) {
        return allKeys;
      }

      let extraKeys = [];
      if (allKeys.length === 0) {
          return allKeys;
      }

      for (let x = 0; x < allKeys.length; x++) {
          if (!allKeys[x].match(/^[0-9]+$/)) {
              extraKeys.push(allKeys[x]);
          }
      }

      return extraKeys;
    }
  }

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function isObjectConstructor(ctor) {
    // aCtor instanceof aCtor is true for the Object and Function
    // constructors (since a constructor is-a Function and a function is-a
    // Object). We don't just compare ctor === Object because the constructor
    // might come from a different frame with different globals.
    return isFunction(ctor) && ctor instanceof ctor;
  }
};

getJasmineRequireObj().toBe = function() {
  function toBe() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual === expected
        };
      }
    };
  }

  return toBe;
};

getJasmineRequireObj().toBeCloseTo = function() {

  function toBeCloseTo() {
    return {
      compare: function(actual, expected, precision) {
        if (precision !== 0) {
          precision = precision || 2;
        }

        return {
          pass: Math.abs(expected - actual) < (Math.pow(10, -precision) / 2)
        };
      }
    };
  }

  return toBeCloseTo;
};

getJasmineRequireObj().toBeDefined = function() {
  function toBeDefined() {
    return {
      compare: function(actual) {
        return {
          pass: (void 0 !== actual)
        };
      }
    };
  }

  return toBeDefined;
};

getJasmineRequireObj().toBeFalsy = function() {
  function toBeFalsy() {
    return {
      compare: function(actual) {
        return {
          pass: !actual
        };
      }
    };
  }

  return toBeFalsy;
};

getJasmineRequireObj().toBeGreaterThan = function() {

  function toBeGreaterThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual > expected
        };
      }
    };
  }

  return toBeGreaterThan;
};


getJasmineRequireObj().toBeGreaterThanOrEqual = function() {

  function toBeGreaterThanOrEqual() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual >= expected
        };
      }
    };
  }

  return toBeGreaterThanOrEqual;
};

getJasmineRequireObj().toBeLessThan = function() {
  function toBeLessThan() {
    return {

      compare: function(actual, expected) {
        return {
          pass: actual < expected
        };
      }
    };
  }

  return toBeLessThan;
};
getJasmineRequireObj().toBeLessThanOrEqual = function() {
  function toBeLessThanOrEqual() {
    return {

      compare: function(actual, expected) {
        return {
          pass: actual <= expected
        };
      }
    };
  }

  return toBeLessThanOrEqual;
};

getJasmineRequireObj().toBeNaN = function(j$) {

  function toBeNaN() {
    return {
      compare: function(actual) {
        let result = {
            pass: (actual !== actual)
        };

        if (result.pass) {
          result.message = 'Expected actual not to be NaN.';
        } else {
          result.message = function() { return 'Expected ' + j$.pp(actual) + ' to be NaN.'; };
        }

        return result;
      }
    };
  }

  return toBeNaN;
};

getJasmineRequireObj().toBeNull = function() {

  function toBeNull() {
    return {
      compare: function(actual) {
        return {
          pass: actual === null
        };
      }
    };
  }

  return toBeNull;
};

getJasmineRequireObj().toBeTruthy = function() {

  function toBeTruthy() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  }

  return toBeTruthy;
};

getJasmineRequireObj().toBeUndefined = function() {

  function toBeUndefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 === actual
        };
      }
    };
  }

  return toBeUndefined;
};

getJasmineRequireObj().toContain = function() {
  function toContain(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {

        return {
          pass: util.contains(actual, expected, customEqualityTesters)
        };
      }
    };
  }

  return toContain;
};

getJasmineRequireObj().toEqual = function() {

  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        let result = {
            pass: false
        };

        result.pass = util.equals(actual, expected, customEqualityTesters);

        return result;
      }
    };
  }

  return toEqual;
};

getJasmineRequireObj().toHaveBeenCalled = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalled>', 'expect(<spyObj>).toHaveBeenCalled()');

  function toHaveBeenCalled() {
    return {
      compare: function(actual) {
        let result = {};

        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        if (arguments.length > 1) {
          throw new Error(getErrorMsg('Does not take arguments, use toHaveBeenCalledWith'));
        }

        result.pass = actual.calls.any();

        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' not to have been called.' :
          'Expected spy ' + actual.and.identity() + ' to have been called.';

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};

getJasmineRequireObj().toHaveBeenCalledTimes = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledTimes>', 'expect(<spyObj>).toHaveBeenCalledTimes(<Number>)');

  function toHaveBeenCalledTimes() {
    return {
      compare: function(actual, expected) {
        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        let args = Array.prototype.slice.call(arguments, 0),
            result = {pass: false};

        if (!j$.isNumber_(expected)){
          throw new Error(getErrorMsg('The expected times failed is a required argument and must be a number.'));
        }

        actual = args[0];
        let calls = actual.calls.count();
        let timesMessage = expected === 1 ? 'once' : expected + ' times';
        result.pass = calls === expected;
        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' not to have been called ' + timesMessage + '. It was called ' +  calls + ' times.' :
          'Expected spy ' + actual.and.identity() + ' to have been called ' + timesMessage + '. It was called ' +  calls + ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledTimes;
};

getJasmineRequireObj().toHaveBeenCalledWith = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledWith>', 'expect(<spyObj>).toHaveBeenCalledWith(...arguments)');

  function toHaveBeenCalledWith(util, customEqualityTesters) {
    return {
      compare: function() {
        let args = Array.prototype.slice.call(arguments, 0),
            actual = args[0],
            expectedArgs = args.slice(1),
            result = {pass: false};

        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        if (!actual.calls.any()) {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called with ' + j$.pp(expectedArgs) + ' but it was never called.'; };
          return result;
        }

        if (util.contains(actual.calls.allArgs(), expectedArgs, customEqualityTesters)) {
          result.pass = true;
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' not to have been called with ' + j$.pp(expectedArgs) + ' but it was.'; };
        } else {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called with ' + j$.pp(expectedArgs) + ' but actual calls were ' + j$.pp(actual.calls.allArgs()).replace(/^\[ | \]$/g, '') + '.'; };
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledWith;
};

getJasmineRequireObj().toMatch = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<toMatch>', 'expect(<expectation>).toMatch(<string> || <regexp>)');

  function toMatch() {
    return {
      compare: function(actual, expected) {
        if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
          throw new Error(getErrorMsg('Expected is not a String or a RegExp'));
        }

        let regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  }

  return toMatch;
};

getJasmineRequireObj().toThrow = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<toThrow>', 'expect(function() {<expectation>}).toThrow()');

  function toThrow(util) {
    return {
      compare: function(actual, expected) {
        let result = {pass: false};
          let threw = false,
              thrown;

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          result.message = 'Expected function to throw an exception.';
          return result;
        }

        if (arguments.length == 1) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw, but it threw ' + j$.pp(thrown) + '.'; };

          return result;
        }

        if (util.equals(thrown, expected)) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw ' + j$.pp(expected) + '.'; };
        } else {
          result.message = function() { return 'Expected function to throw ' + j$.pp(expected) + ', but it threw ' +  j$.pp(thrown) + '.'; };
        }

        return result;
      }
    };
  }

  return toThrow;
};

getJasmineRequireObj().toThrowError = function(j$) {

  let getErrorMsg = j$.formatErrorMsg('<toThrowError>', 'expect(function() {<expectation>}).toThrowError(<ErrorConstructor>, <message>)');

  function toThrowError () {
    return {
      compare: function(actual) {
        let threw = false;
          let pass = {pass: true},
              fail = {pass: false};
          let thrown;

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        let errorMatcher = getMatcher.apply(null, arguments);

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          fail.message = 'Expected function to throw an Error.';
          return fail;
        }

        if (!(thrown instanceof Error)) {
          fail.message = function() { return 'Expected function to throw an Error, but it threw ' + j$.pp(thrown) + '.'; };
          return fail;
        }

        if (errorMatcher.hasNoSpecifics()) {
          pass.message = 'Expected function not to throw an Error, but it threw ' + j$.fnNameFor(thrown) + '.';
          return pass;
        }

        if (errorMatcher.matches(thrown)) {
          pass.message = function() {
            return 'Expected function not to throw ' + errorMatcher.errorTypeDescription + errorMatcher.messageDescription() + '.';
          };
          return pass;
        } else {
          fail.message = function() {
            return 'Expected function to throw ' + errorMatcher.errorTypeDescription + errorMatcher.messageDescription() +
              ', but it threw ' + errorMatcher.thrownDescription(thrown) + '.';
          };
          return fail;
        }
      }
    };

    function getMatcher() {
      let expected = null,
          errorType = null;

      if (arguments.length == 2) {
        expected = arguments[1];
        if (isAnErrorType(expected)) {
          errorType = expected;
          expected = null;
        }
      } else if (arguments.length > 2) {
        errorType = arguments[1];
        expected = arguments[2];
        if (!isAnErrorType(errorType)) {
          throw new Error(getErrorMsg('Expected error type is not an Error.'));
        }
      }

      if (expected && !isStringOrRegExp(expected)) {
        if (errorType) {
          throw new Error(getErrorMsg('Expected error message is not a string or RegExp.'));
        } else {
          throw new Error(getErrorMsg('Expected is not an Error, string, or RegExp.'));
        }
      }

      function messageMatch(message) {
        if (typeof expected == 'string') {
          return expected == message;
        } else {
          return expected.test(message);
        }
      }

      return {
        errorTypeDescription: errorType ? j$.fnNameFor(errorType) : 'an exception',
        thrownDescription: function(thrown) {
          let thrownName = errorType ? j$.fnNameFor(thrown.constructor) : 'an exception';
            let thrownMessage = '';

          if (expected) {
            thrownMessage = ' with message ' + j$.pp(thrown.message);
          }

          return thrownName + thrownMessage;
        },
        messageDescription: function() {
          if (expected === null) {
            return '';
          } else if (expected instanceof RegExp) {
            return ' with a message matching ' + j$.pp(expected);
          } else {
            return ' with message ' + j$.pp(expected);
          }
        },
        hasNoSpecifics: function() {
          return expected === null && errorType === null;
        },
        matches: function(error) {
          return (errorType === null || error instanceof errorType) &&
            (expected === null || messageMatch(error.message));
        }
      };
    }

    function isStringOrRegExp(potential) {
      return potential instanceof RegExp || (typeof potential == 'string');
    }

    function isAnErrorType(type) {
      if (typeof type !== 'function') {
        return false;
      }

      let Surrogate = function () {
      };
      Surrogate.prototype = type.prototype;
      return (new Surrogate()) instanceof Error;
    }
  }

  return toThrowError;
};

getJasmineRequireObj().interface = function(jasmine, env) {
  let jasmineInterface = {
    describe: function (description, specDefinitions) {
        return env.describe(description, specDefinitions);
    },

    xdescribe: function (description, specDefinitions) {
        return env.xdescribe(description, specDefinitions);
    },

    fdescribe: function (description, specDefinitions) {
        return env.fdescribe(description, specDefinitions);
    },

    it: function () {
        return env.it.apply(env, arguments);
    },

    xit: function () {
        return env.xit.apply(env, arguments);
    },

    fit: function () {
        return env.fit.apply(env, arguments);
    },

    beforeEach: function () {
        return env.beforeEach.apply(env, arguments);
    },

    afterEach: function () {
        return env.afterEach.apply(env, arguments);
    },

    beforeAll: function () {
        return env.beforeAll.apply(env, arguments);
    },

    afterAll: function () {
        return env.afterAll.apply(env, arguments);
    },

    expect: function (actual) {
        return env.expect(actual);
    },

    pending: function () {
        return env.pending.apply(env, arguments);
    },

    fail: function () {
        return env.fail.apply(env, arguments);
    },

    spyOn: function (obj, methodName) {
        return env.spyOn(obj, methodName);
    },

    jsApiReporter: new jasmine.JsApiReporter({
        timer: new jasmine.Timer()
    }),

    jasmine: jasmine
  };

  jasmine.addCustomEqualityTester = function(tester) {
    env.addCustomEqualityTester(tester);
  };

  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  jasmine.clock = function() {
    return env.clock;
  };

  return jasmineInterface;
};

getJasmineRequireObj().version = function() {
  return '2.5.2';
};
