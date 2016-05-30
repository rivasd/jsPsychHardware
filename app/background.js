
/**
 * Main code of the extension, this Event-page registers listeners for all the events that we care about
 * These listeners will serve mostly to relay information between content-script to the native app
 * 
 * Event pages like this script open and close frequently, so we should not store any information or write code outside of the 
 * event listeners. also, we should make sure to close ports and connections otherwise the whole point of having an event page
 * like this one that only executes when needed goes down the drain...
 */

//start listening for a signal that jspsych is present on the page (sent by our tiny content-script injected on all pages)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(sender.tab && request === 'jspsych-detected'){
		chrome.pageAction.show(sender.tab.id);
	}
});

chrome.runtime.onConnect.addListener(function(port){
	
	//The code below deals only with communications from the web page (through messagepasser.js)
	//the distiction is made explicit because it is possible that other things want to connect to the background script
	if(port.name == "jspsych"){
		//here we should open up the native messaging port, and then test it
		//remember that this page will not close as long as this port is not closed
		var nativePort = chrome.runtime.connectNative("com.cogcommtl.hardware");
		//for now, chrome extensions do not expose any useful native API like apps do (why???!??!), this means that
		//we might as well start the our native program right now. maybe in the future Google will add more native-like APIs
		//for extensions, or maybe we'll decide to use yet another (sigh) middleman: a Chrome App
		
		//start listening for messages from jspsych (through our messagepasser.js content-script)
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(!sender.tab){
				//if the message did not originate from the web page, then we do not care about it
				return;
			}
			
			//we should simply relay the message to the native app, as it probably runs faster than any js code 
			//especially when we will implement it in C++ rather than Python.
			if(request.recipient === 'native'){
				nativePort.postMessage(request);
			}
			if(request === "closeNative"){
				nativePort.disconnect();
			}
			
			//here we can listen from messages back from our native program
			nativePort.onMessage.addListener(function(mess){
				//I guess we'll do stuff here... eventually
			});
			
		});
		
		//close all native connections if the web page calling this extension is unloaded
		port.onDisconnect.addListener(function(){
			nativePort.disconnect();
			//also, since the user changed to a new page, close the ui
			chrome.pageAction.hide();
		});
	}
});

