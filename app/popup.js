
$(function(){
	
	/**@type {chrome.runtime.Port} */
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

		//handle some common messages back from the main background script
		backgroundPort.onMessage.addListener(function(msg){
			if(msg.code === "serial"){
				if(msg.ports){
					//we have received an updated list of available COM ports, update the <select> element
					var availablePorts = $("#serial-ports-list").empty();
					msg.ports.forEach(function(port){
						availablePorts.append($("<option>", {
							value: port,
							text: port
						}));
					})
				}
			}
		});

		//build the list of available COM ports
		backgroundPort.postMessage({
			"target": "serial",
			"action": "list",
			"payload":"COM"
		});

		
	};
	
	var testcount =0;
	
	$("#activate").click(function(evt){
		//TODO: check if already running
		if($("#port-parallel").val()){
			chrome.runtime.sendMessage({
				target: 'parallel',
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
	
	$("a").click(function(evt){
		chrome.tabs.create({url:this.href});
		return false;
	});
	
	
	

	init();
});
