import Joi from 'joi';

export const searchEmailsSchema = Joi.object({
  q: Joi.string().optional().max(500),
  account: Joi.string().email().optional(),
  folder: Joi.string().optional().valid('INBOX', 'Sent', 'Drafts', 'Trash'),
  category: Joi.string()
    .optional()
    .valid(
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
    ),
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const emailIdSchema = Joi.object({
  id: Joi.string().required().min(1).max(500),
});

export const suggestReplySchema = Joi.object({
  id: Joi.string().required().min(1).max(500),
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
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
