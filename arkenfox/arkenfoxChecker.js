"use strict";

const manifest = browser.runtime.getManifest();

function getArkenfoxUserJSSource(){
	return fetch("https://raw.githubusercontent.com/arkenfox/user.js/master/user.js", {"headers": {"Origin": null}, "referrer": "no-referrer"});
}

function parseArkenfoxUserJS(){
	return getArkenfoxUserJSSource().then(e=>e.text()).then(async t => {
		//console.log("t", t);
		let res;
		try{
			res = await parseUserJSNative(t);
		} catch {
			res = parseUserJSSurrogatte(removeComments(t));
		};
		res.delete("_user.js.parrot");
		return res;
	})
}

function findIssues(){
	return parseArkenfoxUserJS().then(ghacks => {
		let issues = new Map();
		let promises = [];
		for(let [k, desired] of ghacks){
			try{
				promises.push(browser.experiments.config.prefGet(k).then(actual => {
					console.log(actual, desired);
					if(actual != desired){
						issues.set(k, {"desired":desired, "actual":actual});
					}
				}));
			}catch(ex){
			}
		}
		
		return Promise.all(promises).then(e=>issues);
	});
}
