import { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import type {
  GenerateSuccessResponse,
  GenerateErrorResponse,
} from '../types/api';

/**
 * Defines the return structure of the useImageGenerator hook.
 */
interface UseImageGeneratorReturn {
  /** Indicates if an image generation request is currently in progress. */
  loading: boolean;
  /** Stores the error message if the last request failed, otherwise null. */
  error: string | null;
  /** Stores the URL of the generated image if the last request was successful, otherwise null. */
  imageUrl: string | null;
  /**
   * Function to initiate the image generation process.
   * @param file The image file selected by the user.
   * @returns A promise that resolves when the generation process completes (successfully or with an error).
   */
  generateImage: (file: File) => Promise<void>;
}

/**
 * Custom React hook to manage the state and logic for generating Ghibli-style images.
 * It handles the API call to the backend endpoint, loading states, and error reporting.
 *
 * @returns An object containing the loading status, error message, generated image URL,
 *          and the function to trigger the generation process.
 */
const useImageGenerator = (): UseImageGeneratorReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  /**
   * Handles the image generation process by sending the selected file to the backend API.
   * @param file The image file selected by the user.
   */
  const generateImage = async (file: File): Promise<void> => {
    // Basic input validation
    if (!file) {
      setError('Please select an image file first.');
      return;
    }

    // Reset state for the new request
    setLoading(true);
    setError(null);
    setImageUrl(null);

    // Prepare form data for the API request
    const formData = new FormData();
    formData.append('image', file); // Key must match backend expectation

    try {
      // Make the POST request to the backend API endpoint
      const response = await axios.post<GenerateSuccessResponse>(
        '/api/generate',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        }
      );

      // On success, update the image URL state
      setImageUrl(response.data.imageUrl);
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.'; // Default error message

      if (isAxiosError<GenerateErrorResponse>(err)) {
        // Handle Axios errors (network issues, non-2xx status codes)
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (
            err.response.data &&
            typeof err.response.data.error === 'string'
          ) {
            // Use the specific error message from the backend if available
            errorMessage = err.response.data.error;
          } else {
            // Backend error format was unexpected or message missing
            errorMessage = `Server error: ${err.response.status} ${err.response.statusText}. Please try again later.`;
          }
        } else if (err.request) {
          // The request was made but no response was received (e.g., network error)
          errorMessage =
            'Failed to connect to the server. Please check your network connection.';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = `Request setup failed: ${err.message}`;
        }
      } else if (err instanceof Error) {
        // Handle non-Axios errors (e.g., issues in FormData creation)
        errorMessage = `An error occurred: ${err.message}`;
      }

      // Update the error state and log the detailed error for debugging
      setError(errorMessage);
      console.error('Image generation failed:', err); // Log the original error object
    } finally {
      // Ensure loading state is always turned off after the request finishes
      setLoading(false);
    }
  };

  // Return the state variables and the generator function
  return { loading, error, imageUrl, generateImage };
};

export default useImageGenerator;