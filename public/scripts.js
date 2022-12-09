
function myFun(apiEndPoint="testme"){
  console.log("DID I MAKE IT?: ");
  //API call to app.js to retrieve info from HDFS as JSON string
  fetch(`http://localhost:8080/${apiEndPoint}`)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    for(var i = 0; i < data.length; i++){
      //var temp = data[i].split('/user/');
      const divContent = document.createElement("form");
      const aContent = document.createElement("button");

      var tempStr = data[i].split('/user/');
      //var pathStr = "testFun(" + tempStr + ")";
      //console.log("testing:: " + `${tempStr[1]}`);
      divContent.setAttribute('action', `filedownload/${tempStr[1]}`);
      divContent.setAttribute('method', 'get');
      //aContent.setAttribute('onclick', pathStr);
      aContent.setAttribute('type', "submit");
      aContent.textContent = data[i];
      divContent.appendChild(aContent);

      document.body.appendChild(divContent);
    }

  });
}


async function testFun(myFile){
  console.log("here to test..." + `${myFile}`);
  //API call to app.js to download file from HDFS
  fetch('http://localhost:8080/filedownload')
  .then((response) => response.blob())
  .then((data) => {
    console.log(data);

  });
}