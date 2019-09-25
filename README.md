# How to use the OLED display

## prerequisites
- A 128x64 I2C OLED display [This is the one i used](https://www.ebay.com.au/itm/AU-0-96-I2C-IIC-OLED-LCD-LED-Display-Module-128X64-SPI-for-Arduino-Raspberry-PI/153074643386?_trkparms=aid%3D111001%26algo%3DREC.SEED%26ao%3D1%26asc%3D20131017132637%26meid%3De0d7c650189a4a1bb8154f1f07c002a1%26pid%3D100033%26rk%3D1%26rkt%3D5%26mehot%3Dpp%26sd%3D153074643386%26itm%3D153074643386%26pmt%3D1%26noa%3D1%26pg%3D2045573&_trksid=p2045573.c100033.m2042)
- Node JS with npm
- Raspberry pi (with sudo access)

## Steps

1. Wire up your screen like so: ![hello](https://www.raspberrypi-spy.co.uk/wp-content/uploads/2018/02/i2c_oled_128x64_raspberry_pi_wiring.png)

2. One this is done SSH into your raspberry pi and run the command: 
   ```
   sudo i2cdetect -y 1
   ```
   This should get the following:  
   ![hello](https://cdn.discordapp.com/attachments/563268281046269954/626360019494895616/unknown.png)  
   copy the following address which for this example will be "0x3c"
3. We now have to install the following npm packages:
   ```
   npm install i2c-bus
   npm install oled-i2c-bus
   npm install oled-font-5x7
   npm install systeminformation
   ```
   this will install the [i2c-bus](https://www.npmjs.com/package/i2c-bus), [oled-i2c-bus](https://www.npmjs.com/package/oled-i2c-bus), [oled-font-5x7](https://www.npmjs.com/package/oled-font-5x7) and [systeminformation](https://www.npmjs.com/package/systeminformation) packages
4. Now we get to start writing code!  
   Lets start with the following code:
   ```js
   var i2c = require('i2c-bus'),
       i2cBus = i2c.openSync(1),
       oled = require('oled-i2c-bus');

   var font = require('oled-font-5x7');
   const si = require('systeminformation');

   var opts = {
       width: 128,
       height: 64,
       address: 0x3C
   };

   var oled = new oled(i2cBus, opts);
   ```
   This will just give us the 'oled' object that we can use to communicate over the i2c bus. Remember to change "address" to what you got in step 2.  
   Now write the following code:
   ```js
   oled.turnOnDisplay();
   oled.clearDisplay();
   oled.setCursor(1, 1);
   oled.writeString(font, 1, 'Huskies are the best breed of dog', 1, true);
   ```
   This will turn on the display, clear it then set the cursor to the top left of the screen then write the text onto the screen.
   The paramters for WriteString are (font(obj), size(int), string(str), wrapping(bool))
5. Lets now give it a spin! Save your script and run the command:
   ```sh
   sudo node oled.js
   ```
   Remember to use sudo as the raspberry pi needs to access the IO pins  
   You should now see this on the screen:  
   ![hello](https://cdn.discordapp.com/attachments/563268281046269954/626362596391518208/unknown.png)  
   Nice
6. Lets now do something a little more interesting. We're now gonna display raspberry pi stats.  
   Add the following code:
   ```js
    async function UpdateLCDAsync() {
        var temps = await si.cpuTemperature();
        var speed = await si.cpuCurrentspeed();
        var load = await si.currentLoad();
        var time = await si.time();
        var mem = await si.mem();

        var mempercent = (mem.active/mem.total) * 100;
        var uptime = new Date(time.uptime*1000);

        var toprint = `UpTime: ${uptime.getDay()}d ${uptime.getHours()}h ${uptime.getMinutes()}m \n\n` +
                    `CPU Temp: ${temps.main.toString().substring(0,5)}C\n` +
                    `Clock Speed: ${speed.avg.toString().substring(0,6)}GHz\n` +
                    `Load: ${load.currentload.toString().substring(0,4)}%\n\n` + 
                    `Memory Used: ${mempercent.toString().substring(0,5)}%`;
        
        oled.clearDisplay();
        oled.setCursor(1, 1);
        oled.writeString(font, 1, toprint, 1, false);

    }

    setInterval(() => {
        UpdateLCDAsync();
    }, 1000);
    ```
    This will utilise the systeminformation package and grab data about our pi, it will then update the screen every second.

7. Save the script and run it! You should see something like this:  
   ![hello](https://cdn.discordapp.com/attachments/563268281046269954/626372518793707541/unknown.png)  
   Nice^2
8. Now the problem with this is that the script will end when the process ends. If only there was some way of running it... *forever*  
Of course there is! With the package called [*forever*](https://www.npmjs.com/package/forever)  
Install it with:  
   ```
   npm install forever
   ```
   Then foreverly process with:
   ```
   sudo forever start oled.js
   ```
   Remeber that we need sudo as the pi needs to access the IO pins.  
   Pro tip!  
   You can list and stop the processes later with:
   ```
   sudo forever list
   sudo forever stop [process id]
   ```
9. Enjoy! You now have a tiny oled screen to view your pi's stats with!  
Now go forth and conquer! with your tiny oled screen!
