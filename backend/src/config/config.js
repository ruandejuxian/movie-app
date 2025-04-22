require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://your_mongodb_uri',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '781709380321-kkmkhne2d37dj0jpprerm39f0bc4lejd.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  API_MOVIE_URL: process.env.API_MOVIE_URL || 'https://ophim17.cc/api-document',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
