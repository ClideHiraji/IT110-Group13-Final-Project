<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create Cache Table Migration
 * 
 * Creates tables for database-based caching system.
 * Used when CACHE_STORE=database in config/cache.php.
 * 
 * Tables:
 * - cache: Stores cached values
 * - cache_locks: Stores cache locks for atomic operations
 * 
 * @see config/cache.php
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /**
         * Cache Table
         * 
         * Stores cached key-value pairs in database.
         * 
         * Columns:
         * - key: Cache key (primary, unique identifier)
         * - value: Serialized cached data
         * - expiration: Unix timestamp when cache expires
         * 
         * Usage:
         * ```
         * Cache::put('key', 'value', 3600); // Store for 1 hour
         * Cache::get('key'); // Retrieve
         * Cache::forget('key'); // Delete
         * ```
         */
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        /**
         * Cache Locks Table
         * 
         * Provides atomic locking mechanism for cache operations.
         * Prevents race conditions in concurrent requests.
         * 
         * Columns:
         * - key: Lock identifier (primary)
         * - owner: Process/request that owns the lock
         * - expiration: When lock expires
         * 
         * Usage:
         * ```
         * Cache::lock('process-data')->get(function () {
         *     // Only one process executes this at a time
         * });
         * ```
         */
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
