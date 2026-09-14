import status from 'http-status-codes';

const UNKNOWN_STATUS_CODE = "UNKNOWN_STATUS_CODE";

export const getStatusText = (statusCode: number): string => {
  // `getStatusText` is an alias of `getReasonPhrase`, which THROWS on any code
  // it doesn't know (e.g. 499). Never let that escape into the error pipeline.
  try {
    return status.getStatusText(statusCode).toUpperCase().replace(/ /g, "_");
  } catch {
    return UNKNOWN_STATUS_CODE;
  }
};
