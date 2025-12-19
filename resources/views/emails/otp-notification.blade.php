<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: linear-gradient(135deg, #1a0f00 0%, #0a0a0a 50%, #1a0800 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(251, 191, 36, 0.15);">
                    
                    <!-- Top Accent Line -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, transparent, #fbbf24, #f97316, transparent);"></td>
                    </tr>

                    <!-- Header with Logo/Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                            </div>
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td align="center" style="padding: 0 40px 20px 40px;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;">
                                Verification Code
                            </h1>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <div style="height: 1px; width: 100px; background: linear-gradient(90deg, transparent, #fbbf24, transparent);"></div>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: center;">
                                Hello! We received a request to verify your account. Use the code below to complete the process:
                            </p>
                        </td>
                    </tr>

                    <!-- OTP Code Box -->
                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <table role="presentation" style="border-collapse: collapse; background: rgba(251, 191, 36, 0.05); border: 2px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 20px;">
                                <tr>
                                    <td align="center">
                                        <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #fbbf24; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);">
                                            {{ $otpCode }}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <div style="background: rgba(251, 191, 36, 0.05); border-left: 3px solid #fbbf24; border-radius: 6px; padding: 16px 20px;">
                                <p style="margin: 0; font-size: 14px; color: #fbbf24; display: flex; align-items: center;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle; display: inline-block;">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span style="vertical-align: middle; display: inline-block;">This code will expire in <strong>10 minutes</strong></span>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #9ca3af; text-align: center;">
                                If you didn't request this code, please ignore this email or contact support if you have concerns.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent);"></div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px 40px 40px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                                            Best regards,<br>
                                            <strong style="color: #fbbf24;">ArtVault</strong>
                                        </p>
                                        <div style="margin-top: 20px;">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(251, 191, 36, 0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                        </div>
                                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
                                            Secure verification powered by {{ config('app.name') }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Bottom Accent Line -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, transparent, #fbbf24, #f97316, transparent);"></td>
                    </tr>

                </table>

                <!-- Copyright Footer -->
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 11px; color: #4b5563;">
                                This is an automated message, please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
