import type { ChangeEventHandler } from 'react';
import React from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  previewUrl: string | null;
  onImageChange: ChangeEventHandler<HTMLInputElement>;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ previewUrl, onImageChange, isLoading }) => {
  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-border rounded-lg w-full md:w-64 h-64 justify-center relative overflow-hidden group">
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Selected Leaf"
          layout="fill"
          objectFit="cover"
          className={cn("transition-opacity duration-300", isLoading ? 'opacity-50' : 'opacity-100')}
          data-ai-hint="maize leaf"
        />
      ) : (
        <div className="text-center text-muted-foreground">
          <ImageIcon size={48} className="mx-auto mb-2" />
          <p>Upload or capture an image</p>
        </div>
      )}

      <Label
        htmlFor="image-upload"
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer",
          previewUrl ? '' : 'opacity-100 bg-transparent text-muted-foreground' // Ensure label is visible when no image
        )}
      >
        <div className="text-center">
          <Upload size={32} className="mx-auto mb-1" />
          <span>{previewUrl ? 'Change Image' : 'Select Image'}</span>
        </div>
      </Label>
      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        capture="environment" // Prioritize back camera on mobile
        onChange={onImageChange}
        className="sr-only" // Hide the default input visually
        disabled={isLoading}
      />
    </div>
  );
};

export default ImageUpload;
