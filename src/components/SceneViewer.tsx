import React, { forwardRef, useImperativeHandle } from 'react';
import { useSceneViewer } from '../hooks/useSceneViewer';
import './SceneViewer.scss';

interface SceneViewerProps {
  onError?: (error: string) => void;
}

export interface SceneViewerHandle {
  loadFile: (file: File) => Promise<void>;
  loadUrl: (url: string) => Promise<void>;
  clearScene: () => Promise<void>;
  hasSceneLoaded: boolean;
}

export const SceneViewer = forwardRef<SceneViewerHandle, SceneViewerProps>(
  ({ onError }, ref) => {
    const { isInitializing, isLoading, isReady, hasSceneLoaded, error, loadSceneFromFile, loadSceneFromURL, clearScene } = useSceneViewer({
      containerId: 'cesdk-container'
    });

    useImperativeHandle(ref, () => ({
      loadFile: loadSceneFromFile,
      loadUrl: loadSceneFromURL,
      clearScene: clearScene,
      hasSceneLoaded: hasSceneLoaded
    }));

    React.useEffect(() => {
      if (error && onError) {
        onError(error);
      }
    }, [error, onError]);

    return (
      <div className="scene-viewer">
        {isInitializing && !isReady && (
          <div className="scene-viewer__loading">
            <div className="scene-viewer__spinner"></div>
            <p>Initializing editor...</p>
            <p className="scene-viewer__loading-hint">Just a few seconds...</p>
          </div>
        )}
        {isReady && !hasSceneLoaded && !isLoading && !error && (
          <div className="scene-viewer__empty-state">
            <div className="scene-viewer__empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <h3 className="scene-viewer__empty-title">No Scene Loaded</h3>
            <p className="scene-viewer__empty-message">
              Upload a .scene file or add a link to view it here
            </p>
          </div>
        )}
        {isReady && isLoading && (
          <div className="scene-viewer__loading">
            <div className="scene-viewer__spinner"></div>
            <p>Loading scene...</p>
          </div>
        )}
        {error && isReady && (
          <div className="scene-viewer__error">
            <p>Error: {error}</p>
          </div>
        )}
        <div 
          id="cesdk-container" 
          className={`scene-viewer__container ${!hasSceneLoaded ? 'scene-viewer__container--hidden' : ''}`}
        />
      </div>
    );
  }
);

SceneViewer.displayName = 'SceneViewer';

