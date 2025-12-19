import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * TextInput Component
 * 
 * Customizable text input with auto-focus capability and ref forwarding.
 * Provides consistent styling across all form inputs in the application.
 * 
 * Features:
 * - Auto-focus support via isFocused prop
 * - Ref forwarding for programmatic control
 * - Dark mode support
 * - Consistent styling across app
 * - Supports all standard HTML input types
 * 
 * Ref Methods:
 * - focus(): Programmatically focus the input
 * 
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type (text, email, password, etc.)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.isFocused=false] - Auto-focus on mount
 * @param {...any} props - Additional HTML input attributes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * @example
 * // Basic usage
 * <TextInput type="email" placeholder="Enter email" />
 * 
 * @example
 * // With auto-focus
 * <TextInput isFocused={true} type="text" />
 * 
 * @example
 * // With ref for programmatic control
 * const inputRef = useRef();
 * <TextInput ref={inputRef} type="text" />
 * // Later: inputRef.current.focus();
 * 
 * @example
 * // In a form with validation
 * <TextInput
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   className={errors.password ? 'border-red-500' : ''}
 * />
 */
export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    // Auto-focus on mount if isFocused is true
    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 ${className}`}
            ref={localRef}
        />
    );
});
