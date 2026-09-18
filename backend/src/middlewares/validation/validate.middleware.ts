import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.ts";
import { ZodObject } from "zod";

export enum RequestLocation {
    BODY ="body",
    PARAMS = "params",
    QUERY = "query"
};

export const validate = (
    location: RequestLocation,
    schema: ZodObject
) => {
    return catchAsync(async (
        req: Request, 
        _res: Response,
        next: NextFunction
    ) : Promise<void> => {
        const resultData = await schema.parseAsync(req[location]);

        if (location === RequestLocation.QUERY) {
            Object.defineProperty(req, RequestLocation.QUERY, {
                value: resultData,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        } else {
            req[location] = resultData;
        }

        next();
    })
}