import type { ImageData } from "@/lib/types";

interface ImageSummaryProps {
  images: ImageData[];
  selectedModel: string;
  calculateCost: (tokens: number) => number;
}

export function ImageSummary({
  images,
  selectedModel,
  calculateCost,
}: ImageSummaryProps) {
  const totalBaseTokens = images.reduce((sum, img) => sum + img.tokens.base, 0);
  const totalTileTokens = images.reduce((sum, img) => sum + img.tokens.tile, 0);
  const totalTokens = images.reduce((sum, img) => sum + img.tokens.total, 0);

  return (
    <div className="w-full mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Base Tokens
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.ceil(totalBaseTokens).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ${calculateCost(totalBaseTokens).toFixed(6)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tile Tokens
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.ceil(totalTileTokens).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ${calculateCost(totalTileTokens).toFixed(6)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Tokens
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.ceil(totalTokens).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ${calculateCost(totalTokens).toFixed(6)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {images.length} image{images.length > 1 ? "s" : ""} • {selectedModel}
      </div>
    </div>
  );
}
