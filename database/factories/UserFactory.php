<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * User Factory
 * 
 * Generates fake user data for testing and seeding.
 * 
 * Usage:
 * ```
 * // Create single user
 * $user = User::factory()->create();
 * 
 * // Create multiple users
 * $users = User::factory()->count(10)->create();
 * 
 * // Create unverified user
 * $user = User::factory()->unverified()->create();
 * 
 * // Create with custom data
 * $user = User::factory()->create([
 *     'email' => 'test@example.com'
 * ]);
 * ```
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     * 
     * Static property ensures same password hash used across all factory calls.
     * Improves performance by hashing once instead of for each user.
     * 
     * Default password: 'password'
     * 
     * @var string|null
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     * 
     * Generates realistic fake data for user model.
     * 
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            /**
             * name: Fake full name
             * Examples: "John Doe", "Jane Smith", "Dr. Sarah Johnson"
             */
            'name' => fake()->name(),

            /**
             * email: Unique fake email
             * Examples: "john.doe@example.com"
             * Format: Always uses safe domains like example.com
             */
            'email' => fake()->unique()->safeEmail(),

            /**
             * email_verified_at: Current timestamp
             * Makes user email-verified by default.
             * Use unverified() state to override.
             */
            'email_verified_at' => now(),

            /**
             * password: Hashed 'password'
             * 
             * Uses static property to avoid re-hashing.
             * All factory users have password: 'password'
             * 
             * Login in tests:
             * ```
             * $this->post('/login', [
             *     'email' => $user->email,
             *     'password' => 'password'
             * ]);
             * ```
             */
            'password' => static::$password ??= Hash::make('password'),

            /**
             * remember_token: Random 10-character string
             * Used for "remember me" functionality
             */
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     * 
     * State modifier that creates users without email verification.
     * 
     * Usage:
     * ```
     * $user = User::factory()->unverified()->create();
     * // $user->email_verified_at is null
     * ```
     * 
     * @return static
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
