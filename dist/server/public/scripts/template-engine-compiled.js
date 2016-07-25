"use strict";var _typeof2=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){(function(process,__filename){ /** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 1.0.0 Copyright (c) 2011-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */ /*jslint node: true */ /*global module, process */'use strict'; /**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */function amdefine(module,requireFn){'use strict';var defineCache={},loaderCache={},alreadyCalled=false,path=require('path'),makeRequire,_stringRequire; /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */function trimDots(ary){var i,part;for(i=0;ary[i];i+=1){part=ary[i];if(part==='.'){ary.splice(i,1);i-=1;}else if(part==='..'){if(i===1&&(ary[2]==='..'||ary[0]==='..')){ //End of the line. Keep at least one non-dot
//path segment at the front so it can be mapped
//correctly to disk. Otherwise, there is likely
//no path mapping for a path starting with '..'.
//This can still fail, but catches the most reasonable
//uses of ..
break;}else if(i>0){ary.splice(i-1,2);i-=2;}}}}function normalize(name,baseName){var baseParts; //Adjust any relative paths.
if(name&&name.charAt(0)==='.'){ //If have a base name, try to normalize against it,
//otherwise, assume it is a top-level require that will
//be relative to baseUrl in the end.
if(baseName){baseParts=baseName.split('/');baseParts=baseParts.slice(0,baseParts.length-1);baseParts=baseParts.concat(name.split('/'));trimDots(baseParts);name=baseParts.join('/');}}return name;} /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */function makeNormalize(relName){return function(name){return normalize(name,relName);};}function makeLoad(id){function load(value){loaderCache[id]=value;}load.fromText=function(id,text){ //This one is difficult because the text can/probably uses
//define, and any relative paths and requires should be relative
//to that id was it would be found on disk. But this would require
//bootstrapping a module/require fairly deeply from node core.
//Not sure how best to go about that yet.
throw new Error('amdefine does not implement load.fromText');};return load;}makeRequire=function makeRequire(systemRequire,exports,module,relId){function amdRequire(deps,callback){if(typeof deps==='string'){ //Synchronous, single module require('')
return _stringRequire(systemRequire,exports,module,deps,relId);}else { //Array of dependencies with a callback.
//Convert the dependencies to modules.
deps=deps.map(function(depName){return _stringRequire(systemRequire,exports,module,depName,relId);}); //Wait for next tick to call back the require call.
if(callback){process.nextTick(function(){callback.apply(null,deps);});}}}amdRequire.toUrl=function(filePath){if(filePath.indexOf('.')===0){return normalize(filePath,path.dirname(module.filename));}else {return filePath;}};return amdRequire;}; //Favor explicit value, passed in if the module wants to support Node 0.4.
requireFn=requireFn||function req(){return module.require.apply(module,arguments);};function runFactory(id,deps,factory){var r,e,m,result;if(id){e=loaderCache[id]={};m={id:id,uri:__filename,exports:e};r=makeRequire(requireFn,e,m,id);}else { //Only support one define call per file
if(alreadyCalled){throw new Error('amdefine with no module ID cannot be called more than once per file.');}alreadyCalled=true; //Use the real variables from node
//Use module.exports for exports, since
//the exports in here is amdefine exports.
e=module.exports;m=module;r=makeRequire(requireFn,e,m,module.id);} //If there are dependencies, they are strings, so need
//to convert them to dependency values.
if(deps){deps=deps.map(function(depName){return r(depName);});} //Call the factory with the right dependencies.
if(typeof factory==='function'){result=factory.apply(m.exports,deps);}else {result=factory;}if(result!==undefined){m.exports=result;if(id){loaderCache[id]=m.exports;}}}_stringRequire=function stringRequire(systemRequire,exports,module,id,relId){ //Split the ID by a ! so that
var index=id.indexOf('!'),originalId=id,prefix,plugin;if(index===-1){id=normalize(id,relId); //Straight module lookup. If it is one of the special dependencies,
//deal with it, otherwise, delegate to node.
if(id==='require'){return makeRequire(systemRequire,exports,module,relId);}else if(id==='exports'){return exports;}else if(id==='module'){return module;}else if(loaderCache.hasOwnProperty(id)){return loaderCache[id];}else if(defineCache[id]){runFactory.apply(null,defineCache[id]);return loaderCache[id];}else {if(systemRequire){return systemRequire(originalId);}else {throw new Error('No module with ID: '+id);}}}else { //There is a plugin in play.
prefix=id.substring(0,index);id=id.substring(index+1,id.length);plugin=_stringRequire(systemRequire,exports,module,prefix,relId);if(plugin.normalize){id=plugin.normalize(id,makeNormalize(relId));}else { //Normalize the ID normally.
id=normalize(id,relId);}if(loaderCache[id]){return loaderCache[id];}else {plugin.load(id,makeRequire(systemRequire,exports,module,relId),makeLoad(id),{});return loaderCache[id];}}}; //Create a define function specific to the module asking for amdefine.
function define(id,deps,factory){if(Array.isArray(id)){factory=deps;deps=id;id=undefined;}else if(typeof id!=='string'){factory=id;id=deps=undefined;}if(deps&&!Array.isArray(deps)){factory=deps;deps=undefined;}if(!deps){deps=['require','exports','module'];} //Set up properties for this module. If an ID, then use
//internal cache. If no ID, then use the external variables
//for this node module.
if(id){ //Put the module in deep freeze until there is a
//require call for it.
defineCache[id]=[id,deps,factory];}else {runFactory(id,deps,factory);}} //define.require, which has access to all the values in the
//cache. Useful for AMD modules that all have IDs in the file,
//but need to finally export a value to node based on one of those
//IDs.
define.require=function(id){if(loaderCache[id]){return loaderCache[id];}if(defineCache[id]){runFactory.apply(null,defineCache[id]);return loaderCache[id];}};define.amd={};return define;}module.exports=amdefine;}).call(this,require('_process'),"/node_modules/amdefine/amdefine.js");},{"_process":38,"path":37}],2:[function(require,module,exports){},{}],3:[function(require,module,exports){(function(process,global){ /*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.1.2
 */(function(){"use strict";function lib$es6$promise$utils$$objectOrFunction(x){return typeof x==='function'||(typeof x==="undefined"?"undefined":_typeof2(x))==='object'&&x!==null;}function lib$es6$promise$utils$$isFunction(x){return typeof x==='function';}function lib$es6$promise$utils$$isMaybeThenable(x){return (typeof x==="undefined"?"undefined":_typeof2(x))==='object'&&x!==null;}var lib$es6$promise$utils$$_isArray;if(!Array.isArray){lib$es6$promise$utils$$_isArray=function lib$es6$promise$utils$$_isArray(x){return Object.prototype.toString.call(x)==='[object Array]';};}else {lib$es6$promise$utils$$_isArray=Array.isArray;}var lib$es6$promise$utils$$isArray=lib$es6$promise$utils$$_isArray;var lib$es6$promise$asap$$len=0;var lib$es6$promise$asap$$vertxNext;var lib$es6$promise$asap$$customSchedulerFn;var lib$es6$promise$asap$$asap=function asap(callback,arg){lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len]=callback;lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len+1]=arg;lib$es6$promise$asap$$len+=2;if(lib$es6$promise$asap$$len===2){ // If len is 2, that means that we need to schedule an async flush.
// If additional callbacks are queued before the queue is flushed, they
// will be processed by this flush that we are scheduling.
if(lib$es6$promise$asap$$customSchedulerFn){lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);}else {lib$es6$promise$asap$$scheduleFlush();}}};function lib$es6$promise$asap$$setScheduler(scheduleFn){lib$es6$promise$asap$$customSchedulerFn=scheduleFn;}function lib$es6$promise$asap$$setAsap(asapFn){lib$es6$promise$asap$$asap=asapFn;}var lib$es6$promise$asap$$browserWindow=typeof window!=='undefined'?window:undefined;var lib$es6$promise$asap$$browserGlobal=lib$es6$promise$asap$$browserWindow||{};var lib$es6$promise$asap$$BrowserMutationObserver=lib$es6$promise$asap$$browserGlobal.MutationObserver||lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;var lib$es6$promise$asap$$isNode=typeof process!=='undefined'&&{}.toString.call(process)==='[object process]'; // test for web worker but not in IE10
var lib$es6$promise$asap$$isWorker=typeof Uint8ClampedArray!=='undefined'&&typeof importScripts!=='undefined'&&typeof MessageChannel!=='undefined'; // node
function lib$es6$promise$asap$$useNextTick(){ // node version 0.10.x displays a deprecation warning when nextTick is used recursively
// see https://github.com/cujojs/when/issues/410 for details
return function(){process.nextTick(lib$es6$promise$asap$$flush);};} // vertx
function lib$es6$promise$asap$$useVertxTimer(){return function(){lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);};}function lib$es6$promise$asap$$useMutationObserver(){var iterations=0;var observer=new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);var node=document.createTextNode('');observer.observe(node,{characterData:true});return function(){node.data=iterations=++iterations%2;};} // web worker
function lib$es6$promise$asap$$useMessageChannel(){var channel=new MessageChannel();channel.port1.onmessage=lib$es6$promise$asap$$flush;return function(){channel.port2.postMessage(0);};}function lib$es6$promise$asap$$useSetTimeout(){return function(){setTimeout(lib$es6$promise$asap$$flush,1);};}var lib$es6$promise$asap$$queue=new Array(1000);function lib$es6$promise$asap$$flush(){for(var i=0;i<lib$es6$promise$asap$$len;i+=2){var callback=lib$es6$promise$asap$$queue[i];var arg=lib$es6$promise$asap$$queue[i+1];callback(arg);lib$es6$promise$asap$$queue[i]=undefined;lib$es6$promise$asap$$queue[i+1]=undefined;}lib$es6$promise$asap$$len=0;}function lib$es6$promise$asap$$attemptVertx(){try{var r=require;var vertx=r('vertx');lib$es6$promise$asap$$vertxNext=vertx.runOnLoop||vertx.runOnContext;return lib$es6$promise$asap$$useVertxTimer();}catch(e){return lib$es6$promise$asap$$useSetTimeout();}}var lib$es6$promise$asap$$scheduleFlush; // Decide what async method to use to triggering processing of queued callbacks:
if(lib$es6$promise$asap$$isNode){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useNextTick();}else if(lib$es6$promise$asap$$BrowserMutationObserver){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useMutationObserver();}else if(lib$es6$promise$asap$$isWorker){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useMessageChannel();}else if(lib$es6$promise$asap$$browserWindow===undefined&&typeof require==='function'){lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$attemptVertx();}else {lib$es6$promise$asap$$scheduleFlush=lib$es6$promise$asap$$useSetTimeout();}function lib$es6$promise$then$$then(onFulfillment,onRejection){var parent=this;var state=parent._state;if(state===lib$es6$promise$$internal$$FULFILLED&&!onFulfillment||state===lib$es6$promise$$internal$$REJECTED&&!onRejection){return this;}var child=new this.constructor(lib$es6$promise$$internal$$noop);var result=parent._result;if(state){var callback=arguments[state-1];lib$es6$promise$asap$$asap(function(){lib$es6$promise$$internal$$invokeCallback(state,child,callback,result);});}else {lib$es6$promise$$internal$$subscribe(parent,child,onFulfillment,onRejection);}return child;}var lib$es6$promise$then$$default=lib$es6$promise$then$$then;function lib$es6$promise$promise$resolve$$resolve(object){ /*jshint validthis:true */var Constructor=this;if(object&&(typeof object==="undefined"?"undefined":_typeof2(object))==='object'&&object.constructor===Constructor){return object;}var promise=new Constructor(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$resolve(promise,object);return promise;}var lib$es6$promise$promise$resolve$$default=lib$es6$promise$promise$resolve$$resolve;function lib$es6$promise$$internal$$noop(){}var lib$es6$promise$$internal$$PENDING=void 0;var lib$es6$promise$$internal$$FULFILLED=1;var lib$es6$promise$$internal$$REJECTED=2;var lib$es6$promise$$internal$$GET_THEN_ERROR=new lib$es6$promise$$internal$$ErrorObject();function lib$es6$promise$$internal$$selfFulfillment(){return new TypeError("You cannot resolve a promise with itself");}function lib$es6$promise$$internal$$cannotReturnOwn(){return new TypeError('A promises callback cannot return that same promise.');}function lib$es6$promise$$internal$$getThen(promise){try{return promise.then;}catch(error){lib$es6$promise$$internal$$GET_THEN_ERROR.error=error;return lib$es6$promise$$internal$$GET_THEN_ERROR;}}function lib$es6$promise$$internal$$tryThen(then,value,fulfillmentHandler,rejectionHandler){try{then.call(value,fulfillmentHandler,rejectionHandler);}catch(e){return e;}}function lib$es6$promise$$internal$$handleForeignThenable(promise,thenable,then){lib$es6$promise$asap$$asap(function(promise){var sealed=false;var error=lib$es6$promise$$internal$$tryThen(then,thenable,function(value){if(sealed){return;}sealed=true;if(thenable!==value){lib$es6$promise$$internal$$resolve(promise,value);}else {lib$es6$promise$$internal$$fulfill(promise,value);}},function(reason){if(sealed){return;}sealed=true;lib$es6$promise$$internal$$reject(promise,reason);},'Settle: '+(promise._label||' unknown promise'));if(!sealed&&error){sealed=true;lib$es6$promise$$internal$$reject(promise,error);}},promise);}function lib$es6$promise$$internal$$handleOwnThenable(promise,thenable){if(thenable._state===lib$es6$promise$$internal$$FULFILLED){lib$es6$promise$$internal$$fulfill(promise,thenable._result);}else if(thenable._state===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,thenable._result);}else {lib$es6$promise$$internal$$subscribe(thenable,undefined,function(value){lib$es6$promise$$internal$$resolve(promise,value);},function(reason){lib$es6$promise$$internal$$reject(promise,reason);});}}function lib$es6$promise$$internal$$handleMaybeThenable(promise,maybeThenable,then){if(maybeThenable.constructor===promise.constructor&&then===lib$es6$promise$then$$default&&constructor.resolve===lib$es6$promise$promise$resolve$$default){lib$es6$promise$$internal$$handleOwnThenable(promise,maybeThenable);}else {if(then===lib$es6$promise$$internal$$GET_THEN_ERROR){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$GET_THEN_ERROR.error);}else if(then===undefined){lib$es6$promise$$internal$$fulfill(promise,maybeThenable);}else if(lib$es6$promise$utils$$isFunction(then)){lib$es6$promise$$internal$$handleForeignThenable(promise,maybeThenable,then);}else {lib$es6$promise$$internal$$fulfill(promise,maybeThenable);}}}function lib$es6$promise$$internal$$resolve(promise,value){if(promise===value){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$selfFulfillment());}else if(lib$es6$promise$utils$$objectOrFunction(value)){lib$es6$promise$$internal$$handleMaybeThenable(promise,value,lib$es6$promise$$internal$$getThen(value));}else {lib$es6$promise$$internal$$fulfill(promise,value);}}function lib$es6$promise$$internal$$publishRejection(promise){if(promise._onerror){promise._onerror(promise._result);}lib$es6$promise$$internal$$publish(promise);}function lib$es6$promise$$internal$$fulfill(promise,value){if(promise._state!==lib$es6$promise$$internal$$PENDING){return;}promise._result=value;promise._state=lib$es6$promise$$internal$$FULFILLED;if(promise._subscribers.length!==0){lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish,promise);}}function lib$es6$promise$$internal$$reject(promise,reason){if(promise._state!==lib$es6$promise$$internal$$PENDING){return;}promise._state=lib$es6$promise$$internal$$REJECTED;promise._result=reason;lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection,promise);}function lib$es6$promise$$internal$$subscribe(parent,child,onFulfillment,onRejection){var subscribers=parent._subscribers;var length=subscribers.length;parent._onerror=null;subscribers[length]=child;subscribers[length+lib$es6$promise$$internal$$FULFILLED]=onFulfillment;subscribers[length+lib$es6$promise$$internal$$REJECTED]=onRejection;if(length===0&&parent._state){lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish,parent);}}function lib$es6$promise$$internal$$publish(promise){var subscribers=promise._subscribers;var settled=promise._state;if(subscribers.length===0){return;}var child,callback,detail=promise._result;for(var i=0;i<subscribers.length;i+=3){child=subscribers[i];callback=subscribers[i+settled];if(child){lib$es6$promise$$internal$$invokeCallback(settled,child,callback,detail);}else {callback(detail);}}promise._subscribers.length=0;}function lib$es6$promise$$internal$$ErrorObject(){this.error=null;}var lib$es6$promise$$internal$$TRY_CATCH_ERROR=new lib$es6$promise$$internal$$ErrorObject();function lib$es6$promise$$internal$$tryCatch(callback,detail){try{return callback(detail);}catch(e){lib$es6$promise$$internal$$TRY_CATCH_ERROR.error=e;return lib$es6$promise$$internal$$TRY_CATCH_ERROR;}}function lib$es6$promise$$internal$$invokeCallback(settled,promise,callback,detail){var hasCallback=lib$es6$promise$utils$$isFunction(callback),value,error,succeeded,failed;if(hasCallback){value=lib$es6$promise$$internal$$tryCatch(callback,detail);if(value===lib$es6$promise$$internal$$TRY_CATCH_ERROR){failed=true;error=value.error;value=null;}else {succeeded=true;}if(promise===value){lib$es6$promise$$internal$$reject(promise,lib$es6$promise$$internal$$cannotReturnOwn());return;}}else {value=detail;succeeded=true;}if(promise._state!==lib$es6$promise$$internal$$PENDING){ // noop
}else if(hasCallback&&succeeded){lib$es6$promise$$internal$$resolve(promise,value);}else if(failed){lib$es6$promise$$internal$$reject(promise,error);}else if(settled===lib$es6$promise$$internal$$FULFILLED){lib$es6$promise$$internal$$fulfill(promise,value);}else if(settled===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,value);}}function lib$es6$promise$$internal$$initializePromise(promise,resolver){try{resolver(function resolvePromise(value){lib$es6$promise$$internal$$resolve(promise,value);},function rejectPromise(reason){lib$es6$promise$$internal$$reject(promise,reason);});}catch(e){lib$es6$promise$$internal$$reject(promise,e);}}function lib$es6$promise$promise$all$$all(entries){return new lib$es6$promise$enumerator$$default(this,entries).promise;}var lib$es6$promise$promise$all$$default=lib$es6$promise$promise$all$$all;function lib$es6$promise$promise$race$$race(entries){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$es6$promise$$internal$$noop);if(!lib$es6$promise$utils$$isArray(entries)){lib$es6$promise$$internal$$reject(promise,new TypeError('You must pass an array to race.'));return promise;}var length=entries.length;function onFulfillment(value){lib$es6$promise$$internal$$resolve(promise,value);}function onRejection(reason){lib$es6$promise$$internal$$reject(promise,reason);}for(var i=0;promise._state===lib$es6$promise$$internal$$PENDING&&i<length;i++){lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]),undefined,onFulfillment,onRejection);}return promise;}var lib$es6$promise$promise$race$$default=lib$es6$promise$promise$race$$race;function lib$es6$promise$promise$reject$$reject(reason){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$reject(promise,reason);return promise;}var lib$es6$promise$promise$reject$$default=lib$es6$promise$promise$reject$$reject;var lib$es6$promise$promise$$counter=0;function lib$es6$promise$promise$$needsResolver(){throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');}function lib$es6$promise$promise$$needsNew(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");}var lib$es6$promise$promise$$default=lib$es6$promise$promise$$Promise; /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */function lib$es6$promise$promise$$Promise(resolver){this._id=lib$es6$promise$promise$$counter++;this._state=undefined;this._result=undefined;this._subscribers=[];if(lib$es6$promise$$internal$$noop!==resolver){typeof resolver!=='function'&&lib$es6$promise$promise$$needsResolver();this instanceof lib$es6$promise$promise$$Promise?lib$es6$promise$$internal$$initializePromise(this,resolver):lib$es6$promise$promise$$needsNew();}}lib$es6$promise$promise$$Promise.all=lib$es6$promise$promise$all$$default;lib$es6$promise$promise$$Promise.race=lib$es6$promise$promise$race$$default;lib$es6$promise$promise$$Promise.resolve=lib$es6$promise$promise$resolve$$default;lib$es6$promise$promise$$Promise.reject=lib$es6$promise$promise$reject$$default;lib$es6$promise$promise$$Promise._setScheduler=lib$es6$promise$asap$$setScheduler;lib$es6$promise$promise$$Promise._setAsap=lib$es6$promise$asap$$setAsap;lib$es6$promise$promise$$Promise._asap=lib$es6$promise$asap$$asap;lib$es6$promise$promise$$Promise.prototype={constructor:lib$es6$promise$promise$$Promise, /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */then:lib$es6$promise$then$$default, /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */'catch':function _catch(onRejection){return this.then(null,onRejection);}};var lib$es6$promise$enumerator$$default=lib$es6$promise$enumerator$$Enumerator;function lib$es6$promise$enumerator$$Enumerator(Constructor,input){this._instanceConstructor=Constructor;this.promise=new Constructor(lib$es6$promise$$internal$$noop);if(Array.isArray(input)){this._input=input;this.length=input.length;this._remaining=input.length;this._result=new Array(this.length);if(this.length===0){lib$es6$promise$$internal$$fulfill(this.promise,this._result);}else {this.length=this.length||0;this._enumerate();if(this._remaining===0){lib$es6$promise$$internal$$fulfill(this.promise,this._result);}}}else {lib$es6$promise$$internal$$reject(this.promise,this._validationError());}}lib$es6$promise$enumerator$$Enumerator.prototype._validationError=function(){return new Error('Array Methods must be provided an Array');};lib$es6$promise$enumerator$$Enumerator.prototype._enumerate=function(){var length=this.length;var input=this._input;for(var i=0;this._state===lib$es6$promise$$internal$$PENDING&&i<length;i++){this._eachEntry(input[i],i);}};lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry=function(entry,i){var c=this._instanceConstructor;var resolve=c.resolve;if(resolve===lib$es6$promise$promise$resolve$$default){var then=lib$es6$promise$$internal$$getThen(entry);if(then===lib$es6$promise$then$$default&&entry._state!==lib$es6$promise$$internal$$PENDING){this._settledAt(entry._state,i,entry._result);}else if(typeof then!=='function'){this._remaining--;this._result[i]=entry;}else if(c===lib$es6$promise$promise$$default){var promise=new c(lib$es6$promise$$internal$$noop);lib$es6$promise$$internal$$handleMaybeThenable(promise,entry,then);this._willSettleAt(promise,i);}else {this._willSettleAt(new c(function(resolve){resolve(entry);}),i);}}else {this._willSettleAt(resolve(entry),i);}};lib$es6$promise$enumerator$$Enumerator.prototype._settledAt=function(state,i,value){var promise=this.promise;if(promise._state===lib$es6$promise$$internal$$PENDING){this._remaining--;if(state===lib$es6$promise$$internal$$REJECTED){lib$es6$promise$$internal$$reject(promise,value);}else {this._result[i]=value;}}if(this._remaining===0){lib$es6$promise$$internal$$fulfill(promise,this._result);}};lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt=function(promise,i){var enumerator=this;lib$es6$promise$$internal$$subscribe(promise,undefined,function(value){enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED,i,value);},function(reason){enumerator._settledAt(lib$es6$promise$$internal$$REJECTED,i,reason);});};function lib$es6$promise$polyfill$$polyfill(){var local;if(typeof global!=='undefined'){local=global;}else if(typeof self!=='undefined'){local=self;}else {try{local=Function('return this')();}catch(e){throw new Error('polyfill failed because global object is unavailable in this environment');}}var P=local.Promise;if(P&&Object.prototype.toString.call(P.resolve())==='[object Promise]'&&!P.cast){return;}local.Promise=lib$es6$promise$promise$$default;}var lib$es6$promise$polyfill$$default=lib$es6$promise$polyfill$$polyfill;var lib$es6$promise$umd$$ES6Promise={'Promise':lib$es6$promise$promise$$default,'polyfill':lib$es6$promise$polyfill$$default}; /* global define:true module:true window: true */if(typeof define==='function'&&define['amd']){define(function(){return lib$es6$promise$umd$$ES6Promise;});}else if(typeof module!=='undefined'&&module['exports']){module['exports']=lib$es6$promise$umd$$ES6Promise;}else if(typeof this!=='undefined'){this['ES6Promise']=lib$es6$promise$umd$$ES6Promise;}lib$es6$promise$polyfill$$default();}).call(this);}).call(this,require('_process'),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"_process":38}],4:[function(require,module,exports){'use strict';var hasOwn=Object.prototype.hasOwnProperty;var toStr=Object.prototype.toString;var isArray=function isArray(arr){if(typeof Array.isArray==='function'){return Array.isArray(arr);}return toStr.call(arr)==='[object Array]';};var isPlainObject=function isPlainObject(obj){if(!obj||toStr.call(obj)!=='[object Object]'){return false;}var hasOwnConstructor=hasOwn.call(obj,'constructor');var hasIsPrototypeOf=obj.constructor&&obj.constructor.prototype&&hasOwn.call(obj.constructor.prototype,'isPrototypeOf'); // Not own constructor property must be Object
if(obj.constructor&&!hasOwnConstructor&&!hasIsPrototypeOf){return false;} // Own properties are enumerated firstly, so to speed up,
// if last one is own, then all properties are own.
var key;for(key in obj){ /**/}return typeof key==='undefined'||hasOwn.call(obj,key);};module.exports=function extend(){var options,name,src,copy,copyIsArray,clone,target=arguments[0],i=1,length=arguments.length,deep=false; // Handle a deep copy situation
if(typeof target==='boolean'){deep=target;target=arguments[1]||{}; // skip the boolean and the target
i=2;}else if((typeof target==="undefined"?"undefined":_typeof2(target))!=='object'&&typeof target!=='function'||target==null){target={};}for(;i<length;++i){options=arguments[i]; // Only deal with non-null/undefined values
if(options!=null){ // Extend the base object
for(name in options){src=target[name];copy=options[name]; // Prevent never-ending loop
if(target!==copy){ // Recurse if we're merging plain objects or arrays
if(deep&&copy&&(isPlainObject(copy)||(copyIsArray=isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&isArray(src)?src:[];}else {clone=src&&isPlainObject(src)?src:{};} // Never move original objects, clone them
target[name]=extend(deep,clone,copy); // Don't bring in undefined values
}else if(typeof copy!=='undefined'){target[name]=copy;}}}}} // Return the modified object
return target;};},{}],5:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _handlebarsRuntime=require('./handlebars.runtime');var _handlebarsRuntime2=_interopRequireDefault(_handlebarsRuntime); // Compiler imports
var _handlebarsCompilerAst=require('./handlebars/compiler/ast');var _handlebarsCompilerAst2=_interopRequireDefault(_handlebarsCompilerAst);var _handlebarsCompilerBase=require('./handlebars/compiler/base');var _handlebarsCompilerCompiler=require('./handlebars/compiler/compiler');var _handlebarsCompilerJavascriptCompiler=require('./handlebars/compiler/javascript-compiler');var _handlebarsCompilerJavascriptCompiler2=_interopRequireDefault(_handlebarsCompilerJavascriptCompiler);var _handlebarsCompilerVisitor=require('./handlebars/compiler/visitor');var _handlebarsCompilerVisitor2=_interopRequireDefault(_handlebarsCompilerVisitor);var _handlebarsNoConflict=require('./handlebars/no-conflict');var _handlebarsNoConflict2=_interopRequireDefault(_handlebarsNoConflict);var _create=_handlebarsRuntime2['default'].create;function create(){var hb=_create();hb.compile=function(input,options){return _handlebarsCompilerCompiler.compile(input,options,hb);};hb.precompile=function(input,options){return _handlebarsCompilerCompiler.precompile(input,options,hb);};hb.AST=_handlebarsCompilerAst2['default'];hb.Compiler=_handlebarsCompilerCompiler.Compiler;hb.JavaScriptCompiler=_handlebarsCompilerJavascriptCompiler2['default'];hb.Parser=_handlebarsCompilerBase.parser;hb.parse=_handlebarsCompilerBase.parse;return hb;}var inst=create();inst.create=create;_handlebarsNoConflict2['default'](inst);inst.Visitor=_handlebarsCompilerVisitor2['default'];inst['default']=inst;exports['default']=inst;module.exports=exports['default'];},{"./handlebars.runtime":6,"./handlebars/compiler/ast":8,"./handlebars/compiler/base":9,"./handlebars/compiler/compiler":11,"./handlebars/compiler/javascript-compiler":13,"./handlebars/compiler/visitor":16,"./handlebars/no-conflict":30}],6:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};} // istanbul ignore next
function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else {var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj['default']=obj;return newObj;}}var _handlebarsBase=require('./handlebars/base');var base=_interopRequireWildcard(_handlebarsBase); // Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var _handlebarsSafeString=require('./handlebars/safe-string');var _handlebarsSafeString2=_interopRequireDefault(_handlebarsSafeString);var _handlebarsException=require('./handlebars/exception');var _handlebarsException2=_interopRequireDefault(_handlebarsException);var _handlebarsUtils=require('./handlebars/utils');var Utils=_interopRequireWildcard(_handlebarsUtils);var _handlebarsRuntime=require('./handlebars/runtime');var runtime=_interopRequireWildcard(_handlebarsRuntime);var _handlebarsNoConflict=require('./handlebars/no-conflict');var _handlebarsNoConflict2=_interopRequireDefault(_handlebarsNoConflict); // For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create(){var hb=new base.HandlebarsEnvironment();Utils.extend(hb,base);hb.SafeString=_handlebarsSafeString2['default'];hb.Exception=_handlebarsException2['default'];hb.Utils=Utils;hb.escapeExpression=Utils.escapeExpression;hb.VM=runtime;hb.template=function(spec){return runtime.template(spec,hb);};return hb;}var inst=create();inst.create=create;_handlebarsNoConflict2['default'](inst);inst['default']=inst;exports['default']=inst;module.exports=exports['default'];},{"./handlebars/base":7,"./handlebars/exception":20,"./handlebars/no-conflict":30,"./handlebars/runtime":31,"./handlebars/safe-string":32,"./handlebars/utils":33}],7:[function(require,module,exports){'use strict';exports.__esModule=true;exports.HandlebarsEnvironment=HandlebarsEnvironment; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _utils=require('./utils');var _exception=require('./exception');var _exception2=_interopRequireDefault(_exception);var _helpers=require('./helpers');var _decorators=require('./decorators');var _logger=require('./logger');var _logger2=_interopRequireDefault(_logger);var VERSION='4.0.5';exports.VERSION=VERSION;var COMPILER_REVISION=7;exports.COMPILER_REVISION=COMPILER_REVISION;var REVISION_CHANGES={1:'<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
2:'== 1.0.0-rc.3',3:'== 1.0.0-rc.4',4:'== 1.x.x',5:'== 2.0.0-alpha.x',6:'>= 2.0.0-beta.1',7:'>= 4.0.0'};exports.REVISION_CHANGES=REVISION_CHANGES;var objectType='[object Object]';function HandlebarsEnvironment(helpers,partials,decorators){this.helpers=helpers||{};this.partials=partials||{};this.decorators=decorators||{};_helpers.registerDefaultHelpers(this);_decorators.registerDefaultDecorators(this);}HandlebarsEnvironment.prototype={constructor:HandlebarsEnvironment,logger:_logger2['default'],log:_logger2['default'].log,registerHelper:function registerHelper(name,fn){if(_utils.toString.call(name)===objectType){if(fn){throw new _exception2['default']('Arg not supported with multiple helpers');}_utils.extend(this.helpers,name);}else {this.helpers[name]=fn;}},unregisterHelper:function unregisterHelper(name){delete this.helpers[name];},registerPartial:function registerPartial(name,partial){if(_utils.toString.call(name)===objectType){_utils.extend(this.partials,name);}else {if(typeof partial==='undefined'){throw new _exception2['default']('Attempting to register a partial called "'+name+'" as undefined');}this.partials[name]=partial;}},unregisterPartial:function unregisterPartial(name){delete this.partials[name];},registerDecorator:function registerDecorator(name,fn){if(_utils.toString.call(name)===objectType){if(fn){throw new _exception2['default']('Arg not supported with multiple decorators');}_utils.extend(this.decorators,name);}else {this.decorators[name]=fn;}},unregisterDecorator:function unregisterDecorator(name){delete this.decorators[name];}};var log=_logger2['default'].log;exports.log=log;exports.createFrame=_utils.createFrame;exports.logger=_logger2['default'];},{"./decorators":18,"./exception":20,"./helpers":21,"./logger":29,"./utils":33}],8:[function(require,module,exports){'use strict';exports.__esModule=true;var AST={ // Public API used to evaluate derived attributes regarding AST nodes
helpers:{ // a mustache is definitely a helper if:
// * it is an eligible helper, and
// * it has at least one parameter or hash segment
helperExpression:function helperExpression(node){return node.type==='SubExpression'||(node.type==='MustacheStatement'||node.type==='BlockStatement')&&!!(node.params&&node.params.length||node.hash);},scopedId:function scopedId(path){return (/^\.|this\b/.test(path.original));}, // an ID is simple if it only has one part, and that part is not
// `..` or `this`.
simpleId:function simpleId(path){return path.parts.length===1&&!AST.helpers.scopedId(path)&&!path.depth;}}}; // Must be exported as an object rather than the root of the module as the jison lexer
// must modify the object to operate properly.
exports['default']=AST;module.exports=exports['default'];},{}],9:[function(require,module,exports){'use strict';exports.__esModule=true;exports.parse=parse; // istanbul ignore next
function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else {var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj['default']=obj;return newObj;}} // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _parser=require('./parser');var _parser2=_interopRequireDefault(_parser);var _whitespaceControl=require('./whitespace-control');var _whitespaceControl2=_interopRequireDefault(_whitespaceControl);var _helpers=require('./helpers');var Helpers=_interopRequireWildcard(_helpers);var _utils=require('../utils');exports.parser=_parser2['default'];var yy={};_utils.extend(yy,Helpers);function parse(input,options){ // Just return if an already-compiled AST was passed in.
if(input.type==='Program'){return input;}_parser2['default'].yy=yy; // Altering the shared object here, but this is ok as parser is a sync operation
yy.locInfo=function(locInfo){return new yy.SourceLocation(options&&options.srcName,locInfo);};var strip=new _whitespaceControl2['default'](options);return strip.accept(_parser2['default'].parse(input));}},{"../utils":33,"./helpers":12,"./parser":14,"./whitespace-control":17}],10:[function(require,module,exports){ /* global define */'use strict';exports.__esModule=true;var _utils=require('../utils');var SourceNode=undefined;try{ /* istanbul ignore next */if(typeof define!=='function'||!define.amd){ // We don't support this in AMD environments. For these environments, we asusme that
// they are running on the browser and thus have no need for the source-map library.
var SourceMap=require('source-map');SourceNode=SourceMap.SourceNode;}}catch(err){} /* NOP */ /* istanbul ignore if: tested but not covered in istanbul due to dist build  */if(!SourceNode){SourceNode=function SourceNode(line,column,srcFile,chunks){this.src='';if(chunks){this.add(chunks);}}; /* istanbul ignore next */SourceNode.prototype={add:function add(chunks){if(_utils.isArray(chunks)){chunks=chunks.join('');}this.src+=chunks;},prepend:function prepend(chunks){if(_utils.isArray(chunks)){chunks=chunks.join('');}this.src=chunks+this.src;},toStringWithSourceMap:function toStringWithSourceMap(){return {code:this.toString()};},toString:function toString(){return this.src;}};}function castChunk(chunk,codeGen,loc){if(_utils.isArray(chunk)){var ret=[];for(var i=0,len=chunk.length;i<len;i++){ret.push(codeGen.wrap(chunk[i],loc));}return ret;}else if(typeof chunk==='boolean'||typeof chunk==='number'){ // Handle primitives that the SourceNode will throw up on
return chunk+'';}return chunk;}function CodeGen(srcFile){this.srcFile=srcFile;this.source=[];}CodeGen.prototype={isEmpty:function isEmpty(){return !this.source.length;},prepend:function prepend(source,loc){this.source.unshift(this.wrap(source,loc));},push:function push(source,loc){this.source.push(this.wrap(source,loc));},merge:function merge(){var source=this.empty();this.each(function(line){source.add(['  ',line,'\n']);});return source;},each:function each(iter){for(var i=0,len=this.source.length;i<len;i++){iter(this.source[i]);}},empty:function empty(){var loc=this.currentLocation||{start:{}};return new SourceNode(loc.start.line,loc.start.column,this.srcFile);},wrap:function wrap(chunk){var loc=arguments.length<=1||arguments[1]===undefined?this.currentLocation||{start:{}}:arguments[1];if(chunk instanceof SourceNode){return chunk;}chunk=castChunk(chunk,this,loc);return new SourceNode(loc.start.line,loc.start.column,this.srcFile,chunk);},functionCall:function functionCall(fn,type,params){params=this.generateList(params);return this.wrap([fn,type?'.'+type+'(':'(',params,')']);},quotedString:function quotedString(str){return '"'+(str+'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\u2028/g,"\\u2028") // Per Ecma-262 7.3 + 7.8.4
.replace(/\u2029/g,"\\u2029")+'"';},objectLiteral:function objectLiteral(obj){var pairs=[];for(var key in obj){if(obj.hasOwnProperty(key)){var value=castChunk(obj[key],this);if(value!=='undefined'){pairs.push([this.quotedString(key),':',value]);}}}var ret=this.generateList(pairs);ret.prepend('{');ret.add('}');return ret;},generateList:function generateList(entries){var ret=this.empty();for(var i=0,len=entries.length;i<len;i++){if(i){ret.add(',');}ret.add(castChunk(entries[i],this));}return ret;},generateArray:function generateArray(entries){var ret=this.generateList(entries);ret.prepend('[');ret.add(']');return ret;}};exports['default']=CodeGen;module.exports=exports['default'];},{"../utils":33,"source-map":43}],11:[function(require,module,exports){ /* eslint-disable new-cap */'use strict';exports.__esModule=true;exports.Compiler=Compiler;exports.precompile=precompile;exports.compile=compile; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _exception=require('../exception');var _exception2=_interopRequireDefault(_exception);var _utils=require('../utils');var _ast=require('./ast');var _ast2=_interopRequireDefault(_ast);var slice=[].slice;function Compiler(){} // the foundHelper register will disambiguate helper lookup from finding a
// function in a context. This is necessary for mustache compatibility, which
// requires that context functions in blocks are evaluated by blockHelperMissing,
// and then proceed as if the resulting value was provided to blockHelperMissing.
Compiler.prototype={compiler:Compiler,equals:function equals(other){var len=this.opcodes.length;if(other.opcodes.length!==len){return false;}for(var i=0;i<len;i++){var opcode=this.opcodes[i],otherOpcode=other.opcodes[i];if(opcode.opcode!==otherOpcode.opcode||!argEquals(opcode.args,otherOpcode.args)){return false;}} // We know that length is the same between the two arrays because they are directly tied
// to the opcode behavior above.
len=this.children.length;for(var i=0;i<len;i++){if(!this.children[i].equals(other.children[i])){return false;}}return true;},guid:0,compile:function compile(program,options){this.sourceNode=[];this.opcodes=[];this.children=[];this.options=options;this.stringParams=options.stringParams;this.trackIds=options.trackIds;options.blockParams=options.blockParams||[]; // These changes will propagate to the other compiler components
var knownHelpers=options.knownHelpers;options.knownHelpers={'helperMissing':true,'blockHelperMissing':true,'each':true,'if':true,'unless':true,'with':true,'log':true,'lookup':true};if(knownHelpers){for(var _name in knownHelpers){ /* istanbul ignore else */if(_name in knownHelpers){options.knownHelpers[_name]=knownHelpers[_name];}}}return this.accept(program);},compileProgram:function compileProgram(program){var childCompiler=new this.compiler(), // eslint-disable-line new-cap
result=childCompiler.compile(program,this.options),guid=this.guid++;this.usePartial=this.usePartial||result.usePartial;this.children[guid]=result;this.useDepths=this.useDepths||result.useDepths;return guid;},accept:function accept(node){ /* istanbul ignore next: Sanity code */if(!this[node.type]){throw new _exception2['default']('Unknown type: '+node.type,node);}this.sourceNode.unshift(node);var ret=this[node.type](node);this.sourceNode.shift();return ret;},Program:function Program(program){this.options.blockParams.unshift(program.blockParams);var body=program.body,bodyLength=body.length;for(var i=0;i<bodyLength;i++){this.accept(body[i]);}this.options.blockParams.shift();this.isSimple=bodyLength===1;this.blockParams=program.blockParams?program.blockParams.length:0;return this;},BlockStatement:function BlockStatement(block){transformLiteralToPath(block);var program=block.program,inverse=block.inverse;program=program&&this.compileProgram(program);inverse=inverse&&this.compileProgram(inverse);var type=this.classifySexpr(block);if(type==='helper'){this.helperSexpr(block,program,inverse);}else if(type==='simple'){this.simpleSexpr(block); // now that the simple mustache is resolved, we need to
// evaluate it by executing `blockHelperMissing`
this.opcode('pushProgram',program);this.opcode('pushProgram',inverse);this.opcode('emptyHash');this.opcode('blockValue',block.path.original);}else {this.ambiguousSexpr(block,program,inverse); // now that the simple mustache is resolved, we need to
// evaluate it by executing `blockHelperMissing`
this.opcode('pushProgram',program);this.opcode('pushProgram',inverse);this.opcode('emptyHash');this.opcode('ambiguousBlockValue');}this.opcode('append');},DecoratorBlock:function DecoratorBlock(decorator){var program=decorator.program&&this.compileProgram(decorator.program);var params=this.setupFullMustacheParams(decorator,program,undefined),path=decorator.path;this.useDecorators=true;this.opcode('registerDecorator',params.length,path.original);},PartialStatement:function PartialStatement(partial){this.usePartial=true;var program=partial.program;if(program){program=this.compileProgram(partial.program);}var params=partial.params;if(params.length>1){throw new _exception2['default']('Unsupported number of partial arguments: '+params.length,partial);}else if(!params.length){if(this.options.explicitPartialContext){this.opcode('pushLiteral','undefined');}else {params.push({type:'PathExpression',parts:[],depth:0});}}var partialName=partial.name.original,isDynamic=partial.name.type==='SubExpression';if(isDynamic){this.accept(partial.name);}this.setupFullMustacheParams(partial,program,undefined,true);var indent=partial.indent||'';if(this.options.preventIndent&&indent){this.opcode('appendContent',indent);indent='';}this.opcode('invokePartial',isDynamic,partialName,indent);this.opcode('append');},PartialBlockStatement:function PartialBlockStatement(partialBlock){this.PartialStatement(partialBlock);},MustacheStatement:function MustacheStatement(mustache){this.SubExpression(mustache);if(mustache.escaped&&!this.options.noEscape){this.opcode('appendEscaped');}else {this.opcode('append');}},Decorator:function Decorator(decorator){this.DecoratorBlock(decorator);},ContentStatement:function ContentStatement(content){if(content.value){this.opcode('appendContent',content.value);}},CommentStatement:function CommentStatement(){},SubExpression:function SubExpression(sexpr){transformLiteralToPath(sexpr);var type=this.classifySexpr(sexpr);if(type==='simple'){this.simpleSexpr(sexpr);}else if(type==='helper'){this.helperSexpr(sexpr);}else {this.ambiguousSexpr(sexpr);}},ambiguousSexpr:function ambiguousSexpr(sexpr,program,inverse){var path=sexpr.path,name=path.parts[0],isBlock=program!=null||inverse!=null;this.opcode('getContext',path.depth);this.opcode('pushProgram',program);this.opcode('pushProgram',inverse);path.strict=true;this.accept(path);this.opcode('invokeAmbiguous',name,isBlock);},simpleSexpr:function simpleSexpr(sexpr){var path=sexpr.path;path.strict=true;this.accept(path);this.opcode('resolvePossibleLambda');},helperSexpr:function helperSexpr(sexpr,program,inverse){var params=this.setupFullMustacheParams(sexpr,program,inverse),path=sexpr.path,name=path.parts[0];if(this.options.knownHelpers[name]){this.opcode('invokeKnownHelper',params.length,name);}else if(this.options.knownHelpersOnly){throw new _exception2['default']('You specified knownHelpersOnly, but used the unknown helper '+name,sexpr);}else {path.strict=true;path.falsy=true;this.accept(path);this.opcode('invokeHelper',params.length,path.original,_ast2['default'].helpers.simpleId(path));}},PathExpression:function PathExpression(path){this.addDepth(path.depth);this.opcode('getContext',path.depth);var name=path.parts[0],scoped=_ast2['default'].helpers.scopedId(path),blockParamId=!path.depth&&!scoped&&this.blockParamIndex(name);if(blockParamId){this.opcode('lookupBlockParam',blockParamId,path.parts);}else if(!name){ // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
this.opcode('pushContext');}else if(path.data){this.options.data=true;this.opcode('lookupData',path.depth,path.parts,path.strict);}else {this.opcode('lookupOnContext',path.parts,path.falsy,path.strict,scoped);}},StringLiteral:function StringLiteral(string){this.opcode('pushString',string.value);},NumberLiteral:function NumberLiteral(number){this.opcode('pushLiteral',number.value);},BooleanLiteral:function BooleanLiteral(bool){this.opcode('pushLiteral',bool.value);},UndefinedLiteral:function UndefinedLiteral(){this.opcode('pushLiteral','undefined');},NullLiteral:function NullLiteral(){this.opcode('pushLiteral','null');},Hash:function Hash(hash){var pairs=hash.pairs,i=0,l=pairs.length;this.opcode('pushHash');for(;i<l;i++){this.pushParam(pairs[i].value);}while(i--){this.opcode('assignToHash',pairs[i].key);}this.opcode('popHash');}, // HELPERS
opcode:function opcode(name){this.opcodes.push({opcode:name,args:slice.call(arguments,1),loc:this.sourceNode[0].loc});},addDepth:function addDepth(depth){if(!depth){return;}this.useDepths=true;},classifySexpr:function classifySexpr(sexpr){var isSimple=_ast2['default'].helpers.simpleId(sexpr.path);var isBlockParam=isSimple&&!!this.blockParamIndex(sexpr.path.parts[0]); // a mustache is an eligible helper if:
// * its id is simple (a single part, not `this` or `..`)
var isHelper=!isBlockParam&&_ast2['default'].helpers.helperExpression(sexpr); // if a mustache is an eligible helper but not a definite
// helper, it is ambiguous, and will be resolved in a later
// pass or at runtime.
var isEligible=!isBlockParam&&(isHelper||isSimple); // if ambiguous, we can possibly resolve the ambiguity now
// An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
if(isEligible&&!isHelper){var _name2=sexpr.path.parts[0],options=this.options;if(options.knownHelpers[_name2]){isHelper=true;}else if(options.knownHelpersOnly){isEligible=false;}}if(isHelper){return 'helper';}else if(isEligible){return 'ambiguous';}else {return 'simple';}},pushParams:function pushParams(params){for(var i=0,l=params.length;i<l;i++){this.pushParam(params[i]);}},pushParam:function pushParam(val){var value=val.value!=null?val.value:val.original||'';if(this.stringParams){if(value.replace){value=value.replace(/^(\.?\.\/)*/g,'').replace(/\//g,'.');}if(val.depth){this.addDepth(val.depth);}this.opcode('getContext',val.depth||0);this.opcode('pushStringParam',value,val.type);if(val.type==='SubExpression'){ // SubExpressions get evaluated and passed in
// in string params mode.
this.accept(val);}}else {if(this.trackIds){var blockParamIndex=undefined;if(val.parts&&!_ast2['default'].helpers.scopedId(val)&&!val.depth){blockParamIndex=this.blockParamIndex(val.parts[0]);}if(blockParamIndex){var blockParamChild=val.parts.slice(1).join('.');this.opcode('pushId','BlockParam',blockParamIndex,blockParamChild);}else {value=val.original||value;if(value.replace){value=value.replace(/^this(?:\.|$)/,'').replace(/^\.\//,'').replace(/^\.$/,'');}this.opcode('pushId',val.type,value);}}this.accept(val);}},setupFullMustacheParams:function setupFullMustacheParams(sexpr,program,inverse,omitEmpty){var params=sexpr.params;this.pushParams(params);this.opcode('pushProgram',program);this.opcode('pushProgram',inverse);if(sexpr.hash){this.accept(sexpr.hash);}else {this.opcode('emptyHash',omitEmpty);}return params;},blockParamIndex:function blockParamIndex(name){for(var depth=0,len=this.options.blockParams.length;depth<len;depth++){var blockParams=this.options.blockParams[depth],param=blockParams&&_utils.indexOf(blockParams,name);if(blockParams&&param>=0){return [depth,param];}}}};function precompile(input,options,env){if(input==null||typeof input!=='string'&&input.type!=='Program'){throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed '+input);}options=options||{};if(!('data' in options)){options.data=true;}if(options.compat){options.useDepths=true;}var ast=env.parse(input,options),environment=new env.Compiler().compile(ast,options);return new env.JavaScriptCompiler().compile(environment,options);}function compile(input,options,env){if(options===undefined)options={};if(input==null||typeof input!=='string'&&input.type!=='Program'){throw new _exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed '+input);}if(!('data' in options)){options.data=true;}if(options.compat){options.useDepths=true;}var compiled=undefined;function compileInput(){var ast=env.parse(input,options),environment=new env.Compiler().compile(ast,options),templateSpec=new env.JavaScriptCompiler().compile(environment,options,undefined,true);return env.template(templateSpec);} // Template is only compiled on first use and cached after that point.
function ret(context,execOptions){if(!compiled){compiled=compileInput();}return compiled.call(this,context,execOptions);}ret._setup=function(setupOptions){if(!compiled){compiled=compileInput();}return compiled._setup(setupOptions);};ret._child=function(i,data,blockParams,depths){if(!compiled){compiled=compileInput();}return compiled._child(i,data,blockParams,depths);};return ret;}function argEquals(a,b){if(a===b){return true;}if(_utils.isArray(a)&&_utils.isArray(b)&&a.length===b.length){for(var i=0;i<a.length;i++){if(!argEquals(a[i],b[i])){return false;}}return true;}}function transformLiteralToPath(sexpr){if(!sexpr.path.parts){var literal=sexpr.path; // Casting to string here to make false and 0 literal values play nicely with the rest
// of the system.
sexpr.path={type:'PathExpression',data:false,depth:0,parts:[literal.original+''],original:literal.original+'',loc:literal.loc};}}},{"../exception":20,"../utils":33,"./ast":8}],12:[function(require,module,exports){'use strict';exports.__esModule=true;exports.SourceLocation=SourceLocation;exports.id=id;exports.stripFlags=stripFlags;exports.stripComment=stripComment;exports.preparePath=preparePath;exports.prepareMustache=prepareMustache;exports.prepareRawBlock=prepareRawBlock;exports.prepareBlock=prepareBlock;exports.prepareProgram=prepareProgram;exports.preparePartialBlock=preparePartialBlock; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _exception=require('../exception');var _exception2=_interopRequireDefault(_exception);function validateClose(open,close){close=close.path?close.path.original:close;if(open.path.original!==close){var errorNode={loc:open.path.loc};throw new _exception2['default'](open.path.original+" doesn't match "+close,errorNode);}}function SourceLocation(source,locInfo){this.source=source;this.start={line:locInfo.first_line,column:locInfo.first_column};this.end={line:locInfo.last_line,column:locInfo.last_column};}function id(token){if(/^\[.*\]$/.test(token)){return token.substr(1,token.length-2);}else {return token;}}function stripFlags(open,close){return {open:open.charAt(2)==='~',close:close.charAt(close.length-3)==='~'};}function stripComment(comment){return comment.replace(/^\{\{~?\!-?-?/,'').replace(/-?-?~?\}\}$/,'');}function preparePath(data,parts,loc){loc=this.locInfo(loc);var original=data?'@':'',dig=[],depth=0,depthString='';for(var i=0,l=parts.length;i<l;i++){var part=parts[i].part, // If we have [] syntax then we do not treat path references as operators,
// i.e. foo.[this] resolves to approximately context.foo['this']
isLiteral=parts[i].original!==part;original+=(parts[i].separator||'')+part;if(!isLiteral&&(part==='..'||part==='.'||part==='this')){if(dig.length>0){throw new _exception2['default']('Invalid path: '+original,{loc:loc});}else if(part==='..'){depth++;depthString+='../';}}else {dig.push(part);}}return {type:'PathExpression',data:data,depth:depth,parts:dig,original:original,loc:loc};}function prepareMustache(path,params,hash,open,strip,locInfo){ // Must use charAt to support IE pre-10
var escapeFlag=open.charAt(3)||open.charAt(2),escaped=escapeFlag!=='{'&&escapeFlag!=='&';var decorator=/\*/.test(open);return {type:decorator?'Decorator':'MustacheStatement',path:path,params:params,hash:hash,escaped:escaped,strip:strip,loc:this.locInfo(locInfo)};}function prepareRawBlock(openRawBlock,contents,close,locInfo){validateClose(openRawBlock,close);locInfo=this.locInfo(locInfo);var program={type:'Program',body:contents,strip:{},loc:locInfo};return {type:'BlockStatement',path:openRawBlock.path,params:openRawBlock.params,hash:openRawBlock.hash,program:program,openStrip:{},inverseStrip:{},closeStrip:{},loc:locInfo};}function prepareBlock(openBlock,program,inverseAndProgram,close,inverted,locInfo){if(close&&close.path){validateClose(openBlock,close);}var decorator=/\*/.test(openBlock.open);program.blockParams=openBlock.blockParams;var inverse=undefined,inverseStrip=undefined;if(inverseAndProgram){if(decorator){throw new _exception2['default']('Unexpected inverse block on decorator',inverseAndProgram);}if(inverseAndProgram.chain){inverseAndProgram.program.body[0].closeStrip=close.strip;}inverseStrip=inverseAndProgram.strip;inverse=inverseAndProgram.program;}if(inverted){inverted=inverse;inverse=program;program=inverted;}return {type:decorator?'DecoratorBlock':'BlockStatement',path:openBlock.path,params:openBlock.params,hash:openBlock.hash,program:program,inverse:inverse,openStrip:openBlock.strip,inverseStrip:inverseStrip,closeStrip:close&&close.strip,loc:this.locInfo(locInfo)};}function prepareProgram(statements,loc){if(!loc&&statements.length){var firstLoc=statements[0].loc,lastLoc=statements[statements.length-1].loc; /* istanbul ignore else */if(firstLoc&&lastLoc){loc={source:firstLoc.source,start:{line:firstLoc.start.line,column:firstLoc.start.column},end:{line:lastLoc.end.line,column:lastLoc.end.column}};}}return {type:'Program',body:statements,strip:{},loc:loc};}function preparePartialBlock(open,program,close,locInfo){validateClose(open,close);return {type:'PartialBlockStatement',name:open.path,params:open.params,hash:open.hash,program:program,openStrip:open.strip,closeStrip:close&&close.strip,loc:this.locInfo(locInfo)};}},{"../exception":20}],13:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _base=require('../base');var _exception=require('../exception');var _exception2=_interopRequireDefault(_exception);var _utils=require('../utils');var _codeGen=require('./code-gen');var _codeGen2=_interopRequireDefault(_codeGen);function Literal(value){this.value=value;}function JavaScriptCompiler(){}JavaScriptCompiler.prototype={ // PUBLIC API: You can override these methods in a subclass to provide
// alternative compiled forms for name lookup and buffering semantics
nameLookup:function nameLookup(parent,name /* , type*/){if(JavaScriptCompiler.isValidJavaScriptVariableName(name)){return [parent,'.',name];}else {return [parent,'[',JSON.stringify(name),']'];}},depthedLookup:function depthedLookup(name){return [this.aliasable('container.lookup'),'(depths, "',name,'")'];},compilerInfo:function compilerInfo(){var revision=_base.COMPILER_REVISION,versions=_base.REVISION_CHANGES[revision];return [revision,versions];},appendToBuffer:function appendToBuffer(source,location,explicit){ // Force a source as this simplifies the merge logic.
if(!_utils.isArray(source)){source=[source];}source=this.source.wrap(source,location);if(this.environment.isSimple){return ['return ',source,';'];}else if(explicit){ // This is a case where the buffer operation occurs as a child of another
// construct, generally braces. We have to explicitly output these buffer
// operations to ensure that the emitted code goes in the correct location.
return ['buffer += ',source,';'];}else {source.appendToBuffer=true;return source;}},initializeBuffer:function initializeBuffer(){return this.quotedString('');}, // END PUBLIC API
compile:function compile(environment,options,context,asObject){this.environment=environment;this.options=options;this.stringParams=this.options.stringParams;this.trackIds=this.options.trackIds;this.precompile=!asObject;this.name=this.environment.name;this.isChild=!!context;this.context=context||{decorators:[],programs:[],environments:[]};this.preamble();this.stackSlot=0;this.stackVars=[];this.aliases={};this.registers={list:[]};this.hashes=[];this.compileStack=[];this.inlineStack=[];this.blockParams=[];this.compileChildren(environment,options);this.useDepths=this.useDepths||environment.useDepths||environment.useDecorators||this.options.compat;this.useBlockParams=this.useBlockParams||environment.useBlockParams;var opcodes=environment.opcodes,opcode=undefined,firstLoc=undefined,i=undefined,l=undefined;for(i=0,l=opcodes.length;i<l;i++){opcode=opcodes[i];this.source.currentLocation=opcode.loc;firstLoc=firstLoc||opcode.loc;this[opcode.opcode].apply(this,opcode.args);} // Flush any trailing content that might be pending.
this.source.currentLocation=firstLoc;this.pushSource(''); /* istanbul ignore next */if(this.stackSlot||this.inlineStack.length||this.compileStack.length){throw new _exception2['default']('Compile completed with content left on stack');}if(!this.decorators.isEmpty()){this.useDecorators=true;this.decorators.prepend('var decorators = container.decorators;\n');this.decorators.push('return fn;');if(asObject){this.decorators=Function.apply(this,['fn','props','container','depth0','data','blockParams','depths',this.decorators.merge()]);}else {this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');this.decorators.push('}\n');this.decorators=this.decorators.merge();}}else {this.decorators=undefined;}var fn=this.createFunctionContext(asObject);if(!this.isChild){var ret={compiler:this.compilerInfo(),main:fn};if(this.decorators){ret.main_d=this.decorators; // eslint-disable-line camelcase
ret.useDecorators=true;}var _context=this.context;var programs=_context.programs;var decorators=_context.decorators;for(i=0,l=programs.length;i<l;i++){if(programs[i]){ret[i]=programs[i];if(decorators[i]){ret[i+'_d']=decorators[i];ret.useDecorators=true;}}}if(this.environment.usePartial){ret.usePartial=true;}if(this.options.data){ret.useData=true;}if(this.useDepths){ret.useDepths=true;}if(this.useBlockParams){ret.useBlockParams=true;}if(this.options.compat){ret.compat=true;}if(!asObject){ret.compiler=JSON.stringify(ret.compiler);this.source.currentLocation={start:{line:1,column:0}};ret=this.objectLiteral(ret);if(options.srcName){ret=ret.toStringWithSourceMap({file:options.destName});ret.map=ret.map&&ret.map.toString();}else {ret=ret.toString();}}else {ret.compilerOptions=this.options;}return ret;}else {return fn;}},preamble:function preamble(){ // track the last context pushed into place to allow skipping the
// getContext opcode when it would be a noop
this.lastContext=0;this.source=new _codeGen2['default'](this.options.srcName);this.decorators=new _codeGen2['default'](this.options.srcName);},createFunctionContext:function createFunctionContext(asObject){var varDeclarations='';var locals=this.stackVars.concat(this.registers.list);if(locals.length>0){varDeclarations+=', '+locals.join(', ');} // Generate minimizer alias mappings
//
// When using true SourceNodes, this will update all references to the given alias
// as the source nodes are reused in situ. For the non-source node compilation mode,
// aliases will not be used, but this case is already being run on the client and
// we aren't concern about minimizing the template size.
var aliasCount=0;for(var alias in this.aliases){ // eslint-disable-line guard-for-in
var node=this.aliases[alias];if(this.aliases.hasOwnProperty(alias)&&node.children&&node.referenceCount>1){varDeclarations+=', alias'+ ++aliasCount+'='+alias;node.children[0]='alias'+aliasCount;}}var params=['container','depth0','helpers','partials','data'];if(this.useBlockParams||this.useDepths){params.push('blockParams');}if(this.useDepths){params.push('depths');} // Perform a second pass over the output to merge content when possible
var source=this.mergeSource(varDeclarations);if(asObject){params.push(source);return Function.apply(this,params);}else {return this.source.wrap(['function(',params.join(','),') {\n  ',source,'}']);}},mergeSource:function mergeSource(varDeclarations){var isSimple=this.environment.isSimple,appendOnly=!this.forceBuffer,appendFirst=undefined,sourceSeen=undefined,bufferStart=undefined,bufferEnd=undefined;this.source.each(function(line){if(line.appendToBuffer){if(bufferStart){line.prepend('  + ');}else {bufferStart=line;}bufferEnd=line;}else {if(bufferStart){if(!sourceSeen){appendFirst=true;}else {bufferStart.prepend('buffer += ');}bufferEnd.add(';');bufferStart=bufferEnd=undefined;}sourceSeen=true;if(!isSimple){appendOnly=false;}}});if(appendOnly){if(bufferStart){bufferStart.prepend('return ');bufferEnd.add(';');}else if(!sourceSeen){this.source.push('return "";');}}else {varDeclarations+=', buffer = '+(appendFirst?'':this.initializeBuffer());if(bufferStart){bufferStart.prepend('return buffer + ');bufferEnd.add(';');}else {this.source.push('return buffer;');}}if(varDeclarations){this.source.prepend('var '+varDeclarations.substring(2)+(appendFirst?'':';\n'));}return this.source.merge();}, // [blockValue]
//
// On stack, before: hash, inverse, program, value
// On stack, after: return value of blockHelperMissing
//
// The purpose of this opcode is to take a block of the form
// `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
// replace it on the stack with the result of properly
// invoking blockHelperMissing.
blockValue:function blockValue(name){var blockHelperMissing=this.aliasable('helpers.blockHelperMissing'),params=[this.contextName(0)];this.setupHelperArgs(name,0,params);var blockName=this.popStack();params.splice(1,0,blockName);this.push(this.source.functionCall(blockHelperMissing,'call',params));}, // [ambiguousBlockValue]
//
// On stack, before: hash, inverse, program, value
// Compiler value, before: lastHelper=value of last found helper, if any
// On stack, after, if no lastHelper: same as [blockValue]
// On stack, after, if lastHelper: value
ambiguousBlockValue:function ambiguousBlockValue(){ // We're being a bit cheeky and reusing the options value from the prior exec
var blockHelperMissing=this.aliasable('helpers.blockHelperMissing'),params=[this.contextName(0)];this.setupHelperArgs('',0,params,true);this.flushInline();var current=this.topStack();params.splice(1,0,current);this.pushSource(['if (!',this.lastHelper,') { ',current,' = ',this.source.functionCall(blockHelperMissing,'call',params),'}']);}, // [appendContent]
//
// On stack, before: ...
// On stack, after: ...
//
// Appends the string value of `content` to the current buffer
appendContent:function appendContent(content){if(this.pendingContent){content=this.pendingContent+content;}else {this.pendingLocation=this.source.currentLocation;}this.pendingContent=content;}, // [append]
//
// On stack, before: value, ...
// On stack, after: ...
//
// Coerces `value` to a String and appends it to the current buffer.
//
// If `value` is truthy, or 0, it is coerced into a string and appended
// Otherwise, the empty string is appended
append:function append(){if(this.isInline()){this.replaceStack(function(current){return [' != null ? ',current,' : ""'];});this.pushSource(this.appendToBuffer(this.popStack()));}else {var local=this.popStack();this.pushSource(['if (',local,' != null) { ',this.appendToBuffer(local,undefined,true),' }']);if(this.environment.isSimple){this.pushSource(['else { ',this.appendToBuffer("''",undefined,true),' }']);}}}, // [appendEscaped]
//
// On stack, before: value, ...
// On stack, after: ...
//
// Escape `value` and append it to the buffer
appendEscaped:function appendEscaped(){this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'),'(',this.popStack(),')']));}, // [getContext]
//
// On stack, before: ...
// On stack, after: ...
// Compiler value, after: lastContext=depth
//
// Set the value of the `lastContext` compiler value to the depth
getContext:function getContext(depth){this.lastContext=depth;}, // [pushContext]
//
// On stack, before: ...
// On stack, after: currentContext, ...
//
// Pushes the value of the current context onto the stack.
pushContext:function pushContext(){this.pushStackLiteral(this.contextName(this.lastContext));}, // [lookupOnContext]
//
// On stack, before: ...
// On stack, after: currentContext[name], ...
//
// Looks up the value of `name` on the current context and pushes
// it onto the stack.
lookupOnContext:function lookupOnContext(parts,falsy,strict,scoped){var i=0;if(!scoped&&this.options.compat&&!this.lastContext){ // The depthed query is expected to handle the undefined logic for the root level that
// is implemented below, so we evaluate that directly in compat mode
this.push(this.depthedLookup(parts[i++]));}else {this.pushContext();}this.resolvePath('context',parts,i,falsy,strict);}, // [lookupBlockParam]
//
// On stack, before: ...
// On stack, after: blockParam[name], ...
//
// Looks up the value of `parts` on the given block param and pushes
// it onto the stack.
lookupBlockParam:function lookupBlockParam(blockParamId,parts){this.useBlockParams=true;this.push(['blockParams[',blockParamId[0],'][',blockParamId[1],']']);this.resolvePath('context',parts,1);}, // [lookupData]
//
// On stack, before: ...
// On stack, after: data, ...
//
// Push the data lookup operator
lookupData:function lookupData(depth,parts,strict){if(!depth){this.pushStackLiteral('data');}else {this.pushStackLiteral('container.data(data, '+depth+')');}this.resolvePath('data',parts,0,true,strict);},resolvePath:function resolvePath(type,parts,i,falsy,strict){ // istanbul ignore next
var _this=this;if(this.options.strict||this.options.assumeObjects){this.push(strictLookup(this.options.strict&&strict,this,parts,type));return;}var len=parts.length;for(;i<len;i++){ /* eslint-disable no-loop-func */this.replaceStack(function(current){var lookup=_this.nameLookup(current,parts[i],type); // We want to ensure that zero and false are handled properly if the context (falsy flag)
// needs to have the special handling for these values.
if(!falsy){return [' != null ? ',lookup,' : ',current];}else { // Otherwise we can use generic falsy handling
return [' && ',lookup];}}); /* eslint-enable no-loop-func */}}, // [resolvePossibleLambda]
//
// On stack, before: value, ...
// On stack, after: resolved value, ...
//
// If the `value` is a lambda, replace it on the stack by
// the return value of the lambda
resolvePossibleLambda:function resolvePossibleLambda(){this.push([this.aliasable('container.lambda'),'(',this.popStack(),', ',this.contextName(0),')']);}, // [pushStringParam]
//
// On stack, before: ...
// On stack, after: string, currentContext, ...
//
// This opcode is designed for use in string mode, which
// provides the string value of a parameter along with its
// depth rather than resolving it immediately.
pushStringParam:function pushStringParam(string,type){this.pushContext();this.pushString(type); // If it's a subexpression, the string result
// will be pushed after this opcode.
if(type!=='SubExpression'){if(typeof string==='string'){this.pushString(string);}else {this.pushStackLiteral(string);}}},emptyHash:function emptyHash(omitEmpty){if(this.trackIds){this.push('{}'); // hashIds
}if(this.stringParams){this.push('{}'); // hashContexts
this.push('{}'); // hashTypes
}this.pushStackLiteral(omitEmpty?'undefined':'{}');},pushHash:function pushHash(){if(this.hash){this.hashes.push(this.hash);}this.hash={values:[],types:[],contexts:[],ids:[]};},popHash:function popHash(){var hash=this.hash;this.hash=this.hashes.pop();if(this.trackIds){this.push(this.objectLiteral(hash.ids));}if(this.stringParams){this.push(this.objectLiteral(hash.contexts));this.push(this.objectLiteral(hash.types));}this.push(this.objectLiteral(hash.values));}, // [pushString]
//
// On stack, before: ...
// On stack, after: quotedString(string), ...
//
// Push a quoted version of `string` onto the stack
pushString:function pushString(string){this.pushStackLiteral(this.quotedString(string));}, // [pushLiteral]
//
// On stack, before: ...
// On stack, after: value, ...
//
// Pushes a value onto the stack. This operation prevents
// the compiler from creating a temporary variable to hold
// it.
pushLiteral:function pushLiteral(value){this.pushStackLiteral(value);}, // [pushProgram]
//
// On stack, before: ...
// On stack, after: program(guid), ...
//
// Push a program expression onto the stack. This takes
// a compile-time guid and converts it into a runtime-accessible
// expression.
pushProgram:function pushProgram(guid){if(guid!=null){this.pushStackLiteral(this.programExpression(guid));}else {this.pushStackLiteral(null);}}, // [registerDecorator]
//
// On stack, before: hash, program, params..., ...
// On stack, after: ...
//
// Pops off the decorator's parameters, invokes the decorator,
// and inserts the decorator into the decorators list.
registerDecorator:function registerDecorator(paramSize,name){var foundDecorator=this.nameLookup('decorators',name,'decorator'),options=this.setupHelperArgs(name,paramSize);this.decorators.push(['fn = ',this.decorators.functionCall(foundDecorator,'',['fn','props','container',options]),' || fn;']);}, // [invokeHelper]
//
// On stack, before: hash, inverse, program, params..., ...
// On stack, after: result of helper invocation
//
// Pops off the helper's parameters, invokes the helper,
// and pushes the helper's return value onto the stack.
//
// If the helper is not found, `helperMissing` is called.
invokeHelper:function invokeHelper(paramSize,name,isSimple){var nonHelper=this.popStack(),helper=this.setupHelper(paramSize,name),simple=isSimple?[helper.name,' || ']:'';var lookup=['('].concat(simple,nonHelper);if(!this.options.strict){lookup.push(' || ',this.aliasable('helpers.helperMissing'));}lookup.push(')');this.push(this.source.functionCall(lookup,'call',helper.callParams));}, // [invokeKnownHelper]
//
// On stack, before: hash, inverse, program, params..., ...
// On stack, after: result of helper invocation
//
// This operation is used when the helper is known to exist,
// so a `helperMissing` fallback is not required.
invokeKnownHelper:function invokeKnownHelper(paramSize,name){var helper=this.setupHelper(paramSize,name);this.push(this.source.functionCall(helper.name,'call',helper.callParams));}, // [invokeAmbiguous]
//
// On stack, before: hash, inverse, program, params..., ...
// On stack, after: result of disambiguation
//
// This operation is used when an expression like `{{foo}}`
// is provided, but we don't know at compile-time whether it
// is a helper or a path.
//
// This operation emits more code than the other options,
// and can be avoided by passing the `knownHelpers` and
// `knownHelpersOnly` flags at compile-time.
invokeAmbiguous:function invokeAmbiguous(name,helperCall){this.useRegister('helper');var nonHelper=this.popStack();this.emptyHash();var helper=this.setupHelper(0,name,helperCall);var helperName=this.lastHelper=this.nameLookup('helpers',name,'helper');var lookup=['(','(helper = ',helperName,' || ',nonHelper,')'];if(!this.options.strict){lookup[0]='(helper = ';lookup.push(' != null ? helper : ',this.aliasable('helpers.helperMissing'));}this.push(['(',lookup,helper.paramsInit?['),(',helper.paramsInit]:[],'),','(typeof helper === ',this.aliasable('"function"'),' ? ',this.source.functionCall('helper','call',helper.callParams),' : helper))']);}, // [invokePartial]
//
// On stack, before: context, ...
// On stack after: result of partial invocation
//
// This operation pops off a context, invokes a partial with that context,
// and pushes the result of the invocation back.
invokePartial:function invokePartial(isDynamic,name,indent){var params=[],options=this.setupParams(name,1,params);if(isDynamic){name=this.popStack();delete options.name;}if(indent){options.indent=JSON.stringify(indent);}options.helpers='helpers';options.partials='partials';options.decorators='container.decorators';if(!isDynamic){params.unshift(this.nameLookup('partials',name,'partial'));}else {params.unshift(name);}if(this.options.compat){options.depths='depths';}options=this.objectLiteral(options);params.push(options);this.push(this.source.functionCall('container.invokePartial','',params));}, // [assignToHash]
//
// On stack, before: value, ..., hash, ...
// On stack, after: ..., hash, ...
//
// Pops a value off the stack and assigns it to the current hash
assignToHash:function assignToHash(key){var value=this.popStack(),context=undefined,type=undefined,id=undefined;if(this.trackIds){id=this.popStack();}if(this.stringParams){type=this.popStack();context=this.popStack();}var hash=this.hash;if(context){hash.contexts[key]=context;}if(type){hash.types[key]=type;}if(id){hash.ids[key]=id;}hash.values[key]=value;},pushId:function pushId(type,name,child){if(type==='BlockParam'){this.pushStackLiteral('blockParams['+name[0]+'].path['+name[1]+']'+(child?' + '+JSON.stringify('.'+child):''));}else if(type==='PathExpression'){this.pushString(name);}else if(type==='SubExpression'){this.pushStackLiteral('true');}else {this.pushStackLiteral('null');}}, // HELPERS
compiler:JavaScriptCompiler,compileChildren:function compileChildren(environment,options){var children=environment.children,child=undefined,compiler=undefined;for(var i=0,l=children.length;i<l;i++){child=children[i];compiler=new this.compiler(); // eslint-disable-line new-cap
var index=this.matchExistingProgram(child);if(index==null){this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
index=this.context.programs.length;child.index=index;child.name='program'+index;this.context.programs[index]=compiler.compile(child,options,this.context,!this.precompile);this.context.decorators[index]=compiler.decorators;this.context.environments[index]=child;this.useDepths=this.useDepths||compiler.useDepths;this.useBlockParams=this.useBlockParams||compiler.useBlockParams;}else {child.index=index;child.name='program'+index;this.useDepths=this.useDepths||child.useDepths;this.useBlockParams=this.useBlockParams||child.useBlockParams;}}},matchExistingProgram:function matchExistingProgram(child){for(var i=0,len=this.context.environments.length;i<len;i++){var environment=this.context.environments[i];if(environment&&environment.equals(child)){return i;}}},programExpression:function programExpression(guid){var child=this.environment.children[guid],programParams=[child.index,'data',child.blockParams];if(this.useBlockParams||this.useDepths){programParams.push('blockParams');}if(this.useDepths){programParams.push('depths');}return 'container.program('+programParams.join(', ')+')';},useRegister:function useRegister(name){if(!this.registers[name]){this.registers[name]=true;this.registers.list.push(name);}},push:function push(expr){if(!(expr instanceof Literal)){expr=this.source.wrap(expr);}this.inlineStack.push(expr);return expr;},pushStackLiteral:function pushStackLiteral(item){this.push(new Literal(item));},pushSource:function pushSource(source){if(this.pendingContent){this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent),this.pendingLocation));this.pendingContent=undefined;}if(source){this.source.push(source);}},replaceStack:function replaceStack(callback){var prefix=['('],stack=undefined,createdStack=undefined,usedLiteral=undefined; /* istanbul ignore next */if(!this.isInline()){throw new _exception2['default']('replaceStack on non-inline');} // We want to merge the inline statement into the replacement statement via ','
var top=this.popStack(true);if(top instanceof Literal){ // Literals do not need to be inlined
stack=[top.value];prefix=['(',stack];usedLiteral=true;}else { // Get or create the current stack name for use by the inline
createdStack=true;var _name=this.incrStack();prefix=['((',this.push(_name),' = ',top,')'];stack=this.topStack();}var item=callback.call(this,stack);if(!usedLiteral){this.popStack();}if(createdStack){this.stackSlot--;}this.push(prefix.concat(item,')'));},incrStack:function incrStack(){this.stackSlot++;if(this.stackSlot>this.stackVars.length){this.stackVars.push('stack'+this.stackSlot);}return this.topStackName();},topStackName:function topStackName(){return 'stack'+this.stackSlot;},flushInline:function flushInline(){var inlineStack=this.inlineStack;this.inlineStack=[];for(var i=0,len=inlineStack.length;i<len;i++){var entry=inlineStack[i]; /* istanbul ignore if */if(entry instanceof Literal){this.compileStack.push(entry);}else {var stack=this.incrStack();this.pushSource([stack,' = ',entry,';']);this.compileStack.push(stack);}}},isInline:function isInline(){return this.inlineStack.length;},popStack:function popStack(wrapped){var inline=this.isInline(),item=(inline?this.inlineStack:this.compileStack).pop();if(!wrapped&&item instanceof Literal){return item.value;}else {if(!inline){ /* istanbul ignore next */if(!this.stackSlot){throw new _exception2['default']('Invalid stack pop');}this.stackSlot--;}return item;}},topStack:function topStack(){var stack=this.isInline()?this.inlineStack:this.compileStack,item=stack[stack.length-1]; /* istanbul ignore if */if(item instanceof Literal){return item.value;}else {return item;}},contextName:function contextName(context){if(this.useDepths&&context){return 'depths['+context+']';}else {return 'depth'+context;}},quotedString:function quotedString(str){return this.source.quotedString(str);},objectLiteral:function objectLiteral(obj){return this.source.objectLiteral(obj);},aliasable:function aliasable(name){var ret=this.aliases[name];if(ret){ret.referenceCount++;return ret;}ret=this.aliases[name]=this.source.wrap(name);ret.aliasable=true;ret.referenceCount=1;return ret;},setupHelper:function setupHelper(paramSize,name,blockHelper){var params=[],paramsInit=this.setupHelperArgs(name,paramSize,params,blockHelper);var foundHelper=this.nameLookup('helpers',name,'helper'),callContext=this.aliasable(this.contextName(0)+' != null ? '+this.contextName(0)+' : {}');return {params:params,paramsInit:paramsInit,name:foundHelper,callParams:[callContext].concat(params)};},setupParams:function setupParams(helper,paramSize,params){var options={},contexts=[],types=[],ids=[],objectArgs=!params,param=undefined;if(objectArgs){params=[];}options.name=this.quotedString(helper);options.hash=this.popStack();if(this.trackIds){options.hashIds=this.popStack();}if(this.stringParams){options.hashTypes=this.popStack();options.hashContexts=this.popStack();}var inverse=this.popStack(),program=this.popStack(); // Avoid setting fn and inverse if neither are set. This allows
// helpers to do a check for `if (options.fn)`
if(program||inverse){options.fn=program||'container.noop';options.inverse=inverse||'container.noop';} // The parameters go on to the stack in order (making sure that they are evaluated in order)
// so we need to pop them off the stack in reverse order
var i=paramSize;while(i--){param=this.popStack();params[i]=param;if(this.trackIds){ids[i]=this.popStack();}if(this.stringParams){types[i]=this.popStack();contexts[i]=this.popStack();}}if(objectArgs){options.args=this.source.generateArray(params);}if(this.trackIds){options.ids=this.source.generateArray(ids);}if(this.stringParams){options.types=this.source.generateArray(types);options.contexts=this.source.generateArray(contexts);}if(this.options.data){options.data='data';}if(this.useBlockParams){options.blockParams='blockParams';}return options;},setupHelperArgs:function setupHelperArgs(helper,paramSize,params,useRegister){var options=this.setupParams(helper,paramSize,params);options=this.objectLiteral(options);if(useRegister){this.useRegister('options');params.push('options');return ['options=',options];}else if(params){params.push(options);return '';}else {return options;}}};(function(){var reservedWords=('break else new var'+' case finally return void'+' catch for switch while'+' continue function this with'+' default if throw'+' delete in try'+' do instanceof typeof'+' abstract enum int short'+' boolean export interface static'+' byte extends long super'+' char final native synchronized'+' class float package throws'+' const goto private transient'+' debugger implements protected volatile'+' double import public let yield await'+' null true false').split(' ');var compilerWords=JavaScriptCompiler.RESERVED_WORDS={};for(var i=0,l=reservedWords.length;i<l;i++){compilerWords[reservedWords[i]]=true;}})();JavaScriptCompiler.isValidJavaScriptVariableName=function(name){return !JavaScriptCompiler.RESERVED_WORDS[name]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);};function strictLookup(requireTerminal,compiler,parts,type){var stack=compiler.popStack(),i=0,len=parts.length;if(requireTerminal){len--;}for(;i<len;i++){stack=compiler.nameLookup(stack,parts[i],type);}if(requireTerminal){return [compiler.aliasable('container.strict'),'(',stack,', ',compiler.quotedString(parts[i]),')'];}else {return stack;}}exports['default']=JavaScriptCompiler;module.exports=exports['default'];},{"../base":7,"../exception":20,"../utils":33,"./code-gen":10}],14:[function(require,module,exports){ /* istanbul ignore next */ /* Jison generated parser */"use strict";var handlebars=function(){var parser={trace:function trace(){},yy:{},symbols_:{"error":2,"root":3,"program":4,"EOF":5,"program_repetition0":6,"statement":7,"mustache":8,"block":9,"rawBlock":10,"partial":11,"partialBlock":12,"content":13,"COMMENT":14,"CONTENT":15,"openRawBlock":16,"rawBlock_repetition_plus0":17,"END_RAW_BLOCK":18,"OPEN_RAW_BLOCK":19,"helperName":20,"openRawBlock_repetition0":21,"openRawBlock_option0":22,"CLOSE_RAW_BLOCK":23,"openBlock":24,"block_option0":25,"closeBlock":26,"openInverse":27,"block_option1":28,"OPEN_BLOCK":29,"openBlock_repetition0":30,"openBlock_option0":31,"openBlock_option1":32,"CLOSE":33,"OPEN_INVERSE":34,"openInverse_repetition0":35,"openInverse_option0":36,"openInverse_option1":37,"openInverseChain":38,"OPEN_INVERSE_CHAIN":39,"openInverseChain_repetition0":40,"openInverseChain_option0":41,"openInverseChain_option1":42,"inverseAndProgram":43,"INVERSE":44,"inverseChain":45,"inverseChain_option0":46,"OPEN_ENDBLOCK":47,"OPEN":48,"mustache_repetition0":49,"mustache_option0":50,"OPEN_UNESCAPED":51,"mustache_repetition1":52,"mustache_option1":53,"CLOSE_UNESCAPED":54,"OPEN_PARTIAL":55,"partialName":56,"partial_repetition0":57,"partial_option0":58,"openPartialBlock":59,"OPEN_PARTIAL_BLOCK":60,"openPartialBlock_repetition0":61,"openPartialBlock_option0":62,"param":63,"sexpr":64,"OPEN_SEXPR":65,"sexpr_repetition0":66,"sexpr_option0":67,"CLOSE_SEXPR":68,"hash":69,"hash_repetition_plus0":70,"hashSegment":71,"ID":72,"EQUALS":73,"blockParams":74,"OPEN_BLOCK_PARAMS":75,"blockParams_repetition_plus0":76,"CLOSE_BLOCK_PARAMS":77,"path":78,"dataName":79,"STRING":80,"NUMBER":81,"BOOLEAN":82,"UNDEFINED":83,"NULL":84,"DATA":85,"pathSegments":86,"SEP":87,"$accept":0,"$end":1},terminals_:{2:"error",5:"EOF",14:"COMMENT",15:"CONTENT",18:"END_RAW_BLOCK",19:"OPEN_RAW_BLOCK",23:"CLOSE_RAW_BLOCK",29:"OPEN_BLOCK",33:"CLOSE",34:"OPEN_INVERSE",39:"OPEN_INVERSE_CHAIN",44:"INVERSE",47:"OPEN_ENDBLOCK",48:"OPEN",51:"OPEN_UNESCAPED",54:"CLOSE_UNESCAPED",55:"OPEN_PARTIAL",60:"OPEN_PARTIAL_BLOCK",65:"OPEN_SEXPR",68:"CLOSE_SEXPR",72:"ID",73:"EQUALS",75:"OPEN_BLOCK_PARAMS",77:"CLOSE_BLOCK_PARAMS",80:"STRING",81:"NUMBER",82:"BOOLEAN",83:"UNDEFINED",84:"NULL",85:"DATA",87:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[13,1],[10,3],[16,5],[9,4],[9,4],[24,6],[27,6],[38,6],[43,2],[45,3],[45,1],[26,3],[8,5],[8,5],[11,5],[12,3],[59,5],[63,1],[63,1],[64,5],[69,1],[71,3],[74,3],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[56,1],[56,1],[79,2],[78,1],[86,3],[86,1],[6,0],[6,2],[17,1],[17,2],[21,0],[21,2],[22,0],[22,1],[25,0],[25,1],[28,0],[28,1],[30,0],[30,2],[31,0],[31,1],[32,0],[32,1],[35,0],[35,2],[36,0],[36,1],[37,0],[37,1],[40,0],[40,2],[41,0],[41,1],[42,0],[42,1],[46,0],[46,1],[49,0],[49,2],[50,0],[50,1],[52,0],[52,2],[53,0],[53,1],[57,0],[57,2],[58,0],[58,1],[61,0],[61,2],[62,0],[62,1],[66,0],[66,2],[67,0],[67,1],[70,1],[70,2],[76,1],[76,2]],performAction:function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$ /**/){var $0=$$.length-1;switch(yystate){case 1:return $$[$0-1];break;case 2:this.$=yy.prepareProgram($$[$0]);break;case 3:this.$=$$[$0];break;case 4:this.$=$$[$0];break;case 5:this.$=$$[$0];break;case 6:this.$=$$[$0];break;case 7:this.$=$$[$0];break;case 8:this.$=$$[$0];break;case 9:this.$={type:'CommentStatement',value:yy.stripComment($$[$0]),strip:yy.stripFlags($$[$0],$$[$0]),loc:yy.locInfo(this._$)};break;case 10:this.$={type:'ContentStatement',original:$$[$0],value:$$[$0],loc:yy.locInfo(this._$)};break;case 11:this.$=yy.prepareRawBlock($$[$0-2],$$[$0-1],$$[$0],this._$);break;case 12:this.$={path:$$[$0-3],params:$$[$0-2],hash:$$[$0-1]};break;case 13:this.$=yy.prepareBlock($$[$0-3],$$[$0-2],$$[$0-1],$$[$0],false,this._$);break;case 14:this.$=yy.prepareBlock($$[$0-3],$$[$0-2],$$[$0-1],$$[$0],true,this._$);break;case 15:this.$={open:$$[$0-5],path:$$[$0-4],params:$$[$0-3],hash:$$[$0-2],blockParams:$$[$0-1],strip:yy.stripFlags($$[$0-5],$$[$0])};break;case 16:this.$={path:$$[$0-4],params:$$[$0-3],hash:$$[$0-2],blockParams:$$[$0-1],strip:yy.stripFlags($$[$0-5],$$[$0])};break;case 17:this.$={path:$$[$0-4],params:$$[$0-3],hash:$$[$0-2],blockParams:$$[$0-1],strip:yy.stripFlags($$[$0-5],$$[$0])};break;case 18:this.$={strip:yy.stripFlags($$[$0-1],$$[$0-1]),program:$$[$0]};break;case 19:var inverse=yy.prepareBlock($$[$0-2],$$[$0-1],$$[$0],$$[$0],false,this._$),program=yy.prepareProgram([inverse],$$[$0-1].loc);program.chained=true;this.$={strip:$$[$0-2].strip,program:program,chain:true};break;case 20:this.$=$$[$0];break;case 21:this.$={path:$$[$0-1],strip:yy.stripFlags($$[$0-2],$$[$0])};break;case 22:this.$=yy.prepareMustache($$[$0-3],$$[$0-2],$$[$0-1],$$[$0-4],yy.stripFlags($$[$0-4],$$[$0]),this._$);break;case 23:this.$=yy.prepareMustache($$[$0-3],$$[$0-2],$$[$0-1],$$[$0-4],yy.stripFlags($$[$0-4],$$[$0]),this._$);break;case 24:this.$={type:'PartialStatement',name:$$[$0-3],params:$$[$0-2],hash:$$[$0-1],indent:'',strip:yy.stripFlags($$[$0-4],$$[$0]),loc:yy.locInfo(this._$)};break;case 25:this.$=yy.preparePartialBlock($$[$0-2],$$[$0-1],$$[$0],this._$);break;case 26:this.$={path:$$[$0-3],params:$$[$0-2],hash:$$[$0-1],strip:yy.stripFlags($$[$0-4],$$[$0])};break;case 27:this.$=$$[$0];break;case 28:this.$=$$[$0];break;case 29:this.$={type:'SubExpression',path:$$[$0-3],params:$$[$0-2],hash:$$[$0-1],loc:yy.locInfo(this._$)};break;case 30:this.$={type:'Hash',pairs:$$[$0],loc:yy.locInfo(this._$)};break;case 31:this.$={type:'HashPair',key:yy.id($$[$0-2]),value:$$[$0],loc:yy.locInfo(this._$)};break;case 32:this.$=yy.id($$[$0-1]);break;case 33:this.$=$$[$0];break;case 34:this.$=$$[$0];break;case 35:this.$={type:'StringLiteral',value:$$[$0],original:$$[$0],loc:yy.locInfo(this._$)};break;case 36:this.$={type:'NumberLiteral',value:Number($$[$0]),original:Number($$[$0]),loc:yy.locInfo(this._$)};break;case 37:this.$={type:'BooleanLiteral',value:$$[$0]==='true',original:$$[$0]==='true',loc:yy.locInfo(this._$)};break;case 38:this.$={type:'UndefinedLiteral',original:undefined,value:undefined,loc:yy.locInfo(this._$)};break;case 39:this.$={type:'NullLiteral',original:null,value:null,loc:yy.locInfo(this._$)};break;case 40:this.$=$$[$0];break;case 41:this.$=$$[$0];break;case 42:this.$=yy.preparePath(true,$$[$0],this._$);break;case 43:this.$=yy.preparePath(false,$$[$0],this._$);break;case 44:$$[$0-2].push({part:yy.id($$[$0]),original:$$[$0],separator:$$[$0-1]});this.$=$$[$0-2];break;case 45:this.$=[{part:yy.id($$[$0]),original:$$[$0]}];break;case 46:this.$=[];break;case 47:$$[$0-1].push($$[$0]);break;case 48:this.$=[$$[$0]];break;case 49:$$[$0-1].push($$[$0]);break;case 50:this.$=[];break;case 51:$$[$0-1].push($$[$0]);break;case 58:this.$=[];break;case 59:$$[$0-1].push($$[$0]);break;case 64:this.$=[];break;case 65:$$[$0-1].push($$[$0]);break;case 70:this.$=[];break;case 71:$$[$0-1].push($$[$0]);break;case 78:this.$=[];break;case 79:$$[$0-1].push($$[$0]);break;case 82:this.$=[];break;case 83:$$[$0-1].push($$[$0]);break;case 86:this.$=[];break;case 87:$$[$0-1].push($$[$0]);break;case 90:this.$=[];break;case 91:$$[$0-1].push($$[$0]);break;case 94:this.$=[];break;case 95:$$[$0-1].push($$[$0]);break;case 98:this.$=[$$[$0]];break;case 99:$$[$0-1].push($$[$0]);break;case 100:this.$=[$$[$0]];break;case 101:$$[$0-1].push($$[$0]);break;}},table:[{3:1,4:2,5:[2,46],6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:[1,12],15:[1,20],16:17,19:[1,23],24:15,27:16,29:[1,21],34:[1,22],39:[2,2],44:[2,2],47:[2,2],48:[1,13],51:[1,14],55:[1,18],59:19,60:[1,24]},{1:[2,1]},{5:[2,47],14:[2,47],15:[2,47],19:[2,47],29:[2,47],34:[2,47],39:[2,47],44:[2,47],47:[2,47],48:[2,47],51:[2,47],55:[2,47],60:[2,47]},{5:[2,3],14:[2,3],15:[2,3],19:[2,3],29:[2,3],34:[2,3],39:[2,3],44:[2,3],47:[2,3],48:[2,3],51:[2,3],55:[2,3],60:[2,3]},{5:[2,4],14:[2,4],15:[2,4],19:[2,4],29:[2,4],34:[2,4],39:[2,4],44:[2,4],47:[2,4],48:[2,4],51:[2,4],55:[2,4],60:[2,4]},{5:[2,5],14:[2,5],15:[2,5],19:[2,5],29:[2,5],34:[2,5],39:[2,5],44:[2,5],47:[2,5],48:[2,5],51:[2,5],55:[2,5],60:[2,5]},{5:[2,6],14:[2,6],15:[2,6],19:[2,6],29:[2,6],34:[2,6],39:[2,6],44:[2,6],47:[2,6],48:[2,6],51:[2,6],55:[2,6],60:[2,6]},{5:[2,7],14:[2,7],15:[2,7],19:[2,7],29:[2,7],34:[2,7],39:[2,7],44:[2,7],47:[2,7],48:[2,7],51:[2,7],55:[2,7],60:[2,7]},{5:[2,8],14:[2,8],15:[2,8],19:[2,8],29:[2,8],34:[2,8],39:[2,8],44:[2,8],47:[2,8],48:[2,8],51:[2,8],55:[2,8],60:[2,8]},{5:[2,9],14:[2,9],15:[2,9],19:[2,9],29:[2,9],34:[2,9],39:[2,9],44:[2,9],47:[2,9],48:[2,9],51:[2,9],55:[2,9],60:[2,9]},{20:25,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:36,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:37,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{4:38,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{13:40,15:[1,20],17:39},{20:42,56:41,64:43,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:45,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{5:[2,10],14:[2,10],15:[2,10],18:[2,10],19:[2,10],29:[2,10],34:[2,10],39:[2,10],44:[2,10],47:[2,10],48:[2,10],51:[2,10],55:[2,10],60:[2,10]},{20:46,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:47,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:48,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:42,56:49,64:43,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[2,78],49:50,65:[2,78],72:[2,78],80:[2,78],81:[2,78],82:[2,78],83:[2,78],84:[2,78],85:[2,78]},{23:[2,33],33:[2,33],54:[2,33],65:[2,33],68:[2,33],72:[2,33],75:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33]},{23:[2,34],33:[2,34],54:[2,34],65:[2,34],68:[2,34],72:[2,34],75:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34]},{23:[2,35],33:[2,35],54:[2,35],65:[2,35],68:[2,35],72:[2,35],75:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35]},{23:[2,36],33:[2,36],54:[2,36],65:[2,36],68:[2,36],72:[2,36],75:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36]},{23:[2,37],33:[2,37],54:[2,37],65:[2,37],68:[2,37],72:[2,37],75:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37]},{23:[2,38],33:[2,38],54:[2,38],65:[2,38],68:[2,38],72:[2,38],75:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38]},{23:[2,39],33:[2,39],54:[2,39],65:[2,39],68:[2,39],72:[2,39],75:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39]},{23:[2,43],33:[2,43],54:[2,43],65:[2,43],68:[2,43],72:[2,43],75:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],87:[1,51]},{72:[1,35],86:52},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{52:53,54:[2,82],65:[2,82],72:[2,82],80:[2,82],81:[2,82],82:[2,82],83:[2,82],84:[2,82],85:[2,82]},{25:54,38:56,39:[1,58],43:57,44:[1,59],45:55,47:[2,54]},{28:60,43:61,44:[1,59],47:[2,56]},{13:63,15:[1,20],18:[1,62]},{15:[2,48],18:[2,48]},{33:[2,86],57:64,65:[2,86],72:[2,86],80:[2,86],81:[2,86],82:[2,86],83:[2,86],84:[2,86],85:[2,86]},{33:[2,40],65:[2,40],72:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40]},{33:[2,41],65:[2,41],72:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41]},{20:65,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:66,47:[1,67]},{30:68,33:[2,58],65:[2,58],72:[2,58],75:[2,58],80:[2,58],81:[2,58],82:[2,58],83:[2,58],84:[2,58],85:[2,58]},{33:[2,64],35:69,65:[2,64],72:[2,64],75:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64]},{21:70,23:[2,50],65:[2,50],72:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50]},{33:[2,90],61:71,65:[2,90],72:[2,90],80:[2,90],81:[2,90],82:[2,90],83:[2,90],84:[2,90],85:[2,90]},{20:75,33:[2,80],50:72,63:73,64:76,65:[1,44],69:74,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{72:[1,80]},{23:[2,42],33:[2,42],54:[2,42],65:[2,42],68:[2,42],72:[2,42],75:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],87:[1,51]},{20:75,53:81,54:[2,84],63:82,64:76,65:[1,44],69:83,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:84,47:[1,67]},{47:[2,55]},{4:85,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{47:[2,20]},{20:86,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:87,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{26:88,47:[1,67]},{47:[2,57]},{5:[2,11],14:[2,11],15:[2,11],19:[2,11],29:[2,11],34:[2,11],39:[2,11],44:[2,11],47:[2,11],48:[2,11],51:[2,11],55:[2,11],60:[2,11]},{15:[2,49],18:[2,49]},{20:75,33:[2,88],58:89,63:90,64:76,65:[1,44],69:91,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{65:[2,94],66:92,68:[2,94],72:[2,94],80:[2,94],81:[2,94],82:[2,94],83:[2,94],84:[2,94],85:[2,94]},{5:[2,25],14:[2,25],15:[2,25],19:[2,25],29:[2,25],34:[2,25],39:[2,25],44:[2,25],47:[2,25],48:[2,25],51:[2,25],55:[2,25],60:[2,25]},{20:93,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,31:94,33:[2,60],63:95,64:76,65:[1,44],69:96,70:77,71:78,72:[1,79],75:[2,60],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,33:[2,66],36:97,63:98,64:76,65:[1,44],69:99,70:77,71:78,72:[1,79],75:[2,66],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,22:100,23:[2,52],63:101,64:76,65:[1,44],69:102,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,33:[2,92],62:103,63:104,64:76,65:[1,44],69:105,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,106]},{33:[2,79],65:[2,79],72:[2,79],80:[2,79],81:[2,79],82:[2,79],83:[2,79],84:[2,79],85:[2,79]},{33:[2,81]},{23:[2,27],33:[2,27],54:[2,27],65:[2,27],68:[2,27],72:[2,27],75:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27]},{23:[2,28],33:[2,28],54:[2,28],65:[2,28],68:[2,28],72:[2,28],75:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28]},{23:[2,30],33:[2,30],54:[2,30],68:[2,30],71:107,72:[1,108],75:[2,30]},{23:[2,98],33:[2,98],54:[2,98],68:[2,98],72:[2,98],75:[2,98]},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],73:[1,109],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{23:[2,44],33:[2,44],54:[2,44],65:[2,44],68:[2,44],72:[2,44],75:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],87:[2,44]},{54:[1,110]},{54:[2,83],65:[2,83],72:[2,83],80:[2,83],81:[2,83],82:[2,83],83:[2,83],84:[2,83],85:[2,83]},{54:[2,85]},{5:[2,13],14:[2,13],15:[2,13],19:[2,13],29:[2,13],34:[2,13],39:[2,13],44:[2,13],47:[2,13],48:[2,13],51:[2,13],55:[2,13],60:[2,13]},{38:56,39:[1,58],43:57,44:[1,59],45:112,46:111,47:[2,76]},{33:[2,70],40:113,65:[2,70],72:[2,70],75:[2,70],80:[2,70],81:[2,70],82:[2,70],83:[2,70],84:[2,70],85:[2,70]},{47:[2,18]},{5:[2,14],14:[2,14],15:[2,14],19:[2,14],29:[2,14],34:[2,14],39:[2,14],44:[2,14],47:[2,14],48:[2,14],51:[2,14],55:[2,14],60:[2,14]},{33:[1,114]},{33:[2,87],65:[2,87],72:[2,87],80:[2,87],81:[2,87],82:[2,87],83:[2,87],84:[2,87],85:[2,87]},{33:[2,89]},{20:75,63:116,64:76,65:[1,44],67:115,68:[2,96],69:117,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,118]},{32:119,33:[2,62],74:120,75:[1,121]},{33:[2,59],65:[2,59],72:[2,59],75:[2,59],80:[2,59],81:[2,59],82:[2,59],83:[2,59],84:[2,59],85:[2,59]},{33:[2,61],75:[2,61]},{33:[2,68],37:122,74:123,75:[1,121]},{33:[2,65],65:[2,65],72:[2,65],75:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65]},{33:[2,67],75:[2,67]},{23:[1,124]},{23:[2,51],65:[2,51],72:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51]},{23:[2,53]},{33:[1,125]},{33:[2,91],65:[2,91],72:[2,91],80:[2,91],81:[2,91],82:[2,91],83:[2,91],84:[2,91],85:[2,91]},{33:[2,93]},{5:[2,22],14:[2,22],15:[2,22],19:[2,22],29:[2,22],34:[2,22],39:[2,22],44:[2,22],47:[2,22],48:[2,22],51:[2,22],55:[2,22],60:[2,22]},{23:[2,99],33:[2,99],54:[2,99],68:[2,99],72:[2,99],75:[2,99]},{73:[1,109]},{20:75,63:126,64:76,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,23],14:[2,23],15:[2,23],19:[2,23],29:[2,23],34:[2,23],39:[2,23],44:[2,23],47:[2,23],48:[2,23],51:[2,23],55:[2,23],60:[2,23]},{47:[2,19]},{47:[2,77]},{20:75,33:[2,72],41:127,63:128,64:76,65:[1,44],69:129,70:77,71:78,72:[1,79],75:[2,72],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,24],14:[2,24],15:[2,24],19:[2,24],29:[2,24],34:[2,24],39:[2,24],44:[2,24],47:[2,24],48:[2,24],51:[2,24],55:[2,24],60:[2,24]},{68:[1,130]},{65:[2,95],68:[2,95],72:[2,95],80:[2,95],81:[2,95],82:[2,95],83:[2,95],84:[2,95],85:[2,95]},{68:[2,97]},{5:[2,21],14:[2,21],15:[2,21],19:[2,21],29:[2,21],34:[2,21],39:[2,21],44:[2,21],47:[2,21],48:[2,21],51:[2,21],55:[2,21],60:[2,21]},{33:[1,131]},{33:[2,63]},{72:[1,133],76:132},{33:[1,134]},{33:[2,69]},{15:[2,12]},{14:[2,26],15:[2,26],19:[2,26],29:[2,26],34:[2,26],47:[2,26],48:[2,26],51:[2,26],55:[2,26],60:[2,26]},{23:[2,31],33:[2,31],54:[2,31],68:[2,31],72:[2,31],75:[2,31]},{33:[2,74],42:135,74:136,75:[1,121]},{33:[2,71],65:[2,71],72:[2,71],75:[2,71],80:[2,71],81:[2,71],82:[2,71],83:[2,71],84:[2,71],85:[2,71]},{33:[2,73],75:[2,73]},{23:[2,29],33:[2,29],54:[2,29],65:[2,29],68:[2,29],72:[2,29],75:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29]},{14:[2,15],15:[2,15],19:[2,15],29:[2,15],34:[2,15],39:[2,15],44:[2,15],47:[2,15],48:[2,15],51:[2,15],55:[2,15],60:[2,15]},{72:[1,138],77:[1,137]},{72:[2,100],77:[2,100]},{14:[2,16],15:[2,16],19:[2,16],29:[2,16],34:[2,16],44:[2,16],47:[2,16],48:[2,16],51:[2,16],55:[2,16],60:[2,16]},{33:[1,139]},{33:[2,75]},{33:[2,32]},{72:[2,101],77:[2,101]},{14:[2,17],15:[2,17],19:[2,17],29:[2,17],34:[2,17],39:[2,17],44:[2,17],47:[2,17],48:[2,17],51:[2,17],55:[2,17],60:[2,17]}],defaultActions:{4:[2,1],55:[2,55],57:[2,20],61:[2,57],74:[2,81],83:[2,85],87:[2,18],91:[2,89],102:[2,53],105:[2,93],111:[2,19],112:[2,77],117:[2,97],120:[2,63],123:[2,69],124:[2,12],136:[2,75],137:[2,32]},parseError:function parseError(str,hash){throw new Error(str);},parse:function parse(input){var self=this,stack=[0],vstack=[null],lstack=[],table=this.table,yytext="",yylineno=0,yyleng=0,recovering=0,TERROR=2,EOF=1;this.lexer.setInput(input);this.lexer.yy=this.yy;this.yy.lexer=this.lexer;this.yy.parser=this;if(typeof this.lexer.yylloc=="undefined")this.lexer.yylloc={};var yyloc=this.lexer.yylloc;lstack.push(yyloc);var ranges=this.lexer.options&&this.lexer.options.ranges;if(typeof this.yy.parseError==="function")this.parseError=this.yy.parseError;function popStack(n){stack.length=stack.length-2*n;vstack.length=vstack.length-n;lstack.length=lstack.length-n;}function lex(){var token;token=self.lexer.lex()||1;if(typeof token!=="number"){token=self.symbols_[token]||token;}return token;}var symbol,preErrorSymbol,state,action,a,r,yyval={},p,len,newState,expected;while(true){state=stack[stack.length-1];if(this.defaultActions[state]){action=this.defaultActions[state];}else {if(symbol===null||typeof symbol=="undefined"){symbol=lex();}action=table[state]&&table[state][symbol];}if(typeof action==="undefined"||!action.length||!action[0]){var errStr="";if(!recovering){expected=[];for(p in table[state]){if(this.terminals_[p]&&p>2){expected.push("'"+this.terminals_[p]+"'");}}if(this.lexer.showPosition){errStr="Parse error on line "+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(", ")+", got '"+(this.terminals_[symbol]||symbol)+"'";}else {errStr="Parse error on line "+(yylineno+1)+": Unexpected "+(symbol==1?"end of input":"'"+(this.terminals_[symbol]||symbol)+"'");}this.parseError(errStr,{text:this.lexer.match,token:this.terminals_[symbol]||symbol,line:this.lexer.yylineno,loc:yyloc,expected:expected});}}if(action[0] instanceof Array&&action.length>1){throw new Error("Parse Error: multiple actions possible at state: "+state+", token: "+symbol);}switch(action[0]){case 1:stack.push(symbol);vstack.push(this.lexer.yytext);lstack.push(this.lexer.yylloc);stack.push(action[1]);symbol=null;if(!preErrorSymbol){yyleng=this.lexer.yyleng;yytext=this.lexer.yytext;yylineno=this.lexer.yylineno;yyloc=this.lexer.yylloc;if(recovering>0)recovering--;}else {symbol=preErrorSymbol;preErrorSymbol=null;}break;case 2:len=this.productions_[action[1]][1];yyval.$=vstack[vstack.length-len];yyval._$={first_line:lstack[lstack.length-(len||1)].first_line,last_line:lstack[lstack.length-1].last_line,first_column:lstack[lstack.length-(len||1)].first_column,last_column:lstack[lstack.length-1].last_column};if(ranges){yyval._$.range=[lstack[lstack.length-(len||1)].range[0],lstack[lstack.length-1].range[1]];}r=this.performAction.call(yyval,yytext,yyleng,yylineno,this.yy,action[1],vstack,lstack);if(typeof r!=="undefined"){return r;}if(len){stack=stack.slice(0,-1*len*2);vstack=vstack.slice(0,-1*len);lstack=lstack.slice(0,-1*len);}stack.push(this.productions_[action[1]][0]);vstack.push(yyval.$);lstack.push(yyval._$);newState=table[stack[stack.length-2]][stack[stack.length-1]];stack.push(newState);break;case 3:return true;}}return true;}}; /* Jison generated lexer */var lexer=function(){var lexer={EOF:1,parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash);}else {throw new Error(str);}},setInput:function setInput(input){this._input=input;this._more=this._less=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match='';this.conditionStack=['INITIAL'];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges)this.yylloc.range=[0,0];this.offset=0;return this;},input:function input(){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++;}else {this.yylloc.last_column++;}if(this.options.ranges)this.yylloc.range[1]++;this._input=this._input.slice(1);return ch;},unput:function unput(ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1); //this.yyleng -= len;
this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1)this.yylineno-=lines.length-1;var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len];}return this;},more:function more(){this._more=true;return this;},less:function less(n){this.unput(this.match.slice(n));},pastInput:function pastInput(){var past=this.matched.substr(0,this.matched.length-this.match.length);return (past.length>20?'...':'')+past.substr(-20).replace(/\n/g,"");},upcomingInput:function upcomingInput(){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length);}return (next.substr(0,20)+(next.length>20?'...':'')).replace(/\n/g,"");},showPosition:function showPosition(){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^";},next:function next(){if(this.done){return this.EOF;}if(!this._input)this.done=true;var token,match,tempMatch,index,col,lines;if(!this._more){this.yytext='';this.match='';}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(!this.options.flex)break;}}if(match){lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines)this.yylineno+=lines.length;this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng];}this._more=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,rules[index],this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input)this.done=false;if(token)return token;else return;}if(this._input===""){return this.EOF;}else {return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),{text:"",token:null,line:this.yylineno});}},lex:function lex(){var r=this.next();if(typeof r!=='undefined'){return r;}else {return this.lex();}},begin:function begin(condition){this.conditionStack.push(condition);},popState:function popState(){return this.conditionStack.pop();},_currentRules:function _currentRules(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;},topState:function topState(){return this.conditionStack[this.conditionStack.length-2];},pushState:function begin(condition){this.begin(condition);}};lexer.options={};lexer.performAction=function anonymous(yy,yy_,$avoiding_name_collisions,YY_START /**/){function strip(start,end){return yy_.yytext=yy_.yytext.substr(start,yy_.yyleng-end);}var YYSTATE=YY_START;switch($avoiding_name_collisions){case 0:if(yy_.yytext.slice(-2)==="\\\\"){strip(0,1);this.begin("mu");}else if(yy_.yytext.slice(-1)==="\\"){strip(0,1);this.begin("emu");}else {this.begin("mu");}if(yy_.yytext)return 15;break;case 1:return 15;break;case 2:this.popState();return 15;break;case 3:this.begin('raw');return 15;break;case 4:this.popState(); // Should be using `this.topState()` below, but it currently
// returns the second top instead of the first top. Opened an
// issue about it at https://github.com/zaach/jison/issues/291
if(this.conditionStack[this.conditionStack.length-1]==='raw'){return 15;}else {yy_.yytext=yy_.yytext.substr(5,yy_.yyleng-9);return 'END_RAW_BLOCK';}break;case 5:return 15;break;case 6:this.popState();return 14;break;case 7:return 65;break;case 8:return 68;break;case 9:return 19;break;case 10:this.popState();this.begin('raw');return 23;break;case 11:return 55;break;case 12:return 60;break;case 13:return 29;break;case 14:return 47;break;case 15:this.popState();return 44;break;case 16:this.popState();return 44;break;case 17:return 34;break;case 18:return 39;break;case 19:return 51;break;case 20:return 48;break;case 21:this.unput(yy_.yytext);this.popState();this.begin('com');break;case 22:this.popState();return 14;break;case 23:return 48;break;case 24:return 73;break;case 25:return 72;break;case 26:return 72;break;case 27:return 87;break;case 28: // ignore whitespace
break;case 29:this.popState();return 54;break;case 30:this.popState();return 33;break;case 31:yy_.yytext=strip(1,2).replace(/\\"/g,'"');return 80;break;case 32:yy_.yytext=strip(1,2).replace(/\\'/g,"'");return 80;break;case 33:return 85;break;case 34:return 82;break;case 35:return 82;break;case 36:return 83;break;case 37:return 84;break;case 38:return 81;break;case 39:return 75;break;case 40:return 77;break;case 41:return 72;break;case 42:yy_.yytext=yy_.yytext.replace(/\\([\\\]])/g,'$1');return 72;break;case 43:return 'INVALID';break;case 44:return 5;break;}};lexer.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{(?=[^\/]))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#>)/,/^(?:\{\{(~)?#\*?)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?\*?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:undefined(?=([~}\s)])))/,/^(?:null(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[(\\\]|[^\]])*\])/,/^(?:.)/,/^(?:$)/];lexer.conditions={"mu":{"rules":[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[6],"inclusive":false},"raw":{"rules":[3,4,5],"inclusive":false},"INITIAL":{"rules":[0,1,44],"inclusive":true}};return lexer;}();parser.lexer=lexer;function Parser(){this.yy={};}Parser.prototype=parser;parser.Parser=Parser;return new Parser();}();exports.__esModule=true;exports['default']=handlebars;},{}],15:[function(require,module,exports){ /* eslint-disable new-cap */'use strict';exports.__esModule=true;exports.print=print;exports.PrintVisitor=PrintVisitor; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _visitor=require('./visitor');var _visitor2=_interopRequireDefault(_visitor);function print(ast){return new PrintVisitor().accept(ast);}function PrintVisitor(){this.padding=0;}PrintVisitor.prototype=new _visitor2['default']();PrintVisitor.prototype.pad=function(string){var out='';for(var i=0,l=this.padding;i<l;i++){out+='  ';}out+=string+'\n';return out;};PrintVisitor.prototype.Program=function(program){var out='',body=program.body,i=undefined,l=undefined;if(program.blockParams){var blockParams='BLOCK PARAMS: [';for(i=0,l=program.blockParams.length;i<l;i++){blockParams+=' '+program.blockParams[i];}blockParams+=' ]';out+=this.pad(blockParams);}for(i=0,l=body.length;i<l;i++){out+=this.accept(body[i]);}this.padding--;return out;};PrintVisitor.prototype.MustacheStatement=function(mustache){return this.pad('{{ '+this.SubExpression(mustache)+' }}');};PrintVisitor.prototype.Decorator=function(mustache){return this.pad('{{ DIRECTIVE '+this.SubExpression(mustache)+' }}');};PrintVisitor.prototype.BlockStatement=PrintVisitor.prototype.DecoratorBlock=function(block){var out='';out+=this.pad((block.type==='DecoratorBlock'?'DIRECTIVE ':'')+'BLOCK:');this.padding++;out+=this.pad(this.SubExpression(block));if(block.program){out+=this.pad('PROGRAM:');this.padding++;out+=this.accept(block.program);this.padding--;}if(block.inverse){if(block.program){this.padding++;}out+=this.pad('{{^}}');this.padding++;out+=this.accept(block.inverse);this.padding--;if(block.program){this.padding--;}}this.padding--;return out;};PrintVisitor.prototype.PartialStatement=function(partial){var content='PARTIAL:'+partial.name.original;if(partial.params[0]){content+=' '+this.accept(partial.params[0]);}if(partial.hash){content+=' '+this.accept(partial.hash);}return this.pad('{{> '+content+' }}');};PrintVisitor.prototype.PartialBlockStatement=function(partial){var content='PARTIAL BLOCK:'+partial.name.original;if(partial.params[0]){content+=' '+this.accept(partial.params[0]);}if(partial.hash){content+=' '+this.accept(partial.hash);}content+=' '+this.pad('PROGRAM:');this.padding++;content+=this.accept(partial.program);this.padding--;return this.pad('{{> '+content+' }}');};PrintVisitor.prototype.ContentStatement=function(content){return this.pad("CONTENT[ '"+content.value+"' ]");};PrintVisitor.prototype.CommentStatement=function(comment){return this.pad("{{! '"+comment.value+"' }}");};PrintVisitor.prototype.SubExpression=function(sexpr){var params=sexpr.params,paramStrings=[],hash=undefined;for(var i=0,l=params.length;i<l;i++){paramStrings.push(this.accept(params[i]));}params='['+paramStrings.join(', ')+']';hash=sexpr.hash?' '+this.accept(sexpr.hash):'';return this.accept(sexpr.path)+' '+params+hash;};PrintVisitor.prototype.PathExpression=function(id){var path=id.parts.join('/');return (id.data?'@':'')+'PATH:'+path;};PrintVisitor.prototype.StringLiteral=function(string){return '"'+string.value+'"';};PrintVisitor.prototype.NumberLiteral=function(number){return 'NUMBER{'+number.value+'}';};PrintVisitor.prototype.BooleanLiteral=function(bool){return 'BOOLEAN{'+bool.value+'}';};PrintVisitor.prototype.UndefinedLiteral=function(){return 'UNDEFINED';};PrintVisitor.prototype.NullLiteral=function(){return 'NULL';};PrintVisitor.prototype.Hash=function(hash){var pairs=hash.pairs,joinedPairs=[];for(var i=0,l=pairs.length;i<l;i++){joinedPairs.push(this.accept(pairs[i]));}return 'HASH{'+joinedPairs.join(', ')+'}';};PrintVisitor.prototype.HashPair=function(pair){return pair.key+'='+this.accept(pair.value);}; /* eslint-enable new-cap */},{"./visitor":16}],16:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _exception=require('../exception');var _exception2=_interopRequireDefault(_exception);function Visitor(){this.parents=[];}Visitor.prototype={constructor:Visitor,mutating:false, // Visits a given value. If mutating, will replace the value if necessary.
acceptKey:function acceptKey(node,name){var value=this.accept(node[name]);if(this.mutating){ // Hacky sanity check: This may have a few false positives for type for the helper
// methods but will generally do the right thing without a lot of overhead.
if(value&&!Visitor.prototype[value.type]){throw new _exception2['default']('Unexpected node type "'+value.type+'" found when accepting '+name+' on '+node.type);}node[name]=value;}}, // Performs an accept operation with added sanity check to ensure
// required keys are not removed.
acceptRequired:function acceptRequired(node,name){this.acceptKey(node,name);if(!node[name]){throw new _exception2['default'](node.type+' requires '+name);}}, // Traverses a given array. If mutating, empty respnses will be removed
// for child elements.
acceptArray:function acceptArray(array){for(var i=0,l=array.length;i<l;i++){this.acceptKey(array,i);if(!array[i]){array.splice(i,1);i--;l--;}}},accept:function accept(object){if(!object){return;} /* istanbul ignore next: Sanity code */if(!this[object.type]){throw new _exception2['default']('Unknown type: '+object.type,object);}if(this.current){this.parents.unshift(this.current);}this.current=object;var ret=this[object.type](object);this.current=this.parents.shift();if(!this.mutating||ret){return ret;}else if(ret!==false){return object;}},Program:function Program(program){this.acceptArray(program.body);},MustacheStatement:visitSubExpression,Decorator:visitSubExpression,BlockStatement:visitBlock,DecoratorBlock:visitBlock,PartialStatement:visitPartial,PartialBlockStatement:function PartialBlockStatement(partial){visitPartial.call(this,partial);this.acceptKey(partial,'program');},ContentStatement:function ContentStatement() /* content */{},CommentStatement:function CommentStatement() /* comment */{},SubExpression:visitSubExpression,PathExpression:function PathExpression() /* path */{},StringLiteral:function StringLiteral() /* string */{},NumberLiteral:function NumberLiteral() /* number */{},BooleanLiteral:function BooleanLiteral() /* bool */{},UndefinedLiteral:function UndefinedLiteral() /* literal */{},NullLiteral:function NullLiteral() /* literal */{},Hash:function Hash(hash){this.acceptArray(hash.pairs);},HashPair:function HashPair(pair){this.acceptRequired(pair,'value');}};function visitSubExpression(mustache){this.acceptRequired(mustache,'path');this.acceptArray(mustache.params);this.acceptKey(mustache,'hash');}function visitBlock(block){visitSubExpression.call(this,block);this.acceptKey(block,'program');this.acceptKey(block,'inverse');}function visitPartial(partial){this.acceptRequired(partial,'name');this.acceptArray(partial.params);this.acceptKey(partial,'hash');}exports['default']=Visitor;module.exports=exports['default'];},{"../exception":20}],17:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _visitor=require('./visitor');var _visitor2=_interopRequireDefault(_visitor);function WhitespaceControl(){var options=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];this.options=options;}WhitespaceControl.prototype=new _visitor2['default']();WhitespaceControl.prototype.Program=function(program){var doStandalone=!this.options.ignoreStandalone;var isRoot=!this.isRootSeen;this.isRootSeen=true;var body=program.body;for(var i=0,l=body.length;i<l;i++){var current=body[i],strip=this.accept(current);if(!strip){continue;}var _isPrevWhitespace=isPrevWhitespace(body,i,isRoot),_isNextWhitespace=isNextWhitespace(body,i,isRoot),openStandalone=strip.openStandalone&&_isPrevWhitespace,closeStandalone=strip.closeStandalone&&_isNextWhitespace,inlineStandalone=strip.inlineStandalone&&_isPrevWhitespace&&_isNextWhitespace;if(strip.close){omitRight(body,i,true);}if(strip.open){omitLeft(body,i,true);}if(doStandalone&&inlineStandalone){omitRight(body,i);if(omitLeft(body,i)){ // If we are on a standalone node, save the indent info for partials
if(current.type==='PartialStatement'){ // Pull out the whitespace from the final line
current.indent=/([ \t]+$)/.exec(body[i-1].original)[1];}}}if(doStandalone&&openStandalone){omitRight((current.program||current.inverse).body); // Strip out the previous content node if it's whitespace only
omitLeft(body,i);}if(doStandalone&&closeStandalone){ // Always strip the next node
omitRight(body,i);omitLeft((current.inverse||current.program).body);}}return program;};WhitespaceControl.prototype.BlockStatement=WhitespaceControl.prototype.DecoratorBlock=WhitespaceControl.prototype.PartialBlockStatement=function(block){this.accept(block.program);this.accept(block.inverse); // Find the inverse program that is involed with whitespace stripping.
var program=block.program||block.inverse,inverse=block.program&&block.inverse,firstInverse=inverse,lastInverse=inverse;if(inverse&&inverse.chained){firstInverse=inverse.body[0].program; // Walk the inverse chain to find the last inverse that is actually in the chain.
while(lastInverse.chained){lastInverse=lastInverse.body[lastInverse.body.length-1].program;}}var strip={open:block.openStrip.open,close:block.closeStrip.close, // Determine the standalone candiacy. Basically flag our content as being possibly standalone
// so our parent can determine if we actually are standalone
openStandalone:isNextWhitespace(program.body),closeStandalone:isPrevWhitespace((firstInverse||program).body)};if(block.openStrip.close){omitRight(program.body,null,true);}if(inverse){var inverseStrip=block.inverseStrip;if(inverseStrip.open){omitLeft(program.body,null,true);}if(inverseStrip.close){omitRight(firstInverse.body,null,true);}if(block.closeStrip.open){omitLeft(lastInverse.body,null,true);} // Find standalone else statments
if(!this.options.ignoreStandalone&&isPrevWhitespace(program.body)&&isNextWhitespace(firstInverse.body)){omitLeft(program.body);omitRight(firstInverse.body);}}else if(block.closeStrip.open){omitLeft(program.body,null,true);}return strip;};WhitespaceControl.prototype.Decorator=WhitespaceControl.prototype.MustacheStatement=function(mustache){return mustache.strip;};WhitespaceControl.prototype.PartialStatement=WhitespaceControl.prototype.CommentStatement=function(node){ /* istanbul ignore next */var strip=node.strip||{};return {inlineStandalone:true,open:strip.open,close:strip.close};};function isPrevWhitespace(body,i,isRoot){if(i===undefined){i=body.length;} // Nodes that end with newlines are considered whitespace (but are special
// cased for strip operations)
var prev=body[i-1],sibling=body[i-2];if(!prev){return isRoot;}if(prev.type==='ContentStatement'){return (sibling||!isRoot?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(prev.original);}}function isNextWhitespace(body,i,isRoot){if(i===undefined){i=-1;}var next=body[i+1],sibling=body[i+2];if(!next){return isRoot;}if(next.type==='ContentStatement'){return (sibling||!isRoot?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(next.original);}} // Marks the node to the right of the position as omitted.
// I.e. {{foo}}' ' will mark the ' ' node as omitted.
//
// If i is undefined, then the first child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitRight(body,i,multiple){var current=body[i==null?0:i+1];if(!current||current.type!=='ContentStatement'||!multiple&&current.rightStripped){return;}var original=current.value;current.value=current.value.replace(multiple?/^\s+/:/^[ \t]*\r?\n?/,'');current.rightStripped=current.value!==original;} // Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
//
// If mulitple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitLeft(body,i,multiple){var current=body[i==null?body.length-1:i-1];if(!current||current.type!=='ContentStatement'||!multiple&&current.leftStripped){return;} // We omit the last node if it's whitespace only and not preceeded by a non-content node.
var original=current.value;current.value=current.value.replace(multiple?/\s+$/:/[ \t]+$/,'');current.leftStripped=current.value!==original;return current.leftStripped;}exports['default']=WhitespaceControl;module.exports=exports['default'];},{"./visitor":16}],18:[function(require,module,exports){'use strict';exports.__esModule=true;exports.registerDefaultDecorators=registerDefaultDecorators; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _decoratorsInline=require('./decorators/inline');var _decoratorsInline2=_interopRequireDefault(_decoratorsInline);function registerDefaultDecorators(instance){_decoratorsInline2['default'](instance);}},{"./decorators/inline":19}],19:[function(require,module,exports){'use strict';exports.__esModule=true;var _utils=require('../utils');exports['default']=function(instance){instance.registerDecorator('inline',function(fn,props,container,options){var ret=fn;if(!props.partials){props.partials={};ret=function ret(context,options){ // Create a new partials stack frame prior to exec.
var original=container.partials;container.partials=_utils.extend({},original,props.partials);var ret=fn(context,options);container.partials=original;return ret;};}props.partials[options.args[0]]=options.fn;return ret;});};module.exports=exports['default'];},{"../utils":33}],20:[function(require,module,exports){'use strict';exports.__esModule=true;var errorProps=['description','fileName','lineNumber','message','name','number','stack'];function Exception(message,node){var loc=node&&node.loc,line=undefined,column=undefined;if(loc){line=loc.start.line;column=loc.start.column;message+=' - '+line+':'+column;}var tmp=Error.prototype.constructor.call(this,message); // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
for(var idx=0;idx<errorProps.length;idx++){this[errorProps[idx]]=tmp[errorProps[idx]];} /* istanbul ignore else */if(Error.captureStackTrace){Error.captureStackTrace(this,Exception);}if(loc){this.lineNumber=line;this.column=column;}}Exception.prototype=new Error();exports['default']=Exception;module.exports=exports['default'];},{}],21:[function(require,module,exports){'use strict';exports.__esModule=true;exports.registerDefaultHelpers=registerDefaultHelpers; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _helpersBlockHelperMissing=require('./helpers/block-helper-missing');var _helpersBlockHelperMissing2=_interopRequireDefault(_helpersBlockHelperMissing);var _helpersEach=require('./helpers/each');var _helpersEach2=_interopRequireDefault(_helpersEach);var _helpersHelperMissing=require('./helpers/helper-missing');var _helpersHelperMissing2=_interopRequireDefault(_helpersHelperMissing);var _helpersIf=require('./helpers/if');var _helpersIf2=_interopRequireDefault(_helpersIf);var _helpersLog=require('./helpers/log');var _helpersLog2=_interopRequireDefault(_helpersLog);var _helpersLookup=require('./helpers/lookup');var _helpersLookup2=_interopRequireDefault(_helpersLookup);var _helpersWith=require('./helpers/with');var _helpersWith2=_interopRequireDefault(_helpersWith);function registerDefaultHelpers(instance){_helpersBlockHelperMissing2['default'](instance);_helpersEach2['default'](instance);_helpersHelperMissing2['default'](instance);_helpersIf2['default'](instance);_helpersLog2['default'](instance);_helpersLookup2['default'](instance);_helpersWith2['default'](instance);}},{"./helpers/block-helper-missing":22,"./helpers/each":23,"./helpers/helper-missing":24,"./helpers/if":25,"./helpers/log":26,"./helpers/lookup":27,"./helpers/with":28}],22:[function(require,module,exports){'use strict';exports.__esModule=true;var _utils=require('../utils');exports['default']=function(instance){instance.registerHelper('blockHelperMissing',function(context,options){var inverse=options.inverse,fn=options.fn;if(context===true){return fn(this);}else if(context===false||context==null){return inverse(this);}else if(_utils.isArray(context)){if(context.length>0){if(options.ids){options.ids=[options.name];}return instance.helpers.each(context,options);}else {return inverse(this);}}else {if(options.data&&options.ids){var data=_utils.createFrame(options.data);data.contextPath=_utils.appendContextPath(options.data.contextPath,options.name);options={data:data};}return fn(context,options);}});};module.exports=exports['default'];},{"../utils":33}],23:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _utils=require('../utils');var _exception=require('../exception');var _exception2=_interopRequireDefault(_exception);exports['default']=function(instance){instance.registerHelper('each',function(context,options){if(!options){throw new _exception2['default']('Must pass iterator to #each');}var fn=options.fn,inverse=options.inverse,i=0,ret='',data=undefined,contextPath=undefined;if(options.data&&options.ids){contextPath=_utils.appendContextPath(options.data.contextPath,options.ids[0])+'.';}if(_utils.isFunction(context)){context=context.call(this);}if(options.data){data=_utils.createFrame(options.data);}function execIteration(field,index,last){if(data){data.key=field;data.index=index;data.first=index===0;data.last=!!last;if(contextPath){data.contextPath=contextPath+field;}}ret=ret+fn(context[field],{data:data,blockParams:_utils.blockParams([context[field],field],[contextPath+field,null])});}if(context&&(typeof context==="undefined"?"undefined":_typeof2(context))==='object'){if(_utils.isArray(context)){for(var j=context.length;i<j;i++){if(i in context){execIteration(i,i,i===context.length-1);}}}else {var priorKey=undefined;for(var key in context){if(context.hasOwnProperty(key)){ // We're running the iterations one step out of sync so we can detect
// the last iteration without have to scan the object twice and create
// an itermediate keys array.
if(priorKey!==undefined){execIteration(priorKey,i-1);}priorKey=key;i++;}}if(priorKey!==undefined){execIteration(priorKey,i-1,true);}}}if(i===0){ret=inverse(this);}return ret;});};module.exports=exports['default'];},{"../exception":20,"../utils":33}],24:[function(require,module,exports){'use strict';exports.__esModule=true; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};}var _exception=require('../exception');var _exception2=_interopRequireDefault(_exception);exports['default']=function(instance){instance.registerHelper('helperMissing',function() /* [args, ]options */{if(arguments.length===1){ // A missing field in a {{foo}} construct.
return undefined;}else { // Someone is actually trying to call something, blow up.
throw new _exception2['default']('Missing helper: "'+arguments[arguments.length-1].name+'"');}});};module.exports=exports['default'];},{"../exception":20}],25:[function(require,module,exports){'use strict';exports.__esModule=true;var _utils=require('../utils');exports['default']=function(instance){instance.registerHelper('if',function(conditional,options){if(_utils.isFunction(conditional)){conditional=conditional.call(this);} // Default behavior is to render the positive path if the value is truthy and not empty.
// The `includeZero` option may be set to treat the condtional as purely not empty based on the
// behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
if(!options.hash.includeZero&&!conditional||_utils.isEmpty(conditional)){return options.inverse(this);}else {return options.fn(this);}});instance.registerHelper('unless',function(conditional,options){return instance.helpers['if'].call(this,conditional,{fn:options.inverse,inverse:options.fn,hash:options.hash});});};module.exports=exports['default'];},{"../utils":33}],26:[function(require,module,exports){'use strict';exports.__esModule=true;exports['default']=function(instance){instance.registerHelper('log',function() /* message, options */{var args=[undefined],options=arguments[arguments.length-1];for(var i=0;i<arguments.length-1;i++){args.push(arguments[i]);}var level=1;if(options.hash.level!=null){level=options.hash.level;}else if(options.data&&options.data.level!=null){level=options.data.level;}args[0]=level;instance.log.apply(instance,args);});};module.exports=exports['default'];},{}],27:[function(require,module,exports){'use strict';exports.__esModule=true;exports['default']=function(instance){instance.registerHelper('lookup',function(obj,field){return obj&&obj[field];});};module.exports=exports['default'];},{}],28:[function(require,module,exports){'use strict';exports.__esModule=true;var _utils=require('../utils');exports['default']=function(instance){instance.registerHelper('with',function(context,options){if(_utils.isFunction(context)){context=context.call(this);}var fn=options.fn;if(!_utils.isEmpty(context)){var data=options.data;if(options.data&&options.ids){data=_utils.createFrame(options.data);data.contextPath=_utils.appendContextPath(options.data.contextPath,options.ids[0]);}return fn(context,{data:data,blockParams:_utils.blockParams([context],[data&&data.contextPath])});}else {return options.inverse(this);}});};module.exports=exports['default'];},{"../utils":33}],29:[function(require,module,exports){'use strict';exports.__esModule=true;var _utils=require('./utils');var logger={methodMap:['debug','info','warn','error'],level:'info', // Maps a given level value to the `methodMap` indexes above.
lookupLevel:function lookupLevel(level){if(typeof level==='string'){var levelMap=_utils.indexOf(logger.methodMap,level.toLowerCase());if(levelMap>=0){level=levelMap;}else {level=parseInt(level,10);}}return level;}, // Can be overridden in the host environment
log:function log(level){level=logger.lookupLevel(level);if(typeof console!=='undefined'&&logger.lookupLevel(logger.level)<=level){var method=logger.methodMap[level];if(!console[method]){ // eslint-disable-line no-console
method='log';}for(var _len=arguments.length,message=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){message[_key-1]=arguments[_key];}console[method].apply(console,message); // eslint-disable-line no-console
}}};exports['default']=logger;module.exports=exports['default'];},{"./utils":33}],30:[function(require,module,exports){(function(global){ /* global window */'use strict';exports.__esModule=true;exports['default']=function(Handlebars){ /* istanbul ignore next */var root=typeof global!=='undefined'?global:window,$Handlebars=root.Handlebars; /* istanbul ignore next */Handlebars.noConflict=function(){if(root.Handlebars===Handlebars){root.Handlebars=$Handlebars;}return Handlebars;};};module.exports=exports['default'];}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],31:[function(require,module,exports){'use strict';exports.__esModule=true;exports.checkRevision=checkRevision;exports.template=template;exports.wrapProgram=wrapProgram;exports.resolvePartial=resolvePartial;exports.invokePartial=invokePartial;exports.noop=noop; // istanbul ignore next
function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{'default':obj};} // istanbul ignore next
function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else {var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj['default']=obj;return newObj;}}var _utils=require('./utils');var Utils=_interopRequireWildcard(_utils);var _exception=require('./exception');var _exception2=_interopRequireDefault(_exception);var _base=require('./base');function checkRevision(compilerInfo){var compilerRevision=compilerInfo&&compilerInfo[0]||1,currentRevision=_base.COMPILER_REVISION;if(compilerRevision!==currentRevision){if(compilerRevision<currentRevision){var runtimeVersions=_base.REVISION_CHANGES[currentRevision],compilerVersions=_base.REVISION_CHANGES[compilerRevision];throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. '+'Please update your precompiler to a newer version ('+runtimeVersions+') or downgrade your runtime to an older version ('+compilerVersions+').');}else { // Use the embedded version info since the runtime doesn't know about this revision yet
throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. '+'Please update your runtime to a newer version ('+compilerInfo[1]+').');}}}function template(templateSpec,env){ /* istanbul ignore next */if(!env){throw new _exception2['default']('No environment passed to template');}if(!templateSpec||!templateSpec.main){throw new _exception2['default']('Unknown template object: '+(typeof templateSpec==="undefined"?"undefined":_typeof2(templateSpec)));}templateSpec.main.decorator=templateSpec.main_d; // Note: Using env.VM references rather than local var references throughout this section to allow
// for external users to override these as psuedo-supported APIs.
env.VM.checkRevision(templateSpec.compiler);function invokePartialWrapper(partial,context,options){if(options.hash){context=Utils.extend({},context,options.hash);if(options.ids){options.ids[0]=true;}}partial=env.VM.resolvePartial.call(this,partial,context,options);var result=env.VM.invokePartial.call(this,partial,context,options);if(result==null&&env.compile){options.partials[options.name]=env.compile(partial,templateSpec.compilerOptions,env);result=options.partials[options.name](context,options);}if(result!=null){if(options.indent){var lines=result.split('\n');for(var i=0,l=lines.length;i<l;i++){if(!lines[i]&&i+1===l){break;}lines[i]=options.indent+lines[i];}result=lines.join('\n');}return result;}else {throw new _exception2['default']('The partial '+options.name+' could not be compiled when running in runtime-only mode');}} // Just add water
var container={strict:function strict(obj,name){if(!(name in obj)){throw new _exception2['default']('"'+name+'" not defined in '+obj);}return obj[name];},lookup:function lookup(depths,name){var len=depths.length;for(var i=0;i<len;i++){if(depths[i]&&depths[i][name]!=null){return depths[i][name];}}},lambda:function lambda(current,context){return typeof current==='function'?current.call(context):current;},escapeExpression:Utils.escapeExpression,invokePartial:invokePartialWrapper,fn:function fn(i){var ret=templateSpec[i];ret.decorator=templateSpec[i+'_d'];return ret;},programs:[],program:function program(i,data,declaredBlockParams,blockParams,depths){var programWrapper=this.programs[i],fn=this.fn(i);if(data||depths||blockParams||declaredBlockParams){programWrapper=wrapProgram(this,i,fn,data,declaredBlockParams,blockParams,depths);}else if(!programWrapper){programWrapper=this.programs[i]=wrapProgram(this,i,fn);}return programWrapper;},data:function data(value,depth){while(value&&depth--){value=value._parent;}return value;},merge:function merge(param,common){var obj=param||common;if(param&&common&&param!==common){obj=Utils.extend({},common,param);}return obj;},noop:env.VM.noop,compilerInfo:templateSpec.compiler};function ret(context){var options=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];var data=options.data;ret._setup(options);if(!options.partial&&templateSpec.useData){data=initData(context,data);}var depths=undefined,blockParams=templateSpec.useBlockParams?[]:undefined;if(templateSpec.useDepths){if(options.depths){depths=context!==options.depths[0]?[context].concat(options.depths):options.depths;}else {depths=[context];}}function main(context /*, options*/){return ''+templateSpec.main(container,context,container.helpers,container.partials,data,blockParams,depths);}main=executeDecorators(templateSpec.main,main,container,options.depths||[],data,blockParams);return main(context,options);}ret.isTop=true;ret._setup=function(options){if(!options.partial){container.helpers=container.merge(options.helpers,env.helpers);if(templateSpec.usePartial){container.partials=container.merge(options.partials,env.partials);}if(templateSpec.usePartial||templateSpec.useDecorators){container.decorators=container.merge(options.decorators,env.decorators);}}else {container.helpers=options.helpers;container.partials=options.partials;container.decorators=options.decorators;}};ret._child=function(i,data,blockParams,depths){if(templateSpec.useBlockParams&&!blockParams){throw new _exception2['default']('must pass block params');}if(templateSpec.useDepths&&!depths){throw new _exception2['default']('must pass parent depths');}return wrapProgram(container,i,templateSpec[i],data,0,blockParams,depths);};return ret;}function wrapProgram(container,i,fn,data,declaredBlockParams,blockParams,depths){function prog(context){var options=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];var currentDepths=depths;if(depths&&context!==depths[0]){currentDepths=[context].concat(depths);}return fn(container,context,container.helpers,container.partials,options.data||data,blockParams&&[options.blockParams].concat(blockParams),currentDepths);}prog=executeDecorators(fn,prog,container,depths,data,blockParams);prog.program=i;prog.depth=depths?depths.length:0;prog.blockParams=declaredBlockParams||0;return prog;}function resolvePartial(partial,context,options){if(!partial){if(options.name==='@partial-block'){partial=options.data['partial-block'];}else {partial=options.partials[options.name];}}else if(!partial.call&&!options.name){ // This is a dynamic partial that returned a string
options.name=partial;partial=options.partials[partial];}return partial;}function invokePartial(partial,context,options){options.partial=true;if(options.ids){options.data.contextPath=options.ids[0]||options.data.contextPath;}var partialBlock=undefined;if(options.fn&&options.fn!==noop){options.data=_base.createFrame(options.data);partialBlock=options.data['partial-block']=options.fn;if(partialBlock.partials){options.partials=Utils.extend({},options.partials,partialBlock.partials);}}if(partial===undefined&&partialBlock){partial=partialBlock;}if(partial===undefined){throw new _exception2['default']('The partial '+options.name+' could not be found');}else if(partial instanceof Function){return partial(context,options);}}function noop(){return '';}function initData(context,data){if(!data||!('root' in data)){data=data?_base.createFrame(data):{};data.root=context;}return data;}function executeDecorators(fn,prog,container,depths,data,blockParams){if(fn.decorator){var props={};prog=fn.decorator(prog,props,container,depths&&depths[0],data,blockParams,depths);Utils.extend(prog,props);}return prog;}},{"./base":7,"./exception":20,"./utils":33}],32:[function(require,module,exports){ // Build out our basic SafeString type
'use strict';exports.__esModule=true;function SafeString(string){this.string=string;}SafeString.prototype.toString=SafeString.prototype.toHTML=function(){return ''+this.string;};exports['default']=SafeString;module.exports=exports['default'];},{}],33:[function(require,module,exports){'use strict';exports.__esModule=true;exports.extend=extend;exports.indexOf=indexOf;exports.escapeExpression=escapeExpression;exports.isEmpty=isEmpty;exports.createFrame=createFrame;exports.blockParams=blockParams;exports.appendContextPath=appendContextPath;var escape={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','`':'&#x60;','=':'&#x3D;'};var badChars=/[&<>"'`=]/g,possible=/[&<>"'`=]/;function escapeChar(chr){return escape[chr];}function extend(obj /* , ...source */){for(var i=1;i<arguments.length;i++){for(var key in arguments[i]){if(Object.prototype.hasOwnProperty.call(arguments[i],key)){obj[key]=arguments[i][key];}}}return obj;}var toString=Object.prototype.toString;exports.toString=toString; // Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */var isFunction=function isFunction(value){return typeof value==='function';}; // fallback for older versions of Chrome and Safari
/* istanbul ignore next */if(isFunction(/x/)){exports.isFunction=isFunction=function isFunction(value){return typeof value==='function'&&toString.call(value)==='[object Function]';};}exports.isFunction=isFunction; /* eslint-enable func-style */ /* istanbul ignore next */var isArray=Array.isArray||function(value){return value&&(typeof value==="undefined"?"undefined":_typeof2(value))==='object'?toString.call(value)==='[object Array]':false;};exports.isArray=isArray; // Older IE versions do not directly support indexOf so we must implement our own, sadly.
function indexOf(array,value){for(var i=0,len=array.length;i<len;i++){if(array[i]===value){return i;}}return -1;}function escapeExpression(string){if(typeof string!=='string'){ // don't escape SafeStrings, since they're already safe
if(string&&string.toHTML){return string.toHTML();}else if(string==null){return '';}else if(!string){return string+'';} // Force a string conversion as this will be done by the append regardless and
// the regex test will do this transparently behind the scenes, causing issues if
// an object's to string has escaped characters in it.
string=''+string;}if(!possible.test(string)){return string;}return string.replace(badChars,escapeChar);}function isEmpty(value){if(!value&&value!==0){return true;}else if(isArray(value)&&value.length===0){return true;}else {return false;}}function createFrame(object){var frame=extend({},object);frame._parent=object;return frame;}function blockParams(params,ids){params.path=ids;return params;}function appendContextPath(contextPath,id){return (contextPath?contextPath+'.':'')+id;}},{}],34:[function(require,module,exports){ // USAGE:
// var handlebars = require('handlebars');
/* eslint-disable no-var */ // var local = handlebars.create();
var handlebars=require('../dist/cjs/handlebars')['default'];var printer=require('../dist/cjs/handlebars/compiler/printer');handlebars.PrintVisitor=printer.PrintVisitor;handlebars.print=printer.print;module.exports=handlebars; // Publish a Node.js require() handler for .handlebars and .hbs files
function extension(module,filename){var fs=require('fs');var templateString=fs.readFileSync(filename,'utf8');module.exports=handlebars.compile(templateString);} /* istanbul ignore else */if(typeof require!=='undefined'&&require.extensions){require.extensions['.handlebars']=extension;require.extensions['.hbs']=extension;}},{"../dist/cjs/handlebars":5,"../dist/cjs/handlebars/compiler/printer":15,"fs":2}],35:[function(require,module,exports){(function(global){ // Best place to find information on XHR features is:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
var reqfields=['responseType','withCredentials','timeout','onprogress']; // Simple and small ajax function
// Takes a parameters object and a callback function
// Parameters:
//  - url: string, required
//  - headers: object of `{header_name: header_value, ...}`
//  - body:
//      + string (sets content type to 'application/x-www-form-urlencoded' if not set in headers)
//      + FormData (doesn't set content type so that browser will set as appropriate)
//  - method: 'GET', 'POST', etc. Defaults to 'GET' or 'POST' based on body
//  - cors: If your using cross-origin, you will need this true for IE8-9
//
// The following parameters are passed onto the xhr object.
// IMPORTANT NOTE: The caller is responsible for compatibility checking.
//  - responseType: string, various compatability, see xhr docs for enum options
//  - withCredentials: boolean, IE10+, CORS only
//  - timeout: long, ms timeout, IE8+
//  - onprogress: callback, IE10+
//
// Callback function prototype:
//  - statusCode from request
//  - response
//    + if responseType set and supported by browser, this is an object of some type (see docs)
//    + otherwise if request completed, this is the string text of the response
//    + if request is aborted, this is "Abort"
//    + if request times out, this is "Timeout"
//    + if request errors before completing (probably a CORS issue), this is "Error"
//  - request object
//
// Returns the request object. So you can call .abort() or other methods
//
// DEPRECATIONS:
//  - Passing a string instead of the params object has been removed!
//
exports.ajax=function(params,callback){ // Any variable used more than once is var'd here because
// minification will munge the variables whereas it can't munge
// the object access.
var headers=params.headers||{},body=params.body,method=params.method||(body?'POST':'GET'),called=false;var req=getRequest(params.cors);function cb(statusCode,responseText){return function(){if(!called){callback(req.status===undefined?statusCode:req.status,req.status===0?"Error":req.response||req.responseText||responseText,req);called=true;}};}req.open(method,params.url,true);var success=req.onload=cb(200);req.onreadystatechange=function(){if(req.readyState===4)success();};req.onerror=cb(null,'Error');req.ontimeout=cb(null,'Timeout');req.onabort=cb(null,'Abort');if(body){setDefault(headers,'X-Requested-With','XMLHttpRequest');if(!global.FormData||!(body instanceof global.FormData)){setDefault(headers,'Content-Type','application/x-www-form-urlencoded');}}for(var i=0,len=reqfields.length,field;i<len;i++){field=reqfields[i];if(params[field]!==undefined)req[field]=params[field];}for(var field in headers){req.setRequestHeader(field,headers[field]);}req.send(body);return req;};function getRequest(cors){ // XDomainRequest is only way to do CORS in IE 8 and 9
// But XDomainRequest isn't standards-compatible
// Notably, it doesn't allow cookies to be sent or set by servers
// IE 10+ is standards-compatible in its XMLHttpRequest
// but IE 10 can still have an XDomainRequest object, so we don't want to use it
if(cors&&global.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent))return new XDomainRequest();if(global.XMLHttpRequest)return new XMLHttpRequest();}function setDefault(obj,key,value){obj[key]=obj[key]||value;}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],36:[function(require,module,exports){module.exports=function(on){var i=0,registered=[],add=function add(handler,invocant){var ident=i++;registered[ident]=[handler,invocant||on];return function(){delete registered[ident];};};add._fire=function(){for(var i=0,l=registered.length;i<l;i++){if(registered[i]){registered[i][0].apply(registered[i][1],arguments);}}};add._removeAll=function(){registered=[];};return add;};},{}],37:[function(require,module,exports){(function(process){ // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts,allowAboveRoot){ // if the path tries to go above the root, `up` ends up > 0
var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==='.'){parts.splice(i,1);}else if(last==='..'){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}} // if the path is allowed to go above the root, restore leading ..s
if(allowAboveRoot){for(;up--;up){parts.unshift('..');}}return parts;} // Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;var splitPath=function splitPath(filename){return splitPathRe.exec(filename).slice(1);}; // path.resolve([from ...], to)
// posix version
exports.resolve=function(){var resolvedPath='',resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:process.cwd(); // Skip empty and invalid entries
if(typeof path!=='string'){throw new TypeError('Arguments to path.resolve must be strings');}else if(!path){continue;}resolvedPath=path+'/'+resolvedPath;resolvedAbsolute=path.charAt(0)==='/';} // At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)
// Normalize the path
resolvedPath=normalizeArray(filter(resolvedPath.split('/'),function(p){return !!p;}),!resolvedAbsolute).join('/');return (resolvedAbsolute?'/':'')+resolvedPath||'.';}; // path.normalize(path)
// posix version
exports.normalize=function(path){var isAbsolute=exports.isAbsolute(path),trailingSlash=substr(path,-1)==='/'; // Normalize the path
path=normalizeArray(filter(path.split('/'),function(p){return !!p;}),!isAbsolute).join('/');if(!path&&!isAbsolute){path='.';}if(path&&trailingSlash){path+='/';}return (isAbsolute?'/':'')+path;}; // posix version
exports.isAbsolute=function(path){return path.charAt(0)==='/';}; // posix version
exports.join=function(){var paths=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(paths,function(p,index){if(typeof p!=='string'){throw new TypeError('Arguments to path.join must be strings');}return p;}).join('/'));}; // path.relative(from, to)
// posix version
exports.relative=function(from,to){from=exports.resolve(from).substr(1);to=exports.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=='')break;}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=='')break;}if(start>end)return [];return arr.slice(start,end-start+1);}var fromParts=trim(from.split('/'));var toParts=trim(to.split('/'));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break;}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push('..');}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join('/');};exports.sep='/';exports.delimiter=':';exports.dirname=function(path){var result=splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){ // No dirname whatsoever
return '.';}if(dir){ // It has a dirname, strip trailing slash
dir=dir.substr(0,dir.length-1);}return root+dir;};exports.basename=function(path,ext){var f=splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?
if(ext&&f.substr(-1*ext.length)===ext){f=f.substr(0,f.length-ext.length);}return f;};exports.extname=function(path){return splitPath(path)[3];};function filter(xs,f){if(xs.filter)return xs.filter(f);var res=[];for(var i=0;i<xs.length;i++){if(f(xs[i],i,xs))res.push(xs[i]);}return res;} // String.prototype.substr - negative index don't work in IE8
var substr='ab'.substr(-1)==='b'?function(str,start,len){return str.substr(start,len);}:function(str,start,len){if(start<0)start=str.length+start;return str.substr(start,len);};}).call(this,require('_process'));},{"_process":38}],38:[function(require,module,exports){ // shim for using process in browser
var process=module.exports={};var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){draining=false;if(currentQueue.length){queue=currentQueue.concat(queue);}else {queueIndex=-1;}if(queue.length){drainQueue();}}function drainQueue(){if(draining){return;}var timeout=setTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run();}}queueIndex=-1;len=queue.length;}currentQueue=null;draining=false;clearTimeout(timeout);}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i];}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){setTimeout(drainQueue,0);}}; // v8 likes predictible objects
function Item(fun,array){this.fun=fun;this.array=array;}Item.prototype.run=function(){this.fun.apply(null,this.array);};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version=''; // empty string to avoid regexp issues
process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return '/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};},{}],39:[function(require,module,exports){'use strict';var Stringify=require('./stringify');var Parse=require('./parse');module.exports={stringify:Stringify,parse:Parse};},{"./parse":40,"./stringify":41}],40:[function(require,module,exports){'use strict';var Utils=require('./utils');var internals={delimiter:'&',depth:5,arrayLimit:20,parameterLimit:1000,strictNullHandling:false,plainObjects:false,allowPrototypes:false,allowDots:false};internals.parseValues=function(str,options){var obj={};var parts=str.split(options.delimiter,options.parameterLimit===Infinity?undefined:options.parameterLimit);for(var i=0;i<parts.length;++i){var part=parts[i];var pos=part.indexOf(']=')===-1?part.indexOf('='):part.indexOf(']=')+1;if(pos===-1){obj[Utils.decode(part)]='';if(options.strictNullHandling){obj[Utils.decode(part)]=null;}}else {var key=Utils.decode(part.slice(0,pos));var val=Utils.decode(part.slice(pos+1));if(Object.prototype.hasOwnProperty.call(obj,key)){obj[key]=[].concat(obj[key]).concat(val);}else {obj[key]=val;}}}return obj;};internals.parseObject=function(chain,val,options){if(!chain.length){return val;}var root=chain.shift();var obj;if(root==='[]'){obj=[];obj=obj.concat(internals.parseObject(chain,val,options));}else {obj=options.plainObjects?Object.create(null):{};var cleanRoot=root[0]==='['&&root[root.length-1]===']'?root.slice(1,root.length-1):root;var index=parseInt(cleanRoot,10);if(!isNaN(index)&&root!==cleanRoot&&String(index)===cleanRoot&&index>=0&&options.parseArrays&&index<=options.arrayLimit){obj=[];obj[index]=internals.parseObject(chain,val,options);}else {obj[cleanRoot]=internals.parseObject(chain,val,options);}}return obj;};internals.parseKeys=function(givenKey,val,options){if(!givenKey){return;} // Transform dot notation to bracket notation
var key=options.allowDots?givenKey.replace(/\.([^\.\[]+)/g,'[$1]'):givenKey; // The regex chunks
var parent=/^([^\[\]]*)/;var child=/(\[[^\[\]]*\])/g; // Get the parent
var segment=parent.exec(key); // Stash the parent if it exists
var keys=[];if(segment[1]){ // If we aren't using plain objects, optionally prefix keys
// that would overwrite object prototype properties
if(!options.plainObjects&&Object.prototype.hasOwnProperty(segment[1])){if(!options.allowPrototypes){return;}}keys.push(segment[1]);} // Loop through children appending to the array until we hit depth
var i=0;while((segment=child.exec(key))!==null&&i<options.depth){i+=1;if(!options.plainObjects&&Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g,''))){if(!options.allowPrototypes){continue;}}keys.push(segment[1]);} // If there's a remainder, just add whatever is left
if(segment){keys.push('['+key.slice(segment.index)+']');}return internals.parseObject(keys,val,options);};module.exports=function(str,opts){var options=opts||{};options.delimiter=typeof options.delimiter==='string'||Utils.isRegExp(options.delimiter)?options.delimiter:internals.delimiter;options.depth=typeof options.depth==='number'?options.depth:internals.depth;options.arrayLimit=typeof options.arrayLimit==='number'?options.arrayLimit:internals.arrayLimit;options.parseArrays=options.parseArrays!==false;options.allowDots=typeof options.allowDots==='boolean'?options.allowDots:internals.allowDots;options.plainObjects=typeof options.plainObjects==='boolean'?options.plainObjects:internals.plainObjects;options.allowPrototypes=typeof options.allowPrototypes==='boolean'?options.allowPrototypes:internals.allowPrototypes;options.parameterLimit=typeof options.parameterLimit==='number'?options.parameterLimit:internals.parameterLimit;options.strictNullHandling=typeof options.strictNullHandling==='boolean'?options.strictNullHandling:internals.strictNullHandling;if(str===''||str===null||typeof str==='undefined'){return options.plainObjects?Object.create(null):{};}var tempObj=typeof str==='string'?internals.parseValues(str,options):str;var obj=options.plainObjects?Object.create(null):{}; // Iterate over the keys and setup the new object
var keys=Object.keys(tempObj);for(var i=0;i<keys.length;++i){var key=keys[i];var newObj=internals.parseKeys(key,tempObj[key],options);obj=Utils.merge(obj,newObj,options);}return Utils.compact(obj);};},{"./utils":42}],41:[function(require,module,exports){'use strict';var Utils=require('./utils');var internals={delimiter:'&',arrayPrefixGenerators:{brackets:function brackets(prefix){return prefix+'[]';},indices:function indices(prefix,key){return prefix+'['+key+']';},repeat:function repeat(prefix){return prefix;}},strictNullHandling:false,skipNulls:false,encode:true};internals.stringify=function(object,prefix,generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots){var obj=object;if(typeof filter==='function'){obj=filter(prefix,obj);}else if(Utils.isBuffer(obj)){obj=String(obj);}else if(obj instanceof Date){obj=obj.toISOString();}else if(obj===null){if(strictNullHandling){return encode?Utils.encode(prefix):prefix;}obj='';}if(typeof obj==='string'||typeof obj==='number'||typeof obj==='boolean'){if(encode){return [Utils.encode(prefix)+'='+Utils.encode(obj)];}return [prefix+'='+obj];}var values=[];if(typeof obj==='undefined'){return values;}var objKeys;if(Array.isArray(filter)){objKeys=filter;}else {var keys=Object.keys(obj);objKeys=sort?keys.sort(sort):keys;}for(var i=0;i<objKeys.length;++i){var key=objKeys[i];if(skipNulls&&obj[key]===null){continue;}if(Array.isArray(obj)){values=values.concat(internals.stringify(obj[key],generateArrayPrefix(prefix,key),generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots));}else {values=values.concat(internals.stringify(obj[key],prefix+(allowDots?'.'+key:'['+key+']'),generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots));}}return values;};module.exports=function(object,opts){var obj=object;var options=opts||{};var delimiter=typeof options.delimiter==='undefined'?internals.delimiter:options.delimiter;var strictNullHandling=typeof options.strictNullHandling==='boolean'?options.strictNullHandling:internals.strictNullHandling;var skipNulls=typeof options.skipNulls==='boolean'?options.skipNulls:internals.skipNulls;var encode=typeof options.encode==='boolean'?options.encode:internals.encode;var sort=typeof options.sort==='function'?options.sort:null;var allowDots=typeof options.allowDots==='undefined'?false:options.allowDots;var objKeys;var filter;if(typeof options.filter==='function'){filter=options.filter;obj=filter('',obj);}else if(Array.isArray(options.filter)){objKeys=filter=options.filter;}var keys=[];if((typeof obj==="undefined"?"undefined":_typeof2(obj))!=='object'||obj===null){return '';}var arrayFormat;if(options.arrayFormat in internals.arrayPrefixGenerators){arrayFormat=options.arrayFormat;}else if('indices' in options){arrayFormat=options.indices?'indices':'repeat';}else {arrayFormat='indices';}var generateArrayPrefix=internals.arrayPrefixGenerators[arrayFormat];if(!objKeys){objKeys=Object.keys(obj);}if(sort){objKeys.sort(sort);}for(var i=0;i<objKeys.length;++i){var key=objKeys[i];if(skipNulls&&obj[key]===null){continue;}keys=keys.concat(internals.stringify(obj[key],key,generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots));}return keys.join(delimiter);};},{"./utils":42}],42:[function(require,module,exports){'use strict';var hexTable=function(){var array=new Array(256);for(var i=0;i<256;++i){array[i]='%'+((i<16?'0':'')+i.toString(16)).toUpperCase();}return array;}();exports.arrayToObject=function(source,options){var obj=options.plainObjects?Object.create(null):{};for(var i=0;i<source.length;++i){if(typeof source[i]!=='undefined'){obj[i]=source[i];}}return obj;};exports.merge=function(target,source,options){if(!source){return target;}if((typeof source==="undefined"?"undefined":_typeof2(source))!=='object'){if(Array.isArray(target)){target.push(source);}else if((typeof target==="undefined"?"undefined":_typeof2(target))==='object'){target[source]=true;}else {return [target,source];}return target;}if((typeof target==="undefined"?"undefined":_typeof2(target))!=='object'){return [target].concat(source);}var mergeTarget=target;if(Array.isArray(target)&&!Array.isArray(source)){mergeTarget=exports.arrayToObject(target,options);}return Object.keys(source).reduce(function(acc,key){var value=source[key];if(Object.prototype.hasOwnProperty.call(acc,key)){acc[key]=exports.merge(acc[key],value,options);}else {acc[key]=value;}return acc;},mergeTarget);};exports.decode=function(str){try{return decodeURIComponent(str.replace(/\+/g,' '));}catch(e){return str;}};exports.encode=function(str){ // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
// It has been adapted here for stricter adherence to RFC 3986
if(str.length===0){return str;}var string=typeof str==='string'?str:String(str);var out='';for(var i=0;i<string.length;++i){var c=string.charCodeAt(i);if(c===0x2D|| // -
c===0x2E|| // .
c===0x5F|| // _
c===0x7E|| // ~
c>=0x30&&c<=0x39|| // 0-9
c>=0x41&&c<=0x5A|| // a-z
c>=0x61&&c<=0x7A // A-Z
){out+=string.charAt(i);continue;}if(c<0x80){out=out+hexTable[c];continue;}if(c<0x800){out=out+(hexTable[0xC0|c>>6]+hexTable[0x80|c&0x3F]);continue;}if(c<0xD800||c>=0xE000){out=out+(hexTable[0xE0|c>>12]+hexTable[0x80|c>>6&0x3F]+hexTable[0x80|c&0x3F]);continue;}i+=1;c=0x10000+((c&0x3FF)<<10|string.charCodeAt(i)&0x3FF);out+=hexTable[0xF0|c>>18]+hexTable[0x80|c>>12&0x3F]+hexTable[0x80|c>>6&0x3F]+hexTable[0x80|c&0x3F];}return out;};exports.compact=function(obj,references){if((typeof obj==="undefined"?"undefined":_typeof2(obj))!=='object'||obj===null){return obj;}var refs=references||[];var lookup=refs.indexOf(obj);if(lookup!==-1){return refs[lookup];}refs.push(obj);if(Array.isArray(obj)){var compacted=[];for(var i=0;i<obj.length;++i){if(typeof obj[i]!=='undefined'){compacted.push(obj[i]);}}return compacted;}var keys=Object.keys(obj);for(var j=0;j<keys.length;++j){var key=keys[j];obj[key]=exports.compact(obj[key],refs);}return obj;};exports.isRegExp=function(obj){return Object.prototype.toString.call(obj)==='[object RegExp]';};exports.isBuffer=function(obj){if(obj===null||typeof obj==='undefined'){return false;}return !!(obj.constructor&&obj.constructor.isBuffer&&obj.constructor.isBuffer(obj));};},{}],43:[function(require,module,exports){ /*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */exports.SourceMapGenerator=require('./source-map/source-map-generator').SourceMapGenerator;exports.SourceMapConsumer=require('./source-map/source-map-consumer').SourceMapConsumer;exports.SourceNode=require('./source-map/source-node').SourceNode;},{"./source-map/source-map-consumer":50,"./source-map/source-map-generator":51,"./source-map/source-node":52}],44:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var util=require('./util'); /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */function ArraySet(){this._array=[];this._set={};} /**
   * Static method for creating ArraySet instances from an existing array.
   */ArraySet.fromArray=function ArraySet_fromArray(aArray,aAllowDuplicates){var set=new ArraySet();for(var i=0,len=aArray.length;i<len;i++){set.add(aArray[i],aAllowDuplicates);}return set;}; /**
   * Return how many unique items are in this ArraySet. If duplicates have been
   * added, than those do not count towards the size.
   *
   * @returns Number
   */ArraySet.prototype.size=function ArraySet_size(){return Object.getOwnPropertyNames(this._set).length;}; /**
   * Add the given string to this set.
   *
   * @param String aStr
   */ArraySet.prototype.add=function ArraySet_add(aStr,aAllowDuplicates){var isDuplicate=this.has(aStr);var idx=this._array.length;if(!isDuplicate||aAllowDuplicates){this._array.push(aStr);}if(!isDuplicate){this._set[util.toSetString(aStr)]=idx;}}; /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */ArraySet.prototype.has=function ArraySet_has(aStr){return Object.prototype.hasOwnProperty.call(this._set,util.toSetString(aStr));}; /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */ArraySet.prototype.indexOf=function ArraySet_indexOf(aStr){if(this.has(aStr)){return this._set[util.toSetString(aStr)];}throw new Error('"'+aStr+'" is not in the set.');}; /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */ArraySet.prototype.at=function ArraySet_at(aIdx){if(aIdx>=0&&aIdx<this._array.length){return this._array[aIdx];}throw new Error('No element indexed by '+aIdx);}; /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */ArraySet.prototype.toArray=function ArraySet_toArray(){return this._array.slice();};exports.ArraySet=ArraySet;});},{"./util":53,"amdefine":1}],45:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var base64=require('./base64'); // A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011
