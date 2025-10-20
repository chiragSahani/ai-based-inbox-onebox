import { Request, Response } from "express";
import { ElasticsearchService } from "../services/elasticsearch.service";
import { VectorService } from "../services/vector.service";
import { AIService } from "../services/ai.service";
import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";

export class EmailController {
  constructor(
    private esService: ElasticsearchService,
    private vectorService: VectorService,
    private aiService: AIService
  ) {}

  // Get all emails with pagination
  getEmails = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.validatedData?.page || "1");
    const pageSize = parseInt(req.validatedData?.pageSize || "20");
    const from = (page - 1) * pageSize;

    const result = await this.esService.searchEmails(
      undefined,
      undefined,
      undefined,
      undefined,
      from,
      pageSize
    );

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
  searchEmails = asyncHandler(async (req: Request, res: Response) => {
    const {
      q,
      account,
      folder,
      category,
      page = 1,
      pageSize = 20,
    } = req.validatedData || {};

    const from = (page - 1) * pageSize;

    const result = await this.esService.searchEmails(
      q,
      account,
      folder,
      category,
      from,
      pageSize
    );

    logger.info({
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
  getEmailById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validatedData || {};

    if (!id) {
      throw new AppError("Email ID is required", 400);
    }

    const email = await this.esService.getEmailById(id);

    if (!email) {
      throw new AppError("Email not found", 404);
    }

    res.status(200).json({
      success: true,
      data: { email },
    });
  });

  // Generate suggested reply using RAG
  suggestReply = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.validatedData || {};

    if (!id) {
      throw new AppError("Email ID is required", 400);
    }

    const email = await this.esService.getEmailById(id);

    if (!email) {
      throw new AppError("Email not found", 404);
    }

    logger.info({
      message: "Generating AI reply",
      emailId: id,
      subject: email.subject,
    });

    // Step 1: Retrieve relevant context from vector DB
    const originalEmailText = `Subject: ${email.subject}\n\n${email.body}`;
    const contexts = await this.vectorService.searchSimilar(
      originalEmailText,
      3
    );

    // Step 2: Generate reply using AI with context
    const suggestedReply = await this.aiService.generateReply(
      originalEmailText,
      contexts
    );

    logger.info({
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
