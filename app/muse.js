import {MuseClient} from 'muse-js';
import {type} from 'os';




class MuseConnection {

    constructor(opts){
        this.client = null;

        var defaults = {
            onLeave: () => {}
        }
        //watch for page refresh so that we still save the data
        

        this.opts = {...defaults, ...opts};
        this.encoder = new TextEncoder();
        this.streaming = false;
        this.timeStep = 1000.0 / 256;
        this.autoSaveThreshold = 1024;
        

        return this.connectMuse()
        .then((client) => {
            this.client = client;
            
            //this.startStream();
            const self = this;
            this.startStream();

            this.client.eegReadings.subscribe((reading) => {
                if(self.streaming){
                    reading.samples.forEach((sample, idx) => {
                        this.streamWriter.write(this.encoder.encode(`${reading.timestamp + (idx * this.timeStep)},${reading.index},${reading.electrode},${sample}\n`))
                    });
                }
            });

            window.addEventListener("beforeunload", (evt) => {
                if(evt.isTrusted){      // need to check for true event since StreamSaver fires a few unload events....
                    self.stop();
                    if(typeof this.opts.onLeave == "function"){
                        this.opts.onLeave();
                    }
                }
            })
            
            
            this.startStreamingEvents();
            


        })
    }

    async connectMuse() {
        var client = new MuseClient();

        await client.connect();
        await client.start();

        return client;
    }

    startStream(){

        const today = new Date();
        const timeStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDay()}_${today.getHours()}h${today.getMinutes()}m-eegdata.csv`;
        this.streamWriter = streamSaver.createWriteStream(timeStr).getWriter();
        this.streaming = true;
        this.streamWriter.write(this.encoder.encode("timestamp,index,electrode,value\n"));
    }

    attachToEeg(observers){
        observers.forEach((observer) => {
            if(this.client){
                this.client.eegReadings.subscribe(observer);
            }
        })
    }

    startStreamingEvents(){
        if(!this.streaming) throw new Error("Cannot start writing events to file: not currently streaming to file");
        if(!this.client) throw new Error("Cannot stream events to file: bluetooth client not active");

        this.client.eventMarkers.subscribe((event) => {
            this.streamWriter.write(this.encoder.encode(`${event.timestamp},,event,${event.value}\n`))
        })
        // Watch for bluetooth disconnects
        var self = this;
        var firstFalses = 0; // weird behavior where the connectionStatus stream sends two false values at the beginning, let's just skip them
        this.client.connectionStatus.subscribe((conn) => {
            if(!conn){
                if(firstFalses < 2){
                    firstFalses++;
                }
                else if(self.streaming){
                    self.streamWriter.close();
                }
                
            }
        });
        
        


        
    }

    stop(){
        if(this.client){
            this.client.disconnect();
        }
        this.streamWriter.close();
    }

}


export {MuseConnection};