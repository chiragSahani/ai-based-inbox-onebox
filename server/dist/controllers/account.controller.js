"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const config_1 = require("../config");
const error_middleware_1 = require("../middlewares/error.middleware");
const logger_1 = require("../utils/logger");
class AccountController {
    constructor() {
        this.getAccounts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const accounts = (0, config_1.getIMAPAccounts)();
            const accountList = accounts.map((acc) => ({
                email: acc.user,
                host: acc.host,
                port: acc.port,
            }));
            logger_1.logger.info({
                message: "Accounts fetched",
                count: accountList.length,
            });
            res.status(200).json({
                success: true,
                data: { accounts: accountList },
            });
        });
    }
}
exports.AccountController = AccountController;
//# sourceMappingURL=account.controller.js.map