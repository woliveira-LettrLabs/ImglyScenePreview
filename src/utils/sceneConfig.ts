import { Configuration } from '@cesdk/cesdk-js';

// License from environment variable (GitHub Secrets)
// This should be set as VITE_IMGLY_LICENSE in GitHub Secrets
const LICENSE = import.meta.env.VITE_IMGLY_LICENSE;

if (!LICENSE) {
  throw new Error(
    'VITE_IMGLY_LICENSE environment variable is required. Please set it in your GitHub Secrets or .env file.'
  );
}

/**
 * Viewer-only configuration for CreativeEditor SDK
 * All editing UI elements are disabled
 */
export const getViewerConfig = (): Configuration => ({
  license: LICENSE,
  baseURL: 'https://cdn.img.ly/packages/imgly/cesdk-js/1.44.0/assets',
  userId: 'scene-viewer',
  theme: 'light',
  // Viewer role to minimize editing capabilities
  role: 'Viewer',
  logger: (message, logLevel) => {
    // Suppress the "No scene found" warning as it's expected in viewer mode
    if (typeof message === 'string' && message.includes('No scene found')) {
      return;
    }
    if (logLevel === 'Error') {
      console.error(`[CESDK] ${message}`);
    } else if (logLevel === 'Warning') {
      // Only log warnings that aren't about missing scenes
      if (typeof message === 'string' && !message.includes('No scene found')) {
        console.warn(`[CESDK] ${message}`);
      }
    } else {
      console.log(`[CESDK] ${logLevel || 'Info'}: ${message}`);
    }
  },
  ui: {
    elements: {
      // Default view mode
      view: 'default',
      navigation: { show: false },
      dock: { show: false },
      panels: {
        inspector: false,
        settings: false,
        assetLibrary: false
      },
      // Hide inspector bar (defined in SDK types)
      inspectorBar: false
    } satisfies NonNullable<Configuration['ui']>['elements']
  },
  callbacks: {
    onError: (error: unknown) => {
      if (error instanceof Error) {
        console.error('CreativeEditor SDK Error:', error.message);
      } else {
        console.error('CreativeEditor SDK Error:', error);
      }
      return false; // Prevent default error handling
    }
  } as Configuration['callbacks']
});

