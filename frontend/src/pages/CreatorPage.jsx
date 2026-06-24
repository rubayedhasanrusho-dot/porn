import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import VideoCard from '../components/VideoCard';

export default function CreatorPage() {
  const { creatorName } = useParams();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${creatorName} - TubeMax`;
  }, [creatorName]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/videos?creator=${encodeURIComponent(creatorName)}&page=${page}&limit=24`);
        if (page === 1) setVideos(data.videos);
        else setVideos(prev => [...prev, ...data.videos]);
        setHasMore(data.page < data.pages);
      } catch { setVideos([]); }
      setLoading(false);
    };
    fetchVideos();
  }, [creatorName, page]);

  return (
    <div className="content">
      <div className="category-header" style={{ padding: '20px 24px', background: '#1a1a2e', marginBottom: '24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e6363e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{creatorName[0]?.toUpperCase()}</div>
        <div>
          <h1 style={{ fontSize: 24, margin: '0 0 4px', color: '#fff' }}>{creatorName}</h1>
          <span style={{ color: '#999', fontSize: 14 }}>{videos.length} videos</span>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="video-card" style={{ aspectRatio: '16/9', background: '#1a1a2e', borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <>
          {videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>No videos found for this creator</div>
          ) : (
            <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {videos.map(v => <VideoCard key={v._id} video={v} />)}
            </div>
          )}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <button onClick={() => setPage(p => p + 1)} className="load-more" disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
