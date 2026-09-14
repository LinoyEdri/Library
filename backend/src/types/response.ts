export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

export const ApiResponse = {
  success: <T>(data: T, message = "Success"): ApiResponse<T> => {
    return {
      success: true,
      data,
      message,
    };
  },

  error: (message: string): ApiResponse<null> => {
    return {
      success: false,
      data: null,
      message,
    };
  },
};
