export const CONTENT_AGENT_OWNER = {
  id: '03_CONTENT',
  name: 'Content Agent',
  description: 'Processes media pass requests and moderates testimonials. Audits content fields on athlete and creator profiles.',
  tables: ['athletes', 'creators', 'media_pass_requests', 'testimonials'],
  defaultPriority: 'normal',
} as const;
