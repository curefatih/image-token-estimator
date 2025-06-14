import type { ModelType, DetailLevel } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Disclaimer } from "@/components/Disclaimer";
import { ManualDimensionsForm } from "@/components/ManualDimensionsForm";
import { useState } from "react";

interface OptionsPanelProps {
  selectedModel: ModelType;
  selectedDetail: DetailLevel;
  onModelChange: (value: ModelType) => void;
  onDetailChange: (value: DetailLevel) => void;
  onAddMoreClick: () => void;
  onClearAllClick: () => void;
  hasImages: boolean;
  onManualDimensionsSubmit: (width: number, height: number) => void;
}

export function OptionsPanel({
  selectedModel,
  selectedDetail,
  onModelChange,
  onDetailChange,
  onAddMoreClick,
  onClearAllClick,
  hasImages,
  onManualDimensionsSubmit,
}: OptionsPanelProps) {
  const [manualDimensions, setManualDimensions] = useState({
    width: "",
    height: "",
  });

  const handleManualDimensionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const width = parseInt(manualDimensions.width);
    const height = parseInt(manualDimensions.height);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return;
    }

    onManualDimensionsSubmit(width, height);
    setManualDimensions({ width: "", height: "" });
  };

  return (
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
            <Select value={selectedModel} onValueChange={onModelChange}>
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
            <Select value={selectedDetail} onValueChange={onDetailChange}>
              <SelectTrigger className="bg-white dark:bg-gray-800 w-full text-sm sm:text-base">
                <SelectValue placeholder="Select detail level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ManualDimensionsForm
            width={manualDimensions.width}
            height={manualDimensions.height}
            onWidthChange={(value) =>
              setManualDimensions((prev) => ({ ...prev, width: value }))
            }
            onHeightChange={(value) =>
              setManualDimensions((prev) => ({ ...prev, height: value }))
            }
            onSubmit={handleManualDimensionsSubmit}
          />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {hasImages && (
            <button
              onClick={onAddMoreClick}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Add More Images
            </button>
          )}
          <button
            onClick={onClearAllClick}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Clear All Images
          </button>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}
