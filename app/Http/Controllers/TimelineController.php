<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * TimelineController
 * 
 * Manages the art history timeline feature, providing curated artworks organized
 * by historical periods. Fetches data from Met Museum API and formats it for
 * timeline visualization and educational purposes.
 * 
 * Features:
 * - Get artworks by historical period (Renaissance, Baroque, etc.)
 * - Fetch individual artwork details
 * - Curated search queries per period
 * - Standardized artwork data formatting
 * - Comprehensive caching (1-7 days)
 * 
 * Historical Periods:
 * - Renaissance (1400-1600)
 * - Baroque (1600-1750)
 * - Romanticism/Impressionism (1800-1900)
 * - Modern Art (1900-1970)
 * - Contemporary Art (1970-present)
 * 
 * Caching Strategy:
 * - Period artworks: 24 hours (1 day)
 * - Individual artworks: 7 days (rarely change)
 * 
 * Data Source:
 * - Met Museum Collection API
 * - Curated search queries for quality results
 * 
 * @package App\Http\Controllers
 * 
 * @see https://metmuseum.github.io/
 * @see \App\Http\Controllers\MetMuseumController
 */
class TimelineController extends Controller
{
    /**
     * Met Museum API base URL.
     * 
     * @var string
     */
    private $metApiBase = 'https://collectionapi.metmuseum.org/public/collection/v1';

    /**
     * Get artworks for a specific historical period.
     * 
     * Retrieves a curated collection of artworks representing a specific art
     * historical period. Uses multiple targeted search queries to ensure
     * high-quality, representative results.
     * 
     * Supported Periods:
     * - renaissance: Renaissance art and masters
     * - baroque: Baroque period artworks
     * - romanticism: Romantic and Impressionist works
     * - modern: Modern art movements
     * - contemporary: Contemporary and digital art
     * 
     * Cache Key Format:
     * - "timeline_{period}"
     * 
     * Result Limits:
     * - Maximum 5 artworks per period
     * - Only includes objects with primary images
     * - Sorted by relevance from search results
     * 
     * @param string $period The historical period identifier
     * 
     * @return \Illuminate\Http\JsonResponse JSON array of formatted artworks
     * 
     * URL Parameters:
     * - period (string): One of: renaissance, baroque, romanticism, modern, contemporary
     * 
     * Response Structure:
     * [
     *   {
     *     "id": 436524,
     *     "title": "The Starry Night",
     *     "artist": "Vincent van Gogh",
     *     "artistBio": "Dutch, 1853-1890",
     *     "year": "1889",
     *     "culture": "Dutch",
     *     "period": "Post-Impressionism",
     *     "location": "Netherlands",
     *     "medium": "Oil on canvas",
     *     "dimensions": "29 x 36 1/4 in.",
     *     "department": "European Paintings",
     *     "classification": "Paintings",
     *     "description": "Gift of...",
     *     "image": "https://images.metmuseum.org/...",
     *     "additionalImages": ["https://...", ...],
     *     "objectURL": "https://www.metmuseum.org/...",
     *     "isPublicDomain": true,
     *     "metadataDate": "2024-01-15T00:00:00Z",
     *     "repository": "Metropolitan Museum of Art"
     *   },
     *   ...
     * ]
     * 
     * Cache Duration:
     * - 86400 seconds (24 hours / 1 day)
     * 
     * Search Strategy:
     * - Multiple targeted queries per period
     * - Searches famous artists and movements
     * - Filters for objects with images
     * - Limits results to prevent overwhelming data
     * 
     * Example Usage:
     * ```
     * // Get Renaissance artworks
     * GET /api/timeline/renaissance
     * 
     * // Get Modern art
     * GET /api/timeline/modern
     * ```
     * 
     * Performance Notes:
     * - First request may take several seconds (multiple API calls)
     * - Subsequent requests are instant (cached)
     * - Cache shared across all users
     * 
     * Error Handling:
     * - Returns empty array if no results found
     * - Continues with other queries if one fails
     * - Logs errors without stopping execution
     * 
     * Use Cases:
     * - Timeline visualization
     * - Art history education
     * - Period comparison
     * - Curated galleries
     * 
     * @see \App\Http\Controllers\TimelineController::fetchArtworksForPeriod()
     * @see \App\Http\Controllers\TimelineController::getPeriodQueries()
     */
    public function getByPeriod($period)
    {
        // Generate cache key for this period
        $cacheKey = "timeline_{$period}";

        // Cache for 1 day (24 hours)
        $artworks = Cache::remember($cacheKey, 86400, function () use ($period) {
            // Fetch artworks using curated queries
            return $this->fetchArtworksForPeriod($period);
        });

        // Return formatted artworks array
        return response()->json($artworks);
    }

