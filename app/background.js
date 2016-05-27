

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(sender.tab && request === 'jspsych-detected'){
		chrome.pageAction.show(sender.tab.id);
	}
});