import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    switch (status) {
      case 400:
        return serverMessage || 'Invalid request.';

      case 401:
        return 'Your session has expired. Please log in again.';

      case 403:
        return "You don't have permission to perform this action.";

      case 404:
        return serverMessage || 'Requested resource not found.';

      case 409:
        return serverMessage || 'This operation conflicts with existing data.';

      case 422:
        return serverMessage || 'Please check the submitted data.';

      case 500:
      case 502:
      case 503:
        return 'Something went wrong on the server. Please try again later.';

      default:
        return serverMessage || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
