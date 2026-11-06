import type { Request, Response, NextFunction } from 'express';
import z, { ZodObject, ZodError } from 'zod';

export const validateRequest = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate body, query, and params against the Zod schema
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Overwrite Express objects with fully sanitized/parsed data
      req.body = parsed.body;

      if (parsed.query) {
        Object.getOwnPropertyNames(req.query).forEach(key => {
          Object.defineProperty(req.query, key, { value: undefined, writable: true, configurable: true });
        });
        Object.assign(req.query, parsed.query);
      }

      if (parsed.params) {
        Object.getOwnPropertyNames(req.params).forEach(key => {
          Object.defineProperty(req.params, key, { value: undefined, writable: true, configurable: true });
        });
        Object.assign(req.params, parsed.params);
      }
      
      // Move cleanly to the controller
      return next();
    } catch (error) {
      // If validation fails, intercept and return a clean 400 response
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: z.treeifyError(error).errors, 
        });
        return;
      }
      
      // Pass non-Zod errors down to your global error handler
      return next(error);
    }
  };
};
