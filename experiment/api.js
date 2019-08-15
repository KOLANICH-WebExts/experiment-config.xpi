"use strict";

//Components.utils.import("resource://gre/modules/reflect.jsm");

let prefServ = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);

let typeSelectorPref = new Map([
	[prefServ.PREF_BOOL, {"get": prefServ.getBoolPref, "set": prefServ.setBoolPref}],
	[prefServ.PREF_INT, {"get": prefServ.getIntPref, "set": prefServ.setIntPref}],
	[prefServ.PREF_STRING, {"get": prefServ.getStringPref, "set": prefServ.setStringPref}],
]);
let typeSelectorValue = new Map([
	["string", prefServ.PREF_STRING],
	["boolean", prefServ.PREF_BOOL],
	["number", prefServ.PREF_INT],
]);

class ConfigAPI extends ExtensionAPI  {
	getAPI(context) {
		return {
			experiments: {
				config: {
					async prefGet(name) { // you must double default args in signature
						return new Promise((resolve, reject) => {
							try {
								let t = prefServ.getPrefType(name);
								let tFuncs = typeSelectorPref.get(t);
								if (tFuncs) {
									let res = tFuncs["get"](name);
									resolve(res);
								} else {
									resolve(null);
								}
							} catch (ex) {
								reject({
									"error": ex.message
								});
							}
						});
					},
					async prefSet(name, value) { // you must double default args in signature
						return new Promise((resolve, reject) => {
							try {
								let valueT = typeSelectorValue.get(typeof value);
								let tFuncs = typeSelectorPref.get(valueT);
								//let t = prefServ.getPrefType(name);

								if (tFuncs) {
									let res = tFuncs["set"](name, value);
									resolve(res);
								} else {
									resolve(null);
								}
							} catch (ex) {
								reject({
									"error": ex.message
								});
							}
						});
					},
					async prefReset(name) {
						prefServ.clearUserPref(name);
					},
					async prefLock(name) {
						prefServ.lockPref(name);
					},
					async prefUnlock(name) {
						prefServ.unlockPref(name);
					},
					async prefIsLocked(name) {
						return prefServ.prefIsLocked(name);
					},
					async prefHasUserValue(name) {
						return prefServ.prefHasUserValue(name);
					},
					async getChildList(name) {
						return prefServ.getChildList(name);
					},
					onChange: new ExtensionCommon.EventManager({
						context,
						name: "experiments.config.onChange",
						register: (cb, branch = "") => {
							console.log("register called", cb, branch);
							let observer = {
								async observe(branch, topic, refPath) {
									console.log("observe called", branch, topic, refPath);
									let res = await cb.async(topic, refPath);
								}
							};
							console.log("observer created", observer);
							prefServ.addObserver(branch, observer, false);
							console.log("observer registered");
							return () => {
								prefServ.removeObserver(branch, observer);
								console.log("observer removed");
							};
						}
					}).api(),
				},
			},
		};
	}
};

var config; // identifier from the manifest (key in experiment_apis). __FORMERLY__ COULD BE ANY matching the key in experiment_apis within the manifest. NOW it MUST match API name !!!
config = ConfigAPI; //let, const, class, export or without var don't work.
