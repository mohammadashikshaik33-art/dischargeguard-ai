// =========================
// Gemini AI Functions
// =========================


// Analyze discharge summary
async function analyzeDischargeSummary() {

    const dischargeSummaryText =
        document.getElementById("summaryInput").value;

    console.log(dischargeSummaryText);

    document.getElementById("summaryResult").textContent =
        "Analysis started for: " + dischargeSummaryText;

}