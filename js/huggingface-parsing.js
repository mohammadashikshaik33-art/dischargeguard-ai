// Shared AI response parsing (browser + Node.js)

function parseAIResponse(aiText) {
    const sections = {
        summary: "",
        warnings: "",
        medications: "",
        checklist: ""
    };

    const regex = /(?:^[#\s\*]*)(SUMMARY|WARNING[\s_]+SIGNS|MEDICATIONS|CHECKLIST)(?:[#\s\*]*):\s*/gmi;
    
    let match;
    const matches = [];
    
    while ((match = regex.exec(aiText)) !== null) {
        matches.push({
            name: match[1].toUpperCase().replace(/[\s_]+/g, " "),
            index: match.index,
            length: match[0].length
        });
    }

    if (matches.length === 0) {
        return {
            summary: aiText,
            warnings: "No warning signs identified.",
            medications: "No medication details found.",
            checklist: "No checklist generated.",
            raw: aiText
        };
    }

    matches.sort((a, b) => a.index - b.index);

    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const start = current.index + current.length;
        const end = (i + 1 < matches.length) ? matches[i + 1].index : aiText.length;
        const content = aiText.substring(start, end).trim();

        if (current.name === "SUMMARY") {
            sections.summary = content;
        } else if (current.name === "WARNING SIGNS") {
            sections.warnings = content;
        } else if (current.name === "MEDICATIONS") {
            sections.medications = content;
        } else if (current.name === "CHECKLIST") {
            sections.checklist = content;
        }
    }

    return {
        summary: sections.summary || aiText,
        warnings: sections.warnings || "No warning signs identified.",
        medications: sections.medications || "No medication details found.",
        checklist: sections.checklist || "No checklist generated.",
        raw: aiText
    };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { parseAIResponse };
}

if (typeof window !== "undefined") {
    window.parseAIResponse = parseAIResponse;
}
