import { FileText, Image, Video, Music, File as FileIcon, Download, Trash2, MoreVertical, X } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface FileCardProps {
  file: any;
  onDelete?: (fileId: number) => void;
  canDelete?: boolean;
}

export default function FileCard({ file, onDelete, canDelete }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const getFileIcon = () => {
    const type = file.file_type || '';
    
    if (type.startsWith('image/')) return <Image size={24} className="text-blue-400" />;
    if (type.startsWith('video/')) return <Video size={24} className="text-purple-400" />;
    if (type.startsWith('audio/')) return <Music size={24} className="text-green-400" />;
    if (type.includes('pdf')) return <FileText size={24} className="text-red-400" />;
    return <FileIcon size={24} className="text-text-secondary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = file.file_type?.startsWith('image/');

  const handleDownload = () => {
    // In real implementation, fetch from Supabase Storage
    const link = document.createElement('a');
    link.href = file.file_path;
    link.download = file.filename;
    link.click();
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-all group">
        <div className="flex items-start gap-4">
          {/* File Icon/Preview */}
          <div 
            className="w-16 h-16 rounded-lg bg-background-secondary flex items-center justify-center flex-shrink-0 cursor-pointer"
            onClick={() => isImage && setShowPreview(true)}
          >
            {getFileIcon()}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary font-medium truncate mb-1">{file.filename}</h3>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span>{formatFileSize(file.file_size)}</span>
              <span>•</span>
              <span>{format(new Date(file.uploaded_at), 'MMM d, yyyy')}</span>
              {file.uploader && (
                <>
                  <span>•</span>
                  <span>{file.uploader.email}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background-secondary"
              title="Download"
            >
              <Download size={18} />
            </button>

            {canDelete && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-background-secondary"
                >
                  <MoreVertical size={18} />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this file?')) {
                            onDelete?.(file.id);
                          }
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background-secondary"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && isImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70"
            >
              <X size={24} />
            </button>
            <img 
              src={file.file_path} 
              alt={file.filename}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
