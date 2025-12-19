<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserArtwork Model
 * 
 * Represents a saved artwork in a user's personal collection. This model creates
 * a many-to-one relationship between users and artworks, allowing users to save
 * and curate their own art galleries with personal notes.
 * 
 * Features:
 * - Stores artwork metadata from external API
 * - Allows personal notes for each artwork
 * - Tracks when artwork was added to collection
 * - Belongs to User model
 * 
 * Database Table: user_artworks
 * 
 * Relationships:
 * - Belongs to User (one user has many artworks)
 * 
 * Use Cases:
 * - Personal art collections
 * - Favorites/bookmarks
 * - Art history research notes
 * - Educational portfolios
 * 
 * @package App\Models
 * 
 * @property int $id
 * @property int $user_id
 * @property string $artwork_id External API artwork identifier
 * @property string|null $title
 * @property string|null $artist
 * @property string|null $period
 * @property string|null $image_url
 * @property string|null $description
 * @property string|null $notes User's personal notes
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * 
 * @property-read \App\Models\User $user
 * 
 * @method static \Illuminate\Database\Eloquent\Builder|UserArtwork where($column, $value)
 * @method static UserArtwork create(array $attributes)
 * 
 * @see \App\Models\User
 * @see \App\Http\Controllers\CollectionController
 */
class UserArtwork extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * 
     * Defines which attributes can be set via mass assignment methods like
     * create(), update(), and fill(). This is a security feature to prevent
     * malicious mass assignment attacks.
     * 
     * @var array<int, string>
     * 
     * Fillable Attributes:
     * 
     * - user_id: ID of the user who saved the artwork
     *   Type: Integer (foreign key)
     *   Required: Yes
     * 
     * - artwork_id: External API identifier for the artwork
     *   Type: String (e.g., Met Museum object ID)
     *   Required: Yes
     *   Example: "436524"
     * 
     * - title: Title of the artwork
     *   Type: String|null
     *   Max length: 255 characters
     *   Example: "The Starry Night"
     * 
     * - artist: Name of the artist
     *   Type: String|null
     *   Max length: 255 characters
     *   Example: "Vincent van Gogh"
     * 
     * - period: Art historical period or movement
     *   Type: String|null
     *   Max length: 100 characters
     *   Example: "Post-Impressionism", "Renaissance"
     * 
     * - image_url: URL to artwork image
     *   Type: String|null
     *   Max length: 500 characters
     *   Example: "https://images.metmuseum.org/..."
     * 
     * - description: Artwork description or credit line
     *   Type: String|null (text field)
     *   Example: "Oil on canvas, Gift of..."
     * 
     * - notes: User's personal notes about the artwork
     *   Type: String|null (text field)
     *   Max length: 1000 characters (validated at request level)
     *   Example: "Painted during Van Gogh's stay in Saint-Rémy..."
     * 
     * Protected Attributes (not fillable):
     * - id: Auto-increment primary key
     * - created_at: When artwork was added to collection
     * - updated_at: Last time artwork data or notes were updated
     * 
     * Usage Example:
     * ```
     * UserArtwork::create([
     *     'user_id' => auth()->id(),
     *     'artwork_id' => '436524',
     *     'title' => 'The Starry Night',
     *     'artist' => 'Vincent van Gogh',
     *     'period' => 'Post-Impressionism',
     *     'image_url' => 'https://...',
     *     'description' => 'Oil on canvas',
     *     'notes' => 'One of my favorites!'
     * ]);
     * ```
     */
    protected $fillable = [
        'user_id',
        'artwork_id',
        'title',
        'artist',
        'period',
        'image_url',
        'description',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     * 
     * Defines automatic type casting for model attributes. Laravel automatically
     * converts these attributes to the specified types when accessed.
     * 
     * @return array<string, string>
     * 
     * Cast Types:
     * 
     * - created_at => 'datetime'
     *   Converts timestamp to Carbon instance
     *   Usage: $artwork->created_at->format('M d, Y')
     *   Example: "Jan 15, 2024"
     * 
     * - updated_at => 'datetime'
     *   Converts timestamp to Carbon instance
     *   Usage: $artwork->updated_at->diffForHumans()
     *   Example: "2 hours ago"
     * 
     * Carbon Instance Methods:
     * - format(): Custom date formatting
     * - diffForHumans(): Human-readable time difference
     * - isFuture(): Check if date is in future
     * - isPast(): Check if date is in past
     * - addDays()/subDays(): Date arithmetic
     * 
     * Usage Examples:
     * ```
     * // Format dates
     * $artwork->created_at->format('Y-m-d H:i:s')
     * 
     * // Human-readable time
     * "Added " . $artwork->created_at->diffForHumans()
     * // Output: "Added 3 days ago"
     * 
     * // Date comparison
     * if ($artwork->updated_at->greaterThan($artwork->created_at)) {
     *     echo "Notes have been updated";
     * }
     * ```
     * 
     * @see https://carbon.nesbot.com/docs/
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the artwork.
     * 
     * Defines the inverse of the one-to-many relationship between User and UserArtwork.
     * This allows easy access to the user who saved the artwork.
     * 
     * Relationship Type: BelongsTo (Many-to-One)
     * - Many artworks can belong to one user
     * - Each artwork belongs to exactly one user
     * 
     * @return BelongsTo The Eloquent relationship instance
     * 
     * Foreign Key: user_id
     * Related Model: \App\Models\User
     * 
     * Usage Examples:
     * ```
     * // Access user from artwork
     * $artwork = UserArtwork::find(1);
     * echo $artwork->user->name; // "John Doe"
     * 
     * // Eager load user with artworks
     * $artworks = UserArtwork::with('user')->get();
     * 
     * // Query with relationship
     * $artworks = UserArtwork::whereHas('user', function ($query) {
     *     $query->where('is_verified', true);
     * })->get();
     * 
     * // Count user's artworks
     * $user->artworks()->count();
     * ```
     * 
     * Inverse Relationship (on User model):
     * ```
     * public function artworks(): HasMany
     * {
     *     return $this->hasMany(UserArtwork::class);
     * }
     * ```
     * 
     * Database Structure:
     * - user_artworks.user_id (foreign key)
     * - users.id (primary key)
     * 
     * Eager Loading:
     * ```
     * // Avoid N+1 query problem
     * $artworks = UserArtwork::with('user')->get();
     * // Single query to load all users
     * 
     * // Without eager loading (N+1 problem)
     * $artworks = UserArtwork::all();
     * foreach ($artworks as $artwork) {
     *     echo $artwork->user->name; // Separate query for each!
     * }
     * ```
     * 
     * @see \App\Models\User
     * @see https://laravel.com/docs/eloquent-relationships#one-to-many-inverse
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
