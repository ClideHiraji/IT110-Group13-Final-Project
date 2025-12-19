<?php

namespace App\Http\Controllers;

use App\Models\UserArtwork;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CollectionController
 * 
 * Manages user artwork collections, providing CRUD operations for saving,
 * viewing, updating, and removing artworks from a user's personal collection.
 * This controller enables users to curate their own art galleries.
 * 
 * Features:
 * - View all saved artworks for authenticated user
 * - Save new artwork to collection with metadata
 * - Update personal notes for saved artworks
 * - Remove artworks from collection
 * - Check if specific artwork is already saved
 * - Prevent duplicate entries
 * 
 * Database Model:
 * - UserArtwork: Stores user-artwork relationships with metadata
 * 
 * Authentication:
 * - All methods require authenticated user (typically via 'auth' middleware)
 * 
 * Response Format:
 * - All methods return JSON responses
 * - Suitable for API consumption by frontend (Vue/React/etc)
 * 
 * @package App\Http\Controllers
 * 
 * @see \App\Models\UserArtwork
 */
class CollectionController extends Controller
{
    /**
     * Inertia page for the user's collection.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('Collection');
    }

    /**
     * Get all artworks in user's collection (READ).
     * 
     * Retrieves all artworks saved by the authenticated user, ordered by
     * most recently added first. Returns complete artwork data including
     * metadata and user notes.
     * 
     * Query:
     * - Filters by authenticated user ID
     * - Orders by creation date (newest first)
     * - Returns all columns from user_artworks table
     * 
     * @param Request $request The HTTP request with authenticated user
     * 
     * @return \Illuminate\Http\JsonResponse JSON array of artwork objects
     * 
     * Response Structure:
     * [
     *   {
     *     "id": 1,
     *     "user_id": 123,
     *     "artwork_id": "45678",
     *     "title": "Starry Night",
     *     "artist": "Vincent van Gogh",
     *     "period": "Post-Impressionism",
     *     "image_url": "https://...",
     *     "description": "...",
     *     "notes": "User's personal notes",
     *     "created_at": "2024-01-15T10:30:00.000000Z",
     *     "updated_at": "2024-01-15T10:30:00.000000Z"
     *   },
     *   ...
     * ]
     * 
     * Use Cases:
     * - Display user's collection gallery page
     * - Show saved artworks count
     * - Export collection data
     * - Generate collection statistics
     * 
     * Performance Notes:
     * - No pagination implemented (consider for large collections)
     * - Eager loading not needed (no relationships loaded)
     * 
     * @see \App\Models\UserArtwork
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            $artworks = UserArtwork::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Collection index failed: '.$e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }

        return response()->json($artworks);
    }

    /**
     * Save artwork to collection (CREATE).
     * 
     * Adds a new artwork to the user's collection with metadata. Prevents
     * duplicate entries by checking if the artwork already exists in the
     * user's collection before saving.
     * 
     * Validation:
     * - artwork_id: Required, string identifier from external API
     * - title: Optional, max 255 characters
     * - artist: Optional, max 255 characters
     * - period: Optional, max 100 characters (e.g., "Renaissance")
     * - image_url: Optional, max 500 characters (URL to artwork image)
     * - description: Optional, text field (no length limit)
     * 
     * Duplicate Prevention:
     * - Checks if user already has this artwork_id saved
     * - Returns 409 Conflict if duplicate found
     * 
     * @param Request $request The HTTP request containing artwork data
     * 
     * @return \Illuminate\Http\JsonResponse JSON response with artwork or error
     * 
     * Request Body Example:
     * {
     *   "artwork_id": "436524",
     *   "title": "The Starry Night",
     *   "artist": "Vincent van Gogh",
     *   "period": "Post-Impressionism",
     *   "image_url": "https://images.metmuseum.org/...",
     *   "description": "Oil on canvas painting..."
     * }
     * 
     * Success Response (201 Created):
     * {
     *   "message": "Artwork saved to collection",
     *   "artwork": {
     *     "id": 42,
     *     "user_id": 123,
     *     "artwork_id": "436524",
     *     "title": "The Starry Night",
     *     "artist": "Vincent van Gogh",
     *     ...
     *   }
     * }
     * 
     * Duplicate Response (409 Conflict):
     * {
     *   "message": "Artwork already in collection"
     * }
     * 
     * Error Scenarios:
     * 1. Missing artwork_id: 422 Validation Error
     * 2. Duplicate artwork: 409 Conflict
     * 3. Invalid data types: 422 Validation Error
     * 
     * Database Operations:
     * - Inserts new record in user_artworks table
     * - Automatically sets created_at and updated_at timestamps
     * 
     * Frontend Integration:
     * - Show "Save" button when artwork not in collection
     * - Show "Saved" badge when already in collection
     * - Display success notification on save
     * 
     * @see \App\Models\UserArtwork::create()
     */
    public function store(Request $request)
    {
        // Validate incoming artwork data
        // artwork_id is required, all other fields are optional
        $validated = $request->validate([
            'artwork_id' => 'required|string',
            'title' => 'nullable|string|max:255',
            'artist' => 'nullable|string|max:255',
            'period' => 'nullable|string|max:100',
            'image_url' => 'nullable|string|max:500',
            'description' => 'nullable|string',
        ]);

        // Check if artwork already exists in user's collection
        // Prevents duplicate entries for the same artwork
        $exists = UserArtwork::where('user_id', $request->user()->id)
            ->where('artwork_id', $validated['artwork_id'])
            ->exists();

        // If already saved, return conflict response
        if ($exists) {
            return response()->json([
                'message' => 'Artwork already in collection'
            ], 409);
        }

        // Create new artwork entry in collection
        // Spread operator (...) merges validated data
        $artwork = UserArtwork::create([
            'user_id' => $request->user()->id,
            ...$validated
        ]);

        // Return success response with created artwork
        return response()->json([
            'message' => 'Artwork saved to collection',
            'artwork' => $artwork,
        ], 201);
    }

