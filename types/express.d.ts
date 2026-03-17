import "express";

declare module "express-serve-static-core" {
  interface Request {
    userConnectionString?: string;
    user?: any;
    userEmail?: string;
  }
}
