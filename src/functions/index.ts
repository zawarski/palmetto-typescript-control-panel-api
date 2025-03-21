import { getGroupContactsByGroupId } from './contacts';
import { getGroupAll, getGroupByID } from './group_management';
import { getAppsWithPermissions, getServices } from './applications';

const functions = {
  getAppsWithPermissions,
  getGroupAll,
  getGroupByID,
  getGroupContactsByGroupId,
  getServices,
};

export default functions;
