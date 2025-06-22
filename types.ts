
export interface PlayerStats {
  itibar: number;
  partiGucu: number;
  etik: number;
  medya: number;
  moral: number;
}

export interface Choice {
  text: string;
  next: string;
  effects: string; // e.g., "itibar+10,etik-5"
}

export interface Scene {
  id: string;
  title: string; // Short title for the scene
  storyPromptSeed: string; // Base text to seed Gemini for narrative generation
  imgPrompt: string;
  choices: Choice[];
  isGameOver?: boolean;
  isGameStart?: boolean;
}

export interface GameData {
  [key: string]: Scene;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}
