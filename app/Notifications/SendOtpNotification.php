<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * SendOtpNotification
 * 
 * Notification for sending OTP (One-Time Password) codes via email. Used for
 * account verification, password reset, and two-factor authentication.
 * 
 * Features:
 * - Sends 6-digit OTP via email
 * - Custom email view with branding
 * - Queueable for better performance
 * - Supports multiple use cases (registration, 2FA, password reset)
 * 
 * Email Content:
 * - Subject line with app name
 * - Custom view template
 * - OTP code prominently displayed
 * - Expiration notice (10 minutes)
 * - Security warning
 * 
 * Queueable:
 * - Can be dispatched to queue for async sending
 * - Improves response times for users
 * - Prevents email sending delays
 * 
 * @package App\Notifications
 * 
 * @see \App\Models\User::generateOtp()
 * @see resources/views/emails/otp-notification.blade.php
 */
class SendOtpNotification extends Notification
{
    use Queueable;

    /**
     * The OTP code to send.
     * 
     * @var string 6-digit OTP code
     */
    private string $otpCode;

    /**
     * Create a new notification instance.
     * 
     * Initializes the notification with the OTP code that will be sent to the user.
     * 
     * @param string $otpCode The 6-digit OTP code to send
     * 
     * Usage Example:
     * ```
     * // Generate OTP
     * $otp = $user->generateOtp();
     * 
     * // Send notification
     * $user->notify(new SendOtpNotification($otp));
     * 
     * // Or use Notification facade for on-demand notifications
     * Notification::route('mail', 'user@example.com')
     *     ->notify(new SendOtpNotification($otp));
     * ```
     */
    public function __construct(string $otpCode)
    {
        $this->otpCode = $otpCode;
    }

    /**
     * Get the notification's delivery channels.
     * 
     * Specifies which channels should be used to deliver the notification.
     * Currently only uses email channel, but can be extended to support SMS,
     * Slack, database notifications, etc.
     * 
     * @param mixed $notifiable The entity receiving the notification (usually User)
     * 
     * @return array<int, string> Array of channel names
     * 
     * Available Channels:
     * - 'mail': Email notification
     * - 'database': Store in notifications table
     * - 'broadcast': Real-time via WebSockets
     * - 'nexmo': SMS via Nexmo/Vonage
     * - 'slack': Slack channel message
     * - Custom channels
     * 
     * Multi-Channel Example:
     * ```
     * public function via($notifiable)
     * {
     *     $channels = ['mail'];
     *     
     *     // Add SMS for high-security users
     *     if ($notifiable->two_factor_enabled) {
     *         $channels[] = 'nexmo';
     *     }
     *     
     *     return $channels;
     * }
     * ```
     * 
     * @see https://laravel.com/docs/notifications#specifying-delivery-channels
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     * 
     * Builds the email message that will be sent to the user. Uses a custom
     * view template for consistent branding and styling.
     * 
     * Email Structure:
     * - Subject: "🔐 Your Verification Code - {App Name}"
     * - View: resources/views/emails/otp-notification.blade.php
     * - Data: OTP code passed to view
     * 
     * @param mixed $notifiable The entity receiving the notification (usually User)
     * 
     * @return \Illuminate\Notifications\Messages\MailMessage
     * 
     * Email Properties:
     * - subject(): Email subject line
     * - view(): Custom blade view template
     * - Data: Variables accessible in view
     * 
     * View Template (otp-notification.blade.php):
     * ```
     * <!DOCTYPE html>
     * <html>
     * <head>
     *     <title>Verification Code</title>
     * </head>
     * <body>
     *     <h1>Your Verification Code</h1>
     *     <p>Your verification code is:</p>
     *     <h2 style="font-size: 32px; letter-spacing: 8px;">{{ $otpCode }}</h2>
     *     <p>This code will expire in 10 minutes.</p>
     *     <p>If you didn't request this code, please ignore this email.</p>
     * </body>
     * </html>
     * ```
     * 
     * Alternative Markdown Approach:
     * ```
     * return (new MailMessage)
     *     ->subject('🔐 Your Verification Code')
     *     ->greeting('Hello!')
     *     ->line('Your verification code is:')
     *     ->line('**' . $this->otpCode . '**')
     *     ->line('This code will expire in 10 minutes.')
     *     ->line('If you didn\'t request this code, please ignore this email.');
     * ```
     * 
     * Customization Options:
     * ```
     * return (new MailMessage)
     *     ->subject('🔐 Your Verification Code - ' . config('app.name'))
     *     ->from('noreply@example.com', 'Security Team')
     *     ->replyTo('support@example.com')
     *     ->priority(1) // High priority
     *     ->view('emails.otp-notification', [
     *         'otpCode' => $this->otpCode,
     *         'expiresIn' => 10, // minutes
     *         'userName' => $notifiable->name,
     *     ]);
     * ```
     * 
     * Queued Sending:
     * If using Queueable trait (already included):
     * ```
     * // Notification automatically queued
     * $user->notify(new SendOtpNotification($otp));
     * 
     * // Specify queue connection/name
     * $notification = new SendOtpNotification($otp);
     * $notification->onQueue('emails');
     * $user->notify($notification);
     * ```
     * 
     * Testing:
     * ```
     * // In tests
     * Notification::fake();
     * 
     * $user->notify(new SendOtpNotification('123456'));
     * 
     * Notification::assertSentTo(
     *     $user,
     *     SendOtpNotification::class,
     *     function ($notification) {
     *         return $notification->otpCode === '123456';
     *     }
     * );
     * ```
     * 
     * @see https://laravel.com/docs/notifications#mail-notifications
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            // Email subject with emoji and app name
            ->subject('🔐 Your Verification Code - ' . config('app.name'))
            
            // Use custom view for consistent branding
            // View receives $otpCode variable
            ->view('emails.otp-notification', [
                'otpCode' => $this->otpCode,
            ]);
    }
}
