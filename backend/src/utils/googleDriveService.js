const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Service to handle Google Drive operations
 */
class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Drive API client
   * @returns {Promise} - Promise with initialization result
   */
  async initialize() {
    try {
      if (this.initialized) return true;

      this.auth = new google.auth.OAuth2(
        config.GOOGLE_CLIENT_ID,
        config.GOOGLE_CLIENT_SECRET,
        `${config.CLIENT_URL}/api/auth/google/callback`
      );

      // Set credentials if available
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        this.auth.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
      }

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      throw new Error('Không thể khởi tạo dịch vụ Google Drive');
    }
  }

  /**
   * Set user credentials for Google Drive API
   * @param {Object} credentials - User credentials
   */
  setCredentials(credentials) {
    if (!this.auth) {
      throw new Error('Google Drive service not initialized');
    }
    this.auth.setCredentials(credentials);
  }

  /**
   * List files in Google Drive
   * @param {Object} options - Query options
   * @returns {Promise} - Promise with files list
   */
  async listFiles(options = {}) {
    try {
      await this.initialize();

      const response = await this.drive.files.list({
        pageSize: options.pageSize || 10,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink)',
        q: options.query || "mimeType contains 'video/'",
        pageToken: options.pageToken || null
      });

      return response.data;
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      throw new Error('Không thể lấy danh sách file từ Google Drive');
    }
  }

  /**
   * Get file details from Google Drive
   * @param {String} fileId - Google Drive file ID
   * @returns {Promise} - Promise with file details
   */
  async getFile(fileId) {
    try {
      await this.initialize();

      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, description, thumbnailLink, webViewLink, webContentLink, size'
      });

      return response.data;
    } catch (error) {
      console.error(`Error getting file ${fileId} from Google Drive:`, error);
      throw new Error('Không thể lấy thông tin file từ Google Drive');
    }
  }

  /**
   * Generate direct streaming URL for a video file
   * @param {String} fileId - Google Drive file ID
   * @returns {String} - Streaming URL
   */
  generateStreamingUrl(fileId) {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${process.env.GOOGLE_API_KEY}`;
  }

  /**
   * Generate embed URL for a video file
   * @param {String} fileId - Google Drive file ID
   * @returns {String} - Embed URL
   */
  generateEmbedUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Map Google Drive file to movie model
   * @param {Object} driveFile - Google Drive file data
   * @param {Object} additionalData - Additional movie data
   * @returns {Object} - Mapped movie data
   */
  mapDriveFileToMovie(driveFile, additionalData = {}) {
    const title = driveFile.name.replace(/\.[^/.]+$/, ''); // Remove file extension
    
    return {
      title: title,
      description: additionalData.description || driveFile.description || `Phim ${title}`,
      genre: additionalData.genre || ['Chưa phân loại'],
      releaseYear: additionalData.releaseYear || new Date().getFullYear(),
      director: additionalData.director || 'Chưa cập nhật',
      actors: additionalData.actors || [],
      poster: driveFile.thumbnailLink || '',
      videoUrl: this.generateEmbedUrl(driveFile.id),
      source: 'google_drive',
      rating: 0,
      views: 0
    };
  }
}

module.exports = new GoogleDriveService();
