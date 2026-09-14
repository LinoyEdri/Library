import { AsyncLocalStorage } from "node:async_hooks";

// Create the storage container
export const requestContext = new AsyncLocalStorage<string>();
