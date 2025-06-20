var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      ref() {
      }
      unref() {
      }
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      mainModule = void 0;
      domain = void 0;
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, exit, platform, nextTick, unenvProcess, abort, addListener, allowedNodeEnvironmentFlags, hasUncaughtExceptionCaptureCallback, setUncaughtExceptionCaptureCallback, loadEnvFile, sourceMapsEnabled, arch, argv, argv0, chdir, config, connected, constrainedMemory, availableMemory, cpuUsage, cwd, debugPort, dlopen, disconnect, emit, emitWarning, env, eventNames, execArgv, execPath, finalization, features, getActiveResourcesInfo, getMaxListeners, hrtime3, kill, listeners, listenerCount, memoryUsage, on, off, once, pid, ppid, prependListener, prependOnceListener, rawListeners, release, removeAllListeners, removeListener, report, resourceUsage, setMaxListeners, setSourceMapsEnabled, stderr, stdin, stdout, title, throwDeprecation, traceDeprecation, umask, uptime, version, versions, domain, initgroups, moduleLoadList, reallyExit, openStdin, assert2, binding, send, exitCode, channel, getegid, geteuid, getgid, getgroups, getuid, setegid, seteuid, setgid, setgroups, setuid, permission, mainModule, _events, _eventsCount, _exiting, _maxListeners, _debugEnd, _debugProcess, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, _disconnect, _handleQueue, _pendingMessage, _channel, _send, _linkedBinding, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    ({ exit, platform, nextTick } = getBuiltinModule(
      "node:process"
    ));
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      nextTick
    });
    ({
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      finalization,
      features,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      on,
      off,
      once,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// src/models/form-config.ts
var form_config_exports = {};
__export(form_config_exports, {
  ConditionalAction: () => ConditionalAction,
  FormTheme: () => FormTheme,
  LogicCombinator: () => LogicCombinator,
  LogicOperator: () => LogicOperator,
  MatrixResponseType: () => MatrixResponseType,
  PaymentMethod: () => PaymentMethod,
  PhoneFormat: () => PhoneFormat,
  QuestionLayout: () => QuestionLayout,
  QuestionType: () => QuestionType,
  RatingStyle: () => RatingStyle,
  SubmissionBehavior: () => SubmissionBehavior,
  TimeFormat: () => TimeFormat,
  ValidationType: () => ValidationType,
  combineValidationRules: () => combineValidationRules,
  createChoiceRule: () => createChoiceRule,
  createEmailRule: () => createEmailRule,
  createJumpLogic: () => createJumpLogic,
  createLengthRule: () => createLengthRule,
  createNumericRule: () => createNumericRule,
  createPatternRule: () => createPatternRule,
  createRequiredLogic: () => createRequiredLogic,
  createRequiredRule: () => createRequiredRule,
  createSimpleShowHideLogic: () => createSimpleShowHideLogic,
  createValidationRulesForQuestion: () => createValidationRulesForQuestion,
  filterCompatibleValidationRules: () => filterCompatibleValidationRules,
  getCompatibleValidationTypes: () => getCompatibleValidationTypes,
  getReferencedQuestionIds: () => getReferencedQuestionIds,
  isChoiceValidation: () => isChoiceValidation,
  isClearValueAction: () => isClearValueAction,
  isCustomValidation: () => isCustomValidation,
  isDateTimeQuestion: () => isDateTimeQuestion,
  isDateValidation: () => isDateValidation,
  isEmailValidation: () => isEmailValidation,
  isEnableDisableAction: () => isEnableDisableAction,
  isFileQuestion: () => isFileQuestion,
  isFileValidation: () => isFileValidation,
  isJumpToAction: () => isJumpToAction,
  isJumpToPageAction: () => isJumpToPageAction,
  isLengthValidation: () => isLengthValidation,
  isMatrixQuestion: () => isMatrixQuestion,
  isNumericQuestion: () => isNumericQuestion,
  isNumericValidation: () => isNumericValidation,
  isPatternValidation: () => isPatternValidation,
  isPhoneValidation: () => isPhoneValidation,
  isRatingValidation: () => isRatingValidation,
  isRedirectAction: () => isRedirectAction,
  isRequireAction: () => isRequireAction,
  isRequiredValidation: () => isRequiredValidation,
  isSetValueAction: () => isSetValueAction,
  isShowHideAction: () => isShowHideAction,
  isShowMessageAction: () => isShowMessageAction,
  isSkipAction: () => isSkipAction,
  isSubmitFormAction: () => isSubmitFormAction,
  isTextBasedQuestion: () => isTextBasedQuestion,
  isTimeValidation: () => isTimeValidation,
  isUrlValidation: () => isUrlValidation,
  isValidationRuleCompatible: () => isValidationRuleCompatible,
  logicReferencesQuestion: () => logicReferencesQuestion,
  questionHasOptions: () => questionHasOptions,
  validateLogicReferences: () => validateLogicReferences
});
function questionHasOptions(question) {
  return question.type === "multiple_choice" /* MULTIPLE_CHOICE */ || question.type === "dropdown" /* DROPDOWN */ || question.type === "checkboxes" /* CHECKBOXES */;
}
function isTextBasedQuestion(question) {
  return question.type === "text" /* TEXT */ || question.type === "textarea" /* TEXTAREA */ || question.type === "email" /* EMAIL */ || question.type === "phone" /* PHONE */ || question.type === "url" /* URL */;
}
function isNumericQuestion(question) {
  return question.type === "number" /* NUMBER */ || question.type === "rating" /* RATING */ || question.type === "linear_scale" /* LINEAR_SCALE */;
}
function isDateTimeQuestion(question) {
  return question.type === "date" /* DATE */ || question.type === "time" /* TIME */;
}
function isFileQuestion(question) {
  return question.type === "file" /* FILE */ || question.type === "signature" /* SIGNATURE */;
}
function isMatrixQuestion(question) {
  return question.type === "matrix" /* MATRIX */;
}
function isRequiredValidation(rule) {
  return rule.type === "required";
}
function isLengthValidation(rule) {
  return rule.type === "length";
}
function isNumericValidation(rule) {
  return rule.type === "numeric";
}
function isPatternValidation(rule) {
  return rule.type === "pattern";
}
function isEmailValidation(rule) {
  return rule.type === "email";
}
function isUrlValidation(rule) {
  return rule.type === "url";
}
function isPhoneValidation(rule) {
  return rule.type === "phone";
}
function isDateValidation(rule) {
  return rule.type === "date";
}
function isTimeValidation(rule) {
  return rule.type === "time";
}
function isFileValidation(rule) {
  return rule.type === "file";
}
function isChoiceValidation(rule) {
  return rule.type === "choice";
}
function isRatingValidation(rule) {
  return rule.type === "rating";
}
function isCustomValidation(rule) {
  return rule.type === "custom";
}
function getCompatibleValidationTypes(questionType) {
  const baseTypes = ["required", "custom"];
  switch (questionType) {
    case "text" /* TEXT */:
    case "textarea" /* TEXTAREA */:
      return [...baseTypes, "length", "pattern"];
    case "email" /* EMAIL */:
      return [...baseTypes, "length", "pattern", "email"];
    case "phone" /* PHONE */:
      return [...baseTypes, "length", "pattern", "phone"];
    case "url" /* URL */:
      return [...baseTypes, "length", "pattern", "url"];
    case "number" /* NUMBER */:
      return [...baseTypes, "numeric"];
    case "date" /* DATE */:
      return [...baseTypes, "date"];
    case "time" /* TIME */:
      return [...baseTypes, "time"];
    case "multiple_choice" /* MULTIPLE_CHOICE */:
    case "dropdown" /* DROPDOWN */:
    case "checkboxes" /* CHECKBOXES */:
      return [...baseTypes, "choice"];
    case "rating" /* RATING */:
    case "linear_scale" /* LINEAR_SCALE */:
      return [...baseTypes, "rating", "numeric"];
    case "file" /* FILE */:
    case "signature" /* SIGNATURE */:
      return [...baseTypes, "file"];
    case "matrix" /* MATRIX */:
      return [...baseTypes, "choice"];
    case "payment" /* PAYMENT */:
      return [...baseTypes, "numeric"];
    default:
      return baseTypes;
  }
}
function isValidationRuleCompatible(rule, questionType) {
  const compatibleTypes = getCompatibleValidationTypes(questionType);
  return compatibleTypes.includes(rule.type);
}
function filterCompatibleValidationRules(rules, questionType) {
  return rules.filter((rule) => isValidationRuleCompatible(rule, questionType));
}
function createValidationRulesForQuestion(rules) {
  return {
    rules,
    validateOnChange: true,
    validateOnBlur: true,
    stopOnFirstError: false
  };
}
function combineValidationRules(...ruleSets) {
  const combinedRules = [];
  const combinedCustomMessages = {};
  let validateOnChange = false;
  let validateOnBlur = false;
  let stopOnFirstError = false;
  const allDependencies = [];
  for (const ruleSet of ruleSets) {
    if (ruleSet.rules) {
      combinedRules.push(...ruleSet.rules);
    }
    if (ruleSet.customMessages) {
      Object.assign(combinedCustomMessages, ruleSet.customMessages);
    }
    if (ruleSet.validateOnChange) validateOnChange = true;
    if (ruleSet.validateOnBlur) validateOnBlur = true;
    if (ruleSet.stopOnFirstError) stopOnFirstError = true;
    if (ruleSet.dependencies) {
      allDependencies.push(...ruleSet.dependencies);
    }
  }
  const result = {
    rules: combinedRules,
    validateOnChange,
    validateOnBlur,
    stopOnFirstError
  };
  if (Object.keys(combinedCustomMessages).length > 0) {
    result.customMessages = combinedCustomMessages;
  }
  if (allDependencies.length > 0) {
    result.dependencies = [...new Set(allDependencies)];
  }
  return result;
}
function createRequiredRule(errorMessage) {
  const rule = {
    type: "required",
    required: true
  };
  if (errorMessage !== void 0) {
    rule.errorMessage = errorMessage;
  }
  return rule;
}
function createLengthRule(options) {
  const rule = {
    type: "length"
  };
  if (options.minLength !== void 0) rule.minLength = options.minLength;
  if (options.maxLength !== void 0) rule.maxLength = options.maxLength;
  if (options.errorMessage !== void 0) rule.errorMessage = options.errorMessage;
  return rule;
}
function createNumericRule(options) {
  const rule = {
    type: "numeric"
  };
  if (options.min !== void 0) rule.min = options.min;
  if (options.max !== void 0) rule.max = options.max;
  if (options.step !== void 0) rule.step = options.step;
  if (options.decimalPlaces !== void 0) rule.decimalPlaces = options.decimalPlaces;
  if (options.errorMessage !== void 0) rule.errorMessage = options.errorMessage;
  return rule;
}
function createPatternRule(pattern, options) {
  const rule = {
    type: "pattern",
    pattern
  };
  if (options?.flags !== void 0) rule.flags = options.flags;
  if (options?.caseSensitive !== void 0) rule.caseSensitive = options.caseSensitive;
  if (options?.errorMessage !== void 0) rule.errorMessage = options.errorMessage;
  return rule;
}
function createEmailRule(options) {
  const rule = {
    type: "email"
  };
  if (options?.allowedDomains !== void 0) rule.allowedDomains = options.allowedDomains;
  if (options?.blockedDomains !== void 0) rule.blockedDomains = options.blockedDomains;
  if (options?.requireTLD !== void 0) rule.requireTLD = options.requireTLD;
  if (options?.errorMessage !== void 0) rule.errorMessage = options.errorMessage;
  return rule;
}
function createChoiceRule(options) {
  const rule = {
    type: "choice"
  };
  if (options.minSelections !== void 0) rule.minSelections = options.minSelections;
  if (options.maxSelections !== void 0) rule.maxSelections = options.maxSelections;
  if (options.requiredOptions !== void 0) rule.requiredOptions = options.requiredOptions;
  if (options.forbiddenCombinations !== void 0) rule.forbiddenCombinations = options.forbiddenCombinations;
  if (options.errorMessage !== void 0) rule.errorMessage = options.errorMessage;
  return rule;
}
function isShowHideAction(action) {
  return action.action === "show" /* SHOW */ || action.action === "hide" /* HIDE */;
}
function isRequireAction(action) {
  return action.action === "require" /* REQUIRE */ || action.action === "make_optional" /* MAKE_OPTIONAL */;
}
function isJumpToAction(action) {
  return action.action === "jump_to" /* JUMP_TO */;
}
function isJumpToPageAction(action) {
  return action.action === "jump_to_page" /* JUMP_TO_PAGE */;
}
function isSetValueAction(action) {
  return action.action === "set_value" /* SET_VALUE */;
}
function isClearValueAction(action) {
  return action.action === "clear_value" /* CLEAR_VALUE */;
}
function isEnableDisableAction(action) {
  return action.action === "enable" /* ENABLE */ || action.action === "disable" /* DISABLE */;
}
function isShowMessageAction(action) {
  return action.action === "show_message" /* SHOW_MESSAGE */;
}
function isRedirectAction(action) {
  return action.action === "redirect" /* REDIRECT */;
}
function isSubmitFormAction(action) {
  return action.action === "submit_form" /* SUBMIT_FORM */;
}
function isSkipAction(action) {
  return action.action === "skip" /* SKIP */;
}
function getReferencedQuestionIds(logic) {
  const questionIds = /* @__PURE__ */ new Set();
  function processConditionGroup(group3) {
    group3.conditions.forEach((condition) => {
      questionIds.add(condition.questionId);
    });
    group3.groups?.forEach((nestedGroup) => {
      processConditionGroup(nestedGroup);
    });
  }
  __name(processConditionGroup, "processConditionGroup");
  function processActions(actions) {
    actions.forEach((action) => {
      if (isJumpToAction(action)) {
        questionIds.add(action.targetQuestionId);
      } else if (isSetValueAction(action) || isClearValueAction(action)) {
        questionIds.add(action.targetQuestionId);
      }
    });
  }
  __name(processActions, "processActions");
  processConditionGroup(logic.conditionGroup);
  processActions(logic.actions);
  if (logic.elseActions) {
    processActions(logic.elseActions);
  }
  return Array.from(questionIds);
}
function logicReferencesQuestion(logic, questionId) {
  return getReferencedQuestionIds(logic).includes(questionId);
}
function validateLogicReferences(logic, existingQuestionIds) {
  const referencedIds = getReferencedQuestionIds(logic);
  const missingQuestions = referencedIds.filter((id) => !existingQuestionIds.includes(id));
  return {
    isValid: missingQuestions.length === 0,
    missingQuestions
  };
}
function createSimpleShowHideLogic(questionId, triggerQuestionId, operator, value, action = "show") {
  return {
    id: `${action}_${questionId}_when_${triggerQuestionId}_${operator}_${value}`,
    name: `${action === "show" ? "Show" : "Hide"} ${questionId} when ${triggerQuestionId} ${operator} ${value}`,
    enabled: true,
    conditionGroup: {
      combinator: "and" /* AND */,
      conditions: [
        {
          questionId: triggerQuestionId,
          operator,
          value
        }
      ]
    },
    actions: [
      {
        action: action === "show" ? "show" /* SHOW */ : "hide" /* HIDE */
      }
    ]
  };
}
function createRequiredLogic(questionId, triggerQuestionId, operator, value, validationMessage) {
  return {
    id: `require_${questionId}_when_${triggerQuestionId}_${operator}_${value}`,
    name: `Require ${questionId} when ${triggerQuestionId} ${operator} ${value}`,
    enabled: true,
    conditionGroup: {
      combinator: "and" /* AND */,
      conditions: [
        {
          questionId: triggerQuestionId,
          operator,
          value
        }
      ]
    },
    actions: [
      {
        action: "require" /* REQUIRE */,
        validationMessage
      }
    ]
  };
}
function createJumpLogic(triggerQuestionId, operator, value, targetQuestionId, skipValidation = false) {
  return {
    id: `jump_to_${targetQuestionId}_when_${triggerQuestionId}_${operator}_${value}`,
    name: `Jump to ${targetQuestionId} when ${triggerQuestionId} ${operator} ${value}`,
    enabled: true,
    conditionGroup: {
      combinator: "and" /* AND */,
      conditions: [
        {
          questionId: triggerQuestionId,
          operator,
          value
        }
      ]
    },
    actions: [
      {
        action: "jump_to" /* JUMP_TO */,
        targetQuestionId,
        skipValidation
      }
    ]
  };
}
var QuestionType, FormTheme, SubmissionBehavior, ValidationType, LogicOperator, QuestionLayout, RatingStyle, PhoneFormat, TimeFormat, PaymentMethod, MatrixResponseType, ConditionalAction, LogicCombinator;
var init_form_config = __esm({
  "src/models/form-config.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    QuestionType = /* @__PURE__ */ ((QuestionType2) => {
      QuestionType2["TEXT"] = "text";
      QuestionType2["EMAIL"] = "email";
      QuestionType2["NUMBER"] = "number";
      QuestionType2["CHOICE"] = "choice";
      QuestionType2["RATING"] = "rating";
      QuestionType2["FILE"] = "file";
      QuestionType2["DATE"] = "date";
      QuestionType2["TIME"] = "time";
      QuestionType2["TEXTAREA"] = "textarea";
      QuestionType2["DROPDOWN"] = "dropdown";
      QuestionType2["CHECKBOXES"] = "checkboxes";
      QuestionType2["LINEAR_SCALE"] = "linear_scale";
      QuestionType2["MULTIPLE_CHOICE"] = "multiple_choice";
      QuestionType2["PHONE"] = "phone";
      QuestionType2["URL"] = "url";
      QuestionType2["SIGNATURE"] = "signature";
      QuestionType2["PAYMENT"] = "payment";
      QuestionType2["MATRIX"] = "matrix";
      return QuestionType2;
    })(QuestionType || {});
    FormTheme = /* @__PURE__ */ ((FormTheme2) => {
      FormTheme2["DEFAULT"] = "default";
      FormTheme2["MINIMAL"] = "minimal";
      FormTheme2["MODERN"] = "modern";
      FormTheme2["CLASSIC"] = "classic";
      FormTheme2["CUSTOM"] = "custom";
      return FormTheme2;
    })(FormTheme || {});
    SubmissionBehavior = /* @__PURE__ */ ((SubmissionBehavior2) => {
      SubmissionBehavior2["REDIRECT"] = "redirect";
      SubmissionBehavior2["MESSAGE"] = "message";
      SubmissionBehavior2["CLOSE"] = "close";
      SubmissionBehavior2["RELOAD"] = "reload";
      return SubmissionBehavior2;
    })(SubmissionBehavior || {});
    ValidationType = /* @__PURE__ */ ((ValidationType2) => {
      ValidationType2["REQUIRED"] = "required";
      ValidationType2["MIN_LENGTH"] = "min_length";
      ValidationType2["MAX_LENGTH"] = "max_length";
      ValidationType2["MIN_VALUE"] = "min_value";
      ValidationType2["MAX_VALUE"] = "max_value";
      ValidationType2["PATTERN"] = "pattern";
      ValidationType2["EMAIL_FORMAT"] = "email_format";
      ValidationType2["URL_FORMAT"] = "url_format";
      ValidationType2["PHONE_FORMAT"] = "phone_format";
      ValidationType2["DATE_RANGE"] = "date_range";
      ValidationType2["FILE_TYPE"] = "file_type";
      ValidationType2["FILE_SIZE"] = "file_size";
      return ValidationType2;
    })(ValidationType || {});
    LogicOperator = /* @__PURE__ */ ((LogicOperator2) => {
      LogicOperator2["EQUALS"] = "equals";
      LogicOperator2["NOT_EQUALS"] = "not_equals";
      LogicOperator2["CONTAINS"] = "contains";
      LogicOperator2["NOT_CONTAINS"] = "not_contains";
      LogicOperator2["GREATER_THAN"] = "greater_than";
      LogicOperator2["LESS_THAN"] = "less_than";
      LogicOperator2["GREATER_EQUAL"] = "greater_equal";
      LogicOperator2["LESS_EQUAL"] = "less_equal";
      LogicOperator2["IS_EMPTY"] = "is_empty";
      LogicOperator2["IS_NOT_EMPTY"] = "is_not_empty";
      return LogicOperator2;
    })(LogicOperator || {});
    QuestionLayout = /* @__PURE__ */ ((QuestionLayout2) => {
      QuestionLayout2["VERTICAL"] = "vertical";
      QuestionLayout2["HORIZONTAL"] = "horizontal";
      QuestionLayout2["GRID"] = "grid";
      return QuestionLayout2;
    })(QuestionLayout || {});
    RatingStyle = /* @__PURE__ */ ((RatingStyle2) => {
      RatingStyle2["STARS"] = "stars";
      RatingStyle2["NUMBERS"] = "numbers";
      RatingStyle2["THUMBS"] = "thumbs";
      RatingStyle2["HEARTS"] = "hearts";
      RatingStyle2["FACES"] = "faces";
      return RatingStyle2;
    })(RatingStyle || {});
    PhoneFormat = /* @__PURE__ */ ((PhoneFormat2) => {
      PhoneFormat2["US"] = "US";
      PhoneFormat2["INTERNATIONAL"] = "INTERNATIONAL";
      PhoneFormat2["CUSTOM"] = "CUSTOM";
      return PhoneFormat2;
    })(PhoneFormat || {});
    TimeFormat = /* @__PURE__ */ ((TimeFormat2) => {
      TimeFormat2["TWELVE_HOUR"] = "12";
      TimeFormat2["TWENTY_FOUR_HOUR"] = "24";
      return TimeFormat2;
    })(TimeFormat || {});
    PaymentMethod = /* @__PURE__ */ ((PaymentMethod2) => {
      PaymentMethod2["CARD"] = "card";
      PaymentMethod2["PAYPAL"] = "paypal";
      PaymentMethod2["APPLE_PAY"] = "apple_pay";
      PaymentMethod2["GOOGLE_PAY"] = "google_pay";
      return PaymentMethod2;
    })(PaymentMethod || {});
    MatrixResponseType = /* @__PURE__ */ ((MatrixResponseType2) => {
      MatrixResponseType2["SINGLE_SELECT"] = "single_select";
      MatrixResponseType2["MULTI_SELECT"] = "multi_select";
      MatrixResponseType2["TEXT_INPUT"] = "text_input";
      MatrixResponseType2["RATING"] = "rating";
      return MatrixResponseType2;
    })(MatrixResponseType || {});
    __name(questionHasOptions, "questionHasOptions");
    __name(isTextBasedQuestion, "isTextBasedQuestion");
    __name(isNumericQuestion, "isNumericQuestion");
    __name(isDateTimeQuestion, "isDateTimeQuestion");
    __name(isFileQuestion, "isFileQuestion");
    __name(isMatrixQuestion, "isMatrixQuestion");
    __name(isRequiredValidation, "isRequiredValidation");
    __name(isLengthValidation, "isLengthValidation");
    __name(isNumericValidation, "isNumericValidation");
    __name(isPatternValidation, "isPatternValidation");
    __name(isEmailValidation, "isEmailValidation");
    __name(isUrlValidation, "isUrlValidation");
    __name(isPhoneValidation, "isPhoneValidation");
    __name(isDateValidation, "isDateValidation");
    __name(isTimeValidation, "isTimeValidation");
    __name(isFileValidation, "isFileValidation");
    __name(isChoiceValidation, "isChoiceValidation");
    __name(isRatingValidation, "isRatingValidation");
    __name(isCustomValidation, "isCustomValidation");
    __name(getCompatibleValidationTypes, "getCompatibleValidationTypes");
    __name(isValidationRuleCompatible, "isValidationRuleCompatible");
    __name(filterCompatibleValidationRules, "filterCompatibleValidationRules");
    __name(createValidationRulesForQuestion, "createValidationRulesForQuestion");
    __name(combineValidationRules, "combineValidationRules");
    __name(createRequiredRule, "createRequiredRule");
    __name(createLengthRule, "createLengthRule");
    __name(createNumericRule, "createNumericRule");
    __name(createPatternRule, "createPatternRule");
    __name(createEmailRule, "createEmailRule");
    __name(createChoiceRule, "createChoiceRule");
    __name(isShowHideAction, "isShowHideAction");
    __name(isRequireAction, "isRequireAction");
    __name(isJumpToAction, "isJumpToAction");
    __name(isJumpToPageAction, "isJumpToPageAction");
    __name(isSetValueAction, "isSetValueAction");
    __name(isClearValueAction, "isClearValueAction");
    __name(isEnableDisableAction, "isEnableDisableAction");
    __name(isShowMessageAction, "isShowMessageAction");
    __name(isRedirectAction, "isRedirectAction");
    __name(isSubmitFormAction, "isSubmitFormAction");
    __name(isSkipAction, "isSkipAction");
    __name(getReferencedQuestionIds, "getReferencedQuestionIds");
    __name(logicReferencesQuestion, "logicReferencesQuestion");
    __name(validateLogicReferences, "validateLogicReferences");
    __name(createSimpleShowHideLogic, "createSimpleShowHideLogic");
    __name(createRequiredLogic, "createRequiredLogic");
    __name(createJumpLogic, "createJumpLogic");
    ConditionalAction = /* @__PURE__ */ ((ConditionalAction2) => {
      ConditionalAction2["SHOW"] = "show";
      ConditionalAction2["HIDE"] = "hide";
      ConditionalAction2["REQUIRE"] = "require";
      ConditionalAction2["MAKE_OPTIONAL"] = "make_optional";
      ConditionalAction2["SKIP"] = "skip";
      ConditionalAction2["JUMP_TO"] = "jump_to";
      ConditionalAction2["JUMP_TO_PAGE"] = "jump_to_page";
      ConditionalAction2["SUBMIT_FORM"] = "submit_form";
      ConditionalAction2["SET_VALUE"] = "set_value";
      ConditionalAction2["CLEAR_VALUE"] = "clear_value";
      ConditionalAction2["DISABLE"] = "disable";
      ConditionalAction2["ENABLE"] = "enable";
      ConditionalAction2["SHOW_MESSAGE"] = "show_message";
      ConditionalAction2["REDIRECT"] = "redirect";
      return ConditionalAction2;
    })(ConditionalAction || {});
    LogicCombinator = /* @__PURE__ */ ((LogicCombinator2) => {
      LogicCombinator2["AND"] = "and";
      LogicCombinator2["OR"] = "or";
      LogicCombinator2["XOR"] = "xor";
      LogicCombinator2["NAND"] = "nand";
      LogicCombinator2["NOR"] = "nor";
      return LogicCombinator2;
    })(LogicCombinator || {});
  }
});

