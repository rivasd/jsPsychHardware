
$(function(){
	
	
	var backgroundPort;
	var status;
	
	function init(){
		//inject content scri[ts
		chrome.tabs.query({
			active:true,
			currentWindow:true
		}, function(tabs){
			var currTab = tabs[0];
			chrome.tabs.sendMessage(currTab.id, 'isLoaded', function(resp){
				if(resp){
					// do nothing, scripts already injected
				}
				else{
					chrome.tabs.executeScript({file:"jquery.js"});
					chrome.tabs.executeScript({file:"messagepasser.js"});
				}
			});
		});
		
		//open port with background page
		backgroundPort = chrome.runtime.connect({name: "popup"});
		//
		$("div.onoffswitch").data("active", false).addClass("off");
		
		//load the port address field with previously saved value
		chrome.storage.local.get('port-parallel', function(items){
			if(!chrome.runtime.lastError){
				$("#port-parallel").val(items['port-parallel']);
			}
			
		});
	};
	
	function syncState(){
		

	};
	
	var testcount =0;
	
	$("#activate").click(function(evt){
		//TODO: check if already running
		if($("#port-parallel").val()){
			chrome.runtime.sendMessage({
				target: 'hardware',
				action: 'setup',
				payload: "0x"+$("#port-parallel").val()
			});
			chrome.storage.local.set({
				'port-parallel': $("#port-parallel").val()
			});
		};
		
		window.close();
		$(this).hide();

	});
	
	$("div.onoffswitch").click(function(evt){
		var device = $(this).parent().attr("id").split("-")[0];
		switch (device) {
		case "parallel":
			
			break;

		default:
			break;
		}
	});
	
	
	init();
});
