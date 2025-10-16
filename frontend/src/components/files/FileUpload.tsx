import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { filesAPI } from '../../services/api';

interface FileUploadProps {
  projectId: number;
  onUploadComplete: () => void;
}

export default function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      // In production, upload to Supabase Storage
      // For now, we'll simulate with a data URL
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        try {
          await filesAPI.upload(projectId, {
            filename: selectedFile.name,
            file_path: reader.result as string, // In production: Supabase storage path
            file_size: selectedFile.size,
            file_type: selectedFile.type
          });

          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onUploadComplete();
        } catch (err: any) {
          setError(err.response?.data?.error || 'Upload failed');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setUploading(false);
      };
    } catch (err: any) {
      setError('Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Upload File</h3>
      </div>

      {/* File Input */}
      <div className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <Upload size={32} className="mx-auto text-text-secondary mb-2" />
          <p className="text-text-primary mb-1">
            {selectedFile ? selectedFile.name : 'Click to select file'}
          </p>
          <p className="text-sm text-text-secondary">Max size: 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-primary" />
              <div>
                <p className="text-text-primary font-medium">{selectedFile.name}</p>
                <p className="text-xs text-text-secondary">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
              className="p-2 text-text-secondary hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading && <Loader2 size={18} className="animate-spin" />}
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
}
