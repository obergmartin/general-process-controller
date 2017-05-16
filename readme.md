# General Process Controller

Control inputs and outputs on a development board.

## Install

This project is meant to run on an Onion Omega2+, but should in theory work on 
a RaspberryPi. The node.js scripts were written for v4.3.1.

To install:
1. Copy the files to the Device. If not in /root/controller, you may need to 
change some paths. 

2. Install nodejs

3. If using 1-wire devices, follow setup instructions at:
https://wiki.onion.io/Tutorials/Reading-1Wire-Sensor-Data

4. Make a symbolic link for web display:
ln -s /root/webkeezer/ /www/console/controller


## Code

This is my first major JavaScript project and first time writting a webserver
backend, so comments would be helpful.  I currently have this project working 
with two 1-wire DS18b20 devices and the omega relay expansion board.  It will
eventually be used to automate greenhouse temperatures (and likely humidity) 
so I intend to make improvements.

The included libraries will aid in controlling 1-wire temperature devices 
(ds.js), io pin commands (pinio.js), and the omega relay expansion card 
(relayexp.js).  This are wrapper functions for command line utilities that 
get data and execute on/off commands.  It should be fairly easy to incorporate
wrappers for other types of devices.

The control.js scripts updates values and executes actions once a minute but
can be changed in that file.  Reading 1-wire temperature devices happens 
serially and can take some time.  With my tests using two temperature sensors
I occasionally miss a reading.  

The webserver is used to update values and look at logged data.  It is 
accessed on the local network at: http://<omega-ip-address>:8182/setup.html.
The status.html page uses status.js and should be updated to suit your needs.

The plots generated at status.html and loghistory.html still need some changes
to be flexible to work with other data.  The time MyClock device and Time 
variable defined at setup.html are needed for graphing.

## Run

1. Start the webserver:
node server.js &

2. Start the controller:
node control.js &

3. Navigate to:
http://<omega-ip-address>:8182/setup.html
