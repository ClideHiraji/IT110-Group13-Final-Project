# System Overview

This document provides a concise architecture map of the application, covering frontend (React + Inertia) and backend (Laravel), the key files that implement each capability, and the main security/authentication flows.

## Frontend

- Entry and Bootstrapping
  - `resources/views/app.blade.php`: Inertia root view rendered by Laravel.
  - `resources/js/app.jsx`: Frontend entry point that initializes Inertia and mounts the React app.
  - `resources/js/bootstrap.js`: Axios and common client setup.
  - `resources/js/ziggy.js`: Client-side route helper for Laravel routes.

- Pages (Inertia)
  - `resources/js/Pages/Home.jsx`: Public landing page.
  - `resources/js/Pages/Dashboard.jsx`: Authenticated dashboard.
  - `resources/js/Pages/Timeline.jsx`: Timeline experience; protected by auth middleware.
  - `resources/js/Pages/Collection.jsx`: User collection page; CRUD via backend API.
  - `resources/js/Pages/Profile/Edit.jsx`: Profile settings, 2FA controls, password update.
  - Auth pages:
    - `resources/js/Pages/Auth/Login.jsx`, `Register.jsx`
    - `resources/js/Pages/Auth/VerifyOtp.jsx` (registration OTP)
    - `resources/js/Pages/Auth/TwoFactorChallenge.jsx` (login 2FA)
    - `resources/js/Pages/Auth/ForgotPasswordEmail.jsx`, `ResetPasswordOtp.jsx`, `ResetPasswordForm.jsx`
    - `resources/js/Pages/Auth/VerificationSuccess.jsx`

- Layouts
  - `resources/js/Layouts/AppLayout.jsx`: Base app layout shell.
  - `resources/js/Layouts/AuthenticatedLayout.jsx`: Wraps authenticated pages.
  - `resources/js/Layouts/GuestLayout.jsx`: Wraps guest pages.

- Shared Components
  - `resources/js/Components/Header.jsx`: Unified header with `Collection`, `Dashboard`, `Timeline`, and auth actions (login/register or username + logout).
  - `resources/js/Components/TextInput.jsx`: Dark input (`bg-black`) with gold text and placeholders; disabled styles enforced.
  - `resources/js/Components/PrimaryButton.jsx`: Amber→orange gradient button used for primary actions.
  - `resources/js/Components/Modal.jsx`, `DangerButton.jsx`, `SecondaryButton.jsx`: Dialog and button variants.
  - `resources/js/Components/InputLabel.jsx`, `InputError.jsx`: Form utilities.
  - `resources/js/Components/PasswordStrengthIndicator.jsx`, `PasswordMatchIndicator.jsx`: Password UX helpers.
  - Timeline visuals: `resources/js/Components/Timeline/*` (carousel, chapters, artwork modal, progress).

- Profile Forms
  - `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx`: Updates name; shows locked email (read-only, disabled) with username placeholder.
  - `resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx`: Current/new/confirm password; requires OTP when 2FA enabled; includes resend code.
  - `resources/js/Pages/Profile/Partials/DeleteUserForm.jsx`: Account delete confirmation modal with password check.

- Styling and Build
  - `tailwind.config.js`: Tailwind config; includes form plugin and custom colors (`cinematic-offwhite`, `accent-icy`, `accent-amber`).
  - `resources/css/app.css`: Global styles.
  - `postcss.config.js`, `vite.config.js`: Build pipeline.
  - `package.json` scripts: `dev` (Vite), `build` (Vite).

## Backend

- Routes
  - `routes/web.php`: Public home and Met API proxy; authenticated routes for dashboard, timeline, profile, and collection.
  - `routes/auth.php`: Guest routes for registration/login and OTP verification; auth routes for 2FA challenge/verify/resend, password update, and logout.

- Controllers (Core)
  - `app/Http/Controllers/ProfileController.php`: Profile edit/update/destroy and 2FA enable/disable endpoints.
  - `app/Http/Controllers/CollectionController.php`: Collection page and API (list, store, note update, delete, check saved).
  - `app/Http/Controllers/TimelineController.php`: Timeline data and rendering support.
  - `app/Http/Controllers/MetMuseumController.php`: Server-side proxy to Met Museum API (object, search, period, batch).

