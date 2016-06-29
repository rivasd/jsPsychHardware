
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
	"state-parallel": false,
	"port-parallel": "0x378"
});


//start listening for a signal that jspsych is present on the page (sent by our tiny content-script injected on all pages)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(sender.tab && request === 'jspsych-detected'){
		chrome.pageAction.show(sender.tab.id);
	}

});

chrome.runtime.onConnect.addListener(function(port){
	
	if(typeof nativePort === 'undefined'){
		var nativePort;
	}
	
	//The code below deals only with communications from the web page (through messagepasser.js)
	//the distiction is made explicit because it is possible that other things want to connect to the background script
	if(port.name == "jspsych"){
		//here we should open up the native messaging port, and then test it
		//remember that this page will not close as long as this port is not closed
		if(typeof nativePort === 'undefined'){
			nativePort = chrome.runtime.connectNative("com.cogcommtl.hardware");
		}
		//for now, chrome extensions do not expose any useful native API like apps do (why???!??!), this means that
		//we might as well start the our native program right now. maybe in the future Google will add more native-like APIs
		//for extensions, or maybe we'll decide to use yet another (sigh) middleman: a Chrome App
		
		var activeTab = port.sender.tab.id;
		
		nativePort.onMessage.addListener(function(mess){
			if(mess.message == "connected"){
				chrome.pageAction.setIcon({
					tabId: activeTab,
					path:"media/jspsych-logo-ok.png"
				});
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
		
		function process(request, sender, sendResponse){
			//the sender might actually be a port, which screws with the check below. luckily the port will itself have a Sender object
			if(sender.sender){
				sender = sender.sender;
			}
			
			//deal only with messages from content-scripts or the popup, reject anything else
			if(sender.id === chrome.runtime.id || (sender.tab && sender.tab.id === activeTab)){
				
				if(request === undefined){
					//we were sent an empty message... what to do???
					console.log("we got an empty message");
					return;
				}
				if(!(request.target === 'extension')){
					nativePort.postMessage(request);
				}
				else{
					//do something extension-ish
				}
				if(request === "closeNative"){
					nativePort.disconnect();
				}
			}
			else{
				console.log("communication attempted by other extension/app. Denied");
			}
		}
		
		//start listening for messages
		chrome.runtime.onMessage.addListener(process);
		port.onMessage.addListener(process);
		
		//close all native connections if the web page calling this extension is unloaded
		port.onDisconnect.addListener(function(){
			nativePort.disconnect();
			//also, since the user changed to a new page, close the ui
			//chrome.pageAction.hide();
		});
	};
});

