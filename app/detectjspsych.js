
/**
 * Detects if the special "jspsyc" attribute has been set on the body element, indicating that jspsych has been loaded
 */
function detectJsPsych(){
	var presence = document.documentElement.getAttribute("jspsych")
	if(presence === 'present'){
		chrome.runtime.sendMessage('jspsych-detected');
	}
}
detectJsPsych();