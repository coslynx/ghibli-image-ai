import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  Mock,
} from 'vitest';
import type { VercelRequest, VercelResponse, VercelRequestBody } from '@vercel/node';
import { File } from '@vercel/node/dist/types'; // Helper type if needed
import handler from '../api/generate'; // Adjust path if necessary
import type {
  GenerateSuccessResponse,
  GenerateErrorResponse,
} from '../src/types/api'; // Adjust path if necessary
import { OpenAI } from 'openai';
import { Readable } from 'stream';
import { createReadStream } from 'fs'; // We mock this

// Mock external dependencies
vi.mock('openai', () => {
  // Create mock functions for the methods we expect to call
  const mockCreateEdit = vi.fn();
  const MockOpenAI = vi.fn().mockImplementation(() => ({
    images: {
      createEdit: mockCreateEdit,
    },
  }));
  return { OpenAI: MockOpenAI, default: MockOpenAI }; // Ensure default export is handled if library structure changes
});

vi.mock('fs', async (importOriginal) => {
  const actualFs = await importOriginal<typeof import('fs')>(); // Import actual types if needed
  return {
    ...actualFs, // Keep other fs methods if necessary (unlikely here)
    createReadStream: vi.fn(),
  };
});

// Constants derived from the handler
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const EXPECTED_GHIBLI_PROMPT =
  'A Studio Ghibli style rendering of the image';
const EXPECTED_IMAGE_SIZE = '1024x1024';

// Helper to create mock file objects
const createMockFile = (overrides: Partial<File> = {}): File => ({
  size: 1024 * 1024, // 1MB default
  filepath: '/tmp/mock-upload-path',
  originalFilename: 'test.png',
  mimetype: 'image/png',
  ...overrides,
});

// Helper to create mock stream
const createMockStream = (): Readable => {
  const stream = new Readable();
  stream._read = () => {}; // Basic implementation
  stream.push(null); // Indicate end of stream
  return stream;
};

