import { getPalmettoDBConnection } from '@db/index';
import { ServiceEntity } from '@entities/service.entity';
import { ActionEntity } from '@entities/action.entity';
import { IAppsWithPermissions } from '@interfaces/IAppsWithPermissions';

export const getServices = async () => {
  try {
    const [serviceRepo] = await Promise.all([(await getPalmettoDBConnection()).getRepository(ServiceEntity)]);
    return await serviceRepo.find({ where: { pvVoid: 0 } });
  } catch (error) {
    let message: string;
    message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};

export const getAppsWithPermissions = async () => {
  try {
    const db = await getPalmettoDBConnection();
    const serviceRepo = db.getRepository(ServiceEntity);
    const actionRepo = db.getRepository(ActionEntity);

    const apps = await serviceRepo.find({ where: { pvVoid: 0 } });
    const actions = await actionRepo.find({ where: { pvVoid: 0 } });

    const appsWithActions: IAppsWithPermissions[] = apps.map((app) => {
      return {
        ...app,
        actions: actions.filter((action) => action.pvServiceID === app.pvServiceID),
      };
    });
    return appsWithActions.length ? appsWithActions : [];
  } catch (error) {
    let message: string;
    message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};
