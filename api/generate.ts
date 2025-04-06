import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { createReadStream } from 'fs';
import type {
  GenerateSuccessResponse,
  GenerateErrorResponse,
} from '../src/types/api'; // Adjusted relative path

// Constants
const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];
const OPENAI_IMAGE_SIZE = '1024x1024';
const GHIBLI_PROMPT = 'A Studio Ghibli style rendering of the image';

/**
 * Handles POST requests to generate a Ghibli-styled image using OpenAI's DALL-E 2 edit API.
 *
 * @param req - The Vercel request object, expected to contain multipart/form-data with an 'image' file.
 * @param res - The Vercel response object.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // 1. Method Check
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  // 2. API Key Validation
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is not set.');
    const errorResponse: GenerateErrorResponse = {
      error: 'Server configuration error. Cannot process request.',
    };
    res.status(500).json(errorResponse);
    return;
  }

  // 3. File Parsing & Validation
  if (!req.files || !req.files.image) {
    const errorResponse: GenerateErrorResponse = {
      error: 'No image file uploaded.',
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Vercel parses single files into an object, multiple into an array
  if (Array.isArray(req.files.image)) {
    const errorResponse: GenerateErrorResponse = {
      error: 'Please upload only one image.',
    };
    res.status(400).json(errorResponse);
    return;
  }

  const file = req.files.image;

  // Validate MIME type
  if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const errorResponse: GenerateErrorResponse = {
      error: `Invalid file type. Please upload ${ALLOWED_MIME_TYPES.join(
        ' or '
      )}.`,
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const errorResponse: GenerateErrorResponse = {
      error: `Image file too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
    };
    res.status(400).json(errorResponse);
    return;
  }

  // 4. OpenAI Client Initialization
  const openai = new OpenAI({ apiKey });

  // 5. Core Logic: OpenAI Interaction
  try {
    // Create a readable stream from the temporary file path provided by Vercel
    const imageStream = createReadStream(file.filepath);

    // Call the OpenAI API
    const response = await openai.images.createEdit({
      image: imageStream,
      prompt: GHIBLI_PROMPT,
      n: 1,
      size: OPENAI_IMAGE_SIZE,
      response_format: 'url',
    });

    // Extract the URL
    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      console.error('OpenAI API response did not contain an image URL.', response);
      const errorResponse: GenerateErrorResponse = {
        error: 'Failed to retrieve image URL from the generation service.',
      };
      res.status(500).json(errorResponse);
      return;
    }

    // 6. Success Response
    const successResponse: GenerateSuccessResponse = { imageUrl };
    res.status(200).json(successResponse);

  } catch (error: unknown) {
    // 7. Error Handling
    console.error('Error during image generation process:', error);

    let statusCode = 500;
    let errorMessage = 'An unexpected server error occurred.';

    if (error instanceof OpenAI.APIError) {
      // Handle specific OpenAI API errors
      statusCode = error.status || 500; // Use OpenAI status code if available
      errorMessage = `Failed to generate image due to an upstream service error. (Status: ${statusCode})`;
      // Log more specific details if needed for debugging
      console.error('OpenAI API Error Details:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });
       // Provide slightly more specific feedback for common issues if safe
       if (error.code === 'billing_hard_limit_reached') {
        errorMessage = 'Image generation failed: Billing limit reached.';
       } else if (error.status === 400) {
         // Potentially bad input, though we validated size/type
         errorMessage = 'Image generation failed: Invalid request data provided to upstream service.';
       }
    } else if (error instanceof Error && error.message.includes('ENOENT')) {
       // Handle potential file system errors (e.g., stream creation failed)
       errorMessage = 'Failed to process uploaded image file.';
    }
     // Default to generic 500 for other errors

    const errorResponse: GenerateErrorResponse = { error: errorMessage };
    res.status(statusCode).json(errorResponse);
  }
}