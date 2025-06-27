import { getAllUsers as getAllUsersApi } from './api';

export const userService = {
  getAllUsers: async () => {
    return await getAllUsersApi();
  },
}; 