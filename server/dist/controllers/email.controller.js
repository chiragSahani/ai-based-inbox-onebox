"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const logger_1 = require("../utils/logger");
class EmailController {
    constructor(esService, vectorService, aiService) {
        this.esService = esService;
        this.vectorService = vectorService;
        this.aiService = aiService;
        // Get all emails with pagination
        this.getEmails = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const page = parseInt(req.validatedData?.page || "1");
            const pageSize = parseInt(req.validatedData?.pageSize || "20");
            const from = (page - 1) * pageSize;
            const result = await this.esService.searchEmails(undefined, undefined, undefined, undefined, from, pageSize);
            res.status(200).json({
                success: true,
                data: {
                    emails: result.emails,
                    pagination: {
                        total: result.total,
                        page,
                        pageSize,
                        totalPages: Math.ceil(result.total / pageSize),
                    },
                },
            });
        });
        // Search and filter emails
        this.searchEmails = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { q, account, folder, category, page = 1, pageSize = 20, } = req.validatedData || {};
            const from = (page - 1) * pageSize;
            const result = await this.esService.searchEmails(q, account, folder, category, from, pageSize);
            logger_1.logger.info({
                message: "Email search performed",
                query: q,
                filters: { account, folder, category },
                results: result.total,
            });
            res.status(200).json({
                success: true,
                data: {
                    emails: result.emails,
                    pagination: {
                        total: result.total,
                        page,
                        pageSize,
                        totalPages: Math.ceil(result.total / pageSize),
                    },
                    filters: { q, account, folder, category },
                },
            });
        });
        // Get single email by ID
        this.getEmailById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.validatedData || {};
            if (!id) {
                throw new error_middleware_1.AppError("Email ID is required", 400);
            }
            const email = await this.esService.getEmailById(id);
            if (!email) {
                throw new error_middleware_1.AppError("Email not found", 404);
            }
            res.status(200).json({
                success: true,
                data: { email },
            });
        });
        // Generate suggested reply using RAG
        this.suggestReply = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            const { id } = req.validatedData || {};
            if (!id) {
                throw new error_middleware_1.AppError("Email ID is required", 400);
            }
            const email = await this.esService.getEmailById(id);
            if (!email) {
                throw new error_middleware_1.AppError("Email not found", 404);
            }
            logger_1.logger.info({
                message: "Generating AI reply",
                emailId: id,
                subject: email.subject,
            });
            // Step 1: Retrieve relevant context from vector DB
            const originalEmailText = `Subject: ${email.subject}\n\n${email.body}`;
            const contexts = await this.vectorService.searchSimilar(originalEmailText, 3);
            // Step 2: Generate reply using AI with context
            const suggestedReply = await this.aiService.generateReply(originalEmailText, contexts);
            logger_1.logger.info({
                message: "AI reply generated successfully",
                emailId: id,
                contextCount: contexts.length,
            });
            res.status(200).json({
                success: true,
                data: {
                    reply: suggestedReply,
                    context: contexts,
                },
            });
        });
    }
}
exports.EmailController = EmailController;
//# sourceMappingURL=email.controller.js.map