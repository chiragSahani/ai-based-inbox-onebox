export type AICategory =
  | 'Interested'
  | 'Meeting Booked'
  | 'Not Interested'
  | 'Follow Up'
  | 'Job Opportunity'
  | 'Newsletter'
  | 'Spam'
  | 'Out of Office'
  | 'Important'
  | 'Informational'
  | 'Uncategorized';

export interface EmailDocument {
  id: string; // Unique message ID
  accountId: string;
  folder: string; 
  subject: string;
  body: string; 
  from: string;
  to: string[];
  date: Date;
  aiCategory: AICategory;
  indexedAt: Date;
}

export interface IMAPAccount {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

export interface AICategorizationResult {
  category: AICategory;
}

export interface SuggestedReplyRequest {
  emailId: string;
}

export interface SuggestedReplyResponse {
  reply: string;
  context: string[];
}
