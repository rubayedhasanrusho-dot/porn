import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import VideoGrid from '../components/VideoGrid';

function getHostname(u) {
  try { return new URL(u).hostname.replace('www.', ''); } catch { return 'source'; }
}

export default function VideoPage() {
  const { id } = useParams();
  const fetched = useRef(false);
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id.length < 5) { setLoading(false); return; }
    if (fetched.current) return;
    fetched.current = true;

    setLoading(true);
    api.get(`/api/videos/${id}`)
      .then(({ data }) => {
        setVideo(data);
        document.title = data.title + ' — Tubemax';
        const desc = data.description || data.title;
        const setMeta = (q, c) => { const el = document.querySelector(q); if (el) el.setAttribute('content', c); };
        setMeta('meta[name="description"]', desc);
        setMeta('meta[property="og:title"]', data.title);
        setMeta('meta[property="og:description"]', desc);
        setMeta('meta[property="og:image"]', data.thumbnail || '');
        return api.get('/api/videos?limit=8');
      })
      .then(({ data }) => setRelated(data.videos.filter(v => v._id !== id)))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => { document.title = 'Tubemax'; };
  }, [id]);

  if (loading) return <div className="main-wrap"><div className="loading">Loading...</div></div>;
  if (!video) return <div className="main-wrap"><div className="error-page">Video not found</div></div>;

  const thumb = video.thumbnail ||
    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" fill="%231a1a1e"><rect width="800" height="450"/><text x="400" y="240" text-anchor="middle" fill="%23555" font-size="20">No Thumb</text></svg>');

  return (
    <div className="video-page">
      <div className="video-main">
        <div className="video-embed">
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="visit-original">
            <img src={thumb} alt={video.title} onError={e => { e.target.style.display = 'none'; }} />
            <div className="play-overlay">▶ Play</div>
          </a>
        </div>
        <h1 className="video-title">{video.title}</h1>
        <div className="video-meta">
          <span>{video.views || 0} views</span>
          {video.category && (
            <Link to={`/category/${video.category.slug}`} className="category-badge">
              {video.category.name}
            </Link>
          )}
        </div>
        {video.description && <p className="video-desc">{video.description}</p>}
      </div>
      <div className="video-sidebar">
        <VideoGrid videos={related} title="Related" />
      </div>
    </div>
  );
}
