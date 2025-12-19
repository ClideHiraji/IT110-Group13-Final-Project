/**
 * ApplicationLogo Component
 * 
 * SVG logo component for the application.
 * Displays the ArtVault brand logo with consistent styling.
 * 
 * Features:
 * - Scalable SVG
 * - Customizable via className
 * - Responsive sizing
 * - Brand consistency
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes
 * 
 * Usage:
 * Typically used in:
 * - Navigation headers
 * - Login/register pages
 * - Email templates
 * - Loading screens
 * 
 * @example
 * // In header
 * <Link href="/">
 *   <ApplicationLogo className="h-10 w-10" />
 * </Link>
 * 
 * @example
 * // In auth pages
 * <div className="flex justify-center mb-6">
 *   <ApplicationLogo className="h-20 w-20" />
 * </div>
 * 
 * @example
 * // Different sizes
 * <ApplicationLogo className="h-6 w-6" /> // Small
 * <ApplicationLogo className="h-12 w-12" /> // Medium
 * <ApplicationLogo className="h-24 w-24" /> // Large
 */
export default function ApplicationLogo({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            {/* Logo SVG Path */}
            <path d="M50 10 L90 90 L10 90 Z" />
            {/* Add your actual logo SVG paths here */}
        </svg>
    );
}
