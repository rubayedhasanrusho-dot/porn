import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoGrid from '../components/VideoGrid';

export default function CategoryPage() {
  const { slug } = useParams();
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/categories').then(({ data }) => {
      const cat = data.find((c) => c.slug === slug);
      setCategory(cat);
      if (cat) {
        return axios.get(`/api/videos?category=${cat._id}&limit=50`);
      }
      return { data: { videos: [] } };
    }).then(({ data }) => {
      setVideos(data.videos);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="main-wrap"><div className="loading">Loading...</div></div>;

  return (
    <div className="main-wrap">
      <VideoGrid
        videos={videos}
        title={category ? `${category.icon} ${category.name}` : 'Category'}
      />
    </div>
  );
}
