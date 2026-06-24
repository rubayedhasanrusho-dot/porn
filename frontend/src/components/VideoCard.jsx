import { Link } from 'react-router-dom';

function isRealId(id) {
  return id && /^[a-f0-9]{24}$/i.test(id);
}

export default function VideoCard({ video, showSource }) {
  const id = isRealId(video._id) ? video._id : null;

  const formatViews = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n;
  };

  const hostname = video.source ? (() => {
    try { return new URL(video.source).hostname.replace('www.', ''); } catch { return 'xhamster'; }
  })() : 'xhamster';

  const thumb = video.thumbnail ||
    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" fill="%231a1a1e"><rect width="320" height="180"/><text x="160" y="100" text-anchor="middle" fill="%23555" font-size="14">No Thumb</text></svg>');

  const content = (
    <>
      <div className="video-card-thumb">
        <img src={thumb} alt={video.title} loading="lazy" onError={e => { e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" fill="%231a1a1e"><rect width="320" height="180"/><text x="160" y="100" text-anchor="middle" fill="%23555" font-size="14">No Thumb</text></svg>'); }} />
        {video.duration && <span className="duration-badge">{video.duration}</span>}
        {showSource && video._source === 'xhamster' && <span className="source-badge">Live</span>}
      </div>
      <div className="video-card-info">
        <div className="video-card-title">{video.title}</div>
        {video.creator && (
          <div className="video-card-creator" onClick={e => { e.stopPropagation(); e.preventDefault(); window.location.href = `/creator/${encodeURIComponent(video.creator)}`; }}>
            <span className="creator-avatar">{video.creator[0]?.toUpperCase()}</span>
            <span className="creator-name">{video.creator}</span>
          </div>
        )}
        <div className="video-card-meta">
          <span>{formatViews(video.views)} views</span>
          <span className="sep">•</span>
          <span>{hostname}</span>
        </div>
      </div>
    </>
  );

  if (id) {
    return <Link to={`/video/${id}`} className="video-card">{content}</Link>;
  }
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-card">
      {content}
    </a>
  );
}
