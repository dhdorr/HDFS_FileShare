

function myFun(){
  console.log("DID I MAKE IT?: ");
  //API call to app.js to retrieve info from HDFS as JSON string
  fetch('http://localhost:8080/testme')
  .then((response) => response.json())
  .then((data) => console.log(data));
}
