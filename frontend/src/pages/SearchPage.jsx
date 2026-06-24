import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import VideoGrid from '../components/VideoGrid';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setVideos([]); setTotal(0); return; }
    setLoading(true);
    api.get(`/api/videos/merged-search?q=${encodeURIComponent(q)}`)
      .then(({ data }) => {
        setVideos(data.videos || []);
        setTotal(data.total || 0);
      })
      .catch(() => { setVideos([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="main-wrap">
      <div className="section-header">
        <h2 className="section-title">{q ? `Results for "${q}"` : 'Search'}</h2>
        {total > 0 && <span className="result-count">{total} video{total !== 1 ? 's' : ''}</span>}
      </div>
      {loading && videos.length === 0 ? (
        <div className="loading">Searching...</div>
      ) : videos.length > 0 ? (
        <>
          <VideoGrid videos={videos} showSource />
          {videos.some(v => v._source === 'xhamster') && (
            <p style={{ textAlign: 'center', color: '#666', fontSize: 13, marginTop: 16 }}>
              Some results are live from xhamster
            </p>
          )}
        </>
      ) : q ? (
        <div className="no-videos">No results found for "{q}"</div>
      ) : (
        <div className="no-videos">Type a search query to find videos</div>
      )}
    </div>
  );
}
