import React, { useState } from 'react';
import './UrlLoader.scss';

interface UrlLoaderProps {
  onUrlLoad: (url: string) => void;
  isLoading?: boolean;
  currentUrl?: string | null;
  onClear?: () => void;
}

export const UrlLoader: React.FC<UrlLoaderProps> = ({ onUrlLoad, isLoading = false, currentUrl = null, onClear }) => {
  const [url, setUrl] = useState(currentUrl || '');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setUrl(currentUrl || '');
  }, [currentUrl]);

  const validateUrl = (urlString: string): boolean => {
    try {
      const parsedUrl = new URL(urlString);
      // Check if URL is http or https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setError('URL must use HTTP or HTTPS protocol');
        return false;
      }
      setError(null);
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (url.trim() && validateUrl(url.trim())) {
      onUrlLoad(url.trim());
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setUrl(newUrl);
    if (error && newUrl.trim()) {
      validateUrl(newUrl.trim());
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="url-loader">
      <form onSubmit={handleSubmit} className="url-loader__form">
        <div className="url-loader__input-group">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter .scene file URL (e.g., https://example.com/scene.scene)"
            className="url-loader__input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="url-loader__button"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? 'Loading...' : 'Load Scene'}
          </button>
        </div>
        {currentUrl && (
          <div className="url-loader__current-url">
            <span className="url-loader__current-label">Current: </span>
            <span className="url-loader__current-value">{currentUrl}</span>
            <button
              type="button"
              className="url-loader__clear-button"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
        )}
        {error && <p className="url-loader__error">{error}</p>}
      </form>
    </div>
  );
};