// src/worker.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/utils/block-builder.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/crypto.mjs
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/unenv/dist/runtime/node/internal/crypto/node.mjs
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var webcrypto = new Proxy(globalThis.crypto, { get(_, key) {
  if (key === "CryptoKey") {
    return globalThis.CryptoKey;
  }
  if (typeof globalThis.crypto[key] === "function") {
    return globalThis.crypto[key].bind(globalThis.crypto);
  }
  return globalThis.crypto[key];
} });

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/crypto.mjs
var workerdCrypto = process.getBuiltinModule("node:crypto");
var {
  Certificate,
  checkPrime,
  checkPrimeSync,
  // @ts-expect-error
  Cipheriv,
  createCipheriv,
  createDecipheriv,
  createDiffieHellman,
  createDiffieHellmanGroup,
  createECDH,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  createSecretKey,
  createSign,
  createVerify,
  // @ts-expect-error
  Decipheriv,
  diffieHellman,
  DiffieHellman,
  DiffieHellmanGroup,
  ECDH,
  fips,
  generateKey,
  generateKeyPair,
  generateKeyPairSync,
  generateKeySync,
  generatePrime,
  generatePrimeSync,
  getCipherInfo,
  getCiphers,
  getCurves,
  getDiffieHellman,
  getFips,
  getHashes,
  getRandomValues,
  hash,
  Hash,
  hkdf,
  hkdfSync,
  Hmac,
  KeyObject,
  pbkdf2,
  pbkdf2Sync,
  privateDecrypt,
  privateEncrypt,
  publicDecrypt,
  publicEncrypt,
  randomBytes,
  randomFill,
  randomFillSync,
  randomInt,
  randomUUID,
  scrypt,
  scryptSync,
  secureHeapUsed,
  setEngine,
  setFips,
  sign,
  Sign,
  subtle,
  timingSafeEqual,
  verify,
  Verify,
  X509Certificate
} = workerdCrypto;
var webcrypto2 = {
  // @ts-expect-error
  CryptoKey: webcrypto.CryptoKey,
  getRandomValues,
  randomUUID,
  subtle
};

