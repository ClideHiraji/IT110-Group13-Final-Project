import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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

import Header from '@/Components/Header';

/**
 * Collection page
 *
 * Displays the authenticated user's saved artworks and provides:
 * - Fetching the collection from /api/collection on mount.
 * - Search by title or artist, period filtering, and sorting options.
 * - Grid/List view modes with responsive layout.
 * - Ability to remove artworks from the collection.
 * - A detail modal showing artwork information and a personal notes section.
 * - Saving notes per artwork via /api/collection/{id}/note.
 *
 * Props:
 * - auth {object}: Auth data injected by Inertia, passed to Header and AppLayout.
 *
 * State:
 * - artworks {Array}: Raw list of artworks from the API.
 * - filteredArtworks {Array}: Artworks after applying search/filter/sort.
 * - loading {boolean}: Indicates whether the collection is being loaded.
 * - searchQuery {string}: Search text for filtering by title or artist.
 * - selectedPeriod {string}: Selected period filter ('all', 'ancient', etc.).
 * - sortBy {string}: Current sort order ('recent', 'oldest', 'title', 'artist').
 * - viewMode {string}: Layout mode ('grid' or 'list').
 * - selectedArtwork {object|null}: Artwork currently open in the detail modal.
 * - editingNote {number|null}: artwork_id of the artwork whose note is being edited.
 * - noteText {string}: Text content of the note being edited.
 */
