import React from 'react';

/**
 * Props for the ImageDisplay component.
 */
interface ImageDisplayProps {
  /**
   * The URL of the generated image to display.
   * Assumed to originate from a trusted backend source.
   */
  imageUrl: string;
}

/**
 * A functional component responsible for rendering the generated image result.
 * It displays an image using the provided URL with appropriate styling.
 *
 * @param {ImageDisplayProps} props - The component props.
 * @returns {React.ReactElement | null} The rendered image element or null if the URL is invalid.
 */
const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl }) => {
  // Conditionally render the image only if imageUrl is a truthy, non-empty string.
  if (!imageUrl) {
    return null; // Render nothing if the URL is not valid
  }

  return (
    <img
      src={imageUrl}
      alt="Generated Ghibli-style image" // Static alt text for accessibility and security
      className="mx-auto block h-auto max-w-full rounded-lg shadow-md" // Tailwind classes for styling
      // Native browser handling for loading errors (shows broken image icon)
      // Native browser caching applies
    />
  );
};

export default ImageDisplay;