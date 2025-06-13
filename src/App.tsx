import { useState } from "react";
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
  const [inputMode, setInputMode] = useState<"upload" | "manual">("upload");
  const [manualWidth, setManualWidth] = useState<string>("");
  const [manualHeight, setManualHeight] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const calculateTokensFromDimensions = (width: number, height: number) => {
    const tokenService = new ImageTokenService();
    const result = tokenService.calculateTokens(
      { width, height },
      selectedModel,
      selectedDetail
    );
    setEstimatedTokens(result.tokens);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSelectedImage(e.target?.result as string);
          setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          calculateTokensFromDimensions(img.naturalWidth, img.naturalHeight);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualDimensionsChange = () => {
    const width = parseInt(manualWidth);
    const height = parseInt(manualHeight);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      calculateTokensFromDimensions(width, height);
    } else {
      setEstimatedTokens(null);
    }
  };

  const handleModelChange = (value: ModelType) => {
    setSelectedModel(value);
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width: img.naturalWidth, height: img.naturalHeight },
          value,
          selectedDetail
        );
        setEstimatedTokens(result.tokens);
      };
      img.src = selectedImage;
    } else if (manualWidth && manualHeight) {
      const width = parseInt(manualWidth);
      const height = parseInt(manualHeight);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width, height },
          value,
          selectedDetail
        );
        setEstimatedTokens(result.tokens);
      }
    }
  };

  const handleDetailChange = (value: DetailLevel) => {
    setSelectedDetail(value);
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width: img.naturalWidth, height: img.naturalHeight },
          selectedModel,
          value
        );
        setEstimatedTokens(result.tokens);
      };
      img.src = selectedImage;
    } else if (manualWidth && manualHeight) {
      const width = parseInt(manualWidth);
      const height = parseInt(manualHeight);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width, height },
          selectedModel,
          value
        );
        setEstimatedTokens(result.tokens);
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 overflow-hidden">
      <div className="h-full max-w-[1920px] mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700">
        <div className="h-full flex">
          {/* Main content area with image preview */}
          <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-md mb-4">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`px-4 py-2 rounded-lg ${
                    inputMode === "upload"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Upload Image
                </button>
                <button
                  onClick={() => setInputMode("manual")}
                  className={`px-4 py-2 rounded-lg ${
                    inputMode === "manual"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Manual Input
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <div className="w-full h-full max-h-[calc(100vh-12rem)] max-w-5xl aspect-square border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 relative group">
                {selectedImage ? (
                  <>
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
                  </>
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
            ) : (
              <div className="w-full max-w-md space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={manualWidth}
                      onChange={(e) => {
                        setManualWidth(e.target.value);
                        handleManualDimensionsChange();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Enter width"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={manualHeight}
                      onChange={(e) => {
                        setManualHeight(e.target.value);
                        handleManualDimensionsChange();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Enter height"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            )}

            {estimatedTokens !== null && (
              <div className="text-center space-y-2">
                <div className="text-xl bg-gray-100 dark:bg-gray-900 px-6 py-3 rounded-xl shadow-sm">
                  <span className="font-normal">Estimated tokens: </span>
                  <span className="font-bold">
                    {estimatedTokens.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="w-80 sm:w-96 border-l-4 border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 flex flex-col gap-8 bg-gray-50 dark:bg-gray-900/50">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Options
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Model
                  </label>
                  <Select
                    value={selectedModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 w-full">
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Detail Level
                  </label>
                  <Select
                    value={selectedDetail}
                    onValueChange={handleDetailChange}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 w-full">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
