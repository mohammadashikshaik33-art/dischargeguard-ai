// ===============================
// Hugging Face Configuration
// ===============================

const huggingFaceApiKey =
"";


const huggingFaceUrl =
"https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta";



// ===============================
// AI Analysis Function
// ===============================

async function analyzeWithAI(text) {


    try {


        const response =
        await fetch(
            huggingFaceUrl,
            {

                method: "POST",

                headers: {

                    "Authorization":
                    `Bearer ${huggingFaceApiKey}`,

                    "Content-Type":
                    "application/json"

                },


                body: JSON.stringify({

                    inputs:

                    `You are a medical assistant.

Analyze this discharge summary.

Give:

1. Summary
2. Warning Signs
3. Medicines
4. Patient Checklist

Document:

${text}`


                })

            }
        );



        const result = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", result);



        console.log(
            "Hugging Face Response:",
            result
        );



        if(result.error){

            return result.error;

        }



        return result[0].generated_text;


    }


    catch(error){


        console.error(
            "Hugging Face Error:",
            error
        );


        return "AI analysis failed.";

    }

}


window.analyzeWithAI =
analyzeWithAI;