import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Since we're using cookie-based authentication with withCredentials: true,
  // we don't need to manually add Authorization headers.
  // The browser automatically sends cookies with each request.

  // Just pass the request through unchanged
  return next(req);
};
