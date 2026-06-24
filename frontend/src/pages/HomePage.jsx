import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoGrid from '../components/VideoGrid';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/scrape/auto')
      .then(({ data }) => {
        setVideos(data.videos || []);
        return axios.get('/api/videos?sort=trending&limit=8');
      })
      .then(({ data }) => {
        const t = data.videos || [];
        setTrending(t);
        setVideos(prev => prev.filter(v => !t.some(tv => tv._id === v._id)));
      })
      .catch(() => {
        axios.get('/api/videos?sort=latest&limit=24').then(({ data }) => {
          setVideos(data.videos || []);
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const loadMore = () => {
    const next = page + 1;
    axios.get(`/api/videos?sort=latest&limit=24&page=${next}`)
      .then(({ data }) => {
        if (data.videos && data.videos.length > 0) {
          setVideos(prev => [...prev, ...data.videos]);
          setPage(next);
        } else {
          setHasMore(false);
        }
      })
      .catch(() => setHasMore(false));
  };

  if (loading) {
    return (
      <div className="main-wrap">
        <div className="loading">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="main-wrap">
      {trending.length > 0 && <VideoGrid videos={trending} title="Trending" />}
      {videos.length > 0 && <VideoGrid videos={videos} title="Latest Videos" />}
      {hasMore && (
        <div className="load-more-wrap">
          <button onClick={loadMore} className="load-more-btn">Load More</button>
        </div>
      )}
    </div>
  );
}
