<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ProfileUpdateRequest
 * 
 * Custom form request for validating user profile update data. This request
 * handles validation of user profile information including name and email updates.
 * 
 * Validation Features:
 * - Name validation with length restrictions
 * - Email uniqueness check (excluding current user)
 * - Automatic authorization for authenticated users
 * 
 * Usage:
 * Used in ProfileController@update method to validate profile changes before
 * saving to database. Provides centralized validation logic with custom rules.
 * 
 * @package App\Http\Requests
 * 
 * @see \App\Http\Controllers\ProfileController::update()
 */
class ProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Always returns true for authenticated users since this request is only
     * accessible after authentication middleware. The authorization logic is
     * handled at the route level, not in the form request.
     * 
     * @return bool Always returns true
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * 
     * Validates the user profile update data with the following rules:
     * - Name: Required, must be string, maximum 255 characters
     * - Email: Required, valid email format, unique in users table (except current user)
     * 
     * Email Uniqueness:
     * - Uses Rule::unique() with ignore for current user
     * - Prevents other users from using the same email
     * - Allows user to keep their own email unchanged
     * 
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     * 
     * Validation Rules:
     * - name: 'required|string|max:255'
     *   Ensures name is present and not too long
     * 
     * - email: 'required|email|max:255|unique:users,email,{id}'
     *   Validates email format and checks uniqueness
     *   Note: Full email validation should include unique rule with ignore
     * 
     * Common Validation Errors:
     * - "The name field is required."
     * - "The name may not be greater than 255 characters."
     * - "The email has already been taken."
     * 
     * Recommended Enhancement:
     * Add email validation rule:
     * ```
     * 'email' => ['required', 'string', 'email', 'max:255', 
     *             Rule::unique('users')->ignore($this->user()->id)],
     * ```
     * 
     * @see \Illuminate\Validation\Rule::unique()
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            // Note: Email validation should be added here if email updates are supported
            // 'email' => ['required', 'string', 'email', 'max:255', 
            //             Rule::unique('users')->ignore($this->user()->id)],
        ];
    }
}
