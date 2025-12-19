<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create Jobs Table Migration
 * 
 * Creates tables for queue system when using database driver.
 * 
 * Tables:
 * - jobs: Pending jobs
 * - job_batches: Batch job tracking
 * - failed_jobs: Failed job records
 * 
 * @see config/queue.php
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /**
         * Jobs Table
         * 
         * Stores queued jobs waiting to be processed.
         * 
         * Columns:
         * - id: Job identifier
         * - queue: Queue name (default, emails, etc.)
         * - payload: Serialized job data
         * - attempts: Number of processing attempts
         * - reserved_at: When job was picked up by worker
         * - available_at: When job becomes available for processing
         * - created_at: When job was queued
         * 
         * Worker Process:
         * ```
         * php artisan queue:work
         * ```
         */
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        /**
         * Job Batches Table
         * 
         * Tracks batches of jobs for bulk operations.
         * 
         * Columns:
         * - id: Batch identifier
         * - name: Human-readable batch name
         * - total_jobs: Total jobs in batch
         * - pending_jobs: Jobs not yet processed
         * - failed_jobs: Jobs that failed
         * - failed_job_ids: IDs of failed jobs
         * - options: Batch configuration
         * - cancelled_at: If batch was cancelled
         * - created_at: Batch creation time
         * - finished_at: When batch completed
         * 
         * Usage:
         * ```
         * Bus::batch([
         *     new ProcessPodcast($podcast),
         *     new ProcessPodcast($podcast2),
         * ])->dispatch();
         * ```
         */
        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        /**
         * Failed Jobs Table
         * 
         * Stores information about jobs that failed processing.
         * 
         * Columns:
         * - id: Failed job ID
         * - uuid: Unique identifier
         * - connection: Queue connection used
         * - queue: Queue name
         * - payload: Job data
         * - exception: Error message and stack trace
         * - failed_at: When job failed
         * 
         * Retry Failed Job:
         * ```
         * php artisan queue:retry {id}
         * php artisan queue:retry all
         * ```
         * 
         * Clear Failed Jobs:
         * ```
         * php artisan queue:flush
         * ```
         */
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('failed_jobs');
    }
};
