import VideoCard from './VideoCard';

export default function VideoGrid({ videos, title, link, showSource }) {
  if (!videos || videos.length === 0) return null;
  return (
    <section>
      {(title || link) && (
        <div className="section-header">
          {title && <h2 className="section-title">{title}</h2>}
          {link && <a href={link} className="section-link">View more →</a>}
        </div>
      )}
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v._id || v.url} video={v} showSource={showSource} />
        ))}
      </div>
    </section>
  );
}
