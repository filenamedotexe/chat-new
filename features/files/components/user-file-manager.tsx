'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@chat/ui';
import {
  IconSearch,
  IconFilter,
  IconUser,
  IconFolders,
  IconFiles,
  IconDownload,
  IconShare,
  IconTrash,
  IconEye,
} from '@tabler/icons-react';
import { FileList } from './file-list';
import { formatFileSize } from '../lib/client-utils';

interface UserFileManagerProps {
  userId: string;
  className?: string;
}

interface FileSummary {
  totalFiles: number;
  totalSizeBytes: number;
  filesByType: Record<string, number>;
  recentUploads: any[];
  filesByProject: Record<string, number>;
}

export function UserFileManager({ userId, className }: UserFileManagerProps) {
  const [summary, setSummary] = useState<FileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [showShareableFiles, setShowShareableFiles] = useState(false);

  // Load user file summary
  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/files?action=summary`);
        
        if (!response.ok) {
          throw new Error('Failed to load file summary');
        }
        
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [userId]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your files...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="user-file-manager">
      {/* File Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4" data-testid="total-files-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconFiles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-xl font-semibold" data-testid="total-files-count">{summary.totalFiles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="total-size-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <IconDownload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-xl font-semibold">{formatFileSize(summary.totalSizeBytes)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="recent-files-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconFolders className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Projects</p>
                <p className="text-xl font-semibold">{Object.keys(summary.filesByProject).length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* File Type Breakdown */}
      {summary && Object.keys(summary.filesByType).length > 0 && (
        <Card className="p-4" data-testid="files-by-type">
          <h3 className="font-medium mb-3">Files by Type</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.filesByType).map(([type, count]) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize"
                data-testid="file-type-badge"
              >
                {type}: {count}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="file-search"
              />
            </div>
          </div>

          {/* File Type Filter */}
          <div className="sm:w-48">
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              data-testid="file-type-filter"
            >
              <option value="">All Types</option>
              {summary && Object.keys(summary.filesByType).map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <Button
            variant={showShareableFiles ? 'primary' : 'outline'}
            onClick={() => setShowShareableFiles(!showShareableFiles)}
            className="flex items-center gap-2"
            data-testid="view-toggle"
          >
            <IconShare className="h-4 w-4" />
            {showShareableFiles ? 'Show All Files' : 'Show Shareable'}
          </Button>
        </div>
      </Card>

      {/* File List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {showShareableFiles ? 'Files Available for Sharing' : 'My Files'}
          </h3>
          <div className="text-sm text-gray-500">
            {summary?.totalFiles || 0} files total
          </div>
        </div>

        <UserFileList
          userId={userId}
          searchTerm={searchTerm}
          fileType={selectedFileType}
          showShareableFiles={showShareableFiles}
          onFileDeleted={() => {
            // Refresh summary when a file is deleted
            window.location.reload();
          }}
        />
      </Card>
    </div>
  );
}

interface UserFileListProps {
  userId: string;
  searchTerm: string;
  fileType: string;
  showShareableFiles: boolean;
  onFileDeleted?: () => void;
}

function UserFileList({ 
  userId, 
  searchTerm, 
  fileType, 
  showShareableFiles,
  onFileDeleted
}: UserFileListProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (fileType) params.set('fileType', fileType);
        if (showShareableFiles) params.set('action', 'shareable');

        const response = await fetch(`/api/users/${userId}/files?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to load files');
        }
        
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(loadFiles, 300);
    return () => clearTimeout(timeoutId);
  }, [userId, searchTerm, fileType, showShareableFiles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <IconFiles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          {searchTerm || fileType ? 'No files match your filters' : 'No files uploaded yet'}
        </p>
      </div>
    );
  }

  // Transform files to match FileList component interface
  const transformedFiles = files.map(item => ({
    file: {
      ...item.file,
      // Ensure compatibility with existing FileList component
      id: item.file.id,
      originalName: item.file.originalName,
      fileName: item.file.fileName,
      filePath: item.file.filePath,
      mimeType: item.file.mimeType,
      fileType: item.file.fileType,
      fileSize: item.file.fileSize,
      createdAt: item.file.createdAt,
      updatedAt: item.file.updatedAt,
    },
    uploader: item.uploader,
    project: item.project,
    task: item.task,
  }));

  return (
    <FileList
      files={transformedFiles}
      onFileDeleted={onFileDeleted}
      showProjectInfo={true}
      showTaskInfo={true}
    />
  );
}