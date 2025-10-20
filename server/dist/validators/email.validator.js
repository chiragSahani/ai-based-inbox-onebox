"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.suggestReplySchema = exports.emailIdSchema = exports.searchEmailsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.searchEmailsSchema = joi_1.default.object({
    q: joi_1.default.string().optional().max(500),
    account: joi_1.default.string().email().optional(),
    folder: joi_1.default.string().optional().valid('INBOX', 'Sent', 'Drafts', 'Trash'),
    category: joi_1.default.string()
        .optional()
        .valid('Interested', 'Meeting Booked', 'Not Interested', 'Follow Up', 'Job Opportunity', 'Newsletter', 'Spam', 'Out of Office', 'Important', 'Informational', 'Uncategorized'),
    page: joi_1.default.number().integer().min(1).optional().default(1),
    pageSize: joi_1.default.number().integer().min(1).max(100).optional().default(20),
});
exports.emailIdSchema = joi_1.default.object({
    id: joi_1.default.string().required().min(1).max(500),
});
exports.suggestReplySchema = joi_1.default.object({
    id: joi_1.default.string().required().min(1).max(500),
});
// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const dataToValidate = {
            ...req.body,
            ...req.query,
            ...req.params,
        };
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        // Replace req properties with validated and sanitized values
        req.validatedData = value;
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=email.validator.js.map