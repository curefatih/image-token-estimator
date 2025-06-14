import { useState, useEffect } from "react";
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
import { ModelPricingService } from "@/lib/model-pricing-service";
import type { ModelType, DetailLevel } from "@/lib/types";
import { Disclaimer } from "@/components/Disclaimer";

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
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [manualDimensions, setManualDimensions] = useState({
    width: "",
    height: "",
  });
  const [pricingService] = useState(() => new ModelPricingService());

  useEffect(() => {
    pricingService.initialize();
  }, [pricingService]);

  const selectedImage =
    images.find((img) => img.id === selectedImageId) || images[0];

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

    // For high detail, use the result from tokenService
    return {
      base: config.baseTokens,
      tile: result.tokens - config.baseTokens,
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
            const newImage = {
              id: Math.random().toString(36).substr(2, 9),
              src: e.target?.result as string,
              dimensions,
              tokens,
              detail: selectedDetail,
            };
            setImages((prev) => [...prev, newImage]);
            // Set as selected image if it's the first one
            if (images.length === 0) {
              setSelectedImageId(newImage.id);
            }
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
        detail: value,
        tokens: calculateTokens(img.dimensions, value),
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
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      // If we removed the selected image, select the first remaining one
      if (id === selectedImageId) {
        setSelectedImageId(newImages[0]?.id || null);
      }
      return newImages;
    });
  };

  const handleManualDimensionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const width = parseInt(manualDimensions.width);
    const height = parseInt(manualDimensions.height);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return;
    }

    const dimensions = { width, height };
    const tokens = calculateTokens(dimensions, selectedDetail);
    const newImage = {
      id: Math.random().toString(36).substr(2, 9),
      src: "", // Empty src for manually added dimensions
      dimensions,
      tokens,
      detail: selectedDetail,
    };
    setImages((prev) => [...prev, newImage]);
    if (images.length === 0) {
      setSelectedImageId(newImage.id);
    }
    setManualDimensions({ width: "", height: "" });
  };

  const calculateCost = (tokens: number) => {
    return pricingService.calculateCost(selectedModel, tokens);
  };

  const PlaceholderImage = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="text-center p-4">
        <div className="text-4xl mb-2">📐</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {width} × {height}px
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 overflow-auto lg:overflow-hidden">
      <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] max-w-[1920px] mx-auto bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-auto lg:overflow-hidden border-2 sm:border-4 border-gray-200 dark:border-gray-700">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Main content area with image preview */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-between gap-4 sm:gap-6 lg:overflow-y-auto">
            <div className="w-full flex-1 flex flex-col items-center gap-4 sm:gap-6 min-h-0">
              <div className="w-full h-[40vh] max-w-5xl border-2 sm:border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 relative group overflow-hidden">
                {selectedImage ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    {selectedImage.src ? (
                      <img
                        src={selectedImage.src}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-xl"
                      />
                    ) : (
                      <PlaceholderImage
                        width={selectedImage.dimensions.width}
                        height={selectedImage.dimensions.height}
                      />
                    )}
                  </div>
                ) : (
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
                )}
              </div>

              {images.length > 0 && (
                <div className="w-full flex-1">
                  <div className="w-full overflow-x-auto lg:max-h-[calc(100vh-40vh-12rem)] lg:overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Dimensions</TableHead>
                          <TableHead>Detail Level</TableHead>
                          <TableHead className="text-right">
                            Base Tokens
                          </TableHead>
                          <TableHead className="text-right">
                            Tile Tokens
                          </TableHead>
                          <TableHead className="text-right">
                            Total Tokens
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {images.map((image) => (
                          <TableRow
                            key={image.id}
                            className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                              image.id === selectedImageId
                                ? "bg-gray-100 dark:bg-gray-800"
                                : ""
                            }`}
                            onClick={() => setSelectedImageId(image.id)}
                          >
                            <TableCell>
                              {image.src ? (
                                <img
                                  src={image.src}
                                  alt="Preview"
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-lg">📐</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {image.dimensions.width}×
                                      {image.dimensions.height}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {image.dimensions.width}×{image.dimensions.height}
                              px
                            </TableCell>
                            <TableCell>
                              <div
                                onClick={(e: React.MouseEvent) =>
                                  e.stopPropagation()
                                }
                              >
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
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div>
                                <div className="font-medium">
                                  {Math.ceil(
                                    image.tokens.base
                                  ).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ${calculateCost(image.tokens.base).toFixed(6)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div>
                                <div className="font-medium">
                                  {Math.ceil(
                                    image.tokens.tile
                                  ).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ${calculateCost(image.tokens.tile).toFixed(6)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div>
                                <div className="font-medium">
                                  {Math.ceil(
                                    image.tokens.total
                                  ).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  $
                                  {calculateCost(image.tokens.total).toFixed(6)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(image.id);
                                }}
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
                </div>
              )}

              {images.length > 0 && (
                <div className="w-full mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Base Tokens
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {Math.ceil(
                            images.reduce(
                              (sum, img) => sum + img.tokens.base,
                              0
                            )
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          $
                          {calculateCost(
                            images.reduce(
                              (sum, img) => sum + img.tokens.base,
                              0
                            )
                          ).toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tile Tokens
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {Math.ceil(
                            images.reduce(
                              (sum, img) => sum + img.tokens.tile,
                              0
                            )
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          $
                          {calculateCost(
                            images.reduce(
                              (sum, img) => sum + img.tokens.tile,
                              0
                            )
                          ).toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Tokens
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {Math.ceil(
                            images.reduce(
                              (sum, img) => sum + img.tokens.total,
                              0
                            )
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          $
                          {calculateCost(
                            images.reduce(
                              (sum, img) => sum + img.tokens.total,
                              0
                            )
                          ).toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    {images.length} image{images.length > 1 ? "s" : ""} •{" "}
                    {selectedModel}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel with options */}
          <div className="w-full lg:w-80 xl:w-96 border-t-2 lg:border-t-0 lg:border-l-2 sm:border-t-4 sm:border-l-4 border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 lg:gap-8 bg-gray-50 dark:bg-gray-900/50 lg:overflow-y-auto">
            <div className="flex flex-col flex-1 min-h-0">
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
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">
                    Manual Dimensions
                  </label>
                  <form
                    onSubmit={handleManualDimensionsSubmit}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Width"
                        value={manualDimensions.width}
                        onChange={(e) =>
                          setManualDimensions((prev) => ({
                            ...prev,
                            width: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={manualDimensions.height}
                        onChange={(e) =>
                          setManualDimensions((prev) => ({
                            ...prev,
                            height: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                        min="1"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Add Dimensions
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setImages([]);
                  setSelectedImageId(null);
                }}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors mb-4"
              >
                Clear All Images
              </button>
              <Disclaimer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
