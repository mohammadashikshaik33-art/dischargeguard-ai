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
dischargeFileUpload.addEventListener("change", async () => {

    const uploadedFiles =
        dischargeFileUpload.files;

    if (uploadedFiles.length === 0) {
        return;
    }

    const selectedFile =
        uploadedFiles[0];

    selectedFileName.textContent =
        selectedFile.name;

    if (!selectedFile.type.startsWith("image/")) {
        return;
    }

    document.getElementById("summaryInput").value =
        "Reading image...";

    const result =
        await Tesseract.recognize(
            selectedFile,
            "eng"
        );

    document.getElementById("summaryInput").value =
        result.data.text;

});


// =========================
// Analyze Button
// =========================
const analyzeCareButton =
    document.getElementById("analyzeCareButton");

analyzeCareButton.addEventListener("click", () => {

    analyzeDischargeSummary();

});