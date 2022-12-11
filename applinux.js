var http = require('http');
//const https = require('https');
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
const { exit } = require('process');

var hdfsFilePaths = [];

//Scripts.js is kept in the public dir, it is used for the web interface.
app.use(express.static(path.join(__dirname, 'public')));

//LOAD INDEX PAGE
app.get('/', function(req, res) {
  //Makes the user directory for HDFS in case if it doesn't exist
  const makeDirectory = spawn('/usr/local/hadoop/hadoop-3.3.4/bin/./hdfs dfs', ['-mkdir', 'user'], {shell: true});

  makeDirectory.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

    //Display Index
    res.sendFile(__dirname+'/index.html');
  });
});

// UPLOAD FILES TO HDFS
app.post('/fileupload', function(req, res) {
  console.log("uploading...");
  var form = new formidable.IncomingForm();
  //Parse file and give it a temp file path on the web server
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.filepath;
    console.log("dirname: " + __dirname);
  var newpath = __dirname + "/assets/" + `${files.filetoupload.originalFilename}`;
    console.log("newpath: " + newpath);
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      //Make a shell command to the HDFS to store the file
      const child = spawn('/usr/local/hadoop/hadoop-3.3.4/bin/./hdfs dfs', ['-put', newpath, 'user'], {shell: true});

      child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
      //When the file is done uploading to the HDFS, exit this function
      child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.end();
      });

    });
  });
});

//DOWNLOAD FILES FROM HDFS
app.get('/filedownload/:id', function(req,res) {
  console.log("retrieving file..." + `${req.params.id}`);
  //Retrieving the file from the HDFS and storing them in a temp folder for downloading to a browser.
  var myPath = __dirname + '/temp';
  //Make a shell command to the HDFS to download the file onto the web server
  const child2 = spawn('/usr/local/hadoop/hadoop-3.3.4/bin/./hdfs dfs', ['-get', `user/${req.params.id}`, myPath], {shell: true});

  child2.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  });

  child2.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
  });
  //When the file is successfully downloaded onto the web server, use Express to serve it to the remote user
  child2.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    
    res.download(`${__dirname}/temp/${req.params.id}`, function(err) {
      if(err){
        console.log(err);
      }
    });
  });

});

//GET META DATA OF ALL FILES STORED IN THE HDFS
app.get('/retrieveFiles', function(req, res) {
  //Wait for HDFS to return an array of file data, then send back that array as JSON
  getStoredFiles(function(){
    res.send(JSON.stringify(hdfsFilePaths));
    //res.end();
  });
  
});

//Retrieves the files stored in HDFS
function getStoredFiles(_callback) {
  //Make a shell command to the HDFS to list the files in /user
  const child3 = spawn('/usr/local/hadoop/hadoop-3.3.4/bin/./hdfs dfs', ['-ls', 'user'], {shell: true});

  var lsString = "";

  //Build lsString as HDFS sends its data
  child3.stdout.on('data', (data) => {
    lsString += data;
    console.log(`stdout: ${data}`);
  });

  child3.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child3.on('close', (code) => {

    updateStoredFilesArray(lsString);
    
    console.log(`child process exited with code ${code}`);
    _callback();
  });
}

//displays all file paths and sets a global array of file paths
function updateStoredFilesArray(resString) {
  //parse the string and remove new lines, etc.
  //split string into array by white space
  var myArr = resString.replace( /\r?\n/g, " " ).split( " " );
    console.log("resstring: " + resString);
  for(var i = 0; i < myArr.length - 1; i++){
    if (myArr[i] == "" || myArr[i] == " " || myArr[i] == "  "){
      myArr.splice(i, 1);
    }
  }
  console.log("myarr: " + myArr.length);

  //Copy only the strings that are file names to a new array
  var myCopyArr = [];
  for(var i = 0; i < myArr.length - 1; i++){
    if (myArr[i].includes("user/")){
      myCopyArr.push(myArr[i]);
    }
  }
  //Update global variable to be sent back to user
  hdfsFilePaths = myCopyArr;

  console.log("HDFS files total: " + hdfsFilePaths.length);

  //display file locations only in console
  for(var s = 0; s < myCopyArr.length; s++){
    console.log("STRING: " + myCopyArr[s]);
  }
}

app.listen(8080, function(req, res) {
  console.log("server started at port 8080");
});

