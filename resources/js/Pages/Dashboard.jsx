import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Heart,
    Clock,
    TrendingUp,
    Eye,
    Calendar,
    Sparkles,
    ArrowRight,
    Palette,
    BookOpen,
    User
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import Header from '@/Components/Header';

/**
 * Dashboard page
 *
 * Overview screen for the authenticated user showing:
 * - Key statistics derived from the user's saved artworks.
 * - Quick actions to navigate to main areas (timeline, collection, resources).
 * - A "Recently Added" section for the latest saved artworks.
 *
 * Data source:
 * - Fetches the user's collection from /api/collection.
 *
 * Props:
 * - auth {object}: Auth data (auth.user used for greeting).
 *
 * State:
 * - stats {{
 *     totalArtworks: number,
 *     recentlyAdded: number,
 *     favoritesPeriod: string,
 *     lastVisit: string|null
 *   }}: Aggregated statistics.
 * - recentArtworks {Array}: Subset (first 4) of artworks for the "Recently Added" section.
 * - loading {boolean}: Indicates whether dashboard data is being loaded.
 */
export default function Dashboard({ auth }) {
    // Aggregated statistics about the user's collection
    const [stats, setStats] = useState({
        totalArtworks: 0,
        recentlyAdded: 0,
        favoritesPeriod: 'Loading...',
        lastVisit: null
    });
    // Recently added artworks (subset of the collection)
    const [recentArtworks, setRecentArtworks] = useState([]);
    // Loading flag while data is fetched from the API
    const [loading, setLoading] = useState(true);

    // On mount: load dashboard data once
    useEffect(() => {
        loadDashboardData();
    }, []);

    /**
     * Fetch the user's collection and compute dashboard statistics.
     * - GET /api/collection.
     * - Calculates:
     *   - Total artworks.
     *   - Artworks added in the last 7 days.
     *   - Favorite period (most frequent period value).
     *   - Last visit as a formatted date (today).
     * - Also populates recentArtworks with the first 4 items.
     */
    const loadDashboardData = async () => {
        try {
            const response = await fetch('/api/collection');
            if (response.ok) {
                const artworks = await response.json();

                // Determine which artworks were added in the last 7 days
                const last7Days = artworks.filter(a => {
                    const addedDate = new Date(a.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return addedDate >= weekAgo;
                });

                // Count occurrences of each period to find the favorite one
                const periodCounts = {};
                artworks.forEach(a => {
                    const period = a.period || 'Unknown';
                    periodCounts[period] = (periodCounts[period] || 0) + 1;
                });

                // Determine the period with the highest count
                const favoritePeriod = Object.keys(periodCounts).reduce((a, b) =>
                    periodCounts[a] > periodCounts[b] ? a : b, 'None'
                );

                // Update summary stats
                setStats({
                    totalArtworks: artworks.length,
                    recentlyAdded: last7Days.length,
                    favoritesPeriod: favoritePeriod,
                    lastVisit: new Date().toLocaleDateString()
                });

                // Take the first four artworks as "recently added"
                setRecentArtworks(artworks.slice(0, 4));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Configuration for the four stat cards displayed at the top
    const statCards = [
        {
            icon: Heart,
            label: 'Saved Artworks',
            value: stats.totalArtworks,
            color: 'from-pink-500 to-rose-500',
            bgColor: 'bg-pink-500/10',
            iconColor: 'text-pink-400'
        },
        {
            icon: Clock,
            label: 'Added This Week',
            value: stats.recentlyAdded,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-400'
        },
        {
            icon: TrendingUp,
            label: 'Favorite Period',
            value: stats.favoritesPeriod,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            iconColor: 'text-amber-400'
        },
        {
            icon: Eye,
            label: 'Last Visit',
            value: stats.lastVisit || 'Today',
            color: 'from-purple-500 to-indigo-500',
            bgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-400'
        }
    ];

    // Configuration for the "Quick Actions" cards
    const quickActions = [
        {
            icon: Palette,
            label: 'Explore Timeline',
            description: 'Continue your journey through art history',
            href: '/',
            color: 'from-amber-500 to-orange-500'
        },
        {
            icon: Heart,
            label: 'View Collection',
            description: 'Browse your saved artworks',
            href: '/collection',
            color: 'from-pink-500 to-rose-500'
        },
        {
            icon: BookOpen,
            label: 'Learning Resources',
            description: 'Discover art movements and styles',
            href: '#',
            color: 'from-blue-500 to-cyan-500'
        }
    ];

    return (
        <>
            {/* Set the HTML document title */}
            <Head title="Dashboard" />

            <div className="min-h-screen bg-black">
                {/* Global header (navigation, auth) */}
                <Header auth={auth} />

                {/* Hero / welcome section with gradient background */}
                <div className="relative bg-gradient-to-br from-amber-950/50 via-orange-950/30 to-black border-b border-amber-500/20 pt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Welcome Section */}
                        <div className="text-center">
                            <h1 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
                                Welcome back, {auth.user?.name}
                            </h1>
                            <p className="text-[#F8F7F3]/80 font-ui text-lg">
                                Your artistic journey continues
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Stats Grid (summary cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${stat.bgColor} border border-amber-500/20 rounded-xl p-6 hover:border-amber-400/50 transition-all`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    {/* Stat icon */}
                                    <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                                    {/* Decorative gradient bar */}
                                    <div className={`h-2 w-20 bg-gradient-to-r ${stat.color} rounded-full`}></div>
                                </div>
                                <p className="text-[#F8F7F3]/60 text-sm font-ui mb-1">{stat.label}</p>
                                <p className={`text-3xl font-display bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {typeof stat.value === 'number' ? stat.value : stat.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions section */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-6">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {quickActions.map((action, index) => (
                                <motion.div
                                    key={action.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                    <Link
                                        href={action.href}
                                        className="block bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl p-6 hover:border-amber-400/50 transition-all group"
                                    >
                                        {/* Action icon with gradient text */}
                                        <action.icon className={`w-10 h-10 bg-gradient-to-r ${action.color} bg-clip-text text-transparent mb-4`} />
                                        <h3 className="text-xl font-display text-[#F8F7F3] mb-2 group-hover:text-amber-400 transition-colors">
                                            {action.label}
                                        </h3>
                                        <p className="text-[#F8F7F3]/60 font-ui text-sm mb-4">
                                            {action.description}
                                        </p>
                                        <div className="flex items-center text-amber-400 text-sm font-ui group-hover:text-orange-400">
                                            Get Started
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Recently Added section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                Recently Added
                            </h2>
                            <Link
                                href="/collection"
                                className="text-amber-400 hover:text-orange-400 font-ui text-sm flex items-center gap-2"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            // Loading spinner while dashboard data is fetched
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
                            </div>
                        ) : recentArtworks.length === 0 ? (
                            // Empty state when no recent artworks exist
                            <div className="text-center py-20 bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl">
                                <Sparkles className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
                                <p className="text-[#F8F7F3]/60 font-ui mb-6">
                                    Explore the timeline and save artworks you love
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                                >
                                    Explore Timeline
                                </Link>
                            </div>
                        ) : (
                            // Grid of recently added artworks
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {recentArtworks.map((artwork, index) => (
                                    <motion.div
                                        key={artwork.artwork_id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                    >
                                        <Link
                                            href="/collection"
                                            className="block group"
                                        >
                                            <div className="bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl overflow-hidden hover:border-amber-400/50 transition-all">
                                                <img
                                                    src={artwork.image_url}
                                                    alt={artwork.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="p-4">
                                                    <h3 className="text-amber-400 font-ui font-semibold line-clamp-1 mb-1 group-hover:text-orange-400 transition-colors">
                                                        {artwork.title}
                                                    </h3>
                                                    <p className="text-[#F8F7F3]/60 text-sm font-ui line-clamp-1">
                                                        {artwork.artist}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Attach the AppLayout wrapper for this page (Inertia page layout pattern)
Dashboard.layout = page => <AppLayout children={page} />;
