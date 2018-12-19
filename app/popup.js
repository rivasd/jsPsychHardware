
import style from './popup.css';


/**@type {chrome.runtime.Port} */
var backgroundPort;

var currCOMPort;

function init(tabs){
	
	chrome.runtime.sendMessage({tabId:tabs[0].id});


	//open port with background page
	backgroundPort = chrome.runtime.connect({name: "popup"});
	//
	
	
	//load the port address field with previously saved value
	chrome.storage.local.get('port-parallel', function(items){
		if(!chrome.runtime.lastError){
			document.getElementById("parallel-info").val(items['port-parallel']);
		}
		
	});

	/***********************  Initialization for the serial port UI ******************************/


	

	//handle some common messages back from the main background script
	backgroundPort.onMessage.addListener(function(msg){
		if(msg.code === "serial"){

			var selectElem = document.getElementById("serial-ports-list");

			if(msg.ports){

				//we have received an updated list of available COM ports, update the <select> element
				selectElem.innerHTML = "";
				selectElem.add(Option("None", "None", "", "true"));
				msg.ports.forEach(function(port){
					selectElem.add(Option(port, port.substring(3)));
				});

				//now that we have the list of available ports, show the currently connected one if there is onw
				backgroundPort.postMessage({target:'extension', action:'state', 'payload':'serial'});
				
			}
			else if(msg.result == "connected"){
				selectElem.querySelector('option[value="' + msg.name.substring(3)+'"]').selected = true;
				//serialState.removeClass('loading').addClass("on");
				currCOMPort = msg.name.substring(3);

			}
			else if(msg.result == "disconnected"){
				//serialState.removeClass("on off loading");
			}
			else if(msg.error){
				//serialState.removeClass("loading").addClass("off");
			}
		}
	});

	//build the list of available COM ports
	//serialState = $("#state-serial").addClass("loading");
}

document.addEventListener("DOMContentLoaded", function(){

	document.getElementById("parallel-switch").addEventListener("change", function(){
		//TODO: check if already running
		if(this.checked){
			if(document.getElementById("parallel-info").value){
				chrome.runtime.sendMessage({
					target: 'parallel',
					action: 'setup',
					payload: "0x"+document.getElementById("parallel-info").value
				});
				chrome.storage.local.set({
					'port-parallel': document.getElementById("parallel-info").value
				});
			}
		}
	});
	
	document.getElementsByTagName("a").forEach((elem) => {
		elem.addEventListener("click",function(){
			chrome.tabs.create({url:this.href});
			return false;
		})
	})

	//Implement opening the serial port whenever the user selects one from the available list
	document.getElementById("serial-info").addEventListener("change", function(){
		//serialState.removeClass("on off");
		var portNmb = this.options[this.selectedIndex].value;
		if(currCOMPort && currCOMPort == portNmb){
			//user is trying to connect to a COM port currently in use...
			return;
		}
		//document.getElementById("state-serial").classList.add("loading");
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

	//attaching listeners for the websocket and 
	chrome.tabs.query({active:true, currentWindow:true}, init);
});