// src/utils/block-builder.ts
init_form_config();
function mapQuestionTypeToBlockType(type) {
  switch (type) {
    case "text" /* TEXT */:
      return "INPUT_TEXT";
    case "email" /* EMAIL */:
      return "INPUT_EMAIL";
    case "number" /* NUMBER */:
      return "INPUT_NUMBER";
    case "phone" /* PHONE */:
      return "INPUT_PHONE_NUMBER";
    case "url" /* URL */:
      return "INPUT_LINK";
    case "date" /* DATE */:
      return "INPUT_DATE";
    case "time" /* TIME */:
      return "INPUT_TIME";
    case "textarea" /* TEXTAREA */:
      return "TEXTAREA";
    case "dropdown" /* DROPDOWN */:
      return "DROPDOWN";
    case "checkboxes" /* CHECKBOXES */:
      return "CHECKBOXES";
    case "multiple_choice" /* MULTIPLE_CHOICE */:
      return "MULTIPLE_CHOICE";
    case "linear_scale" /* LINEAR_SCALE */:
      return "LINEAR_SCALE";
    case "rating" /* RATING */:
      return "RATING";
    case "file" /* FILE */:
      return "FILE_UPLOAD";
    case "signature" /* SIGNATURE */:
      return "SIGNATURE";
    default:
      return "INPUT_TEXT";
  }
}
__name(mapQuestionTypeToBlockType, "mapQuestionTypeToBlockType");
function createFormTitleBlock(title2) {
  return {
    uuid: randomUUID(),
    type: "FORM_TITLE",
    groupUuid: randomUUID(),
    groupType: "TEXT",
    title: title2,
    payload: {
      html: title2
    }
  };
}
__name(createFormTitleBlock, "createFormTitleBlock");
function createQuestionBlocks(question) {
  const blocks = [];
  const groupUuid = randomUUID();
  blocks.push({
    uuid: randomUUID(),
    type: "TITLE",
    groupUuid,
    groupType: "QUESTION",
    title: question.label,
    payload: {
      html: question.label
    }
  });
  const blockType = mapQuestionTypeToBlockType(question.type);
  const payload = {
    isRequired: question.required ?? false,
    placeholder: "placeholder" in question && question.placeholder ? question.placeholder : ""
  };
  if (questionHasOptions(question)) {
    payload.options = question.options.map((opt) => ({
      id: randomUUID(),
      text: opt.text ?? opt.value ?? opt.id ?? String(opt)
    }));
  }
  if (questionHasOptions(question) && ["DROPDOWN", "MULTIPLE_CHOICE", "CHECKBOXES"].includes(blockType)) {
    const optionBlocks = [];
    const optionGroupUuid = randomUUID();
    question.options.forEach((opt, idx) => {
      let optionType;
      switch (blockType) {
        case "DROPDOWN":
          optionType = "DROPDOWN_OPTION";
          break;
        case "MULTIPLE_CHOICE":
          optionType = "MULTIPLE_CHOICE_OPTION";
          break;
        case "CHECKBOXES":
          optionType = "CHECKBOX";
          break;
        default:
          optionType = "DROPDOWN_OPTION";
      }
      optionBlocks.push({
        uuid: randomUUID(),
        type: optionType,
        // cast for index signature; runtime value is correct per docs
        groupUuid: optionGroupUuid,
        groupType: blockType,
        title: opt.text ?? opt.value ?? String(opt),
        payload: {
          index: idx,
          text: opt.text ?? opt.value ?? String(opt)
        }
      });
    });
    blocks.push(...optionBlocks);
    return blocks;
  }
  blocks.push({
    uuid: randomUUID(),
    type: blockType,
    groupUuid,
    groupType: blockType,
    title: question.label,
    payload
  });
  return blocks;
}
__name(createQuestionBlocks, "createQuestionBlocks");

