import { Link } from '@inertiajs/react';

/**
 * NavLink Component
 * 
 * Navigation link with active state styling for main navigation.
 * Uses Inertia.js Link for SPA navigation without full page reloads.
 * 
 * Features:
 * - Active state highlighting
 * - Smooth transitions
 * - Inertia.js integration
 * - Customizable styling
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.active=false] - Whether link is currently active
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {ReactNode} props.children - Link content
 * @param {...any} props - Additional Inertia Link props (href, method, etc.)
 * 
 * @example
 * // Basic navigation
 * <NavLink href="/dashboard" active={route().current('dashboard')}>
 *   Dashboard
 * </NavLink>
 * 
 * @example
 * // In a navigation menu
 * <nav className="flex space-x-4">
 *   <NavLink href="/home" active={route().current('home')}>Home</NavLink>
 *   <NavLink href="/about" active={route().current('about')}>About</NavLink>
 *   <NavLink href="/contact" active={route().current('contact')}>Contact</NavLink>
 * </nav>
 * 
 * @example
 * // With custom styling
 * <NavLink 
 *   href="/profile" 
 *   active={true}
 *   className="text-lg"
 * >
 *   Profile
 * </NavLink>
 */
export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
