"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountRoutes = createAccountRoutes;
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
function createAccountRoutes() {
    const router = (0, express_1.Router)();
    const accountController = new account_controller_1.AccountController();
    router.get('/', accountController.getAccounts);
    return router;
}
//# sourceMappingURL=account.routes.js.map