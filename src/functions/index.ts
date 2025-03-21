import { getGroupContactsByGroupId } from './contacts';
import { getGroupAll, getGroupByID, postGroup } from './group_management';
import { getAppsWithPermissions, getServices } from './applications';

const functions = {
  getAppsWithPermissions,
  getGroupAll,
  getGroupByID,
  getGroupContactsByGroupId,
  getServices,
  postGroup,
};

export default functions;
