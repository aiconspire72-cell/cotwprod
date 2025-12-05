
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ReferenceMap } from "../types";
import { ANIME_PREFIX, AAA_PREFIX, PIXAR_PREFIX } from "./textService";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
    }
    return new GoogleGenAI({ apiKey });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry<T>(
    operation: () => Promise<T>, 
    retries = 5, 
    initialDelay = 15000 
): Promise<T> {
    let currentDelay = initialDelay;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            const msg = (error.message || JSON.stringify(error)).toLowerCase();
            const status = error.status || error.statusCode || error.response?.status;
            // Robustly extract code from various Google error structures
            const code = error.error?.code || error.code || status;
            
            const isRateLimit = 
                status === 429 || 
                code === 429 ||
                msg.includes('429') || 
                msg.includes('quota') || 
                msg.includes('exhausted') || 
                msg.includes('resource') ||
                msg.includes('too many requests') ||
                msg.includes('limit');

            const isServerOverload = status === 503 || msg.includes('overloaded') || msg.includes('unavailable');
            
            const isInternalError = 
                status === 500 || 
                code === 500 || 
                msg.includes('internal error') || 
                msg.includes('rpc failed') || 
                msg.includes('xhr error') ||
                msg.includes('fetch failed');

            if (attempt < retries && (isRateLimit || isServerOverload || isInternalError)) {
                console.warn(`API Error (${code || 'Unknown'}). Pausing for ${currentDelay/1000}s... (Attempt ${attempt + 1}/${retries})`);
                await wait(currentDelay);
                currentDelay *= 1.5; 
            } else {
                // If we run out of retries, tag 429/503 so the UI knows to pause the batch
                if (isRateLimit || isServerOverload) {
                    (error as any).isRateLimit = true;
                }
                throw error;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

export const generateAnimeFrame = async (
    prompt: string, 
    refIds: string[], 
    refMap: ReferenceMap,
    styleMode: 'anime' | 'aaa' | 'pixar' = 'anime'
): Promise<string> => {
    const ai = getClient();
    const parts: any[] = [];

    refIds.forEach(id => {
        const ref = refMap[id];
        if (ref && ref.base64) {
             console.log(`Attaching reference image: ${id}`);
             parts.push({
                 inlineData: {
                     mimeType: ref.mimeType || 'image/png',
                     data: ref.base64
                 }
             });
        }
    });

    let styleInstruction = "";
    switch (styleMode) {
        case 'aaa':
            styleInstruction = "Style: PHOTOREALISTIC MOVIE FRAME. Highly detailed, cinematic, 8k, volumetric lighting. Do NOT use anime cel-shading. This is a high-budget live action film.";
            break;
        case 'pixar':
            styleInstruction = "Style: 3D ANIMATED MOVIE FRAME (Pixar/Disney Style). High quality 3D render, expressive features, vibrant colors, soft volumetric lighting, subsurface scattering on skin, Octane render. Do NOT use 2D anime style. Do NOT use photorealism. Cute but detailed 3D CGI.";
            break;
        case 'anime':
        default:
            styleInstruction = "Style: High quality anime screencap, 4k, cinematic lighting, cel shaded, highly detailed, dramatic composition.";
            break;
    }

    // STRICTER PROMPT ENGINEERING FOR CONSISTENCY
    parts.push({
        text: prompt + ` \n\nIMPORTANT: Reference images are attached. You MUST COPY the character designs (FACE, HAIR, AND EXACT OUTFIT) from these images. \n- Do NOT invent new clothes. If the text does not describe clothing, USE THE OUTFIT FROM THE IMAGE.\n- If multiple characters are present, map them correctly based on their visual traits (e.g. Red skin = Ayo).\n\n${styleInstruction} \nCRITICAL: NO SPEECH BUBBLES. NO TEXT OVERLAYS. NO COMIC PANELS.`
    });

    try {
        const response = await generateWithRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    imageConfig: { aspectRatio: "16:9" },
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ]
                }
            });
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            if (response.promptFeedback?.blockReason) {
                throw new Error(`Blocked by Safety Filter: ${response.promptFeedback.blockReason}`);
            }
            throw new Error("No image candidates returned by API.");
        }

        const contentParts = candidates[0].content.parts;
        let base64Image = '';

        for (const part of contentParts) {
            if (part.inlineData && part.inlineData.data) {
                base64Image = part.inlineData.data;
                break;
            }
        }

        if (!base64Image) throw new Error("Model returned no image data.");

        return base64Image;

    } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        throw error; 
    }
};

export const refineTextPrompt = async (originalText: string, instruction: string): Promise<string> => {
    const ai = getClient();
    const prompt = `Script Scene: "${originalText}"\nUser Instruction: "${instruction}"\nTask: Rewrite script scene based on instruction. Keep it short.`;

    try {
        const response = await generateWithRetry(async () => {
             return await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        });
        return response.text || originalText;
    } catch (error) {
        throw error;
    }
};

const getPrefixForMode = (mode: 'anime' | 'aaa' | 'pixar') => {
    if (mode === 'aaa') return AAA_PREFIX;
    if (mode === 'pixar') return PIXAR_PREFIX;
    return ANIME_PREFIX;
};

