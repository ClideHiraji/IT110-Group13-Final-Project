import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Trash2,
  ExternalLink,
  Search,
  Grid3x3,
  List,
  Palette,
  Calendar,
  User,
  X,
  Save,
  Edit3
} from 'lucide-react';

export default function Collection({ auth }) {
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  const periods = ['all', 'ancient', 'medieval', 'renaissance', 'baroque', 'modern'];

  useEffect(() => {
    loadCollection();
  }, []);

  useEffect(() => {
    filterAndSortArtworks();
  }, [artworks, searchQuery, selectedPeriod, sortBy]);

  const loadCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      if (response.ok) {
        const data = await response.json();
        setArtworks(data);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortArtworks = () => {
    let filtered = [...artworks];

    if (searchQuery) {
      filtered = filtered.filter(art =>
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.artist?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(art =>
        art.period?.toLowerCase() === selectedPeriod
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        default:
          return 0;
      }
    });

    setFilteredArtworks(filtered);
  };

  const handleRemove = async (artworkId) => {
    if (!confirm('Remove this artwork from your collection?')) return;

    try {
      const response = await fetch(`/api/collection/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
      });

      if (response.ok) {
        setArtworks(artworks.filter(a => a.artwork_id !== artworkId));
        if (selectedArtwork?.artwork_id === artworkId) {
          setSelectedArtwork(null);
        }
      }
    } catch (error) {
      console.error('Error removing artwork:', error);
    }
  };

  const handleSaveNote = async (artworkId) => {
    try {
      const response = await fetch(`/api/collection/${artworkId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({ note: noteText }),
      });

      if (response.ok) {
        const updated = artworks.map(art =>
          art.artwork_id === artworkId ? { ...art, notes: noteText } : art
        );
        setArtworks(updated);
        setSelectedArtwork(prev =>
          prev ? { ...prev, notes: noteText } : prev
        );
        setEditingNote(null);
        setNoteText('');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Collection" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">

        {/* Header (Dashboard-style) */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  My Collection
                </h1>
                <p className="text-gray-400 mt-2 flex items-center gap-2">
                  <Heart size={16} className="text-amber-400" />
                  {filteredArtworks.length} saved artworks
                </p>
              </div>

              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
              >
                Back to Dashboard
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Section Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-4 flex items-center gap-2"
          >
            <Palette size={24} className="text-amber-400" />
            Your Saved Artworks
          </motion.h2>

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-white/10 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artworks..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white"
                />
              </div>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg text-white px-4 py-2.5 capitalize"
              >
                {periods.map(p => (
                  <option key={p} value={p} className="bg-gray-900">
                    {p === 'all' ? 'All Periods' : p}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg text-white px-4 py-2.5"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title A–Z</option>
                <option value="artist">Artist A–Z</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Artworks */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : filteredArtworks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((art, i) => (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 hover:border-pink-500/40 overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-black">
                    {art.image ? (
                      <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Palette className="text-gray-600" size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-white font-bold">{art.title}</h3>
                    <p className="text-pink-400 text-sm">{art.artist}</p>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedArtwork(art)}
                        className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemove(art.artwork_id)}
                        className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="mx-auto text-gray-600 mb-4" size={64} />
              <h3 className="text-white text-2xl font-bold">No artworks found</h3>
              <p className="text-gray-400 mt-2">Start exploring and saving artworks you love</p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
