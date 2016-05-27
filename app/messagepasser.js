/**
* Content Script injected only when user chooses to link the page with hardware through jspsych
* Should register listeners for message events
* 
* 
* @see https://developer.chrome.com/extensions/content_scripts#host-page-communication
* @author Daniel Rivas
* @author Catherine Prevost
*/

// when injected, leave a mark on the DOM that lets the normal page javascript know that it can now use calls to the hardware extension
var  jspsychHardwareDiv = $('<div style="display:none;" hidden></div>', {id:"jspsychHardwareDiv"});
$("body").append(jspsychHardwareDiv);

//open communication to the background.js process of the extension
var extensionport = chrome.runtime.connect();

//Communication will take place through the window.postMessage functionality of modern browsers. start listening for the event!
window.addEventListener("message", function(event) {
	if (event.source != window){
	    return;
	}
	if (event.data.type && (event.data.type == "jspsych")) {
		console.log("Content script received: " + event.data.text);
		
	    port.postMessage(event.data);
	}
}, capture);
