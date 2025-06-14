import type {
  ModelType,
  DetailLevel,
  ImageDimensions,
  ModelConfig,
  TokenCalculationResult,
} from "./types";

export class ImageTokenService {
  private static readonly PATCH_SIZE = 32;
  private static readonly MAX_PATCHES = 1536;
  private static readonly HIGH_DETAIL_MAX_SIZE = 2048;
  private static readonly HIGH_DETAIL_MIN_SIZE = 768;
  private static readonly HIGH_DETAIL_TILE_SIZE = 512;

  public static readonly MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
    "gpt-4.1-mini": { baseTokens: 0, tileTokens: 0, multiplier: 1.62 },
    "gpt-4.1-nano": { baseTokens: 0, tileTokens: 0, multiplier: 2.46 },
    "o4-mini": { baseTokens: 0, tileTokens: 0, multiplier: 1.72 },
    "gpt-4o": { baseTokens: 85, tileTokens: 170 },
    "gpt-4.1": { baseTokens: 85, tileTokens: 170 },
    "gpt-4o-mini": { baseTokens: 2833, tileTokens: 5667 },
    o1: { baseTokens: 75, tileTokens: 150 },
    "o1-pro": { baseTokens: 75, tileTokens: 150 },
    o3: { baseTokens: 75, tileTokens: 150 },
    cua: { baseTokens: 65, tileTokens: 129 },
  };

  public getModelConfig(model: ModelType): ModelConfig {
    return ImageTokenService.MODEL_CONFIGS[model];
  }

  public calculateTokens(
    dimensions: ImageDimensions,
    model: ModelType,
    detail: DetailLevel = "high"
  ): TokenCalculationResult {
    const config = ImageTokenService.MODEL_CONFIGS[model];

    // Handle models with multipliers (gpt-4.1-mini, gpt-4.1-nano, o4-mini)
    if (config.multiplier) {
      return this.calculateTokensWithMultiplier(dimensions, config.multiplier);
    }

    // Handle other models
    if (detail === "low") {
      return { tokens: config.baseTokens };
    }

    return this.calculateHighDetailTokens(dimensions, config);
  }

  private calculateTokensWithMultiplier(
    dimensions: ImageDimensions,
    multiplier: number
  ): TokenCalculationResult {
    const { width, height } = dimensions;

    // Calculate initial number of patches
    const patchesX = Math.ceil(
      (width + ImageTokenService.PATCH_SIZE - 1) / ImageTokenService.PATCH_SIZE
    );
    const patchesY = Math.ceil(
      (height + ImageTokenService.PATCH_SIZE - 1) / ImageTokenService.PATCH_SIZE
    );
    let totalPatches = patchesX * patchesY;
    let scaledDimensions = { ...dimensions };

    // If patches exceed max, scale down the image
    if (totalPatches > ImageTokenService.MAX_PATCHES) {
      // Calculate shrink factor to fit within max patches
      const shrinkFactor = Math.sqrt(
        (ImageTokenService.MAX_PATCHES *
          Math.pow(ImageTokenService.PATCH_SIZE, 2)) /
          (width * height)
      );

      // Apply initial scaling
      let newWidth = Math.floor(width * shrinkFactor);
      let newHeight = Math.floor(height * shrinkFactor);

      // Calculate new patches after initial scaling
      let newPatchesX = Math.ceil(
        (newWidth + ImageTokenService.PATCH_SIZE - 1) /
          ImageTokenService.PATCH_SIZE
      );
      let newPatchesY = Math.ceil(
        (newHeight + ImageTokenService.PATCH_SIZE - 1) /
          ImageTokenService.PATCH_SIZE
      );

      // Fine-tune scaling to ensure whole number of patches
      const widthScale =
        newPatchesX / (newWidth / ImageTokenService.PATCH_SIZE);
      newWidth = Math.floor(newWidth * widthScale);
      newHeight = Math.floor(newHeight * widthScale);

      // Recalculate final patches
      newPatchesX = Math.ceil(
        (newWidth + ImageTokenService.PATCH_SIZE - 1) /
          ImageTokenService.PATCH_SIZE
      );
      newPatchesY = Math.ceil(
        (newHeight + ImageTokenService.PATCH_SIZE - 1) /
          ImageTokenService.PATCH_SIZE
      );
      totalPatches = newPatchesX * newPatchesY;

      scaledDimensions = { width: newWidth, height: newHeight };
    }

    // Apply multiplier to get final token count
    return {
      tokens:
        Math.min(totalPatches, ImageTokenService.MAX_PATCHES) * multiplier,
      scaledDimensions,
    };
  }

  private calculateHighDetailTokens(
    dimensions: ImageDimensions,
    config: ModelConfig
  ): TokenCalculationResult {
    let { width, height } = dimensions;
    let scaledDimensions = { ...dimensions };

    // Scale to fit in 2048x2048 square
    if (
      width > ImageTokenService.HIGH_DETAIL_MAX_SIZE ||
      height > ImageTokenService.HIGH_DETAIL_MAX_SIZE
    ) {
      const scale =
        ImageTokenService.HIGH_DETAIL_MAX_SIZE / Math.max(width, height);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      scaledDimensions = { width, height };
    }

    // Scale shortest side to 768px
    const shortestSide = Math.min(width, height);
    if (shortestSide > ImageTokenService.HIGH_DETAIL_MIN_SIZE) {
      const scale = ImageTokenService.HIGH_DETAIL_MIN_SIZE / shortestSide;
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      scaledDimensions = { width, height };
    }

    // Calculate number of 512px tiles
    const tilesX = Math.ceil(width / ImageTokenService.HIGH_DETAIL_TILE_SIZE);
    const tilesY = Math.ceil(height / ImageTokenService.HIGH_DETAIL_TILE_SIZE);
    const totalTiles = tilesX * tilesY;

    return {
      tokens: config.baseTokens + config.tileTokens * totalTiles,
      scaledDimensions,
    };
  }
}
