"use strict";

function  * removeCommentsIter(text) {
	let currentStr = [],
	inMultiLineComment = !1,
	inSingleLineComment = !1,
	metSlash = !1,
	metAsterisk = !1,
	inString = null;
	for (let c of text) {
		switch (c) {
			case "/":
				inMultiLineComment ?
					metAsterisk && (inMultiLineComment = !1, currentStr.pop())
				:
					metSlash ?
						inSingleLineComment = !0
						:
						currentStr.push(c);
				metSlash = !0;
				metAsterisk = !1;
			break;
			case "*":
				metAsterisk = !0;
				inMultiLineComment || inString || (metSlash ? (currentStr.pop(), currentStr.length && (yield currentStr.join("")), currentStr = [], inMultiLineComment = !0) : currentStr.push(c));
				metSlash = !1;
			break;
			case "\n":
				metSlash = metAsterisk = !1;
				inMultiLineComment || inSingleLineComment || (currentStr.push(c), currentStr.length && (yield currentStr.join(""), currentStr = []));
				inSingleLineComment = !1;
			break;
			case "`":
			case "'":
			case '"':
				inMultiLineComment || inSingleLineComment || (inString ? inString == c && (inString = null) : inString = c);
			default:
				metSlash = metAsterisk = !1,
				inMultiLineComment || inSingleLineComment || currentStr.push(c);
		}
	}
	inMultiLineComment || inSingleLineComment || !currentStr.length || (yield currentStr.join(""));
}

function parseUserJSNative(c) {
	return browser.experiments.parse.parse(c).then(a => {
		console.log(a);
		let b = new Map;
		for (let e of a.res.body)
			if ("ExpressionStatement" == e.type && (a = e.expression, "CallExpression" == a.type)) {
				var d = a.callee;
				if ("Identifier" != d.type || "user_pref" == d.name) {
					d = [];
					for (let f of a.arguments) {
						"Literal" == f.type && d.push(f.value);
					}
					2 == d.length && b.set(...d);
				}
			}
		return b
	})
};

function removeComments(c) {
	return [...removeCommentsIter(c)].join("\n")
};

const userjsLineRx = /(user_pref)\(("(?:[^"]|\\")+"), (\d+|true|false|"(?:[^"]|\\")*")\);/g;
function parseUserJSSurrogatte(c) {
	let a = new Map;
	for (let[, , prefName, prefValue]of c.matchAll(userjsLineRx)) {
		prefName = JSON.parse(prefName);
		prefValue = JSON.parse(prefValue);
		console.log("prefName", prefName);
		console.log("prefValue", prefValue);
		a.set(prefName, prefValue);
	}
	return a
};
