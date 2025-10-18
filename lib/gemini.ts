import { GoogleGenAI, Type } from "@google/genai";
import type { ServiceCardData, TemplateData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const availableIcons = [
    "CommunityIcon", "AssistedLivingIcon", "MemoryCareIcon", "HealthcareIcon", 
    "CodeIcon", "CloudIcon", "DataIcon", "SupportIcon", 
    "MassageIcon", "FacialIcon", "SaunaIcon", "RelaxIcon", 
    "TicketIcon", "ITSupportIcon", "HRDocsIcon", "KnowledgeBaseIcon",
    "BotIcon", "UrlIcon", "DiningIcon", "CalendarIcon", "BrainIcon",
    "CycleIcon", "PuzzlePieceIcon", "HandThumbUpIcon", "StarIcon",
    "NewspaperIcon", "CreditCardIcon", "GiftIcon", "UsersIcon", "ShieldCheckIcon"
];

const templateSchema = {
    type: Type.OBJECT,
    properties: {
        brand: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "A creative and fitting brand name for the business." },
            },
            required: ["name"]
        },
        hero: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A catchy, engaging headline for the hero section." },
                subtitle: { type: Type.STRING, description: "A brief, descriptive subtitle that elaborates on the headline." },
            },
            required: ["title", "subtitle"]
        },
        ctas: {
             type: Type.OBJECT,
             properties: {
                primary: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING, description: "Action-oriented text for the primary call-to-action button." }
                    },
                    required: ["text"]
                },
                secondary: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING, description: "Action-oriented text for the secondary call-to-action button." }
                    },
                    required: ["text"]
                }
             },
             required: ["primary", "secondary"]
        },
        testimonials: {
            type: Type.ARRAY,
            description: "Generate exactly two distinct and believable customer testimonials.",
            items: {
                type: Type.OBJECT,
                properties: {
                    quote: { type: Type.STRING, description: "An authentic-sounding quote from a customer." },
                    author: { type: Type.STRING, description: "The name of the person giving the testimonial." },
                    title: { type: Type.STRING, description: "The role or title of the author, e.g., 'CEO, Innovate Corp' or 'Happy Customer'." },
                },
                required: ["quote", "author", "title"]
            }
        },
        colorPalette: {
            type: Type.OBJECT,
            properties: {
                background: { type: Type.STRING, description: "A hex color code for the main page background. Should be dark for tech/finance, light for wellness/luxury." },
                cardBackground: { type: Type.STRING, description: "A hex color code for card backgrounds, slightly different from the main background." },
                text: { type: Type.STRING, description: "A hex color code for the main body text, ensuring high contrast with the background." },
                heroText: { type: Type.STRING, description: "A hex color code for the main hero headline text." },
                primary: { type: Type.STRING, description: "A hex color code for primary buttons and major accents. Should be vibrant." },
                secondary: { type: Type.STRING, description: "A hex color code for secondary buttons and borders." },
                accent: { type: Type.STRING, description: "A hex color code for icons and minor highlights. Should complement the primary color." },
                cardText: { type: Type.STRING, description: "A hex color code for text inside cards, ensuring high contrast with cardBackground." },
            },
            required: ["background", "cardBackground", "text", "heroText", "primary", "secondary", "accent", "cardText"]
        },
        serviceCards: {
            type: Type.ARRAY,
            description: "Generate exactly four distinct service cards relevant to the business.",
            items: {
                type: Type.OBJECT,
                properties: {
                    icon: { type: Type.STRING, description: `The name of an icon for the service. Choose the most relevant icon from this list: ${availableIcons.join(", ")}` },
                    title: { type: Type.STRING, description: "A short, clear title for the service." },
                    description: { type: Type.STRING, description: "A one-sentence description of the service." },
                    linkText: { type: Type.STRING, description: "A concise call-to-action text for the button, like 'Learn More' or 'Explore'." },
                },
                required: ["icon", "title", "description", "linkText"]
            },
        },
    },
    required: ["brand", "hero", "ctas", "testimonials", "colorPalette", "serviceCards"]
};

const serviceCardSchema = {
    type: Type.OBJECT,
    properties: {
        icon: { type: Type.STRING, description: `The name of an icon for the service. Choose the most relevant icon from this list: ${availableIcons.join(", ")}` },
        title: { type: Type.STRING, description: "A short, clear title for the service." },
        description: { type: Type.STRING, description: "A one-sentence description of the service." },
        linkText: { type: Type.STRING, description: "A concise call-to-action text for the button, like 'Learn More' or 'Explore'." },
    },
    required: ["icon", "title", "description", "linkText"]
};

export async function generateTemplateFromPrompt(prompt: string): Promise<TemplateData> {
    const fullPrompt = `You are a world-class web designer, branding expert, and copywriter. Your task is to generate a complete, production-ready website template based on a user's prompt.

    User Prompt: "${prompt}"

    Based on this prompt, generate a complete JSON object that includes:
    1.  A creative and relevant brand name.
    2.  A compelling hero section (title and subtitle).
    3.  Text for two call-to-action buttons.
    4.  Exactly two distinct, realistic testimonials with author names and titles.
    5.  A harmonious 8-color palette (background, card background, text, hero text, primary, secondary, accent, cardText) in hex codes. The palette should match the industry (e.g., dark and vibrant for tech, light and calming for wellness). cardText MUST have high contrast against cardBackground.
    6.  Exactly four distinct, relevant service cards, each with a title, description, link text, and an icon. The icon MUST be one of the following values: ${availableIcons.join(", ")}.

    Return ONLY a valid JSON object matching the provided schema. Do not include any markdown formatting or explanatory text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: templateSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Post-process and add missing static data
        const finalTemplate: TemplateData = {
            ...parsedJson,
            templateId: 'modern-tech', // Default to a layout that works well
            name: parsedJson.brand.name,
            ctas: {
                primary: { ...parsedJson.ctas.primary, id: 'primary', connectorType: 'URL', url: '#' },
                secondary: { ...parsedJson.ctas.secondary, id: 'secondary', connectorType: 'URL', url: '#' },
            },
            serviceCards: parsedJson.serviceCards.map((card: any, index: number) => ({
                ...card,
                id: Date.now() + index,
                access: 'Both',
                connectorType: 'URL',
                url: '#',
            })),
            testimonials: parsedJson.testimonials.map((t: any, i: number) => ({...t, id: i + 1})),
        };

        return finalTemplate;

    } catch (error) {
        console.error(`Error generating template from prompt:`, error);
        throw new Error("Failed to get a valid template from the AI model.");
    }
}

export async function generateNewCardFromContext(template: TemplateData): Promise<Pick<ServiceCardData, 'icon' | 'title' | 'description' | 'linkText'>> {
    const existingCardTitles = template.serviceCards.map(c => c.title).join(', ');
    const promptContext = `
        The website has a hero title of "${template.hero.title}" and the brand name is "${template.brand.name}".
        The existing services are: ${existingCardTitles}.
    `;

    const fullPrompt = `You are a creative service designer for a web agency.
    Based on the provided context of a website, generate one new, unique, and contextually relevant service card.
    
    Context:
    ${promptContext}

    Your task is to create a service that complements the existing ones but is not a duplicate.
    The icon MUST be one of the following values: ${availableIcons.join(", ")}.

    Return ONLY a valid JSON object matching the provided schema. Do not include any markdown formatting or explanatory text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: serviceCardSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;

    } catch (error) {
        console.error(`Error generating new card:`, error);
        throw new Error("Failed to get a valid card from the AI model.");
    }
}