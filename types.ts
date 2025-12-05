
export type ReferenceType = 'character' | 'location';

export interface ReferenceData {
  id: string;
  name: string;
  color: string;
  description: string;
  voice: string | null;
  base64: string | null;
  mimeType: string | null;
  type: ReferenceType;
}

export interface PromptData {
  id: string;
  time: string;
  characters: string[];
  content: string;
}

export interface GenerationResult {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export interface Preset {
  id: string;
  name: string;
  characters: ReferenceMap;
  locations: ReferenceMap;
  createdAt: number;
}

export type ReferenceMap = Record<string, ReferenceData>;
export type GenerationMap = Record<string, GenerationResult>;

// Backward compatibility alias if needed
export type CharacterData = ReferenceData;
export type CharacterMap = ReferenceMap;
