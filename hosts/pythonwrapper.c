/**
 * Well, no choice but to write some C code...
 *
 * This is a simple wrapper that will allow us to call a python script with root privileges through the setuid() command
 */

#include <sys/types.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/io.h>

#define BASEPORT 0x378 /* address of the parallel port */


/**
 * waits for and receives a 4 bytes message from stdin. chrome extensions send a 4 byte header containing the message length
 */
int readMessageLength(){
	unsigned int length = 0;
	int i;
	for (i = 0; i < 4; i++) {
	  unsigned int read_char = getchar(); //program will block and wait here if there is nothing
	  length = length | (read_char << i * 8); //don't ask me how that magic works: http://stackoverflow.com/questions/20211166/how-to-send-message-from-chrome-extension-to-native-app/26140545#26140545
	}
	return length;
}




int main(int argc, char *argv[]){
	setuid(0);

	if(ioperm)

	while(1){

	}

	//execl("./hostmessenger.py", 0);
}
