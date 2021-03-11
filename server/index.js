// REQUIREMENTS

// native
const path = require('path');

// 3rd party
const express = require('express');
// const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");
const AbortController = require('abort-controller');
const controller = new AbortController();

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
// mongoose.connect(process.env.DB_CONNECTION,
//     { useNewUrlParser: true, useUnifiedTopology: true }, 
//     () => {console.log('connected to DB');}
// );

// INIT SERVER
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

// helper functions

// convert json / array of objects to array of arrays,
// first inner array are keys, following inner arrays are values
const convertNestArrResult = (arrObjs) => {
    let header = Object.keys(arrObjs[0]);
    let nestArrResult = arrObjs.map(obj => {
      let nestArr = [];
      for (const key in obj) {
        let value = obj[key];
        nestArr.push(value);
      }
      return nestArr;
    });
    nestArrResult.unshift(header);
    return nestArrResult;
};

let my_id = '';
function updateid(newID){
    console.log('old id: ', my_id);
    my_id = newID;
    console.log('new id: ', my_id);
}

////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// below are for google sheet api /////////////////////////////
////////// since google upgrade api frequently, I keep it as a block of code ///////////
////////////////////////////////////////////////////////////////////////////////////////
// const fs = require('fs');
// const readline = require('readline');
// const {google} = require('googleapis');

