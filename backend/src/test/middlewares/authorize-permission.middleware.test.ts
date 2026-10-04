import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { Permission } from "@library/shared";
import { authorizePermission } from "../../middlewares/auth/authorize-permission.middleware.ts";
import { ForbiddenError } from "../../types/errors/ForbiddenError.ts";
import { UnauthorizedError } from "../../types/errors/UnauthorizedError.ts";

// Builds a fake request carrying the given role (or no user at all)
const createRequestWithRole = (role?: Role) =>
    ({
        user: role ? { id: "user-1", email: "user@example.com", role, memberId: null } : undefined,
    }) as Request;

const emptyResponse = {} as Response;

describe("authorizePermission middleware", () => {
    it("calls next() with no error when the role has the permission", () => {
        const next = vi.fn();

        authorizePermission(Permission.BOOKS_DISABLE)(createRequestWithRole(Role.ADMIN), emptyResponse, next);

        expect(next).toHaveBeenCalledWith();
    });

    it("passes a ForbiddenError when the role lacks the permission", () => {
        const next = vi.fn();

        authorizePermission(Permission.BOOKS_DISABLE)(createRequestWithRole(Role.LIBRARIAN), emptyResponse, next);

        expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it("passes an UnauthorizedError when there is no authenticated user", () => {
        const next = vi.fn();

        authorizePermission(Permission.BOOKS_VIEW)(createRequestWithRole(), emptyResponse, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("allows the request when any one of several permissions matches", () => {
        const next = vi.fn();

        authorizePermission(Permission.LOANS_VIEW_ALL, Permission.LOANS_VIEW_OWN)(
            createRequestWithRole(Role.MEMBER),
            emptyResponse,
            next,
        );

        expect(next).toHaveBeenCalledWith();
    });
});
