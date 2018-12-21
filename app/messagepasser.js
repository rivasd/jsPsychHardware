/**
* Content Script injected only when user chooses to link the page with hardware through jspsych
* it's job is mainly to set up a way to communicate with the normal web page javascript and notify everyone
* 
* 
* @see https://developer.chrome.com/extensions/content_scripts#host-page-communication
* @author Daniel Rivas
* @author Catherine Prevost
*/

import {MuseConnection} from './muse';

/**@type {MuseConnection} */
let muse;

//open communication to the background.js process of the extension

chrome.runtime.onMessage.addListener(function(mess, sender, sendResponse){
	if(mess === 'isLoaded'){
		sendResponse({message:'loaded'});
	}
})


var extensionport;
if(extensionport === undefined){
	extensionport = chrome.runtime.connect({name:"jspsych"});
}


//Communication will take place through a CustomEvent dispatched on the document object, so start listening!
document.addEventListener("jspsych", function(event) {
	var message = event.detail;
	
	if(message.action === "trigger" && muse){
		muse.addMarker(message.payload);
	}
	//simply relay it to the extension
	extensionport.postMessage(message);
});

//the extension can now send data back to the webpage!
extensionport.onMessage.addListener(function(msg){
	console.log(msg);
	document.dispatchEvent(new CustomEvent("jspsych-hardware-message", {detail:msg}))

	if(msg.action == "bluetooth"){
		if(msg.payload == "muse"){
			
			var museattempt = new MuseConnection({
				onLeave: () => {
					extensionport.postMessage({
						target:"popup",
						action : "state",
						payload: {bluetooth:false}
					});
				}
			});
			museattempt.then((client) => {
				muse = client;
				extensionport.postMessage({
					target:"popup",
					action : "state",
					payload: {bluetooth:true}
				})
			})
			.catch((reason) => {
				extensionport.postMessage({
					target:"popup",
					action : "state",
					payload: {bluetooth:false}
				});
				extensionport.postMessage({
					error: reason
				})
			})
		}
		else if(msg.payload == "stop"){
			if(muse){
				muse.stop();
				extensionport.postMessage({
					target:"popup",
					action: "state",
					payload: {bluetooth:false}
				})
			}
		}
		
	}
})


//let the page script (the javascript running jspsych) know that we are ready to listen
document.dispatchEvent(new CustomEvent("jspsych-activate"));
