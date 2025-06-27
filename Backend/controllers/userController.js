const userService = require('../services/userService');

// Controller methods for User
const userController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await userService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new user
    createUser: async (req, res) => {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update user
    updateUser: async (req, res) => {
        try {
            const user = await userService.updateUser(req.params.id, req.body);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const user = await userService.deleteUser(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await userService.authenticateUserByUsername(username, password);
            const tokens = userService.generateTokens(user);
            res.json({ user, ...tokens });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },
};

module.exports = userController;