import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from '../../src/components/ImageUploader'; // Adjust path if needed

// Constants derived from the component
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

describe('ImageUploader Component', () => {
  let mockOnImageSelect: Mock<[File], void | Promise<void>>;
  const user = userEvent.setup();

  beforeEach(() => {
    // Create a fresh mock for each test
    mockOnImageSelect = vi.fn();
    // Reset any previous mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up the DOM after each test
    cleanup();
  });

  // Helper function to create mock File objects
  const createMockFile = (
    name: string,
    type: string,
    size: number
  ): File => {
    const blob = new Blob(['a'.repeat(size)], { type });
    return new File([blob], name, { type });
  };

  it('should render initial state correctly', () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} isLoading={false} />);

    // Check for instructional text
    expect(
      screen.getByText(/Drag 'n' drop an image here, or click to select./i)
    ).toBeInTheDocument();

    // Check for file type/size hint
    expect(
      screen.getByText(/\(JPG, PNG, WEBP - Max 5MB\)/i)
    ).toBeInTheDocument();

    // Check that no error message is displayed initially
    expect(
      screen.queryByText(/Invalid file type|File is too large|Please upload only one file/i)
    ).toBeNull();

    // Check that the callback hasn't been called
    expect(mockOnImageSelect).not.toHaveBeenCalled();
  });

  it('should call onImageSelect with the valid file when selected', async () => {
    const { container } = render(
      <ImageUploader onImageSelect={mockOnImageSelect} isLoading={false} />
    );
    const file = createMockFile('test.png', 'image/png', 1024 * 1024); // 1MB

    // Find the hidden file input
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    // Simulate upload using userEvent
    await user.upload(input!, file);

    // Assert callback was called once with the correct file
    expect(mockOnImageSelect).toHaveBeenCalledTimes(1);
    expect(mockOnImageSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test.png',
        type: 'image/png',
        size: 1024 * 1024,
      })
    );

    // Assert no error message is displayed
    expect(
      screen.queryByText(/Invalid file type|File is too large|Please upload only one file/i)
    ).toBeNull();
  });

  it('should show error and not call onImageSelect for invalid file type', async () => {
    const { container } = render(
      <ImageUploader onImageSelect={mockOnImageSelect} isLoading={false} />
    );
    const file = createMockFile('test.txt', 'text/plain', 1024); // 1KB

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    await user.upload(input!, file);

    // Assert callback was NOT called
    expect(mockOnImageSelect).not.toHaveBeenCalled();

    // Assert the specific error message is displayed
    expect(
      screen.getByText(/Invalid file type. Please upload a JPG, PNG, or WEBP image./i)
    ).toBeInTheDocument();
  });

  it('should show error and not call onImageSelect for oversized file', async () => {
    const { container } = render(
      <ImageUploader onImageSelect={mockOnImageSelect} isLoading={false} />
    );
    const file = createMockFile(
      'large.png',
      'image/png',
      MAX_FILE_SIZE_BYTES + 1
    ); // Slightly over 5MB

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    await user.upload(input!, file);

    // Assert callback was NOT called
    expect(mockOnImageSelect).not.toHaveBeenCalled();

    // Assert the specific error message is displayed
    expect(
      screen.getByText(/File is too large. Maximum size is 5MB./i)
    ).toBeInTheDocument();
  });

  it('should show error and not call onImageSelect for multiple files', async () => {
    const { container } = render(
      <ImageUploader onImageSelect={mockOnImageSelect} isLoading={false} />
    );
    const file1 = createMockFile('test1.png', 'image/png', 1024 * 1024);
    const file2 = createMockFile('test2.jpg', 'image/jpeg', 1024 * 1024);

    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    // Simulate uploading multiple files
    await user.upload(input!, [file1, file2]);

    // Assert callback was NOT called (react-dropzone's multiple: false should prevent it)
    expect(mockOnImageSelect).not.toHaveBeenCalled();

    // Assert the specific error message is displayed
    // Note: react-dropzone might reject all if multiple are passed when multiple=false
    expect(
      screen.getByText(/Please upload only one file at a time./i)
    ).toBeInTheDocument();
  });

  it('should display loading state and disable interactions when isLoading is true', async () => {
    const { container } = render(
      <ImageUploader onImageSelect={mockOnImageSelect} isLoading={true} />
    );
    const file = createMockFile('test.png', 'image/png', 1024 * 1024);

    // Check for loading instructional text
    expect(
      screen.getByText(/Processing image... Please wait./i)
    ).toBeInTheDocument();

    // Check if the input is disabled
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('disabled');

    // Check for visual disabled styles on the dropzone div itself
    // Note: We query the div specifically. The exact class might depend on Tailwind compilation.
    const dropzoneDiv = input?.parentElement; // Find the div wrapper
    expect(dropzoneDiv).toHaveClass('opacity-50');
    expect(dropzoneDiv).toHaveClass('cursor-not-allowed');

    // Attempt to upload a file while loading
    // userEvent might prevent interaction with disabled inputs,
    // but we assert the callback wasn't called just in case.
    try {
      await user.upload(input!, file);
    } catch (e) {
      // userEvent might throw if the element is disabled, which is expected.
      // We can ignore this error in this specific test case.
    }

    // Assert callback was NOT called
    expect(mockOnImageSelect).not.toHaveBeenCalled();

    // Assert no rejection error message is displayed (as interaction is disabled)
    expect(
      screen.queryByText(/Invalid file type|File is too large|Please upload only one file/i)
    ).toBeNull();
  });
});