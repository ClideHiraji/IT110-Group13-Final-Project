<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOtpVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->is_verified) {
            session(['otp_email' => $request->user()->email]);
            return redirect()->route('verification.notice');
        }

        return $next($request);
    }
}
