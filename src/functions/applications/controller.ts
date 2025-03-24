import { getPalmettoDBConnection } from '@db/index';
import { ServiceEntity } from '@entities/service.entity';
import { ActionEntity } from '@entities/action.entity';
import { Group2ActionEntity } from '@entities/group2action.entity';
import { IAppsWithPermissions } from '@interfaces/IAppsWithPermissions';
import { FromSchema } from 'json-schema-to-ts';
import { ApplicationSchema } from './schema';

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

export const postAppsByGroup = async (payload: FromSchema<typeof ApplicationSchema>) => {
  try {
    const db = await getPalmettoDBConnection();
    const appRepo = db.getRepository(Group2ActionEntity);
    const apps = payload.applications;
    const toRemoveIDs = apps
      .filter((app) => app.pvVoid === 1 && app.pvGroup2ActionID > 0)
      .map((app) => app.pvGroup2ActionID);
    if (toRemoveIDs.length > 0) {
      await appRepo
        .createQueryBuilder()
        .update(Group2ActionEntity)
        .set({ pvVoid: 1 })
        .where('pvGroup2ActionID IN (:...toRemoveIDs)', { toRemoveIDs })
        .execute();
    }
    if (Array.isArray(apps) && apps.length) {
      for (const app of apps) {
        if (app.pvVoid === 0) {
          const newApp = new Group2ActionEntity();
          newApp.pvGroupID = app.pvGroupID;
          newApp.pvActionID = app.pvActionID;
          newApp.pvGroupName = app.pvGroupName;
          newApp.pvActionStatus = app.pvActionStatus;
          newApp.pvServiceID = app.pvServiceID;
          newApp.pvServiceName = app.pvServiceName;
          newApp.pvVoid = 0;
          newApp.pvDomainID = 0;
          await appRepo.save(newApp);
        }
      }
      return { message: 'Applications added successfully' };
    } else return Promise.reject(new Error('No applications found'));
  } catch (error) {
    let message = 'Internal Server Error';
    if (error instanceof Error) message = error.message;
    throw { message };
  }
};
