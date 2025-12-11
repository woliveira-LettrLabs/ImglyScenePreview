import { useEffect, useRef, useState } from 'react';
import CreativeEditorSDK from '@cesdk/cesdk-js';
import { getViewerConfig } from '../utils/sceneConfig';

interface UseSceneViewerOptions {
  containerId: string;
}

interface UseSceneViewerReturn {
  instance: CreativeEditorSDK | null;
  isInitializing: boolean;
  isLoading: boolean;
  isReady: boolean;
  hasSceneLoaded: boolean;
  error: string | null;
  loadSceneFromFile: (file: File) => Promise<void>;
  loadSceneFromURL: (url: string) => Promise<void>;
  clearScene: () => Promise<void>;
}

export const useSceneViewer = ({ containerId }: UseSceneViewerOptions): UseSceneViewerReturn => {
  const [instance, setInstance] = useState<CreativeEditorSDK | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasSceneLoaded, setHasSceneLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize SDK - only once
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current || initializationPromiseRef.current) {
      return;
    }

    let mounted = true;
    let currentInstance: CreativeEditorSDK | null = null;

    const initializeSDK = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Check if container exists
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`Container with id "${containerId}" not found`);
        }

        const config = getViewerConfig();
        const sdkInstance = await CreativeEditorSDK.create(`#${containerId}`, config);
        currentInstance = sdkInstance;

        // Wait for engine to be fully ready
        let attempts = 0;
        while ((!sdkInstance.engine || !sdkInstance.engine.scene) && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!sdkInstance.engine || !sdkInstance.engine.scene) {
          throw new Error('SDK engine not ready after initialization');
        }

        // Disable the "no scene" warning since we're a viewer that loads scenes on demand
        if (sdkInstance.disableNoSceneWarning) {
          sdkInstance.disableNoSceneWarning();
        }

        if (mounted && currentInstance === sdkInstance) {
          setInstance(sdkInstance);
          isInitializedRef.current = true;
          setIsInitializing(false);
          setIsReady(true);
          initializationPromiseRef.current = null;
          console.log('✓ CreativeEditor SDK initialized successfully');
        } else if (mounted) {
          // Component unmounted during initialization, dispose the instance
          try {
            sdkInstance.dispose?.();
          } catch (e) {
            console.warn('Error disposing SDK during initialization:', e);
          }
        }
      } catch (err) {
        console.error('Failed to initialize CreativeEditor SDK:', err);
        initializationPromiseRef.current = null;
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
          setIsInitializing(false);
          setIsReady(false);
        }
      }
    };

    initializationPromiseRef.current = initializeSDK();

    return () => {
      mounted = false;
      // Cleanup if component unmounts during initialization
      if (currentInstance && !isInitializedRef.current) {
        try {
          currentInstance.dispose?.();
        } catch (err) {
          console.warn('Error disposing SDK during cleanup:', err);
        }
      }
    };
  }, [containerId]);

  // Cleanup on unmount - only dispose if instance exists and was successfully initialized
  useEffect(() => {
    return () => {
      if (instance && isInitializedRef.current) {
        try {
          // Check if instance is still valid before disposing
          if (instance.engine) {
            instance.dispose?.();
            console.log('Engine disposed');
          }
        } catch (err) {
          // Silently ignore disposal errors as they're often harmless
          console.warn('Error disposing SDK instance:', err);
        }
      }
    };
  }, [instance]);

  const loadSceneFromFile = async (file: File): Promise<void> => {
    if (!instance) {
      throw new Error('SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File too large. Maximum size: 50MB');
      }

      // Try different loading methods
      const engine = instance.engine;
      if (!engine || !engine.scene) {
        throw new Error('SDK engine not ready');
      }

      let loaded = false;

      // Method 1: loadFromURL with blob URL (preferred method)
      if (typeof engine.scene.loadFromURL === 'function') {
        try {
          const blobUrl = URL.createObjectURL(file);
          await engine.scene.loadFromURL(blobUrl);
          URL.revokeObjectURL(blobUrl);
          loaded = true;
        } catch (e) {
          console.warn('loadFromURL failed, trying loadFromString:', e);
        }
      }

      // Method 2: loadFromString (fallback - read file as base64)
      if (!loaded && typeof engine.scene.loadFromString === 'function') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          // Convert ArrayBuffer to base64 string efficiently
          const uint8Array = new Uint8Array(arrayBuffer);
          let binaryString = '';
          const chunkSize = 8192; // Process in chunks to avoid stack overflow
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode(...chunk);
          }
          const base64String = btoa(binaryString);
          await engine.scene.loadFromString(base64String);
          loaded = true;
        } catch (e) {
          console.warn('loadFromString failed:', e);
        }
      }

      if (!loaded) {
        throw new Error('Failed to load scene file. No compatible loading method found.');
      }

      setHasSceneLoaded(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scene file';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const loadSceneFromURL = async (url: string): Promise<void> => {
    if (!instance) {
      throw new Error('SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }

      const engine = instance.engine;
      if (!engine || !engine.scene) {
        throw new Error('SDK engine not ready');
      }

      if (typeof engine.scene.loadFromURL !== 'function') {
        throw new Error('loadFromURL method not available');
      }

      await engine.scene.loadFromURL(url);
      setHasSceneLoaded(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scene from URL';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const clearScene = async (): Promise<void> => {
    // For a viewer, we just mark that there's no scene loaded
    // The SDK will handle the empty state internally
    setHasSceneLoaded(false);
    setError(null);
    
    // Optionally, we could try to reset the scene if the SDK supports it
    if (instance?.engine?.scene) {
      try {
        // Try to get all blocks and remove them if possible
        // This is a soft clear - we just mark as no scene loaded
        // The actual scene data remains but is hidden
      } catch (err) {
        // Ignore errors - we've already marked as no scene loaded
        console.warn('Could not clear scene data:', err);
      }
    }
  };

  return {
    instance,
    isInitializing,
    isLoading,
    isReady,
    hasSceneLoaded,
    error,
    loadSceneFromFile,
    loadSceneFromURL,
    clearScene
  };
};

