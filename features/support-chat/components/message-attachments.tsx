import React from 'react';
import { Download, FileText, Image, FileArchive, FileSpreadsheet, FileIcon } from 'lucide-react';
import type { MessageAttachment } from '../types';

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  className?: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return Image;
  }
  if (mimeType.includes('pdf')) {
    return FileText;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return FileSpreadsheet;
  }
  if (mimeType.includes('zip') || mimeType.includes('archive')) {
    return FileArchive;
  }
  return FileIcon;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function MessageAttachments({ attachments, className = '' }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 space-y-2 ${className}`} data-testid="message-attachments">
      {attachments.map((attachment) => {
        const FileIconComponent = getFileIcon(attachment.mimeType);
        
        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors"
            data-testid="message-attachment"
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              <FileIconComponent className="w-5 h-5 text-muted-foreground" />
            </div>
            
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {attachment.originalName}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(attachment.fileSize)}
              </div>
            </div>
            
            {/* Download Button */}
            <div className="flex-shrink-0">
              <a
                href={attachment.downloadUrl}
                download={attachment.originalName}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                data-testid="file-download-link"
                title={`Download ${attachment.originalName}`}
              >
                <Download className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}