    /**
     * Update note for an artwork (UPDATE).
     * 
     * Updates or adds personal notes to a saved artwork. Users can add
     * their thoughts, observations, or research notes about artworks in
     * their collection.
     * 
     * Authorization:
     * - Only artwork owner can update notes
     * - firstOrFail() throws 404 if not found or not owned by user
     * 
     * @param Request $request The HTTP request containing note data
     * @param string $artworkId The artwork ID to update
     * 
     * @return \Illuminate\Http\JsonResponse JSON response with updated artwork
     * 
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If artwork not found
     * 
     * Request Body Example:
     * {
     *   "note": "Painted during Van Gogh's stay in Saint-Rémy-de-Provence..."
     * }
     * 
     * Validation Rules:
     * - note: Optional (nullable), string, max 1000 characters
     * - Empty string clears the note
     * - Null or missing note also clears the note
     * 
     * Success Response (200 OK):
     * {
     *   "message": "Note updated successfully",
     *   "artwork": {
     *     "id": 42,
     *     "user_id": 123,
     *     "artwork_id": "436524",
     *     "notes": "Painted during Van Gogh's stay...",
     *     "updated_at": "2024-01-15T14:30:00.000000Z",
     *     ...
     *   }
     * }
     * 
     * Error Scenarios:
     * 1. Artwork not found: 404 Not Found
     * 2. Note too long (>1000 chars): 422 Validation Error
     * 3. Not artwork owner: 404 Not Found (for security)
     * 
     * Use Cases:
     * - Add personal observations about artwork
     * - Record research notes
     * - Store analysis or interpretation
     * - Save reminders or context
     * - Clear existing notes
     * 
     * Database Operations:
     * - Updates 'notes' column in user_artworks table
     * - Updates 'updated_at' timestamp automatically
     * 
     * Frontend Integration:
     * - Textarea or rich text editor for notes
     * - Auto-save or manual save button
     * - Character counter (1000 max)
     * - Display existing notes for editing
     * 
     * @see \App\Models\UserArtwork::update()
     */
    public function updateNote(Request $request, string $artworkId)
    {
        // Validate note content
        // Nullable allows clearing notes by passing null or empty string
        $validated = $request->validate([
            'note' => 'nullable|string|max:1000',
        ]);

        // Find artwork by ID and user ownership
        // firstOrFail() throws 404 if not found or not owned by user
        $artwork = UserArtwork::where('user_id', $request->user()->id)
            ->where('artwork_id', $artworkId)
            ->firstOrFail();

        // Update the notes field
        // Laravel automatically updates updated_at timestamp
        $artwork->update(['notes' => $validated['note']]);

        // Return success response with updated artwork
        return response()->json([
            'message' => 'Note updated successfully',
            'artwork' => $artwork,
        ]);
    }

