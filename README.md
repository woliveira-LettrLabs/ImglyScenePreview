# ImgLy Scene Preview

A React application for viewing `.scene` files using the imgly CreativeEditor SDK. This is a viewer-only application with no editing capabilities.

## Features

- **Viewer-Only Mode**: All editing UI elements are disabled
- **File Upload**: Upload and view `.scene` files from your computer
- **URL Loading**: Load `.scene` files directly from a URL
- **Error Handling**: Graceful error messages for invalid files
- **Loading States**: Visual feedback during scene loading

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Imgly CreativeEditor SDK license:
   ```bash
   VITE_IMGLY_LICENSE=your_license_key_here
   ```
   - For GitHub Actions/CI, set `VITE_IMGLY_LICENSE` as a GitHub Secret

### Development

Run the development server:

```bash
npm run dev
```

The application will open at `http://localhost:3002`

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
ImglyScenePreview/
├── src/
│   ├── components/        # React components
│   │   ├── SceneViewer.tsx
│   │   ├── FileUpload.tsx
│   │   └── UrlLoader.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useSceneViewer.ts
│   ├── utils/             # Utility functions
│   │   └── sceneConfig.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Configuration

The SDK configuration is located in `src/utils/sceneConfig.ts`. 

### Environment Variables

- **VITE_IMGLY_LICENSE** (required): The Imgly CreativeEditor SDK license key. This should be set as:
  - A GitHub Secret named `VITE_IMGLY_LICENSE` for CI/CD builds
  - An environment variable in your `.env` file for local development

The application will throw an error at runtime if the license is not provided.

## Technologies

- **React 18.2.0**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **@cesdk/cesdk-js 1.44.0**: imgly CreativeEditor SDK

## License

This project uses the imgly CreativeEditor SDK. The SDK license is configured in the project.

## Notes

- Maximum file size: 50MB
- Supported file format: `.scene` files
- The viewer is read-only and does not support editing

