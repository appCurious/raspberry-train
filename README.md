# Raspberry Train
Provides a web interface to controll a DCC model locomotive.  The beautiful ability to allow others to utilize whatever web connectable device they desire without limitation to brand, operating system or imposed technological restriction...well other than the need for a web browser.

## Thank You's


## Project History
Before I get into my story a little clarification on the technology in use.  DCC++ Ex is the C++ code running on the controller.  It's a project that picked up and rebuilt the DCC++ repository and is now fully supported as DCC++ Extended (https://github.com/DCC-EX)

My project started in 2014.  Originally developed using Java with Groovy and Grails, it was a way to continue to utilize and learn the technology weilded by the company I worked for.  I was successful at serving the application in Tompcat on a raspberry pi with the ability to turn on and off an led using a wireless device connected to the server.  That was so far from the desired outcome but a great start.  Life happens, time goes by, and now was a the time to pick the project up and continue toward success.  With a bit of research and some guidance from the DCC++ Ex team I have a good start and can control a locomotive on my H.O. scaled railroad.

The original plan was to build out my own DCC controller utilizing the industry standard for pulse width modulation and commands.  I still have an interest in doing that.  While researching those standards, I started researching the hardware that could be used.  I came across a number of YouTube videos and DCC++.  It could be imported straight into the Arduino all ready to go and so that's what I did.  Off to a running start.

This project is simple yet so much more robust than the original as I've learned more along the way ( and it works ).  I continued in the same spirit of learning, this project continues to buiild on the technology I currently utilize at work.  No better way to learn than to practice; and practice with something you enjoy :)

## TODO's - so many TODO's
* link all the resources used for the project
* get the build process working for distribution
* structure the project and let the build do the work
* extract the configurations found in the script files
* rename some things...cause naming is hard - ( 2 things are difficult in coding:  Caching, Naming and Indexing )
* accessibility - learned some things that would be good to add in - like don't take health for granted and help others along the way
* continue to build out the DCC API to connect to other DCC Controllers ( originally utilized DCC++ Ex )

## Get Started
Go check out the DCC++ EX website.  Yes really.  They will get you up and running with a shopping list and the code and the support...but if you want a more do it yourself approach and don't care for jquery then here is how to use my code.

* Purchase / Accuire the hardware listed below.
* On the motor shield remove or bend the aux power pin out of the way - Seriously
* Strongly suggest looking at DCC++ EX website or YouTube for instructions on this
* * Ensure it will not connect with the Arduino or you will redundantly power the Arduino and destroy it
* Connect the motorshield to the Arduino - no need to power it yet
* Install DCC++ EX on the Arduino
* Pass it some commands and observe the serial monitor for the outputs
* * `<1>` will power it up so that's a good command to start with
* * `<s>` returns the status and version info of DCC++ EX
* looks good to me - ready to connect it to the train track
* wire motor shield terminals A to the main track
* wire motor shield terminals B to the programming track
* It is your responsibility to know what you are doing and to avoid short circuits with frogs, turnouts 
* It is your responsibility to ensure you keep the pos+ wire on it's side of the track and the neg- wire on it's side of the track
* wire the powersupply to the motorshield


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




# Linux / Raspberry Pi on a network
I run my setup from the pi and connect to it using my phone browser  train/
* rename the pi - you could skip this but i have several pi's running on my network
* *  `sudo nano /etc/hostname`
* * delete all contents and replace with train
* * `sudo nano /etc/hosts
* * look for the original pi name and 127.0.01 and replace the name with train
* add user to the dialout group - allows the pi to connect to the Arduino via USB
* * `sudo adduser yourusername dialout`
* adjust the app files to match the name of your pi - orginal code points to localhost
* * www/train-comm.js







## Hardware Used
* Raspberry Pi
* Arduino Uno - better to use the Arduino Mega for wifi capabilities
* Uno Motor Shield
* 15V 5A power supply for the Motor Shield - this will power your track so use the correct Voltage and Amperage for your layout
* 12awg solid wire for the main bus lines 
* 18awg solid wire for the feeders

# How It Works
It's a node server running on the Raspberry Pi with a Websocket server that communicates to the web app and the DCC controller running on the Arduino.  The Arduino uses the Motorshield to send the signals on the bus wires.  A programming line on Terminals B, and the main operating signals on terminals A.

# Resources
* Train Board Forum DCC++ EX (https://www.trainboard.com/highball/index.php?forums/dcc.177/)
* DCC++ EX Repo (https://github.com/DCC-EX)
* DCC++ EX website (https://dcc-ex.com/index.html)
* Wiki (https://dccwiki.com/)
* JMRI Java Model Railroad Interface (https://www.jmri.org/)

