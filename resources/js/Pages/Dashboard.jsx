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
  BookOpen
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ auth }) {
  const [stats, setStats] = useState({
    totalArtworks: 0,
    recentlyAdded: 0,
    favoritesPeriod: 'Loading...',
    lastVisit: null
  });
  
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/collection');
      if (response.ok) {
        const artworks = await response.json();
        
        // Calculate stats
        const last7Days = artworks.filter(a => {
          const addedDate = new Date(a.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return addedDate >= weekAgo;
        });

        // Find favorite period
        const periodCounts = {};
        artworks.forEach(a => {
          const period = a.period || 'Unknown';
          periodCounts[period] = (periodCounts[period] || 0) + 1;
        });
        const favoritePeriod = Object.keys(periodCounts).reduce((a, b) => 
          periodCounts[a] > periodCounts[b] ? a : b, 'None'
        );

        setStats({
          totalArtworks: artworks.length,
          recentlyAdded: last7Days.length,
          favoritesPeriod: favoritePeriod,
          lastVisit: new Date().toLocaleDateString()
        });

        setRecentArtworks(artworks.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Welcome back, {auth.user.name}
                </h1>
                <p className="text-gray-400 mt-2 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="text-amber-400" size={48} />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={24} className="text-amber-400" />
                  Your Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-white/10 overflow-hidden group"
                    >
                      {/* Background Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      {/* Icon */}
                      <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                        <stat.icon className={stat.iconColor} size={24} />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-white text-2xl font-bold">
                          {typeof stat.value === 'number' ? stat.value : stat.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={24} className="text-amber-400" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Link
                        href={action.href}
                        className="block bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-all group"
                      >
                        <div className={`bg-gradient-to-r ${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <action.icon className="text-white" size={24} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">
                          {action.label}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {action.description}
                        </p>
                        <div className="flex items-center text-amber-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                          Get started
                          <ArrowRight size={16} className="ml-2" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Artworks */}
              {recentArtworks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Clock size={24} className="text-amber-400" />
                      Recently Added
                    </h2>
                    <Link
                      href="/collection"
                      className="text-amber-400 hover:text-orange-400 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      View all
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentArtworks.map((artwork, index) => (
                      <motion.div
                        key={artwork.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="group"
                      >
                        <Link href="/collection" className="block">
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all">
                            <div className="aspect-[3/4] overflow-hidden bg-black">
                              {artwork.image ? (
                                <img
                                  src={artwork.image}
                                  alt={artwork.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Palette className="text-gray-700" size={48} />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                                {artwork.title}
                              </h3>
                              <p className="text-amber-400 text-xs">{artwork.artist}</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && recentArtworks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-12 border border-white/10 text-center"
                >
                  <Palette className="text-gray-700 mx-auto mb-4" size={64} />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Start Your Collection
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Explore the timeline and save artworks that inspire you
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    Explore Timeline
                    <ArrowRight size={20} />
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}