export const generateScriptFromIdea = async (
    idea: string, 
    refMap: ReferenceMap, 
    useVoice: boolean = false, 
    lore: string = "",
    styleMode: 'anime' | 'aaa' | 'pixar' = 'anime'
): Promise<string> => {
    const ai = getClient();
    const charContext = Object.values(refMap)
        .filter(r => r.type === 'character')
        .map(c => `Handle: @${c.id} | Name: ${c.name} | Visual: ${c.description}${useVoice && c.voice ? ` | Voice: ${c.voice}` : ''}`)
        .join('\n');

    const voiceRule = useVoice ? 
        `3. **VOICE TAGS:** In the (Audio) sections, you MUST put the character's voice description in brackets before their line. Example: "(Audio) Ayo [Energetic Hero Voice]: Let's go!"` : 
        "";

    const promptPrefix = getPrefixForMode(styleMode);

    const prompt = `
        CONTEXT / WORLD LORE:
        ${lore || "Generic Anime World"}

        Write an anime script for: "${idea}"
        
        AVAILABLE CHARACTERS:
        ${charContext}
        
        CRITICAL RULES FOR HANDLES VS NAMES:
        1. **IN VISUAL PROMPTS & ACTIONS:** ALWAYS use the Handle (e.g. "@auraayo walks in").
        2. **IN DIALOGUE:** NEVER use the Handle. Use their Name (e.g. "Ayo: Rayne, stop!").
        ${voiceRule}
        OTHER RULES:
        1. Break into 15s scenes.
        2. STRICT FORMATTING: Start each sequence exactly with "Sequence X:" (no quotes).
        3. ENVIRONMENT CONSISTENCY: Re-state the location/background in the 'Prompt' field for EVERY sequence.
        4. NO CLOTHING DESCRIPTIONS: Do NOT describe specific clothes in the Prompt. Rely on the character identity.
        5. NO TEXT/COMIC BUBBLES.

        Format: Sequence X: [Title] \n Prompt: ${promptPrefix}[Explicit Location Description], [Visual Action Description using @handles] \n Chronological Flow: ...
    `;

    try {
        const response = await generateWithRetry(async () => {
            return await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        });
        return response.text || "";
    } catch (error) {
        throw error;
    }
};

export const breakScriptDown = async (
    scriptText: string, 
    refMap: ReferenceMap, 
    useVoice: boolean = false, 
    lore: string = "",
    styleMode: 'anime' | 'aaa' | 'pixar' = 'anime'
): Promise<string> => {
    const ai = getClient();
    const charContext = Object.values(refMap)
        .filter(r => r.type === 'character')
        .map(c => `Handle: @${c.id} | Name: ${c.name}${useVoice && c.voice ? ` | Voice: ${c.voice}` : ''}`)
        .join('\n');

    const voiceRule = useVoice ? 
        `4. **VOICE TAGS:** In the Chronological Flow, prefix spoken lines with [Voice Desc]. e.g. "Ayo [Deep Voice]: Text"` : 
        "";

    const promptPrefix = getPrefixForMode(styleMode);

    const prompt = `
        TASK: Convert this raw script into a 'Piece-by-Piece' 15-second storyboard sequence.
        
        CONTEXT / WORLD LORE:
        ${lore || "Generic Anime World"}

        INPUT SCRIPT:
        "${scriptText.slice(0, 20000)}"

        PIECE-BY-PIECE PRINCIPLES:
        1. **Break into 15s Segments:** Divide the narrative into 15-second visual chunks.
        2. **Visual Stitching:** For every Sequence after #1, you MUST look at the *end* of the previous sequence. The *Prompt* of the current sequence must describe the character/camera starting in a state that matches the previous ending.
        3. **Consistency:** Re-state the background location in EVERY Prompt field.
        
        FORMATTING RULES:
        - Start blocks with "Sequence X: [Title]"
        - Use "Prompt: ${promptPrefix}..." for the visual description.
        - Use @handle for visuals (e.g. @auraayo), use Names for dialogue.
        - NO clothing descriptions.
        - NO text/speech bubbles in prompt.
        ${voiceRule}

        AVAILABLE CHARACTERS (Use their handles!):
        ${charContext}
    `;
    
    try {
        const response = await generateWithRetry(async () => {
            return await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        });
        return response.text || scriptText;
    } catch (error) {
        throw error;
    }
};

