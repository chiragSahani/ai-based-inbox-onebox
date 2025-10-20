import { Router } from "express";
import { EmailController } from "../controllers/email.controller";
import { validate } from "../validators/email.validator";
import {
  searchEmailsSchema,
  emailIdSchema,
  suggestReplySchema,
} from "../validators/email.validator";
// import { searchLimiter, aiOperationsLimiter } from '../middlewares/ratelimit.middleware';
import { ElasticsearchService } from "../services/elasticsearch.service";
import { VectorService } from "../services/vector.service";
import { AIService } from "../services/ai.service";

export function createEmailRoutes(
  esService: ElasticsearchService,
  vectorService: VectorService,
  aiService: AIService
): Router {
  const router = Router();
  const emailController = new EmailController(
    esService,
    vectorService,
    aiService
  );

  router.get("/", emailController.getEmails);

  router.get(
    "/search",
    validate(searchEmailsSchema),
    emailController.searchEmails
  );

  router.get("/:id", validate(emailIdSchema), emailController.getEmailById);

  router.post(
    "/:id/suggest-reply",
    validate(suggestReplySchema),
    emailController.suggestReply
  );

  return router;
}
