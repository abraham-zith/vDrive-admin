import { Router } from 'express';
import { UserManagementController } from './userManagement.controller';
import isAuthenticated from '../../shared/authentication';

const router = Router();

// Apply admin authentication to all routes
router.use(isAuthenticated);

router.get('/', UserManagementController.getUsers);

router.get('/:id', UserManagementController.getUserById);

router.post('/', UserManagementController.createUser);

router.patch('/:id', UserManagementController.updateUser);

router.patch('/block/:id', UserManagementController.blockUser);

router.patch('/unblock/:id', UserManagementController.unblockUser);

router.patch('/disable/:id', UserManagementController.disableUser);

router.patch('/enable/:id', UserManagementController.enableUser);

router.patch(
    '/suspend/:id',
    UserManagementController.suspendUser
);

router.patch(
    '/unsuspend/:id',
    UserManagementController.unsuspendUser
);

router.get('/search', UserManagementController.searchUsers);

router.delete('/:id', UserManagementController.deleteUser);

export default router;
