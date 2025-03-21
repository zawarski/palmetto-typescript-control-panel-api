export const ContactsSchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pvDataID: { type: 'number' },
          pvGroupID: { type: 'number' },
          pvAccountID: { type: 'number' },
          isNew: { type: 'boolean' },
        },
      },
    },
    deleted: { type: 'array', items: { type: 'string' } },
  },
  required: ['contacts', 'deleted'],
} as const;
