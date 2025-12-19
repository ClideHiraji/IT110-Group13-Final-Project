/**
 * PrimaryButton Component
 * 
 * Primary action button with consistent styling and states.
 * Used for main call-to-action buttons throughout the application.
 * 
 * Features:
 * - Indigo/blue primary color scheme
 * - Disabled state with reduced opacity
 * - Hover and focus states
 * - Transition animations
 * - Accessible button implementation
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {ReactNode} props.children - Button content
 * @param {...any} props - Additional HTML button attributes
 * 
 * @example
 * // Basic submit button
 * <PrimaryButton type="submit">
 *   Save Changes
 * </PrimaryButton>
 * 
 * @example
 * // With loading state
 * <PrimaryButton disabled={processing}>
 *   {processing ? 'Saving...' : 'Save'}
 * </PrimaryButton>
 * 
 * @example
 * // With icon
 * <PrimaryButton onClick={handleSubmit}>
 *   <CheckIcon className="w-4 h-4 mr-2" />
 *   Confirm
 * </PrimaryButton>
 */
export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={`inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:bg-indigo-700 dark:focus:ring-offset-gray-800 dark:active:bg-indigo-900 ${disabled && 'opacity-25'} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
