import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useLayout } from '../components/Layout';
import { useData } from '../context/DataContext';

const tags = ['All Topics', 'Anxiety', 'Sleep', 'Mindfulness', 'General'];

function Community() {
  const { toggleMobileMenu } = useLayout();
  const { communityPosts, createCommunityPost, toggleLikePost, addCommentToPost, profile } = useData();

  const [activeTag, setActiveTag] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');

  // New post modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Anxiety');

  // Comment input state per post
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const filteredPosts = communityPosts.filter((post) => {
    const matchesTag = activeTag === 'All Topics' || post.tag.toLowerCase() === activeTag.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    createCommunityPost({ title: newTitle, content: newContent, tag: newTag });
    setNewTitle('');
    setNewContent('');
    setShowPostModal(false);
  };

  const handleAddComment = (postId) => {
    addCommentToPost(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 h-20 flex justify-between items-center px-margin-mobile md:px-margin-desktop shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={toggleMobileMenu} className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Community Support</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 mr-8">
            <Link to="/resources" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Resources</Link>
            <Link to="/programs" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Programs</Link>
            <Link to="/community" className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md">Community</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:scale-105 transition">
              <img className="w-full h-full object-cover" src={profile.avatar} alt={profile.name} />
            </Link>
          </div>
        </div>
      </header>

      {/* Page Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="max-w-[1200px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-xl flex-grow">

          {/* Welcome & Create Post Hero Banner */}
          <section className="bg-primary-container text-on-primary-container rounded-[2rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-headline-lg text-headline-lg font-bold mb-3">You are not alone.</h2>
              <p className="font-body-lg text-body-lg mb-6 opacity-90">
                Connect in safe, moderated discussions with peers who understand what you are going through.
              </p>
              <button
                onClick={() => setShowPostModal(true)}
                className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                <span>Start a Discussion</span>
              </button>
            </div>
          </section>

          {/* Search & Topic Filters */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(t)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTag === t
                      ? 'bg-primary text-white shadow'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-container-low text-xs border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Dynamic Discussions Feed */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">{post.author}</h4>
                        <span className="text-xs text-outline">{post.time}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-secondary-container/30 text-secondary font-bold text-xs rounded-full">
                      {post.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">{post.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{post.content}</p>
                  </div>

                  {/* Actions & Comment Count */}
                  <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 text-xs font-semibold text-on-surface-variant">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${post.isLiked ? 'bg-rose-500/10 text-rose-600 font-bold' : 'hover:bg-surface-container-high'
                        }`}
                    >
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                      </span>
                      <span>{post.likes} Likes</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-surface-container-high transition"
                    >
                      <span className="material-symbols-outlined text-base">chat_bubble_outline</span>
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>

                  {/* Comments Thread */}
                  {activeCommentPostId === post.id && (
                    <div className="pt-3 border-t border-outline-variant/10 space-y-3 bg-surface-container-low/50 p-4 rounded-2xl">
                      {post.comments.map((c) => (
                        <div key={c.id} className="flex gap-3 text-xs">
                          <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full object-cover" />
                          <div className="flex-1 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-on-surface">{c.author}</span>
                              <span className="text-[10px] text-outline">{c.time}</span>
                            </div>
                            <p className="text-on-surface-variant">{c.text}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write a supportive comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 px-4 py-2 rounded-full text-xs bg-surface-container-lowest border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:opacity-90 transition"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </section>

        </div>
        <Footer />
      </div>

      {/* Create Discussion Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md font-bold text-on-surface text-lg">Create Community Discussion</h3>
              <button onClick={() => setShowPostModal(false)} className="p-1 text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Topic Tag</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs font-semibold"
                >
                  <option value="Anxiety">Anxiety</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Stress">Stress</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Summarize your experience or question..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Content</label>
                <textarea
                  rows={4}
                  placeholder="Share details in a respectful, supportive tone..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary text-white hover:opacity-90 shadow"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;
