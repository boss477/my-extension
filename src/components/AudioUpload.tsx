import React, { useRef, useState } from 'react';
import { Play, Upload, X } from 'lucide-react';

interface AudioUploadProps {
  onAudioSelect: (audioFile: File) => void;
  onRemove: () => void;
  currentFileName?: string;
}

export default function AudioUpload({ onAudioSelect, onRemove, currentFileName }: AudioUploadProps) {
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAudioSelect(file);
      setPreviewAudio(new Audio(URL.createObjectURL(file)));
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewAudio) {
      previewAudio.currentTime = 0;
      previewAudio.play().catch(() => {});
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewAudio) {
      URL.revokeObjectURL(previewAudio.src);
      setPreviewAudio(null);
    }
    onRemove();
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-1.5 w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl text-xs transition-all duration-200 outline-none truncate"
        >
          <Upload className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate max-w-[120px]">
            {currentFileName || 'Upload Audio'}
          </span>
        </button>
        {currentFileName && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePreview}
              className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-white rounded-lg transition-colors"
              title="Preview Sound"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white rounded-lg transition-colors"
              title="Remove Custom Sound"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}