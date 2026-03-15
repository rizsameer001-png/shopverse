import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Spinner } from '../components/common';
import { Calendar, Eye, Tag, ArrowLeft, User, MessageCircle, Send, Clock, Share2, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   BLOG CARD
───────────────────────────────────────────── */
function BlogCard({ blog }) {

  const readTime = blog.content
    ? Math.max(1, Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))
    : 1;

  const image = blog.coverImage?.url || "/no-image.jpg";

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block card overflow-hidden hover:shadow-product-hover transition-all duration-300"
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">

        <img
          src={image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />

        <div className="absolute top-3 left-3">
          <span className="badge bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {blog.category}
          </span>
        </div>

      </div>

      <div className="p-5">

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5 flex-wrap">

          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>

          <span className="flex items-center gap-1">
            <Clock size={11} /> {readTime} min read
          </span>

          <span className="flex items-center gap-1">
            <Eye size={11} /> {blog.views || 0} views
          </span>

        </div>

        <h3 className="font-heading font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug text-lg">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">

          <div className="flex items-center gap-2">

            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
              {blog.author?.name?.[0]?.toUpperCase() || "A"}
            </div>

            <span className="text-xs text-gray-500 font-medium">
              {blog.author?.name || "Admin"}
            </span>

          </div>

          <span className="text-xs text-primary-600 font-semibold group-hover:underline">
            Read more →
          </span>

        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   BLOG LIST PAGE
───────────────────────────────────────────── */
export function BlogListPage() {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');

  /* GET CATEGORIES */

  useEffect(() => {

    api.get('/blogs/categories')
      .then(res => {
        setCategories(res.data.data || []);
      })
      .catch(() => { });

  }, []);

  /* GET BLOGS */

  useEffect(() => {

    setLoading(true);

    const params = {
      page,
      limit: 9
    };

    if (activeCategory) params.category = activeCategory;
    if (search.trim()) params.keyword = search.trim();

    api.get('/blogs', { params })

      .then(res => {

        setBlogs(res.data.data || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);

      })

      .catch(() => toast.error("Failed to load blogs"))

      .finally(() => setLoading(false));

  }, [page, activeCategory, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="page-container py-12">

      {/* HEADER */}

      <div className="text-center mb-10">
        <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
          Our Blog
        </p>

        <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
          Stories & Insights
        </h1>

        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          News, tips, and updates from ShopVerse
        </p>
      </div>

      {/* SEARCH */}

      <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Search blog posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 input-field text-sm"
          />

          <button className="btn-primary px-5">
            Search
          </button>

        </div>

      </form>

      {/* CATEGORY FILTER */}

      {categories.length > 0 && (

        <div className="flex gap-2 flex-wrap justify-center mb-8">

          <button
            onClick={() => { setActiveCategory(''); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold
            ${!activeCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}
            `}
          >
            All Posts
          </button>

          {categories.map(cat => (

            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold
              ${activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}
              `}
            >
              {cat}
            </button>

          ))}

        </div>

      )}

      {/* BLOG GRID */}

      {loading ? (

        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>

      ) : (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}

        </div>

      )}

    </div>
  );
}

/* ─────────────────────────────────────────────
   BLOG DETAIL PAGE
───────────────────────────────────────────── */
export function BlogDetailPage() {

  const { slug } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector(s => s.auth);

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState([]);

  /* GET BLOG */

  useEffect(() => {

    setLoading(true);

    api.get(`/blogs/${slug}`)

      .then(res => {

        const blogData = res.data.data;
        setBlog(blogData);

        document.title = blogData.title + " | Blog";

        /* RELATED POSTS */

        if (blogData.category) {

          api.get('/blogs', {
            params: {
              category: blogData.category,
              limit: 3
            }
          })

            .then(rel => {

              const items = rel.data.data || [];

              setRelated(
                items.filter(b => b.slug !== slug)
              );

            })

            .catch(() => { });

        }

      })

      .catch(() => navigate("/blog"))

      .finally(() => setLoading(false));

  }, [slug]);

  /* SHARE */

  const handleShare = () => {

    navigator.clipboard.writeText(window.location.href)

      .then(() => {

        setCopied(true);
        toast.success("Link copied");

        setTimeout(() => setCopied(false), 2000);

      });

  };

  /* COMMENT */

  const handleComment = async (e) => {

    e.preventDefault();

    if (!user) {
      toast.error("Login required");
      navigate("/login");
      return;
    }

    try {

      setSubmitting(true);

      await api.post(`/blogs/${blog._id}/comments`, {
        comment
      });

      toast.success("Comment submitted for approval");
      setComment('');

    } catch (err) {

      toast.error("Comment failed");

    } finally {

      setSubmitting(false);

    }

  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Spinner size="lg" />
      </div>
    );
  }

  const approvedComments = blog.comments?.filter(c => c.isApproved) || [];

  return (

    <div className="page-container py-10">

      <div className="max-w-3xl mx-auto">

        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-500 mb-7"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* COVER IMAGE */}

        {blog.coverImage?.url && (

          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="rounded-2xl mb-8"
          />

        )}

        {/* META */}

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">

          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>

          <span className="flex items-center gap-1">
            <Eye size={13} />
            {blog.views || 0}
          </span>

        </div>

        {/* TITLE */}

        <h1 className="text-4xl font-bold mb-6">
          {blog.title}
        </h1>

        {/* CONTENT */}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* SHARE */}

        <button
          onClick={handleShare}
          className="mt-6 flex items-center gap-2"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          Share
        </button>

        {/* COMMENTS */}

        <div className="mt-12">

          <h3 className="text-xl font-bold mb-6">
            Comments ({approvedComments.length})
          </h3>

          {approvedComments.map((c, i) => (

            <div key={i} className="mb-4">

              <strong>{c.name}</strong>

              <p>{c.comment}</p>

            </div>

          ))}

        </div>

        {/* COMMENT FORM */}

        <form onSubmit={handleComment} className="mt-6">

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            className="input-field w-full"
          />

          <button
            disabled={submitting}
            className="btn-primary mt-3"
          >
            {submitting ? "Submitting..." : "Post Comment"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default BlogListPage;