<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'otp_code',
        'otp_expires_at',
        'is_verified',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'otp_expires_at' => 'datetime',
        ];
    }

    /**
     * Generate and store OTP for the user.
     */
    public function generateOtp(): string
    {
        $this->otp_code = (string) rand(100000, 999999);
        $this->otp_expires_at = now()->addMinutes(10);
        $this->save();
        
        return $this->otp_code;
    }

    /**
     * Verify if the provided OTP is valid.
     */
    public function verifyOtp(string $code): bool
    {
        return $this->otp_code === $code && 
               $this->otp_expires_at !== null && 
               $this->otp_expires_at->isFuture();
    }

    /**
     * Clear OTP from user record.
     */
    public function clearOtp(): void
    {
        $this->update([
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);
    }

    /**
     * Check if user has enabled and confirmed 2FA.
     */
    public function hasEnabledTwoFactorAuthentication(): bool
    {
        return $this->two_factor_enabled && 
               $this->two_factor_confirmed_at !== null;
    }
}
