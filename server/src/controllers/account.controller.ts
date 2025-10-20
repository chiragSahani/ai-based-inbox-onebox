import { Request, Response } from "express";
import { getIMAPAccounts } from "../config";
import { asyncHandler } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";

export class AccountController {
  getAccounts = asyncHandler(async (req: Request, res: Response) => {
    const accounts = getIMAPAccounts();

    const accountList = accounts.map((acc) => ({
      email: acc.user,
      host: acc.host,
      port: acc.port,
    }));

    logger.info({
      message: "Accounts fetched",
      count: accountList.length,
    });

    res.status(200).json({
      success: true,
      data: { accounts: accountList },
    });
  });
}
