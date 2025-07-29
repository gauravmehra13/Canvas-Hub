import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Lock } from 'lucide-react';
import { theme, commonClasses } from '../styles/theme';

const JoinRoomModal = ({ onClose, onSubmit, room }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    onSubmit(password);
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Join Private Room
            </Dialog.Title>
            <button
              onClick={onClose}
              className={commonClasses.iconButton + " text-gray-500"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <Dialog.Description className={theme.text.subtitle + " mb-2"}>
            Enter password to join "{room.name}"
          </Dialog.Description>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={theme.input.base}
                  placeholder="Enter room password"
                  required
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={theme.button.secondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={theme.button.primary}
              >
                Join Room
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default JoinRoomModal; 