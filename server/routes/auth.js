import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // Create Token
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

        res.status(201).json({
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                settings: savedUser.settings
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: User with email ${email} not found.`);
            return res.status(400).json({ message: 'User does not exist. Please sign up first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Invalid password for email ${email}`);
            return res.status(400).json({ message: 'Invalid password. Please try again.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log(`Login successful for user: ${user.name}`);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                settings: user.settings
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No account with that email found.' });
        }

        // Generate Token
        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        console.log(`Password reset requested for ${email}. Token: ${token}`);

        // In a real app, send email here. For now, we return a success message.
        res.json({
            message: 'Password reset token generated. In a real app, this would be sent via email.',
            token: token // Returning token for easy testing/demo purposes
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been successfully reset.' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
