import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';

/**
 * Modal Component
 * 
 * Accessible modal dialog with smooth transitions and backdrop.
 * Built using HeadlessUI for accessibility compliance.
 * 
 * Features:
 * - Smooth enter/exit animations
 * - Backdrop overlay
 * - Configurable max width
 * - Closeable or non-closeable
 * - Focus trap
 * - ESC key support
 * - Accessible (ARIA compliant)
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Modal content
 * @param {boolean} [props.show=false] - Controls modal visibility
 * @param {string} [props.maxWidth='2xl'] - Modal max width (sm, md, lg, xl, 2xl)
 * @param {boolean} [props.closeable=true] - Allow closing via backdrop/ESC
 * @param {Function} [props.onClose] - Callback when modal closes
 * 
 * @example
 * // Basic modal
 * const [showModal, setShowModal] = useState(false);
 * 
 * <Modal show={showModal} onClose={() => setShowModal(false)}>
 *   <h2>Modal Title</h2>
 *   <p>Modal content here</p>
 * </Modal>
 * 
 * @example
 * // Non-closeable modal (for important actions)
 * <Modal show={processing} closeable={false} maxWidth="sm">
 *   <Spinner />
 *   <p>Processing...</p>
 * </Modal>
 * 
 * @example
 * // Large modal with custom content
 * <Modal show={showDetails} maxWidth="2xl" onClose={handleClose}>
 *   <div className="p-6">
 *     <h2 className="text-2xl font-bold">Details</h2>
 *     <div className="mt-4">...</div>
 *     <div className="flex justify-end gap-4 mt-6">
 *       <SecondaryButton onClick={handleClose}>Close</SecondaryButton>
 *       <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
 *     </div>
 *   </div>
 * </Modal>
 */
export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`mb-6 overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full dark:bg-gray-800 ${maxWidthClass}`}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
