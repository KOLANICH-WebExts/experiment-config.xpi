"use strict";

async function openComparerTab(tab, OnClickData){
	//browser.browserAction.setPopup({"popup":browser.extension.getURL("./gui.html")});
	//browserAction.openPopup();
	//browser.tabs.create({url:"gui.html"});
	browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(openComparerTab);
