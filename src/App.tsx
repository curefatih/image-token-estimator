import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageTokenService } from "@/lib/image-token-service";
import type { ModelType, DetailLevel } from "@/lib/types";

interface ImageData {
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

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4.1");
  const [selectedDetail, setSelectedDetail] = useState<DetailLevel>("high");

  const calculateTokens = (
    dimensions: { width: number; height: number },
    detail: DetailLevel
  ) => {
    const tokenService = new ImageTokenService();
    const result = tokenService.calculateTokens(
      dimensions,
      selectedModel,
      detail
    );
    const config = tokenService.getModelConfig(selectedModel);

    if (config.multiplier) {
      return {
        base: 0,
        tile: result.tokens,
        total: result.tokens,
      };
    }

    if (detail === "low") {
      return {
        base: result.tokens,
        tile: 0,
        total: result.tokens,
      };
    }

    const totalTiles =
      Math.ceil(dimensions.width / 512) * Math.ceil(dimensions.height / 512);
    return {
      base: config.baseTokens,
      tile: config.tileTokens * totalTiles,
      total: result.tokens,
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const dimensions = {
              width: img.naturalWidth,
              height: img.naturalHeight,
            };
            const tokens = calculateTokens(dimensions, selectedDetail);
            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substr(2, 9),
                src: e.target?.result as string,
                dimensions,
                tokens,
                detail: selectedDetail,
              },
            ]);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleModelChange = (value: ModelType) => {
    setSelectedModel(value);
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        tokens: calculateTokens(img.dimensions, img.detail),
      }))
    );
  };

  const handleDetailChange = (value: DetailLevel) => {
    setSelectedDetail(value);
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        tokens: calculateTokens(img.dimensions, img.detail),
      }))
    );
  };

  const handleImageDetailChange = (id: string, value: DetailLevel) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              detail: value,
              tokens: calculateTokens(img.dimensions, value),
            }
          : img
      )
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] max-w-[1920px] mx-auto bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 sm:border-4 border-gray-200 dark:border-gray-700">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Main content area with image preview */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-between gap-4 sm:gap-6 overflow-y-auto">
            <div className="w-full flex-1 flex flex-col items-center gap-4 sm:gap-6 min-h-0">
              <div className="w-full h-full max-w-5xl border-2 sm:border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 relative group overflow-hidden">
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    multiple
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <div className="text-5xl mb-3">📁</div>
                    <div className="text-lg">Click to upload images</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Supports JPG, PNG, GIF
                    </div>
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Detail Level</TableHead>
                        <TableHead>Base Tokens</TableHead>
                        <TableHead>Tile Tokens</TableHead>
                        <TableHead>Total Tokens</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {images.map((image) => (
                        <TableRow key={image.id}>
                          <TableCell>
                            <img
                              src={image.src}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>
                            {image.dimensions.width}×{image.dimensions.height}px
                          </TableCell>
                          <TableCell>
                            <Select
                              value={image.detail}
                              onValueChange={(value: DetailLevel) =>
                                handleImageDetailChange(image.id, value)
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{image.tokens.base}</TableCell>
                          <TableCell>{image.tokens.tile}</TableCell>
                          <TableCell>{image.tokens.total}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => removeImage(image.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* Right panel with options */}
          <div className="w-full lg:w-80 xl:w-96 border-t-2 lg:border-t-0 lg:border-l-2 sm:border-t-4 sm:border-l-4 border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 lg:gap-8 bg-gray-50 dark:bg-gray-900/50">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                Options
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">
                    Model
                  </label>
                  <Select
                    value={selectedModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 w-full text-sm sm:text-base">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
                      <SelectItem value="gpt-4.1-nano">GPT-4.1 Nano</SelectItem>
                      <SelectItem value="o4-mini">O4 Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                      <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                      <SelectItem value="cua">CUA</SelectItem>
                      <SelectItem value="o1">O1</SelectItem>
                      <SelectItem value="o1-pro">O1 Pro</SelectItem>
                      <SelectItem value="o3">O3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">
                    Default Detail Level
                  </label>
                  <Select
                    value={selectedDetail}
                    onValueChange={handleDetailChange}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 w-full text-sm sm:text-base">
                      <SelectValue placeholder="Select detail level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                These estimates are based on{" "}
                <a
                  href="https://platform.openai.com/docs/guides/images-vision?api-mode=responses#calculating-costs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  OpenAI's documentation
                </a>
                . We do not accept any responsibility for the accuracy of these
                estimates.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Want to contribute or report issues? Visit our{" "}
                <a
                  href="https://github.com/curefatih/image-token-estimator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
