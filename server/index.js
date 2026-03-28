import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('SkySense Backend is Running');
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop other processes running on this port.`);
        process.exit(1);
    } else {
        console.error('Server Error:', error);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
