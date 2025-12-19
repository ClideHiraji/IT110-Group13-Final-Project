/**
 * InputLabel Component
 * 
 * Reusable form label component with consistent styling.
 * Used with form inputs to provide accessible labels.
 * 
 * Features:
 * - Consistent typography and spacing
 * - Accessible label association
 * - Customizable via className prop
 * - Supports both value prop and children
 * 
 * @param {Object} props - Component props
 * @param {string} [props.value] - Label text (alternative to children)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {ReactNode} [props.children] - Label content
 * @param {...any} props - Additional HTML label attributes
 * 
 * @example
 * // Using value prop
 * <InputLabel htmlFor="email" value="Email Address" />
 * 
 * @example
 * // Using children
 * <InputLabel htmlFor="password">
 *   Password <span className="text-red-500">*</span>
 * </InputLabel>
 * 
 * @example
 * // With custom styling
 * <InputLabel className="text-lg font-bold" value="Username" />
 */
export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
        >
            {value ? value : children}
        </label>
    );
}
