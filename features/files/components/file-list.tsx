'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@chat/ui';
import {
  IconDownload,
  IconTrash,
  IconEye,
  IconExternalLink,
  IconFilter,
  IconSearch,
  IconFile,
  IconPhoto,
  IconFileText,
  IconTable,
  IconPresentation,
  IconFileZip,
  IconCode,
  IconCalendar,
  IconUser,
  IconFolder,
  IconTag,
  IconLoader2,
  IconAlertTriangle,
  IconX,
  IconShare,
} from '@tabler/icons-react';
import { formatFileSize, getFileTypeCategory } from '../lib/client-utils';
import { format } from 'date-fns';
import { FileShareModal } from './file-share-modal';

interface FileRecord {
  file: {
    id: string;
    originalName: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
    updatedAt: string;
  };
  uploader: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  task: {
    id: string;
    title: string;
  } | null;
}

interface FileListProps {
  projectId?: string;
  taskId?: string;
  files?: FileRecord[];
  onFileDeleted?: (fileId: string) => void;
  className?: string;
  showProjectInfo?: boolean;
  showTaskInfo?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';
type FilterBy = 'all' | 'image' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'code';

const getFileIcon = (type: string, mimeType: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  
  // Special handling for common file types
  if (mimeType === 'application/pdf') {
    return <IconFileText className={`${sizeClass} text-red-500`} />;
  }
  
  switch (type) {
    case 'image': return <IconPhoto className={`${sizeClass} text-blue-500`} />;
    case 'document': return <IconFileText className={`${sizeClass} text-blue-600`} />;
    case 'spreadsheet': return <IconTable className={`${sizeClass} text-green-600`} />;
    case 'presentation': return <IconPresentation className={`${sizeClass} text-orange-500`} />;
    case 'archive': return <IconFileZip className={`${sizeClass} text-yellow-600`} />;
    case 'code': return <IconCode className={`${sizeClass} text-purple-500`} />;
    default: return <IconFile className={`${sizeClass} text-gray-500`} />;
  }
};

const isImageFile = (mimeType: string) => mimeType.startsWith('image/');

export function FileList({ 
  projectId, 
  taskId, 
  files: providedFiles,
  onFileDeleted, 
  className = '',
  showProjectInfo = false,
  showTaskInfo = false 
}: FileListProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [shareModalFile, setShareModalFile] = useState<FileRecord | null>(null);

  useEffect(() => {
    if (providedFiles) {
      setFiles(providedFiles);
      setLoading(false);
    } else {
      fetchFiles();
    }
  }, [projectId, taskId, providedFiles]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (taskId) params.append('taskId', taskId);

      const response = await fetch(`/api/files?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileRecord) => {
    try {
      const response = await fetch(`/api/files/${file.file.id}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (file: FileRecord) => {
    if (!confirm(`Are you sure you want to delete "${file.file.originalName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${file.file.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setFiles(prev => prev.filter(f => f.file.id !== file.file.id));
      onFileDeleted?.(file.file.id);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
    }
  };

  const handlePreview = (file: FileRecord) => {
    if (isImageFile(file.file.mimeType)) {
      setPreviewFile(file);
    } else {
      // For non-images, open in new tab
      window.open(file.file.filePath, '_blank');
    }
  };

  const filteredAndSortedFiles = files
    .filter(file => {
      // Filter by search query
      if (searchQuery && !file.file.originalName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by file type
      if (filterBy !== 'all' && file.file.fileType !== filterBy) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file.originalName.localeCompare(b.file.originalName);
        case 'size':
          return b.file.fileSize - a.file.fileSize;
        case 'type':
          return a.file.fileType.localeCompare(b.file.fileType);
        case 'date':
        default:
          return new Date(b.file.createdAt).getTime() - new Date(a.file.createdAt).getTime();
      }
    });

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === filteredAndSortedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map(f => f.file.id)));
    }
  };

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">Loading files...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center text-red-600">
          <IconAlertTriangle className="h-8 w-8" />
          <span className="ml-3">{error}</span>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={fetchFiles}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid="file-list">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterBy)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="presentation">Presentations</option>
              <option value="archive">Archives</option>
              <option value="code">Code Files</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                Grid
              </Button>
            </div>
          </div>
        </div>

        {filteredAndSortedFiles.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
              {selectedFiles.size > 0 && ` (${selectedFiles.size} selected)`}
            </div>
            
            {filteredAndSortedFiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllFiles}
              >
                {selectedFiles.size === filteredAndSortedFiles.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* File List/Grid */}
      {filteredAndSortedFiles.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <IconFile className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm mt-1">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload some files to get started'}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAndSortedFiles.map((fileRecord) => (
                <div
                  key={fileRecord.file.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                    selectedFiles.has(fileRecord.file.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => toggleFileSelection(fileRecord.file.id)}
                >
                  <div className="space-y-3">
                    {/* File Icon/Thumbnail */}
                    <div className="flex justify-center">
                      {isImageFile(fileRecord.file.mimeType) ? (
                        <img
                          src={fileRecord.file.filePath}
                          alt={fileRecord.file.originalName}
                          className="h-16 w-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.removeAttribute('style');
                          }}
                        />
                      ) : (
                        getFileIcon(fileRecord.file.fileType, fileRecord.file.mimeType, 'lg')
                      )}
                    </div>

                    {/* File Info */}
                    <div className="text-center">
                      <p className="font-medium text-sm truncate" title={fileRecord.file.originalName}>
                        {fileRecord.file.originalName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(fileRecord.file.fileSize)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(fileRecord);
                        }}
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(fileRecord);
                        }}
                      >
                        <IconDownload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(fileRecord);
                        }}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedFiles.map((fileRecord) => (
                <div
                  key={fileRecord.file.id}
                  className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedFiles.has(fileRecord.file.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  data-testid="file-item"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(fileRecord.file.id)}
                    onChange={() => toggleFileSelection(fileRecord.file.id)}
                    className="rounded"
                  />

                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(fileRecord.file.fileType, fileRecord.file.mimeType)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate" data-testid="file-name">{fileRecord.file.originalName}</p>
                      {showProjectInfo && fileRecord.project && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded">
                          <IconFolder className="h-3 w-3" />
                          {fileRecord.project.name}
                        </span>
                      )}
                      {showTaskInfo && fileRecord.task && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">
                          <IconTag className="h-3 w-3" />
                          {fileRecord.task.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span data-testid="file-size">{formatFileSize(fileRecord.file.fileSize)}</span>
                      <span className="flex items-center gap-1" data-testid="file-date">
                        <IconCalendar className="h-3 w-3" />
                        {format(new Date(fileRecord.file.createdAt), 'MMM d, yyyy')}
                      </span>
                      {fileRecord.uploader && (
                        <span className="flex items-center gap-1" data-testid="file-uploader">
                          <IconUser className="h-3 w-3" />
                          {fileRecord.uploader.name || fileRecord.uploader.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(fileRecord)}
                      title="Preview"
                      data-testid="preview-button"
                    >
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(fileRecord)}
                      title="Download"
                      data-testid="download-button"
                    >
                      <IconDownload className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShareModalFile(fileRecord)}
                      title="Share to Project"
                      data-testid="share-button"
                    >
                      <IconShare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(fileRecord)}
                      title="Delete"
                      data-testid="delete-button"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Image Preview Modal */}
      {previewFile && isImageFile(previewFile.file.mimeType) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewFile(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <IconX className="h-6 w-6" />
            </Button>
            <img
              src={previewFile.file.filePath}
              alt={previewFile.file.originalName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg">
              <p className="font-medium">{previewFile.file.originalName}</p>
              <p className="text-sm opacity-75">
                {formatFileSize(previewFile.file.fileSize)} • 
                {format(new Date(previewFile.file.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Share Modal */}
      {shareModalFile && (
        <FileShareModal
          fileId={shareModalFile.file.id}
          fileName={shareModalFile.file.originalName}
          currentProjectId={shareModalFile.project?.id}
          currentTaskId={shareModalFile.task?.id}
          isOpen={true}
          onClose={() => setShareModalFile(null)}
          onSuccess={() => {
            // Refresh the file list if we're not using provided files
            if (!providedFiles) {
              fetchFiles();
            }
            setShareModalFile(null);
          }}
        />
      )}
    </div>
  );
}