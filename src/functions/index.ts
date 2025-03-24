import { getGroupContactsByGroupId, postContactsToGroup } from './contacts';
import { getGroupAll, getGroupByID, postGroup, postSubGroups } from './group_management';
import { getAppsWithPermissions, getServices, postAppsByGroup } from './applications';

const functions = {
  getAppsWithPermissions,
  getGroupAll,
  getGroupByID,
  getGroupContactsByGroupId,
  getServices,
  postAppsByGroup,
  postContactsToGroup,
  postGroup,
  postSubGroups,
};

export default functions;
