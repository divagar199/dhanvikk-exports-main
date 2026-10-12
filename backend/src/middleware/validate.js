import { ApiError } from '../utils/apiError.js';

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod schema (object with optional body, query, params)
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const validData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Assign sanitized & parsed values back to request
    if (validData.body) req.body = validData.body;
    if (validData.query) req.query = validData.query;
    if (validData.params) req.params = validData.params;

    next();
  } catch (err) {
    const issues = err.issues || err.errors;
    if (issues && Array.isArray(issues)) {
      const formattedErrors = issues.map((e) => ({
        field: e.path.slice(1).join('.'),
        message: e.message,
      }));
      return next(new ApiError(422, formattedErrors[0]?.message || 'Validation error', formattedErrors));
    }
    next(err);
  }
};
