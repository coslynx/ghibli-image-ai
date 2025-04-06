import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';

/**
 * Props for the ImageUploader component.
 */
interface Props {
  /**
   * Callback function invoked when a valid image file is selected or dropped.
   * @param file The selected image File object.
   */
  onImageSelect: (file: File) => void | Promise<void>;

  /**
   * Flag indicating if an image generation process is currently active.
   * Used to disable the dropzone and provide visual feedback.
   */
  isLoading: boolean;
}

// Define acceptable file types and max size
const acceptTypes: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
const maxFileSize = 5 * 1024 * 1024; // 5MB

/**
 * A component that allows users to select or drop an image file for processing.
 * It handles file validation (type, size) and provides visual feedback.
 */
const ImageUploader: React.FC<Props> = ({ onImageSelect, isLoading }) => {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  /**
   * Handles files dropped onto the dropzone.
   * Validates files based on configured constraints (type, size, count).
   * Calls onImageSelect for valid files or sets rejection errors for invalid ones.
   */
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Clear any previous errors
      setRejectionError(null);

      // Handle rejected files
      if (fileRejections.length > 0) {
        const firstRejection = fileRejections[0];
        const firstError = firstRejection.errors[0];
        let errorMessage = 'File selection failed. Please try again.'; // Default

        switch (firstError.code) {
          case 'file-invalid-type':
            errorMessage =
              'Invalid file type. Please upload a JPG, PNG, or WEBP image.';
            break;
          case 'file-too-large':
            errorMessage = 'File is too large. Maximum size is 5MB.';
            break;
          case 'too-many-files':
            errorMessage = 'Please upload only one file at a time.';
            break;
          default:
            errorMessage = `Error: ${firstError.message}`;
            break;
        }
        setRejectionError(errorMessage);
        // Log detailed info for debugging
        console.error('File rejection details:', fileRejections);
        return; // Stop processing if there are rejections
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        // We expect only one file due to `multiple: false`
        const file = acceptedFiles[0];
        void onImageSelect(file); // Call the callback, handle promise if returned
      }
    },
    [onImageSelect]
  );

  // Initialize react-dropzone hook
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: acceptTypes,
    multiple: false,
    maxSize: maxFileSize,
    disabled: isLoading,
  });

  // Determine dynamic styles based on dropzone state
  const baseStyle =
    'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const activeStyle = 'border-blue-500 bg-blue-50';
  const acceptStyle = 'border-green-500 bg-green-50';
  const rejectStyle = 'border-red-500 bg-red-50';
  const disabledStyle = 'opacity-50 cursor-not-allowed bg-gray-100';

  let dropzoneStyle = `${baseStyle} border-gray-300 hover:border-blue-400`;
  if (isLoading) {
    dropzoneStyle = `${baseStyle} ${disabledStyle}`;
  } else if (isDragActive && isDragAccept) {
    dropzoneStyle = `${baseStyle} ${acceptStyle}`;
  } else if (isDragActive && isDragReject) {
    dropzoneStyle = `${baseStyle} ${rejectStyle}`;
  } else if (isDragActive) {
    dropzoneStyle = `${baseStyle} ${activeStyle}`;
  }

  // Determine instructional text based on state
  let instructionalText = "Drag 'n' drop an image here, or click to select.";
  if (isLoading) {
    instructionalText = 'Processing image... Please wait.';
  } else if (isDragActive && isDragAccept) {
    instructionalText = 'Drop the image here...';
  } else if (isDragActive && isDragReject) {
    instructionalText = 'Unsupported file type or size.';
  }

  return (
    <div className="flex flex-col items-center">
      <div {...getRootProps({ className: dropzoneStyle })}>
        <input {...getInputProps()} />
        <p className="text-gray-500">{instructionalText}</p>
        <p className="text-sm text-gray-400 mt-1">
          (JPG, PNG, WEBP - Max 5MB)
        </p>
      </div>
      {rejectionError && !isLoading && (
        <p className="mt-2 text-sm font-medium text-red-600">
          {rejectionError}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;