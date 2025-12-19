<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create Users Table Migration
 * 
 * Creates core authentication tables:
 * - users: User accounts
 * - password_reset_tokens: Password reset tracking
 * - sessions: User sessions
 * 
 * @see \App\Models\User
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates three tables for user authentication and session management.
     */
    public function up(): void
    {
        /**
         * Users Table
         * 
         * Stores user account information.
         * 
         * Columns:
         * - id: Auto-increment primary key
         * - name: User's full name
         * - email: Unique email address
         * - email_verified_at: Email verification timestamp
         * - password: Hashed password (bcrypt)
         * - remember_token: For "remember me" functionality
         * - timestamps: created_at, updated_at
         */
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        /**
         * Password Reset Tokens Table
         * 
         * Stores password reset tokens temporarily.
         * 
         * Columns:
         * - email: User's email (primary key)
         * - token: Hashed reset token
         * - created_at: Token creation timestamp
         * 
         * Note: Tokens expire after 60 minutes (configurable in auth.php)
         */
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        /**
         * Sessions Table
         * 
         * Stores user session data (when using database session driver).
         * 
         * Columns:
         * - id: Session ID (primary key)
         * - user_id: Foreign key to users table (nullable for guests)
         * - ip_address: User's IP address
         * - user_agent: Browser user agent string
         * - payload: Serialized session data
         * - last_activity: Unix timestamp of last activity
         */
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Drops all authentication tables.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
