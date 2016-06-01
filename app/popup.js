
$(function(){
	$("#activate").click(function(evt){
		//TODO: check if already running
		chrome.tabs.executeScript({file:"jquery.js"});
		chrome.tabs.executeScript({file:"messagepasser.js"});
		window.close();
		$(this).hide();
	});
});
