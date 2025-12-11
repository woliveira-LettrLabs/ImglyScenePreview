import { useState, useRef } from 'react';
import { SceneViewer, SceneViewerHandle } from './components/SceneViewer';
import { FileUpload } from './components/FileUpload';
import { UrlLoader } from './components/UrlLoader';
import './App.scss';

function App() {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const sceneViewerRef = useRef<SceneViewerHandle | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setIsLoading(true);
      // Clear previous URL if any
      setCurrentUrl(null);
      if (sceneViewerRef.current) {
        await sceneViewerRef.current.loadFile(file);
        setCurrentFileName(file.name);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scene file';
      setError(errorMessage);
      setCurrentFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlLoad = async (url: string) => {
    try {
      setError(null);
      setIsLoading(true);
      // Clear previous file if any
      setCurrentFileName(null);
      if (sceneViewerRef.current) {
        await sceneViewerRef.current.loadUrl(url);
        setCurrentUrl(url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scene from URL';
      setError(errorMessage);
      setCurrentUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearScene = async () => {
    try {
      if (sceneViewerRef.current) {
        await sceneViewerRef.current.clearScene();
        setCurrentFileName(null);
        setCurrentUrl(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error clearing scene:', err);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">ImgLy Scene Preview</h1>
        <p className="app__subtitle">View .scene files using imgly CreativeEditor SDK</p>
      </header>

      <div className="app__content">
        <div className="app__controls">
          <div className="app__tabs">
            <button
              className={`app__tab ${activeTab === 'file' ? 'app__tab--active' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              Upload File
            </button>
            <button
              className={`app__tab ${activeTab === 'url' ? 'app__tab--active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              Load from URL
            </button>
          </div>

          <div className="app__loader">
            {activeTab === 'file' ? (
              <FileUpload 
                onFileSelect={handleFileSelect} 
                isLoading={isLoading}
                currentFileName={currentFileName}
                onClear={handleClearScene}
              />
            ) : (
              <UrlLoader 
                onUrlLoad={handleUrlLoad} 
                isLoading={isLoading}
                currentUrl={currentUrl}
                onClear={handleClearScene}
              />
            )}
          </div>

          {error && (
            <div className="app__error">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="app__viewer">
          <SceneViewer onError={setError} ref={sceneViewerRef} />
        </div>
      </div>
    </div>
  );
}

export default App;

