# Raspberry Train
Provides a web interface to controll a DCC model locomotive.  The beautiful ability to allow others to utilize whatever web connectable device they desire without limitation to brand, operating system or imposed technological restriction...well other than the need for a web browser.

## Thank You's
Special thanks to the DCC++ EX team for helping me troubleshoot and get running.

## Project History
Before I get into my story a little clarification on the technology in use.  DCC++ Ex is the C++ code running on the controller.  It's a project that picked up and rebuilt the DCC++ repository and is now fully supported as DCC++ Extended (https://github.com/DCC-EX)

My project started in 2014.  Originally developed using Java with Groovy and Grails, it was a way to continue to utilize and learn the technology weilded by the company I worked for.  I was successful at serving the application in Tomcat on a raspberry pi with the ability to turn on and off an led using a wireless device connected to the server.  That was so far from the desired outcome but a great start.  Life happens, time goes by, and now was a the time to pick the project up and continue toward success.  With a bit of research and some guidance from the DCC++ Ex team I have a good start and can control a locomotive on my H.O. scaled railroad.

The original plan was to build out my own DCC controller utilizing the industry standard for pulse width modulation and commands.  I still have an interest in doing that.  While researching those standards, I started researching the hardware that could be used.  I came across a number of YouTube videos and DCC++.  It could be imported straight into the Arduino all ready to go and so that's what I did.  Off to a running start.

This project is simple yet so much more robust than the original as I've learned more along the way ( and it works ).  I continued in the same spirit of learning, this project continues to buiild on the technology I currently utilize at work.  No better way to learn than to practice; and practice with something you enjoy :)

## TODO's - so many TODO's
* fix that admin ui -- oof
* link all the resources used for the project
* get the build process working for distribution
* structure the project and let the build do the work
* extract the configurations found in the script files
* rename some things...cause naming is hard - ( 2 things are difficult in coding:  Caching, Naming and Indexing )
* accessibility - learned some things that would be good to add in - like don't take health for granted and help others along the way
* continue to build out the DCC API to connect to other DCC Controllers ( originally utilized DCC++ Ex )


## Overview - How It Works
It's a node server running on the Raspberry Pi with a Websocket server that communicates to the all web app clients and the DCC controller running on the Arduino.  The Arduino uses the Motorshield to send the signals on the bus wires.  A programming line on Terminals B, and the main operating signals on terminals A.

## Get Started
Go check out the DCC++ EX website.  Yes really.  They will get you up and running with a shopping list and the code and the support...but if you want a more do it yourself approach and don't care for jquery then here is how to use my code.

Also I am starting from a place of understanding that assumes you have an understanding of code and are technologically savvy.  For instance you have the ability to load code onto an Arduino, Raspberry Pi or have the interest and wish to investigate such things :)

* Purchase / Accuire the hardware listed below and as listed in DCC++ EX as we are using their code
* On the motor shield remove or bend the aux power pin out of the way - Seriously
* * Strongly suggest looking at DCC++ EX website or YouTube for instructions on this
* * Ensure it will not connect with the Arduino or you will redundantly power the Arduino and destroy it
* Connect the motorshield to the Arduino - no need to power it yet
* Install DCC++ EX on the Arduino
* Pass it some commands using the serial monitor and observe the response
* * `<1>` will power the track and programming track
* * `<s>` returns the status and version info of DCC++ EX
* looks good to me - ready to connect it to the train track
* wire motor shield terminals A to the main track
* wire motor shield terminals B to the programming track
* It is your responsibility to know what you are doing and to avoid short circuits with frogs, turnouts 
* It is your responsibility to ensure you keep the pos+ wire on it's side of the track and the neg- wire on it's side of the track
* send the `<0>` command to turn of track power
* wire the powersupply to the motorshield
* close the serial monitor when you are ready to use the server and web controls


## Windows / Linux using local host
* As is this code will run local host on Windows or Linux
* install the dependencies
* * `npm install`
* - see the TODO above...yes the next steps are manual right now
* create a directory named www
* copy all files that start with train to www 
* copy all svg files to www
* copy lib to www
* inside www directory
* * npm init if you have not done these steps before - we need 1 library
* * `npm install --save snabby`
* in the main directory
* * `node server`
* looks good to me
* open a browser to localhost:whateverport the console log gave


## Linux / Raspberry Pi on a network
I run my setup from the pi and connect to it using my phone browser  train/.  I have the repo on a Windows machine and the operating code on the Pi.  So my Pi is connected to the Arduino and communicates via USB cable.

* rename the pi - you could skip this but i have several pi's running on my network
* *  `sudo nano /etc/hostname`
* * delete all contents and replace with train
* * `sudo nano /etc/hosts`
* * look for the last address  127.0.1.1 and original pi name and and replace the name with train
* add user to the dialout group - allows the pi to connect to the Arduino via USB
* * `sudo adduser yourusername dialout`
* adjust the app files to match the name of your pi - orginal code points to localhost
* * www/train-comm.js
* * * _socketAddress

## File Configurations
As stated in the TODO's the configurations are nested in the files.  Update the configs as needed.

### locomotive configurations
To run your locomotive configure the files for you're loco id.  While you are there change the colors of the loco to match you're paint ( as best as possible ).
* server-websocket-api.js
* * apiModel.trains.dccId

### communication ports - usb port connected to Arduino
You may need to adjust the Comm Ports USB names to match your system.
* server-dcc-comm.js
* * osPorts

### web socket address
If you changed the host name and are NOT running from localhost.
* www/train-comm.js
* * _socketAddress

## Operations
Administration controls and Engineer controls are currently available to the users.  Ideas for turnout controls and sleeper track operators are already in mind...maybe a Dispatch Operator in the future could control when or where the locomotive is able to travel.

### Operations - Administrator
You are in control of the layout.  You must turn on the track power for Engineers to be able to operate.  You also have the E-Stop reset and the ability to send commmends directly to the DCC controller

* navigate to your hosted application /train-admin
* review DCC++ Ex commands and have fun

### Operations - Engineer
* navigate to your host /train
* select a locomotive to start interacting with the controls
* if you see an emergency on the tracks you can press the E-Stop
* * BUT you will need the admin to reset it for you
* * ALL locomotives on the layout are brought to a stop

## Hardware Used
* Raspberry Pi
* Arduino Uno - better to use the Arduino Mega for wifi capabilities
* Uno Motor Shield
* 15V 5A power supply for the Motor Shield - this will power your track so use the correct Voltage and Amperage for your layout
* 12awg solid wire for the main bus lines 
* 18awg solid wire for the feeders


## Resources
* Train Board Forum DCC++ EX (https://www.trainboard.com/highball/index.php?forums/dcc.177/)
* DCC++ EX Repo (https://github.com/DCC-EX)
* DCC++ EX website (https://dcc-ex.com/index.html)
* Wiki (https://dccwiki.com/)
* JMRI Java Model Railroad Interface (https://www.jmri.org/)

