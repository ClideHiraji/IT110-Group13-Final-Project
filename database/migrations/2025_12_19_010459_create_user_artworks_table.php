<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create User Artworks Table Migration
 * 
 * Creates table for storing user's saved artwork collection from external APIs
 * (Met Museum, Art Institute of Chicago, etc.).
 * 
 * Purpose:
 * Allows users to curate personal art galleries by saving artworks with notes.
 * Stores artwork metadata locally to reduce API calls and enable offline access.
 * 
 * Features:
 * - Personal collection management
 * - Artwork metadata caching
 * - User notes for each artwork
 * - Prevent duplicate saves per user
 * 
 * Created: December 19, 2025
 * 
 * @see \App\Models\UserArtwork
 * @see \App\Http\Controllers\CollectionController
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates user_artworks table with columns for artwork data and user notes.
     */
    public function up(): void
    {
        Schema::create('user_artworks', function (Blueprint $table) {
            /**
             * ID Column
             * Auto-increment primary key
             */
            $table->id();

            /**
             * User ID Column
             * 
             * Type: foreignId (bigint unsigned)
             * References: users.id
             * On Delete: cascade (delete artwork when user deleted)
             * Indexed: For fast lookups
             * 
             * Purpose:
             * Links artwork to the user who saved it.
             * 
             * Cascade Delete:
             * When user deleted, all their saved artworks automatically deleted.
             * Prevents orphaned records.
             * 
             * Usage:
             * ```
             * $user->artworks; // Get all user's artworks
             * $artwork->user; // Get artwork owner
             * ```
             */
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            /**
             * Artwork ID Column
             * 
             * Type: string
             * Unique: Yes (globally unique)
             * 
             * Purpose:
             * Stores the external API's unique identifier for the artwork.
             * 
             * Format Examples:
             * - Met Museum: "436524" (object ID)
             * - Art Institute: "27992" (artwork ID)
             * - Custom format: "met-436524", "aic-27992"
             * 
             * Why String:
             * Different APIs use different ID formats (numeric, alphanumeric, prefixed).
             * String type accommodates all formats.
             * 
             * Uniqueness:
             * Prevents the same artwork being saved multiple times by same user.
             * Combined with user_id in composite unique constraint below.
             * 
             * Usage:
             * ```
             * // Fetch fresh data from API if needed
             * $artwork = UserArtwork::where('artwork_id', '436524')->first();
             * Http::get("https://api.museum.org/objects/{$artwork->artwork_id}");
             * ```
             */
            $table->string('artwork_id');

            /**
             * Title Column
             * 
             * Type: string (nullable)
             * Max Length: 255 characters
             * 
             * Purpose:
             * Stores the artwork's title/name.
             * 
             * Examples:
             * - "The Starry Night"
             * - "Mona Lisa"
             * - "Untitled No. 5"
             * 
             * Nullable:
             * Some artworks may not have titles (especially modern/contemporary art).
             * 
             * Usage in UI:
             * Display as primary artwork identifier in collection views.
             */
            $table->string('title')->nullable();

            /**
             * Artist Column
             * 
             * Type: string (nullable)
             * Max Length: 255 characters
             * 
             * Purpose:
             * Stores the artist's name or attribution.
             * 
             * Examples:
             * - "Vincent van Gogh"
             * - "Leonardo da Vinci"
             * - "Unknown Artist"
             * - "Workshop of Rembrandt"
             * 
             * Nullable:
             * - Artist unknown (common for ancient artifacts)
             * - Anonymous works
             * - Attribution uncertain
             * 
             * Search/Filter:
             * Users can filter their collection by artist name.
             */
            $table->string('artist')->nullable();

            /**
             * Period Column
             * 
             * Type: string (nullable)
             * Max Length: 100 characters (estimated)
             * 
             * Purpose:
             * Stores art historical period, movement, or era.
             * 
             * Examples:
             * - "Post-Impressionism"
             * - "Renaissance"
             * - "Baroque"
             * - "Ancient Egypt, Dynasty XVIII"
             * - "20th Century"
             * 
             * Usage:
             * - Organize collection by time period
             * - Educational context
             * - Timeline visualization
             * 
             * Nullable:
             * May not be available for all artworks.
             */
            $table->string('period')->nullable();

            /**
             * Image URL Column
             * 
             * Type: string (nullable)
             * Max Length: 500 characters (estimated)
             * 
             * Purpose:
             * Stores URL to the artwork's image from external API.
             * 
             * Format:
             * Full URL to image file (JPEG, PNG, etc.)
             * Example: "https://images.metmuseum.org/CRDImages/ep/original/DT1502.jpg"
             * 
             * Nullable:
             * - Image not available
             * - Image restricted by copyright
             * - API didn't provide image
             * 
             * Important Notes:
             * - URL may expire or change
             * - Consider downloading and storing locally for reliability
             * - Check API terms for image usage rights
             * - May need CORS headers for browser access
             * 
             * Display:
             * ```
             * @if($artwork->image_url)
             *     <img src="{{ $artwork->image_url }}" alt="{{ $artwork->title }}">
             * @else
             *     <div class="no-image-placeholder">No Image Available</div>
             * @endif
             * ```
             */
            $table->string('image_url')->nullable();

            /**
             * Description Column
             * 
             * Type: text (nullable)
             * Length: Unlimited
             * 
             * Purpose:
             * Stores artwork description, credit line, provenance, or other details.
             * 
             * Content Examples:
             * - Museum description
             * - Credit line: "Gift of John D. Rockefeller Jr., 1934"
             * - Medium: "Oil on canvas"
             * - Dimensions: "73.7 × 92.1 cm"
             * - Provenance information
             * 
             * Nullable:
             * Description may not be available from API.
             * 
             * Display:
             * Show in artwork detail view as contextual information.
             */
            $table->text('description')->nullable();

            /**
             * Notes Column
             * 
             * Type: text (nullable)
             * Length: Unlimited (validated at 1000 chars in request)
             * 
             * Purpose:
             * User's personal notes about the artwork.
             * 
             * Use Cases:
             * - Personal impressions
             * - Research notes
             * - Reasons for saving
             * - Educational annotations
             * - Project planning notes
             * 
             * Examples:
             * - "Need to study the brushwork technique"
             * - "Inspiration for my final project"
             * - "Visited this at the Louvre in 2023"
             * - "Notice the symbolism of the blue color"
             * 
             * Validation:
             * Limited to 1000 characters in AddArtworkRequest.
             * 
             * Privacy:
             * Notes are private to the user, never shared publicly.
             * 
             * Editable:
             * User can update notes anytime via UpdateArtworkRequest.
             */
            $table->text('notes')->nullable();

            /**
             * Timestamps
             * 
             * Automatically creates:
             * - created_at: When artwork was saved to collection
             * - updated_at: Last time artwork or notes were modified
             * 
             * Usage:
             * - Sort collection by date saved
             * - Show "Added 3 days ago"
             * - Track collection growth over time
             * 
             * Access:
             * ```
             * $artwork->created_at->format('M d, Y'); // "Dec 19, 2025"
             * $artwork->created_at->diffForHumans(); // "3 days ago"
             * ```
             */
            $table->timestamps();

            /**
             * Composite Unique Constraint
             * 
             * Prevents the same user from saving the same artwork twice.
             * 
             * Constraint: unique(['user_id', 'artwork_id'])
             * 
             * Behavior:
             * - User A can save artwork 123: ✓
             * - User A tries to save artwork 123 again: ✗ (duplicate)
             * - User B can save artwork 123: ✓ (different user)
             * 
             * Database Error:
             * Attempting to insert duplicate throws:
             * Illuminate\Database\QueryException: SQLSTATE[23000]: 
             * Integrity constraint violation: 1062 Duplicate entry
             * 
             * Handling in Code:
             * ```
             * try {
             *     UserArtwork::create([...]);
             * } catch (QueryException $e) {
             *     if ($e->getCode() === '23000') {
             *         return back()->withErrors(['artwork' => 'Already saved']);
             *     }
             * }
             * ```
             * 
             * Alternative Check:
             * ```
             * if (UserArtwork::where('user_id', $userId)
             *                ->where('artwork_id', $artworkId)
             *                ->exists()) {
             *     return 'Already saved';
             * }
             * ```
             */
            $table->unique(['user_id', 'artwork_id']);
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Drops the user_artworks table and all data.
     * 
     * Warning:
     * This deletes all saved artworks and user notes permanently.
     * Consider backing up data before running this migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_artworks');
    }
};
