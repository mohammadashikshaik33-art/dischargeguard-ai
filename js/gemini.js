// =========================
// Gemini AI Functions
// =========================

async function analyzeDischargeSummary() {

    const dischargeSummaryText =
        document.getElementById("summaryInput").value.trim();

    if (dischargeSummaryText === "") {

        alert("Please enter a discharge summary first.");
        return;
    }

    document.getElementById("summaryResult").textContent =
        "Analyzing discharge summary...";

    try {

        const response = await fetch(
            `${geminiApiUrl}?key=${geminiApiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                    `Analyze this hospital discharge summary and provide:
                                    1. Simple Summary
                                    2. Warning Signs
                                    3. Medications
                                    4. Caregiver Checklist
                                    Use this exact format:
                                    SUMMARY:
                                    ...
                                    WARNING SIGNS:
                                    ...
                                    MEDICATIONS:
                                    ...
                                    CHECKLIST:
                                    ...
                                    Discharge Summary:
                                    ${dischargeSummaryText}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        const aiResponse =
    data.candidates[0].content.parts[0].text;


// Display full response temporarily
document.getElementById("summaryResult").textContent =
    aiResponse;


// Extract sections
const summarySection =
    aiResponse.split("WARNING SIGNS:")[0]
        .replace("SUMMARY:", "")
        .trim();

const warningSection =
    aiResponse.split("WARNING SIGNS:")[1]
        ?.split("MEDICATIONS:")[0]
        ?.trim() || "No warning signs found.";

const medicationSection =
    aiResponse.split("MEDICATIONS:")[1]
        ?.split("CHECKLIST:")[0]
        ?.trim() || "No medication details found.";

const checklistSection =
    aiResponse.split("CHECKLIST:")[1]
        ?.trim() || "No checklist found.";


// Update dashboard cards
document.getElementById("summaryResult").textContent =
    summarySection;

document.getElementById("warningResult").textContent =
    warningSection;

document.getElementById("medicineResult").textContent =
    medicationSection;

document.getElementById("checklistResult").textContent =
    checklistSection;
      
    } catch (error) {

        console.error("Gemini Error:", error);

        document.getElementById("summaryResult").textContent =
            "Error: " + error.message;
    }
}