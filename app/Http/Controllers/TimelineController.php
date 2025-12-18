<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class TimelineController extends Controller
{
    private $metApiBase = 'https://collectionapi.metmuseum.org/public/collection/v1';

    /**
     * Get artworks by time period
     * This provides server-side caching for better performance
     */
    public function getByPeriod(Request $request, $period)
    {
        $cacheKey = "timeline_period_{$period}";
        
        // Cache for 24 hours
        $artworks = Cache::remember($cacheKey, 86400, function () use ($period) {
            return $this->fetchArtworksForPeriod($period);
        });

        return response()->json($artworks);
    }

    /**
     * Get single artwork by ID
     */
    public function getById($id)
    {
        $cacheKey = "artwork_{$id}";
        
        // Cache for 7 days
        $artwork = Cache::remember($cacheKey, 604800, function () use ($id) {
            try {
                $response = Http::get("{$this->metApiBase}/objects/{$id}");
                
                if ($response->successful()) {
                    $data = $response->json();
                    return $this->formatArtwork($data);
                }
                
                return null;
            } catch (\Exception $e) {
                \Log::error("Error fetching artwork {$id}: " . $e->getMessage());
                return null;
            }
        });

        return response()->json($artwork);
    }

    /**
     * Fetch artworks for a specific period
     */
    private function fetchArtworksForPeriod($period)
    {
        $queries = $this->getPeriodQueries($period);
        $artworks = [];

        foreach ($queries as $query) {
            try {
                // Search for objects
                $searchResponse = Http::get("{$this->metApiBase}/search", [
                    'q' => $query,
                    'hasImages' => 'true'
                ]);

                if ($searchResponse->successful()) {
                    $objectIds = $searchResponse->json()['objectIDs'] ?? [];
                    
                    // Get first 10 IDs
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
                        }
                        
                        // Stop if we have 5 artworks
                        if (count($artworks) >= 5) {
                            break 2;
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Error fetching period {$period}: " . $e->getMessage());
            }
        }

        return $artworks;
    }

    /**
     * Format artwork data
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
     * Get search queries for each period
     */
    private function getPeriodQueries($period)
    {
        $queries = [
            'renaissance' => ['Renaissance', 'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'],
            'baroque' => ['Baroque', 'Rembrandt', 'Caravaggio', 'Vermeer', 'Velázquez'],
            'romanticism' => ['Romanticism', 'Impressionism', 'Van Gogh', 'Monet', 'Delacroix'],
            'modern' => ['Modern art', 'Picasso', 'Abstract', 'Cubism', 'Surrealism'],
            'contemporary' => ['Contemporary art', 'Installation', 'Digital art', 'Photography', 'Sculpture']
        ];

        return $queries[$period] ?? [];
    }
}