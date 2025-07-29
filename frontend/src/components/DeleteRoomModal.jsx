import { Dialog } from '@headlessui/react';
import { theme } from '../styles/theme';
import { AlertTriangle } from 'lucide-react';

const DeleteRoomModal = ({ isOpen, onClose, onConfirm, roomName }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={theme.card.base + " w-full max-w-md"}>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <Dialog.Title className={theme.text.title}>
                  Delete Room
                </Dialog.Title>
                <Dialog.Description className={theme.text.subtitle}>
                  Are you sure you want to delete "{roomName}"? This action cannot be undone.
                </Dialog.Description>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className={theme.button.secondary}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={theme.button.danger}
              >
                Delete Room
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeleteRoomModal; 