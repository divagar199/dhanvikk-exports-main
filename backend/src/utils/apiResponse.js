/**
 * Standardized API Response Envelope
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    if (meta) {
      this.meta = meta;
    }
  }

  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, meta));
  }

  static created(res, data = null, message = 'Created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }
}
