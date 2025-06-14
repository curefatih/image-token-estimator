interface ManualDimensionsFormProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ManualDimensionsForm({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onSubmit,
}: ManualDimensionsFormProps) {
  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">
        Manual Dimensions
      </label>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Width"
            value={width}
            onChange={(e) => onWidthChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
            min="1"
          />
          <input
            type="number"
            placeholder="Height"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
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
  );
}
