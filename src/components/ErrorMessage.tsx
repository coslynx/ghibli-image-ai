import React from 'react';

/**
 * Props for the ErrorMessage component.
 */
interface ErrorMessageProps {
  /**
   * The error message string to display.
   * If null, undefined, or empty, the component renders nothing.
   */
  message: string | null | undefined;
}

/**
 * A component responsible for displaying error messages in a standardized format.
 * It renders only when a non-empty message string is provided and uses
 * appropriate styling and ARIA roles for accessibility, consistent with
 * the application's overall design.
 *
 * @param {ErrorMessageProps} props - The component props.
 * @returns {React.ReactElement | null} The rendered error message element or null.
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  // Conditionally render: only display if message is a non-empty string
  // This handles null, undefined, and empty strings gracefully.
  if (!message) {
    return null;
  }

  return (
    <div
      className="rounded-md border border-red-400 bg-red-100 p-4 text-sm font-medium text-red-700"
      role="alert" // Ensures assistive technologies announce the error when it appears
    >
      {message} {/* Render the error message content safely */}
    </div>
  );
};

export default ErrorMessage;