    /**
     * Get single artwork by ID.
     * 
     * Fetches detailed information for a specific artwork. Results are cached
     * for 7 days since artwork data is static and rarely changes.
     * 
     * Cache Key Format:
     * - "artwork_{id}"
     * 
     * @param int|string $id The Met Museum object ID
     * 
     * @return \Illuminate\Http\JsonResponse JSON object with artwork details
     * 
     * Response Structure:
     * {
     *   "id": 436524,
     *   "title": "The Starry Night",
     *   "artist": "Vincent van Gogh",
     *   "artistBio": "Dutch, 1853-1890",
     *   "year": "1889",
     *   ...
     *   (same structure as getByPeriod response)
     * }
     * 
     * Response (Not Found):
     * null
     * 
     * Cache Duration:
     * - 604800 seconds (7 days)
     * 
     * HTTP Handling:
     * - Returns null if object not found
     * - Logs errors but doesn't throw exceptions
     * 
     * Example Usage:
     * ```
     * // Get specific artwork
     * GET /api/artwork/436524
     * ```
     * 
     * Use Cases:
     * - Display artwork detail page
     * - Show full information modal
     * - Link from timeline to detail view
     * - Share specific artwork
     * 
     * @see \App\Http\Controllers\TimelineController::formatArtwork()
     */
    public function getById($id)
    {
        // Generate cache key for this artwork
        $cacheKey = "artwork_{$id}";

        // Cache for 7 days
        $artwork = Cache::remember($cacheKey, 604800, function () use ($id) {
            try {
                // Fetch artwork from Met Museum API
                $response = Http::get("{$this->metApiBase}/objects/{$id}");

                // Format and return if successful
                if ($response->successful()) {
                    $data = $response->json();
                    return $this->formatArtwork($data);
                }

                return null;
            } catch (\Exception $e) {
                // Log error and return null
                \Log::error("Error fetching artwork {$id}: " . $e->getMessage());
                return null;
            }
        });

        // Return formatted artwork or null
        return response()->json($artwork);
    }