// // If modifying these scopes, delete token.json.
// // const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// const TOKEN_PATH = 'server/token.json';

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(resultArr, credentials, callback) {
//     let uNewGSID;
//     const {client_secret, client_id, redirect_uris} = credentials.web;
//     const oAuth2Client = new google.auth.OAuth2(
//         client_id, client_secret, redirect_uris[0]);
  
//     // Check if we have previously stored a token.
//     fs.readFile(TOKEN_PATH, (err, token) => {
//       if (err) return getNewToken(oAuth2Client, callback);
//       oAuth2Client.setCredentials(JSON.parse(token));
//       uNewGSID = callback(resultArr, oAuth2Client);
//       console.log('ID in authorize:', uNewGSID);
//     });
//     return uNewGSID;
// }

// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback for the authorized client.
//  */
// function getNewToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error while trying to retrieve access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

// //
// function createAndUpdateSheet(resArr, auth){
//     // console.log('auth: ', auth);
//     // console.log('resArr: ', resArr);
//     const sheets = google.sheets({version: 'v4', auth});
//     const resource = {
//         properties: {
//           title: "newGSheet"+new Date().getTime(),
//         },
//     };
//     let mygs = sheets.spreadsheets.create(
//         {
//             resource,
//         }, 
//         (err, spreadsheet) => {
//             let newGSID;
//             if (err) {
//                 console.log(err);
//             } else {
//                 newGSID = spreadsheet.data.spreadsheetId;
//                 console.log('ID in createAndUpdateSheet1:', newGSID);
//                 updateid(newGSID);
//                 sheets.spreadsheets.values.update(
//                     {
//                         spreadsheetId: newGSID,
//                         range: 'Sheet1!A1',
//                         valueInputOption: "USER_ENTERED",
//                         resource: {
//                             // values: [
//                             //     ["URL", "Status", "ID"], 
//                             //     ["google.com", "200", "0"], 
//                             //     ["yahoo.com", "200", "1"],
//                             //     ["bing.com", "200", "2"]
//                             // ]
//                             values: convertNestArrResult(resArr)
//                         }
//                     }, 
//                     (err, res) => {
//                         if (err) return console.log('The API returned an error: ' + err);
//                         // console.log('res: ',res);
//                     }
//                 );
//             }
//             // return newGSID;
//         }
//     );
//     // return newGSID;
// }
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// above are for google sheet api /////////////////////////////
////////// since google upgrade api frequently, I keep it as a block of code ///////////
////////////////////////////////////////////////////////////////////////////////////////

// // check URL status code
// let checkUrl = async (url) => {
//     try {
//         const response = await fetch(url);
//         const status = await response.status;
//         return status.toString();
//     }catch (error) {
//         console.log(error);
//         return error;
//     }
// };

// // return result array of objects
// let forLoop = async (resultArr) => {
//     let resultArray = [];
//     for (let i = 0; i < resultArr.length; i++) {
//         let curUrl = resultArr[i];
//         let curStatus = await checkUrl(curUrl);
//         resultArray.push({url: curUrl, status: curStatus});
//     }
//     return resultArray;
// }

// return single promise result as array of objects
const urlLoop = async (urls) => {
    // wait for non-responsive url for at least 1 second, 
    // less than that could mistreat good url
    let waitTime = 1000;
    setTimeout(() => { controller.abort(); }, waitTime);
    // check URL status code return array of fetches promise
    let checkUrl = urls.map(url => fetch(url, {
        signal: controller.signal
      })
      .then(function(response) {
        return {url: url, status: response.status.toString()};
      })
      .catch(function(error) {
        if (error.name === 'AbortError') {
          console.log('Got AbortError', url)
          return {url: url, status: "408 Request Timeout "+waitTime+"ms"};
        } else {
          throw error;
        }
      })
    );
    // loop over array of all promises resolves them, 
    // return single promise as array result
    let results = await Promise.all(checkUrl);
    return results;
};

let scrape = async (targetPage) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--blink-settings=imagesEnabled=false']});
    // const browser = await puppeteer.launch({headless: false, ignoreHTTPSErrors: true, slowMo: 100});
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
    // var navigationPromise =  page.waitForNavigation();
    // await page.goto("symphysismarketing.com/page-sitemap.xml", {
    // await page.goto("https://www.google.com", {
        waitUntil: 'networkidle2',
        timeout: 30000
    });
    // await navigationPromise;
    //either of these 3 ways return all links
    // const hrefs = await page.$$eval('a', as => as.map(a => a.href));
    // const hrefs = await page.evaluate(() => {
    //     return Array.from(document.getElementsByTagName('a'), a => a.href);
    // });
    // const hrefs = await Promise.all((await page.$$('a')).map(async a => {
    //     return await (await a.getProperty('href')).jsonValue();
    // }));

    // await page.waitForTimeout(3000);
    // await page.waitForSelector('a');
    let hrefs = await page.evaluate((selector) => {
        let els = Array.from(document.querySelectorAll(selector));
        return els ? els.map(el => el.href) : "hrefs error";
    }, 'a');

    console.log('hrefs: ',hrefs.length, hrefs);
    await page.close();
    await browser.close();
    console.log("done scraping");
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
        // console.log('resultArr: ', resultArr, resultArr.length);
        // forLoop(resultArr)   // old version
        urlLoop(resultArr)      // new version, take care bad url
        .then(resultArray => {
            // console.log('targetPage: ', targetPage);
            console.log('resultArray: ', resultArray);
            
            ///////////////////////////// below is GS api thing ////////////////////////////
            // check if google sheet api credentials ok, then create a sheet
            // fs.readFile('server/credentials.json', async (err, content) => {
            //     if (err) return console.log('Error loading client secret file:', err);
            //     // Authorize a client with credentials, then call the Google Sheets API.
            //     await authorize(resultArray, JSON.parse(content), createAndUpdateSheet);
            //     // console.log('content: ', JSON.parse(content));
                
                
            // });
            ///////////////////////////// above is GS api thing ////////////////////////////

            // DB
            // const scrapelink = new Scrapelink({
            //     givenlink: targetPage,
            //     resultlinks: resultArray
            // });
            // scrapelink.save()
            // .then(data => {
            //     res.send(data.resultlinks);
            // })
            // .catch(err => {
            //     res.send("DB ERROR: ", err);
            // });
            // old, no GS no DB
            res.send(resultArray);
        })
    }).catch(() => {});    
});

// GET route get all documents from Scrapelink collection,
// use find() to get all,
// response back JSON
// app.get('/api', async function (req, res) {
//     try {
//         const allSavedData = await Scrapelink.find();
//         res.send(allSavedData);
//     } catch (err) {
//         res.send("DB ERROR: ", err);
//     }
// });
