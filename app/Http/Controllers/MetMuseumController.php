<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class MetMuseumController extends Controller
{
    private $baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';

    /**
     * Search objects (cached for 24 hours)
     */
    public function search(Request $request)
    {
        try {
            $query = $request->input('q', '*');
            $hasImages = $request->input('hasImages', 'true') === 'true';
            
            $cacheKey = "met_search_" . md5($query . ($hasImages ? '1' : '0'));
            
            // ✅ Cache for 24 hours
            $data = Cache::remember($cacheKey, 86400, function () use ($query, $hasImages) {
                $response = Http::timeout(15)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ])
                    ->get("{$this->baseUrl}/search", [
                        'q' => $query,
                        'hasImages' => $hasImages,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            });

            if ($data) {
                return response()->json($data);
            }

            return response()->json(['error' => 'Search failed', 'objectIDs' => []], 200);

        } catch (\Exception $e) {
            \Log::error("Met Museum Search Error: " . $e->getMessage());
            return response()->json(['error' => 'Search failed', 'objectIDs' => []], 200);
        }
    }

    /**
     * Get object details by ID (cached for 7 days)
     */
    public function getObject($objectId)
    {
        try {
            $cacheKey = "met_object_{$objectId}";
            
            // ✅ Cache for 7 days (artwork data rarely changes)
            $data = Cache::remember($cacheKey, 604800, function () use ($objectId) {
                $response = Http::timeout(10)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ])
                    ->get("{$this->baseUrl}/objects/{$objectId}");

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            });

            if ($data) {
                return response()->json($data);
            }

            return response()->json(['error' => 'Object not found'], 404);

        } catch (\Exception $e) {
            \Log::error("Met Museum API Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch object'], 500);
        }
    }

    /**
     * Get objects by department and period (cached for 24 hours)
     */
    public function getObjectsByPeriod(Request $request)
    {
        try {
            $departmentIds = $request->input('departmentIds', '11');
            $dateBegin = $request->input('dateBegin', -3000);
            $dateEnd = $request->input('dateEnd', 2024);
            $hasImages = $request->input('hasImages', true);
            
            $cacheKey = "met_period_" . md5($departmentIds . $dateBegin . $dateEnd);
            
            // ✅ Cache for 24 hours (was 1 hour)
            $data = Cache::remember($cacheKey, 86400, function () use ($departmentIds, $dateBegin, $dateEnd, $hasImages) {
                $response = Http::timeout(15)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ])
                    ->get("{$this->baseUrl}/search", [
                        'departmentIds' => $departmentIds,
                        'dateBegin' => $dateBegin,
                        'dateEnd' => $dateEnd,
                        'hasImages' => $hasImages,
                        'q' => '*',
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            });

            if ($data) {
                return response()->json($data);
            }

            return response()->json(['error' => 'No objects found'], 404);

        } catch (\Exception $e) {
            \Log::error("Met Museum Period Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch objects'], 500);
        }
    }

    /**
     * Get multiple objects in batch (cached individually for 24 hours)
     */
    public function getBatch(Request $request)
    {
        try {
            $objectIds = $request->input('ids', []);
            
            if (empty($objectIds) || !is_array($objectIds)) {
                return response()->json(['error' => 'Invalid object IDs'], 400);
            }

            // Limit to 20 objects per request
            $objectIds = array_slice($objectIds, 0, 20);

            $results = [];
            foreach ($objectIds as $id) {
                $cacheKey = "met_object_{$id}";
                
                // ✅ Cache for 24 hours
                $data = Cache::remember($cacheKey, 86400, function () use ($id) {
                    $response = Http::timeout(5)
                        ->withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ])
                        ->get("{$this->baseUrl}/objects/{$id}");

                    if ($response->successful()) {
                        return $response->json();
                    }

                    return null;
                });

                if ($data) {
                    $results[] = $data;
                }
            }

            return response()->json($results);

        } catch (\Exception $e) {
            \Log::error("Met Museum Batch Error: " . $e->getMessage());
            return response()->json(['error' => 'Batch fetch failed'], 500);
        }
    }
}
