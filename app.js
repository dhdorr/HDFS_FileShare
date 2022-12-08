var http = require('http');
const https = require('https');
var formidable = require('formidable');
var fs = require('fs');
const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
var fileName = './index.html';

const subProcess = require('child_process');
const { spawn } = require('child_process');
const { dirname } = require('path');
const download = require('download');

var hdfsFilePaths = [];

app.listen(8080, function(req, res) {
  console.log("server started at port 8080");
});

app.get('/', function(req, res) {
  res.sendFile(__dirname+'/index.html');
});

app.post('/fileupload', function(req, res) {
  console.log("uploading...");
      var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.filepath;
        var newpath = `${__dirname}/assets/` + files.filetoupload.originalFilename;
        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          //res.write('File uploaded and moved!');
          const child = spawn('hdfs dfs', ['-put', newpath, '/user'], {shell: true});
          //const child = spawn('ping', ['google.com'], {shell: true});
          //const child = spawn('hadoop fs, ' [' -put', '/local-file-path', '/hdfs-file-path'], {shell: true});
          child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
  
          child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });
  
          child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            res.end();
          });
  
        });
    });
});

app.get('/filedownload', function(req,res) {
  console.log("retrieving file...");
  //Retrieving the file from the HDFS and storing them in a temp folder for downloading to a browser.
  //I am not sure if the hdfs get function is able to download directly to the remote browser.
  var myPath = `${__dirname}` + '\\temp';
  const child2 = spawn('hdfs dfs', ['-get', '/user/Tribes12.png', myPath], {shell: true});

  console.log("section 2");

  child2.stdout.on('data', (data) => {
    console.log("section 3");
  console.log(`stdout: ${data}`);
  });

  console.log("section 4");

  child2.stderr.on('data', (data) => {
    console.log("section 5");
  console.error(`stderr: ${data}`);
  });

  console.log("section 6");

  child2.on('close', (code) => {
    console.log("section 7");
    console.log(`child process exited with code ${code}`);
    res.end();
  });

  console.log("section 8");

  //Download to remote user's browser
  res.download(`${__dirname}/temp/Tribes12.png`, function(err) {
    if(err){
      console.log(err);
    }
  });

});

app.get('/testme', function(req, res) {
  const child3 = spawn('hdfs dfs', ['-ls', '/user'], {shell: true});
  var lsString = "";
  child3.stdout.on('data', (data) => {
    lsString += data;
    console.log(`stdout: ${data}`);
  });

  child3.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child3.on('close', (code) => {
    displayStoredFiles(lsString);
    
    console.log(`child process exited with code ${code}`);
    res.end();
  });


});

//displays all file paths and sets a global array of file paths
function displayStoredFiles(resString) {
  var myArr = resString.replace( /\n/g, " " ).split( " " );//.split(/\r?\n/);
  for(var i = 0; i < myArr.length - 1; i++){
    if (myArr[i] == "" || myArr[i] == " " || myArr[i] == "  "){
      myArr.splice(i, 1);
    }
  }

  //file path for HDFS files
  var myCopyArr = [];
  for(var i = 0; i < myArr.length - 1; i++){
    if (myArr[i].includes("/user/")){
      myCopyArr.push(myArr[i]);
    }
  }

  hdfsFilePaths = myCopyArr;
  console.log("HDFS files total: " + hdfsFilePaths.length);
  
  //display file locations only
  for(var s = 0; s < myCopyArr.length; s++){
    console.log("STRING: " + myCopyArr[s]);
  }
}