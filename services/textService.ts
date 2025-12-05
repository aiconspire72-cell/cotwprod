
import { ReferenceMap, PromptData } from "../types";
import { SMART_ALIASES } from "../constants";

export const NO_MUSIC_TAG = " [AUDIO: NO MUSIC, SFX ONLY]";
export const ANIME_PREFIX = "ADD SHONEN ANIME, 4K, ";
export const AAA_PREFIX = "CINEMATIC, AAAA PHOTOREALISTIC MOVIE, UNLIMITED VFX BUDGET, 8K RESOLUTION, HYPER-DETAILED TEXTURES, VOLUMETRIC LIGHTING, SHOT ON ARRI ALEXA 65 WITH 2.39:1 ASPECT RATIO, STEVEN SPIELBERG/JAMES CAMERON STYLE, ";
export const PIXAR_PREFIX = "PIXAR STYLE 3D ANIMATION, DISNEY ANIMATION STUDIOS STYLE, 8K RENDER, OCTANE RENDER, VOLUMETRIC LIGHTING, SUBSURFACE SCATTERING, VIBRANT COLOR PALETTE, EXPRESSIVE FACIAL FEATURES, CUTE STYLIZED PROPORTIONS, 3D CGI, ";

export const toggleNoMusicTag = (text: string, enable: boolean): string => {
  // Always remove it first to prevent duplicates or weird spacing
  let clean = text.replace(NO_MUSIC_TAG, "").trim();
  
  if (enable) {
    return clean + NO_MUSIC_TAG;
  }
  return clean;
};

export const sanitizePrompt = (text: string): string => {
  let clean = text.replace(/'[^']*'/g, '');
  
  const forbidden = [
      { match: /bitch/gi, replace: "enemy" },
      { match: /ho\b/gi, replace: "person" }, 
      { match: /ass\b/gi, replace: "self" },
      { match: /smash/gi, replace: "defeat" },
      { match: /shit/gi, replace: "stuff" },
      { match: /negus/gi, replace: "ancient warriors" },
      { match: /freak/gi, replace: "weird" },
      { match: /thotty/gi, replace: "rude" },
      { match: /vagil/gi, replace: "medicine" },
      { match: /cocaine/gi, replace: "dust" },
      { match: /hell/gi, replace: "heck" },
      { match: /damn/gi, replace: "darn" },
      { match: /fuck/gi, replace: "frick" },
      { match: /niggas/gi, replace: "warriors" },
      { match: /cum/gi, replace: "white energy" },
      { match: /nut/gi, replace: "explode" },
      { match: /boner/gi, replace: "power surge" },
      { match: /pussy/gi, replace: "courage" },
      { match: /whore/gi, replace: "villain" },
      { match: /slut/gi, replace: "enemy" },
      { match: /handjobs/gi, replace: "hand strikes" },
      { match: /bukkake/gi, replace: "barrage" },
      { match: /sex/gi, replace: "love" },
      { match: /orgasm/gi, replace: "climax" },
      { match: /tits/gi, replace: "chest" },
      { match: /penis/gi, replace: "weapon" },
      { match: /dick/gi, replace: "weapon" },
      { match: /cock/gi, replace: "weapon" },
      { match: /jerked off/gi, replace: "manipulated" }
  ];

  forbidden.forEach(rule => {
      clean = clean.replace(rule.match, rule.replace);
  });

  return clean;
};

