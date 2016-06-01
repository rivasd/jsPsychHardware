#!/bin/sh

# Our Python host that controls the hardwares needs root privileges to access the ports. I will try a very dumb approach and simply
# call this one liner instead of directly calling th .py, so that I can sudo

sudo ./hostmessenger.py