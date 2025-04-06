import React from 'react';
import useImageGenerator from './hooks/useImageGenerator'; // Assumes this hook exists and follows the expected interface
import ImageUploader from './components/ImageUploader'; // Assumes this component exists
import ImageDisplay from './components/ImageDisplay'; // Assumes this component exists
import LoadingSpinner from './components/LoadingSpinner'; // Assumes this component exists
import ErrorMessage from './components/ErrorMessage'; // Assumes this component exists

/**
 * The main application component.
 * Orchestrates the UI components and manages the overall application state
 * related to image generation using the `useImageGenerator` hook.
 */
const App: React.FC = () => {
  // Initialize the image generator hook to manage state and API calls
  const { loading, error, imageUrl, generateImage } = useImageGenerator();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-gray-800">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Ghibli Image Generator
        </h1>
        <p className="text-lg text-gray-600">
          Transform your images into the Studio Ghibli style!
        </p>
      </header>

      <main className="w-full max-w-lg rounded-lg bg-white p-6 shadow-md">
        {/* Image Uploader Component */}
        <ImageUploader onImageSelect={generateImage} isLoading={loading} />

        {/* Loading State Indicator */}
        {loading && (
          <div className="mt-6 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Error Message Display */}
        {error && !loading && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Generated Image Display */}
        {imageUrl && !loading && !error && (
          <div className="mt-6">
            <ImageDisplay imageUrl={imageUrl} />
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by OpenAI DALL-E.</p>
        {/* Basic footer, can be expanded */}
      </footer>
    </div>
  );
};

export default App;