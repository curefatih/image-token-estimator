import { useState, useEffect, useRef } from "react";
import type { ModelType, DetailLevel, ImageData } from "@/lib/types";
import { ImageTokenService } from "@/lib/image-token-service";
import { ModelPricingService } from "@/lib/model-pricing-service";
import { ImagePreview } from "@/components/ImagePreview";
import { ImageTable } from "@/components/ImageTable";
import { ImageSummary } from "@/components/ImageSummary";
import { OptionsPanel } from "@/components/OptionsPanel";

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4.1");
  const [selectedDetail, setSelectedDetail] = useState<DetailLevel>("high");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [pricingService] = useState(() => new ModelPricingService());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            if (images.length === 0) {
              setSelectedImageId(newImage.id);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      event.target.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
      if (id === selectedImageId) {
        setSelectedImageId(newImages[0]?.id || null);
      }
      return newImages;
    });
  };

  const calculateCost = (tokens: number) => {
    return pricingService.calculateCost(selectedModel, tokens);
  };

  const handleManualDimensionsSubmit = (width: number, height: number) => {
    const dimensions = { width, height };
    const tokens = calculateTokens(dimensions, selectedDetail);
    const newImage = {
      id: Math.random().toString(36).substr(2, 9),
      src: "",
      dimensions,
      tokens,
      detail: selectedDetail,
    };
    setImages((prev) => [...prev, newImage]);
    if (images.length === 0) {
      setSelectedImageId(newImage.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 overflow-auto lg:overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        multiple
      />
      <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] max-w-[1920px] mx-auto bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-auto lg:overflow-hidden border-2 sm:border-4 border-gray-200 dark:border-gray-700">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Main content area with image preview */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-between gap-4 sm:gap-6 lg:overflow-y-auto">
            <div className="w-full flex-1 flex flex-col items-center gap-4 sm:gap-6 min-h-0">
              <ImagePreview
                selectedImage={selectedImage}
                onUploadClick={triggerFileInput}
              />

              {images.length > 0 && (
                <>
                  <div className="w-full flex-1">
                    <ImageTable
                      images={images}
                      selectedImageId={selectedImageId}
                      onImageSelect={setSelectedImageId}
                      onDetailChange={handleImageDetailChange}
                      onImageRemove={removeImage}
                      calculateCost={calculateCost}
                    />
                  </div>

                  <ImageSummary
                    images={images}
                    selectedModel={selectedModel}
                    calculateCost={calculateCost}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right panel with options */}
          <OptionsPanel
            selectedModel={selectedModel}
            selectedDetail={selectedDetail}
            onModelChange={handleModelChange}
            onDetailChange={handleDetailChange}
            onAddMoreClick={triggerFileInput}
            onClearAllClick={() => {
              setImages([]);
              setSelectedImageId(null);
            }}
            hasImages={images.length > 0}
            onManualDimensionsSubmit={handleManualDimensionsSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
