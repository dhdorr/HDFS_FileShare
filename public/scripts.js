
function getFiles(apiEndPoint="retrieveFiles"){

  //API call to app.js to retrieve info from HDFS as JSON array
  fetch(`http://34.212.69.186:8080/${apiEndPoint}`)//localhost
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    //When data comes back from the API, create a new form and button for every item in the JSON array
    for(var i = 0; i < data.length; i++){
      const divContent = document.createElement("form");
      const fileBtn = document.createElement("button");

      //Trim file path to just the file name.
      var tempStr = data[i].split('/user/');

      //Set attributes so each button can download its respective file
      divContent.setAttribute('action', `filedownload/${tempStr[1]}`);
      divContent.setAttribute('method', 'get');
      fileBtn.setAttribute('type', "submit");
      fileBtn.setAttribute('class', "btn");
      fileBtn.textContent = tempStr[1];

      //Append content to the DOM
      divContent.appendChild(fileBtn);
      document.body.appendChild(divContent);
    }

  });
}

//Only enable submit button when a file is chosen
function checkForImg() {
  var empty = document.forms["form1"]["filetoupload"].value;

  if (empty == '') {
    console.log("no file")
    return false;
  } else {
    console.log("good, file")
    return true;
  }
}

