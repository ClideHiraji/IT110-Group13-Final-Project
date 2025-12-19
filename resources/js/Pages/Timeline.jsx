import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import ImmersiveScrollStory from '@/Components/Timeline/ImmersiveScrollStory';
import ArtworkModal from '@/Components/Timeline/ArtworkModal';
import { getCuratedTimeline } from '@/lib/metMuseum';

/**
 * Static configuration for the major timeline periods shown in the experience.
 *
 * Each period includes:
 * - id: internal identifier used to fetch curated artworks.
 * - title: heading displayed in the UI.
 * - period: human‑readable date range label.
 * - storyTitle / narrative: contextual story copy for the scroll experience.
 * - description: shorter summary of the period's characteristics.
 * - color / bgColor / accentColor: theming tokens used by ImmersiveScrollStory.
 */
const timelinePeriods = [
  {
    id: 'ancient',
    title: 'Ancient World',
    period: '3000 BCE – 500 CE',
    storyTitle: 'Origins of Meaning',
    narrative:
      'In the earliest civilizations, art was inseparable from life itself. Images were created to honor gods, commemorate rulers, and impose order on the universe. Form followed function, symbolism outweighed realism, and art became a bridge between the human and the divine.',
    description: 'Sacred symbols, idealized figures, and art as ritual, power, and belief',
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
    description: 'Religious symbolism, spiritual focus, and art as devotion',
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
    description: 'Humanism, realism, perspective, and classical revival',
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
    description: 'Drama, movement, contrast, and emotional intensity',
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
    description: 'Innovation, experimentation, and limitless forms of expression',
    color: '#10b981',
    bgColor: 'from-emerald-950/50 via-green-950/30 to-black',
    accentColor: 'from-emerald-400 to-green-500',
  },
];

/**
 * Timeline page
 *
 * Immersive scroll-driven art history experience that:
 * - Fetches curated artworks per period (Ancient → Modern) using getCuratedTimeline.
 * - Renders an ImmersiveScrollStory with scroll sections for each period.
 * - Allows opening an ArtworkModal to inspect an artwork in detail.
 * - Lets authenticated users save/remove artworks from their personal collection.
 * - Handles “pending save” when an unauthenticated user tries to save an artwork:
 *   stores the artwork in localStorage, redirects to login via Inertia router,
 *   and processes the pending save when the user returns logged in.
 *
 * Data sources:
 * - getCuratedTimeline(periodId, limit): returns an array of curated artworks per period.
 * - /api/collection (GET): list of artworks in the user’s collection.
 * - /api/collection (POST): save an artwork to the collection.
 * - /api/collection/{id} (DELETE): remove an artwork from the collection.
 */
