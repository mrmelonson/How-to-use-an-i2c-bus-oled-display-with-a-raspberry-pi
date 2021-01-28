# How to use i2c OLED display to display Pi-hole stats

## Final result

![result](https://i.imgur.com/VOCO5P0.jpg)

## prerequisites
- A 128x64 I2C OLED display [This is the one i used](https://www.aliexpress.com/item/4001025304341.html?spm=a2g0o.search0302.0.0.4cf15445ldbinu&algo_pvid=be9211b6-6acd-45e7-ada1-71846c5b0063&algo_expid=be9211b6-6acd-45e7-ada1-71846c5b0063-0&btsid=0b0a555416118262836784031e3f49&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_)
- Node JS (v10.19.0) with npm (v6.14.4)
- Raspberry pi (with sudo access)
- Pi-hole set up and configured

## Steps

1. Wire up your screen like so: ![hello](https://www.raspberrypi-spy.co.uk/wp-content/uploads/2018/02/i2c_oled_128x64_raspberry_pi_wiring.png)

2. One this is done SSH into your raspberry pi and install the i2c-tools package and run this command: 
   ```
   sudo apt install i2c-tools
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
   npm install axios
   ```
   this will install the [i2c-bus](https://www.npmjs.com/package/i2c-bus), [oled-i2c-bus](https://www.npmjs.com/package/oled-i2c-bus), [oled-font-5x7](https://www.npmjs.com/package/oled-font-5x7) and [Axios](https://www.npmjs.com/package/axios) packages
4. Now we get to start writing code!  
   Lets start with the following code:
   ```js
   var i2c = require('i2c-bus'),
       i2cBus = i2c.openSync(1),
       oled = require('oled-i2c-bus');

   var font = require('oled-font-5x7');

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
6. Let's now do something a little more interesting. We're now gonna display the Pi-hole stats now.  
   Lets make a new file and start from scratch. <br>
   Add the code below (or look at the file included in the repo):
   ```js
    var i2c = require('i2c-bus'),
    i2cBus = i2c.openSync(1),
    oled = require('oled-i2c-bus');

   const font = require('oled-font-5x7'),
      axios = require("axios");

   var opts = {
      width: 128,
      height: 64,
      address: 0x3C
   };

   var api_url = 'http://localhost/admin/api.php';

   var oled = new oled(i2cBus, opts);

   async function UpdateLCDAsync() {

      try {
         var res = await axios.get(api_url);
         var piholedata = res.data;
      } catch (err) {
         console.error(err);
      }


      var toprint =  `DNS Queries: ${piholedata.dns_queries_today}\n` +
                  `DNS blocked: ${piholedata.ads_blocked_today}(${Math.round(piholedata.ads_percentage_today)}%)\n` +
                  `Blocklist: ${piholedata.domains_being_blocked}`;
      
      oled.clearDisplay();
      oled.setCursor(1, 1);
      oled.writeString(font, 1, toprint, 1, false);

   }

   setInterval(() => {
      UpdateLCDAsync();
   }, 5000);
    ```
   Lets do a quick rundown of what we just wrote. <br>
   Basically we made an async function that executes every 5 seconds that sends a get request to the api to get a JSON responce, then we can put that in the `piholedata` object and get the data from there. <br>
   (The responce looks sorta like this btw): <br>
   ![Responce](https://i.imgur.com/g8izbZf.png)

7. Save the script and run it! You should see something like this:  
   ![hello](https://i.imgur.com/VOCO5P0.jpg)  
   Nice^2
8. Now the problem with this is that the script will end when the process ends. If only there was some way of running it... *forever*  
Of course there is! With the package called [*forever*](https://www.npmjs.com/package/forever)  
Install it with:  
   ```
   npm install forever
   ```
   Then foreverly process with:
   ```
   sudo forever start oled_script.js
   ```
   Remeber that we need sudo as the pi needs to access the IO pins.  
   Pro tip!  
   You can list and stop the processes later with:
   ```
   sudo forever list
   sudo forever stop [process id]
   ```
9. Enjoy! You now have a tiny oled screen to view your Pi-hole stats with!  
Now go forth and conquer! with your tiny oled screen!
