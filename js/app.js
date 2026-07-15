// =========================
// File Upload Elements
// =========================

const dischargeFileUpload =
    document.getElementById("dischargeFileUpload");

const selectedFileName =
    document.getElementById("selectedFileName");


// =========================
// Display Selected File Name
// =========================

dischargeFileUpload.addEventListener("change", () => {

    const uploadedFiles =
        dischargeFileUpload.files;

    if (uploadedFiles.length > 0) {

        selectedFileName.textContent =
            uploadedFiles[0].name;

    }

});