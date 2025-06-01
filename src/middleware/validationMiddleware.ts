import { Request, Response, NextFunction } from "express";
import { ValidationUtils } from "../utils/ValidationUtils";
import { AppError } from "../utils/AppError";

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { body } = req;

      if (schema.required) {
        const missingFields = ValidationUtils.validateRequired(
          schema.required(body)
        );
        if (missingFields.length > 0) {
          throw new AppError(
            `Missing required fields: ${missingFields.join(", ")}`,
            400
          );
        }
      }

      if (schema.validate) {
        const validationResult = schema.validate(body);
        if (!validationResult.isValid) {
          throw new AppError(
            `Validation failed: ${validationResult.errors.join(", ")}`,
            400
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Validation schemas
export const authValidation = {
  register: {
    required: (body: any) => ({ email: body.email, password: body.password }),
    validate: (body: any) => {
      const errors: string[] = [];

      if (!ValidationUtils.isValidEmail(body.email)) {
        errors.push("Invalid email format");
      }

      if (!ValidationUtils.isValidPassword(body.password)) {
        errors.push("Password must be at least 6 characters long");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },
  login: {
    required: (body: any) => ({ email: body.email, password: body.password }),
    validate: (body: any) => {
      const errors: string[] = [];

      if (!ValidationUtils.isValidEmail(body.email)) {
        errors.push("Invalid email format");
      }

      if (!ValidationUtils.isValidString(body.password)) {
        errors.push("Password is required");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },
};

export const taskValidation = {
  create: {
    required: (body: any) => ({ title: body.title }),
    validate: (body: any) => {
      const errors: string[] = [];

      if (!ValidationUtils.isValidString(body.title)) {
        errors.push("Title must be a non-empty string");
      }

      if (
        body.description !== undefined &&
        typeof body.description !== "string"
      ) {
        errors.push("Description must be a string");
      }

      if (
        body.priority !== undefined &&
        !["low", "medium", "high"].includes(body.priority)
      ) {
        errors.push("Priority must be one of: low, medium, high");
      }

      if (
        body.category !== undefined &&
        ![
          "work",
          "personal",
          "shopping",
          "health",
          "education",
          "other",
        ].includes(body.category)
      ) {
        errors.push(
          "Category must be one of: work, personal, shopping, health, education, other"
        );
      }

      if (
        body.tags !== undefined &&
        (!Array.isArray(body.tags) ||
          !body.tags.every((tag: any) => typeof tag === "string"))
      ) {
        errors.push("Tags must be an array of strings");
      }

      if (body.dueDate !== undefined) {
        const date = new Date(body.dueDate);
        if (isNaN(date.getTime())) {
          errors.push("Due date must be a valid date");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },
  update: {
    validate: (body: any) => {
      const errors: string[] = [];

      if (
        body.title !== undefined &&
        !ValidationUtils.isValidString(body.title)
      ) {
        errors.push("Title must be a non-empty string");
      }

      if (
        body.description !== undefined &&
        body.description !== null &&
        typeof body.description !== "string"
      ) {
        errors.push("Description must be a string");
      }

      if (body.completed !== undefined && typeof body.completed !== "boolean") {
        errors.push("Completed must be a boolean");
      }

      if (
        body.priority !== undefined &&
        !["low", "medium", "high"].includes(body.priority)
      ) {
        errors.push("Priority must be one of: low, medium, high");
      }

      if (
        body.category !== undefined &&
        ![
          "work",
          "personal",
          "shopping",
          "health",
          "education",
          "other",
        ].includes(body.category)
      ) {
        errors.push(
          "Category must be one of: work, personal, shopping, health, education, other"
        );
      }

      if (
        body.tags !== undefined &&
        (!Array.isArray(body.tags) ||
          !body.tags.every((tag: any) => typeof tag === "string"))
      ) {
        errors.push("Tags must be an array of strings");
      }

      if (
        body.isArchived !== undefined &&
        typeof body.isArchived !== "boolean"
      ) {
        errors.push("isArchived must be a boolean");
      }

      if (body.dueDate !== undefined && body.dueDate !== null) {
        const date = new Date(body.dueDate);
        if (isNaN(date.getTime())) {
          errors.push("Due date must be a valid date");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },
  bulkUpdate: {
    required: (body: any) => ({ taskIds: body.taskIds }),
    validate: (body: any) => {
      const errors: string[] = [];

      if (!Array.isArray(body.taskIds) || body.taskIds.length === 0) {
        errors.push("taskIds must be a non-empty array");
      }

      if (
        body.taskIds &&
        !body.taskIds.every((id: any) => typeof id === "number")
      ) {
        errors.push("All taskIds must be numbers");
      }

      // Validate updates object
      if (body.updates) {
        if (
          body.updates.title !== undefined &&
          !ValidationUtils.isValidString(body.updates.title)
        ) {
          errors.push("Title must be a non-empty string");
        }

        if (
          body.updates.completed !== undefined &&
          typeof body.updates.completed !== "boolean"
        ) {
          errors.push("Completed must be a boolean");
        }

        if (
          body.updates.priority !== undefined &&
          !["low", "medium", "high"].includes(body.updates.priority)
        ) {
          errors.push("Priority must be one of: low, medium, high");
        }

        if (
          body.updates.category !== undefined &&
          ![
            "work",
            "personal",
            "shopping",
            "health",
            "education",
            "other",
          ].includes(body.updates.category)
        ) {
          errors.push(
            "Category must be one of: work, personal, shopping, health, education, other"
          );
        }

        if (
          body.updates.tags !== undefined &&
          (!Array.isArray(body.updates.tags) ||
            !body.updates.tags.every((tag: any) => typeof tag === "string"))
        ) {
          errors.push("Tags must be an array of strings");
        }

        if (
          body.updates.isArchived !== undefined &&
          typeof body.updates.isArchived !== "boolean"
        ) {
          errors.push("isArchived must be a boolean");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },
};
