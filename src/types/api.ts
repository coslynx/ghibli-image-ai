/**
 * Defines the structure for a successful response from the /api/generate endpoint.
 */
export interface GenerateSuccessResponse {
  /**
   * The URL of the successfully generated Ghibli-style image.
   */
  imageUrl: string;
}

/**
 * Defines the structure for an error response from the /api/generate endpoint.
 */
export interface GenerateErrorResponse {
  /**
   * A user-friendly message describing the error that occurred during image generation.
   */
  error: string;
}