describe('API Handler: /api/generate', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse> & {
    status: Mock<any, any>;
    json: Mock<any, any>;
    setHeader: Mock<any, any>;
  };
  let mockOpenAIInstance: OpenAI; // To access the mocked methods easily
  let mockCreateEditFn: Mock; // Reference to the mocked createEdit function
  let consoleErrorSpy: Mock;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock response object with spies
    mockRes = {
      status: vi.fn().mockReturnThis(), // Chainable
      json: vi.fn(),
      setHeader: vi.fn(),
    };

    // Create a default mock request object (can be customized per test)
    mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=---boundary', // Typical header
      },
      files: {
        image: createMockFile(), // Default valid file
      },
      body: {} as VercelRequestBody, // Provide a default empty body
      query: {},
      cookies: {},
    };

    // Set up the mock OpenAI instance and method references
    // Since vi.mock hoists, OpenAI is already the mocked constructor
    mockOpenAIInstance = new OpenAI({ apiKey: 'mock-key' }); // Key doesn't matter here
    // Access the mocked function directly through the mocked module structure
    mockCreateEditFn = (mockOpenAIInstance.images.createEdit as Mock);

    // Mock createReadStream to return a simple readable stream
    (createReadStream as Mock).mockReturnValue(createMockStream());

    // Stub process.env and set a default valid API key
    vi.stubGlobal('process', {
      ...process,
      env: {
        ...process.env,
        OPENAI_API_KEY: 'mock-valid-key', // Default valid key for most tests
      },
    });

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original implementations and unstub globals
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // --- Input Validation Tests ---
  describe('Input Validation', () => {
    it('should return 405 if method is not POST', async () => {
      mockReq.method = 'GET';
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method GET Not Allowed',
      });
    });

    it('should return 500 if OPENAI_API_KEY is not set', async () => {
      // Override the default valid key
      vi.stubGlobal('process', {
        ...process,
        env: { ...process.env, OPENAI_API_KEY: undefined },
      });

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OPENAI_API_KEY environment variable is not set.'
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Server configuration error. Cannot process request.',
      } as GenerateErrorResponse);
    });

    it('should return 400 if no req.files is present', async () => {
      delete mockReq.files; // Simulate no files object
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No image file uploaded.',
      } as GenerateErrorResponse);
    });

    it('should return 400 if req.files.image is not present', async () => {
      mockReq.files = {}; // Simulate files object without 'image'
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No image file uploaded.',
      } as GenerateErrorResponse);
    });

    it('should return 400 if multiple files are uploaded (image is array)', async () => {
      // Vercel puts multiple files with same key into an array
      mockReq.files = { image: [createMockFile(), createMockFile()] };
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Please upload only one image.',
      } as GenerateErrorResponse);
    });

    it('should return 400 for invalid MIME type', async () => {
      mockReq.files = { image: createMockFile({ mimetype: 'text/plain' }) };
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid file type. Please upload image/png or image/jpeg.',
      } as GenerateErrorResponse);
    });

     it('should return 400 if mimetype is missing', async () => {
       mockReq.files = { image: createMockFile({ mimetype: undefined }) };
       await handler(mockReq as VercelRequest, mockRes as VercelResponse);
       expect(mockRes.status).toHaveBeenCalledWith(400);
       expect(mockRes.json).toHaveBeenCalledWith({
         error: 'Invalid file type. Please upload image/png or image/jpeg.',
       } as GenerateErrorResponse);
     });

    it('should return 400 for oversized file', async () => {
      mockReq.files = {
        image: createMockFile({ size: MAX_FILE_SIZE_BYTES + 1 }),
      };
      await handler(mockReq as VercelRequest, mockRes as VercelResponse);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Image file too large. Maximum size is 4MB.',
      } as GenerateErrorResponse);
    });
  });

  // --- Successful Generation Tests ---
  describe('Successful Generation', () => {
    it('should return 200 with image URL on successful generation', async () => {
      const mockImageUrl = 'https://example.com/generated-image.png';
      const mockFile = createMockFile({ filepath: '/tmp/valid-image.png' });
      const mockStream = createMockStream();
      (createReadStream as Mock).mockReturnValue(mockStream);
      mockReq.files = { image: mockFile };

      // Mock successful OpenAI response
      mockCreateEditFn.mockResolvedValue({
        data: [{ url: mockImageUrl }],
      });

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      // Assertions
      expect(createReadStream).toHaveBeenCalledWith(mockFile.filepath);
      expect(mockCreateEditFn).toHaveBeenCalledTimes(1);
      expect(mockCreateEditFn).toHaveBeenCalledWith({
        image: mockStream,
        prompt: EXPECTED_GHIBLI_PROMPT,
        n: 1,
        size: EXPECTED_IMAGE_SIZE,
        response_format: 'url',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        imageUrl: mockImageUrl,
      } as GenerateSuccessResponse);
       expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  // --- Error Handling Tests ---
  describe('Error Handling', () => {
    it('should return 500 if OpenAI response data is missing', async () => {
        mockCreateEditFn.mockResolvedValue({ data: undefined }); // Malformed response

        await handler(mockReq as VercelRequest, mockRes as VercelResponse);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('OpenAI API response did not contain an image URL.'),
            expect.anything()
        );
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Failed to retrieve image URL from the generation service.',
        } as GenerateErrorResponse);
    });

    it('should return 500 if OpenAI response data array is empty', async () => {
        mockCreateEditFn.mockResolvedValue({ data: [] }); // Empty data array

        await handler(mockReq as VercelRequest, mockRes as VercelResponse);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('OpenAI API response did not contain an image URL.'),
            expect.anything()
        );
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Failed to retrieve image URL from the generation service.',
        } as GenerateErrorResponse);
    });


    it('should return 500 if OpenAI response item is missing URL', async () => {
      mockCreateEditFn.mockResolvedValue({ data: [{ url: undefined }] });

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OpenAI API response did not contain an image URL.',
        { data: [{ url: undefined }] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to retrieve image URL from the generation service.',
      } as GenerateErrorResponse);
    });

    it('should return appropriate status and message for OpenAI.APIError (e.g., 429 Too Many Requests)', async () => {
      const apiError = new OpenAI.APIError(
        429,
        { message: 'Rate limit exceeded', type: 'requests', code: null, param: null },
        'Rate limit message from header',
        {}
      );
      mockCreateEditFn.mockRejectedValue(apiError);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error during image generation process:',
        apiError
      );
       expect(consoleErrorSpy).toHaveBeenCalledWith(
         'OpenAI API Error Details:',
         { status: 429, message: 'Rate limit exceeded', code: null, type: 'requests' }
       );
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: `Failed to generate image due to an upstream service error. (Status: 429)`,
      } as GenerateErrorResponse);
    });

    it('should return specific message for billing_hard_limit_reached error', async () => {
       const apiError = new OpenAI.APIError(
         400, // Billing errors might return 400 or other codes
         { message: 'Billing hard limit reached.', type: 'billing', code: 'billing_hard_limit_reached', param: null },
         'Billing limit header',
         {}
       );
      mockCreateEditFn.mockRejectedValue(apiError);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

       expect(consoleErrorSpy).toHaveBeenCalledWith(
         'Error during image generation process:',
         apiError
       );
       expect(consoleErrorSpy).toHaveBeenCalledWith(
         'OpenAI API Error Details:',
         { status: 400, message: 'Billing hard limit reached.', code: 'billing_hard_limit_reached', type: 'billing' }
       );
       expect(mockRes.status).toHaveBeenCalledWith(400); // Or the status OpenAI returns
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Image generation failed: Billing limit reached.',
      } as GenerateErrorResponse);
    });

     it('should return specific message for OpenAI status 400 (generic)', async () => {
       const apiError = new OpenAI.APIError(
         400,
         { message: 'Invalid request.', type: 'invalid_request_error', code: null, param: 'image' },
         'Invalid request header',
         {}
       );
       mockCreateEditFn.mockRejectedValue(apiError);

       await handler(mockReq as VercelRequest, mockRes as VercelResponse);

       expect(consoleErrorSpy).toHaveBeenCalledWith(
         'Error during image generation process:',
         apiError
       );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'OpenAI API Error Details:',
            { status: 400, message: 'Invalid request.', code: null, type: 'invalid_request_error' }
        );
       expect(mockRes.status).toHaveBeenCalledWith(400);
       expect(mockRes.json).toHaveBeenCalledWith({
         error: 'Image generation failed: Invalid request data provided to upstream service.',
       } as GenerateErrorResponse);
     });

    it('should return 500 for errors during createReadStream', async () => {
      const streamError = new Error('ENOENT: File not found');
      (createReadStream as Mock).mockImplementation(() => {
        throw streamError;
      });

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error during image generation process:',
        streamError
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to process uploaded image file.',
      } as GenerateErrorResponse);
      expect(mockCreateEditFn).not.toHaveBeenCalled(); // Should fail before OpenAI call
    });

    it('should return 500 for generic errors during OpenAI call', async () => {
      const genericError = new Error('Network connection lost');
      mockCreateEditFn.mockRejectedValue(genericError);

      await handler(mockReq as VercelRequest, mockRes as VercelResponse);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error during image generation process:',
        genericError
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'An unexpected server error occurred.',
      } as GenerateErrorResponse);
    });
  });
});