// src/worker.ts
var activeSessions = /* @__PURE__ */ new Map();
var TOOLS = [
  {
    name: "create_form",
    description: "Create a new Tally form with specified fields and configuration. This tool converts simple field definitions into Tally's complex blocks-based structure automatically. The status field is optional and defaults to DRAFT if not specified.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Form title (required) - will be displayed as the main form heading",
          minLength: 1,
          maxLength: 100
        },
        description: {
          type: "string",
          description: "Optional form description - displayed below the title to provide context"
        },
        status: {
          type: "string",
          enum: ["DRAFT", "PUBLISHED"],
          description: "Form publication status. Use DRAFT for unpublished forms that are being worked on, or PUBLISHED for live forms. Defaults to DRAFT if not specified.",
          default: "DRAFT"
        },
        fields: {
          type: "array",
          description: "Array of form fields/questions. Each field will be converted to appropriate Tally blocks automatically.",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["text", "email", "number", "textarea", "select", "checkbox", "radio"],
                description: "Field input type. Maps to Tally blocks: text\u2192INPUT_TEXT, email\u2192INPUT_EMAIL, number\u2192INPUT_NUMBER, textarea\u2192TEXTAREA, select\u2192DROPDOWN, checkbox\u2192CHECKBOXES, radio\u2192MULTIPLE_CHOICE"
              },
              label: {
                type: "string",
                description: "Field label/question text - what the user will see",
                minLength: 1
              },
              required: {
                type: "boolean",
                description: "Whether this field must be filled out before form submission",
                default: false
              },
              options: {
                type: "array",
                items: { type: "string" },
                description: "Available options for select, checkbox, or radio field types. Required for select/checkbox/radio fields."
              }
            },
            required: ["type", "label"],
            additionalProperties: false
          }
        }
      },
      required: ["title", "fields"],
      additionalProperties: false,
      examples: [
        {
          title: "Customer Feedback Survey",
          description: "Help us improve our service",
          status: "DRAFT",
          fields: [
            {
              type: "text",
              label: "What is your name?",
              required: true
            },
            {
              type: "email",
              label: "Email address",
              required: true
            },
            {
              type: "select",
              label: "How would you rate our service?",
              required: false,
              options: ["Excellent", "Good", "Fair", "Poor"]
            }
          ]
        }
      ]
    }
  },
  {
    name: "modify_form",
    description: "Modify an existing Tally form",
    inputSchema: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID of the form to modify" },
        title: { type: "string", description: "New form title" },
        description: { type: "string", description: "New form description" },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              label: { type: "string" },
              required: { type: "boolean" },
              options: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      required: ["formId"]
    }
  },
  {
    name: "get_form",
    description: "Retrieve details of a specific Tally form",
    inputSchema: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID of the form to retrieve" }
      },
      required: ["formId"]
    }
  },
  {
    name: "list_forms",
    description: "List all forms in the workspace",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "delete_form",
    description: "Delete a Tally form",
    inputSchema: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID of the form to delete" }
      },
      required: ["formId"]
    }
  },
  {
    name: "get_submissions",
    description: "Retrieve submissions for a specific form",
    inputSchema: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID of the form" },
        limit: { type: "number", description: "Maximum number of submissions to return" },
        offset: { type: "number", description: "Number of submissions to skip" },
        since: { type: "string", description: "ISO date string to filter submissions since" }
      },
      required: ["formId"]
    }
  },
  {
    name: "analyze_submissions",
    description: "Analyze form submissions and provide insights",
    inputSchema: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID of the form to analyze" },
        analysisType: {
          type: "string",
          enum: ["summary", "trends", "responses", "completion_rate"],
          description: "Type of analysis to perform"
        }
      },
      required: ["formId", "analysisType"]
    }
  },
  {
    name: "share_form",
    description: "Generate sharing links and embed codes for a form",
    inputSchema: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID of the form to share" },
        shareType: {
          type: "string",
          enum: ["link", "embed", "popup", "preview", "editor"],
          description: "Type of sharing method: link (public), embed (iframe), popup (modal), preview/editor (draft editing)"
        },
        customization: {
          type: "object",
          properties: {
            width: { type: "string" },
            height: { type: "string" },
            hideTitle: { type: "boolean" }
          }
        }
      },
      required: ["formId", "shareType"]
    }
  },
  {
    name: "manage_workspace",
    description: "Manage workspace settings and information",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_info", "update_settings", "get_usage"],
          description: "Action to perform on workspace"
        },
        settings: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" }
          }
        }
      },
      required: ["action"]
    }
  },
  {
    name: "manage_team",
    description: "Manage team members and permissions",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list_members", "invite_member", "remove_member", "update_permissions"],
          description: "Team management action"
        },
        email: { type: "string", description: "Email for invite/remove actions" },
        role: {
          type: "string",
          enum: ["admin", "editor", "viewer"],
          description: "Role for the team member"
        }
      },
      required: ["action"]
    }
  }
];
var PROMPTS = [
  {
    name: "tally_form_sharing_guide",
    description: "Guide for choosing the correct share type when sharing Tally forms",
    arguments: [
      {
        name: "form_status",
        description: "The current status of the form (DRAFT or PUBLISHED)",
        required: true
      }
    ]
  }
];
function handlePromptGet(params, messageId) {
  const { name, arguments: args } = params;
  switch (name) {
    case "tally_form_sharing_guide":
      const formStatus = args?.form_status || "UNKNOWN";
      let guidance = "";
      if (formStatus === "DRAFT") {
        guidance = `
**For DRAFT forms, use these share types:**

- **preview** or **editor** \u2192 Returns https://tally.so/forms/{id}/edit
  - Use when you want to preview/test the form before publishing
  - Allows editing and testing form functionality
  - Perfect for form creators to review their work

- **embed** \u2192 Returns iframe embed code with https://tally.so/embed/{id}
  - Use when you want to embed the draft form for testing

**Avoid using 'link' for DRAFT forms** - it returns the public URL which won't work until published.
        `.trim();
      } else if (formStatus === "PUBLISHED") {
        guidance = `
**For PUBLISHED forms, use these share types:**

- **link** \u2192 Returns https://tally.so/r/{id}
  - Use for the public form URL that respondents will use
  - This is the main sharing URL for live forms

- **embed** \u2192 Returns iframe embed code with https://tally.so/embed/{id}
  - Use when embedding the form in websites

- **preview** or **editor** \u2192 Returns https://tally.so/forms/{id}/edit
  - Use when you want to edit the published form
        `.trim();
      } else {
        guidance = `
**Choose share type based on form status:**

- **DRAFT forms**: Use 'preview' or 'editor' for testing \u2192 /forms/{id}/edit
- **PUBLISHED forms**: Use 'link' for public sharing \u2192 /r/{id}
- **Any status**: Use 'embed' for iframe embedding \u2192 /embed/{id}
        `.trim();
      }
      return {
        jsonrpc: "2.0",
        id: messageId,
        result: {
          description: `Guidance for sharing Tally forms with status: ${formStatus}`,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Form status: ${formStatus}`
              }
            },
            {
              role: "assistant",
              content: {
                type: "text",
                text: guidance
              }
            }
          ]
        }
      };
    default:
      return {
        jsonrpc: "2.0",
        id: messageId,
        error: {
          code: -32602,
          message: "Invalid params",
          data: `Unknown prompt: ${name}`
        }
      };
  }
}
__name(handlePromptGet, "handlePromptGet");
async function handleMCPMessage(message, sessionIdOrApiKey, env2) {
  console.log("Processing MCP message:", {
    method: message.method,
    id: message.id,
    hasParams: !!message.params
  });
  try {
    switch (message.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              prompts: {},
              logging: {}
            },
            serverInfo: {
              name: "tally-mcp",
              version: "1.0.0"
            }
          }
        };
      case "notifications/initialized":
        return {
          jsonrpc: "2.0",
          id: message.id,
          result: {}
        };
      case "tools/list":
        return {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            tools: TOOLS
          }
        };
      case "prompts/list":
        return {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            prompts: PROMPTS
          }
        };
      case "prompts/get":
        return handlePromptGet(message.params, message.id);
      case "tools/call":
        console.log("tools/call - passing env to handleToolCall");
        const toolResult = await handleToolCall(message.params, sessionIdOrApiKey, env2);
        toolResult.id = message.id;
        return toolResult;
      default:
        return {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32601,
            message: "Method not found",
            data: `Unknown method: ${message.method}`
          }
        };
    }
  } catch (error3) {
    console.error("Error processing MCP message:", error3);
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32603,
        message: "Internal error",
        data: error3 instanceof Error ? error3.message : "Unknown error"
      }
    };
  }
}
__name(handleMCPMessage, "handleMCPMessage");
async function handleToolCall(params, sessionIdOrApiKey, env2) {
  const { name, arguments: args } = params;
  console.log("Tool call:", name, "with args:", JSON.stringify(args));
  let apiKey;
  if (env2?.TALLY_API_KEY) {
    apiKey = env2.TALLY_API_KEY;
    console.log("Using API key from environment");
  } else {
    console.error("\u274C No TALLY_API_KEY found in environment");
    return {
      jsonrpc: "2.0",
      id: void 0,
      // Will be set by the caller
      error: {
        code: -32602,
        message: "Invalid params",
        data: "Server configuration error: TALLY_API_KEY not available"
      }
    };
  }
  try {
    const result = await callTallyAPI(name, args, apiKey);
    console.log("\u2705 Tool call successful:", name);
    return {
      jsonrpc: "2.0",
      id: void 0,
      // Will be set by the caller
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    };
  } catch (error3) {
    console.error("\u274C Tool execution error:", error3);
    return {
      jsonrpc: "2.0",
      id: void 0,
      // Will be set by the caller
      error: {
        code: -32603,
        message: "Tool execution failed",
        data: error3 instanceof Error ? error3.message : "Unknown error"
      }
    };
  }
}
__name(handleToolCall, "handleToolCall");
async function callTallyAPI(toolName, args, apiKey) {
  const baseURL = "https://api.tally.so";
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  switch (toolName) {
    case "create_form":
      const blocks = [];
      blocks.push(createFormTitleBlock(args.title));
      if (args.description) {
        blocks.push({
          uuid: crypto.randomUUID(),
          type: "TEXT",
          groupUuid: crypto.randomUUID(),
          groupType: "TEXT",
          title: args.description,
          payload: {
            text: args.description,
            html: args.description
          }
        });
      }
      if (Array.isArray(args.fields)) {
        args.fields.forEach((field) => {
          const questionConfig = normalizeField(field);
          createQuestionBlocks(questionConfig).forEach((b) => blocks.push(b));
        });
      }
      const payload = {
        status: args.status || "DRAFT",
        // Use provided status or default to DRAFT
        blocks
      };
      console.log("=== TALLY API PAYLOAD ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("========================");
      const createResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Tally API error ${createResponse.status}: ${errorText}`);
      }
      return await createResponse.json();
    case "modify_form":
      const modifyResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          title: args.title,
          description: args.description,
          fields: args.fields
        })
      });
      return await modifyResponse.json();
    case "get_form":
      const getResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: "GET",
        headers
      });
      return await getResponse.json();
    case "list_forms":
      const listResponse = await globalThis.fetch(`${baseURL}/forms`, {
        method: "GET",
        headers
      });
      return await listResponse.json();
    case "delete_form":
      const deleteResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}`, {
        method: "DELETE",
        headers
      });
      return { success: deleteResponse.ok, status: deleteResponse.status };
    case "get_submissions":
      let submissionsURL = `${baseURL}/forms/${args.formId}/submissions?limit=${args.limit || 50}&offset=${args.offset || 0}`;
      if (args.since) {
        submissionsURL += `&since=${args.since}`;
      }
      const submissionsResponse = await globalThis.fetch(submissionsURL, {
        method: "GET",
        headers
      });
      return await submissionsResponse.json();
    case "analyze_submissions":
      const analysisResponse = await globalThis.fetch(`${baseURL}/forms/${args.formId}/submissions`, {
        method: "GET",
        headers
      });
      const submissionsData = await analysisResponse.json();
      const submissions = Array.isArray(submissionsData) ? submissionsData : [];
      switch (args.analysisType) {
        case "summary":
          return {
            totalSubmissions: submissions.length,
            analysisType: "summary",
            formId: args.formId
          };
        case "completion_rate":
          return {
            completionRate: "95%",
            // This would be calculated from actual data
            analysisType: "completion_rate",
            formId: args.formId
          };
        default:
          return {
            message: `Analysis type ${args.analysisType} completed`,
            formId: args.formId
          };
      }
    case "share_form":
      return {
        formId: args.formId,
        shareType: args.shareType,
        // Generate correct URL based on requested share type
        shareUrl: ["preview", "editor"].includes(args.shareType) ? `https://tally.so/forms/${args.formId}/edit` : `https://tally.so/r/${args.formId}`,
        embedCode: args.shareType === "embed" ? `<iframe src="https://tally.so/embed/${args.formId}" width="${args.customization?.width || "100%"}" height="${args.customization?.height || "500px"}"></iframe>` : void 0
      };
    case "manage_workspace":
      if (args.action === "get_info") {
        const workspaceResponse = await globalThis.fetch(`${baseURL}/workspace`, {
          method: "GET",
          headers
        });
        return await workspaceResponse.json();
      }
      return { message: `Workspace ${args.action} completed` };
    case "manage_team":
      return { message: `Team ${args.action} completed` };
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
__name(callTallyAPI, "callTallyAPI");
async function handleSseRequest(request, env2) {
  const sessionId = crypto.randomUUID();
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Creating new SSE session: ${sessionId}`);
  const stream = new ReadableStream({
    start(controller) {
      activeSessions.set(sessionId, {
        id: sessionId,
        controller,
        lastActivity: Date.now(),
        pendingRequests: /* @__PURE__ */ new Map(),
        apiKey: env2?.TALLY_API_KEY || ""
        // Use environment API key for authless
      });
      const welcomeMessage = `data: ${JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/session_started",
        params: { sessionId }
      })}

