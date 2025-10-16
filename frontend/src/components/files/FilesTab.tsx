import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import FileCard from './FileCard';
import FileUpload from './FileUpload';
import { filesAPI } from '../../services/api';

interface FilesTabProps {
  projectId: number;
  canUpload?: boolean;
  onFilesUpdate?: () => void;
}

export default function FilesTab({ projectId, canUpload = true, onFilesUpdate }: FilesTabProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await filesAPI.getByProject(projectId);
      setFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleDelete = async (fileId: number) => {
    try {
      await filesAPI.delete(fileId);
      onFilesUpdate?.();
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {canUpload && (
        <FileUpload 
          projectId={projectId}
          onUploadComplete={() => {
            fetchFiles();
            setShowUpload(false);
            onFilesUpdate?.();
          }}
        />
      )}

      {/* Files List */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Files ({files.length})
        </h3>

        {files.length > 0 ? (
          <div className="grid gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={handleDelete}
                canDelete={canUpload}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface border border-border rounded-lg">
            <FileText size={48} className="mx-auto text-text-tertiary mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No files yet
            </h3>
            <p className="text-text-secondary">
              Upload files to share with your team
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
