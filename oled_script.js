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

var api_url = 'http://localhost/admin/api.php'

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