var VLQ_BASE_SHIFT=5; // binary: 100000
var VLQ_BASE=1<<VLQ_BASE_SHIFT; // binary: 011111
var VLQ_BASE_MASK=VLQ_BASE-1; // binary: 100000
var VLQ_CONTINUATION_BIT=VLQ_BASE; /**
   * Converts from a two-complement value to a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */function toVLQSigned(aValue){return aValue<0?(-aValue<<1)+1:(aValue<<1)+0;} /**
   * Converts to a two-complement value from a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */function fromVLQSigned(aValue){var isNegative=(aValue&1)===1;var shifted=aValue>>1;return isNegative?-shifted:shifted;} /**
   * Returns the base 64 VLQ encoded value.
   */exports.encode=function base64VLQ_encode(aValue){var encoded="";var digit;var vlq=toVLQSigned(aValue);do {digit=vlq&VLQ_BASE_MASK;vlq>>>=VLQ_BASE_SHIFT;if(vlq>0){ // There are still more digits in this value, so we must make sure the
// continuation bit is marked.
digit|=VLQ_CONTINUATION_BIT;}encoded+=base64.encode(digit);}while(vlq>0);return encoded;}; /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string via the out parameter.
   */exports.decode=function base64VLQ_decode(aStr,aIndex,aOutParam){var strLen=aStr.length;var result=0;var shift=0;var continuation,digit;do {if(aIndex>=strLen){throw new Error("Expected more digits in base 64 VLQ value.");}digit=base64.decode(aStr.charCodeAt(aIndex++));if(digit===-1){throw new Error("Invalid base64 digit: "+aStr.charAt(aIndex-1));}continuation=!!(digit&VLQ_CONTINUATION_BIT);digit&=VLQ_BASE_MASK;result=result+(digit<<shift);shift+=VLQ_BASE_SHIFT;}while(continuation);aOutParam.value=fromVLQSigned(result);aOutParam.rest=aIndex;};});},{"./base64":46,"amdefine":1}],46:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var intToCharMap='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''); /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */exports.encode=function(number){if(0<=number&&number<intToCharMap.length){return intToCharMap[number];}throw new TypeError("Must be between 0 and 63: "+aNumber);}; /**
   * Decode a single base 64 character code digit to an integer. Returns -1 on
   * failure.
   */exports.decode=function(charCode){var bigA=65; // 'A'
var bigZ=90; // 'Z'
var littleA=97; // 'a'
var littleZ=122; // 'z'
var zero=48; // '0'
var nine=57; // '9'
var plus=43; // '+'
var slash=47; // '/'
var littleOffset=26;var numberOffset=52; // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
if(bigA<=charCode&&charCode<=bigZ){return charCode-bigA;} // 26 - 51: abcdefghijklmnopqrstuvwxyz
if(littleA<=charCode&&charCode<=littleZ){return charCode-littleA+littleOffset;} // 52 - 61: 0123456789
if(zero<=charCode&&charCode<=nine){return charCode-zero+numberOffset;} // 62: +
if(charCode==plus){return 62;} // 63: /
if(charCode==slash){return 63;} // Invalid base64 digit.
return -1;};});},{"amdefine":1}],47:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){exports.GREATEST_LOWER_BOUND=1;exports.LEAST_UPPER_BOUND=2; /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
   *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   */function recursiveSearch(aLow,aHigh,aNeedle,aHaystack,aCompare,aBias){ // This function terminates when one of the following is true:
//
//   1. We find the exact element we are looking for.
//
//   2. We did not find the exact element, but we can return the index of
//      the next-closest element.
//
//   3. We did not find the exact element, and there is no next-closest
//      element than the one we are searching for, so we return -1.
var mid=Math.floor((aHigh-aLow)/2)+aLow;var cmp=aCompare(aNeedle,aHaystack[mid],true);if(cmp===0){ // Found the element we are looking for.
return mid;}else if(cmp>0){ // Our needle is greater than aHaystack[mid].
if(aHigh-mid>1){ // The element is in the upper half.
return recursiveSearch(mid,aHigh,aNeedle,aHaystack,aCompare,aBias);} // The exact needle element was not found in this haystack. Determine if
// we are in termination case (3) or (2) and return the appropriate thing.
if(aBias==exports.LEAST_UPPER_BOUND){return aHigh<aHaystack.length?aHigh:-1;}else {return mid;}}else { // Our needle is less than aHaystack[mid].
if(mid-aLow>1){ // The element is in the lower half.
return recursiveSearch(aLow,mid,aNeedle,aHaystack,aCompare,aBias);} // we are in termination case (3) or (2) and return the appropriate thing.
if(aBias==exports.LEAST_UPPER_BOUND){return mid;}else {return aLow<0?-1:aLow;}}} /**
   * This is an implementation of binary search which will always try and return
   * the index of the closest element if there is no exact hit. This is because
   * mappings between original and generated line/col pairs are single points,
   * and there is an implicit region between each of them, so a miss just means
   * that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
   *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
   */exports.search=function search(aNeedle,aHaystack,aCompare,aBias){if(aHaystack.length===0){return -1;}var index=recursiveSearch(-1,aHaystack.length,aNeedle,aHaystack,aCompare,aBias||exports.GREATEST_LOWER_BOUND);if(index<0){return -1;} // We have found either the exact element, or the next-closest element than
// the one we are searching for. However, there may be more than one such
// element. Make sure we always return the smallest of these.
while(index-1>=0){if(aCompare(aHaystack[index],aHaystack[index-1],true)!==0){break;}--index;}return index;};});},{"amdefine":1}],48:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var util=require('./util'); /**
   * Determine whether mappingB is after mappingA with respect to generated
   * position.
   */function generatedPositionAfter(mappingA,mappingB){ // Optimized for most common case
var lineA=mappingA.generatedLine;var lineB=mappingB.generatedLine;var columnA=mappingA.generatedColumn;var columnB=mappingB.generatedColumn;return lineB>lineA||lineB==lineA&&columnB>=columnA||util.compareByGeneratedPositionsInflated(mappingA,mappingB)<=0;} /**
   * A data structure to provide a sorted view of accumulated mappings in a
   * performance conscious manner. It trades a neglibable overhead in general
   * case for a large speedup in case of mappings being added in order.
   */function MappingList(){this._array=[];this._sorted=true; // Serves as infimum
this._last={generatedLine:-1,generatedColumn:0};} /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */MappingList.prototype.unsortedForEach=function MappingList_forEach(aCallback,aThisArg){this._array.forEach(aCallback,aThisArg);}; /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */MappingList.prototype.add=function MappingList_add(aMapping){var mapping;if(generatedPositionAfter(this._last,aMapping)){this._last=aMapping;this._array.push(aMapping);}else {this._sorted=false;this._array.push(aMapping);}}; /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */MappingList.prototype.toArray=function MappingList_toArray(){if(!this._sorted){this._array.sort(util.compareByGeneratedPositionsInflated);this._sorted=true;}return this._array;};exports.MappingList=MappingList;});},{"./util":53,"amdefine":1}],49:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){ // It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.
/**
   * Swap the elements indexed by `x` and `y` in the array `ary`.
   *
   * @param {Array} ary
   *        The array.
   * @param {Number} x
   *        The index of the first item.
   * @param {Number} y
   *        The index of the second item.
   */function swap(ary,x,y){var temp=ary[x];ary[x]=ary[y];ary[y]=temp;} /**
   * Returns a random integer within the range `low .. high` inclusive.
   *
   * @param {Number} low
   *        The lower bound on the range.
   * @param {Number} high
   *        The upper bound on the range.
   */function randomIntInRange(low,high){return Math.round(low+Math.random()*(high-low));} /**
   * The Quick Sort algorithm.
   *
   * @param {Array} ary
   *        An array to sort.
   * @param {function} comparator
   *        Function to use to compare two items.
   * @param {Number} p
   *        Start index of the array
   * @param {Number} r
   *        End index of the array
   */function doQuickSort(ary,comparator,p,r){ // If our lower bound is less than our upper bound, we (1) partition the
// array into two pieces and (2) recurse on each half. If it is not, this is
// the empty array and our base case.
if(p<r){ // (1) Partitioning.
//
// The partitioning chooses a pivot between `p` and `r` and moves all
// elements that are less than or equal to the pivot to the before it, and
// all the elements that are greater than it after it. The effect is that
// once partition is done, the pivot is in the exact place it will be when
// the array is put in sorted order, and it will not need to be moved
// again. This runs in O(n) time.
// Always choose a random pivot so that an input array which is reverse
// sorted does not cause O(n^2) running time.
var pivotIndex=randomIntInRange(p,r);var i=p-1;swap(ary,pivotIndex,r);var pivot=ary[r]; // Immediately after `j` is incremented in this loop, the following hold
// true:
//
//   * Every element in `ary[p .. i]` is less than or equal to the pivot.
//
//   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
for(var j=p;j<r;j++){if(comparator(ary[j],pivot)<=0){i+=1;swap(ary,i,j);}}swap(ary,i+1,j);var q=i+1; // (2) Recurse on each half.
doQuickSort(ary,comparator,p,q-1);doQuickSort(ary,comparator,q+1,r);}} /**
   * Sort the given array in-place with the given comparator function.
   *
   * @param {Array} ary
   *        An array to sort.
   * @param {function} comparator
   *        Function to use to compare two items.
   */exports.quickSort=function(ary,comparator){doQuickSort(ary,comparator,0,ary.length-1);};});},{"amdefine":1}],50:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var util=require('./util');var binarySearch=require('./binary-search');var ArraySet=require('./array-set').ArraySet;var base64VLQ=require('./base64-vlq');var quickSort=require('./quick-sort').quickSort;function SourceMapConsumer(aSourceMap){var sourceMap=aSourceMap;if(typeof aSourceMap==='string'){sourceMap=JSON.parse(aSourceMap.replace(/^\)\]\}'/,''));}return sourceMap.sections!=null?new IndexedSourceMapConsumer(sourceMap):new BasicSourceMapConsumer(sourceMap);}SourceMapConsumer.fromSourceMap=function(aSourceMap){return BasicSourceMapConsumer.fromSourceMap(aSourceMap);}; /**
   * The version of the source mapping spec that we are consuming.
   */SourceMapConsumer.prototype._version=3; // `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.
SourceMapConsumer.prototype.__generatedMappings=null;Object.defineProperty(SourceMapConsumer.prototype,'_generatedMappings',{get:function get(){if(!this.__generatedMappings){this._parseMappings(this._mappings,this.sourceRoot);}return this.__generatedMappings;}});SourceMapConsumer.prototype.__originalMappings=null;Object.defineProperty(SourceMapConsumer.prototype,'_originalMappings',{get:function get(){if(!this.__originalMappings){this._parseMappings(this._mappings,this.sourceRoot);}return this.__originalMappings;}});SourceMapConsumer.prototype._charIsMappingSeparator=function SourceMapConsumer_charIsMappingSeparator(aStr,index){var c=aStr.charAt(index);return c===";"||c===",";}; /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */SourceMapConsumer.prototype._parseMappings=function SourceMapConsumer_parseMappings(aStr,aSourceRoot){throw new Error("Subclasses must implement _parseMappings");};SourceMapConsumer.GENERATED_ORDER=1;SourceMapConsumer.ORIGINAL_ORDER=2;SourceMapConsumer.GREATEST_LOWER_BOUND=1;SourceMapConsumer.LEAST_UPPER_BOUND=2; /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */SourceMapConsumer.prototype.eachMapping=function SourceMapConsumer_eachMapping(aCallback,aContext,aOrder){var context=aContext||null;var order=aOrder||SourceMapConsumer.GENERATED_ORDER;var mappings;switch(order){case SourceMapConsumer.GENERATED_ORDER:mappings=this._generatedMappings;break;case SourceMapConsumer.ORIGINAL_ORDER:mappings=this._originalMappings;break;default:throw new Error("Unknown order of iteration.");}var sourceRoot=this.sourceRoot;mappings.map(function(mapping){var source=mapping.source===null?null:this._sources.at(mapping.source);if(source!=null&&sourceRoot!=null){source=util.join(sourceRoot,source);}return {source:source,generatedLine:mapping.generatedLine,generatedColumn:mapping.generatedColumn,originalLine:mapping.originalLine,originalColumn:mapping.originalColumn,name:mapping.name===null?null:this._names.at(mapping.name)};},this).forEach(aCallback,context);}; /**
   * Returns all generated line and column information for the original source,
   * line, and column provided. If no column is provided, returns all mappings
   * corresponding to a either the line we are searching for or the next
   * closest line that has any mappings. Otherwise, returns all mappings
   * corresponding to the given line and either the column we are searching for
   * or the next closest column that has any offsets.
   *
   * The only argument is an object with the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: Optional. the column number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */SourceMapConsumer.prototype.allGeneratedPositionsFor=function SourceMapConsumer_allGeneratedPositionsFor(aArgs){var line=util.getArg(aArgs,'line'); // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
// returns the index of the closest mapping less than the needle. By
// setting needle.originalColumn to 0, we thus find the last mapping for
// the given line, provided such a mapping exists.
var needle={source:util.getArg(aArgs,'source'),originalLine:line,originalColumn:util.getArg(aArgs,'column',0)};if(this.sourceRoot!=null){needle.source=util.relative(this.sourceRoot,needle.source);}if(!this._sources.has(needle.source)){return [];}needle.source=this._sources.indexOf(needle.source);var mappings=[];var index=this._findMapping(needle,this._originalMappings,"originalLine","originalColumn",util.compareByOriginalPositions,binarySearch.LEAST_UPPER_BOUND);if(index>=0){var mapping=this._originalMappings[index];if(aArgs.column===undefined){var originalLine=mapping.originalLine; // Iterate until either we run out of mappings, or we run into
// a mapping for a different line than the one we found. Since
// mappings are sorted, this is guaranteed to find all mappings for
// the line we found.
while(mapping&&mapping.originalLine===originalLine){mappings.push({line:util.getArg(mapping,'generatedLine',null),column:util.getArg(mapping,'generatedColumn',null),lastColumn:util.getArg(mapping,'lastGeneratedColumn',null)});mapping=this._originalMappings[++index];}}else {var originalColumn=mapping.originalColumn; // Iterate until either we run out of mappings, or we run into
// a mapping for a different line than the one we were searching for.
// Since mappings are sorted, this is guaranteed to find all mappings for
// the line we are searching for.
while(mapping&&mapping.originalLine===line&&mapping.originalColumn==originalColumn){mappings.push({line:util.getArg(mapping,'generatedLine',null),column:util.getArg(mapping,'generatedColumn',null),lastColumn:util.getArg(mapping,'lastGeneratedColumn',null)});mapping=this._originalMappings[++index];}}}return mappings;};exports.SourceMapConsumer=SourceMapConsumer; /**
   * A BasicSourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */function BasicSourceMapConsumer(aSourceMap){var sourceMap=aSourceMap;if(typeof aSourceMap==='string'){sourceMap=JSON.parse(aSourceMap.replace(/^\)\]\}'/,''));}var version=util.getArg(sourceMap,'version');var sources=util.getArg(sourceMap,'sources'); // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
// requires the array) to play nice here.
var names=util.getArg(sourceMap,'names',[]);var sourceRoot=util.getArg(sourceMap,'sourceRoot',null);var sourcesContent=util.getArg(sourceMap,'sourcesContent',null);var mappings=util.getArg(sourceMap,'mappings');var file=util.getArg(sourceMap,'file',null); // Once again, Sass deviates from the spec and supplies the version as a
// string rather than a number, so we use loose equality checking here.
if(version!=this._version){throw new Error('Unsupported version: '+version);} // Some source maps produce relative source paths like "./foo.js" instead of
// "foo.js".  Normalize these first so that future comparisons will succeed.
// See bugzil.la/1090768.
sources=sources.map(util.normalize); // Pass `true` below to allow duplicate names and sources. While source maps
// are intended to be compressed and deduplicated, the TypeScript compiler
// sometimes generates source maps with duplicates in them. See Github issue
// #72 and bugzil.la/889492.
this._names=ArraySet.fromArray(names,true);this._sources=ArraySet.fromArray(sources,true);this.sourceRoot=sourceRoot;this.sourcesContent=sourcesContent;this._mappings=mappings;this.file=file;}BasicSourceMapConsumer.prototype=Object.create(SourceMapConsumer.prototype);BasicSourceMapConsumer.prototype.consumer=SourceMapConsumer; /**
   * Create a BasicSourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns BasicSourceMapConsumer
   */BasicSourceMapConsumer.fromSourceMap=function SourceMapConsumer_fromSourceMap(aSourceMap){var smc=Object.create(BasicSourceMapConsumer.prototype);var names=smc._names=ArraySet.fromArray(aSourceMap._names.toArray(),true);var sources=smc._sources=ArraySet.fromArray(aSourceMap._sources.toArray(),true);smc.sourceRoot=aSourceMap._sourceRoot;smc.sourcesContent=aSourceMap._generateSourcesContent(smc._sources.toArray(),smc.sourceRoot);smc.file=aSourceMap._file; // Because we are modifying the entries (by converting string sources and
// names to indices into the sources and names ArraySets), we have to make
// a copy of the entry or else bad things happen. Shared mutable state
// strikes again! See github issue #191.
var generatedMappings=aSourceMap._mappings.toArray().slice();var destGeneratedMappings=smc.__generatedMappings=[];var destOriginalMappings=smc.__originalMappings=[];for(var i=0,length=generatedMappings.length;i<length;i++){var srcMapping=generatedMappings[i];var destMapping=new Mapping();destMapping.generatedLine=srcMapping.generatedLine;destMapping.generatedColumn=srcMapping.generatedColumn;if(srcMapping.source){destMapping.source=sources.indexOf(srcMapping.source);destMapping.originalLine=srcMapping.originalLine;destMapping.originalColumn=srcMapping.originalColumn;if(srcMapping.name){destMapping.name=names.indexOf(srcMapping.name);}destOriginalMappings.push(destMapping);}destGeneratedMappings.push(destMapping);}quickSort(smc.__originalMappings,util.compareByOriginalPositions);return smc;}; /**
   * The version of the source mapping spec that we are consuming.
   */BasicSourceMapConsumer.prototype._version=3; /**
   * The list of original sources.
   */Object.defineProperty(BasicSourceMapConsumer.prototype,'sources',{get:function get(){return this._sources.toArray().map(function(s){return this.sourceRoot!=null?util.join(this.sourceRoot,s):s;},this);}}); /**
   * Provide the JIT with a nice shape / hidden class.
   */function Mapping(){this.generatedLine=0;this.generatedColumn=0;this.source=null;this.originalLine=null;this.originalColumn=null;this.name=null;} /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */BasicSourceMapConsumer.prototype._parseMappings=function SourceMapConsumer_parseMappings(aStr,aSourceRoot){var generatedLine=1;var previousGeneratedColumn=0;var previousOriginalLine=0;var previousOriginalColumn=0;var previousSource=0;var previousName=0;var length=aStr.length;var index=0;var cachedSegments={};var temp={};var originalMappings=[];var generatedMappings=[];var mapping,str,segment,end,value;while(index<length){if(aStr.charAt(index)===';'){generatedLine++;index++;previousGeneratedColumn=0;}else if(aStr.charAt(index)===','){index++;}else {mapping=new Mapping();mapping.generatedLine=generatedLine; // Because each offset is encoded relative to the previous one,
// many segments often have the same encoding. We can exploit this
// fact by caching the parsed variable length fields of each segment,
// allowing us to avoid a second parse if we encounter the same
// segment again.
for(end=index;end<length;end++){if(this._charIsMappingSeparator(aStr,end)){break;}}str=aStr.slice(index,end);segment=cachedSegments[str];if(segment){index+=str.length;}else {segment=[];while(index<end){base64VLQ.decode(aStr,index,temp);value=temp.value;index=temp.rest;segment.push(value);}if(segment.length===2){throw new Error('Found a source, but no line and column');}if(segment.length===3){throw new Error('Found a source and line, but no column');}cachedSegments[str]=segment;} // Generated column.
mapping.generatedColumn=previousGeneratedColumn+segment[0];previousGeneratedColumn=mapping.generatedColumn;if(segment.length>1){ // Original source.
mapping.source=previousSource+segment[1];previousSource+=segment[1]; // Original line.
mapping.originalLine=previousOriginalLine+segment[2];previousOriginalLine=mapping.originalLine; // Lines are stored 0-based
mapping.originalLine+=1; // Original column.
mapping.originalColumn=previousOriginalColumn+segment[3];previousOriginalColumn=mapping.originalColumn;if(segment.length>4){ // Original name.
mapping.name=previousName+segment[4];previousName+=segment[4];}}generatedMappings.push(mapping);if(typeof mapping.originalLine==='number'){originalMappings.push(mapping);}}}quickSort(generatedMappings,util.compareByGeneratedPositionsDeflated);this.__generatedMappings=generatedMappings;quickSort(originalMappings,util.compareByOriginalPositions);this.__originalMappings=originalMappings;}; /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */BasicSourceMapConsumer.prototype._findMapping=function SourceMapConsumer_findMapping(aNeedle,aMappings,aLineName,aColumnName,aComparator,aBias){ // To return the position we are searching for, we must first find the
// mapping for the given position and then return the opposite position it
// points to. Because the mappings are sorted, we can use binary search to
// find the best mapping.
if(aNeedle[aLineName]<=0){throw new TypeError('Line must be greater than or equal to 1, got '+aNeedle[aLineName]);}if(aNeedle[aColumnName]<0){throw new TypeError('Column must be greater than or equal to 0, got '+aNeedle[aColumnName]);}return binarySearch.search(aNeedle,aMappings,aComparator,aBias);}; /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */BasicSourceMapConsumer.prototype.computeColumnSpans=function SourceMapConsumer_computeColumnSpans(){for(var index=0;index<this._generatedMappings.length;++index){var mapping=this._generatedMappings[index]; // Mappings do not contain a field for the last generated columnt. We
// can come up with an optimistic estimate, however, by assuming that
// mappings are contiguous (i.e. given two consecutive mappings, the
// first mapping ends where the second one starts).
if(index+1<this._generatedMappings.length){var nextMapping=this._generatedMappings[index+1];if(mapping.generatedLine===nextMapping.generatedLine){mapping.lastGeneratedColumn=nextMapping.generatedColumn-1;continue;}} // The last mapping for each line spans the entire line.
mapping.lastGeneratedColumn=Infinity;}}; /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */BasicSourceMapConsumer.prototype.originalPositionFor=function SourceMapConsumer_originalPositionFor(aArgs){var needle={generatedLine:util.getArg(aArgs,'line'),generatedColumn:util.getArg(aArgs,'column')};var index=this._findMapping(needle,this._generatedMappings,"generatedLine","generatedColumn",util.compareByGeneratedPositionsDeflated,util.getArg(aArgs,'bias',SourceMapConsumer.GREATEST_LOWER_BOUND));if(index>=0){var mapping=this._generatedMappings[index];if(mapping.generatedLine===needle.generatedLine){var source=util.getArg(mapping,'source',null);if(source!==null){source=this._sources.at(source);if(this.sourceRoot!=null){source=util.join(this.sourceRoot,source);}}var name=util.getArg(mapping,'name',null);if(name!==null){name=this._names.at(name);}return {source:source,line:util.getArg(mapping,'originalLine',null),column:util.getArg(mapping,'originalColumn',null),name:name};}}return {source:null,line:null,column:null,name:null};}; /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */BasicSourceMapConsumer.prototype.hasContentsOfAllSources=function BasicSourceMapConsumer_hasContentsOfAllSources(){if(!this.sourcesContent){return false;}return this.sourcesContent.length>=this._sources.size()&&!this.sourcesContent.some(function(sc){return sc==null;});}; /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */BasicSourceMapConsumer.prototype.sourceContentFor=function SourceMapConsumer_sourceContentFor(aSource,nullOnMissing){if(!this.sourcesContent){return null;}if(this.sourceRoot!=null){aSource=util.relative(this.sourceRoot,aSource);}if(this._sources.has(aSource)){return this.sourcesContent[this._sources.indexOf(aSource)];}var url;if(this.sourceRoot!=null&&(url=util.urlParse(this.sourceRoot))){ // XXX: file:// URIs and absolute paths lead to unexpected behavior for
// many users. We can help them out when they expect file:// URIs to
// behave like it would if they were running a local HTTP server. See
// https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
var fileUriAbsPath=aSource.replace(/^file:\/\//,"");if(url.scheme=="file"&&this._sources.has(fileUriAbsPath)){return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];}if((!url.path||url.path=="/")&&this._sources.has("/"+aSource)){return this.sourcesContent[this._sources.indexOf("/"+aSource)];}} // This function is used recursively from
// IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
// don't want to throw if we can't find the source - we just want to
// return null, so we provide a flag to exit gracefully.
if(nullOnMissing){return null;}else {throw new Error('"'+aSource+'" is not in the SourceMap.');}}; /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */BasicSourceMapConsumer.prototype.generatedPositionFor=function SourceMapConsumer_generatedPositionFor(aArgs){var source=util.getArg(aArgs,'source');if(this.sourceRoot!=null){source=util.relative(this.sourceRoot,source);}if(!this._sources.has(source)){return {line:null,column:null,lastColumn:null};}source=this._sources.indexOf(source);var needle={source:source,originalLine:util.getArg(aArgs,'line'),originalColumn:util.getArg(aArgs,'column')};var index=this._findMapping(needle,this._originalMappings,"originalLine","originalColumn",util.compareByOriginalPositions,util.getArg(aArgs,'bias',SourceMapConsumer.GREATEST_LOWER_BOUND));if(index>=0){var mapping=this._originalMappings[index];if(mapping.source===needle.source){return {line:util.getArg(mapping,'generatedLine',null),column:util.getArg(mapping,'generatedColumn',null),lastColumn:util.getArg(mapping,'lastGeneratedColumn',null)};}}return {line:null,column:null,lastColumn:null};};exports.BasicSourceMapConsumer=BasicSourceMapConsumer; /**
   * An IndexedSourceMapConsumer instance represents a parsed source map which
   * we can query for information. It differs from BasicSourceMapConsumer in
   * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
   * input.
   *
   * The only parameter is a raw source map (either as a JSON string, or already
   * parsed to an object). According to the spec for indexed source maps, they
   * have the following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - file: Optional. The generated file this source map is associated with.
   *   - sections: A list of section definitions.
   *
   * Each value under the "sections" field has two fields:
   *   - offset: The offset into the original specified at which this section
   *       begins to apply, defined as an object with a "line" and "column"
   *       field.
   *   - map: A source map definition. This source map could also be indexed,
   *       but doesn't have to be.
   *
   * Instead of the "map" field, it's also possible to have a "url" field
   * specifying a URL to retrieve a source map from, but that's currently
   * unsupported.
   *
   * Here's an example source map, taken from the source map spec[0], but
   * modified to omit a section which uses the "url" field.
   *
   *  {
   *    version : 3,
   *    file: "app.js",
   *    sections: [{
   *      offset: {line:100, column:10},
   *      map: {
   *        version : 3,
   *        file: "section.js",
   *        sources: ["foo.js", "bar.js"],
   *        names: ["src", "maps", "are", "fun"],
   *        mappings: "AAAA,E;;ABCDE;"
   *      }
   *    }],
   *  }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
   */function IndexedSourceMapConsumer(aSourceMap){var sourceMap=aSourceMap;if(typeof aSourceMap==='string'){sourceMap=JSON.parse(aSourceMap.replace(/^\)\]\}'/,''));}var version=util.getArg(sourceMap,'version');var sections=util.getArg(sourceMap,'sections');if(version!=this._version){throw new Error('Unsupported version: '+version);}this._sources=new ArraySet();this._names=new ArraySet();var lastOffset={line:-1,column:0};this._sections=sections.map(function(s){if(s.url){ // The url field will require support for asynchronicity.
// See https://github.com/mozilla/source-map/issues/16
throw new Error('Support for url field in sections not implemented.');}var offset=util.getArg(s,'offset');var offsetLine=util.getArg(offset,'line');var offsetColumn=util.getArg(offset,'column');if(offsetLine<lastOffset.line||offsetLine===lastOffset.line&&offsetColumn<lastOffset.column){throw new Error('Section offsets must be ordered and non-overlapping.');}lastOffset=offset;return {generatedOffset:{ // The offset fields are 0-based, but we use 1-based indices when
// encoding/decoding from VLQ.
generatedLine:offsetLine+1,generatedColumn:offsetColumn+1},consumer:new SourceMapConsumer(util.getArg(s,'map'))};});}IndexedSourceMapConsumer.prototype=Object.create(SourceMapConsumer.prototype);IndexedSourceMapConsumer.prototype.constructor=SourceMapConsumer; /**
   * The version of the source mapping spec that we are consuming.
   */IndexedSourceMapConsumer.prototype._version=3; /**
   * The list of original sources.
   */Object.defineProperty(IndexedSourceMapConsumer.prototype,'sources',{get:function get(){var sources=[];for(var i=0;i<this._sections.length;i++){for(var j=0;j<this._sections[i].consumer.sources.length;j++){sources.push(this._sections[i].consumer.sources[j]);}};return sources;}}); /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */IndexedSourceMapConsumer.prototype.originalPositionFor=function IndexedSourceMapConsumer_originalPositionFor(aArgs){var needle={generatedLine:util.getArg(aArgs,'line'),generatedColumn:util.getArg(aArgs,'column')}; // Find the section containing the generated position we're trying to map
// to an original position.
var sectionIndex=binarySearch.search(needle,this._sections,function(needle,section){var cmp=needle.generatedLine-section.generatedOffset.generatedLine;if(cmp){return cmp;}return needle.generatedColumn-section.generatedOffset.generatedColumn;});var section=this._sections[sectionIndex];if(!section){return {source:null,line:null,column:null,name:null};}return section.consumer.originalPositionFor({line:needle.generatedLine-(section.generatedOffset.generatedLine-1),column:needle.generatedColumn-(section.generatedOffset.generatedLine===needle.generatedLine?section.generatedOffset.generatedColumn-1:0),bias:aArgs.bias});}; /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */IndexedSourceMapConsumer.prototype.hasContentsOfAllSources=function IndexedSourceMapConsumer_hasContentsOfAllSources(){return this._sections.every(function(s){return s.consumer.hasContentsOfAllSources();});}; /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * available.
   */IndexedSourceMapConsumer.prototype.sourceContentFor=function IndexedSourceMapConsumer_sourceContentFor(aSource,nullOnMissing){for(var i=0;i<this._sections.length;i++){var section=this._sections[i];var content=section.consumer.sourceContentFor(aSource,true);if(content){return content;}}if(nullOnMissing){return null;}else {throw new Error('"'+aSource+'" is not in the SourceMap.');}}; /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */IndexedSourceMapConsumer.prototype.generatedPositionFor=function IndexedSourceMapConsumer_generatedPositionFor(aArgs){for(var i=0;i<this._sections.length;i++){var section=this._sections[i]; // Only consider this section if the requested source is in the list of
// sources of the consumer.
if(section.consumer.sources.indexOf(util.getArg(aArgs,'source'))===-1){continue;}var generatedPosition=section.consumer.generatedPositionFor(aArgs);if(generatedPosition){var ret={line:generatedPosition.line+(section.generatedOffset.generatedLine-1),column:generatedPosition.column+(section.generatedOffset.generatedLine===generatedPosition.line?section.generatedOffset.generatedColumn-1:0)};return ret;}}return {line:null,column:null};}; /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */IndexedSourceMapConsumer.prototype._parseMappings=function IndexedSourceMapConsumer_parseMappings(aStr,aSourceRoot){this.__generatedMappings=[];this.__originalMappings=[];for(var i=0;i<this._sections.length;i++){var section=this._sections[i];var sectionMappings=section.consumer._generatedMappings;for(var j=0;j<sectionMappings.length;j++){var mapping=sectionMappings[i];var source=section.consumer._sources.at(mapping.source);if(section.consumer.sourceRoot!==null){source=util.join(section.consumer.sourceRoot,source);}this._sources.add(source);source=this._sources.indexOf(source);var name=section.consumer._names.at(mapping.name);this._names.add(name);name=this._names.indexOf(name); // The mappings coming from the consumer for the section have
// generated positions relative to the start of the section, so we
// need to offset them to be relative to the start of the concatenated
// generated file.
var adjustedMapping={source:source,generatedLine:mapping.generatedLine+(section.generatedOffset.generatedLine-1),generatedColumn:mapping.column+(section.generatedOffset.generatedLine===mapping.generatedLine)?section.generatedOffset.generatedColumn-1:0,originalLine:mapping.originalLine,originalColumn:mapping.originalColumn,name:name};this.__generatedMappings.push(adjustedMapping);if(typeof adjustedMapping.originalLine==='number'){this.__originalMappings.push(adjustedMapping);}};};quickSort(this.__generatedMappings,util.compareByGeneratedPositionsDeflated);quickSort(this.__originalMappings,util.compareByOriginalPositions);};exports.IndexedSourceMapConsumer=IndexedSourceMapConsumer;});},{"./array-set":44,"./base64-vlq":45,"./binary-search":47,"./quick-sort":49,"./util":53,"amdefine":1}],51:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var base64VLQ=require('./base64-vlq');var util=require('./util');var ArraySet=require('./array-set').ArraySet;var MappingList=require('./mapping-list').MappingList; /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */function SourceMapGenerator(aArgs){if(!aArgs){aArgs={};}this._file=util.getArg(aArgs,'file',null);this._sourceRoot=util.getArg(aArgs,'sourceRoot',null);this._skipValidation=util.getArg(aArgs,'skipValidation',false);this._sources=new ArraySet();this._names=new ArraySet();this._mappings=new MappingList();this._sourcesContents=null;}SourceMapGenerator.prototype._version=3; /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */SourceMapGenerator.fromSourceMap=function SourceMapGenerator_fromSourceMap(aSourceMapConsumer){var sourceRoot=aSourceMapConsumer.sourceRoot;var generator=new SourceMapGenerator({file:aSourceMapConsumer.file,sourceRoot:sourceRoot});aSourceMapConsumer.eachMapping(function(mapping){var newMapping={generated:{line:mapping.generatedLine,column:mapping.generatedColumn}};if(mapping.source!=null){newMapping.source=mapping.source;if(sourceRoot!=null){newMapping.source=util.relative(sourceRoot,newMapping.source);}newMapping.original={line:mapping.originalLine,column:mapping.originalColumn};if(mapping.name!=null){newMapping.name=mapping.name;}}generator.addMapping(newMapping);});aSourceMapConsumer.sources.forEach(function(sourceFile){var content=aSourceMapConsumer.sourceContentFor(sourceFile);if(content!=null){generator.setSourceContent(sourceFile,content);}});return generator;}; /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */SourceMapGenerator.prototype.addMapping=function SourceMapGenerator_addMapping(aArgs){var generated=util.getArg(aArgs,'generated');var original=util.getArg(aArgs,'original',null);var source=util.getArg(aArgs,'source',null);var name=util.getArg(aArgs,'name',null);if(!this._skipValidation){this._validateMapping(generated,original,source,name);}if(source!=null&&!this._sources.has(source)){this._sources.add(source);}if(name!=null&&!this._names.has(name)){this._names.add(name);}this._mappings.add({generatedLine:generated.line,generatedColumn:generated.column,originalLine:original!=null&&original.line,originalColumn:original!=null&&original.column,source:source,name:name});}; /**
   * Set the source content for a source file.
   */SourceMapGenerator.prototype.setSourceContent=function SourceMapGenerator_setSourceContent(aSourceFile,aSourceContent){var source=aSourceFile;if(this._sourceRoot!=null){source=util.relative(this._sourceRoot,source);}if(aSourceContent!=null){ // Add the source content to the _sourcesContents map.
// Create a new _sourcesContents map if the property is null.
if(!this._sourcesContents){this._sourcesContents={};}this._sourcesContents[util.toSetString(source)]=aSourceContent;}else if(this._sourcesContents){ // Remove the source file from the _sourcesContents map.
// If the _sourcesContents map is empty, set the property to null.
delete this._sourcesContents[util.toSetString(source)];if(Object.keys(this._sourcesContents).length===0){this._sourcesContents=null;}}}; /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */SourceMapGenerator.prototype.applySourceMap=function SourceMapGenerator_applySourceMap(aSourceMapConsumer,aSourceFile,aSourceMapPath){var sourceFile=aSourceFile; // If aSourceFile is omitted, we will use the file property of the SourceMap
if(aSourceFile==null){if(aSourceMapConsumer.file==null){throw new Error('SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, '+'or the source map\'s "file" property. Both were omitted.');}sourceFile=aSourceMapConsumer.file;}var sourceRoot=this._sourceRoot; // Make "sourceFile" relative if an absolute Url is passed.
if(sourceRoot!=null){sourceFile=util.relative(sourceRoot,sourceFile);} // Applying the SourceMap can add and remove items from the sources and
// the names array.
var newSources=new ArraySet();var newNames=new ArraySet(); // Find mappings for the "sourceFile"
this._mappings.unsortedForEach(function(mapping){if(mapping.source===sourceFile&&mapping.originalLine!=null){ // Check if it can be mapped by the source map, then update the mapping.
var original=aSourceMapConsumer.originalPositionFor({line:mapping.originalLine,column:mapping.originalColumn});if(original.source!=null){ // Copy mapping
mapping.source=original.source;if(aSourceMapPath!=null){mapping.source=util.join(aSourceMapPath,mapping.source);}if(sourceRoot!=null){mapping.source=util.relative(sourceRoot,mapping.source);}mapping.originalLine=original.line;mapping.originalColumn=original.column;if(original.name!=null){mapping.name=original.name;}}}var source=mapping.source;if(source!=null&&!newSources.has(source)){newSources.add(source);}var name=mapping.name;if(name!=null&&!newNames.has(name)){newNames.add(name);}},this);this._sources=newSources;this._names=newNames; // Copy sourcesContents of applied map.
aSourceMapConsumer.sources.forEach(function(sourceFile){var content=aSourceMapConsumer.sourceContentFor(sourceFile);if(content!=null){if(aSourceMapPath!=null){sourceFile=util.join(aSourceMapPath,sourceFile);}if(sourceRoot!=null){sourceFile=util.relative(sourceRoot,sourceFile);}this.setSourceContent(sourceFile,content);}},this);}; /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */SourceMapGenerator.prototype._validateMapping=function SourceMapGenerator_validateMapping(aGenerated,aOriginal,aSource,aName){if(aGenerated&&'line' in aGenerated&&'column' in aGenerated&&aGenerated.line>0&&aGenerated.column>=0&&!aOriginal&&!aSource&&!aName){ // Case 1.
return;}else if(aGenerated&&'line' in aGenerated&&'column' in aGenerated&&aOriginal&&'line' in aOriginal&&'column' in aOriginal&&aGenerated.line>0&&aGenerated.column>=0&&aOriginal.line>0&&aOriginal.column>=0&&aSource){ // Cases 2 and 3.
return;}else {throw new Error('Invalid mapping: '+JSON.stringify({generated:aGenerated,source:aSource,original:aOriginal,name:aName}));}}; /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */SourceMapGenerator.prototype._serializeMappings=function SourceMapGenerator_serializeMappings(){var previousGeneratedColumn=0;var previousGeneratedLine=1;var previousOriginalColumn=0;var previousOriginalLine=0;var previousName=0;var previousSource=0;var result='';var mapping;var mappings=this._mappings.toArray();for(var i=0,len=mappings.length;i<len;i++){mapping=mappings[i];if(mapping.generatedLine!==previousGeneratedLine){previousGeneratedColumn=0;while(mapping.generatedLine!==previousGeneratedLine){result+=';';previousGeneratedLine++;}}else {if(i>0){if(!util.compareByGeneratedPositionsInflated(mapping,mappings[i-1])){continue;}result+=',';}}result+=base64VLQ.encode(mapping.generatedColumn-previousGeneratedColumn);previousGeneratedColumn=mapping.generatedColumn;if(mapping.source!=null){result+=base64VLQ.encode(this._sources.indexOf(mapping.source)-previousSource);previousSource=this._sources.indexOf(mapping.source); // lines are stored 0-based in SourceMap spec version 3
result+=base64VLQ.encode(mapping.originalLine-1-previousOriginalLine);previousOriginalLine=mapping.originalLine-1;result+=base64VLQ.encode(mapping.originalColumn-previousOriginalColumn);previousOriginalColumn=mapping.originalColumn;if(mapping.name!=null){result+=base64VLQ.encode(this._names.indexOf(mapping.name)-previousName);previousName=this._names.indexOf(mapping.name);}}}return result;};SourceMapGenerator.prototype._generateSourcesContent=function SourceMapGenerator_generateSourcesContent(aSources,aSourceRoot){return aSources.map(function(source){if(!this._sourcesContents){return null;}if(aSourceRoot!=null){source=util.relative(aSourceRoot,source);}var key=util.toSetString(source);return Object.prototype.hasOwnProperty.call(this._sourcesContents,key)?this._sourcesContents[key]:null;},this);}; /**
   * Externalize the source map.
   */SourceMapGenerator.prototype.toJSON=function SourceMapGenerator_toJSON(){var map={version:this._version,sources:this._sources.toArray(),names:this._names.toArray(),mappings:this._serializeMappings()};if(this._file!=null){map.file=this._file;}if(this._sourceRoot!=null){map.sourceRoot=this._sourceRoot;}if(this._sourcesContents){map.sourcesContent=this._generateSourcesContent(map.sources,map.sourceRoot);}return map;}; /**
   * Render the source map being generated to a string.
   */SourceMapGenerator.prototype.toString=function SourceMapGenerator_toString(){return JSON.stringify(this.toJSON());};exports.SourceMapGenerator=SourceMapGenerator;});},{"./array-set":44,"./base64-vlq":45,"./mapping-list":48,"./util":53,"amdefine":1}],52:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){var SourceMapGenerator=require('./source-map-generator').SourceMapGenerator;var util=require('./util'); // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE=/(\r?\n)/; // Newline character code for charCodeAt() comparisons
var NEWLINE_CODE=10; // Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode="$$$isSourceNode$$$"; /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */function SourceNode(aLine,aColumn,aSource,aChunks,aName){this.children=[];this.sourceContents={};this.line=aLine==null?null:aLine;this.column=aColumn==null?null:aColumn;this.source=aSource==null?null:aSource;this.name=aName==null?null:aName;this[isSourceNode]=true;if(aChunks!=null)this.add(aChunks);} /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */SourceNode.fromStringWithSourceMap=function SourceNode_fromStringWithSourceMap(aGeneratedCode,aSourceMapConsumer,aRelativePath){ // The SourceNode we want to fill with the generated code
// and the SourceMap
var node=new SourceNode(); // All even indices of this array are one line of the generated code,
// while all odd indices are the newlines between two adjacent lines
// (since `REGEX_NEWLINE` captures its match).
// Processed fragments are removed from this array, by calling `shiftNextLine`.
var remainingLines=aGeneratedCode.split(REGEX_NEWLINE);var shiftNextLine=function shiftNextLine(){var lineContents=remainingLines.shift(); // The last line of a file might not have a newline.
var newLine=remainingLines.shift()||"";return lineContents+newLine;}; // We need to remember the position of "remainingLines"
var lastGeneratedLine=1,lastGeneratedColumn=0; // The generate SourceNodes we need a code range.
// To extract it current and last mapping is used.
// Here we store the last mapping.
var lastMapping=null;aSourceMapConsumer.eachMapping(function(mapping){if(lastMapping!==null){ // We add the code from "lastMapping" to "mapping":
// First check if there is a new line in between.
if(lastGeneratedLine<mapping.generatedLine){var code=""; // Associate first line with "lastMapping"
addMappingWithCode(lastMapping,shiftNextLine());lastGeneratedLine++;lastGeneratedColumn=0; // The remaining code is added without mapping
}else { // There is no new line in between.
// Associate the code between "lastGeneratedColumn" and
// "mapping.generatedColumn" with "lastMapping"
var nextLine=remainingLines[0];var code=nextLine.substr(0,mapping.generatedColumn-lastGeneratedColumn);remainingLines[0]=nextLine.substr(mapping.generatedColumn-lastGeneratedColumn);lastGeneratedColumn=mapping.generatedColumn;addMappingWithCode(lastMapping,code); // No more remaining code, continue
lastMapping=mapping;return;}} // We add the generated code until the first mapping
// to the SourceNode without any mapping.
// Each line is added as separate string.
while(lastGeneratedLine<mapping.generatedLine){node.add(shiftNextLine());lastGeneratedLine++;}if(lastGeneratedColumn<mapping.generatedColumn){var nextLine=remainingLines[0];node.add(nextLine.substr(0,mapping.generatedColumn));remainingLines[0]=nextLine.substr(mapping.generatedColumn);lastGeneratedColumn=mapping.generatedColumn;}lastMapping=mapping;},this); // We have processed all mappings.
if(remainingLines.length>0){if(lastMapping){ // Associate the remaining code in the current line with "lastMapping"
addMappingWithCode(lastMapping,shiftNextLine());} // and add the remaining lines without any mapping
node.add(remainingLines.join(""));} // Copy sourcesContent into SourceNode
aSourceMapConsumer.sources.forEach(function(sourceFile){var content=aSourceMapConsumer.sourceContentFor(sourceFile);if(content!=null){if(aRelativePath!=null){sourceFile=util.join(aRelativePath,sourceFile);}node.setSourceContent(sourceFile,content);}});return node;function addMappingWithCode(mapping,code){if(mapping===null||mapping.source===undefined){node.add(code);}else {var source=aRelativePath?util.join(aRelativePath,mapping.source):mapping.source;node.add(new SourceNode(mapping.originalLine,mapping.originalColumn,source,code,mapping.name));}}}; /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */SourceNode.prototype.add=function SourceNode_add(aChunk){if(Array.isArray(aChunk)){aChunk.forEach(function(chunk){this.add(chunk);},this);}else if(aChunk[isSourceNode]||typeof aChunk==="string"){if(aChunk){this.children.push(aChunk);}}else {throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+aChunk);}return this;}; /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */SourceNode.prototype.prepend=function SourceNode_prepend(aChunk){if(Array.isArray(aChunk)){for(var i=aChunk.length-1;i>=0;i--){this.prepend(aChunk[i]);}}else if(aChunk[isSourceNode]||typeof aChunk==="string"){this.children.unshift(aChunk);}else {throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+aChunk);}return this;}; /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */SourceNode.prototype.walk=function SourceNode_walk(aFn){var chunk;for(var i=0,len=this.children.length;i<len;i++){chunk=this.children[i];if(chunk[isSourceNode]){chunk.walk(aFn);}else {if(chunk!==''){aFn(chunk,{source:this.source,line:this.line,column:this.column,name:this.name});}}}}; /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */SourceNode.prototype.join=function SourceNode_join(aSep){var newChildren;var i;var len=this.children.length;if(len>0){newChildren=[];for(i=0;i<len-1;i++){newChildren.push(this.children[i]);newChildren.push(aSep);}newChildren.push(this.children[i]);this.children=newChildren;}return this;}; /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */SourceNode.prototype.replaceRight=function SourceNode_replaceRight(aPattern,aReplacement){var lastChild=this.children[this.children.length-1];if(lastChild[isSourceNode]){lastChild.replaceRight(aPattern,aReplacement);}else if(typeof lastChild==='string'){this.children[this.children.length-1]=lastChild.replace(aPattern,aReplacement);}else {this.children.push(''.replace(aPattern,aReplacement));}return this;}; /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */SourceNode.prototype.setSourceContent=function SourceNode_setSourceContent(aSourceFile,aSourceContent){this.sourceContents[util.toSetString(aSourceFile)]=aSourceContent;}; /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */SourceNode.prototype.walkSourceContents=function SourceNode_walkSourceContents(aFn){for(var i=0,len=this.children.length;i<len;i++){if(this.children[i][isSourceNode]){this.children[i].walkSourceContents(aFn);}}var sources=Object.keys(this.sourceContents);for(var i=0,len=sources.length;i<len;i++){aFn(util.fromSetString(sources[i]),this.sourceContents[sources[i]]);}}; /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */SourceNode.prototype.toString=function SourceNode_toString(){var str="";this.walk(function(chunk){str+=chunk;});return str;}; /**
   * Returns the string representation of this source node along with a source
   * map.
   */SourceNode.prototype.toStringWithSourceMap=function SourceNode_toStringWithSourceMap(aArgs){var generated={code:"",line:1,column:0};var map=new SourceMapGenerator(aArgs);var sourceMappingActive=false;var lastOriginalSource=null;var lastOriginalLine=null;var lastOriginalColumn=null;var lastOriginalName=null;this.walk(function(chunk,original){generated.code+=chunk;if(original.source!==null&&original.line!==null&&original.column!==null){if(lastOriginalSource!==original.source||lastOriginalLine!==original.line||lastOriginalColumn!==original.column||lastOriginalName!==original.name){map.addMapping({source:original.source,original:{line:original.line,column:original.column},generated:{line:generated.line,column:generated.column},name:original.name});}lastOriginalSource=original.source;lastOriginalLine=original.line;lastOriginalColumn=original.column;lastOriginalName=original.name;sourceMappingActive=true;}else if(sourceMappingActive){map.addMapping({generated:{line:generated.line,column:generated.column}});lastOriginalSource=null;sourceMappingActive=false;}for(var idx=0,length=chunk.length;idx<length;idx++){if(chunk.charCodeAt(idx)===NEWLINE_CODE){generated.line++;generated.column=0; // Mappings end at eol
if(idx+1===length){lastOriginalSource=null;sourceMappingActive=false;}else if(sourceMappingActive){map.addMapping({source:original.source,original:{line:original.line,column:original.column},generated:{line:generated.line,column:generated.column},name:original.name});}}else {generated.column++;}}});this.walkSourceContents(function(sourceFile,sourceContent){map.setSourceContent(sourceFile,sourceContent);});return {code:generated.code,map:map};};exports.SourceNode=SourceNode;});},{"./source-map-generator":51,"./util":53,"amdefine":1}],53:[function(require,module,exports){ /* -*- Mode: js; js-indent-level: 2; -*- */ /*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */if(typeof define!=='function'){var define=require('amdefine')(module,require);}define(function(require,exports,module){ /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */function getArg(aArgs,aName,aDefaultValue){if(aName in aArgs){return aArgs[aName];}else if(arguments.length===3){return aDefaultValue;}else {throw new Error('"'+aName+'" is a required argument.');}}exports.getArg=getArg;var urlRegexp=/^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;var dataUrlRegexp=/^data:.+\,.+$/;function urlParse(aUrl){var match=aUrl.match(urlRegexp);if(!match){return null;}return {scheme:match[1],auth:match[2],host:match[3],port:match[4],path:match[5]};}exports.urlParse=urlParse;function urlGenerate(aParsedUrl){var url='';if(aParsedUrl.scheme){url+=aParsedUrl.scheme+':';}url+='//';if(aParsedUrl.auth){url+=aParsedUrl.auth+'@';}if(aParsedUrl.host){url+=aParsedUrl.host;}if(aParsedUrl.port){url+=":"+aParsedUrl.port;}if(aParsedUrl.path){url+=aParsedUrl.path;}return url;}exports.urlGenerate=urlGenerate; /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */function normalize(aPath){var path=aPath;var url=urlParse(aPath);if(url){if(!url.path){return aPath;}path=url.path;}var isAbsolute=path.charAt(0)==='/';var parts=path.split(/\/+/);for(var part,up=0,i=parts.length-1;i>=0;i--){part=parts[i];if(part==='.'){parts.splice(i,1);}else if(part==='..'){up++;}else if(up>0){if(part===''){ // The first part is blank if the path is absolute. Trying to go
// above the root is a no-op. Therefore we can remove all '..' parts
// directly after the root.
parts.splice(i+1,up);up=0;}else {parts.splice(i,2);up--;}}}path=parts.join('/');if(path===''){path=isAbsolute?'/':'.';}if(url){url.path=path;return urlGenerate(url);}return path;}exports.normalize=normalize; /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */function join(aRoot,aPath){if(aRoot===""){aRoot=".";}if(aPath===""){aPath=".";}var aPathUrl=urlParse(aPath);var aRootUrl=urlParse(aRoot);if(aRootUrl){aRoot=aRootUrl.path||'/';} // `join(foo, '//www.example.org')`
if(aPathUrl&&!aPathUrl.scheme){if(aRootUrl){aPathUrl.scheme=aRootUrl.scheme;}return urlGenerate(aPathUrl);}if(aPathUrl||aPath.match(dataUrlRegexp)){return aPath;} // `join('http://', 'www.example.com')`
if(aRootUrl&&!aRootUrl.host&&!aRootUrl.path){aRootUrl.host=aPath;return urlGenerate(aRootUrl);}var joined=aPath.charAt(0)==='/'?aPath:normalize(aRoot.replace(/\/+$/,'')+'/'+aPath);if(aRootUrl){aRootUrl.path=joined;return urlGenerate(aRootUrl);}return joined;}exports.join=join; /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */function relative(aRoot,aPath){if(aRoot===""){aRoot=".";}aRoot=aRoot.replace(/\/$/,''); // It is possible for the path to be above the root. In this case, simply
// checking whether the root is a prefix of the path won't work. Instead, we
// need to remove components from the root one by one, until either we find
// a prefix that fits, or we run out of components to remove.
var level=0;while(aPath.indexOf(aRoot+'/')!==0){var index=aRoot.lastIndexOf("/");if(index<0){return aPath;} // If the only part of the root that is left is the scheme (i.e. http://,
// file:///, etc.), one or more slashes (/), or simply nothing at all, we
// have exhausted all components, so the path is not relative to the root.
aRoot=aRoot.slice(0,index);if(aRoot.match(/^([^\/]+:\/)?\/*$/)){return aPath;}++level;} // Make sure we add a "../" for each component we removed from the root.
return Array(level+1).join("../")+aPath.substr(aRoot.length+1);}exports.relative=relative; /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */function toSetString(aStr){return '$'+aStr;}exports.toSetString=toSetString;function fromSetString(aStr){return aStr.substr(1);}exports.fromSetString=fromSetString; /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */function compareByOriginalPositions(mappingA,mappingB,onlyCompareOriginal){var cmp=mappingA.source-mappingB.source;if(cmp!==0){return cmp;}cmp=mappingA.originalLine-mappingB.originalLine;if(cmp!==0){return cmp;}cmp=mappingA.originalColumn-mappingB.originalColumn;if(cmp!==0||onlyCompareOriginal){return cmp;}cmp=mappingA.generatedColumn-mappingB.generatedColumn;if(cmp!==0){return cmp;}cmp=mappingA.generatedLine-mappingB.generatedLine;if(cmp!==0){return cmp;}return mappingA.name-mappingB.name;};exports.compareByOriginalPositions=compareByOriginalPositions; /**
   * Comparator between two mappings with deflated source and name indices where
   * the generated positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */function compareByGeneratedPositionsDeflated(mappingA,mappingB,onlyCompareGenerated){var cmp=mappingA.generatedLine-mappingB.generatedLine;if(cmp!==0){return cmp;}cmp=mappingA.generatedColumn-mappingB.generatedColumn;if(cmp!==0||onlyCompareGenerated){return cmp;}cmp=mappingA.source-mappingB.source;if(cmp!==0){return cmp;}cmp=mappingA.originalLine-mappingB.originalLine;if(cmp!==0){return cmp;}cmp=mappingA.originalColumn-mappingB.originalColumn;if(cmp!==0){return cmp;}return mappingA.name-mappingB.name;};exports.compareByGeneratedPositionsDeflated=compareByGeneratedPositionsDeflated;function strcmp(aStr1,aStr2){if(aStr1===aStr2){return 0;}if(aStr1>aStr2){return 1;}return -1;} /**
   * Comparator between two mappings with inflated source and name strings where
   * the generated positions are compared.
   */function compareByGeneratedPositionsInflated(mappingA,mappingB){var cmp=mappingA.generatedLine-mappingB.generatedLine;if(cmp!==0){return cmp;}cmp=mappingA.generatedColumn-mappingB.generatedColumn;if(cmp!==0){return cmp;}cmp=strcmp(mappingA.source,mappingB.source);if(cmp!==0){return cmp;}cmp=mappingA.originalLine-mappingB.originalLine;if(cmp!==0){return cmp;}cmp=mappingA.originalColumn-mappingB.originalColumn;if(cmp!==0){return cmp;}return strcmp(mappingA.name,mappingB.name);};exports.compareByGeneratedPositionsInflated=compareByGeneratedPositionsInflated;});},{"amdefine":1}],54:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=math;function math(lvalue,operator,rvalue,options){lvalue=parseFloat(lvalue);rvalue=parseFloat(rvalue);return {"+":lvalue+rvalue,"-":lvalue-rvalue,"*":lvalue*rvalue,"/":lvalue/rvalue,"%":lvalue%rvalue}[operator];}},{}],55:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=translate;function translate(lang,str){var trad=Locales;if(typeof trad[lang]!=='undefined'&&trad[lang]!==null&&typeof trad[lang][str]!=='undefined'&&trad[lang][str]!==null){return trad[lang][str];}return str;}},{}],56:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Devtool=exports.Devtool=function(){function Devtool(){_classCallCheck(this,Devtool);this.body=$('body');this.form=$('.form-wrapper');this.form=$('.form-wrapper');this.ruler=$('.iframe-wrapper');this.initDevtool();this.updateBrowserSize();}_createClass(Devtool,[{key:'getCookie',value:function getCookie(cname){var name=cname+"=";var ca=document.cookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' '){c=c.substring(1);}if(c.indexOf(name)==0){return c.substring(name.length,c.length);}}return "";}},{key:'setCookie',value:function setCookie(cname,cvalue,exdays){var d=new Date();d.setTime(d.getTime()+exdays*24*60*60*1000);var expires="expires="+d.toUTCString();document.cookie=cname+"="+cvalue+"; "+expires;} // ABE devtool
},{key:'initDevtool',value:function initDevtool(){var _this=this;var baseWidth=this.getCookie('editorWidth');if(typeof baseWidth!=='undefined'&&baseWidth!==null&&baseWidth!==''){baseWidth=baseWidth;this.form.width(baseWidth);this.form.attr('data-width',baseWidth);this.updateBrowserSize();}this.ruler.on('mousedown',function(e){_this.body.addClass('resizing');var newWidth;_this.body.on('mousemove',function(e){newWidth=e.clientX/window.innerWidth*100+'%';_this.form.width(newWidth);_this.form.attr('data-width',newWidth);_this.updateBrowserSize();});_this.body.one('mouseup mouseleave',function(){_this.body.off('mousemove');_this.body.removeClass('resizing');_this.setCookie('editorWidth',newWidth,365);});});$(window).on('resize',function(){_this.updateBrowserSize();_this.body.addClass('resizing');setTimeout(function(){_this.body.removeClass('resizing');},1000);});$('.close-engine').on('click',function(e){_this.body.removeClass('engine-open');_this.form.width(0);});$('.open-engine').on('click',function(e){_this.body.addClass('engine-open');_this.form.width(_this.form.attr('data-width'));});}},{key:'updateBrowserSize',value:function updateBrowserSize(){var $iframe=$('.iframe-wrapper iframe');$('.browser-size').text($iframe.width()+'px x '+$iframe.height()+'px');}}]);return Devtool;}();},{}],57:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _EditorUtils=require('../modules/EditorUtils');var _EditorUtils2=_interopRequireDefault(_EditorUtils);var _EditorJson=require('../modules/EditorJson');var _EditorJson2=_interopRequireDefault(_EditorJson);var _EditorSave=require('../modules/EditorSave');var _EditorSave2=_interopRequireDefault(_EditorSave);var _iframe=require('../utils/iframe');var _handlebars=require('handlebars');var _handlebars2=_interopRequireDefault(_handlebars);var _nanoajax=require('nanoajax');var _nanoajax2=_interopRequireDefault(_nanoajax);var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);var _on=require('on');var _on2=_interopRequireDefault(_on);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EditorAutocomplete=function(){function EditorAutocomplete(){_classCallCheck(this,EditorAutocomplete);this._ajax=_nanoajax2.default.ajax;this._json=_EditorJson2.default.instance;this.onReload=(0,_on2.default)(this);this._previousValue='';this._handleKeyUp=this._keyUp.bind(this);this._handleKeyDown=this._keyDown.bind(this);this._handleFocus=this._focus.bind(this);this._handleBlur=this._blur.bind(this);this._handleRemove=this._remove.bind(this);this._handleDocumentClick=this._documentClick.bind(this);this._handleSelectValue=this._selectValue.bind(this);this._autocompletesRemove=[].slice.call(document.querySelectorAll('[data-autocomplete-remove=true]'));this._autocompletes=[].slice.call(document.querySelectorAll('[data-autocomplete=true]'));this._currentInput=null;this._divWrapper=document.createElement('div');this._divWrapper.classList.add('autocomplete-wrapper');this._visible=false;this.rebind();}_createClass(EditorAutocomplete,[{key:'rebind',value:function rebind(){var _this=this;document.body.removeEventListener('mouseup',this._handleDocumentClick);document.body.addEventListener('mouseup',this._handleDocumentClick);Array.prototype.forEach.call(this._autocompletesRemove,function(autocompleteRemove){autocompleteRemove.addEventListener('click',_this._handleRemove);});Array.prototype.forEach.call(this._autocompletes,function(autocomplete){document.body.removeEventListener('keydown',_this._handleKeyDown);document.body.addEventListener('keydown',_this._handleKeyDown);autocomplete.removeEventListener('keyup',_this._handleKeyUp);autocomplete.addEventListener('keyup',_this._handleKeyUp);autocomplete.removeEventListener('focus',_this._handleFocus);autocomplete.addEventListener('focus',_this._handleFocus);autocomplete.removeEventListener('blur',_this._handleBlur);autocomplete.addEventListener('blur',_this._handleBlur);});}},{key:'_saveData',value:function _saveData(){var _this2=this;var id=this._currentInput.getAttribute('id');var nodeComments=(0,_iframe.IframeCommentNode)('#page-template',id);var maxLength=this._currentInput.getAttribute('data-maxlength');if(typeof maxLength!=='undefined'&&maxLength!==null&&maxLength!==''){maxLength=parseInt(maxLength);var countLength=[].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length;if(countLength===maxLength){this._currentInput.value='';this._divWrapper.parentNode.removeChild(this._divWrapper);this._currentInput.setAttribute('disabled','disabled');}else {this._currentInput.removeAttribute('disabled');}}if(typeof nodeComments!=='undefined'&&nodeComments!==null&&nodeComments.length>0){var results=[].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result'));var json=this._json.data;json[id]=[];Array.prototype.forEach.call(results,function(result){var value=result.getAttribute('value');if(value!==''){if(value.indexOf('{')>-1||value.indexOf('[')>-1){json[id].push(JSON.parse(value));}else {json[id].push(value);}}});this._json.data=json;try{Array.prototype.forEach.call(nodeComments,function(nodeComment){var blockHtml=unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/,'')).replace(/\[0\]-/g,'[0]-'); // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
var template=_handlebars2.default.compile(blockHtml,{noEscape:true});var compiled=template(_this2._json.data);nodeComment.parentNode.innerHTML=compiled+('<!-- '+nodeComment.textContent+' -->');});}catch(e){console.log(e);}}else if(typeof id!=='undefined'&&id!==null){if(this._currentInput.getAttribute('visible')===true){var nodes=_EditorUtils2.default.getNode(attr);Array.prototype.forEach.call(nodes,function(node){_EditorUtils2.default.formToHtml(node,_this2._currentInput);});}}this.onReload._fire();}},{key:'_documentClick',value:function _documentClick(e){if(this._visible&&!this._canSelect){if(typeof this._divWrapper.parentNode!=='undefined'&&this._divWrapper.parentNode!==null){this._hide();}}}},{key:'_select',value:function _select(target){var val=JSON.parse(target.getAttribute('data-value'));var maxLength=this._currentInput.getAttribute('data-maxlength');if(typeof maxLength!=='undefined'&&maxLength!==null&&maxLength!==''){maxLength=parseInt(maxLength);var countLength=[].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length;if(countLength+1>maxLength){return;}}var display=target.getAttribute('data-display');var div=document.createElement('div');div.classList.add('autocomplete-result');div.setAttribute('data-parent-id',this._currentInput.getAttribute('data-id'));div.setAttribute('value',target.getAttribute('data-value'));div.innerHTML=''+this._deep_value_array(val,display);var resWrapper=this._divWrapper.parentNode.querySelector('.autocomplete-result-wrapper');var remove=document.createElement('span');remove.classList.add('glyphicon','glyphicon-remove');remove.setAttribute('data-autocomplete-remove','true');remove.addEventListener('click',this._handleRemove);div.appendChild(remove);resWrapper.appendChild(div);this._saveData();}},{key:'_selectValue',value:function _selectValue(e){this._select(e.currentTarget);}},{key:'_showAutocomplete',value:function _showAutocomplete(sources,target,val){var _this3=this;var display=target.getAttribute('data-display');var first=true;this._divWrapper.innerHTML='';if(typeof sources!=='undefined'&&sources!==null){if((typeof sources==='undefined'?'undefined':_typeof(sources))==='object'&&Object.prototype.toString.call(sources)==='[object Object]'){sources=[sources];}Array.prototype.forEach.call(sources,function(source){var sourceVal=_this3._deep_value_array(source,display);if(typeof sourceVal!=='undefined'&&sourceVal!==null){sourceVal=sourceVal.toLowerCase();if(sourceVal.indexOf(val)>-1){var div=document.createElement('div');div.addEventListener('mousedown',_this3._handleSelectValue);div.setAttribute('data-value',JSON.stringify(source));div.setAttribute('data-display',display);if(first){div.classList.add('selected');}first=false;div.innerHTML=sourceVal.replace(val,'<span class="select">'+val+'</span>');_this3._divWrapper.appendChild(div);}}});}this._show(target);}},{key:'_hide',value:function _hide(){if(this._visible){this._visible=false;this._shouldBeVisible=false;this._divWrapper.parentNode.removeChild(this._divWrapper);}}},{key:'_show',value:function _show(target){if(!this._visible){this._visible=true;this._divWrapper.style.marginTop=target.offsetHeight+'px';this._divWrapper.style.width=target.offsetWidth+'px';target.parentNode.insertBefore(this._divWrapper,target);}}},{key:'_startAutocomplete',value:function _startAutocomplete(target){var _this4=this;var val=target.value.toLowerCase();if(val.length>2){if(this._previousValue===val){this._show(target);return;}else {this._previousValue=val;}var dataVal=target.getAttribute('data-value');if(dataVal.indexOf('http')===0){this._ajax({url:''+dataVal+val,body:'',cors:true,method:'get'},function(code,responseText,request){_this4._showAutocomplete(JSON.parse(responseText),target,val);});}else {var sources=JSON.parse(target.getAttribute('data-value'));this._showAutocomplete(sources,target,val);}}else {this._hide();}}},{key:'_keyUp',value:function _keyUp(e){if(e.keyCode!==13){this._startAutocomplete(e.currentTarget);}}},{key:'_keyDown',value:function _keyDown(e){if(this._canSelect){var parent=this._currentInput.parentNode.querySelector('.autocomplete-wrapper');if(typeof parent!=='undefined'&&parent!==null){var current=this._currentInput.parentNode.querySelector('.autocomplete-wrapper .selected');var newSelected=null;var selected=document.querySelector('.autocomplete-wrapper .selected');switch(e.keyCode){case 9: // tab
this._hide();break;case 13: // enter
e.preventDefault();if(typeof selected!=='undefined'&&selected!==null){this._select(selected);this._hide();}break;case 27: // escape
e.preventDefault();this._hide();break;case 40: // down
e.preventDefault();if(typeof selected!=='undefined'&&selected!==null){newSelected=selected.nextSibling;this._show(e.currentTarget);}break;case 38: // prev
e.preventDefault();if(typeof selected!=='undefined'&&selected!==null){newSelected=selected.previousSibling;}break;default:break;}if(typeof newSelected!=='undefined'&&newSelected!==null){var scrollTopMin=parent.scrollTop;var scrollTopMax=parent.scrollTop+parent.offsetHeight-newSelected.offsetHeight;var offsetTop=newSelected.offsetTop;if(scrollTopMax<offsetTop){parent.scrollTop=newSelected.offsetTop-parent.offsetHeight+newSelected.offsetHeight;}else if(scrollTopMin>offsetTop){parent.scrollTop=newSelected.offsetTop;}current.classList.remove('selected');newSelected.classList.add('selected');}}}}},{key:'_focus',value:function _focus(e){this._canSelect=true;this._currentInput=e.currentTarget;this._startAutocomplete(e.currentTarget);}},{key:'_blur',value:function _blur(e){this._canSelect=false;this._currentInput=null;this._hide();}},{key:'_remove',value:function _remove(e){var target=e.currentTarget.parentNode;this._currentInput=document.querySelector('#'+target.getAttribute('data-parent-id'));target.parentNode.removeChild(target);this._saveData();this._currentInput=null;}},{key:'_deep_value_array',value:function _deep_value_array(obj,path){var _this5=this;if(path.indexOf('.')===-1){return typeof obj[path]!=='undefined'&&obj[path]!==null?obj[path]:null;}var pathSplit=path.split('.');var res=JSON.parse(JSON.stringify(obj));while(pathSplit.length>0){if(typeof res[pathSplit[0]]!=='undefined'&&res[pathSplit[0]]!==null){if(_typeof(res[pathSplit[0]])==='object'&&Object.prototype.toString.call(res[pathSplit[0]])==='[object Array]'){var resArray=[];Array.prototype.forEach.call(res[pathSplit[0]],function(item){resArray.push(_this5._deep_value_array(item,pathSplit.join('.').replace(pathSplit[0]+'.','')));});res=resArray;pathSplit.shift();}else {res=res[pathSplit[0]];}}else {return null;}pathSplit.shift();}return res;}},{key:'_deep_value',value:function _deep_value(obj,path){if(path.indexOf('.')===-1){return typeof obj[path]!=='undefined'&&obj[path]!==null?obj[path]:null;}var pathSplit=path.split('.');var res=JSON.parse(JSON.stringify(obj));for(var i=0;i<pathSplit.length;i++){if(typeof res[pathSplit[i]]!=='undefined'&&res[pathSplit[i]]!==null){res=res[pathSplit[i]];}else {return null;}}return res;}}]);return EditorAutocomplete;}();exports.default=EditorAutocomplete;},{"../modules/EditorJson":61,"../modules/EditorSave":64,"../modules/EditorUtils":65,"../utils/iframe":69,"handlebars":34,"nanoajax":35,"on":36,"qs":39}],58:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _iframe=require('../utils/iframe');var _dom=require('../utils/dom');var _colorPicker=require('../utils/color-picker');var _colorPicker2=_interopRequireDefault(_colorPicker);var _linkPicker=require('../utils/link-picker');var _linkPicker2=_interopRequireDefault(_linkPicker);var _richTexarea=require('../utils/rich-texarea');var _richTexarea2=_interopRequireDefault(_richTexarea);var _EditorJson=require('./EditorJson');var _EditorJson2=_interopRequireDefault(_EditorJson);var _EditorInputs=require('./EditorInputs');var _EditorInputs2=_interopRequireDefault(_EditorInputs);var _EditorUtils=require('./EditorUtils');var _EditorUtils2=_interopRequireDefault(_EditorUtils);var _on=require('on');var _on2=_interopRequireDefault(_on);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EditorBlock=function(){function EditorBlock(){_classCallCheck(this,EditorBlock);this._json=_EditorJson2.default.instance;this.color=new _colorPicker2.default(document.querySelector('.wysiwyg-popup.color'));this.link=new _linkPicker2.default(document.querySelector('.wysiwyg-popup.link'));this._removeblock=[].slice.call(document.querySelectorAll('.list-group[data-block]'));this._handleClickRemoveBlock=this._clickRemoveBlock.bind(this);this._addblock=[].slice.call(document.querySelectorAll('.add-block'));this._handleClickAddBlock=this._clickAddBlock.bind(this);this.onNewBlock=(0,_on2.default)(this);this.onRemoveBlock=(0,_on2.default)(this);this._bindEvents();} /**
   * bind events
   * @return {[type]} [description]
   */_createClass(EditorBlock,[{key:'_bindEvents',value:function _bindEvents(){var _this=this;this._removeblock.forEach(function(block){block.addEventListener('click',_this._handleClickRemoveBlock);});this._addblock.forEach(function(block){block.addEventListener('click',_this._handleClickAddBlock);});} /**
     * event remove block
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_clickRemoveBlock',value:function _clickRemoveBlock(e){var target=e.target,elem=target,parent=null,listGroup=null,iframeRefAll=null,blockAttr='',wasFound=false,startNumber=0,endNumber=0;if(elem.classList.contains('glyphicon-trash')||elem.classList.contains('remove-block')){for(;elem&&elem!==document;elem=elem.parentNode){if(elem.hasAttribute('data-block')){parent=elem;listGroup=parent.parentNode;blockAttr=listGroup.getAttribute('data-block');break;}}}if(parent&&listGroup){if(listGroup.querySelectorAll('[data-block]').length===1){var items=(0,_iframe.IframeNode)('#page-template','[data-abe-block="'+blockAttr+'0"]');Array.prototype.forEach.call(items,function(item){item.parentNode.removeChild(item);});var child=document.querySelector('[data-block='+blockAttr+'0]');child.style.display='none';Array.prototype.forEach.call(child.querySelectorAll('.form-abe'),function(item){item.value='';});}else {var toRemove=null;Array.prototype.forEach.call(listGroup.querySelectorAll('[data-block]'),function(block){var currentBlockAttr=block.getAttribute('data-block');var nb=parseInt(currentBlockAttr.replace(blockAttr,'')); // iframeRefAll = IframeNode('#page-template', `[data-abe-block="${currentBlockAttr}"]`)
if(wasFound){Array.prototype.forEach.call(listGroup.querySelectorAll('.form-abe'),function(el){el.setAttribute('value',el.value);});var blockId=blockAttr+(nb-1);var html=block.innerHTML;html=html.replace(/data-block=(\'|\")(.*)(\'|\")/g,'data-block="'+blockId+'"');html=html.replace(/data-target=(\'|\")(.*)(\'|\")/g,'data-target="#'+blockId+'"');html=html.replace(new RegExp('id=('+"\\'"+'|\\"'+')'+blockAttr+'(\\d+)('+"\\'"+'|\\"'+')','g'),'id="'+blockId+'"');html=html.replace(/\[(\d+)\]/g,'['+(nb-1)+']');block.innerHTML=html;block.setAttribute('data-block',blockAttr+(nb-1));var labelCount=block.querySelector('.label-count');labelCount.textContent=parseInt(labelCount.textContent)-1;Array.prototype.forEach.call(block.querySelectorAll('label'),function(label){label.textContent=label.textContent.replace(new RegExp(nb,'g'),nb-1);});Array.prototype.forEach.call((0,_iframe.IframeNode)('#page-template','[data-abe-block="'+(blockAttr+nb)+'"]'),function(el){el.parentNode.removeChild(el);});endNumber=nb;}else if(currentBlockAttr===parent.getAttribute('data-block')){Array.prototype.forEach.call((0,_iframe.IframeNode)('#page-template','[data-abe-block="'+(blockAttr+nb)+'"]'),function(el){el.parentNode.removeChild(el);});toRemove=block;wasFound=true;startNumber=nb;}});toRemove.remove();var json=this._json.data;for(var i=startNumber;i<endNumber;i++){this._insertNewBlock(blockAttr,i);Array.prototype.forEach.call(document.querySelectorAll('[data-block="'+blockAttr+i+'"] .form-abe'),function(el){var key=el.getAttribute('data-id').split('-');if(key){key=key[1];json[blockAttr][i][key]=el.value;var nodes=_EditorUtils2.default.getNode(_EditorUtils2.default.getAttr(el));Array.prototype.forEach.call(nodes,function(node){_EditorUtils2.default.formToHtml(node,el);});}});}json[blockAttr].pop();this._json.data=json;}}this.onRemoveBlock._fire();} /**
     * event add new block
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_clickAddBlock',value:function _clickAddBlock(e){var target=e.currentTarget;var dataLink=target.getAttribute('data-id-link');var prevListItem=target.parentNode.parentNode.querySelectorAll('.list-block');var listGroupItem=prevListItem.length;prevListItem=prevListItem[prevListItem.length-1];var attrId=typeof dataLink!=='undefined'&&dataLink!==null?'data-id-link':'data-id',itemNumber=0,newNumber=0,rex=new RegExp(itemNumber,'g');if(listGroupItem>1||listGroupItem===1&&prevListItem.style.display!=='none'){newNumber=this._createNewBlock(prevListItem,itemNumber,newNumber);rex=new RegExp(newNumber-1,'g');}else {prevListItem.style.display='block';}prevListItem=target.parentNode.parentNode.querySelectorAll('.list-block');prevListItem=prevListItem[prevListItem.length-1];var prevButton=prevListItem.querySelector('button');var dataTarget=prevButton.getAttribute('data-target');var newTarget=dataTarget.replace(rex,newNumber);var contentListItem=prevListItem.querySelector(dataTarget);contentListItem.setAttribute('id',newTarget.slice(1));contentListItem.setAttribute(attrId,newTarget.slice(1));prevButton.setAttribute('data-target',newTarget);this._insertNewBlock(prevListItem.parentNode.getAttribute('data-block'),newNumber);var labels=prevListItem.querySelectorAll('label');Array.prototype.forEach.call(labels,function(label){label.innerHTML=label.innerHTML.replace(rex,newNumber);});if($(target).parents('.list-group').find('.list-block').size()>1){prevListItem.querySelector('.label-count').textContent=parseInt(prevListItem.querySelector('.label-count').textContent)+1;}this.onNewBlock._fire();if(typeof jQuery!=='undefined'&&jQuery!==null){ // Bootstrap collapse
var blocks=$(target).parents('.list-group').find('.list-block > [data-id]');$(target).parents('.list-group').find('.list-block .collapse').collapse('hide');setTimeout(function(){$('#'+blocks[blocks.length-1].id).collapse('show');},200);}} /**
     * insert node page side
     * @param  {[type]} dataBlock [description]
     * @param  {[type]} newNumber [description]
     * @return {[type]}           [description]
     */},{key:'_insertNewBlock',value:function _insertNewBlock(dataBlock,newNumber){var blockContent=(0,_iframe.IframeCommentNode)('#page-template',dataBlock);if(typeof blockContent!=='undefined'&&blockContent!==null&&blockContent.length>0){blockContent=blockContent[0];var blockHtml=unescape(blockContent.textContent.replace(/\[\[([\S\s]*?)\]\]/,'')).replace(new RegExp('-'+dataBlock+'0','g'),'-'+dataBlock+newNumber).replace(/\[0\]-/g,''+newNumber+'-');var newBlock=document.createElement('abe');newBlock.innerHTML=blockHtml;var childs=[].slice.call(newBlock.childNodes);Array.prototype.forEach.call(childs,function(child){if(typeof child.setAttribute!=='undefined'&&child.setAttribute!==null){child.setAttribute('data-abe-block',dataBlock+newNumber);}blockContent.parentNode.insertBefore(child,blockContent);});}} /**
     * remove default value into a form
     * @param  {[type]} block [description]
     * @return {[type]}       [description]
     */},{key:'_unValueForm',value:function _unValueForm(block){var inputs=[].slice.call(block.querySelectorAll('input'));Array.prototype.forEach.call(inputs,function(input){input.value='';});var textareas=[].slice.call(block.querySelectorAll('textarea'));Array.prototype.forEach.call(textareas,function(textarea){textarea.value='';}); // var contenteditables = [].slice.call(block.querySelectorAll('[contenteditable]'))
// Array.prototype.forEach.call(contenteditables, (contenteditable) => {
//   contenteditable.innerHTML = ''
// })
var selects=[].slice.call(block.querySelectorAll('select'));Array.prototype.forEach.call(selects,function(select){select.value='';var options=[].slice.call(select.querySelectorAll('option'));Array.prototype.forEach.call(options,function(option){option.removeAttribute('selected');});});} /**
     * Create admin side block
     * @param  {[type]} prevListItem [description]
     * @param  {[type]} itemNumber   [description]
     * @param  {[type]} newNumber    [description]
     * @return {[type]}              [description]
     */},{key:'_createNewBlock',value:function _createNewBlock(prevListItem,itemNumber,newNumber){var _this2=this;var htmlBlockItem=prevListItem.innerHTML;htmlBlockItem=htmlBlockItem.replace(/\[(.*?)\]/g,function(val,$_1){itemNumber=parseInt($_1);newNumber=itemNumber+1;return '['+newNumber+']';});var rex=new RegExp(itemNumber,'g');var dataBlock=prevListItem.getAttribute('data-block').replace(rex,newNumber);var newBlock=document.createElement('div');newBlock.classList.add('list-block');newBlock.setAttribute('data-block',dataBlock);newBlock.innerHTML=htmlBlockItem;var next=(0,_dom.nextSibling)(prevListItem.parentNode,prevListItem);prevListItem.parentNode.insertBefore(newBlock,next);this._unValueForm(newBlock);var richs=[].slice.call(newBlock.querySelectorAll('[contenteditable]'));if(typeof richs!=='undefined'&&richs!==null&&richs.length>0){Array.prototype.forEach.call(richs,function(rich){rich.remove();});var newRichs=[].slice.call(newBlock.querySelectorAll('.rich'));Array.prototype.forEach.call(newRichs,function(newRich){new _richTexarea2.default(newRich,_this2.color,_this2.link);});}return newNumber;}}]);return EditorBlock;}();exports.default=EditorBlock;},{"../utils/color-picker":67,"../utils/dom":68,"../utils/iframe":69,"../utils/link-picker":70,"../utils/rich-texarea":72,"./EditorInputs":60,"./EditorJson":61,"./EditorUtils":65,"on":36}],59:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _EditorUtils=require('../modules/EditorUtils');var _EditorUtils2=_interopRequireDefault(_EditorUtils);var _EditorInputs=require('../modules/EditorInputs');var _EditorInputs2=_interopRequireDefault(_EditorInputs);var _iframe=require('../utils/iframe');var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);var _es6Promise=require('es6-promise');var _on=require('on');var _on2=_interopRequireDefault(_on);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EditorFiles=function(){function EditorFiles(){_classCallCheck(this,EditorFiles);this._filePathEle=document.getElementById('file-path');this.onUpload=(0,_on2.default)(this);this._handleChangeFiles=this._changeFiles.bind(this);this.rebind();}_createClass(EditorFiles,[{key:'rebind',value:function rebind(){var _this=this;var files=[].slice.call(document.querySelectorAll('.img-upload input[type="file"]'));Array.prototype.forEach.call(files,function(file){file.removeEventListener('change',_this._handleChangeFiles);file.addEventListener('change',_this._handleChangeFiles);});}},{key:'_changeFiles',value:function _changeFiles(e){this._uploadFile(e.target);}},{key:'_uploadFile',value:function _uploadFile(target){var _this2=this;var formData=new FormData();if(target.value==''){console.log("Please choose file!");return false;}_EditorUtils2.default.scrollToInputElement(target);var parentTarget=target.parentNode.parentNode;var percent=parentTarget.querySelector('.percent');var percentHtml=percent.innerHTML;var file=target.files[0];var uploadError=parentTarget.nextElementSibling;uploadError.classList.remove('show');uploadError.textContent='';formData.append('uploadfile',file);var xhr=new XMLHttpRequest();xhr.open('post','/upload/?baseUrl='+CONFIG.FILEPATH+'&input='+target.outerHTML,true);xhr.upload.onprogress=function(e){if(e.lengthComputable){var percentage=e.loaded/e.total*100;percent.textContent=percentage.toFixed(0)+'%';}};xhr.onerror=function(e){console.log('An error occurred while submitting the form. Maybe your file is too big');};xhr.onload=function(){var resp=JSON.parse(xhr.responseText);if(resp.error){uploadError.textContent=resp.response;uploadError.classList.add('show');percent.innerHTML=percentHtml;return;}var input=parentTarget.querySelector('input.image-input');input.value=resp.filePath;input.focus();input.blur(); // window.inpt = input
var nodes=(0,_iframe.IframeNode)('#page-template','[data-abe-'+input.id+']');Array.prototype.forEach.call(nodes,function(node){_EditorUtils2.default.formToHtml(node,input);});_this2.onUpload._fire(target);setTimeout(function(){percent.innerHTML=percentHtml;},1000);};percent.textContent='0%';xhr.send(formData);}}]);return EditorFiles;}();exports.default=EditorFiles;},{"../modules/EditorInputs":60,"../modules/EditorUtils":65,"../utils/iframe":69,"es6-promise":3,"on":36,"qs":39}],60:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _EditorUtils=require('../modules/EditorUtils');var _EditorUtils2=_interopRequireDefault(_EditorUtils);var _EditorJson=require('../modules/EditorJson');var _EditorJson2=_interopRequireDefault(_EditorJson);var _EditorSave=require('../modules/EditorSave');var _EditorSave2=_interopRequireDefault(_EditorSave);var _iframe=require('../utils/iframe');var _handlebars=require('handlebars');var _handlebars2=_interopRequireDefault(_handlebars);var _richTexarea=require('../utils/rich-texarea');var _richTexarea2=_interopRequireDefault(_richTexarea);var _colorPicker=require('../utils/color-picker');var _colorPicker2=_interopRequireDefault(_colorPicker);var _linkPicker=require('../utils/link-picker');var _linkPicker2=_interopRequireDefault(_linkPicker);var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);var _on=require('on');var _on2=_interopRequireDefault(_on);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EditorInputs=function(){function EditorInputs(){_classCallCheck(this,EditorInputs);this._json=_EditorJson2.default.instance;this.color=new _colorPicker2.default(document.querySelector('.wysiwyg-popup.color'));this.link=new _linkPicker2.default(document.querySelector('.wysiwyg-popup.link'));this.onBlur=(0,_on2.default)(this);this.onReload=(0,_on2.default)(this);this.onDisableInput=(0,_on2.default)(this);this._inputElements();}_createClass(EditorInputs,[{key:'rebind',value:function rebind(){var _this=this;this._reloads=[].slice.call(document.querySelectorAll('[reload=true]'));this._inputs=[].slice.call(document.querySelectorAll('input.form-abe'));this._inputs=this._inputs.concat([].slice.call(document.querySelectorAll('textarea.form-abe')));Array.prototype.forEach.call(this._reloads,function(reload){reload.removeEventListener('blur',_this._handleReloadBlur);reload.addEventListener('blur',_this._handleReloadBlur);});Array.prototype.forEach.call(this._inputs,function(input){input.removeEventListener('focus',_this._handleInputFocus);input.addEventListener('focus',_this._handleInputFocus);});this._selects=[].slice.call(document.querySelectorAll('#abeForm select'));Array.prototype.forEach.call(this._selects,function(select){select.removeEventListener('change',_this._handleChangeSelect);select.addEventListener('change',_this._handleChangeSelect);});} /**
     * Manage input element to update template page
     * @return {void}
     */},{key:'_inputElements',value:function _inputElements(){var _this2=this;this._handleReloadBlur=this._inputReloadBlur.bind(this);this._handleInputFocus=this._inputFocus.bind(this);this._handleInputBlur=this._inputBlur.bind(this);this._handleInputKeyup=this._inputKeyup.bind(this);this._handleChangeSelect=this._changeSelect.bind(this);var richs=document.querySelectorAll('.rich');if(typeof richs!=='undefined'&&richs!==null){Array.prototype.forEach.call(richs,function(rich){new _richTexarea2.default(rich,_this2.color,_this2.link);});}this.rebind();}},{key:'_hideIfEmpty',value:function _hideIfEmpty(node,value){var hide=(0,_iframe.IframeNode)('#page-template','[data-if-empty-clear="'+node.getAttribute('data-abe-')+'"]')[0];if(typeof hide!=='undefined'&&hide!==null){if(value===''){hide.style.display='none';}else {hide.style.display='';}}} /**
     * [_inputBlur description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_inputBlur',value:function _inputBlur(e){var _this3=this;e.target.removeEventListener('keyup',this._handleInputFocus);e.target.removeEventListener('blur',this._handleInputFocus);var nodes=_EditorUtils2.default.getNode(_EditorUtils2.default.getAttr(e.target));Array.prototype.forEach.call(nodes,function(node){_this3._hideIfEmpty(node,e.target.value);_EditorUtils2.default.formToHtml(node,e.target);node.classList.remove('select-border');node.classList.remove('display-attr');});this.onBlur._fire(nodes,e.target);} /**
     * [_inputKeyup description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_inputKeyup',value:function _inputKeyup(e){var _this4=this;var nodes=_EditorUtils2.default.getNode(_EditorUtils2.default.getAttr(e.target));Array.prototype.forEach.call(nodes,function(node){_this4._hideIfEmpty(node,e.target.value);_EditorUtils2.default.formToHtml(node,e.target);});} /**
     * [_inputFocus description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_inputReloadBlur',value:function _inputReloadBlur(e){if(e.currentTarget.getAttribute('data-autocomplete')!=='true'){this.onReload._fire();}} /**
     * [_inputFocus description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_inputFocus',value:function _inputFocus(e){_EditorUtils2.default.checkAttribute();_EditorUtils2.default.scrollToInputElement(e.target); // switch to set appropriate output {text|link|image|...}
// listen to user input on ABE from
e.target.addEventListener('keyup',this._handleInputKeyup);e.target.addEventListener('blur',this._handleInputBlur);} /**
     * [_changeSelect description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */},{key:'_changeSelect',value:function _changeSelect(e){var _this5=this;var target=e.currentTarget;var maxLength=parseInt(target.getAttribute('data-maxlength'));var options=[].slice.call(target.querySelectorAll('option'));var optionsChecked=target.querySelectorAll('option:checked');var count=optionsChecked.length;var attr=_EditorUtils2.default.getAttr(target);if(typeof maxLength!=='undefined'&&maxLength!==null&&maxLength!==''){if(count>maxLength){var lastValues=JSON.parse(target.getAttribute('last-values'));Array.prototype.forEach.call(optionsChecked,function(optionChecked){var unselect=true;Array.prototype.forEach.call(lastValues,function(lastValue){if(optionChecked.value.indexOf('{')>-1||optionChecked.value.indexOf('[')>-1){if(JSON.stringify(JSON.parse(optionChecked.value))==JSON.stringify(lastValue)){unselect=false;}}else {if(optionChecked.value==lastValue){unselect=false;}}});if(unselect){optionChecked.removeAttribute('selected');optionChecked.selected=false;optionChecked.disabled=true;}});}else {var lastValues='[';Array.prototype.forEach.call(optionsChecked,function(optionChecked){if(optionChecked.value!==''){if(optionChecked.value.indexOf('{')>-1||optionChecked.value.indexOf('[')>-1){lastValues+=JSON.stringify(JSON.parse(optionChecked.value));}else {lastValues+='"'+optionChecked.value+'"';}}lastValues+=',';});lastValues=lastValues.substring(0,lastValues.length-1);lastValues+=']';target.setAttribute('last-values',lastValues);}} // var blockContent = IframeNode('#page-template', '.select-' + attr.id)[0]
var nodeComments=(0,_iframe.IframeCommentNode)('#page-template',attr.id);if(typeof nodeComments!=='undefined'&&nodeComments!==null&&nodeComments.length>0){var checked=e.target.querySelectorAll('option:checked');var json=this._json.data;json[attr.id]=[];Array.prototype.forEach.call(checked,function(check){if(check.value!==''){if(check.value.indexOf('{')>-1||check.value.indexOf('[')>-1){json[attr.id].push(JSON.parse(check.value));}else {json[attr.id].push(check.value);}}});this._json.data=json;try{Array.prototype.forEach.call(nodeComments,function(nodeComment){var blockHtml=unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/,'')).replace(/\[0\]-/g,'[0]-'); // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
var template=_handlebars2.default.compile(blockHtml,{noEscape:true});var compiled=template(_this5._json.data);nodeComment.parentNode.innerHTML=compiled+('<!-- '+nodeComment.textContent+' -->');});}catch(e){console.log(e);}}else if(typeof attr.id!=='undefined'&&attr.id!==null){var nodes=_EditorUtils2.default.getNode(attr);Array.prototype.forEach.call(nodes,function(node){_EditorUtils2.default.formToHtml(node,target);});}Array.prototype.forEach.call(options,function(option){option.disabled=false;});}}]);return EditorInputs;}();exports.default=EditorInputs;},{"../modules/EditorJson":61,"../modules/EditorSave":64,"../modules/EditorUtils":65,"../utils/color-picker":67,"../utils/iframe":69,"../utils/link-picker":70,"../utils/rich-texarea":72,"handlebars":34,"on":36,"qs":39}],61:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _nanoajax=require('nanoajax');var _nanoajax2=_interopRequireDefault(_nanoajax);var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);var _es6Promise=require('es6-promise');var _on=require('on');var _on2=_interopRequireDefault(_on);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var singleton=Symbol();var singletonEnforcer=Symbol();var Json=function(){function Json(enforcer){_classCallCheck(this,Json);this._headers={};this._data=json;this._ajax=_nanoajax2.default.ajax;this.canSave=true;this.saving=(0,_on2.default)(this);this.headersSaving=(0,_on2.default)(this);if(enforcer!=singletonEnforcer)throw "Cannot construct Json singleton";}_createClass(Json,[{key:'save',value:function save(){var type=arguments.length<=0||arguments[0]===undefined?'draft':arguments[0];var _this=this;var tplPath=arguments.length<=1||arguments[1]===undefined?null:arguments[1];var filePath=arguments.length<=2||arguments[2]===undefined?null:arguments[2];this.saving._fire({type:type});var p=new _es6Promise.Promise(function(resolve,reject){if(!_this.canSave){resolve({});_this.canSave=true;return;}var jsonSave=_this.data;var abe_source=[];if(typeof json.abe_source!=='undefined'&&json.abe_source!==null){delete json.abe_source;}var toSave=_qs2.default.stringify({tplPath:tplPath?tplPath:CONFIG.TPLPATH,filePath:filePath?filePath:CONFIG.FILEPATH,json:jsonSave});_this.headersSaving._fire({url:document.location.origin+'/'+type});_this._ajax({url:document.location.origin+'/'+type,body:toSave,headers:_this._headers,method:'post'},function(code,responseText,request){var jsonRes=JSON.parse(responseText);if(typeof jsonRes.error!=='undefined'&&jsonRes.error!==null){alert(jsonRes.error);return;}if(typeof jsonRes.reject!=='undefined'&&jsonRes.reject!==null){window.location.href=window.location.origin+window.location.pathname+'?filePath='+jsonRes.reject;return;}_this.data=jsonRes.json; // jsonRes.success = 1
resolve(jsonRes);});});return p;}},{key:'data',set:function set(obj){this._data=obj;},get:function get(){return this._data;}}],[{key:'instance',get:function get(){if(!this[singleton]){this[singleton]=new Json(singletonEnforcer);window.formJson=this[singleton];}return this[singleton];}}]);return Json;}();exports.default=Json;},{"es6-promise":3,"nanoajax":35,"on":36,"qs":39}],62:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _nanoajax=require('nanoajax');var _nanoajax2=_interopRequireDefault(_nanoajax);var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);var _es6Promise=require('es6-promise');var _extend=require('extend');var _extend2=_interopRequireDefault(_extend);var _strUtils=require('../utils/str-utils');var _strUtils2=_interopRequireDefault(_strUtils);var _on=require('on');var _on2=_interopRequireDefault(_on);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EditorManager=function(){function EditorManager(){_classCallCheck(this,EditorManager);this._ajax=_nanoajax2.default.ajax;this.remove=(0,_on2.default)(this); // wrapper files
this._manager=document.querySelector('.manager-wrapper');this._managerTabs=document.querySelectorAll('[data-manager-show]');this._filesList=[].slice.call(document.querySelectorAll('.manager-files .list-group-item')); // manager config button
this._btnSaveConfig=document.querySelectorAll('[data-save-config]'); // button manager
this._btnRepublish=document.querySelector('[data-republish]');this._btnCloseManager=document.querySelector('.close-manager');this._btnManager=document.querySelector('.btn-manager');this._btnVisitSite=document.querySelectorAll('.btn-visit-site');this._btnDataFile=document.querySelector('[data-file="true"]');this._btnDeleteFile=[].slice.call(document.querySelectorAll('[data-delete="true"]'));this._btnUnpublishFile=[].slice.call(document.querySelectorAll('[data-unpublish="true"]')); // event handlers
this._handleBtnRepublishClick=this._btnRepublishClick.bind(this);this._handleBtnCloseManagerClick=this._btnCloseManagerClick.bind(this);this._handleBtnManagerTabClick=this._btnManagerTabClick.bind(this);this._handleBtnManagerClick=this._btnManagerClick.bind(this);this._handleBtnSaveConfigClick=this._btnSaveConfigClick.bind(this);this._handleBtnVisitClick=this._btnVisitClick.bind(this);this._handleBtnDeleteClick=this._btnDeleteClick.bind(this);this._handleBtnUnpublishClick=this._btnUnpublishClick.bind(this);if(typeof top.location.hash!=='undefined'&&top.location.hash!==null&&top.location.hash!==''){var currentTab=document.querySelector('[href="'+top.location.hash+'"]');if(typeof currentTab!=='undefined'&&currentTab!==null){currentTab.click(); // retrieve old selected tab
}}$('a[data-toggle="tab"]').on('shown.bs.tab',function(e){return location.hash=$(e.target).attr('href').substr(1);});this._bindEvents();}_createClass(EditorManager,[{key:'_btnDeleteClick',value:function _btnDeleteClick(e){var _this=this;e.preventDefault();var confirmDelete=confirm(e.currentTarget.getAttribute('data-text'));if(!confirmDelete)return;var href=e.currentTarget.getAttribute('href');var target=e.currentTarget;this._ajax({url:href,method:'get'},function(code,responseText,request){_this.remove._fire(target.parentNode.parentNode.parentNode);});}},{key:'_btnUnpublishClick',value:function _btnUnpublishClick(e){e.preventDefault();var confirmDelete=confirm(e.currentTarget.getAttribute('data-text'));if(!confirmDelete)return;var href=e.currentTarget.getAttribute('href');var target=e.currentTarget;this._ajax({url:href,method:'get'},function(code,responseText,request){var labels=target.parentNode.parentNode.parentNode.querySelectorAll('.label:not(.hidden)');var p=target.parentNode.parentNode.parentNode.querySelector('.label-published');Array.prototype.forEach.call(labels,function(label){label.classList.add('hidden');});var draft=target.parentNode.parentNode.parentNode.querySelector('.label-draft');if(typeof draft!=='undefined'&&draft!==null){draft.classList.remove('hidden');}if(typeof p!=='undefined'&&p!==null)p.remove();target.remove();});}},{key:'_btnVisitClick',value:function _btnVisitClick(e){var target=e.target;var dataPage=target.getAttribute('data-page');this._ajax({url:document.location.origin+target.getAttribute('data-href'),method:'get'},function(code,responseText,request){var res=JSON.parse(responseText);var routePath=typeof dataPage!=='undefined'&&dataPage!==null?dataPage:'';res.port=res.port===80?'':':'+res.port;window.open(''+res.webroot.replace(/\/$/,"")+res.port+'/'+routePath,'_blank');});}},{key:'_bindEvents',value:function _bindEvents(e){var _this2=this;Array.prototype.forEach.call(this._managerTabs,function(managerTab){managerTab.addEventListener('click',_this2._handleBtnManagerTabClick);});Array.prototype.forEach.call(this._btnSaveConfig,function(btnSaveConfig){btnSaveConfig.addEventListener('click',_this2._handleBtnSaveConfigClick);});Array.prototype.forEach.call(this._btnVisitSite,function(btnVisitSite){btnVisitSite.addEventListener('click',_this2._handleBtnVisitClick);});this._btnManager.addEventListener('click',this._handleBtnManagerClick);if(typeof this._btnRepublish!=='undefined'&&this._btnRepublish!==null){this._btnRepublish.addEventListener('click',this._handleBtnRepublishClick);}if(typeof this._btnCloseManager!=='undefined'&&this._btnCloseManager!==null){this._btnCloseManager.addEventListener('click',this._handleBtnCloseManagerClick);}Array.prototype.forEach.call(this._btnDeleteFile,function(deleteFile){deleteFile.addEventListener('click',_this2._handleBtnDeleteClick);});Array.prototype.forEach.call(this._btnUnpublishFile,function(unpublishFile){unpublishFile.addEventListener('click',_this2._handleBtnUnpublishClick);});}},{key:'_btnRepublishClick',value:function _btnRepublishClick(e){e.preventDefault();this._btnRepublish.querySelector('[data-not-clicked]').className='hidden';this._btnRepublish.querySelector('[data-clicked]').className='';this._ajax({url:document.location.origin+'/abe/republish',method:'get'},function(code,responseText,request){});}},{key:'_btnCloseManagerClick',value:function _btnCloseManagerClick(){this._manager.classList.remove('visible');}},{key:'_save',value:function _save(website,json,path){var _this3=this;var p=new _es6Promise.Promise(function(resolve,reject){var toSave=_qs2.default.stringify({website:website,json:json});_this3._ajax({url:document.location.origin+path+'?'+toSave,method:'get'},function(code,responseText,request){ // this.data = JSON.parse(responseText).json
resolve();});});return p;}},{key:'_dotStringToJson',value:function _dotStringToJson(str,value){var keys=str.split('.');var value=value;var objStrStart='';var objStrEnd='';Array.prototype.forEach.call(keys,function(key){objStrStart+='{"'+key+'":';objStrEnd+='}';});return JSON.parse(objStrStart+'"'+value+'"'+objStrEnd);}},{key:'_serializeForm',value:function _serializeForm(form){var _this4=this;var json={};var inputs=[].slice.call(form.querySelectorAll('input[type=text]'));Array.prototype.forEach.call(inputs,function(input){(0,_extend2.default)(true,json,_this4._dotStringToJson(input.getAttribute('data-json-key'),input.value));});return json;}},{key:'_btnSaveConfigClick',value:function _btnSaveConfigClick(e){e.preventDefault();var website=e.currentTarget.getAttribute('data-website');var route=e.currentTarget.getAttribute('data-route');var json=this._serializeForm(document.querySelector('form#config-'+website));this._save(website,json,route);}},{key:'_hideManagerBlock',value:function _hideManagerBlock(){Array.prototype.forEach.call(this._managerTabs,function(managerTab){var classname='.'+managerTab.getAttribute('data-manager-show');var blockElement=document.querySelector(classname);if(typeof blockElement!=='undefined'&&blockElement!==null)blockElement.classList.remove('visible');});}},{key:'_btnManagerTabClick',value:function _btnManagerTabClick(e){e.preventDefault();var classname=e.currentTarget.getAttribute('data-manager-show');this._hideManagerBlock();var blockElement=document.querySelector('.'+classname);if(typeof blockElement!=='undefined'&&blockElement!==null)blockElement.classList.add('visible');}},{key:'_btnManagerClick',value:function _btnManagerClick(e){if(this._manager.classList.contains('visible')){this._manager.classList.remove('visible');}else {this._manager.classList.add('visible');}}}]);return EditorManager;}();exports.default=EditorManager;},{"../utils/str-utils":73,"es6-promise":3,"extend":4,"nanoajax":35,"on":36,"qs":39}],63:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _nanoajax=require('nanoajax');var _nanoajax2=_interopRequireDefault(_nanoajax);var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);var _es6Promise=require('es6-promise');var _EditorJson=require('../modules/EditorJson');var _EditorJson2=_interopRequireDefault(_EditorJson);var _iframe=require('../utils/iframe');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var singleton=Symbol();var singletonEnforcer=Symbol();var Reload=function(){function Reload(enforcer){_classCallCheck(this,Reload);this._ajax=_nanoajax2.default.ajax;this._json=_EditorJson2.default.instance;if(enforcer!=singletonEnforcer)throw "Cannot construct Reload singleton";}_createClass(Reload,[{key:'_nodeScriptReplace',value:function _nodeScriptReplace(node){if(this._nodeScriptIs(node)===true){node.parentNode.replaceChild(this._nodeScriptClone(node),node);}else {var i=0;var children=node.childNodes;while(i<children.length){this._nodeScriptReplace(children[i++]);}}return node;}},{key:'_nodeScriptIs',value:function _nodeScriptIs(node){return node.tagName==='SCRIPT';}},{key:'_nodeScriptClone',value:function _nodeScriptClone(node){var script=document.createElement("script");script.text=node.innerHTML;for(var i=node.attributes.length-1;i>=0;i--){script.setAttribute(node.attributes[i].name,node.attributes[i].value);}return script;}},{key:'reload',value:function reload(){var iframe=document.querySelector('#page-template');var iframeBody=(0,_iframe.IframeDocument)('#page-template').body;var scrollTop=iframeBody.scrollTop;var json=JSON.parse(JSON.stringify(this._json.data));delete json.abe_source;var data=_qs2.default.stringify({json:json});this._ajax({url:iframe.getAttribute('data-iframe-src'),body:data,method:'post'},function(code,responseText,request){var str=responseText;var doc=iframe.contentWindow.document;str=str.replace(/<\/head>/,'<base href="/" /></head>');doc.open();doc.write(str);doc.close();setTimeout(function(){var iframeDoc=(0,_iframe.IframeDocument)('#page-template');if(typeof iframeDoc!=='undefined'&&iframeDoc!==null&&typeof iframeDoc.body!=='undefined'&&iframeDoc.body!==null){iframeDoc.body.scrollTop=scrollTop;}},1000);return;});}}],[{key:'instance',get:function get(){if(!this[singleton]){this[singleton]=new Reload(singletonEnforcer);window.formJson=this[singleton];}return this[singleton];}}]);return Reload;}();exports.default=Reload;},{"../modules/EditorJson":61,"../utils/iframe":69,"es6-promise":3,"nanoajax":35,"qs":39}],64:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _iframe=require('../utils/iframe');var _EditorUtils=require('./EditorUtils');var _EditorUtils2=_interopRequireDefault(_EditorUtils);var _EditorJson=require('../modules/EditorJson');var _EditorJson2=_interopRequireDefault(_EditorJson);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EditorSave=function(){function EditorSave(){var _this=this;_classCallCheck(this,EditorSave);this._json=_EditorJson2.default.instance;this._saveType='draft';this._abeForm=document.querySelector('#abeForm');this._abeFormSubmit=document.querySelector('#abeForm button[type=submit]');this._handleSubmitClick=this._submitClick.bind(this);this._btnSaves=document.querySelectorAll('.btn-save');Array.prototype.forEach.call(this._btnSaves,function(btnSave){btnSave.addEventListener('click',_this._handleSubmitClick);});var pageTpl=document.querySelector('#page-template');if(typeof pageTpl!=='undefined'&&pageTpl!==null){document.querySelector('#page-template').addEventListener('load',function(){_EditorUtils2.default.checkAttribute();});}if(typeof this._abeForm!=='undefined'&&this._abeForm!==null){this._formSubmit();}} /**
   * return abe form to json
   * @return {Object} json
   */_createClass(EditorSave,[{key:'serializeForm',value:function serializeForm(){var _this2=this;var inputs=[].slice.call(document.getElementById('abeForm').querySelectorAll('input'));var selects=[].slice.call(document.getElementById('abeForm').querySelectorAll('select'));inputs=inputs.concat(selects);var textareas=[].slice.call(document.getElementById('abeForm').querySelectorAll('textarea'));inputs=inputs.concat(textareas);this._json.data=json;Array.prototype.forEach.call(inputs,function(input){var dataId=input.getAttribute('data-id');if(input.type==='file')return;if(typeof dataId!=='undefined'&&dataId!==null){if(dataId.indexOf('[')>-1){var obj=dataId.split('[')[0];var index=dataId.match(/[^\[]+?(?=\])/)[0];var key=dataId.replace(/[^\.]+?-/,'');if(typeof _this2._json.data[obj]==='undefined'||_this2._json.data[obj]===null)_this2._json.data[obj]=[];if(typeof _this2._json.data[obj][index]==='undefined'||_this2._json.data[obj][index]===null)_this2._json.data[obj][index]={};_this2._json.data[obj][index][key]=input.value;}else {var value;if(input.nodeName==='SELECT'){var checked=input.querySelectorAll('option:checked');value=[];Array.prototype.forEach.call(checked,function(check){if(check.value!==''){if(check.value.indexOf('{')>-1||check.value.indexOf('[')>-1){value.push(JSON.parse(check.value));}else {value.push(check.value);}}});}else if(input.getAttribute('data-autocomplete')==='true'){var results=input.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result');value=[];Array.prototype.forEach.call(results,function(result){var val=result.getAttribute('value');if(val!==''){if(val.indexOf('{')>-1||val.indexOf('[')>-1){value.push(JSON.parse(val));}else {value.push(val);}}});}else {value=input.value.replace(/\"/g,'\&quot;')+"";}_this2._json.data[dataId]=value;}}});}},{key:'savePage',value:function savePage(type){var tplName=arguments.length<=1||arguments[1]===undefined?null:arguments[1];var filePath=arguments.length<=2||arguments[2]===undefined?null:arguments[2];var target=document.querySelector('[data-action="'+type+'"]');this.serializeForm();target.classList.add('loading');target.setAttribute('disabled','disabled');this._json.save(this._saveType).then(function(result){target.classList.add('done'); // this._populateFromJson(this._json.data)
if(result.success===1){CONFIG.TPLNAME=result.json.abe_meta.latest.abeUrl;if(CONFIG.TPLNAME[0]==='/')CONFIG.TPLNAME=CONFIG.TPLNAME.slice(1);}var tplNameParam='?tplName=';var filePathParam='&filePath=';var getParams=window.location.search.slice(1).split('&');getParams.forEach(function(getParam){var param=getParam.split('=');if(param[0]==='tplName'){tplNameParam+=param[1];}if(param[0]==='filePath'){if(param[1].indexOf('-abe-')>-1){filePathParam+=CONFIG.TPLNAME;}else {filePathParam+=param[1];}}});var ext=filePathParam.split('.');ext=ext[ext.length-1];filePathParam=filePathParam.replace(new RegExp('-abe-(.+?)(?=\.'+ext+')'),'');var reloadUrl=top.location.protocol+'//'+window.location.host+window.location.pathname+tplNameParam+filePathParam;target.classList.remove('loading');target.classList.remove('done');target.removeAttribute('disabled');if(result.success===1)window.location.href=reloadUrl;}).catch(function(e){console.error(e);});} /**
     * Listen form submit and save page template 
     * @return {void}
     */},{key:'_formSubmit',value:function _formSubmit(target){var _this3=this;this._abeForm.addEventListener('submit',function(e){e.preventDefault();_this3.savePage(_this3._saveType);});}},{key:'_submitClick',value:function _submitClick(e){this._saveType=e.currentTarget.getAttribute('data-action');if(this._saveType!=='draft'&&this._saveType!=='reject'){this._abeFormRequired();}else {this._abeFormSubmit.click();}}},{key:'_abeFormRequired',value:function _abeFormRequired(){var formGroups=[].slice.call(document.getElementById('abeForm').querySelectorAll('.form-group'));var valid=true;Array.prototype.forEach.call(formGroups,function(formGroup){var input=formGroup.querySelector('[data-required=true]');if(typeof input!=='undefined'&&input!==null){var required=input.getAttribute('data-required');var autocomplete=input.getAttribute('data-autocomplete');if(typeof autocomplete!=='undefined'&&autocomplete!==null&&(autocomplete==='true'||autocomplete===true)){var countValue=input.parentNode.querySelectorAll('.autocomplete-result');if(countValue.length<=0){formGroup.classList.add('has-error');valid=false;}else {formGroup.classList.remove('has-error');}}else if(typeof required!=='undefined'&&required!==null&&(required==='true'||required===true)){if(input.value===''){formGroup.classList.add('has-error');valid=false;}else {formGroup.classList.remove('has-error');}}}});if(valid){this._abeFormSubmit.click();}else {alert('Required fields are missing');}} /**
     * populate all form and iframe html with json
     * @param  {Object} json object with all values
     * @return {null}
     */},{key:'_populateFromJson',value:function _populateFromJson(json){this._json.data=json;var forms=document.querySelectorAll('.form-abe');Array.prototype.forEach.call(forms,function(form){var id=form.getAttribute('data-id');if(typeof id!='undefined'&&id!==null&&typeof json[id]!='undefined'&&json[id]!==null){var value=json[id];if((typeof value==='undefined'?'undefined':_typeof(value))==='object'&&Object.prototype.toString.call(value)==='[object Array]'){value=JSON.stringify(value);}else if((typeof value==='undefined'?'undefined':_typeof(value))==='object'&&Object.prototype.toString.call(value)==='[object Object]'){value=JSON.stringify(value);}form.value=value;var dataIdLink=form.getAttribute('data-id-link');var node=(0,_iframe.IframeNode)('#page-template','[data-abe-'+id.replace(/\[([0-9]*)\]/g,'$1')+']')[0];_EditorUtils2.default.formToHtml(node,form);}});}}]);return EditorSave;}();exports.default=EditorSave;},{"../modules/EditorJson":61,"../utils/iframe":69,"./EditorUtils":65}],65:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _iframe=require('../utils/iframe');var _handlebars=require('handlebars');var _handlebars2=_interopRequireDefault(_handlebars);var _math=require('../../../../cli/handlebars/utils/math');var _math2=_interopRequireDefault(_math);var _translateFront=require('../../../../cli/handlebars/utils/translate-front');var _translateFront2=_interopRequireDefault(_translateFront);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}_handlebars2.default.registerHelper('math',_math2.default); // HandlebarsJS unique text helper
_handlebars2.default.registerHelper('i18nAbe',_translateFront2.default); // HandlebarsJS unique text helper
var EditorUtils=function(){function EditorUtils(){_classCallCheck(this,EditorUtils);}_createClass(EditorUtils,null,[{key:'checkAttribute',value:function checkAttribute(){var formAbes=document.querySelectorAll('.form-abe');Array.prototype.forEach.call(formAbes,function(formAbe){var hide=(0,_iframe.IframeNode)('#page-template','[data-if-empty-clear="'+formAbe.getAttribute('data-id')+'"]')[0];if(typeof hide!=='undefined'&&hide!==null){if(formAbe.value===''){hide.style.display='none';}else {hide.style.display='';}}});}},{key:'scrollToInputElement',value:function scrollToInputElement(target){var visible=target.getAttribute('data-visible');if(visible==='false'||visible===false){return;}var dataLink=target.getAttribute('data-id-link');var id=target.getAttribute('data-id');var nodes=(0,_iframe.IframeNode)('#page-template','[data-abe-'+id+']');if(typeof nodes==='undefined'||nodes===null||nodes.length===0){var nodesComment=[].slice.call((0,_iframe.IframeCommentNode)('#page-template',id.split('[')[0]));if(typeof nodesComment!=='undefined'&&nodesComment!==null&&typeof nodesComment.textContent!=='undefined'&&nodesComment.textContent!==null){var blockHtml=unescape(nodesComment.textContent.replace(/\[\[([\S\s]*?)\]\]/,''));var newBlock=document.createElement('abe');newBlock.innerHTML=blockHtml;var childs=[].slice.call(newBlock.childNodes);Array.prototype.forEach.call(childs,function(child){nodesComment.parentNode.insertBefore(child,nodesComment);});}else if(typeof nodesComment!=='undefined'&&nodesComment!==null){Array.prototype.forEach.call(nodesComment,function(nodeComment){if(typeof nodeComment.parentNode.offsetParent!=='undefined'&&nodeComment.parentNode.offsetParent!==null){var bounds=nodeComment.parentNode.getBoundingClientRect();var w=document.getElementById('page-template').contentWindow;w.scroll(0,w.scrollY+bounds.top+bounds.height*0.5-window.innerHeight*0.5);}});}nodes=(0,_iframe.IframeNode)('#page-template','[data-abe-'+id+']');}Array.prototype.forEach.call(nodes,function(node){node.classList.add('select-border');}); // scroll to DOM node
if(typeof nodes[0]!=='undefined'&&nodes[0]!==null){var bounds=nodes[0].getBoundingClientRect();var w=document.getElementById('page-template').contentWindow;w.scroll(0,w.scrollY+bounds.top+bounds.height*0.5-window.innerHeight*0.5);}}},{key:'getAttr',value:function getAttr(target){var dataLink=target.getAttribute('data-id-link');var id=target.getAttribute('data-id');return {abe:'data-abe-'+id.replace(/\[([0-9]*)\]/g,'$1'),id:id};}},{key:'getNode',value:function getNode(attr){var nodes=(0,_iframe.IframeNode)('#page-template','['+attr.abe+']');if(typeof nodes==='undefined'||nodes===null){var blockContent=(0,_iframe.IframeNode)('#page-template','.insert-'+attr.id.split('[')[0])[0];var blockHtml=unescape(blockContent.innerHTML).replace(/\[0\]\./g,attr.id.split('[')[0]+'[0]-');blockContent.insertBefore(blockHtml,blockContent);nodes=(0,_iframe.IframeNode)('#page-template','['+attr.abe+'="'+attr.id+'"]');}Array.prototype.forEach.call(nodes,function(node){node.classList.add('select-border');});return nodes;} /**
     * get input value and set to iframe html
     * @param  {Object} node  html node
     * @param  {Object} input input elem
     * @return {null}
     */},{key:'formToHtml',value:function formToHtml(node,input){var val=input.value;var id=input.id;var placeholder=input.getAttribute('placeholder');if(typeof placeholder==='undefined'||placeholder==='undefined'||placeholder===null){placeholder="";}if(val.replace(/^\s+|\s+$/g,'').length<1){val=placeholder;}switch(input.nodeName.toLowerCase()){case 'input':var dataAbeAttr=node.getAttribute('data-abe-attr-'+id.replace(/\[([0-9]*)\]/g,'$1'));if(typeof dataAbeAttr!=='undefined'&&dataAbeAttr!==null){node.setAttribute(dataAbeAttr,val);}else {node.innerHTML=val;}break;case 'textarea':node.innerHTML=input.classList.contains('form-rich')?input.parentNode.querySelector('[contenteditable]').innerHTML:val;break;case 'select':var key=node.getAttribute('data-abe-'+id);var dataAbeAttr=node.getAttribute('data-abe-attr-'+id.replace(/\[([0-9]*)\]/g,'$1'));var dataAbeAttrEscaped=unescape(node.getAttribute('data-abe-attr-escaped'));var option=input.querySelector('option:checked');if(typeof option!=='undefined'&&option!==null){val=option.value;if(typeof dataAbeAttr!=='undefined'&&dataAbeAttr!==null){try{var template=_handlebars2.default.compile(dataAbeAttrEscaped,{noEscape:true});var json={};json[key]=val;var compiled=template(json);node.setAttribute(dataAbeAttr,compiled);}catch(e){console.log(e);}}else {node.innerHTML=val;}}break;}}}]);return EditorUtils;}();exports.default=EditorUtils;},{"../../../../cli/handlebars/utils/math":54,"../../../../cli/handlebars/utils/translate-front":55,"../utils/iframe":69,"handlebars":34}],66:[function(require,module,exports){'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _Devtool=require('./devtool/Devtool');var _EditorInputs=require('./modules/EditorInputs');var _EditorInputs2=_interopRequireDefault(_EditorInputs);var _EditorBlock=require('./modules/EditorBlock');var _EditorBlock2=_interopRequireDefault(_EditorBlock);var _EditorUtils=require('./modules/EditorUtils');var _EditorUtils2=_interopRequireDefault(_EditorUtils);var _EditorFiles=require('./modules/EditorFiles');var _EditorFiles2=_interopRequireDefault(_EditorFiles);var _EditorSave=require('./modules/EditorSave');var _EditorSave2=_interopRequireDefault(_EditorSave);var _EditorJson=require('./modules/EditorJson');var _EditorJson2=_interopRequireDefault(_EditorJson);var _EditorManager=require('./modules/EditorManager');var _EditorManager2=_interopRequireDefault(_EditorManager);var _EditorAutocomplete=require('./modules/EditorAutocomplete');var _EditorAutocomplete2=_interopRequireDefault(_EditorAutocomplete);var _EditorReload=require('./modules/EditorReload');var _EditorReload2=_interopRequireDefault(_EditorReload);var _qs=require('qs');var _qs2=_interopRequireDefault(_qs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var htmlTag=document.querySelector('html');window.CONFIG=JSON.parse(htmlTag.getAttribute('data-config'));window.json=JSON.parse(unescape(htmlTag.getAttribute('data-json').replace(/&quot;/g,'\"')));window.Locales=JSON.parse(htmlTag.getAttribute('data-locales'));var Engine=function(){function Engine(){var _this=this;_classCallCheck(this,Engine);this._blocks=new _EditorBlock2.default();this._inputs=new _EditorInputs2.default();this._files=new _EditorFiles2.default();this._save=new _EditorSave2.default();this._manager=new _EditorManager2.default();this._autocomplete=new _EditorAutocomplete2.default();this._dev=new _Devtool.Devtool();this.json=_EditorJson2.default.instance;this._bindEvents();this.table=null;$(document).ready(function(){_this.table=$('#navigation-list').DataTable({"pageLength":50,"autoWidth":false});});}_createClass(Engine,[{key:'loadIframe',value:function loadIframe(){_EditorReload2.default.instance.reload();}},{key:'_bindEvents',value:function _bindEvents(){var _this2=this;this._blocks.onNewBlock(function(){_this2._files.rebind();_this2._inputs.rebind();});this._manager.remove(function(el){_this2.table.row($(el)).remove().draw();});this._inputs.onReload(function(){_this2._save.serializeForm();_EditorReload2.default.instance.reload();});this._autocomplete.onReload(function(){_EditorReload2.default.instance.reload();});this._inputs.onBlur(function(){_this2._save.serializeForm();});this._blocks.onRemoveBlock(function(){_this2._inputs.rebind();_this2._save.serializeForm(); ///**************************************** HOOLA
});}}]);return Engine;}();var engine=new Engine();window.abe={json:engine.json,inputs:engine._inputs,files:engine._files,blocks:engine._blocks,autocomplete:engine._autocomplete,editorReload:_EditorReload2.default};document.addEventListener("DOMContentLoaded",function(event){if(document.querySelector('#page-template'))engine.loadIframe();});},{"./devtool/Devtool":56,"./modules/EditorAutocomplete":57,"./modules/EditorBlock":58,"./modules/EditorFiles":59,"./modules/EditorInputs":60,"./modules/EditorJson":61,"./modules/EditorManager":62,"./modules/EditorReload":63,"./modules/EditorSave":64,"./modules/EditorUtils":65,"qs":39}],67:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _on=require('on');var _on2=_interopRequireDefault(_on);var _popup=require('./popup');var _popup2=_interopRequireDefault(_popup);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var ColorPicker=function(){function ColorPicker(wrapper){_classCallCheck(this,ColorPicker);this.popup=new _popup2.default(wrapper);this.wrapper=wrapper;this.colors=[['ffdfdf','ffe7df','ffefdf','fff7df','ffffdf','f7ffdf','efffdf','e7ffdf','dfffdf','dfffe7','dfffef','dffff7','dfffff','dff7ff','dfefff','dfe7ff','dfdfff','e7dfff','efdfff','f7dfff','ffdfff','ffdff7','ffdfef','ffdfe7','ffffff'],['ffbfbf','ffcfbf','ffdfbf','ffefbf','ffffbf','efffbf','dfffbf','cfffbf','bfffbf','bfffcf','bfffdf','bfffef','bfffff','bfefff','bfdfff','bfcfff','bfbfff','cfbfff','dfbfff','efbfff','ffbfff','ffbfef','ffbfdf','ffbfcf','ebebeb'],['ff9f9f','ffb79f','ffcf9f','ffe79f','ffff9f','e7ff9f','cfff9f','b7ff9f','9fff9f','9fffb7','9fffcf','9fffe7','9fffff','9fe7ff','9fcfff','9fb7ff','9f9fff','b79fff','cf9fff','e79fff','ff9fff','ff9fe7','ff9fcf','ff9fb7','d7d7d7'],['ff7f7f','ff9f7f','ffbf7f','ffdf7f','ffff7f','dfff7f','bfff7f','9fff7f','7fff7f','7fff9f','7fffbf','7fffdf','7fffff','7fdfff','7fbfff','7f9fff','7f7fff','9f7fff','bf7fff','df7fff','ff7fff','ff7fdf','ff7fbf','ff7f9f','c4c4c4'],['ff5f5f','ff875f','ffaf5f','ffd75f','ffff5f','d7ff5f','afff5f','87ff5f','5fff5f','5fff87','5fffaf','5fffd7','5fffff','5fd7ff','5fafff','5f87ff','5f5fff','875fff','af5fff','d75fff','ff5fff','ff5fd7','ff5faf','ff5f87','b0b0b0'],['ff3f3f','ff6f3f','ff9f3f','ffcf3f','ffff3f','cfff3f','9fff3f','6fff3f','3fff3f','3fff6f','3fff9f','3fffcf','3fffff','3fcfff','3f9fff','3f6fff','3f3fff','6f3fff','9f3fff','cf3fff','ff3fff','ff3fcf','ff3f9f','ff3f6f','9c9c9c'],['ff1f1f','ff571f','ff8f1f','ffc71f','ffff1f','c7ff1f','8fff1f','57ff1f','1fff1f','1fff57','1fff8f','1fffc7','1fffff','1fc7ff','1f8fff','1f57ff','1f1fff','571fff','8f1fff','c71fff','ff1fff','ff1fc7','ff1f8f','ff1f57','898989'],['ff0000','ff3f00','ff7f00','ffbf00','ffff00','bfff00','7fff00','3fff00','00ff00','00ff3f','00ff7f','00ffbf','00ffff','00bfff','007fff','003fff','0000ff','3f00ff','7f00ff','bf00ff','ff00ff','ff00bf','ff007f','ff003f','757575'],['df0000','df3700','df6f00','dfa700','dfdf00','a7df00','6fdf00','37df00','00df00','00df37','00df6f','00dfa7','00dfdf','00a7df','006fdf','0037df','0000df','3700df','6f00df','a700df','df00df','df00a7','df006f','df0037','626262'],['bf0000','bf2f00','bf5f00','bf8f00','bfbf00','8fbf00','5fbf00','2fbf00','00bf00','00bf2f','00bf5f','00bf8f','00bfbf','008fbf','005fbf','002fbf','0000bf','2f00bf','5f00bf','8f00bf','bf00bf','bf008f','bf005f','bf002f','4e4e4e'],['9f0000','9f2700','9f4f00','9f7700','9f9f00','779f00','4f9f00','279f00','009f00','009f27','009f4f','009f77','009f9f','00779f','004f9f','00279f','00009f','27009f','4f009f','77009f','9f009f','9f0077','9f004f','9f0027','3a3a3a'],['7f0000','7f1f00','7f3f00','7f5f00','7f7f00','5f7f00','3f7f00','1f7f00','007f00','007f1f','007f3f','007f5f','007f7f','005f7f','003f7f','001f7f','00007f','1f007f','3f007f','5f007f','7f007f','7f005f','7f003f','7f001f','272727'],['5f0000','5f1700','5f2f00','5f4700','5f5f00','475f00','2f5f00','175f00','005f00','005f17','005f2f','005f47','005f5f','00475f','002f5f','00175f','00005f','17005f','2f005f','47005f','5f005f','5f0047','5f002f','5f0017','131313'],['3f0000','3f0f00','3f1f00','3f2f00','3f3f00','2f3f00','1f3f00','0f3f00','003f00','003f0f','003f1f','003f2f','003f3f','002f3f','001f3f','000f3f','00003f','0f003f','1f003f','2f003f','3f003f','3f002f','3f001f','3f000f','000000']];var colorHTML='<table cellpadding="0" cellspacing="0">\n                      <tbody>';this.colors.forEach(function(color){colorHTML+='<tr>';color.forEach(function(color){colorHTML+='<td class="wysiwyg-toolbar-color" title="#'+color+'" style="background-color:#'+color+';"></td>';});colorHTML+='</tr>';});colorHTML+='</tbody>\n                    </table>';this.wrapper.innerHTML=colorHTML;this.bindEvt();}_createClass(ColorPicker,[{key:'bindEvt',value:function bindEvt(){var _this=this;this.onColor=(0,_on2.default)(this);this.wrapper.addEventListener('click',function(e){var target=e.target;if(target.classList.contains('wysiwyg-toolbar-color')){_this.onColor._fire(target.getAttribute('title'));_this.popup.close();}});}},{key:'show',value:function show(el){var elBounds=el.getBoundingClientRect();this.popup.open(elBounds.left,elBounds.top+elBounds.height+5);}}]);return ColorPicker;}();exports.default=ColorPicker;},{"./popup":71,"on":36}],68:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.nextSibling=nextSibling;exports.getClosest=getClosest;function nextSibling(parent,ele){var next;var found=false;Array.prototype.forEach.call(parent.childNodes,function(node){if(node.nodeName.indexOf('text')===-1){if(found){next=node;found=false;}if(node===ele){found=true;}}});return next;} /**
 * Get closest DOM element up the tree that contains a class, ID, or data attribute
 * @param  {Node} elem The base element
 * @param  {String} selector The class, id, data attribute, or tag to look for
 * @return {Node} Null if no match
 */function getClosest(elem,selector){var firstChar=selector.charAt(0); // Get closest match
for(;elem&&elem!==document;elem=elem.parentNode){ // If selector is a class
if(firstChar==='.'){if(elem.classList.contains(selector.substr(1))){return elem;}} // If selector is an ID
if(firstChar==='#'){if(elem.id===selector.substr(1)){return elem;}} // If selector is a data attribute
if(firstChar==='['){if(elem.hasAttribute(selector.substr(1,selector.length-2))){return elem;}} // If selector is a tag
if(elem.tagName.toLowerCase()===selector){return elem;}}return false;};},{}],69:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.IframeDocument=IframeDocument;exports.IframeNode=IframeNode;exports.IframeCommentNode=IframeCommentNode;function IframeDocument(frameId){var iframe=document.querySelector(frameId);var iframeDocument=iframe.contentDocument||iframe.contentWindow.document;return iframeDocument;}function IframeNode(frameId,selector){return IframeDocument(frameId).querySelectorAll(selector.replace(/\[([0-9]*)\]/g,'$1'));}function IframeGetComment(frameId,prop,val,meth,nd,useSelf){var prop="nodeType";var val=8;var meth=null;var r=[],any=IframeGetComment[val]===true;nd=nd||IframeDocument(frameId).documentElement;if(nd.constructor===Array){nd={childNodes:nd};}for(var cn=nd.childNodes,i=0,mx=cn.length;i<mx;i++){var it=cn[i];if(it.childNodes.length&&!useSelf){r=r.concat(IframeGetComment(frameId,prop,val,meth,it,useSelf));}if(any?it[prop]:it[prop]!==undefined&&(meth?""[meth]&&String(it[prop])[meth](val):it[prop]==val)){r[r.length]=it;}}return r;}function IframeCommentNode(frameId,key){var nodes=IframeGetComment(frameId,"nodeType",8,null,null);var found=[];Array.prototype.forEach.call(nodes,function(node){if(node.textContent.indexOf(key)>-1){found.push(node);}});return found;}},{}],70:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _on=require('on');var _on2=_interopRequireDefault(_on);var _popup=require('./popup');var _popup2=_interopRequireDefault(_popup);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var LinkPicker=function(){function LinkPicker(wrapper){_classCallCheck(this,LinkPicker);this.popup=new _popup2.default(wrapper);this.wrapper=wrapper;this.link='';this.linkNode=document.createElement('input');this.linkNode.type='text';this.linkNode.value='';this.linkNode.placeholder='http://example.com';this.checkboxes=document.createElement('div');this.checkboxes.classList.add('coche');this.checkboxes.classList.add('keep-popup');this.noFollowLabel=document.createElement('label');this.noFollowLabel.textContent='no-follow';this.noFollowLabel.classList.add('keep-popup');this.noFollow=document.createElement('input');this.noFollow.type="checkbox";this.noFollow.name="no-follow-"+parseInt(Math.random()*100);this.noFollow.classList.add('keep-popup');this.targetLabel=document.createElement('label');this.targetLabel.textContent='target blank';this.targetLabel.classList.add('keep-popup');this.target=document.createElement('input');this.target.type="checkbox";this.target.name="target-"+parseInt(Math.random()*100);this.target.classList.add('keep-popup');this.noFollowLabel.appendChild(this.noFollow);this.targetLabel.appendChild(this.target);this.checkboxes.appendChild(this.noFollowLabel);this.checkboxes.appendChild(this.targetLabel);this.btn=document.createElement('button');this.btn.className='btn btn-primary';this.btn.textContent='Add';this.wrapper.innerHTML='';this.wrapper.appendChild(this.linkNode);this.wrapper.appendChild(this.btn);this.wrapper.appendChild(this.checkboxes);this.onLink=(0,_on2.default)(this);}_createClass(LinkPicker,[{key:'bindEvt',value:function bindEvt(){var _this=this;var sendEvent=function sendEvent(res){_this.wrapper.removeEventListener('mousedown',clickWrapper);document.body.removeEventListener('mousedown',cancel);_this.wrapper.querySelector('input').value='';_this.noFollow.checked=false;_this.target.checked=false;_this.onLink._fire(res);_this.popup.close();};var cancel=function cancel(e){var target=e.target;if(!target.classList.contains('abe-popup')&&!target.parentNode.classList.contains('keep-popup')&&!target.parentNode.classList.contains('abe-popup')){sendEvent(null);}};var clickWrapper=function clickWrapper(e){var link=_this.wrapper.querySelector('input').value;if(e.target.classList.contains('btn')){sendEvent({link:link,target:_this.target.checked,noFollow:_this.noFollow.checked});}};this.wrapper.addEventListener('mousedown',clickWrapper);document.body.addEventListener('mousedown',cancel);}},{key:'show',value:function show(el){var elBounds=el.getBoundingClientRect();this.popup.open(elBounds.left,elBounds.top+elBounds.height+5);this.bindEvt();}}]);return LinkPicker;}();exports.default=LinkPicker;},{"./popup":71,"on":36}],71:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Popup=function(){function Popup(wrapper){_classCallCheck(this,Popup);this.wrapper=wrapper;this.wrapper.classList.add('abe-popup');}_createClass(Popup,[{key:'open',value:function open(){var x=arguments.length<=0||arguments[0]===undefined?0:arguments[0];var y=arguments.length<=1||arguments[1]===undefined?0:arguments[1];this.wrapper.style.left=x+'px';this.wrapper.style.top=y+'px';if(!this.wrapper.classList.contains('on'))this.wrapper.classList.add('on');}},{key:'close',value:function close(){if(this.wrapper.classList.contains('on'))this.wrapper.classList.remove('on');}}]);return Popup;}();exports.default=Popup;},{}],72:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var RichTexarea=function(){function RichTexarea(wrapper,color,link){var _this=this;_classCallCheck(this,RichTexarea);this.color=color;this.link=link;this.wrapper=wrapper;this.textarea=wrapper.querySelector('.form-rich');this.btns=this.wrapper.querySelectorAll('.wysiwyg-toolbar-icon');this.textEditor=wysiwyg({element:this.textarea,onKeyDown:function onKeyDown(key,character,shiftKey,altKey,ctrlKey,metaKey){},onKeyPress:function onKeyPress(key,character,shiftKey,altKey,ctrlKey,metaKey){},onKeyUp:function onKeyUp(key,character,shiftKey,altKey,ctrlKey,metaKey){_this.setHTML();},onSelection:function onSelection(collapsed,rect,nodes,rightclick){},onPlaceholder:function onPlaceholder(visible){},onOpenpopup:function onOpenpopup(){},onClosepopup:function onClosepopup(){},hijackContextmenu:false});this._action=this.action.bind(this);Array.prototype.forEach.call(this.btns,function(btn){btn.addEventListener('click',_this._action);});}_createClass(RichTexarea,[{key:'setHTML',value:function setHTML(){this.textarea.innerHTML=this.textEditor.getHTML();var evt=document.createEvent("KeyboardEvent");evt.initKeyboardEvent("keyup",true,true,window,0,0,0,0,0,"e".charCodeAt(0));var canceled=!this.textarea.dispatchEvent(evt);}},{key:'_replaceSelectionWithHtml',value:function _replaceSelectionWithHtml(html){var range,html;if(window.getSelection&&window.getSelection().getRangeAt){range=window.getSelection().getRangeAt(0);range.deleteContents();var div=document.createElement("div");div.innerHTML=html;var frag=document.createDocumentFragment(),child;while(child=div.firstChild){frag.appendChild(child);}range.insertNode(frag);}else if(document.selection&&document.selection.createRange){range=document.selection.createRange();html=node.nodeType==3?node.data:node.outerHTML;range.pasteHTML(html);}}},{key:'action',value:function action(e){var _this2=this;this.el=e.target;if(this.el.tagName.toLowerCase()==='span')this.el=this.el.parentNode;this.action=this.el.getAttribute('data-action');this.popup=this.el.getAttribute('data-popup');this.param=this.el.getAttribute('data-param');if(typeof this.popup!=='undefined'&&this.popup!==null){switch(this.popup){case 'color':var off=this.color.onColor(function(color){if(color!==null){_this2.textEditor[_this2.action](color);_this2.setHTML();}off();});this.color.show(this.el);break;case 'link':var html=this.textEditor.getHTML();this._replaceSelectionWithHtml('<a href="[LINK]" target="[TARGET]" rel="[REL]">'+window.getSelection().toString()+'</a>');var off=this.link.onLink(function(obj){if(obj.link!==null){var html=_this2.textEditor.getHTML().replace('[LINK]',obj.link);if(obj.target)html=html.replace(/\[TARGET\]/,'_blank');else html=html.replace(/target=\"\[TARGET\]\"/,'');if(obj.noFollow)html=html.replace(/\[REL\]/,'nofollow');else html=html.replace(/rel=\"\[REL\]\"/,'');_this2.textEditor.setHTML(html);}else _this2.textEditor.setHTML(html);_this2.setHTML();off();});this.link.show(this.el);break;}}else if(this.action==='code'){this._replaceSelectionWithHtml('<pre><code>'+window.getSelection().toString()+'</code></pre>');this.textEditor.setHTML(this.textEditor.getHTML());this.setHTML();}else {this.textEditor[this.action](this.param);this.setHTML();}}}]);return RichTexarea;}();exports.default=RichTexarea;},{}],73:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var StrUtils=function(){function StrUtils(){_classCallCheck(this,StrUtils);}_createClass(StrUtils,null,[{key:"escapeRegExp",value:function escapeRegExp(str){var specials=[ // order matters for these
"-","[","]" // order doesn't matter for any of these
,"/","{","}","(",")","*","+","?",".","\\","^","$","|"] // I choose to escape every character with '\'
// even though only some strictly require it when inside of []
,regex=RegExp('['+specials.join('\\')+']','g');return str.replace(regex,"\\$&");}}]);return StrUtils;}();exports.default=StrUtils;},{}]},{},[66]);