import { Router, Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import AppError from '../errors/AppError';

import transactionsRouter from './transactions.routes';

const routes = Router();

routes.use('/transactions', transactionsRouter);
routes.use(
  (err: Error, request: Request, response: Response, _: NextFunction) => {
    if (err instanceof AppError) {
      return response.json({
        status: 'error',
        message: err.message,
      });
    }
    return response.json({
      status: 'error',
      message: err.message,
    });
  },
);

export default routes;
