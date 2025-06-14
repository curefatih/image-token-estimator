import type { ImageData } from "@/lib/types";

interface ImagePreviewProps {
  selectedImage: ImageData | null;
  onUploadClick: () => void;
}

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

export function ImagePreview({
  selectedImage,
  onUploadClick,
}: ImagePreviewProps) {
  return (
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
          <label
            onClick={onUploadClick}
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
  );
}