- Controllers (Auth)
  - `app/Http/Controllers/Auth/AuthenticatedSessionController.php`: Login/logout session management.
  - `app/Http/Controllers/Auth/RegisteredUserController.php`: Registration; seeds session data for OTP verification.
  - `app/Http/Controllers/Auth/OtpVerificationController.php`: Registration OTP `show/verify/resend` and optional success page.
  - `app/Http/Controllers/Auth/TwoFactorAuthController.php` (class `TwoFactorController`): 2FA challenge `show/verify/resend` for login and sensitive flows.
  - `app/Http/Controllers/Auth/PasswordResetOtpController.php`: Password reset via email + OTP stages (request, verify, resend, reset form).
  - `app/Http/Controllers/Auth/PasswordController.php`: Authenticated password update, enforces current password and OTP when 2FA enabled.

- Middleware
  - `app/Http/Middleware/Authenticate.php`: Standard auth gate.
  - `app/Http/Middleware/EnsureOtpVerified.php`: Blocks access until the account is OTP/email verified; redirects or returns JSON.
  - `app/Http/Middleware/HandleInertiaRequests.php`: Inertia shared props and request handling.

- Requests
  - `app/Http/Requests/ProfileUpdateRequest.php`: Validates profile updates; `name` only, effectively locks email changes server-side.
  - `app/Http/Requests/Auth/LoginRequest.php`: Validates login.

- Models
  - `app/Models/User.php`: User fields, casts, OTP lifecycle (`generateOtp`, `verifyOtp`, `clearOtp`), 2FA flags and confirmation tracking.
  - `app/Models/UserArtwork.php`: Saved artworks with optional notes for collection feature.

- Notifications
  - `app/Notifications/SendOtpNotification.php`: Email delivery of 6-digit OTP codes for registration, 2FA, and password reset.

- Database
  - `database/migrations/*`: Users table and cache/jobs; plus custom:
    - `add_otp_and_2fa_fields_to_users_table.php`: Adds OTP and 2FA columns to `users`.
    - `create_user_artworks_table.php`: Stores user-saved artworks and notes.
  - `database/factories/UserFactory.php`, `database/seeders/DatabaseSeeder.php`: Test/data seeding.

## Key Workflows

- Registration with OTP
  - User submits register form; server stores registration data and OTP in session; email OTP sent.
  - User enters OTP on `VerifyOtp` page; server verifies and creates the account, auto-logging in.
  - Files: `RegisteredUserController.php`, `OtpVerificationController.php`, `SendOtpNotification.php`, `routes/auth.php`.

- Login with 2FA (optional)
  - If 2FA enabled, user is routed to `TwoFactorChallenge` to enter OTP; success logs in and clears OTP.
  - Files: `TwoFactorAuthController.php` (`TwoFactorController`), `routes/auth.php`, `User::verifyOtp`, `User::clearOtp`.

- Password Update with 2FA
  - Requires `current_password`; if 2FA enabled, also requires 6-digit OTP. On success, OTP cleared and password updated.
  - Files: `PasswordController.php`, `UpdatePasswordForm.jsx`, `routes/auth.php`.

- Profile Update and Email Lock
  - Frontend shows email as read-only with username placeholder; server only accepts `name`.
  - Files: `UpdateProfileInformationForm.jsx`, `ProfileUpdateRequest.php`, `ProfileController.php`.

- Collection CRUD
  - Save/remove artworks, update notes, list/check saved via `/api/collection` endpoints.
  - Files: `CollectionController.php`, `UserArtwork.php`, `routes/web.php`, `Pages/Collection.jsx`.

- Met Museum API
  - Frontend calls backend proxy for object, search, period, and batch fetch to avoid CORS/rate limiting issues.
  - Files: `MetMuseumController.php`, `resources/js/lib/metMuseum.js`, `routes/web.php`.

## Theme and UI Conventions

- Color Scheme
  - Dark surface (`bg-black`) with gold accents (`text-amber-300/400`) and amber→orange gradients for primary actions.
  - Inputs enforce disabled state styles to avoid default white background.

- Header
  - Consistent across authenticated pages; username links to profile; logout is a `POST` route.

- Forms
  - `TextInput` centralizes input styles; `PrimaryButton` centralizes primary CTA styling.
  - Password UX includes strength and match indicators plus show/hide toggles.

## Testing

- `tests/Feature/*`: Feature tests for auth, registration, password reset/update, and profile.
- Run via `phpunit` (Laravel default). Ensure `.env` and database configuration are set for testing.

## Development

- Start dev server: `npm run dev` and Laravel `php artisan serve`.
- Build assets: `npm run build`.

