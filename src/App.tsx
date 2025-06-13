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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSelectedImage(e.target?.result as string);
          const tokenService = new ImageTokenService();
          const result = tokenService.calculateTokens(
            { width: img.width, height: img.height },
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
    setSelectedModel(value);
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width: img.width, height: img.height },
          value,
          selectedDetail
        );
        setEstimatedTokens(result.tokens);
      };
      img.src = selectedImage;
    }
  };

  const handleDetailChange = (value: DetailLevel) => {
    setSelectedDetail(value);
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        const tokenService = new ImageTokenService();
        const result = tokenService.calculateTokens(
          { width: img.width, height: img.height },
          selectedModel,
          value
        );
        setEstimatedTokens(result.tokens);
      };
      img.src = selectedImage;
    }
  };

  return (
    <div className="flex min-h-svh">
      {/* Main content area with image preview */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-3xl aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
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
                className="cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <div className="text-4xl mb-2">📁</div>
                <div>Click to upload an image</div>
              </label>
            </div>
          )}
        </div>
        {estimatedTokens !== null && (
          <div className="text-lg font-medium">
            Estimated tokens: {estimatedTokens.toLocaleString()}
          </div>
        )}
      </div>

      {/* Right panel with options */}
      <div className="w-80 border-l border-gray-200 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
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
              <label className="block text-sm font-medium mb-2">
                Detail Level
              </label>
              <Select value={selectedDetail} onValueChange={handleDetailChange}>
                <SelectTrigger>
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
  );
}

export default App;
