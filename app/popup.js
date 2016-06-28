
$(function(){
	
	
	var backgroundPort;
	var status;
	
	function init(){
		//inject content scri[ts
		chrome.tabs.executeScript({file:"jquery.js"});
		chrome.tabs.executeScript({file:"messagepasser.js"});
		//open port with background page
		backgroundPort = chrome.runtime.connect({name: "popup"});
	}
	
	function syncState(){
		status = chrome.runtime.getBackgroundPage(function(page){
			status = page.status
		});
	};
	
	var testcount =0;
	
	$("#activate").click(function(evt){
		//TODO: check if already running
		
		window.close();
		$(this).hide();
	});
	
	$("div.onoffswitch").click(function(evt){
		var device = $(this).parent().attr("id").split("-")[0];
		testcount++;
		syncState();
	});
});
