// =========================
// Analyze Discharge Summary
// =========================

async function analyzeDischargeSummary() {

    // Get summary entered by user
    const dischargeSummaryText =
        document.getElementById("summaryInput").value;

    console.log("Entered Summary:");
    console.log(dischargeSummaryText);

    // Temporary sample output
    const patientSummary =
        "Patient was discharged after treatment and should follow all care instructions carefully.";

    const warningSigns =
        "High fever, severe pain, bleeding, breathing difficulty.";

    const medicationDetails =
        "Paracetamol - Pain relief. Antibiotics - Prevent infection.";

    const caregiverChecklist =
        "Take medicines on time. Drink enough water. Attend follow-up visit.";

    // Display results on dashboard
    document.getElementById("summaryResult").textContent =
        patientSummary;

    document.getElementById("warningResult").textContent =
        warningSigns;

    document.getElementById("medicineResult").textContent =
        medicationDetails;

    document.getElementById("checklistResult").textContent =
        caregiverChecklist;
}