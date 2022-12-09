

function myFun(){
  console.log("DID I MAKE IT?: ");
  fetch('http://localhost:8080/testme')
  .then((response) => response.json())
  .then((data) => console.log(data));
}
