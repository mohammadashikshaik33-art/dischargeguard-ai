const fileUpload = document.getElementById("fileUpload");
const fileName = document.getElementById("fileName");

fileUpload.addEventListener("change", () => {

    if(fileUpload.files.length > 0){

        fileName.textContent =
            fileUpload.files[0].name;

    }

});