// REQUIREMENTS

// native
const path = require('path');

// 3rd party
const express = require('express');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");

// access to .env file variables use process.env.VARIABLE_NAME
require('dotenv/config');

// access model
const Scrapelink = require('../models/Scrapelink');

// local
const app = express();
const port = process.env.PORT || 8000;

// MIDDLEWARE
app.use(express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(__dirname + '../node_modules/bootstrap/dist/css'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow cors to access this backend
app.use( (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// test connect to DB
// mongoose.connect('mongodb://fruit13ok:ly13OK@ds015889.mlab.com:15889/scrapedb',
mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true }, 
    () => {console.log('connected to DB');}
);

// INIT SERVER
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

// helper functions

// check URL status code
let checkUrl = async (url) => {
    try {
        const response = await fetch(url);
        const status = await response.status;
        return status.toString();
    }catch (error) {
        console.log(error);
        return error;
    }
};

// return result array of objects
let forLoop = async (resultArr) => {
    let resultArray = [];
    for (let i = 0; i < resultArr.length; i++) {
        let curUrl = resultArr[i];
        let curStatus = await checkUrl(curUrl);
        resultArray.push({url: curUrl, status: curStatus});
    }
    return resultArray;
}

let scrape = async (targetPage) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--blink-settings=imagesEnabled=false']});
    const page = await browser.newPage();
    if(targetPage.startsWith('https://www.')){
        console.log('https://www.');
    }else if(targetPage.startsWith('http://www.')){
        console.log('http://www.');
        targetPage='https://www.'+targetPage.slice(11);
    }else if(targetPage.startsWith('www.')){
        console.log('www.');
        targetPage='https://'+targetPage;
    }else{
        targetPage='https://www.'+targetPage;
    }
    // await page.goto(targetPage);
    await page.goto(targetPage, {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    //either of these 3 ways return all links
    const hrefs = await page.$$eval('a', as => as.map(a => a.href));
    // const hrefs = await page.evaluate(() => {
    //     return Array.from(document.getElementsByTagName('a'), a => a.href);
    // });
    // const hrefs = await Promise.all((await page.$$('a')).map(async a => {
    //     return await (await a.getProperty('href')).jsonValue();
    // }));
    // console.log('hrefs: ',hrefs.length, hrefs);
    return hrefs;
};

// ROUTES
// root
app.get('/', function (req, res) {
    res.send('hello world');
});

// post, get form data from frontend
app.post('/api', async function (req, res) {
    req.setTimeout(0);
    let targetPage = req.body.targetPage || "";
    await scrape(targetPage)
    .then((resultArr)=>{
        forLoop(resultArr)
        .then(resultArray => {
            // console.log('targetPage: ', targetPage);
            // console.log('resultArray: ', resultArray);
            const scrapelink = new Scrapelink({
                givenlink: targetPage,
                resultlinks: resultArray
            });
            scrapelink.save()
            .then(data => {
                res.send(data.resultlinks);
            })
            .catch(err => {
                res.send("DB ERROR: ", err);
            });
        })
    }).catch(() => {});    
});

// GET route get all documents from Scrapelink collection,
// use find() to get all,
// response back JSON
app.get('/api', async function (req, res) {
    try {
        const allSavedData = await Scrapelink.find();
        res.send(allSavedData);
    } catch (err) {
        res.send("DB ERROR: ", err);
    }
});