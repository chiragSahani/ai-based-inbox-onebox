import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { AICategory, AICategorizationResult } from '../types';
import { logger } from '../utils/logger';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'You are an expert email classifier. Analyze the email content carefully and categorize it into ONE of these categories. Read the ENTIRE email before deciding.\n\n' +
        'CATEGORIES (choose the BEST match):\n\n' +
        '1. Interested - Positive responses showing genuine interest:\n' +
        '   - Asking questions about your product/service\n' +
        '   - Requesting more information, pricing, demo\n' +
        '   - Expressing curiosity or openness to learn more\n' +
        '   - "Sounds interesting", "Tell me more", "I\'d like to know"\n\n' +
        '2. Meeting Booked - Confirmed scheduled meetings:\n' +
        '   - Calendar invites or meeting confirmations\n' +
        '   - Specific date/time for a call or meeting\n' +
        '   - "Let\'s meet on Tuesday at 3pm"\n' +
        '   - Zoom/Teams meeting links with scheduled time\n\n' +
        '3. Not Interested - Clear rejections:\n' +
        '   - "Not interested", "No thank you"\n' +
        '   - "Not a good fit", "Not right now"\n' +
        '   - Polite but firm rejections\n' +
        '   - "Please remove me from your list"\n\n' +
        '4. Follow Up - Requires a response but not urgent:\n' +
        '   - Checking in on previous conversation\n' +
        '   - Reminder emails about pending items\n' +
        '   - "Just following up", "Circling back"\n' +
        '   - Questions that need answers\n\n' +
        '5. Job Opportunity - Jobs, recruitment, career:\n' +
        '   - Job postings and descriptions\n' +
        '   - Recruitment messages\n' +
        '   - Career opportunities\n' +
        '   - Interview invitations\n' +
        '   - LinkedIn InMail about jobs\n\n' +
        '6. Newsletter - Marketing and promotional content:\n' +
        '   - Company updates and announcements\n' +
        '   - Product launches\n' +
        '   - Marketing emails with unsubscribe links\n' +
        '   - Blog posts, articles, webinars\n' +
        '   - Promotional offers\n\n' +
        '7. Spam - Unsolicited or irrelevant:\n' +
        '   - Mass emails from unknown senders\n' +
        '   - Suspicious links or attachments\n' +
        '   - Scam attempts, phishing\n' +
        '   - Completely irrelevant to recipient\n' +
        '   - Too good to be true offers\n\n' +
        '8. Out of Office - Automated absence replies:\n' +
        '   - "I am out of office"\n' +
        '   - Vacation auto-replies\n' +
        '   - "I will return on..."\n' +
        '   - Limited email access notices\n\n' +
        '9. Important - Urgent, time-sensitive:\n' +
        '   - Marked as urgent or high priority\n' +
        '   - From CEO, management, key clients\n' +
        '   - Contract deadlines, critical issues\n' +
        '   - "URGENT", "ASAP", "Action Required"\n\n' +
        '10. Informational - FYI, no action needed:\n' +
        '   - Status updates\n' +
        '   - General information sharing\n' +
        '   - Team announcements\n' +
        '   - "FYI", "For your information"\n' +
        '   - System notifications\n\n' +
        'IMPORTANT RULES:\n' +
        '- Read the FULL email before categorizing\n' +
        '- If email mentions jobs/careers/hiring → Job Opportunity\n' +
        '- If from Slack/Teams/internal tools → Informational (unless urgent)\n' +
        '- If automated system message → Informational\n' +
        '- Only use Spam for truly unsolicited/suspicious emails\n' +
        '- When in doubt between categories, pick the MOST specific one\n' +
        '- Marketing emails with products/services → Newsletter, NOT Spam\n' +
        '- GitHub/GitLab notifications → Informational\n' +
        '- Slack channel messages → Informational',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object' as any,
          properties: {
            category: {
              type: 'string' as any,
              enum: ['Interested', 'Meeting Booked', 'Not Interested', 'Follow Up', 'Job Opportunity', 'Newsletter', 'Spam', 'Out of Office', 'Important', 'Informational'] as any,
            },
          },
          required: ['category'] as any,
        } as any,
      },
    });
  }

  async categorizeEmail(subject: string, body: string): Promise<AICategory> {
    try {
      const emailText = `Subject: ${subject}\n\nBody: ${body}`;

      const response = await this.model.generateContent(emailText);
      const result = response.response.text();

      const parsed: AICategorizationResult = JSON.parse(result);

      // Validate that the category is one of the allowed values
      const validCategories: AICategory[] = [
        'Interested',
        'Meeting Booked',
        'Not Interested',
        'Follow Up',
        'Job Opportunity',
        'Newsletter',
        'Spam',
        'Out of Office',
        'Important',
        'Informational',
        'Uncategorized'
      ];

      const category = validCategories.includes(parsed.category) ? parsed.category : 'Uncategorized';

      logger.info(`Email categorized as: ${category} (original: ${parsed.category})`);

      return category;
    } catch (error) {
      logger.error({ err: error }, 'Failed to categorize email');
      return 'Uncategorized';
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });

      const result = await embeddingModel.embedContent(text);

      return result.embedding.values;
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate embedding');
      throw error;
    }
  }

  async generateReply(originalEmail: string, context: string[]): Promise<string> {
    try {
      const contextText = context.join('\n\n---\n\n');
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
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const response = await replyModel.generateContent(prompt);
      const result = response.response.text();

      logger.info('Reply generated successfully');

      // Parse JSON and return suggestion
      try {
        const parsed = JSON.parse(result);
        return parsed.suggestion || result;
      } catch {
        return result; // Fallback to raw text if JSON parsing fails
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate reply');
      throw error;
    }
  }
}