    /**
     * Remove artwork from collection (DELETE).
     * 
     * Removes an artwork from the user's collection. This is a soft operation
     * that only affects the user's personal collection, not the artwork data
     * in the external API.
     * 
     * Authorization:
     * - Only removes artworks owned by authenticated user
     * - Cannot remove other users' saved artworks
     * 
     * @param Request $request The HTTP request with authenticated user
     * @param string $artworkId The artwork ID to remove
     * 
     * @return \Illuminate\Http\JsonResponse JSON response with success or error
     * 
     * Success Response (200 OK):
     * {
     *   "message": "Artwork removed from collection"
     * }
     * 
     * Not Found Response (404):
     * {
     *   "message": "Artwork not found"
     * }
     * 
     * Process:
     * 1. Attempt to delete artwork matching user ID and artwork ID
     * 2. If no rows deleted (artwork not found): return 404
     * 3. If deleted successfully: return success message
     * 
     * Error Scenarios:
     * 1. Artwork not in collection: 404 Not Found
     * 2. Artwork belongs to different user: No rows deleted, 404
     * 
     * Database Operations:
     * - Permanently deletes record from user_artworks table
     * - Not a soft delete (consider implementing if undo needed)
     * - Single query operation (efficient)
     * 
     * Use Cases:
     * - Remove unwanted artworks from collection
     * - Clean up collection
     * - Undo accidental saves
     * - Curate collection by removing items
     * 
     * Frontend Integration:
     * - "Remove" or "Delete" button with confirmation dialog
     * - Update UI to show unsaved state
     * - Show undo notification (if implementing undo feature)
     * - Refresh collection list after removal
     * 
     * Recommended Enhancements:
     * - Add confirmation requirement for safety
     * - Implement soft deletes for undo capability
     * - Track deletion history for analytics
     * - Add bulk delete functionality
     * 
     * @see \App\Models\UserArtwork::delete()
     */
    public function destroy(Request $request, string $artworkId)
    {
        // Attempt to delete the artwork from user's collection
        // Returns number of rows deleted (0 if not found, 1 if deleted)
        $deleted = UserArtwork::where('user_id', $request->user()->id)
            ->where('artwork_id', $artworkId)
            ->delete();

        // Check if artwork was found and deleted
        if (!$deleted) {
            // No rows deleted means artwork not in collection or not owned
            return response()->json([
                'message' => 'Artwork not found'
            ], 404);
        }

        // Successfully deleted
        return response()->json([
            'message' => 'Artwork removed from collection',
        ]);
    }

    /**
     * Check if artwork is saved.
     * 
     * Checks whether a specific artwork is already in the user's collection.
     * This is a lightweight query used to update UI state (show "Save" vs
     * "Saved" button).
     * 
     * Performance:
     * - Uses exists() which is optimized (only checks existence, doesn't fetch data)
     * - Returns boolean result
     * - Very fast query suitable for frequent calls
     * 
     * @param Request $request The HTTP request with authenticated user
     * @param string $artworkId The artwork ID to check
     * 
     * @return \Illuminate\Http\JsonResponse JSON response with saved status
     * 
     * Response (200 OK):
     * {
     *   "saved": true
     * }
     * 
     * or
     * 
     * {
     *   "saved": false
     * }
     * 
     * Use Cases:
     * - Update button state when viewing artwork details
     * - Show badge on artwork thumbnails in search results
     * - Bulk check multiple artworks (call for each ID)
     * - Validate before attempting save
     * 
     * Database Operations:
     * - SELECT EXISTS query (very efficient)
     * - No data retrieval, only existence check
     * - Uses indexed columns (user_id, artwork_id)
     * 
     * Frontend Integration:
     * - Call when displaying artwork details page
     * - Toggle button text: "Save to Collection" vs "Saved"
     * - Show/hide save icon on artwork cards
     * - Update state after save/remove operations
     * 
     * Example Frontend Usage:
     * ```
     * // Check if artwork is saved
     * const response = await fetch(`/api/collection/check/${artworkId}`);
     * const { saved } = await response.json();
     * 
     * // Update UI
     * button.textContent = saved ? 'Saved ✓' : 'Save';
     * button.disabled = saved;
     * ```
     * 
     * Recommended Enhancements:
     * - Add batch checking endpoint for multiple IDs
     * - Cache results on frontend to reduce API calls
     * - Include save count in response (how many users saved)
     * 
     * @see \Illuminate\Database\Query\Builder::exists()
     */
    public function checkSaved(Request $request, string $artworkId)
    {
        // Check if artwork exists in user's collection
        // exists() returns boolean, optimized for existence checks
        $exists = UserArtwork::where('user_id', $request->user()->id)
            ->where('artwork_id', $artworkId)
            ->exists();

        // Return simple boolean response
        return response()->json(['saved' => $exists]);
    }
}