export default function Collection({ auth }) {
    // Full list of artworks loaded from the backend
    const [artworks, setArtworks] = useState([]);
    // List of artworks after applying search, filter, and sort
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    // Loading flag while initial fetch is in progress
    const [loading, setLoading] = useState(true);
    // Text typed into the search input
    const [searchQuery, setSearchQuery] = useState('');
    // Currently selected period filter
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    // Current sort mode
    const [sortBy, setSortBy] = useState('recent');
    // View mode for cards ('grid' or 'list')
    const [viewMode, setViewMode] = useState('grid');
    // Artwork currently shown in the detail modal
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    // artwork_id that is being edited for notes (null when not editing)
    const [editingNote, setEditingNote] = useState(null);
    // Textarea content for the notes editor
    const [noteText, setNoteText] = useState('');

    // Available period options for filter dropdown
    const periods = ['all', 'ancient', 'medieval', 'renaissance', 'baroque', 'modern'];

    // Initial load: fetch user's collection once when component mounts
    useEffect(() => {
        loadCollection();
    }, []);

    // Whenever artworks or filters change, recompute the filteredArtworks list
    useEffect(() => {
        filterAndSortArtworks();
    }, [artworks, searchQuery, selectedPeriod, sortBy]);

    /**
     * Fetch the user's collection from the backend API.
     * - Calls GET /api/collection.
     * - On success: stores artworks in state.
     * - Regardless of outcome: clears loading flag.
     */
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

    /**
     * Apply search query, period filter, and sorting to the artworks list.
     * Updates filteredArtworks state.
     */
    const filterAndSortArtworks = () => {
        let filtered = [...artworks];

        // Filter by search query against title and artist fields (case-insensitive)
        if (searchQuery) {
            filtered = filtered.filter(art =>
                art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                art.artist?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by selected period (skip when 'all')
        if (selectedPeriod !== 'all') {
            filtered = filtered.filter(art =>
                art.period?.toLowerCase() === selectedPeriod
            );
        }

        // Sort according to the selected sortBy mode
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

    /**
     * Remove a single artwork from the collection.
     * - Asks the user for confirmation.
     * - Calls DELETE /api/collection/{artworkId}.
     * - On success: removes the artwork from local state and closes the modal
     *   if the removed artwork was currently selected.
     */
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

    /**
     * Save or update a note for a specific artwork.
     * - Calls POST /api/collection/{artworkId}/note with { note: noteText }.
     * - On success: updates notes in artworks state and selectedArtwork,
     *   then clears editingNote and noteText.
     */
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
                // Update collection list
                const updated = artworks.map(art =>
                    art.artwork_id === artworkId ? { ...art, notes: noteText } : art
                );
                setArtworks(updated);

                // Update currently selected artwork if same id
                setSelectedArtwork(prev =>
                    prev ? { ...prev, notes: noteText } : prev
                );

                // Reset editing state
                setEditingNote(null);
                setNoteText('');
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    return (
        <>
            {/* Set browser tab title */}
            <Head title="My Collection" />

            <div className="min-h-screen bg-black">
                {/* App-wide header with navigation and auth info */}
                <Header auth={auth} />

                {/* Hero section with page title and artwork count */}
                <div className="relative bg-gradient-to-br from-amber-950/50 via-orange-950/30 to-black border-b border-amber-500/20 pt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Page Title */}
                        <div className="text-center">
                            <h1 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
                                My Collection
                            </h1>
                            <p className="text-[#F8F7F3]/80 font-ui text-lg">
                                {artworks.length} saved artworks
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters & Controls (search, period, sort, view mode) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Search field */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
                            <input
                                type="text"
                                placeholder="Search by title or artist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-amber-500/30 rounded-lg text-[#F8F7F3] placeholder:text-[#F8F7F3]/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                            />
                        </div>

                        {/* Period filter dropdown */}
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-4 py-3 bg-black/50 border border-amber-500/30 rounded-lg text-[#F8F7F3] focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all capitalize"
                        >
                            {periods.map(period => (
                                <option key={period} value={period}>
                                    {period === 'all' ? 'All Periods' : period}
                                </option>
                            ))}
                        </select>

                        {/* Sort dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-black/50 border border-amber-500/30 rounded-lg text-[#F8F7F3] focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all"
                        >
                            <option value="recent">Recently Added</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="artist">Artist (A-Z)</option>
                        </select>

                        {/* View mode toggle (grid vs list) */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-lg border transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-amber-400 border-amber-400 text-black'
                                        : 'bg-black/50 border-amber-500/30 text-amber-400 hover:border-amber-400'
                                }`}
                            >
                                <Grid3x3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-lg border transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-amber-400 border-amber-400 text-black'
                                        : 'bg-black/50 border-amber-500/30 text-amber-400 hover:border-amber-400'
                                }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Artworks Grid/List or empty/loading states */}
                    {loading ? (
                        // Loading spinner while fetching collection
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredArtworks.length === 0 ? (
                        // Empty state: no artworks or no match for filters
                        <div className="text-center py-20">
                            <Palette className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
                            <p className="text-[#F8F7F3]/50 font-ui text-lg mb-6">
                                {searchQuery || selectedPeriod !== 'all'
                                    ? 'No artworks match your filters'
                                    : 'Your collection is empty'}
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                            >
                                Explore Timeline
                            </Link>
                        </div>
                    ) : (
                        // Grid or list layout for artworks
                        <div className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                : 'space-y-4'
                        }>
                            {filteredArtworks.map((artwork) => (
                                <motion.div
                                    key={artwork.artwork_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={
                                        viewMode === 'grid'
                                            ? 'group relative bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-lg overflow-hidden hover:border-amber-400/50 transition-all cursor-pointer'
                                            : 'flex gap-4 bg-gradient-to-r from-amber-950/20 to-black border border-amber-500/20 rounded-lg p-4 hover:border-amber-400/50 transition-all'
                                    }
                                    onClick={() => setSelectedArtwork(artwork)}
                                >
                                    {/* Artwork thumbnail */}
                                    <img
                                        src={String(artwork.image_url || '').replace(/[`]/g, '').trim()}
                                        alt={artwork.title}
                                        className={
                                            viewMode === 'grid'
                                                ? 'w-full h-64 object-cover'
                                                : 'w-32 h-32 object-cover rounded-lg'
                                        }
                                    />

                                    {/* Basic metadata (title, artist, period/year if list view) */}
                                    <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                                        <h3 className="text-amber-400 font-ui font-semibold line-clamp-1">
                                            {artwork.title}
                                        </h3>
                                        <p className="text-[#F8F7F3]/60 text-sm font-ui line-clamp-1">
                                            {artwork.artist}
                                        </p>
                                        {viewMode === 'list' && (
                                            <p className="text-[#F8F7F3]/40 text-xs font-ui mt-1 capitalize">
                                                {artwork.period} • {artwork.year}
                                            </p>
                                        )}
                                    </div>

                                    {/* Remove button (does not trigger modal open) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(artwork.artwork_id);
                                        }}
                                        className={
                                            viewMode === 'grid'
                                                ? 'absolute top-2 right-2 p-2 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500'
                                                : 'p-2 hover:bg-red-500/20 rounded-lg transition-colors'
                                        }
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Artwork Detail Modal (with overlay and animation) */}
                <AnimatePresence>
                    {selectedArtwork && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedArtwork(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-gradient-to-br from-amber-950/40 to-black border border-amber-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal image header with close button */}
                                <div className="relative">
                                    <img
                                        src={String(selectedArtwork.image_url || '').replace(/[`]/g, '').trim()}
                                        alt={selectedArtwork.title}
                                        className="w-full h-96 object-contain bg-black"
                                    />
                                    <button
                                        onClick={() => setSelectedArtwork(null)}
                                        className="absolute top-4 right-4 p-2 bg-black/80 rounded-lg hover:bg-black transition-colors"
                                    >
                                        <X className="w-6 h-6 text-amber-400" />
                                    </button>
                                </div>

                                {/* Modal body content: metadata + notes */}
                                <div className="p-8">
                                    {/* Title and artist */}
                                    <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                                        {selectedArtwork.title}
                                    </h2>
                                    <p className="text-[#F8F7F3]/80 font-ui text-lg mb-4">
                                        {selectedArtwork.artist}
                                    </p>

                                    {/* Period and year */}
                                    <div className="flex gap-4 text-sm text-[#F8F7F3]/60 font-ui mb-6">
                                        <span className="capitalize">{selectedArtwork.period}</span>
                                        <span>•</span>
                                        <span>{selectedArtwork.year}</span>
                                    </div>

                                    {/* Optional description text */}
                                    {selectedArtwork.description && (
                                        <p className="text-[#F8F7F3]/70 font-ui mb-6">
                                            {selectedArtwork.description}
                                        </p>
                                    )}

                                    {/* Notes Section */}
                                    <div className="border-t border-amber-500/20 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-amber-400 font-ui font-semibold">
                                                Your Notes
                                            </h3>
                                            {/* Edit button only when not already editing */}
                                            {!editingNote && (
                                                <button
                                                    onClick={() => {
                                                        setEditingNote(selectedArtwork.artwork_id);
                                                        setNoteText(selectedArtwork.notes || '');
                                                    }}
                                                    className="flex items-center gap-2 text-sm text-amber-400 hover:text-orange-400"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                            )}
                                        </div>

                                        {/* Notes editor vs display mode */}
                                        {editingNote === selectedArtwork.artwork_id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={noteText}
                                                    onChange={(e) => setNoteText(e.target.value)}
                                                    placeholder="Add your thoughts about this artwork..."
                                                    className="w-full px-4 py-3 bg-black/50 border border-amber-500/30 rounded-lg text-[#F8F7F3] placeholder:text-[#F8F7F3]/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all resize-none"
                                                    rows="4"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveNote(selectedArtwork.artwork_id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingNote(null);
                                                            setNoteText('');
                                                        }}
                                                        className="px-4 py-2 bg-black/50 border border-amber-500/30 text-[#F8F7F3] rounded-lg hover:border-amber-400 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[#F8F7F3]/60 font-ui italic">
                                                {selectedArtwork.notes || 'No notes yet. Click Edit to add your thoughts.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

// Attach layout wrapper for this page (Inertia pattern)
Collection.layout = page => <AppLayout children={page} />;
