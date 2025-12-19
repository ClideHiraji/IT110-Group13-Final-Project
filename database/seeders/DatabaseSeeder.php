<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Database Seeder
 * 
 * Main seeder class that runs all database seeders.
 * Populates database with initial or test data.
 * 
 * Run Seeder:
 * ```
 * # Run all seeders
 * php artisan db:seed
 * 
 * # Run specific seeder
 * php artisan db:seed --class=UserSeeder
 * 
 * # Fresh migration with seeding
 * php artisan migrate:fresh --seed
 * ```
 * 
 * @see https://laravel.com/docs/seeding
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * Creates test user for development.
     * Add more seeders here for other models.
     */
    public function run(): void
    {
        /**
         * Create Test User
         * 
         * Creates a user with fixed email for consistent testing.
         * Useful for development environment login.
         * 
         * Login Credentials:
         * - Email: test@example.com
         * - Password: password
         * 
         * Usage in Development:
         * 1. Run: php artisan migrate:fresh --seed
         * 2. Visit login page
         * 3. Enter test@example.com / password
         * 4. Access application
         * 
         * Remove in Production:
         * Don't run seeders in production unless needed for
         * initial data (admin accounts, settings, etc.)
         */
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        /**
         * Additional Seeding Examples:
         * 
         * // Create multiple users
         * User::factory()->count(50)->create();
         * 
         * // Call other seeders
         * $this->call([
         *     RoleSeeder::class,
         *     CategorySeeder::class,
         *     ProductSeeder::class,
         * ]);
         * 
         * // Create with relationships
         * User::factory()
         *     ->count(10)
         *     ->has(UserArtwork::factory()->count(5))
         *     ->create();
         */
    }
}