    /**
     * Fetch artworks for a specific period.
     * 
     * Private helper method that executes multiple search queries for a historical
     * period and compiles representative artworks. Uses curated search terms to
     * ensure high-quality results.
     * 
     * Process:
     * 1. Get curated search queries for period
     * 2. Execute each search query
     * 3. Fetch details for first 10 object IDs
     * 4. Filter for objects with images
     * 5. Format artwork data
     * 6. Stop when 5 artworks collected
     * 
     * Search Limits:
     * - Maximum 5 artworks returned
     * - Fetches first 10 IDs per query
     * - Only includes objects with primary images
     * 
     * @param string $period The historical period identifier
     * 
     * @return array Array of formatted artwork objects
     * 
     * Return Value:
     * [
     *   { artwork object 1 },
     *   { artwork object 2 },
     *   ...
     *   { artwork object 5 }
     * ]
     * 
     * Error Handling:
     * - Continues with remaining queries if one fails
     * - Logs errors without stopping execution
     * - Returns partial results if some queries fail
     * 
     * Performance Notes:
     * - May make 5-15 API calls per period
     * - Takes 5-15 seconds on first run
     * - Results cached for 24 hours
     * 
     * Search Quality:
     * - Uses famous artists and movements
     * - Filters for objects with images
     * - Prioritizes search result relevance
     * - Ensures diverse representation
     * 
     * @see \App\Http\Controllers\TimelineController::getPeriodQueries()
     * @see \App\Http\Controllers\TimelineController::formatArtwork()
     */
    private function fetchArtworksForPeriod($period)
    {
        // Get curated search queries for this period
        $queries = $this->getPeriodQueries($period);
        $artworks = [];

        // Execute each search query
        foreach ($queries as $query) {
            try {
                // Search for objects matching query
                $searchResponse = Http::get("{$this->metApiBase}/search", [
                    'q' => $query,
                    'hasImages' => 'true' // Only objects with images
                ]);

                if ($searchResponse->successful()) {
                    // Get object IDs from search results
                    $objectIds = $searchResponse->json()['objectIDs'] ?? [];

                    // Get first 10 IDs to check
                    $limitedIds = array_slice($objectIds, 0, 10);

                    // Fetch details for each object
                    foreach ($limitedIds as $id) {
                        $objectResponse = Http::get("{$this->metApiBase}/objects/{$id}");

                        if ($objectResponse->successful()) {
                            $data = $objectResponse->json();

                            // Only include if has primary image
                            if (!empty($data['primaryImage'])) {
                                $artworks[] = $this->formatArtwork($data);
                            }

                            // Stop if we have 5 artworks
                            if (count($artworks) >= 5) {
                                break 2; // Break out of both loops
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                // Log error but continue with other queries
                \Log::error("Error fetching period {$period}: " . $e->getMessage());
            }
        }

        return $artworks;
    }

    /**
     * Format artwork data.
     * 
     * Private helper method that standardizes artwork data from Met Museum API
     * into a consistent format. Handles missing data gracefully with default
     * values and ensures all required fields are present.
     * 
     * Data Transformation:
     * - Renames API fields to more semantic names
     * - Provides default values for missing data
     * - Consolidates location from multiple sources
     * - Simplifies nested data structures
     * 
     * @param array $data Raw artwork data from Met Museum API
     * 
     * @return array Formatted artwork object
     * 
     * Field Mapping:
     * - objectID → id
     * - title → title (default: "Untitled")
     * - artistDisplayName → artist (default: "Unknown Artist")
     * - artistDisplayBio → artistBio (default: "")
     * - objectDate → year (default: "Date Unknown")
     * - culture → culture (default: "")
     * - period → period (default: "")
     * - country/city → location (default: "")
     * - medium → medium (default: "Medium Unknown")
     * - dimensions → dimensions (default: "")
     * - department → department (default: "")
     * - classification → classification (default: "")
     * - creditLine → description (default: "")
     * - primaryImage/primaryImageSmall → image (default: null)
     * - additionalImages → additionalImages (default: [])
     * - objectURL → objectURL (default: "")
     * - isPublicDomain → isPublicDomain (default: false)
     * - metadataDate → metadataDate (default: null)
     * - repository → repository (default: "")
     * 
     * Default Handling:
     * - Uses null coalescing operator (??) for safe defaults
     * - Prevents undefined index errors
     * - Ensures consistent data structure
     * 
     * Image Priority:
     * - Tries primaryImage first
     * - Falls back to primaryImageSmall if available
     * - Returns null if no images
     * 
     * Location Priority:
     * - Uses country if available
     * - Falls back to city if country not set
     * - Returns empty string if neither available
     * 
     * Return Structure:
     * {
     *   "id": int,
     *   "title": string,
     *   "artist": string,
     *   "artistBio": string,
     *   "year": string,
     *   "culture": string,
     *   "period": string,
     *   "location": string,
     *   "medium": string,
     *   "dimensions": string,
     *   "department": string,
     *   "classification": string,
     *   "description": string,
     *   "image": string|null,
     *   "additionalImages": array,
     *   "objectURL": string,
     *   "isPublicDomain": boolean,
     *   "metadataDate": string|null,
     *   "repository": string
     * }
     * 
     * Use Cases:
     * - Standardize API responses
     * - Ensure consistent frontend data
     * - Handle missing metadata gracefully
     * - Simplify frontend data consumption
     * 
     * @see https://metmuseum.github.io/#object
     */
    private function formatArtwork($data)
    {
        return [
            'id' => $data['objectID'] ?? null,
            'title' => $data['title'] ?? 'Untitled',
            'artist' => $data['artistDisplayName'] ?? 'Unknown Artist',
            'artistBio' => $data['artistDisplayBio'] ?? '',
            'year' => $data['objectDate'] ?? 'Date Unknown',
            'culture' => $data['culture'] ?? '',
            'period' => $data['period'] ?? '',
            'location' => $data['country'] ?? $data['city'] ?? '',
            'medium' => $data['medium'] ?? 'Medium Unknown',
            'dimensions' => $data['dimensions'] ?? '',
            'department' => $data['department'] ?? '',
            'classification' => $data['classification'] ?? '',
            'description' => $data['creditLine'] ?? '',
            'image' => $data['primaryImage'] ?? $data['primaryImageSmall'] ?? null,
            'additionalImages' => $data['additionalImages'] ?? [],
            'objectURL' => $data['objectURL'] ?? '',
            'isPublicDomain' => $data['isPublicDomain'] ?? false,
            'metadataDate' => $data['metadataDate'] ?? null,
            'repository' => $data['repository'] ?? ''
        ];
    }

    /**
     * Get search queries for each period.
     * 
     * Private helper method that returns curated search terms for each historical
     * period. These queries are designed to return high-quality, representative
     * artworks for timeline and educational purposes.
     * 
     * Query Strategy:
     * - Famous artists from each period
     * - Art movements and styles
     * - Period-specific terminology
     * - Ensures diverse representation
     * 
     * @param string $period The historical period identifier
     * 
     * @return array Array of search query strings
     * 
     * Period Queries:
     * 
     * Renaissance (1400-1600):
     * - General: "Renaissance"
     * - Artists: Leonardo da Vinci, Michelangelo, Raphael, Botticelli
     * 
     * Baroque (1600-1750):
     * - General: "Baroque"
     * - Artists: Rembrandt, Caravaggio, Vermeer, Velázquez
     * 
     * Romanticism (1800-1900):
     * - Movements: Romanticism, Impressionism
     * - Artists: Van Gogh, Monet, Delacroix
     * 
     * Modern (1900-1970):
     * - General: "Modern art"
     * - Artists: Picasso
     * - Movements: Abstract, Cubism, Surrealism
     * 
     * Contemporary (1970-present):
     * - General: "Contemporary art"
     * - Media: Installation, Digital art, Photography, Sculpture
     * 
     * Return Value Examples:
     * - renaissance: ['Renaissance', 'Leonardo da Vinci', 'Michelangelo', ...]
     * - modern: ['Modern art', 'Picasso', 'Abstract', 'Cubism', 'Surrealism']
     * - unknown_period: [] (empty array)
     * 
     * Default Behavior:
     * - Returns empty array for unknown periods
     * - Prevents errors from invalid period values
     * - Allows graceful handling in calling method
     * 
     * Customization:
     * - Add more artists/movements as needed
     * - Adjust for specific educational focus
     * - Include regional variations
     * - Add emerging movements for contemporary
     * 
     * Search Quality Notes:
     * - Artist names return focused results
     * - Movement terms return broader selections
     * - Mix ensures diverse representation
     * - Order matters: earlier queries processed first
     * 
     * Use Cases:
     * - Power timeline artwork selection
     * - Ensure period-appropriate results
     * - Provide educational context
     * - Support curated galleries
     * 
     * @see \App\Http\Controllers\TimelineController::fetchArtworksForPeriod()
     */
    private function getPeriodQueries($period)
    {
        // Define curated search queries for each period
        $queries = [
            'renaissance' => ['Renaissance', 'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'],
            'baroque' => ['Baroque', 'Rembrandt', 'Caravaggio', 'Vermeer', 'Velázquez'],
            'romanticism' => ['Romanticism', 'Impressionism', 'Van Gogh', 'Monet', 'Delacroix'],
            'modern' => ['Modern art', 'Picasso', 'Abstract', 'Cubism', 'Surrealism'],
            'contemporary' => ['Contemporary art', 'Installation', 'Digital art', 'Photography', 'Sculpture']
        ];

        // Return queries for requested period, or empty array if not found
        return $queries[$period] ?? [];
    }
}
