import React, { useRef, useState } from 'react';
import './FileUpload.scss';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  currentFileName?: string | null;
  onClear?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false, currentFileName = null, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(currentFileName);

  React.useEffect(() => {
    setFileName(currentFileName);
  }, [currentFileName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      }
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.scene')) {
      alert('Please select a .scene file');
      return false;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum size: 50MB');
      return false;
    }

    return true;
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneClick = (event: React.MouseEvent) => {
    // Don't trigger if clicking on the Clear button
    if ((event.target as HTMLElement).closest('.file-upload__clear-button')) {
      return;
    }
    // Open file selector when clicking anywhere on the dropzone
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".scene,application/json"
          onChange={handleFileChange}
          className="file-upload__input"
          disabled={isLoading}
        />
        <div className="file-upload__content">
          <svg
            className="file-upload__icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {fileName ? (
            <div className="file-upload__file-info">
              <p className="file-upload__file-name">{fileName}</p>
              <div className="file-upload__file-actions">
                <button
                  type="button"
                  className="file-upload__clear-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileName(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    if (onClear) {
                      onClear();
                    }
                  }}
                  disabled={isLoading}
                >
                  Clear
                </button>
                <p className="file-upload__file-hint">Click anywhere to select a different file</p>
              </div>
            </div>
          ) : (
            <>
              <p className="file-upload__text">Drag and drop a .scene file here</p>
              <p className="file-upload__hint">or</p>
              <button
                type="button"
                className="file-upload__button"
                onClick={handleButtonClick}
                disabled={isLoading}
              >
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

