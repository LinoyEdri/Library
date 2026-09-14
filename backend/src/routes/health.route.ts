import { Router } from "express";
import { ApiResponse } from "../types/response.ts" // Import the helper
import status from "http-status-codes";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  const healthData = {
    status: "ok",
    service: "library-api",
    timestamp: new Date().toISOString()
  };

  response.status(status.OK).json(
    ApiResponse.success(healthData, "Service is healthy")
  );
});
