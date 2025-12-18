// resources/js/lib/metMuseum.js

const MET_API_BASE = '/api/met';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ✅ Deterministic shuffle - same results for the same day
 * This ensures cached artworks are reused on repeated visits
 */
function deterministicShuffle(array, seed) {
  const arr = [...array];
  let currentSeed = seed;
  
  for (let i = arr.length - 1; i > 0; i--) {
    // Seeded random number generator
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

/**
 * Get today's seed (changes daily at midnight)
 */
function getTodaySeed() {
  const today = new Date().toISOString().split('T')[0]; // "2025-12-17"
  return today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
}

export async function searchArtworks(query, options = {}) {
  try {
    const params = new URLSearchParams({
      q: query,
      hasImages: options.hasImages !== false ? 'true' : 'false',
    });
    
    const response = await fetch(`${MET_API_BASE}/search?${params}`);
    
    if (!response.ok) {
      console.error(`Search failed for "${query}":`, response.status);
      return [];
    }
    
    const data = await response.json();
    return data.objectIDs || [];
  } catch (error) {
    console.error('Error searching artworks:', error);
    return [];
  }
}

export async function getArtworkById(objectId) {
  try {
    const response = await fetch(`${MET_API_BASE}/object/${objectId}`);
    
    // ✅ Silently handle 404s - don't show in console
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.primaryImage && !data.primaryImageSmall) {
      return null;
    }
    
    return {
      id: data.objectID,
      title: data.title || 'Untitled',
      artist: data.artistDisplayName || 'Unknown Artist',
      artistBio: data.artistDisplayBio || '',
      year: data.objectDate || 'Date Unknown',
      objectBeginDate: data.objectBeginDate,
      objectEndDate: data.objectEndDate,
      culture: data.culture || '',
      period: data.period || '',
      location: data.country || data.city || '',
      medium: data.medium || 'Medium Unknown',
      dimensions: data.dimensions || '',
      department: data.department || '',
      classification: data.classification || '',
      description: data.creditLine || '',
      image: data.primaryImage || data.primaryImageSmall || null,
      additionalImages: data.additionalImages || [],
      objectURL: data.objectURL || '',
      isPublicDomain: data.isPublicDomain || false,
      metadataDate: data.metadataDate,
      repository: data.repository || ''
    };
  } catch (error) {
    // ✅ Silently fail - don't log errors
    return null;
  }
}

export async function getArtworksByIds(objectIds, limit = 4, startDate, endDate) {
  const artworks = [];
  const idsToTry = objectIds.slice(0, Math.min(objectIds.length, limit * 20));
  
  console.log(`⚡ Attempting to fetch ${limit} artworks from ${idsToTry.length} IDs (filtering ${startDate}-${endDate})...`);
  
  const BATCH_SIZE = 8;
  
  for (let i = 0; i < idsToTry.length && artworks.length < limit; i += BATCH_SIZE) {
    const batch = idsToTry.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(id => getArtworkById(id));
    const results = await Promise.all(promises);
    
    for (const artwork of results) {
      if (artworks.length >= limit) break;
      
      if (artwork && artwork.image) {
        const begin = artwork.objectBeginDate;
        const end = artwork.objectEndDate;

        if (begin <= endDate && end >= startDate) {
          artworks.push(artwork);
          console.log(
            `✅ Loaded artwork ${artworks.length}/${limit}: ${artwork.title} (${begin} to ${end})`
          );
        }
      }
    }
    
    if (artworks.length < limit && i + BATCH_SIZE < idsToTry.length) {
      await delay(50);
    }
  }
  
  console.log(`✅ Successfully loaded ${artworks.length} artworks with images`);
  return artworks;
}

export const TIMELINE_QUERIES = {
  ancient: {
    title: 'Ancient World',
    period: '3000 BCE — 500 CE',
    startDate: -3000,
    endDate: 500,
    queries: ['Egyptian', 'Greek', 'Ancient']
  },

  medieval: {
    title: 'Medieval Period',
    period: '500 — 1400',
    startDate: 500,
    endDate: 1400,
    queries: ['Medieval', 'Byzantine', 'illuminated']
  },

  renaissance: {
    title: 'Renaissance',
    period: '1400 — 1600',
    startDate: 1400,
    endDate: 1600,
    queries: ['Renaissance', 'Italian', '15th century']
  },

  baroque: {
    title: 'Baroque & Enlightenment',
    period: '1600 — 1800',
    startDate: 1600,
    endDate: 1800,
    queries: ['Baroque', '17th century', '18th century']
  },

  modern: {
    title: 'Modern & Contemporary',
    period: '1800 — Present',
    startDate: 1800,
    endDate: new Date().getFullYear(),
    queries: ['Impressionism', '19th century', 'Modern']
  }
};

export async function getCuratedTimeline(timelineKey, limit = 4) {
  const timeline = TIMELINE_QUERIES[timelineKey];
  if (!timeline) return [];
  
  try {
    console.log(`🎨 Fetching ${limit} artworks for ${timelineKey} (${timeline.startDate}-${timeline.endDate})...`);
    
    const allObjectIds = new Set();
    
    const searchPromises = timeline.queries.map(query => 
      searchArtworks(query, { hasImages: true })
        .then(ids => {
          console.log(`  Found ${ids.length} IDs for "${query}"`);
          return ids;
        })
        .catch(() => [])
    );
    
    const results = await Promise.all(searchPromises);
    
    results.forEach(ids => {
      ids.slice(0, 50).forEach(id => allObjectIds.add(id));
    });
    
    const uniqueIds = Array.from(allObjectIds);
    
    // ✅ Use deterministic shuffle instead of Math.random()
    const seed = getTodaySeed();
    const shuffled = deterministicShuffle(uniqueIds, seed);
    
    console.log(`📊 Total unique IDs: ${shuffled.length} for ${timelineKey}`);
    
    if (shuffled.length === 0) {
      console.warn(`⚠️ No artworks found for ${timelineKey}`);
      return [];
    }
    
    const artworks = await getArtworksByIds(shuffled, limit, timeline.startDate, timeline.endDate);
    
    console.log(`✅ Completed ${timelineKey}: ${artworks.length} artworks\n`);
    return artworks;
  } catch (error) {
    console.error(`Error fetching curated timeline for ${timelineKey}:`, error);
    return [];
  }
}
