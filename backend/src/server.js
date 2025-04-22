const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const movieRoutes = require('./routes/movie.routes');
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');
const inviteCodeRoutes = require('./routes/inviteCode.routes');
const adminRoutes = require('./routes/admin.routes');
const modRoutes = require('./routes/mod.routes');
const movieApiRoutes = require('./routes/movieApi.routes');

// Import DB config
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Initialize middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Initialize passport
require('./middleware/passport');
app.use(passport.initialize());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite-codes', inviteCodeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mod', modRoutes);
app.use('/api/movies', movieApiRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
