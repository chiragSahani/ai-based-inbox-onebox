import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';

export function createAccountRoutes(): Router {
  const router = Router();
  const accountController = new AccountController();

 
  router.get('/', accountController.getAccounts);

  return router;
}
