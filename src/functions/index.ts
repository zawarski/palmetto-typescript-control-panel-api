import { getGroupContactsByGroupId, postContactsToGroup } from './contacts';
import { getGroupAll, getGroupByID, postGroup, postSubGroups } from './group_management';
import { getAppsWithPermissions, getServices } from './applications';

const functions = {
  getAppsWithPermissions,
  getGroupAll,
  getGroupByID,
  getGroupContactsByGroupId,
  getServices,
  postContactsToGroup,
  postGroup,
  postSubGroups,
};

export default functions;
