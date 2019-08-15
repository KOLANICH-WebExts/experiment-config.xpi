"use strict";

//allows a web page to have access to the object passed
function allowPageAccess(obj){
	let unwraping=window.Object();
	unwraping.wrappedJSObject.obj=cloneInto(obj, window, {cloneFunctions: false});
	return unwraping.wrappedJSObject.obj;
}

//transforms a privileged promise inta an unprivileged one available to Web page
function unwrapPromise(srcPr){
	return new window.Promise(function(resolve, reject){
		return srcPr.then((res)=>{
			resolve(allowPageAccess(res));
		}, (res)=>{
			reject(allowPageAccess(res));
		});
	});
}
