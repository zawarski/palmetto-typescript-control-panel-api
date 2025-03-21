export const GroupSchema = {
  type: 'object',
  properties: {
    pvGroupID: { type: ['number', 'null'] },
    pvGroupName: { type: 'string' },
    pvGroupTitle: { type: 'string' },
    pvGroupComment: { type: 'string' },
    pvIsAgency: { type: 'number' },
    basemapID: { type: 'string' },
  },
  required: ['pvGroupName', 'pvGroupTitle'],
} as const;

export const SubGroupSchema = {
  type: 'object',
  properties: {
    subgroups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pvGroupID: { type: ['number', 'null'] },
          pvParentGroupID: { type: ['number', 'null'] },
          pvGroupName: { type: 'string' },
          pvGroupTitle: { type: 'string' },
          pvGroupComment: { type: 'string' },
          pvIsAgency: { type: 'number' },
          isNew: { type: 'boolean' },
          deleted: { type: 'boolean' },
        },
      },
    },
  },
  required: ['subgroups'],
} as const;
