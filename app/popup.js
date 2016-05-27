
$(function(){
	$("#activate").click(function(evt){
		chrome.tabs.executeScript({file:"messagepasser.js"});
	});
});
