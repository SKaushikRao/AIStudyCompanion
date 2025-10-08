// YouTube Data API integration
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // You'll need to get this from Google Cloud Console
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export const searchYouTubeVideos = async (query, maxResults = 3) => {
  try {
    // For demo purposes, we'll return mock data
    // In production, you would use the actual YouTube API
    const mockVideos = [
      {
        id: 'dQw4w9WgXcQ',
        title: `Study Guide: ${query}`,
        channel: 'Educational Channel',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        duration: '10:30'
      },
      {
        id: 'jNQXAC9IVRw',
        title: `Tutorial: ${query} Explained`,
        channel: 'Learn Academy',
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
        duration: '15:45'
      },
      {
        id: 'M7lc1UVf-VE',
        title: `Quick Review: ${query}`,
        channel: 'Study Hub',
        thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg',
        duration: '8:20'
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockVideos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
};

// Real YouTube API implementation (commented out - requires API key)
/*
export const searchYouTubeVideos = async (query, maxResults = 3) => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }
    
    const data = await response.json();
    
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
};
*/