export const generateFullEpisode = async (
    idea: string, 
    sceneCount: number, 
    refMap: ReferenceMap, 
    useVoice: boolean = false,
    lore: string = "",
    styleMode: 'anime' | 'aaa' | 'pixar' = 'anime'
): Promise<string> => {
    const ai = getClient();
    const charContext = Object.values(refMap)
        .filter(r => r.type === 'character')
        .map(c => `Handle: @${c.id} | Name: ${c.name} | Visual: ${c.description}${useVoice && c.voice ? ` | Voice: ${c.voice}` : ''}`)
        .join('\n');
    const locContext = Object.values(refMap)
        .filter(r => r.type === 'location')
        .map(l => `Handle: @${l.id} | Name: ${l.name} | Visual: ${l.description}`)
        .join('\n');

    const voiceRule = useVoice ? 
        `5. **VOICE CONSISTENCY:** In the (Audio) lines, you MUST include the voice description in brackets. Example: "(Audio) Ayo [Gravelly Hero Voice]: Stop!"` : 
        "";

    const promptPrefix = getPrefixForMode(styleMode);

    const prompt = `
        TASK: Write a full anime episode script based on this idea: "${idea}"

        CONTEXT / WORLD LORE:
        ${lore || "Generic Anime World"}
        
        AVAILABLE ASSETS:
        ${charContext}
        ${locContext}
        CONSTRAINTS:
        1. You MUST generate EXACTLY ${sceneCount} sequences. Number them Sequence 1 to Sequence ${sceneCount}.
        2. Each sequence represents 15 seconds of screen time.
        3. Every single sequence must have MEANINGFUL action or dialogue.
        4. FORMATTING: Start every block with "Sequence X:" (no quotes).
        ${voiceRule}
        
        HANDLE VS NAME RULES (CRITICAL):
        - **VISUAL PROMPTS & ACTIONS:** You MUST use the @handle.
        - **DIALOGUE (AUDIO):** You MUST use the Name.
        VISUAL RULES:
        - VISUAL CONSISTENCY: Describe the environment/background in EVERY Prompt field.
        - NO TEXT IN IMAGES.
        - NO CLOTHING DESCRIPTIONS.
        
        OUTPUT FORMAT PER SEQUENCE:
        Sequence X: [Title]
        Prompt: ${promptPrefix}[Explicit Location Description], [Visual Action Description using @handles]
        Chronological Flow:
        (Action) [Details using @handles]
        (Audio) [Name] [Voice Desc if enabled]: [Dialogue]
    `;

    try {
        const response = await generateWithRetry(async () => {
            return await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt,
                config: { maxOutputTokens: 8192 }
            });
        });
        return response.text || "";
    } catch (error) {
        throw error;
    }
};

export const generateNextBeat = async (
    lastSequenceId: number,
    lastContent: string | null,
    refMap: ReferenceMap,
    useVoice: boolean = false,
    lore: string = "",
    styleMode: 'anime' | 'aaa' | 'pixar' = 'anime'
): Promise<string> => {
    const ai = getClient();
    const charContext = Object.values(refMap)
        .filter(r => r.type === 'character')
        .map(c => `Handle: @${c.id} | Name: ${c.name}${useVoice && c.voice ? ` | Voice: ${c.voice}` : ''}`)
        .join('\n');
    const locContext = Object.values(refMap)
        .filter(r => r.type === 'location')
        .map(l => `Handle: @${l.id} | Name: ${l.name}`)
        .join('\n');

    const nextId = lastSequenceId + 1;
    const voiceRule = useVoice ? "- Include [Voice Description] in brackets before spoken dialogue." : "";
    const promptPrefix = getPrefixForMode(styleMode);
    
    let prompt = "";
    if (lastContent) {
        prompt = `
            TASK: Read the previous anime scene and write the IMMEDIATE NEXT 15-second sequence (Sequence ${nextId}).
            
            CONTEXT / WORLD LORE:
            ${lore || "Generic Anime World"}

            PREVIOUS SCENE:
            "${lastContent}"

            INSTRUCTIONS:
            1. Infer the ending visual state of the previous scene.
            2. Write "Sequence ${nextId}: [Title]"
            3. Write a "Prompt:" that continues the visual action smoothly (same environment, logical next movement).
            4. Write "Chronological Flow:" with dialogue/action.
            
            RULES:
            - Use "Prompt: ${promptPrefix}..." for visuals.
            - Use @handles for Visuals/Action.
            - Use Names for Dialogue.
            - NO clothing descriptions.
            - NO text/speech bubbles instructions.
            - Re-state the environment in the Prompt.
            ${voiceRule}
            
            AVAILABLE ASSETS:
            ${charContext}
            ${locContext}
        `;
    } else {
        // Cold Open Mode
        prompt = `
            TASK: Write an exciting OPENING SCENE (Sequence 1) for a new anime episode.

            CONTEXT / WORLD LORE:
            ${lore || "Generic Anime World"}
            
            INSTRUCTIONS:
            1. Create a high-energy or dramatic start based on the Lore.
            2. Write "Sequence 1: [Title]"
            3. Write a "Prompt:" for the image generator.
            4. Write "Chronological Flow:"
            
            RULES:
            - Use "Prompt: ${promptPrefix}..." for visuals.
            - Use @handles for Visuals/Action.
            - Use Names for Dialogue.
            - NO clothing descriptions.
            - NO text/speech bubbles instructions.
            - Describe the environment clearly.
            ${voiceRule}
            
            AVAILABLE CHARACTERS:
            ${charContext}
            AVAILABLE LOCATIONS:
            ${locContext}
        `;
    }

    try {
        const response = await generateWithRetry(async () => {
            return await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        });
        return response.text || "";
    } catch (error) {
        throw error;
    }
};
