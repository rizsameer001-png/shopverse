import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Spinner } from '../components/common';
import { Calendar, Eye, Tag, ArrowLeft, User, MessageCircle, Send, Clock, Share2, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import VoiceReader from "./VoiceReader";

/* ── Blog Card ─────────────────────────────────────────────── */
function BlogCard({ blog }) {
  const readTime = blog.content ? Math.max(1, Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) : 1;
  return (
    <Link to={`/blog/${blog.slug}`}
      className="group block card overflow-hidden hover:shadow-product-hover transition-all duration-300">
      {/*<div className="relative h-96 overflow-hidden bg-gray-100">*/}
      <div className="relative aspect-[10/14] overflow-hidden bg-gray-100">
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-5xl">📝</div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {blog.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5 flex-wrap">
          <span className="flex items-center gap-1"><Calendar size={11} />{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{readTime} min read</span>
          <span className="flex items-center gap-1"><Eye size={11} />{blog.views || 0} views</span>
        </div>
        <h3 className="font-heading font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug text-lg">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
              {blog.author?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-xs text-gray-500 font-medium">{blog.author?.name || 'Admin'}</span>
          </div>
          <span className="text-xs text-primary-600 font-semibold group-hover:underline">Read more →</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Blog List Page ────────────────────────────────────────── */
export function BlogListPage() {
  const [blogs,          setBlogs]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [categories,     setCategories]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [page,           setPage]           = useState(1);
  const [pages,          setPages]          = useState(1);
  const [total,          setTotal]          = useState(0);
  const [search,         setSearch]         = useState('');

  useEffect(() => {
    api.get('/blogs/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 6 };
    if (activeCategory) params.category = activeCategory;
    if (search.trim())  params.keyword  = search.trim();
    api.get('/blogs', { params })
      .then(r => { setBlogs(r.data.data || []); setPages(r.data.pages || 1); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false));
  }, [page, activeCategory, search]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); };

  return (
    <div className="page-container py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Our Blog</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">Stories & Insights</h1>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">News, tips, and updates from ShopVerse</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={search}
            onChange={e => { setSearch(e.target.value); if (!e.target.value) setPage(1); }}
            className="flex-1 input-field text-sm"
          />
          <button type="submit" className="btn-primary px-5">Search</button>
        </div>
      </form>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          <button
            onClick={() => { setActiveCategory(''); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${!activeCategory ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Posts
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === cat ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 text-center mb-6">
          {total > 0 ? `Showing ${blogs.length} of ${total} posts` : 'No posts found'}
          {activeCategory && <span> in <strong>{activeCategory}</strong></span>}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500 font-medium">No blog posts found</p>
          {(activeCategory || search) && (
            <button onClick={() => { setActiveCategory(''); setSearch(''); setPage(1); }} className="btn-outline mt-4 px-6">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          <span className="px-5 py-2 text-sm text-gray-500 bg-gray-50 rounded-xl">
            {page} / {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Blog Detail Page ──────────────────────────────────────── */
export function BlogDetailPage() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const { user }     = useSelector(s => s.auth);

  const [blog,        setBlog]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [comment,     setComment]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [related,     setRelated]     = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.get(`/blogs/${slug}`)
      .then(r => {
        setBlog(r.data.data);
        // Fetch related posts from same category
        if (r.data.data?.category) {
          api.get('/blogs', { params: { category: r.data.data.category, limit: 3 } })
            .then(rel => setRelated((rel.data.data || []).filter(b => b.slug !== slug)))
            .catch(() => {});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to comment'); navigate('/login'); return; }
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/blogs/${blog._id}/comments`, { comment });
      toast.success('Comment submitted! Awaiting approval.');
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit comment');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center items-center py-40"><Spinner size="lg" /></div>;

  if (error || !blog) return (
    <div className="page-container py-20 text-center">
      <div className="text-6xl mb-4">📝</div>
      <h2 className="font-heading text-2xl font-bold text-gray-700 mb-2">Post Not Found</h2>
      <p className="text-gray-400 mb-6">This blog post doesn't exist or has been removed.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate(-1)} className="btn-outline px-6">← Go Back</button>
        <Link to="/blog" className="btn-primary px-6">All Posts</Link>
      </div>
    </div>
  );

  const approvedComments = blog.comments?.filter(c => c.isApproved) || [];
  const readTime = blog.content ? Math.max(1, Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) : 1;

  return (
    <div className="page-container py-10">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-7 text-sm font-medium group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
        </Link>

        {/* Cover image */}
        {blog.coverImage?.url && (
          <div className="rounded-2xl overflow-hidden mb-8 aspect-[20/30] bg-gray-100 shadow-lg">
            <img
              src={blog.coverImage.url}
              alt={blog.title}
              className="w-full h-full object-cover"
              style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{blog.category}</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><Calendar size={13} />{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><Clock size={13} />{readTime} min read</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400"><Eye size={13} />{blog.views} views</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">{blog.title}</h1>

        {/* Author + share */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">
              {blog.author?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{blog.author?.name || 'Admin'}</p>
              <p className="text-gray-400 text-xs">Author</p>
            </div>
          </div>
          <button onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors px-3 py-2 hover:bg-gray-100 rounded-xl">
            {copied ? <><Check size={15} className="text-green-500" /> Copied!</> : <><Share2 size={15} /> Share</>}
          </button>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-7">
            {blog.tags.map(t => (
              <span key={t} className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                <Tag size={10} />#{t}
              </span>
            ))}
          </div>
        )}

        {/* Voice Reader */}
          <VoiceReader htmlContent={blog.content} />
        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12
            prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-md
            prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
            prose-blockquote:border-primary-400 prose-blockquote:bg-primary-50 prose-blockquote:rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* ── Comments ───────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-10">
          <h3 className="font-heading text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-primary-600" />
            Comments ({approvedComments.length})
          </h3>

          {approvedComments.length > 0 ? (
            <div className="space-y-4 mb-8">
              {approvedComments.map((c, i) => (
                <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-8 py-4 text-center bg-gray-50 rounded-xl">
              No comments yet — be the first to share your thoughts!
            </p>
          )}

          {/* Comment form */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Leave a Comment</h4>
            {user ? (
              <form onSubmit={handleComment} className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-xl px-3 py-2 border border-gray-200">
                  <User size={14} className="text-gray-400" />
                  Commenting as <strong>{user.name}</strong>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts about this post..."
                  className="input-field resize-none w-full"
                  required
                />
                <button type="submit" disabled={submitting || !comment.trim()}
                  className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50">
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className="text-center py-5">
                <p className="text-gray-500 text-sm mb-4">Sign in to leave a comment</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/login" className="btn-primary px-6">Sign In</Link>
                  <Link to="/register" className="btn-outline px-6">Register</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Posts ───────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-14 pt-10 border-t border-gray-200">
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.slice(0, 2).map(b => <BlogCard key={b._id} blog={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogListPage;
