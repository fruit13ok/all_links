console.log("Sanity Check: JS is working!");
 
let backendRoute = new URL("http://localhost:8000/api");

let jsonResult = [];

const getScrape = async (backendRoute, formObj) => {
    let jr = [];
    try {
        const response = await fetch(backendRoute, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(formObj), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('response',response);
        let json = await response.json();
        // DB version I have to skip "_id" column
        json = json.map(key => { 
            delete key._id; 
            return key; 
        });
        console.log('json',json);
        let mList = document.getElementById('result-list');
        mList.innerHTML = '';
        let buttonPDF = document.createElement('button');
        buttonPDF.id = "btnpdf";
        buttonPDF.innerHTML = "Download PDF";
        buttonPDF.className = "btn btn-info mt-2 mb-2";
        let buttonCSV = document.createElement('button');
        buttonCSV.id = "btncsv";
        buttonCSV.innerHTML = "Download CSV";
        buttonCSV.className = "btn btn-info mt-2 mb-2";
        let pre = document.createElement('pre');
        pre.innerHTML = JSON.stringify(json, null, 4);
        let span = document.createElement('span');
        span.innerHTML = ' ';
        mList.appendChild(buttonPDF);
        mList.appendChild(span);
        mList.appendChild(buttonCSV);
        mList.appendChild(pre);
        jr = json;
    }catch (error) {
        console.log(error);
    }
    return jr;
};

// fetch to backend for all saved data from DB
const getAllSavedData = async (backendRoute) => {
    try {
        const response = await fetch(backendRoute);
        const json = await response.json();
        // DB version I have to skip "_id" column, DB has multiple documents, need to loop
        json.forEach(e => {
            e.resultlinks.map(k => {
                delete k._id;
                return k;
            });
        });
        console.log('json',json);
        let mList = document.getElementById('result-list');
        mList.innerHTML = '';
        let pre = document.createElement('pre');
        pre.innerHTML = JSON.stringify(json, null, 4);
        mList.appendChild(pre);
    }catch (error) {
        console.log(error);
    }
};

// make PDF with jspdf and jspdf-autotable
// Default export is a4 paper, portrait, using millimeters for units

// // basic text version
// // resource:
// // https://github.com/MrRio/jsPDF
// var doc = new jsPDF()
// urls.forEach((url, index) => {
//     doc.text(
//         20, 20 + (index * 10),
//         "url: " + url.url + "\t|\t" + "status: " + url.status
//     );
// });
// doc.save('test.pdf')

//////////////////////////////////////////////////////////////////////

// // basic table version
// // resource:
// // http://raw.githack.com/MrRio/jsPDF/master/
// //      choose example cell
// // http://raw.githack.com/MrRio/jsPDF/master/docs/module-cell.html#~table
// // https://github.com/MrRio/jsPDF/issues/2223

// // test data like JSON
// // var jsonResult = [
// //     {url: "www.google.com", status: 200}, 
// //     {url: "www.yahoo.com", status: 200}, 
// //     {url: "www.bing.com", status: 200}
// // ];
// // add "id" property to jsonResult, it is like table primary key
// // for (var i = 0; i < jsonResult.length; i++) {
// //     jsonResult[i].id = (i+1);
// // }
// // table header data, need the next function createHeaders()
// // var header = createHeaders(["id", "url", "status"]);
// var header = createHeaders(["url", "status"]);

// // this function is require createHeaders(),
// // documentation unclear, so just copy / paste and use it,
// // if don't want id then remove "id: keys[i]" here, 
// // and don't add "id" property to jsonResult 
// function createHeaders(keys) {
//     var result = [];
//     for (var i = 0; i < keys.length; i += 1) {
//         result.push({
//             // id: keys[i],
//             name: keys[i],
//             prompt: keys[i],
//             width: 65,
//             align: "center",
//             padding: 0
//         });
//     }
//     return result;
// }

// // invoke jsPDF, create table(), save() as PDF for download
// var doc = new jsPDF({ orientation: "landscape" })
// console.log("header: ",header);
// console.log("data: ",jsonResult);
// doc.table(1, 1, jsonResult, header)
// doc.save('test.pdf')

//////////////////////////////////////////////////////////////////////////

// better version use "jsPDF Autotable"
// to install I use CDN links
// source:
// https://github.com/simonbengtsson/jsPDF-AutoTable
// some config:
// https://stackoverflow.com/questions/38787437/different-width-for-each-columns-in-jspdf-autotable

// I break JSON into "header" and "value" for table
// use "columnStyles" and "cellWidth" to set first column size
const convertAndDownloadPDF = (jsonResult) => {
    console.log('jsonResult: ',jsonResult);
    let header = Object.keys(jsonResult[0]);
    let data = jsonResult.map(e=>Object.values(e));
    // body need spread operartor because is nested
    console.log("header: ",header);
    console.log("data: ",...data);
    // var doc = new jsPDF({ orientation: "landscape" })
    var doc = new jsPDF()
    doc.autoTable({
        head: [header],
        body: [...data],
        columnStyles: {0: {cellWidth: 150}}
    })
    doc.save('test.pdf')
};

// html attribute download file
// https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
const download = (filename, text) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// converter JSON to CSV return string
const convertAndDownloadCSV = (jsonResult) => {
    // incase of result is not an array of object, convert to json string than, to json object
    console.log('jsonResult: ',jsonResult);
    var objArray = JSON.stringify(jsonResult);
    console.log('objArray: ', objArray);
    // usually "array" is same as given "jsonResult"
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    console.log('array: ', array);
    let str = Object.keys(array[0]).join()+'\r\n';
    console.log('keys: ', str);
    for (let i = 0; i < array.length; i++) {
        console.log(i,': ', array[i]);
        let line = '';
        for (let index in array[i]) {
            if (line != '') {
            line += ',';
            }
            line += array[i][index];
            console.log(index,': ', line);
        }
            str += line + '\r\n';
    }
    download('test.csv', str);
};

// submit button clicked, pass form data into scrape function and invoke it
$(document).ready(function(){
    $("#button1").click(function(){
        let formArr = $("#form1").serializeArray();
        // convert form array of objects to an object of properties
        let formObj = formArr.reduce((map, obj) => {
            map[obj.name] = obj.value;
            return map;
        }, {});
        document.getElementById('result-list').innerHTML = 
        '<p style="color:blue;font-size:46px;"><strong> ... Find related searchs please wait ... </strong></p>';
        console.log('formObj',formObj);

        // async function have to be call inside async function, so use a iife empty function here
        (async () => {
            jsonResult = await getScrape(backendRoute, formObj)
        })();
    });

    // need start with static element for event binding on dynamically created elements
    $("#result-list").on("click", "#btnpdf", function(){
        convertAndDownloadPDF(jsonResult);
    });

    // onclick convert JSON to CSV and download it
    $("#result-list").on("click", "#btncsv", function(){
        convertAndDownloadCSV(jsonResult);
    });
});

// Show Saved Results button clicked, launch GET request to backend to get all saved data
$(document).ready(function(){
    $("#button2").click(function(){
        document.getElementById('result-list').innerHTML = 
        '<p style="color:blue;font-size:46px;"><strong> ... Getting all saved data from database please wait ... </strong></p>';

        // async function have to be call inside async function, so use a iife empty function here
        (async () => {
            jsonResult = await getAllSavedData(backendRoute)
        })();
    });

    
});