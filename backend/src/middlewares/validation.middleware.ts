import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestException } from '../utils/exceptions';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((err) => ({
          field: err.path.slice(1).join('.') || err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestException('Validation failed', errorDetails));
      } else {
        next(error);
      }
    }
  };
};

export default validateRequest;