export default function Timeline() {
  // Authenticated user (if any) from Inertia page props
  const { auth } = usePage().props;

  // Map of periodId -> array of artworks for that period
  const [timelineData, setTimelineData] = useState({});
  // Artwork currently open in the modal (or null when closed)
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  // Current period’s artwork list used inside the modal navigation
  const [currentArtworks, setCurrentArtworks] = useState([]);
  // Index of selectedArtwork within currentArtworks
  const [currentIndex, setCurrentIndex] = useState(0);
  // List of artwork IDs that are saved in the user's collection
  const [savedArtworks, setSavedArtworks] = useState([]);
  // Loading flag for the initial timeline fetch
  const [isLoading, setIsLoading] = useState(true);

  // On mount:
  // - Load timeline data for all periods.
  // - If user is authenticated, load saved artworks and process any pending save.
  useEffect(() => {
    loadTimelineData();
    if (auth?.user) {
      loadSavedArtworks();
      checkPendingSave();
    }
  }, []);

  /**
   * Check for a pending artwork save in localStorage.
   * Used when an unauthenticated user tried to save an artwork; the artwork
   * was stored and the user was redirected to login. After returning logged in,
   * this function:
   * - Reads the pending artwork.
   * - Calls handleSaveToCollection to persist it.
   * - Reopens the modal for visibility.
   * - Cleans up localStorage.
   */
  const checkPendingSave = async () => {
    const pending = localStorage.getItem('pending_artwork_save');
    if (pending) {
      try {
        const artwork = JSON.parse(pending);
        // Deduplication is typically handled server-side; still safe to call
        await handleSaveToCollection(artwork);
        setSelectedArtwork(artwork);
        localStorage.removeItem('pending_artwork_save');
      } catch (e) {
        console.error('Error processing pending save', e);
        localStorage.removeItem('pending_artwork_save');
      }
    }
  };

  /**
   * Load curated timeline data for all defined periods.
   * - Uses getCuratedTimeline(period.id, 4) for each timelinePeriods entry.
   * - Collects results into an object keyed by periodId.
   * - Tracks and logs elapsed load time for debugging.
   */
  const loadTimelineData = async () => {
    const data = {};
    setIsLoading(true);
    try {
      console.log('🚀 Loading timeline data...');
      const startTime = Date.now();

      // Fetch curated artworks for each period in parallel
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
      setIsLoading(false);
    }
  };

  /**
   * Load the IDs of artworks already saved in the user's collection.
   * - GET /api/collection.
   * - Stores only artwork_id values in savedArtworks state.
   */
  const loadSavedArtworks = async () => {
    try {
      const response = await fetch('/api/collection', {
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
      });

      if (response.ok) {
        const ct = response.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await response.json() : [];
        setSavedArtworks(data.map((item) => item.artwork_id));
      }
    } catch (error) {
      console.error('Error loading saved artworks:', error);
    }
  };

  /**
   * When an artwork card is clicked in the scroll story:
   * - Determine its index within the period’s artwork array.
   * - Set selectedArtwork for the modal.
   * - Set currentArtworks and currentIndex to enable prev/next navigation.
   */
  const handleArtworkClick = (artwork, periodId) => {
    const artworks = timelineData[periodId] || [];
    const index = artworks.findIndex((a) => a.id === artwork.id);

    setSelectedArtwork(artwork);
    setCurrentArtworks(artworks);
    setCurrentIndex(index);
  };

  /** Close the artwork modal. */
  const handleClose = () => {
    setSelectedArtwork(null);
  };

  /** Navigate to previous artwork in the currentArtworks list, if any. */
  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedArtwork(currentArtworks[newIndex]);
    }
  };

  /** Navigate to next artwork in the currentArtworks list, if any. */
  const handleNext = () => {
    if (currentIndex < currentArtworks.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedArtwork(currentArtworks[newIndex]);
    }
  };

  /**
   * Save an artwork to the user's collection.
   *
   * Behavior:
   * - If not authenticated:
   *   - Store the artwork in localStorage as 'pending_artwork_save'.
   *   - Redirect to /login using Inertia router with a return_url.
   * - If authenticated:
   *   - POST /api/collection with artwork details.
   *   - On success: append id to savedArtworks.
   *   - Handle special HTTP statuses:
   *     - 409: already saved (log warning).
   *     - 403: user must verify account.
   *     - 401: redirect to login with return_url.
   */
  const handleSaveToCollection = async (artwork) => {
    if (!auth?.user) {
      localStorage.setItem('pending_artwork_save', JSON.stringify(artwork));
      router.visit('/login?return_url=' + encodeURIComponent(window.location.href));
      return;
    }

    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          artwork_id: artwork.id.toString(),
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          image_url: artwork.image,
          period: artwork.period,
          description: artwork.medium || artwork.description,
        }),
      });

      if (response.ok) {
        setSavedArtworks([...savedArtworks, artwork.id.toString()]);
        console.log('Artwork saved successfully!');
      } else if (response.status === 409) {
        console.log('Already saved');
      } else if (response.status === 403) {
        alert('Please verify your account first');
      } else if (response.status === 401) {
        router.visit('/login?return_url=' + encodeURIComponent(window.location.href));
      } else {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const error = await response.json();
          console.error('Save error:', error);
        } else {
          const text = await response.text();
          console.error('Save error (non-JSON):', text);
        }
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
    }
  };

  /**
   * Remove an artwork from the user's collection.
   * - No-op if user is not authenticated.
   * - DELETE /api/collection/{artworkId}.
   * - On success: remove id from savedArtworks state.
   */
  const handleRemoveFromCollection = async (artworkId) => {
    if (!auth?.user) {
      return;
    }

    try {
      const response = await fetch(`/api/collection/${artworkId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
      });

      if (response.ok) {
        setSavedArtworks(savedArtworks.filter((id) => id !== artworkId.toString()));
        console.log('Artwork removed successfully!');
      }
    } catch (error) {
      console.error('Error removing artwork:', error);
    }
  };

  return (
    <>
      {/* Show global header only when a user is authenticated */}
      {auth?.user && <Header auth={auth} />}

      {/* Set page title */}
      <Head title="Timeline" />

      {/* Main immersive scroll story component */}
      <ImmersiveScrollStory
        periods={timelinePeriods}
        timelineData={timelineData}
        onArtworkClick={handleArtworkClick}
        isLoading={isLoading}
        savedArtworks={savedArtworks}
        onSaveArtwork={handleSaveToCollection}
        onRemoveArtwork={handleRemoveFromCollection}
      />

      {/* Artwork modal for detailed view, with save/remove and prev/next controls */}
      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={handleClose}
          periodColor={timelinePeriods.find((p) => p.id === selectedArtwork.period)?.color}
          isSaved={savedArtworks.includes(selectedArtwork.id?.toString())}
          onSave={handleSaveToCollection}
          onRemove={handleRemoveFromCollection}
          onPrev={currentIndex > 0 ? handlePrev : null}
          onNext={currentIndex < currentArtworks.length - 1 ? handleNext : null}
        />
      )}
    </>
  );
}
