import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageTokenService } from "@/lib/image-token-service";
import type { ModelType, DetailLevel } from "@/lib/types";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4.1");
  const [selectedDetail, setSelectedDetail] = useState<DetailLevel>("high");
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const [manualWidth, setManualWidth] = useState<string>("");
  const [manualHeight, setManualHeight] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (manualWidth && manualHeight) {
      const width = Number(manualWidth);
      const height = Number(manualHeight);
      console.log("Raw input values:", { manualWidth, manualHeight });
      console.log("Parsed values:", { width, height });
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        console.log("Manual dimensions change:", {
          width,
          height,
          model: selectedModel,
          detail: selectedDetail,
        });
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width, height },
          selectedModel,
          selectedDetail
        );
        console.log("Token calculation result:", result);
        setEstimatedTokens(result.tokens);
      } else {
        setEstimatedTokens(null);
      }
    }
  }, [manualWidth, manualHeight, selectedModel, selectedDetail]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSelectedImage(e.target?.result as string);
          const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          setImageDimensions(dimensions);
          const tokenService = new ImageTokenService();
          const result = tokenService.calculateTokens(
            dimensions,
            selectedModel,
            selectedDetail
          );
          setEstimatedTokens(result.tokens);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModelChange = (value: ModelType) => {
    console.log("Model change:", {
      newModel: value,
      currentDetail: selectedDetail,
      manualWidth,
      manualHeight,
    });
    setSelectedModel(value);
    if (selectedImage && imageDimensions) {
      const tokenService = new ImageTokenService();
      const result = tokenService.calculateTokens(
        imageDimensions,
        value,
        selectedDetail
      );
      console.log("Token calculation result (image):", result);
      setEstimatedTokens(result.tokens);
    } else if (manualWidth && manualHeight) {
      const width = Number(manualWidth);
      const height = Number(manualHeight);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width, height },
          value,
          selectedDetail
        );
        console.log("Token calculation result (manual):", result);
        setEstimatedTokens(result.tokens);
      }
    }
  };

  const handleDetailChange = (value: DetailLevel) => {
    console.log("Detail change:", {
      newDetail: value,
      currentModel: selectedModel,
      manualWidth,
      manualHeight,
    });
    setSelectedDetail(value);
    if (selectedImage && imageDimensions) {
      const tokenService = new ImageTokenService();
      const result = tokenService.calculateTokens(
        imageDimensions,
        selectedModel,
        value
      );
      console.log("Token calculation result (image):", result);
      setEstimatedTokens(result.tokens);
    } else if (manualWidth && manualHeight) {
      const width = Number(manualWidth);
      const height = Number(manualHeight);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width, height },
          selectedModel,
          value
        );
        console.log("Token calculation result (manual):", result);
        setEstimatedTokens(result.tokens);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] max-w-[1920px] mx-auto bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 sm:border-4 border-gray-200 dark:border-gray-700">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Main content area with image preview */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-between gap-4 sm:gap-6 overflow-y-auto">
            <div className="w-full flex-1 flex flex-col items-center gap-4 sm:gap-6 min-h-0">
              <div className="w-full h-full max-w-5xl border-2 sm:border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 relative group overflow-hidden">
                {selectedImage ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Change Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <div className="text-5xl mb-3">📁</div>
                      <div className="text-lg">Click to upload an image</div>
                      <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Supports JPG, PNG, GIF
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {estimatedTokens !== null && (
              <div className="w-full text-center space-y-2 px-2 sm:px-0 mt-auto">
                <div className="text-lg sm:text-xl bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-sm">
                  <span className="font-normal">Estimated tokens: </span>
                  <span className="font-bold">
                    {estimatedTokens.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Calculated for {selectedModel} with {selectedDetail} detail
                  level
                  {selectedImage && imageDimensions ? (
                    <span>
                      {" "}
                      (Image dimensions: {imageDimensions.width}×
                      {imageDimensions.height}px)
                    </span>
                  ) : (
                    <span>
                      {" "}
                      (Manual dimensions: {manualWidth}×{manualHeight}px)
                    </span>
                  )}
                </div>
              </div>
            )}
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
                    Detail Level
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
                <div>
                  <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Manual Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={manualWidth}
                        onChange={(e) => setManualWidth(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Width"
                        min="1"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={manualHeight}
                        onChange={(e) => setManualHeight(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Height"
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
