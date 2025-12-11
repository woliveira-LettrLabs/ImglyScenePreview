/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IMGLY_LICENSE: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

