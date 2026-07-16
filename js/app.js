// ===============================
// File Upload Setup
// ===============================

const dischargeFileUpload =
    document.getElementById("dischargeFileUpload");

const selectedFileName =
    document.getElementById("selectedFileName");

const summaryInput =
    document.getElementById("summaryInput");


// PDF worker setup

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";



// ===============================
// File Upload Handler
// ===============================

dischargeFileUpload.addEventListener(
"change",
async function () {


    const file =
    dischargeFileUpload.files[0];


    if (!file) {
        return;
    }


    selectedFileName.textContent =
    file.name;



    if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    ) {


        console.log("PDF detected");

        await readPDF(file);

        return;

    }



    if (file.type.startsWith("image/")) {


        console.log("Image detected");

        await readImage(file);

        return;

    }



    summaryInput.value =
    "Please upload a PDF or image file.";

});




// ===============================
// PDF Reading Function
// ===============================

async function readPDF(file) {


    summaryInput.value =
    "Reading PDF...";



    try {


        const pdfData =
        await file.arrayBuffer();



        const pdf =
        await pdfjsLib.getDocument({
            data: pdfData
        }).promise;



        let extractedText = "";



        // First try normal PDF text extraction

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {


            const page =
            await pdf.getPage(pageNumber);



            const textContent =
            await page.getTextContent();



            const pageText =
            textContent.items
            .map(item => item.str)
            .join(" ");



            extractedText +=
            pageText + "\n";


        }



        console.log(
        "PDF Text Length:",
        extractedText.trim().length
        );



        // If PDF has text, use it

        if (extractedText.trim().length > 20) {


            console.log(
            "Normal text PDF detected"
            );


            summaryInput.value =
            extractedText;


            return;

        }



        // Otherwise use OCR

        console.log(
        "Scanned PDF detected. Starting OCR..."
        );



        summaryInput.value =
        "Scanned PDF detected. Running OCR...";



        const ocrText =
        await convertPDFToOCR(pdf);



        summaryInput.value =
        ocrText;



    }


    catch(error) {


        console.error(
        "PDF Error:",
        error
        );


        summaryInput.value =
        "Unable to read PDF.";

    }

}




// ===============================
// Convert Scanned PDF Pages To OCR
// ===============================

async function convertPDFToOCR(pdf) {


    let completeText = "";



    for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
    ) {



        console.log(
        `Reading page ${pageNumber}/${pdf.numPages}`
        );



        summaryInput.value =
        `Reading page ${pageNumber}/${pdf.numPages}...`;



        const page =
        await pdf.getPage(pageNumber);



        const viewport =
        page.getViewport({
            scale: 2
        });



        const canvas =
        document.createElement("canvas");


        const context =
        canvas.getContext("2d");



        canvas.width =
        viewport.width;


        canvas.height =
        viewport.height;



        await page.render({

            canvasContext: context,

            viewport: viewport

        }).promise;




        const imageData =
        canvas.toDataURL("image/png");



        const result =
        await Tesseract.recognize(

            imageData,

            "eng",

            {

                logger: function(info){

                    console.log(info);

                }

            }

        );



        completeText +=
        result.data.text + "\n\n";


    }



    console.log(
    "Final OCR Text:",
    completeText
    );


    return completeText;

}




// ===============================
// Image OCR Function
// ===============================

async function readImage(file) {


    summaryInput.value =
    "Reading image...";



    try {


        const result =
        await Tesseract.recognize(

            file,

            "eng",

            {

                logger:function(info){

                    console.log(info);

                }

            }

        );



        console.log(
        "Image OCR Text:",
        result.data.text
        );



        summaryInput.value =
        result.data.text;



    }


    catch(error) {


        console.error(
        "OCR Error:",
        error
        );


        summaryInput.value =
        "Unable to read image.";

    }

}




// ===============================
// Analyze Button
// ===============================


analyzeCareButton.addEventListener(
"click",
async function(){

    const text =
    summaryInput.value;


    if(!text || text.trim().length < 10){

        alert(
        "Please upload a document first."
        );

        return;

    }


    const result =
    await analyzeWithAI(text);


    console.log(
    "Final AI Result:",
    result
    );


    summaryInput.value =
    result;

});