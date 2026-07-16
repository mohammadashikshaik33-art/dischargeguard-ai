// ===============================
// File Upload Setup
// ===============================

const dischargeFileUpload = document.getElementById("dischargeFileUpload");
const selectedFileName = document.getElementById("selectedFileName");
const summaryInput = document.getElementById("summaryInput");
const analyzeCareButton = document.getElementById("analyzeCareButton");

let isProcessingFile = false;

const PROCESSING_PREFIXES = ["Reading", "Scanned PDF", "Reading page", "Reading image", "OCR", "OCR page"];

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ===============================
// Loading State
// ===============================

function setAnalyzeLoading(isLoading, customText) {
    analyzeCareButton.disabled = isLoading;
    if (isLoading) {
        analyzeCareButton.textContent = customText || "Analyzing...";
        analyzeCareButton.classList.add("loading");
    } else {
        analyzeCareButton.textContent = "Analyze Instructions";
        analyzeCareButton.classList.remove("loading");
    }
}

function isStillProcessing(text) {
    return PROCESSING_PREFIXES.some((prefix) => text.startsWith(prefix));
}

// ===============================
// File Upload Handler
// ===============================

dischargeFileUpload.addEventListener("change", async function () {
    if (isProcessingFile) {
        alert("Please wait for the current operation to finish.");
        return;
    }

    const file = dischargeFileUpload.files[0];

    if (!file) {
        return;
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        selectedFileName.textContent = file.name;
        // Clear value to allow consecutive uploads of the same file
        dischargeFileUpload.value = "";
        await readPDF(file);
        return;
    }

    if (file.type.startsWith("image/")) {
        selectedFileName.textContent = file.name;
        // Clear value to allow consecutive uploads of the same file
        dischargeFileUpload.value = "";
        await readImage(file);
        return;
    }

    alert("Please upload a PDF or image file.");
    selectedFileName.textContent = "No file selected";
    dischargeFileUpload.value = "";
});

// ===============================
// PDF Reading Function
// ===============================

async function readPDF(file) {
    isProcessingFile = true;
    summaryInput.value = "Reading PDF...";
    setAnalyzeLoading(true, "Reading PDF...");

    try {
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        let extractedText = "";

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            summaryInput.value = `Reading PDF page ${pageNumber}/${pdf.numPages}...`;
            setAnalyzeLoading(true, `Reading PDF page ${pageNumber}/${pdf.numPages}...`);

            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            extractedText += pageText + "\n";
        }

        if (extractedText.trim().length > 20) {
            summaryInput.value = extractedText;
            setAnalyzeLoading(false);
            isProcessingFile = false;
            return;
        }

        summaryInput.value = "Scanned PDF detected. Running OCR...";
        setAnalyzeLoading(true, "Scanned PDF detected. Running OCR...");
        summaryInput.value = await convertPDFToOCR(pdf);
        setAnalyzeLoading(false);
        isProcessingFile = false;
    } catch (error) {
        console.error("PDF Error:", error);
        summaryInput.value = "Unable to read PDF.";
        setAnalyzeLoading(false);
        isProcessingFile = false;
    }
}

// ===============================
// Convert Scanned PDF Pages To OCR
// ===============================

async function convertPDFToOCR(pdf) {
    let completeText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        summaryInput.value = `OCR page ${pageNumber}/${pdf.numPages}...`;
        setAnalyzeLoading(true, `OCR page ${pageNumber}/${pdf.numPages}...`);

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const imageData = canvas.toDataURL("image/png");

        const result = await Tesseract.recognize(imageData, "eng", {
            logger: function (info) {
                if (info.status === "recognizing text") {
                    const pct = Math.round((info.progress || 0) * 100);
                    summaryInput.value = `OCR page ${pageNumber}/${pdf.numPages} (${pct}%)...`;
                    setAnalyzeLoading(true, `OCR page ${pageNumber}/${pdf.numPages} (${pct}%)...`);
                }
            }
        });

        completeText += result.data.text + "\n\n";
    }

    return completeText;
}

// ===============================
// Image OCR Function
// ===============================

async function readImage(file) {
    isProcessingFile = true;
    summaryInput.value = "Reading image (0%)...";
    setAnalyzeLoading(true, "Reading image (0%)...");

    try {
        const ocrResult = await Tesseract.recognize(file, "eng", {
            logger: function (info) {
                if (info.status === "recognizing text") {
                    const pct = Math.round((info.progress || 0) * 100);
                    summaryInput.value = `Reading image (${pct}%)...`;
                    setAnalyzeLoading(true, `Reading image (${pct}%)...`);
                }
            }
        });

        summaryInput.value = ocrResult.data.text;
        setAnalyzeLoading(false);
        isProcessingFile = false;
    } catch (error) {
        console.error("OCR Error:", error);
        summaryInput.value = "Unable to read image.";
        setAnalyzeLoading(false);
        isProcessingFile = false;
    }
}

// ===============================
// Analyze Button
// ===============================

analyzeCareButton.addEventListener("click", async function () {
    const text = summaryInput.value.trim();

    if (!text || text.length < APP_CONFIG.minTextLength) {
        alert("Please upload or paste a discharge summary first.");
        return;
    }

    const ERROR_TEXTS = ["Unable to read PDF.", "Unable to read image.", "Please upload a PDF or image file."];
    if (ERROR_TEXTS.includes(text)) {
        alert("Please upload or paste a valid discharge summary first.");
        return;
    }

    if (isStillProcessing(text)) {
        alert("Please wait for document processing to finish.");
        return;
    }

    if (text.length > APP_CONFIG.maxTextLength) {
        alert(`Summary is too long. Maximum ${APP_CONFIG.maxTextLength} characters.`);
        return;
    }

    setAnalyzeLoading(true);
    setResultCardsLoading();

    const result = await analyzeWithAI(text);

    if (!result.success) {
        setResultCardsError(result.error);
    } else {
        updateResultCards(result);
    }

    setAnalyzeLoading(false);
});
