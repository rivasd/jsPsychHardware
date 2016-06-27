
$(function(){
	
	chrome.tabs.executeScript({file:"jquery.js"});
	chrome.tabs.executeScript({file:"messagepasser.js"});
	
	var status = chrome.extension.getBackgroundPage().status;
	var backgroundPort = chrome.runtime.connect({name: "popup"});
	
	$("#activate").click(function(evt){
		//TODO: check if already running
		
		window.close();
		$(this).hide();
	});
	
	$("div.onoffswitch").click(function(evt){
		var device = $(this).parent().attr("id").split("-")[0];
		
	});
});
