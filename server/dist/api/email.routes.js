"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailRoutes = createEmailRoutes;
const express_1 = require("express");
const email_controller_1 = require("../controllers/email.controller");
const email_validator_1 = require("../validators/email.validator");
function createEmailRoutes(esService, vectorService, aiService) {
    const router = (0, express_1.Router)();
    const emailController = new email_controller_1.EmailController(esService, vectorService, aiService);
    router.get("/", emailController.getEmails);
    router.get("/search", (0, email_validator_1.validate)(email_validator_1.searchEmailsSchema), emailController.searchEmails);
    router.get("/:id", (0, email_validator_1.validate)(email_validator_1.emailIdSchema), emailController.getEmailById);
    router.post("/:id/suggest-reply", (0, email_validator_1.validate)(email_validator_1.suggestReplySchema), emailController.suggestReply);
    return router;
}
//# sourceMappingURL=email.routes.js.map