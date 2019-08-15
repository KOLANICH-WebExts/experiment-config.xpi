"use strict";

let issuesCount = 0;
function updateBadge(){
	if(issuesCount){
		browser.browserAction.setBadgeText({text: issuesCount.toString()});
		browser.browserAction.setTitle({title: "Found " + issuesCount + " differences to arkenfox."});
	}else{
		browser.browserAction.setBadgeText({text:""});
		browser.browserAction.setTitle({title: "Check differences to arkenfox."});
	}
}

function updateBadge() {
	issuesCount
	?
	(
		browser.browserAction.setBadgeText({
			text: issuesCount.toString()
		}),
		browser.browserAction.setTitle({
			title: "Found " + issuesCount + " differences to arkenfox."
		})
	)
	:
	(
		browser.browserAction.setBadgeText({
			text: ""
		}),
		browser.browserAction.setTitle({
			title: "Check differences to arkenfox."
		})
	)
}

function fixerFunc(name, issue, fixAllBtn) {
	let fixBtn = issue.fixBtn;
	let resetBtn = issue.resetBtn;
	--issuesCount;
	browser.experiments.config.prefIsLocked(name).then((isLocked) => {
		isLocked && browser.experiments.config.prefUnlock(name);
		browser.experiments.config.prefSet(name, issue.desired).then(() => {
			issue.row.classList.add("fixed");
			fixBtn.disabled = !0;
			resetBtn.disabled = !1;
			allIssues.delete(name);
			fixAllBtn.disabled = !!allIssues.size;
		});
	});
}

function fixSingleIssue(name, issue, fixAllBtn){
	let res = fixerFunc(name, issue, fixAllBtn);
	updateBadge();
	return res;
}

let allIssues = null;

function fixAll(){
	for(let [k, issue] of allIssues){
		fixerFunc(k, issue);
	}
}

async function checkArkenfoxUserJs(tB, fixAllBtn) {
	tB.innerHTML = "";
	progressDiv.textContent="Checking for issues";
	allIssues = await findIssues();
	progressDiv.textContent="Checked for issues";
	fixAllBtn.disabled = !allIssues.size;
	issuesCount = allIssues.size;
	progressDiv.textContent += ", found " + issuesCount + ". Creating buttons";
	updateBadge();
	for (let [k, issue] of allIssues) {
		console.log(k, issue);
		let r = document.createElement("TR");
		issue.row = r;
		let nameEl = document.createElement("TD");
		let nameLink = document.createElement("A");
		nameLink.textContent = k;
		nameLink.href = "about:config?filter=" + k;
		nameEl.appendChild(nameLink);
		r.appendChild(nameEl);

		let valueEl = document.createElement("TD");
		r.appendChild(valueEl);
		valueEl.textContent = issue.actual;

		let desiredEl = document.createElement("TD");
		desiredEl.textContent = issue.desired;

		r.appendChild(desiredEl);

		let fixBtn = document.createElement("BUTTON");
		issue.fixBtn = fixBtn;
		fixBtn.textContent = "FIX";
		fixBtn.addEventListener("click", fixSingleIssue.bind(null, k, issue, fixAllBtn), !1);

		let fixCell = document.createElement("TD");
		fixCell.appendChild(fixBtn);
		r.appendChild(fixCell);

		tB.appendChild(r);
	}
	progressDiv.textContent="";
	progressDiv.style.display="none";
}

function doCheck(e) {
	progressDiv.style.display="block";
	progressDiv.textContent="Doing check";
	console.log("doCheck");
	let fixAllBtn = document.getElementById("fixall");
	let tB = document.getElementById("results").getElementsByTagName("TBODY")[0];
	fixAllBtn.addEventListener("click", fixAll, !1);
	checkArkenfoxUserJs(tB, fixAllBtn)
}
const progressDiv=document.getElementById("progressDiv");
document.addEventListener("DOMContentLoaded", doCheck, !1);
