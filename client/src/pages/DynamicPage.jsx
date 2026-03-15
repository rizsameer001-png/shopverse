import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Spinner } from '../components/common';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/pages/${slug}`)
      .then(r => setPage(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error || !page) return (
    <div className="page-container py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="font-heading text-2xl font-bold text-gray-700">Page not found</h2>
      <Link to="/" className="btn-primary mt-5 inline-flex">Go Home</Link>
    </div>
  );

  return (
    <div className={`py-10 ${page.template === 'full-width' ? 'w-full px-6' : 'page-container max-w-4xl mx-auto'}`}>
      {/* Cover image */}
      {page.coverImage?.url && (
        <div className="rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
          <img src={page.coverImage.url} alt={page.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-6">{page.title}</h1>
      {page.excerpt && <p className="text-xl text-gray-500 mb-8 leading-relaxed border-l-4 border-primary-200 pl-4">{page.excerpt}</p>}
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
