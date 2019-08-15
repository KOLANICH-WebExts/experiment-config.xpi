"use strict";

browser.experiments.config.getChildList().then(list => {
	for(let name of list){
		browser.experiments.config.prefIsLocked(name).then((isLocked) => {
			//console.log(name, isLocked);
			if(isLocked){
				console.log("Unlocking ", name);
				browser.experiments.config.prefUnlock(name);
			}
		});
	}
});
