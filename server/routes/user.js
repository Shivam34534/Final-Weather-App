import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

import bcrypt from 'bcryptjs';

const router = express.Router();

// Get User Data (Sync)
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Settings
router.put('/settings', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { settings: req.body } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Password
router.put('/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle 2FA
router.put('/2fa', verifyToken, async (req, res) => {
    try {
        const { enabled } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { isTwoFactorEnabled: enabled } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, username, phone, address, location } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name, username, phone, address, location } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add History Item
router.post('/history', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Add to start, limit to 10
        user.history.unshift(req.body);
        if (user.history.length > 10) user.history.pop();

        await user.save();
        res.json(user.history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
