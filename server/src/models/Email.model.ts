import { AICategory } from "../types";

export class EmailModel {
  id: string;
  accountId: string;
  folder: string;
  subject: string;
  body: string;
  from: string;
  to: string[];
  date: Date;
  aiCategory: AICategory;
  indexedAt: Date;

  constructor(data: {
    id: string;
    accountId: string;
    folder: string;
    subject: string;
    body: string;
    from: string;
    to: string[];
    date: Date;
    aiCategory?: AICategory;
  }) {
    this.id = data.id;
    this.accountId = data.accountId;
    this.folder = data.folder;
    this.subject = data.subject;
    this.body = data.body;
    this.from = data.from;
    this.to = data.to;
    this.date = data.date;
    this.aiCategory = data.aiCategory || "Uncategorized";
    this.indexedAt = new Date();
  }

  // Validation method
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === "") {
      errors.push("Email ID is required");
    }

    if (!this.accountId || this.accountId.trim() === "") {
      errors.push("Account ID is required");
    }

    if (!this.subject || this.subject.trim() === "") {
      errors.push("Subject is required");
    }

    if (!this.from || this.from.trim() === "") {
      errors.push("From address is required");
    }

    if (!this.to || this.to.length === 0) {
      errors.push("At least one recipient is required");
    }

    if (!this.date) {
      errors.push("Date is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convert to plain object for Elasticsearch
  toJSON() {
    return {
      id: this.id,
      accountId: this.accountId,
      folder: this.folder,
      subject: this.subject,
      body: this.body,
      from: this.from,
      to: this.to,
      date: this.date,
      aiCategory: this.aiCategory,
      indexedAt: this.indexedAt,
    };
  }

  // Static method to create from Elasticsearch document
  static fromElasticsearch(doc: any): EmailModel {
    return new EmailModel({
      id: doc.id,
      accountId: doc.accountId,
      folder: doc.folder,
      subject: doc.subject,
      body: doc.body,
      from: doc.from,
      to: doc.to,
      date: new Date(doc.date),
      aiCategory: doc.aiCategory,
    });
  }
}
