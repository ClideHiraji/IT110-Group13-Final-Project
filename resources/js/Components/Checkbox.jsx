/**
 * Checkbox Component
 * 
 * Styled checkbox input with consistent appearance across the application.
 * Used for boolean selections and agreements.
 * 
 * Features:
 * - Consistent checkbox styling
 * - Dark mode support
 * - Accessible checkbox implementation
 * - Customizable via className
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {...any} props - Additional HTML input attributes
 * 
 * @example
 * // Basic checkbox
 * <Checkbox 
 *   checked={rememberMe} 
 *   onChange={(e) => setRememberMe(e.target.checked)}
 * />
 * 
 * @example
 * // With label
 * <label className="flex items-center">
 *   <Checkbox name="remember" checked={data.remember} onChange={...} />
 *   <span className="ml-2">Remember me</span>
 * </label>
 * 
 * @example
 * // Terms and conditions
 * <label className="flex items-start">
 *   <Checkbox required />
 *   <span className="ml-2">
 *     I agree to the <Link href="/terms">Terms of Service</Link>
 *   </span>
 * </label>
 */
export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={`rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800 ${className}`}
        />
    );
}
