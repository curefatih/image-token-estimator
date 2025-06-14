import type { ImageData, DetailLevel } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageTableProps {
  images: ImageData[];
  selectedImageId: string | null;
  onImageSelect: (id: string) => void;
  onDetailChange: (id: string, detail: DetailLevel) => void;
  onImageRemove: (id: string) => void;
  calculateCost: (tokens: number) => number;
}

export function ImageTable({
  images,
  selectedImageId,
  onImageSelect,
  onDetailChange,
  onImageRemove,
  calculateCost,
}: ImageTableProps) {
  return (
    <div className="w-full overflow-x-auto lg:max-h-[calc(100vh-40vh-12rem)] lg:overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Dimensions</TableHead>
            <TableHead>Detail Level</TableHead>
            <TableHead className="text-right">Base Tokens</TableHead>
            <TableHead className="text-right">Tile Tokens</TableHead>
            <TableHead className="text-right">Total Tokens</TableHead>
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
              onClick={() => onImageSelect(image.id)}
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
                        {image.dimensions.width}×{image.dimensions.height}
                      </div>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {image.dimensions.width}×{image.dimensions.height}px
              </TableCell>
              <TableCell>
                <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <Select
                    value={image.detail}
                    onValueChange={(value: DetailLevel) =>
                      onDetailChange(image.id, value)
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
                    {Math.ceil(image.tokens.base).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${calculateCost(image.tokens.base).toFixed(6)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <div className="font-medium">
                    {Math.ceil(image.tokens.tile).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${calculateCost(image.tokens.tile).toFixed(6)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <div className="font-medium">
                    {Math.ceil(image.tokens.total).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${calculateCost(image.tokens.total).toFixed(6)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageRemove(image.id);
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
  );
}
