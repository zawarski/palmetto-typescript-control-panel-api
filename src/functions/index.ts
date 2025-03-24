import { getGroupContactsByGroupId, postContactsToGroup } from './contacts';
import { deleteGroup, getGroupAll, getGroupByID, postGroup, postSubGroups } from './group_management';
import { getAppsWithPermissions, getServices, postAppsByGroup } from './applications';

const functions = {
  deleteGroup,
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