export const enhancePrompt = (text: string, refIds: string[], refMap: ReferenceMap, styleMode: 'anime' | 'aaa' | 'pixar' = 'anime'): string => {
  let enhanced = text;

  // 1. STRIP ANY EXISTING STYLE PREFIXES TO AVOID DUPLICATION
  // We create a regex that looks for the core keywords of our prefixes at the start
  const cleanRegex = /^(ADD SHONEN ANIME|CINEMATIC, AAAA|PIXAR STYLE 3D)[^,]*, [^,]*, /i;
  // Also perform a simpler replace just in case user edited it slightly, checking for our exact constants
  enhanced = enhanced.replace(ANIME_PREFIX.trim(), "")
                     .replace(AAA_PREFIX.trim(), "")
                     .replace(PIXAR_PREFIX.trim(), "");
  
  // Remove loose comma at start if left behind
  if (enhanced.startsWith(", ")) enhanced = enhanced.substring(2);

  // 2. INJECT NEW STYLE PREFIX
  let selectedPrefix = ANIME_PREFIX;
  if (styleMode === 'aaa') selectedPrefix = AAA_PREFIX;
  if (styleMode === 'pixar') selectedPrefix = PIXAR_PREFIX;

  enhanced = selectedPrefix + enhanced;

  // Helper to get description string with strict outfit instruction
  const getDesc = (id: string) => {
      const ref = refMap[id];
      if (!ref) return null;
      // Append instruction to force outfit match from image
      const outfitInstruction = ref.type === 'character' ? ", wearing the outfit shown in reference image" : "";
      return `(${ref.name}: ${ref.description}${outfitInstruction})`;
  };

  // 3. Replace Explicit Handles (@handle)
  Object.keys(refMap).forEach(id => {
      const regex = new RegExp(`@${id}`, 'gi');
      const desc = getDesc(id);
      if (desc) enhanced = enhanced.replace(regex, desc);
  });

  // 4. Replace Name Aliases
  Object.entries(SMART_ALIASES).forEach(([name, id]) => {
     const ref = refMap[id];
     if (!ref) return;

     // Match whole word name, negative lookbehind for @, negative lookahead for :
     const regex = new RegExp(`(?<!@)\\b${name}\\b(?!:)`, 'gi');
     const desc = getDesc(id);
     if (desc) enhanced = enhanced.replace(regex, desc);
  });
  
  return enhanced;
};

/**
 * Scans the prompt for any mentions of characters or locations (Handles, Names, Aliases).
 * Returns a unique list of IDs that MUST have their images attached to the request.
 */
export const getReferencedIds = (text: string, refMap: ReferenceMap): string[] => {
    const foundIds = new Set<string>();

    // 1. Check for Aliases (Ayo, Rayne, etc.)
    Object.entries(SMART_ALIASES).forEach(([alias, id]) => {
        if (refMap[id]) {
            const regex = new RegExp(`\\b${alias}\\b`, 'gi');
            if (regex.test(text)) foundIds.add(id);
        }
    });

    // 2. Check for Reference Names and explicit handles
    Object.keys(refMap).forEach(id => {
        const ref = refMap[id];
        // Check handle
        if (new RegExp(`@${id}`, 'gi').test(text)) foundIds.add(id);
        
        // Check Display Name (e.g. "Anime Forest")
        if (ref.name && new RegExp(`\\b${ref.name}\\b`, 'gi').test(text)) foundIds.add(id);
    });

    return Array.from(foundIds);
};

export const parseScript = (
  scriptText: string, 
  refMap: ReferenceMap,
  startIndex: number = 0,
  startTimeSeconds: number = 0
): PromptData[] => {
  const normalized = scriptText.replace(/\r\n/g, '\n');
  
  const chunks = normalized
    .split(/(?=Sequence \d+:|Title:|Scene \d+:)/)
    .map(c => c.trim())
    .filter(c => c.length > 20);

  // Fallback if no headers found
  const finalChunks = chunks.length > 0 ? chunks : normalized.split('\n\n').filter(c => c.length > 20);

  const CLIP_DURATION = 15;

  return finalChunks.map((chunk, index) => {
    const idNum = startIndex + index + 1;
    const id = idNum.toString().padStart(2, '0');

    const start = startTimeSeconds + (index * CLIP_DURATION);
    const end = start + CLIP_DURATION;
    const formatTime = (s: number) => {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sc = (s % 60).toString().padStart(2, '0');
      return `${m}:${sc}`;
    };
    const timeLabel = `${formatTime(start)} - ${formatTime(end)}`;

    // Use getReferencedIds to find tags, but also check strict @handle for Initial tagging
    const foundRefs = getReferencedIds(chunk, refMap);

    return {
      id,
      time: timeLabel,
      characters: foundRefs, // Populates chip tags initially
      content: chunk
    };
  });
};

export const reindexPrompts = (prompts: PromptData[]): PromptData[] => {
    const CLIP_DURATION = 15;
    
    return prompts.map((p, index) => {
        const idNum = index + 1;
        const id = idNum.toString().padStart(2, '0');

        const start = index * CLIP_DURATION;
        const end = start + CLIP_DURATION;
        
        const formatTime = (s: number) => {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const sc = (s % 60).toString().padStart(2, '0');
            return `${m}:${sc}`;
        };
        
        const timeLabel = `${formatTime(start)} - ${formatTime(end)}`;

        let newContent = p.content;
        const seqRegex = /^Sequence \d+:/i; 
        if (seqRegex.test(newContent)) {
            newContent = newContent.replace(seqRegex, `Sequence ${idNum}:`);
        } 

        return {
            ...p,
            id,
            time: timeLabel,
            content: newContent
        };
    });
};
