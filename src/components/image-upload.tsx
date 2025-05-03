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
  captureMode: 'upload' | 'camera'; // Add captureMode prop
}

const ImageUpload: React.FC<ImageUploadProps> = ({ previewUrl, onImageChange, isLoading, captureMode }) => {

  // Don't render this component if in camera mode and there's no preview yet
  // The camera view itself handles the initial state in camera mode.
  // Only show this in upload mode OR if a preview exists (either from upload or capture)
  if (captureMode === 'camera' && !previewUrl) {
      return null; // Render nothing, handled by camera view
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-border rounded-lg w-full md:w-64 h-64 justify-center relative overflow-hidden group">
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt={captureMode === 'upload' ? "Selected Leaf" : "Captured Leaf"}
          layout="fill"
          objectFit="cover"
          className={cn("transition-opacity duration-300", isLoading ? 'opacity-50' : 'opacity-100')}
          data-ai-hint="maize leaf"
        />
      ) : (
         // Only show placeholder text in upload mode when no preview
         captureMode === 'upload' && (
            <div className="text-center text-muted-foreground">
                <ImageIcon size={48} className="mx-auto mb-2" />
                <p>Upload an image</p>
            </div>
         )
      )}

        {/* Label for upload mode, or when preview exists in camera mode (to change) */}
        {(captureMode === 'upload' || (captureMode === 'camera' && previewUrl)) && (
            <Label
                htmlFor="image-upload"
                className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer",
                 // Make label always visible in upload mode when no image selected
                 captureMode === 'upload' && !previewUrl ? 'opacity-100 bg-transparent text-muted-foreground' : '',
                 // Adjust label text based on context
                 previewUrl ? '' : ''
                )}
            >
                <div className="text-center">
                <Upload size={32} className="mx-auto mb-1" />
                <span>{previewUrl ? 'Change Image' : 'Select Image'}</span>
                </div>
            </Label>
        )}

       {/* Input is only functionally needed for upload mode */}
       {captureMode === 'upload' && (
         <Input
            id="image-upload"
            type="file"
            accept="image/*"
            // Allow camera capture fallback even in upload mode
            capture="environment"
            onChange={onImageChange}
            className="sr-only" // Hide the default input visually
            disabled={isLoading}
        />
       )}
    </div>
  );
};

export default ImageUpload;
