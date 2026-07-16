// ===============================
// AI Analysis Function
// ===============================

async function analyzeWithAI(text) {
    try {
        const apiUrl = `${APP_CONFIG.apiBase}/analyze`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const result = await response.json();

        console.log("Backend Response:", result);

        if (!response.ok) {
            return {
                success: false,
                error: result.error || `Server error (${response.status})`
            };
        }

        if (result.error) {
            return { success: false, error: result.error };
        }

        const aiText = result.generated_text || result[0]?.generated_text;

        if (!aiText) {
            return {
                success: false,
                error: "AI returned an unexpected response format."
            };
        }

        const sections = parseAIResponse(aiText);
        return { success: true, ...sections };

    } catch (error) {
        console.error("Analysis Error:", error);
        return {
            success: false,
            error: "AI analysis failed. Is the server running?"
        };
    }
}

function formatMarkdownToHTML(text) {
    if (!text) return "";
    
    // Escape HTML to prevent XSS
    let safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
        
    // Convert bold markdown **text** to <strong>text</strong>
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    const lines = safeText.split("\n");
    let inList = false;
    let listType = null; // "ul" or "ol"
    let html = "";
    
    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
                listType = null;
            }
            continue;
        }
        
        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        
        if (bulletMatch) {
            if (!inList || listType !== "ul") {
                if (inList) html += `</${listType}>`;
                html += "<ul>";
                inList = true;
                listType = "ul";
            }
            html += `<li>${bulletMatch[1]}</li>`;
        } else if (numberMatch) {
            if (!inList || listType !== "ol") {
                if (inList) html += `</${listType}>`;
                html += "<ol>";
                inList = true;
                listType = "ol";
            }
            html += `<li>${numberMatch[2]}</li>`;
        } else {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
                listType = null;
            }
            html += `<p>${trimmed}</p>`;
        }
    }
    
    if (inList) {
        html += `</${listType}>`;
    }
    
    return html;
}

function updateResultCards(result) {
    // Summary and Medication use textContent as requested
    document.getElementById("summaryResult").textContent = result.summary;
    document.getElementById("medicineResult").textContent = result.medications;

    // Warning and Checklist cards use HTML formatting with textContent fallback if error occurs
    try {
        const formattedWarnings = formatMarkdownToHTML(result.warnings);
        document.getElementById("warningResult").innerHTML = formattedWarnings;
    } catch (e) {
        console.error("Warning formatting failed, falling back to textContent", e);
        document.getElementById("warningResult").textContent = result.warnings;
    }

    try {
        const formattedChecklist = formatMarkdownToHTML(result.checklist);
        document.getElementById("checklistResult").innerHTML = formattedChecklist;
    } catch (e) {
        console.error("Checklist formatting failed, falling back to textContent", e);
        document.getElementById("checklistResult").textContent = result.checklist;
    }
}

function setResultCardsLoading() {
    document.getElementById("summaryResult").textContent = "Analyzing discharge summary...";
    document.getElementById("warningResult").textContent = "Generating warning signs...";
    document.getElementById("medicineResult").textContent = "Analyzing medications...";
    document.getElementById("checklistResult").textContent = "Preparing caregiver checklist...";
}

function setResultCardsError(message) {
    document.getElementById("summaryResult").textContent = "Error: " + message;
    document.getElementById("warningResult").textContent = "-";
    document.getElementById("medicineResult").textContent = "-";
    document.getElementById("checklistResult").textContent = "-";
}

window.analyzeWithAI = analyzeWithAI;
window.updateResultCards = updateResultCards;
window.setResultCardsLoading = setResultCardsLoading;
window.setResultCardsError = setResultCardsError;
