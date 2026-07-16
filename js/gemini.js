// =========================
// Gemini AI Functions
// =========================

async function analyzeDischargeSummary() {

    const summaryInput =
        document.getElementById("summaryInput");

    const dischargeSummaryText =
        summaryInput.value.trim();

    if (dischargeSummaryText === "") {

        alert("Please enter a discharge summary first.");
        return;
    }

    document.getElementById("summaryResult").textContent =
        "Analyzing discharge summary...";

    document.getElementById("warningResult").textContent =
        "Generating warning signs...";

    document.getElementById("medicineResult").textContent =
        "Analyzing medications...";

    document.getElementById("checklistResult").textContent =
        "Preparing caregiver checklist...";

    try {

        const prompt = `
Analyze this hospital discharge summary and provide:

SUMMARY:
Provide a simple explanation for the caregiver.

WARNING SIGNS:
List important symptoms that require medical attention.

MEDICATIONS:
Explain medicines and dosage instructions.

CHECKLIST:
Provide a caregiver action checklist.

Discharge Summary:
${dischargeSummaryText}
`;

        const response = await fetch(
            geminiApiUrl
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data =
            await response.json();

        console.log(
            "Gemini Response:",
            data
        );

        // =========================
        // API Error Handling
        // =========================

        if (!response.ok) {

            const errorMessage =
                data.error?.message ||
                "Unknown Gemini API error";

            document.getElementById("summaryResult").textContent =
                "Gemini API Error: " + errorMessage;

            document.getElementById("warningResult").textContent =
                "-";

            document.getElementById("medicineResult").textContent =
                "-";

            document.getElementById("checklistResult").textContent =
                "-";

            return;
        }

        // =========================
        // Extract AI Response
        // =========================

        const aiResponse =
            data.candidates[0]
                .content.parts[0].text;

        console.log(
            "AI Generated Response:",
            aiResponse
        );

        // =========================
        // Parse Sections
        // =========================

        const summarySection =
            aiResponse
                .split("WARNING SIGNS:")[0]
                .replace("SUMMARY:", "")
                .trim();

        const warningSection =
            aiResponse
                .split("WARNING SIGNS:")[1]
                ?.split("MEDICATIONS:")[0]
                ?.trim()
            || "No warning signs found.";

        const medicationSection =
            aiResponse
                .split("MEDICATIONS:")[1]
                ?.split("CHECKLIST:")[0]
                ?.trim()
            || "No medication details found.";

        const checklistSection =
            aiResponse
                .split("CHECKLIST:")[1]
                ?.trim()
            || "No checklist found.";

        // =========================
        // Update Dashboard
        // =========================

        document.getElementById("summaryResult").textContent =
            summarySection;

        document.getElementById("warningResult").textContent =
            warningSection;

        document.getElementById("medicineResult").textContent =
            medicationSection;

        document.getElementById("checklistResult").textContent =
            checklistSection;

    } catch (error) {

        console.error(
            "Gemini Error:",
            error
        );

        document.getElementById("summaryResult").textContent =
            "Error: " + error.message;

        document.getElementById("warningResult").textContent =
            "-";

        document.getElementById("medicineResult").textContent =
            "-";

        document.getElementById("checklistResult").textContent =
            "-";
    }
}