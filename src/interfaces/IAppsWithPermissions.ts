interface Apps {
  pvServiceID: number;
  pvServiceName: string;
  pvServiceDescription: string;
  pvServiceEndPoint: string;
  pvServiceTitle: string;
  pvVoid: number;
  pvDomainID: number;
  pvServiceCategory: string;
  pvDatasources: string;
  pvFeatures: string;
  pvParentServiceID: string;
}

interface Actions {
  pvActionID: number;
  pvActionName: string;
  pvActionDescription: string;
  pvServiceID: number;
  pvVoid: number;
  pvDomainID: number;
}

export interface IAppsWithPermissions extends Apps {
  actions: Actions[];
}
