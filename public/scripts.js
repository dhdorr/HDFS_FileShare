

function myFun(){
  console.log("DID I MAKE IT?: ");
  //API call to app.js to retrieve info from HDFS as JSON string
  fetch('http://localhost:8080/testme')
  .then((response) => response.json())
  .then((data) => console.log(data));
  
}

function converttoText(data) {
    for(i = 0, i < data.length, i++) {
        var filename = data[i].split("/").pop();
        let url = URL.createObjectURL(data[i]);
        download(url, filename);
        URL.revokeObjectURL(url);
    }
}

function download(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

