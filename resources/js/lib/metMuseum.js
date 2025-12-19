// Base URL for Met Museum API proxy
const MET_API_BASE = '/api/met';
// Prefix used for cache keys in localStorage
const CACHE_KEY_PREFIX = 'met_timeline_';
// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
// Hard-coded blacklist of problematic Met object IDs
const BLACKLISTED_IDS = new Set([662725, 634331, 811172]);
// Runtime blacklist for IDs that fail during current session
const runtimeBlacklist = new Set();


// Save data to localStorage cache under a namespaced key
function saveCacheToLocalStorage(key, data) {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save cache:', error);
  }
}


// Retrieve data from localStorage cache if it exists and is still valid
function getCacheFromLocalStorage(key) {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;
    
    // Check if cache entry is still within allowed duration
    if (age < CACHE_DURATION) {
      console.log(`Using cached data for ${key} (${Math.round(age/1000/60)}min old)`);
      return cacheData.data;
    } else {
      // Cache expired: remove the old entry
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}


// Deterministic shuffle implementation using a numeric seed
// This ensures the same input and seed produce the same order
function deterministicShuffle(array, seed) {
  const arr = [...array];
  let currentSeed = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    // Linear congruential generator for pseudo-random sequence
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


// Generate a seed based on today's date (YYYY-MM-DD)
// This causes the shuffle order to change each day but stay stable within the day
function getTodaySeed() {
  const today = new Date().toISOString().split('T')[0];
  return today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
}


// Search artworks via Met API proxy with optional image filter
export async function searchArtworks(query, options = {}) {
  try {
    const params = new URLSearchParams({
      q: query,
      hasImages: options.hasImages !== false ? 'true' : 'false',
    });
    const response = await fetch(`${MET_API_BASE}/search?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    // API returns an array of object IDs or null
    return data.objectIDs || [];
  } catch (error) {
    // On error, return empty array so callers can handle gracefully
    return [];
  }
}


// Fetch single artwork details by object ID, preferring small image for performance
export async function getArtworkById(objectId) {
  // Skip IDs that are known bad or have failed during this session
  if (BLACKLISTED_IDS.has(objectId) || runtimeBlacklist.has(objectId)) {
    return null;
  }

  try {
    const response = await fetch(`${MET_API_BASE}/object/${objectId}`);

    // Permanent not found: add to runtime blacklist
    if (response.status === 404) {
      runtimeBlacklist.add(objectId);
      return null;
    }

    // Server errors: also blacklist to avoid repeated failures
    if (response.status >= 500) {
      runtimeBlacklist.add(objectId);
      return null;
    }

    if (!response.ok) return null;

    const data = await response.json();

    // Prefer primaryImageSmall for faster loading, fall back to primaryImage
    const imageUrl = data.primaryImageSmall || data.primaryImage;
    
    // Reject objects with invalid or missing image URLs
    if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null' || !imageUrl.startsWith('http')) {
      return null;
    }

    // Reject objects with missing or blank titles
    if (!data.title || data.title.trim() === '') {
      return null;
    }

    // Map Met API response into a normalized artwork object
    return {
      id: data.objectID,
      title: data.title,
      artist: data.artistDisplayName || 'Unknown Artist',
      artistBio: data.artistDisplayBio || '',
      year: data.objectDate || 'Date Unknown',
      objectBeginDate: data.objectBeginDate || 0,
      objectEndDate: data.objectEndDate || 0,
      culture: data.culture || '',
      period: data.period || '',
      location: data.country || data.city || '',
      medium: data.medium || 'Medium Unknown',
      dimensions: data.dimensions || '',
      department: data.department || '',
      classification: data.classification || '',
      description: data.creditLine || '',
      image: imageUrl, // Small image used for better performance
      additionalImages: data.additionalImages || [],
      objectURL: data.objectURL || '',
      isPublicDomain: data.isPublicDomain || false,
      metadataDate: data.metadataDate,
      repository: data.repository || ''
    };
  } catch (error) {
    // In case of network or parsing errors, return null
    return null;
  }
}


// Fetch artworks progressively by IDs and immediately report each match via callback
// Applies date range filtering and stops once limit is reached
export async function getArtworksByIdsProgressive(objectIds, limit, startDate, endDate, onArtworkFound) {
  const artworks = [];
  
  // Filter out globally blacklisted and runtime-blacklisted IDs
  const validIds = objectIds.filter(id => 
    !BLACKLISTED_IDS.has(id) && !runtimeBlacklist.has(id)
  );
  
  // Limit the total IDs to try to a multiple of the requested limit
  const idsToTry = validIds.slice(0, Math.min(validIds.length, limit * 40));

  console.log(`Fetching ${limit} artworks from ${idsToTry.length} IDs...`);

  // Number of IDs to fetch in parallel per batch
  const BATCH_SIZE = 30;

  // Process IDs in batches until we either run out or reach the limit
  for (let i = 0; i < idsToTry.length && artworks.length < limit; i += BATCH_SIZE) {
    const batch = idsToTry.slice(i, i + BATCH_SIZE);
    
    // Fetch all batch IDs in parallel
    const promises = batch.map(id => getArtworkById(id));
    const results = await Promise.all(promises);

    // Process each fetched artwork
    for (const artwork of results) {
      if (artworks.length >= limit) break;

      // Basic image presence check before date filtering
      if (artwork && artwork.image && artwork.image !== 'undefined' && artwork.image !== 'null') {
        const begin = artwork.objectBeginDate || 0;
        const end = artwork.objectEndDate || 0;

        // Include only artworks that overlap the requested date range
        if (begin <= endDate && end >= startDate) {
          artworks.push(artwork);
          console.log(`Found ${artworks.length}/${limit}: ${artwork.title}`);
          
          // Immediately notify caller about each found artwork
          if (onArtworkFound) {
            onArtworkFound(artwork);
          }
        }
      }
    }

    // Small delay between batches to avoid overwhelming the API
    if (artworks.length < limit && i + BATCH_SIZE < idsToTry.length) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  return artworks;
}


// Static configuration for timeline periods and related search queries
export const TIMELINE_QUERIES = {
  ancient: {
    title: 'Ancient World',
    period: '3000 BCE — 500 CE',
    startDate: -3000,
    endDate: 500,
    queries: ['Egyptian sculpture', 'Greek pottery', 'Roman marble']
  },
  medieval: {
    title: 'Medieval Period',
    period: '500 — 1400',
    startDate: 500,
    endDate: 1400,
    queries: ['Medieval manuscript', 'Byzantine mosaic', 'Gothic sculpture']
  },
  renaissance: {
    title: 'Renaissance',
    period: '1400 — 1600',
    startDate: 1400,
    endDate: 1600,
    queries: ['Renaissance painting', 'Italian sculpture', 'Venetian art']
  },
  baroque: {
    title: 'Baroque & Enlightenment',
    period: '1600 — 1800',
    startDate: 1600,
    endDate: 1800,
    queries: ['Baroque painting', 'Rococo art', 'Dutch Golden Age']
  },
  modern: {
    title: 'Modern & Contemporary',
    period: '1800 — Present',
    startDate: 1800,
    endDate: new Date().getFullYear(),
    queries: ['Impressionist painting', 'Modern sculpture', 'American painting']
  }
};


// Load curated timeline for a given key using cache and progressive loading
export async function getCuratedTimeline(timelineKey, limit = 4, onArtworkFound = null) {
  const timeline = TIMELINE_QUERIES[timelineKey];
  if (!timeline) return [];

  // Check local cache first to avoid unnecessary API calls
  const cached = getCacheFromLocalStorage(timelineKey);
  if (cached && cached.length >= limit) {
    console.log(`Loaded ${timelineKey} from cache instantly!`);
    // If a callback is provided, replay cached artworks as if they were streamed
    if (onArtworkFound) {
      cached.forEach(artwork => onArtworkFound(artwork));
    }
    return cached;
  }

  // No valid cache, proceed to fetch fresh data
  console.log(`Fetching ${limit} artworks for ${timelineKey}...`);

  try {
    // For each configured query, search artworks and collect IDs
    const searchPromises = timeline.queries.map(query =>
      searchArtworks(query, { hasImages: true })
        .then(ids => {
          console.log(`Found ${ids.length} IDs for "${query}"`);
          return ids;
        })
        .catch(() => [])
    );

    // Wait for all search queries to complete
    const results = await Promise.all(searchPromises);

    // Aggregate and deduplicate object IDs across all queries
    const allObjectIds = new Set();
    results.forEach(ids => {
      // Limit per-query IDs to avoid huge sets
      ids.slice(0, 50).forEach(id => allObjectIds.add(id));
    });

    const uniqueIds = Array.from(allObjectIds);
    const seed = getTodaySeed();
    // Shuffle IDs deterministically based on today's seed
    const shuffled = deterministicShuffle(uniqueIds, seed);

    console.log(`Total unique IDs: ${shuffled.length} for ${timelineKey}`);

    if (shuffled.length === 0) {
      console.warn(`No artworks found for ${timelineKey}`);
      return [];
    }

    // Fetch artwork details progressively from the shuffled ID list
    const artworks = await getArtworksByIdsProgressive(
      shuffled,
      limit,
      timeline.startDate,
      timeline.endDate,
      onArtworkFound // Callback to stream artworks as they are found
    );

    // Save successful results to cache for future requests
    if (artworks.length > 0) {
      saveCacheToLocalStorage(timelineKey, artworks);
      console.log(`Cached ${artworks.length} artworks for ${timelineKey}`);
    }

    console.log(`Completed ${timelineKey}: ${artworks.length} artworks`);
    return artworks;
  } catch (error) {
    console.error(`Error fetching curated timeline for ${timelineKey}:`, error);
    return [];
  }
}


// Legacy exports for compatibility
// Thin wrapper that reuses progressive loader without callback
export async function getArtworksByIds(objectIds, limit = 4, startDate, endDate) {
  return getArtworksByIdsProgressive(objectIds, limit, startDate, endDate, null);
}