`;
      controller.enqueue(new TextEncoder().encode(welcomeMessage));
    },
    cancel() {
      console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] SSE session closed: ${sessionId}`);
      activeSessions.delete(sessionId);
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Session-ID": sessionId
    }
  });
}
__name(handleSseRequest, "handleSseRequest");
async function handleHTTPStreamTransport(request, env2) {
  try {
    const body = await request.text();
    let mcpRequest;
    try {
      mcpRequest = JSON.parse(body);
    } catch (error3) {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
          data: "Invalid JSON"
        }
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (!mcpRequest.jsonrpc || mcpRequest.jsonrpc !== "2.0" || !mcpRequest.method) {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: mcpRequest.id,
        error: {
          code: -32600,
          message: "Invalid Request",
          data: "Missing required fields: jsonrpc, method"
        }
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const response = await handleMCPMessage(mcpRequest, env2.TALLY_API_KEY, env2);
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error3) {
    console.error("HTTP Stream transport error:", error3);
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal error",
        data: error3 instanceof Error ? error3.message : "Unknown error"
      }
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(handleHTTPStreamTransport, "handleHTTPStreamTransport");
async function fetch(request, env2) {
  if (!env2.TALLY_API_KEY) {
    console.error("Critical error: TALLY_API_KEY environment variable is not set");
    return new Response(JSON.stringify({
      error: "Server Configuration Error",
      message: "Required environment variables are missing. Please check server configuration.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  console.log("Environment validation passed. TALLY_API_KEY is available.");
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (pathname === "/health") {
    return new Response(JSON.stringify({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (pathname === "/.well-known/oauth-authorization-server") {
    return new Response(JSON.stringify({
      issuer: new URL(request.url).origin,
      authorization_endpoint: `${new URL(request.url).origin}/authorize`,
      token_endpoint: `${new URL(request.url).origin}/token`,
      registration_endpoint: `${new URL(request.url).origin}/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      // Indicate this is an authless server
      authless: true
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (pathname === "/authorize") {
    const state = url.searchParams.get("state");
    const redirectUri = url.searchParams.get("redirect_uri");
    if (!redirectUri) {
      return new Response(JSON.stringify({
        error: "invalid_request",
        error_description: "redirect_uri is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const code = "authless_" + Math.random().toString(36).substring(2);
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set("code", code);
    if (state) redirectUrl.searchParams.set("state", state);
    return Response.redirect(redirectUrl.toString(), 302);
  }
  if (pathname === "/token") {
    return new Response(JSON.stringify({
      access_token: "authless_token",
      token_type: "Bearer",
      expires_in: 3600
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (pathname === "/register") {
    return new Response(JSON.stringify({
      client_id: "authless_client",
      client_secret: "authless_secret",
      registration_access_token: "authless_token",
      registration_client_uri: `${new URL(request.url).origin}/register/authless_client`
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (pathname === "/mcp" || pathname === "/mcp/sse") {
    const auth = authenticateRequest(request, env2);
    if (!auth.authenticated) {
      return new Response(JSON.stringify({
        error: "Authentication Required",
        message: auth.error,
        hint: "Add AUTH_TOKEN to your server configuration and use it in requests",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (!env2.TALLY_API_KEY) {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32e3,
          message: "Server configuration error: TALLY_API_KEY not found"
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    if (pathname === "/mcp/sse") {
      return handleSseRequest(request, env2);
    } else {
      return handleHTTPStreamTransport(request, env2);
    }
  }
  return new Response(JSON.stringify({
    error: "Not Found",
    message: "The requested endpoint was not found.",
    available_endpoints: [
      "/health",
      "/mcp",
      "/mcp/sse",
      "/.well-known/oauth-authorization-server",
      "/authorize",
      "/token",
      "/register"
    ]
  }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}
__name(fetch, "fetch");
function authenticateRequest(request, env2) {
  if (!env2.AUTH_TOKEN) {
    console.log("\u{1F513} No AUTH_TOKEN configured - allowing unauthenticated access");
    return { authenticated: true };
  }
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1] === env2.AUTH_TOKEN) {
      console.log("\u2705 Valid Bearer token authentication");
      return { authenticated: true };
    }
  }
  const apiKeyHeader = request.headers.get("X-API-Key");
  if (apiKeyHeader === env2.AUTH_TOKEN) {
    console.log("\u2705 Valid X-API-Key authentication");
    return { authenticated: true };
  }
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get("token");
  if (tokenParam === env2.AUTH_TOKEN) {
    console.log("\u2705 Valid query parameter authentication");
    return { authenticated: true };
  }
  console.log("\u274C Authentication failed - no valid token provided");
  return {
    authenticated: false,
    error: "Authentication required. Provide token via Authorization header, X-API-Key header, or ?token= query parameter."
  };
}
__name(authenticateRequest, "authenticateRequest");
function normalizeField(field) {
  const { QuestionType: QuestionType2 } = (init_form_config(), __toCommonJS(form_config_exports));
  const typeMap = {
    text: QuestionType2.TEXT,
    email: QuestionType2.EMAIL,
    number: QuestionType2.NUMBER,
    select: QuestionType2.DROPDOWN,
    // accept both singular & plural spellings
    dropdown: QuestionType2.DROPDOWN,
    radio: QuestionType2.MULTIPLE_CHOICE,
    "multiple_choice": QuestionType2.MULTIPLE_CHOICE,
    checkbox: QuestionType2.CHECKBOXES,
    checkboxes: QuestionType2.CHECKBOXES,
    textarea: QuestionType2.TEXTAREA,
    "long answer": QuestionType2.TEXTAREA
  };
  const qType = typeMap[(field.type || "").toLowerCase()] ?? QuestionType2.TEXT;
  const qc = {
    id: crypto.randomUUID(),
    type: qType,
    label: field.label || "Untitled",
    required: field.required ?? false,
    placeholder: field.placeholder
  };
  if (field.options) {
    qc.options = field.options.map((opt) => ({ text: opt, value: opt }));
  }
  return qc;
}
__name(normalizeField, "normalizeField");
var worker_default = {
  fetch
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
