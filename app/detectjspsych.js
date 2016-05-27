
/**
 * Detects if the special "jspsyc" attribute has been set on the body element, indicating that jspsych has been loaded
 */
function detectJsPsych(){
	var presence = $("html").attr("jspsych");
	if(presence === 'true'){
		chrome.runtime.sendMessage('jspsych-detected');
	}
}
detectJsPsych();