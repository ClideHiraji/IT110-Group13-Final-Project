// resources/js/Pages/Timeline.jsx

import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import ImmersiveScrollStory from '@/Components/Timeline/ImmersiveScrollStory';
import ArtworkModal from '@/Components/Timeline/ArtworkModal';
import { getCuratedTimeline } from '@/lib/metMuseum';

const timelinePeriods = [
  {
    id: 'ancient',
    title: 'Ancient World',
    period: '3000 BCE – 500 CE',
    storyTitle: 'Origins of Meaning',
    narrative:
      'In the earliest civilizations, art was inseparable from life itself. Images were created to honor gods, commemorate rulers, and impose order on the universe. Form followed function, symbolism outweighed realism, and art became a bridge between the human and the divine.',
    description:
      'Sacred symbols, idealized figures, and art as ritual, power, and belief',
    color: '#f59e0b',
    bgColor: 'from-amber-950/50 via-orange-950/30 to-black',
    accentColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 'medieval',
    title: 'Medieval Period',
    period: '500 – 1400',
    storyTitle: 'Faith Over Form',
    narrative:
      'As empires fell and faith rose, art turned inward and upward. Beauty was no longer measured by realism, but by devotion. Figures floated beyond time, gold illuminated the sacred, and images served as visual prayers for a world guided by spiritual truth.',
    description:
      'Religious symbolism, spiritual focus, and art as devotion',
    color: '#8b5cf6',
    bgColor: 'from-purple-950/50 via-indigo-950/30 to-black',
    accentColor: 'from-purple-400 to-indigo-500',
  },
  {
    id: 'renaissance',
    title: 'Renaissance',
    period: '1400 – 1600',
    storyTitle: 'The Rebirth of Humanity',
    narrative:
      'Humanity rediscovered itself. Artists studied nature, anatomy, and perspective, blending scientific observation with artistic mastery. Inspired by classical antiquity, art celebrated balance, proportion, and the beauty of the human form.',
    description:
      'Humanism, realism, perspective, and classical revival',
    color: '#06b6d4',
    bgColor: 'from-cyan-950/50 via-blue-950/30 to-black',
    accentColor: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'baroque',
    title: 'Baroque & Enlightenment',
    period: '1600 – 1800',
    storyTitle: 'Emotion and Power',
    narrative:
      'Art became theatrical and persuasive. Movement replaced stillness, light cut through darkness, and emotion demanded attention. Whether serving church, crown, or reason, artists sought to overwhelm the senses and engage the viewer directly.',
    description:
      'Drama, movement, contrast, and emotional intensity',
    color: '#ef4444',
    bgColor: 'from-red-950/50 via-pink-950/30 to-black',
    accentColor: 'from-red-400 to-pink-500',
  },
  {
    id: 'modern',
    title: 'Modern & Contemporary',
    period: '1800 – Present',
    storyTitle: 'Breaking the Frame',
    narrative:
      'Tradition fractured. Artists rejected rules, questioned reality, and redefined what art could be. From abstraction to digital media, art became personal, political, experimental, and global—reflecting a rapidly changing world.',
    description:
      'Innovation, experimentation, and limitless forms of expression',
    color: '#10b981',
    bgColor: 'from-emerald-950/50 via-green-950/30 to-black',
    accentColor: 'from-emerald-400 to-green-500',
  },
];

export default function Timeline({ auth }) {
  const [timelineData, setTimelineData] = useState({});
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [currentArtworks, setCurrentArtworks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedArtworks, setSavedArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    // ✅ Start loading immediately when component mounts
    loadTimelineData();
    if (auth?.user) {
      loadSavedArtworks();
    }
  }, []);

  const loadTimelineData = async () => {
    const data = {};
    setIsLoading(true);

    try {
      console.log('🚀 Loading timeline data...');
      const startTime = Date.now();

      // ✅ Load all periods in parallel
      const promises = timelinePeriods.map(async (period) => {
        const artworks = await getCuratedTimeline(period.id, 4);
        return { periodId: period.id, artworks };
      });

      const results = await Promise.all(promises);
      results.forEach(({ periodId, artworks }) => {
        data[periodId] = artworks;
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✨ Timeline loaded in ${elapsed}s`);

      setTimelineData(data);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setIsLoading(false); // ✅ Set loading to false when done
    }
  };

  const loadSavedArtworks = async () => {
    try {
      const response = await fetch('/api/collection');
      if (response.ok) {
        const data = await response.json();
        setSavedArtworks(data.map(item => item.artwork_id));
      }
    } catch (error) {
      console.error('Error loading saved artworks:', error);
    }
  };

  const handleArtworkClick = (artwork, periodId) => {
    const artworks = timelineData[periodId] || [];
    const index = artworks.findIndex(a => a.id === artwork.id);
    setSelectedArtwork(artwork);
    setCurrentArtworks(artworks);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setSelectedArtwork(null);
  };

  const handlePrev = () => {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedArtwork(currentArtworks[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedArtwork(currentArtworks[newIndex]);
  };

  const handleSaveToCollection = async (artwork) => {
    if (!auth?.user) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          artwork_id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          image: artwork.image,
          period: artwork.period,
        }),
      });

      if (response.ok) {
        setSavedArtworks([...savedArtworks, artwork.id]);
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
    }
  };

  const handleRemoveFromCollection = async (artworkId) => {
    try {
      const response = await fetch(`/api/collection/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
      });

      if (response.ok) {
        setSavedArtworks(savedArtworks.filter(id => id !== artworkId));
      }
    } catch (error) {
      console.error('Error removing artwork:', error);
    }
  };

  return (
    <>
      <Head title="Chronicles of Human Creativity" />
      
      <div id="timeline-start" className="relative">
        <ImmersiveScrollStory 
          periods={timelinePeriods}
          artworksData={timelineData}
          onArtworkClick={handleArtworkClick}
          isLoading={isLoading} // ✅ Pass loading state
        />
      </div>

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={currentIndex > 0}
          hasNext={currentIndex < currentArtworks.length - 1}
          isSaved={savedArtworks.includes(selectedArtwork.id)}
          onSave={() => handleSaveToCollection(selectedArtwork)}
          onRemove={() => handleRemoveFromCollection(selectedArtwork.id)}
          isAuthenticated={!!auth?.user}
        />
      )}
    </>
  );
}
