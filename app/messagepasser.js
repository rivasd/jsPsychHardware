/**
* Content Script injected only when user chooses to link the page with hardware through jspsych
* it's job is mainly to set up a way to communicate with the normal web page javascript and notify everyone
* 
* 
* @see https://developer.chrome.com/extensions/content_scripts#host-page-communication
* @author Daniel Rivas
* @author Catherine Prevost
*/

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
	//simply relay it to the extension, FOR NOW I see no point in doing any computation here...
	extensionport.postMessage(message);
});

//the extension can now send data back to the webpage!
extensionport.onMessage.addListener(function(msg){
	console.log(msg);
	document.dispatchEvent(new CustomEvent("jspsych-hardware-message", {detail:msg}))
})


//let the page script (the javascript running jspsych) know that we are ready to listen
document.dispatchEvent(new CustomEvent("jspsych-activate"));
