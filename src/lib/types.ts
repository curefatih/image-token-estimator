export type ModelType =
  | "gpt-4.1-mini"
  | "gpt-4.1-nano"
  | "o4-mini"
  | "gpt-4o"
  | "gpt-4.1"
  | "gpt-4o-mini"
  | "cua"
  | "o1"
  | "o1-pro"
  | "o3";

export type DetailLevel = "low" | "high";

export interface ImageData {
  id: string;
  src: string;
  dimensions: {
    width: number;
    height: number;
  };
  tokens: {
    base: number;
    tile: number;
    total: number;
  };
  detail: DetailLevel;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ModelConfig {
  baseTokens: number;
  tileTokens: number;
  multiplier?: number;
}

export interface TokenCalculationResult {
  tokens: number;
  scaledDimensions?: ImageDimensions;
}
