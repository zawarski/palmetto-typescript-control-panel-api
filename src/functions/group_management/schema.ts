export const GroupSchema = {
  type: 'object',
  properties: {
    pvGroupID: { type: ['number', 'null'] },
    pvGroupName: { type: 'string' },
    pvGroupTitle: { type: 'string' },
    pvGroupComment: { type: 'string' },
    pvIsAgency: { type: 'number' },
  },
  required: ['pvGroupName', 'pvGroupTitle'],
} as const;
