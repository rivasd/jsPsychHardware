#!/usr/bin/env python3

import parallel
import sys
import struct
import json
import time
import os

# This is the native program that will operate the ports and hardware. It should be running as root via the SETUID bit set during installation
# We might have to write a quick C wrapper to give us root since ubuntu might disallow python scripts from using the SETUID bit

if sys.platform == "win32":
    import os, msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)



def main():
    
    # pport = parallel.Parallel()
    
    stdout = os.fdopen(sys.stdout.fileno(), 'wb')
    
    # debugging calls
    # os.setuid(0)
    # print(os.getuid())
    
    # Helper function that sends a message to the webapp.
    def send_message(message):
        # Write message size.
        stdout.write(bytes(struct.pack('I', len(message))))
        # Write the message itself.
        stdout.write(bytes(message, 'utf-8'))
        stdout.flush()
    
    # send_message("connected!")
    
    while 1:    #continous loop
        mess_length = sys.stdin.buffer.read(4) #program will block here until something is received
        
        if len(mess_length) == 0:
            sys.exit(0)
        
        text_length = struct.unpack('i', mess_length)[0] # convert those first 4 bytes into an integer representing the message length
        
        message = sys.stdin.buffer.read(text_length).decode('utf-8') # now that we have the mess length, read as many bytes from stdin to get the message as utf-8 encoded string
        
        message = json.loads(message) #Debug Cons convert that json string to a python dict

        # If we got so far, then we won!
        
        pport.setData(message['payload'])
        time.sleep(0.003)
        pport.setData(0)
        
        send_message({"status": "OK"})
        
    pass



if __name__ == "__main__":
    main()