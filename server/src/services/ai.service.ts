import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import {
  EMAIL_CATEGORIZATION_SYSTEM_INSTRUCTION,
  CATEGORIZATION_RESPONSE_SCHEMA,
  VALID_AI_CATEGORIES,
} from "../config/ai-prompts.config";
import { AICategory, AICategorizationResult } from "../types";
import { logger } from "../utils/logger";

const MODEL_NAME = "gemini-2.5-flash";
const EMBEDDING_MODEL_NAME = "text-embedding-004";

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: EMAIL_CATEGORIZATION_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: CATEGORIZATION_RESPONSE_SCHEMA,
      },
    });
  }

  async categorizeEmail(subject: string, body: string): Promise<AICategory> {
    try {
      const emailText = `Subject: ${subject}\n\nBody: ${body}`;

      const response = await this.model.generateContent(emailText);
      const result = response.response.text();

      const parsed: AICategorizationResult = JSON.parse(result);

      const category = VALID_AI_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : "Uncategorized";

      logger.info(
        `Email categorized as: ${category} (original: ${parsed.category})`
      );

      return category;
    } catch (error) {
      logger.error({ err: error }, "Failed to categorize email");
      return "Uncategorized";
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({
        model: EMBEDDING_MODEL_NAME,
      });

      const result = await embeddingModel.embedContent(text);

      return result.embedding.values;
    } catch (error) {
      logger.error({ err: error }, "Failed to generate embedding");
      throw error;
    }
  }

  async generateReply(
    originalEmail: string,
    context: string[]
  ): Promise<string> {
    try {
      const contextText = context.join("\n\n---\n\n");
      const bookingLink = config.webhooks.bookingLink;

      const prompt = `SYSTEM:
You are an expert email assistant. The user wants short, professional reply suggestions (2–4 sentences) based on the incoming email and company outreach instructions. Provide a concise and helpful response with a score 0-1 indicating confidence.

CONTEXT:
Product/outreach instructions (training data):
${contextText}

RETRIEVED EMAIL CHUNKS:
${contextText}

INCOMING EMAIL:
${originalEmail}

INSTRUCTIONS:
1. Use the context and training_documents provided above.
2. If the lead asks to schedule a meeting or mentions availability, explicitly include the meeting booking link: ${bookingLink}
3. Be concise (2-4 sentences), polite, and professional.
4. Include one quick CTA sentence with the booking link if scheduling/availability is requested.
5. If the email is about job opportunities, recruitment, or career-related, provide appropriate guidance.
6. Provide a short subject-line suggestion as well.

OUTPUT JSON FORMAT:
{
  "suggestion": "Your professional reply here...",
  "subject_line": "Re: [Original Subject]",
  "score": 0.9
}

Example: If lead asks "When can we schedule a call?", include: "I'd be happy to connect! Please book a convenient time here: ${bookingLink}. Looking forward to speaking with you."

Generate the reply:`;

      const replyModel = this.genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await replyModel.generateContent(prompt);
      const result = response.response.text();

      logger.info("Reply generated successfully");

      // Parse JSON and return suggestion
      try {
        const parsed = JSON.parse(result);
        return parsed.suggestion || result;
      } catch {
        return result; // Fallback to raw text if JSON parsing fails
      }
    } catch (error) {
      logger.error({ err: error }, "Failed to generate reply");
      throw error;
    }
  }
}
