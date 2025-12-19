/**
 * DangerButton Component
 * 
 * Destructive action button for delete, remove, or dangerous operations.
 * Uses red color scheme to indicate caution.
 * 
 * Features:
 * - Red color scheme indicating danger
 * - Disabled state styling
 * - Hover and focus states
 * - Should prompt confirmation before action
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {ReactNode} props.children - Button content
 * @param {...any} props - Additional HTML button attributes
 * 
 * @example
 * // Delete button
 * <DangerButton onClick={handleDelete}>
 *   Delete Account
 * </DangerButton>
 * 
 * @example
 * // With confirmation
 * <DangerButton 
 *   onClick={() => {
 *     if (confirm('Are you sure?')) {
 *       handleDelete();
 *     }
 *   }}
 * >
 *   Remove Item
 * </DangerButton>
 * 
 * @example
 * // In a modal
 * <Modal show={confirmDelete}>
 *   <p>Are you sure you want to delete this?</p>
 *   <div className="flex gap-4 mt-4">
 *     <SecondaryButton onClick={() => setConfirmDelete(false)}>
 *       Cancel
 *     </SecondaryButton>
 *     <DangerButton onClick={confirmDeleteAction}>
 *       Delete
 *     </DangerButton>
 *   </div>
 * </Modal>
 */
export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={`inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 dark:focus:ring-offset-gray-800 ${disabled && 'opacity-25'} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
