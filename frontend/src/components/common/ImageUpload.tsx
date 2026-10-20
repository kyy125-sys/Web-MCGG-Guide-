import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadApi } from '../../api/upload';
import toast from 'react-hot-toast';

interface Props {
  currentUrl?: string;
  entityType: 'hero' | 'commander' | 'synergy';
  entityId?: string;
  onUpload: (url: string) => void;
}

export function ImageUpload({ currentUrl, entityType, entityId, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const folderMap = { hero: 'heroes', commander: 'commanders', synergy: 'synergies' };
      const { data } = await uploadApi.upload(file, folderMap[entityType], entityId, entityType);
      onUpload(data.imageUrl);
      toast.success('Image uploaded!');
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="w-full h-40 border-2 border-dashed border-mcgg-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-mcgg-gold transition-colors relative overflow-hidden bg-gray-900/50"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload size={24} className="text-white" />
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <Upload size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Click or drag image</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mcgg-gold" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
