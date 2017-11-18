
/**@type {JQuery} */
var serialState;

/**@type {chrome.runtime.Port} */
var backgroundPort;

function init(tabs){
	
	chrome.runtime.sendMessage({tabId:tabs[0].id});


	//open port with background page
	backgroundPort = chrome.runtime.connect({name: "popup"});
	//
	
	
	//load the port address field with previously saved value
	chrome.storage.local.get('port-parallel', function(items){
		if(!chrome.runtime.lastError){
			$("#port-parallel").val(items['port-parallel']);
		}
		
	});

	/***********************  Initialization for the serial port UI ******************************/

	serialState = $("#state-serial").addClass("loading");

	//handle some common messages back from the main background script
	backgroundPort.onMessage.addListener(function(msg){
		if(msg.code === "serial"){

			var selectElem = document.getElementById("serial-ports-list");

			if(msg.ports){
				serialState.removeClass("loading");
				//we have received an updated list of available COM ports, update the <select> element
				var availablePorts = $("#serial-ports-list").empty();
				availablePorts.append($("<option>",{
					text: "None",
					selected: "true",
					value:"None"
				}));
				msg.ports.forEach(function(port){
					availablePorts.append($("<option>", {
						value: port.substring(3),
						text: port
					}));
				});
			}
			else if(msg.result == "connected"){
				
				if(msg.name && selectElem.options[selectElem.selectedIndex].value == msg.name.substring(3)){
					serialState.removeClass('loading').addClass("on");
				}
				else{
					serialState.removeClass("loading").addClass("off");
				}
			}
			else if(msg.result == "disconnected"){
				serialState.removeClass("on off loading");
			}
			else if(msg.error){
				serialState.removeClass("loading").addClass("off");
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


$(function(){
	
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

	//Implement opening the serial port whenever the user selects one from the available list
	$("#serial-ports-list").change(function(evt){
		serialState.removeClass("on off");
		var portNmb = this.options[this.selectedIndex].value;
		document.getElementById("state-serial").classList.add("loading");
		if(portNmb != "None"){
			
			backgroundPort.postMessage({
				target: "serial",
				action: "connect",
				payload: portNmb
			});
		}
		else{
			//selecting the None option should release any previous COM connection
			backgroundPort.postMessage({
				target: "serial",
				action: "disconnect",
				payload: portNmb
			});
		}
	});
	

	chrome.tabs.query({active:true, currentWindow:true}, init);
});
