// =========================
// File Upload Elements
// =========================

const dischargeFileUpload =
    document.getElementById("dischargeFileUpload");

const selectedFileName =
    document.getElementById("selectedFileName");

const summaryInput =
    document.getElementById("summaryInput");

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


// =========================
// File Upload Processing
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

    
    


    // =========================
    // PDF Processing
    // =========================

    if (
        selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {

        console.log("PDF detected");

        summaryInput.value =
            "Reading PDF...";

        try {

            const fileReader =
                new FileReader();

            fileReader.onload = async function () {

                try {

                    const typedArray =
                        new Uint8Array(this.result);

                    const pdfDocument =
                        await pdfjsLib.getDocument({
                            data: typedArray
                        }).promise;

                    let extractedText = "";

                    for (
                        let pageNumber = 1;
                        pageNumber <= pdfDocument.numPages;
                        pageNumber++
                    ) {

                        const page =
                            await pdfDocument.getPage(pageNumber);

                        const textContent =
                            await page.getTextContent();

                        extractedText +=
                            textContent.items
                                .map(item => item.str)
                                .join(" ");

                        extractedText += "\n\n";
                    }

                    
                    console.log(extractedText);

                    
                    summaryInput.value =
                        extractedText;

                } catch (error) {

                    console.error(
                        "PDF Extraction Error:",
                        error
                    );

                    summaryInput.value =
                        "Unable to read PDF.";


                }

            };

            fileReader.readAsArrayBuffer(selectedFile);

        } catch (error) {

            console.error(
                "PDF Reader Error:",
                error
            );

            summaryInput.value =
                "Unable to read PDF.";

        }

        return;
    }


    // =========================
    // Image OCR Processing
    // =========================

    if (selectedFile.type.startsWith("image/")) {

        console.log("Image detected");

        summaryInput.value =
            "Reading image...";

        try {

            const result =
                await Tesseract.recognize(
                    selectedFile,
                    "eng"
                );

            summaryInput.value =
                result.data.text;

        } catch (error) {

            console.error(
                "OCR Error:",
                error
            );

            summaryInput.value =
                "Unable to read image.";

        }

        return;
    }

});


// =========================
// Analyze Button
// =========================

const analyzeCareButton =
    document.getElementById("analyzeCareButton");

analyzeCareButton.addEventListener("click", () => {

    analyzeDischargeSummary();

});