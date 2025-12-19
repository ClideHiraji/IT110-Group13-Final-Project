/**
 * InputError Component
 * 
 * Displays validation error messages below form inputs.
 * Conditionally renders only when an error message exists.
 * 
 * Features:
 * - Conditional rendering
 * - Consistent error styling
 * - Accessible error messaging
 * - Customizable styling
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message] - Error message to display
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {...any} props - Additional HTML paragraph attributes
 * 
 * @example
 * // Basic usage
 * <InputError message={errors.email} />
 * 
 * @example
 * // With custom styling
 * <InputError 
 *   message="Password must be at least 8 characters" 
 *   className="mt-3 font-bold"
 * />
 * 
 * @example
 * // In a form field
 * <div>
 *   <InputLabel htmlFor="email" value="Email" />
 *   <TextInput id="email" value={data.email} onChange={...} />
 *   <InputError message={errors.email} />
 * </div>
 */
export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
            {message}
        </p>
    ) : null;
}
