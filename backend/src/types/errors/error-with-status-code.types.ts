// Any error object (e.g. from a library) that carries an HTTP status code
export type ErrorWithStatusCode = Error & {
  statusCode?: unknown;
};
