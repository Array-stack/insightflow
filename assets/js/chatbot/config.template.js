/**
 * Template für die Chatbot-Konfiguration
 * Kopieren Sie diese Datei als 'config.local.js' und fügen Sie Ihren API-Key ein
 */

export const apiConfig = {
    openai: {
        apiKey: 'YOUR_API_KEY_HERE',
        model: 'gpt-4',
        maxRetries: 3,
        temperature: 0.7
    }
};

export const companyConfig = {
    name: "InsightFlow",
    description: "KI-gestützte Plattform für Prozessoptimierung",
    services: [
        "Prozessautomatisierung",
        "KI-gestützte Analyse",
        "Workflow-Optimierung"
    ],
    tone: "professionell aber freundlich",
    language: "Deutsch",
    supportHours: "24/7"
};

export const systemPrompt = `
Du bist der KI-Assistent von ${companyConfig.name}.
Wichtige Informationen über das Unternehmen:
${companyConfig.description}

Kommunikationsrichtlinien:
- Tone of Voice: ${companyConfig.tone}
- Sprache: ${companyConfig.language}
- Verfügbarkeit: ${companyConfig.supportHours}

Dienste:
${companyConfig.services.map(service => `- ${service}`).join('\n')}
`;

export const responseTemplates = {
    greeting: "Willkommen bei InsightFlow! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen helfen?",
    goodbye: "Danke für Ihr Interesse! Wir werden uns bald bei Ihnen melden.",
    error: "Entschuldigung, es gab ein technisches Problem. Ein Mitarbeiter wird sich umgehend bei Ihnen melden."
};
