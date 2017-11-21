
/**
 * Main code of the extension, this Event-page registers listeners for all the events that we care about
 * These listeners will serve mostly to relay information between content-script to the native app
 * 
 * Event pages like this script open and close frequently, so we should not store any information or write code outside of the 
 * event listeners. also, we should make sure to close ports and connections otherwise the whole point of having an event page
 * like this one that only executes when needed goes down the drain...
 */


//setup persistent store for addresses and state of multiple hardware
chrome.storage.local.set({
	"state-parallel": false
});

/**@type {chrome.runtime.nativePort} */
var nativePort;

/**@type {chrome.runtime.Port} */
var popupPort;

/**@type {chrome.runtime.Port} */
var webpagePort;

var activeTab;

var currCOMPort;

function process(request, sender, sendResponse){
	//the sender might actually be a port, which screws with the check below. luckily the port will itself have a Sender object

	var senderPort;

	if(sender.sender){
		senderPort = sender;
		sender = sender.sender;
	}
	//ignore the jspsych-detected message that is dealt with earlier
	if(request === 'jspsych-detected'){
		return;
	}
	
	
	//deal only with messages from content-scripts or the popup, reject anything else
	if(sender.id === chrome.runtime.id || (sender.tab && sender.tab.id === activeTab)){
		
		if(request === undefined){
			//we were sent an empty message... what to do???
			console.log("we got an empty message");
			return;
		}
		else if(!(request.target === 'extension')){
			nativePort.postMessage(request);
		}
		else if(request.target == 'extension'){
			//do something extension-ish
			if(request.action == 'state' && request.payload == 'serial' && senderPort){
				if(currCOMPort){
					senderPort.postMessage({
						result: 'connected',
						name: 'COM'+currCOMPort,
						code:'serial'
					});
				}
			}
		}
		if(request === "closeNative"){
			nativePort.disconnect();
		}
	}
	else{
		console.log("communication attempted by other extension/app. Denied");
	}
}


//start listening for a signal that jspsych is present on the page (sent by our tiny content-script injected on all pages)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(sender.tab && request === 'jspsych-detected'){
		chrome.pageAction.show(sender.tab.id);
	}
	else if(request.tabId){
		activeTab = request.tabId;
	}
});

chrome.runtime.onConnect.addListener(function(port){
	

	if(port.name == "popup"){
		popupPort = port;

		chrome.tabs.sendMessage(activeTab, 'isLoaded', function(resp){
			if(resp){
				// do nothing, scripts already injected
			}
			else{
				chrome.tabs.executeScript(activeTab, {file:"jquery.js"});
				chrome.tabs.executeScript(activeTab, {file:"messagepasser.js"});
			}
		});

		//here we should open up the native messaging port, and then test it
		//remember that this page will not close as long as this port is not closed
		if(nativePort === undefined){
			nativePort = chrome.runtime.connectNative("com.cogcommtl.hardware");
			
			nativePort.onMessage.addListener(function(mess){
				if(mess.message == "connected"){
					chrome.pageAction.setIcon({
						tabId: activeTab,
						path:"media/jspsych-logo-ok.png"
					});
				}
				else if(mess.code === "serial"){
					mess.from = "native";

					if(mess.result == "connected"){
						//we have established a connection, remember which one
						currCOMPort = mess.name.substring(3);
					}
					else if(mess.result == 'disconnected'){
						currCOMPort = undefined;
					}

					//possible that we received some message through the COM port!
					if(popupPort){
						popupPort.postMessage(mess);
					}
					if(webpagePort){
						webpagePort.postMessage(mess);
					}
					
				}
				console.log(mess);
			});
			
			nativePort.onDisconnect.addListener(function(){
				console.log("native disconnected");
				chrome.pageAction.setIcon({
					tabId: activeTab,
					path:"media/jspsych-logo-err.png"
				});
				nativePort = undefined;
			});
		}


		//We must handle user actions on the tab that used the extension, like refreshs, navigating to other tabs that still contain jsPsych,
		//All the while trying to maintain a coherent connection to the native app and only a single instance of it
		//attach the event listener only once, when the 'working tab' is remembered
		chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
			if(tabId === activeTab){
				//close everything
				nativePort.disconnect();
				nativePort = undefined;
				activeTab = undefined;
			};
		});

		//now we are ready to process messages from the popup UI and possibly pass them to the Native program
		
		popupPort.onMessage.addListener(process);

		//make sure we keep track of when the popup window gets closed
		popupPort.onDisconnect.addListener(function(port){
			popupPort = undefined;
		});

		//we need to fetch the list of COM ports to initialize the popup UI
		nativePort.postMessage({
			target:'serial',
			action:'list',
			payload:'COM'
		});


		
	}
	//The code below deals only with communications from the web page (through messagepasser.js)
	//the distiction is made explicit because it is possible that other things want to connect to the background script
	else if(port.name == "jspsych"){
		
		webpagePort = port;

		//start listening for messages
		port.onMessage.addListener(process);

		//chrome.runtime.onMessage.addListener(process);
		//close all native connections if the web page calling this extension is unloaded
		port.onDisconnect.addListener(function(){
			nativePort.disconnect();
			if(popupPort){
				popupPort.disconnect();
			}
			
			nativePort = undefined;
			popupPort = undefined;
			//also, since the user changed to a new page, close the ui
			//chrome.pageAction.hide();
		});
	}
});



