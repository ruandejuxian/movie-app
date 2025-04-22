const axios = require('axios');
const config = require('../config/config');

/**
 * Service to fetch movie data from external API
 */
class MovieApiService {
  constructor() {
    this.apiUrl = config.API_MOVIE_URL;
  }

  /**
   * Fetch movies list from API
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with movies data
   */
  async getMovies(params = {}) {
    try {
      const response = await axios.get(`${this.apiUrl}/danh-sach-phim`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          category: params.category || '',
          country: params.country || '',
          year: params.year || '',
          ...params
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching movies from API:', error);
      throw new Error('Không thể lấy danh sách phim từ API');
    }
  }

  /**
   * Fetch movie details by slug or ID
   * @param {String} id - Movie ID or slug
   * @returns {Promise} - Promise with movie details
   */
  async getMovieDetails(id) {
    try {
      const response = await axios.get(`${this.apiUrl}/phim/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie details for ${id}:`, error);
      throw new Error('Không thể lấy thông tin chi tiết phim từ API');
    }
  }

  /**
   * Search movies by keyword
   * @param {String} keyword - Search keyword
   * @param {Object} params - Additional parameters
   * @returns {Promise} - Promise with search results
   */
  async searchMovies(keyword, params = {}) {
    try {
      const response = await axios.get(`${this.apiUrl}/tim-kiem`, {
        params: {
          keyword,
          page: params.page || 1,
          limit: params.limit || 20,
          ...params
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error searching movies with keyword ${keyword}:`, error);
      throw new Error('Không thể tìm kiếm phim từ API');
    }
  }

  /**
   * Map API movie data to our database model
   * @param {Object} apiMovie - Movie data from API
   * @returns {Object} - Mapped movie data for our model
   */
  mapApiMovieToModel(apiMovie) {
    return {
      title: apiMovie.name || apiMovie.title || apiMovie.originalName,
      description: apiMovie.content || apiMovie.description || apiMovie.overview || '',
      genre: Array.isArray(apiMovie.category) 
        ? apiMovie.category.map(cat => cat.name) 
        : (apiMovie.genres || []).map(g => g.name || g),
      releaseYear: apiMovie.year || new Date().getFullYear(),
      director: Array.isArray(apiMovie.director) 
        ? apiMovie.director.join(', ') 
        : (apiMovie.director || 'Chưa cập nhật'),
      actors: Array.isArray(apiMovie.actor) 
        ? apiMovie.actor 
        : (apiMovie.cast || []).map(c => c.name || c),
      poster: apiMovie.thumb_url || apiMovie.poster_path || apiMovie.posterUrl || '',
      videoUrl: this.extractVideoUrl(apiMovie),
      source: 'api',
      rating: apiMovie.rating || 0,
      views: apiMovie.view || 0
    };
  }

  /**
   * Extract video URL from API movie data
   * @param {Object} apiMovie - Movie data from API
   * @returns {String} - Video URL
   */
  extractVideoUrl(apiMovie) {
    if (apiMovie.episodes && apiMovie.episodes.length > 0) {
      const firstEpisode = apiMovie.episodes[0];
      if (firstEpisode.server_data && firstEpisode.server_data.length > 0) {
        return firstEpisode.server_data[0].link_embed || firstEpisode.server_data[0].link_m3u8 || '';
      }
    }
    
    return apiMovie.videoUrl || apiMovie.video_url || '';
  }
}

module.exports = new MovieApiService();
