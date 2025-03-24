export const ApplicationSchema = {
  type: 'object',
  properties: {
    applications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pvGroup2ActionID: { type: 'number' },
          pvGroupID: { type: 'number' },
          pvActionID: { type: 'number' },
          pvGroupName: { type: 'string' },
          pvActionStatus: { type: 'string' },
          pvServiceID: { type: 'number' },
          pvServiceName: { type: 'string' },
          pvVoid: { type: 'number' },
        },
        required: [
          'pvGroup2ActionID',
          'pvGroupID',
          'pvActionID',
          'pvGroupName',
          'pvActionStatus',
          'pvServiceID',
          'pvServiceName',
          'pvVoid',
        ],
      },
    },
  },
  required: ['applications'],
} as const;
