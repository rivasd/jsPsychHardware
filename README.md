# jsPsychHardware

> A Google Chrome Extension that allows client-side JavaScript to read/write Serial and Parallel ports.

Control Arduinos and send Parallel Port triggers for electrophysiological devices and other legacy hardware from a webpage. No server required!

## Getting Started

jsPsychHardware was built as a companion to the fantastic [jsPsych](https://github.com/jspsych/jsPsych) library for creating and running behavioral experiments in a browser. However, you don't need to include it on your page, here's how to get up and running

### Prerequisites

#### Native C++ program 

You will need to install [this small native C++ program](https://github.com/rivasd/chromeparallel/releases) to relay messages from the extension to the hardware. 

*Windows x64 and x86 only, Linux support planned*

### Installing

You can find and install the latest version of this extension [here](https://chrome.google.com/webstore/detail/jspsychhardware/jfodnelopfigofnkclnkeeehjjjlnkan)

#### DOM trace

Let jsPsychHardware know that your page will need it by setting a custom "jspsych" attribute on your `<html>` element. This is done automatically if you have already included [jsPsych](http://www.jspsych.org) through a `<script>` tag in your page.

```html
<!-- Set this attribute -->
<html jspsych="present">
    ...
    <!-- Rest of your webpage goes here -->
</html>
```

You can now use jsPsychHardware by clicking the jsPsych icon on the top right of your Chrome screen!

#### Settings

##### COM ports
You can connect to a COM port by selecting one from the options. The icon will turn green upon successful connection. Make sure no other processes (like an Arduino Serial monitor) are using the COM port you are trying to connect to!

##### LPT port
You will need to provide jsPsychHardware with the hardware address of your Parallel port. It is a 4-digit hex number you can find by consulting your system's settings [as described here](https://www.sevenforums.com/hardware-devices/344035-i-o-address-parallel-lpt-port-missing-resource-tab.html), then click the "on" button next to the input box to confirm the address

## Documentation

jsPsychHardware uses [Custom Events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events) to communicate with your client-side JS. You will thus send commands by dispatching `jspsych` type Events on the `document` element

```javascript
// Creating a message to display a byte with value 255 on the parallel port
var myEvent = new CustomEvent('jspsych', {
    detail:{
        target : 'parallel',
        action : 'trigger',
        payload: 255
    }
});

//send the message
document.dispatchEvent(myEvent);
```

jsPsychHardware's events have a `detail` object with 3 fields describing the desired operation:

|__Field name__ | *Usage*                                                   | *Possible values*     |
|---------------|-----------------------------------------------------------|-----------------------|
|target         |indicates the target hardware to operate                   |`serial` `parallel`    |
|action         |What operation to conduct                                  | `trigger` `send` `read` |
|payload        |action-dependent information needed to complete the command|`{String|number}`      |

### Serial Ports
#### action: send
You can write to the serial port using event detail with target `serial`, action `send`, and a String for `payload`
```javascript
//you can 'send' Strings to the serial port
document.dispatchEvent(new CustomEvent('jspsych',{
    detail:{
        target: 'serial',
        action: 'send',
        payload: 'Hello Arduino' //String only, other types will fail
    }
}));
```
#### action: read
`payload` must be a valid integer representing the maximal number of bytes to read from the port. jsPsychHardware will emit a `jspsych-hardware-message` event when the hardware responds. The event objects' `detail` member will contain the data. 

> If no data is available on the port when the read command is sent, the event will contain no data. **Make sure your device has written data before attempting to read**



```javascript
//create a listener that will receive the result of all read operations
document.addEventListener('jspsych-hardware-message', function(evt){
    var receivedObject = evt.detail;
    var value = receivedObject.result               //the char array read from the port
    if(value){
        //do something with the received data...
    }
    else{
        //there was nothing to read when this request was sent...
    }
    
});

//Now that we are ready to receive the data, send the read request
document.dispatchEvent(new CustomEvent('jspsych', {
    detail:{
        target: 'serial',
        action: 'read',
        payload: 1          //must be integer, here reads single byte if available
    }
}));
```

### Parallel Port

#### action: trigger
Currently, only writing is supported for LPT ports. Byte value appears on the port's pins for **5ms** then goes back to zero (used to send triggers to BioSemi EEG acquisition box).

payload must be integer between 0 and 255.

```javascript
//send a byte value to indicate an interesting event (like a visual stimulus appearing during a psychological experiment)
document.dispatchEvent(new CustomEvent('jspsych', {
    detail:{
        target:'parallel',
        action:'trigger',
        payload: 64         //only valid byte accepted (0-255)
    }
}));
```

## Contributing

Contributions and suggestions for future hardware support are more than welcome! raise an issue on this GitHub :)

## Authors

* **Daniel Rivas** - (https://github.com/rivasd)

## Acknowledgments

* Hat tip to [Josh de Leeuw](https://github.com/jodeleeuw) for the jsPsych library
* [Montreal's Centre for Research on Brain Language and Music](http://crblm.ca/) for their support.
