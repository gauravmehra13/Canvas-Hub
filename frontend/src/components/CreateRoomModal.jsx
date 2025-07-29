import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Lock, Users } from 'lucide-react';
import { theme, commonClasses } from '../styles/theme';

const CreateRoomModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    password: '',
    maxUsers: 10
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Room
            </Dialog.Title>
            <button
              onClick={onClose}
              className={commonClasses.iconButton + " text-gray-500"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={theme.text.label}>Room Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={theme.input.base}
                placeholder="Enter room name"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className={theme.text.label}>Max Users (2-10)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    maxUsers: Math.min(10, Math.max(2, parseInt(e.target.value) || 2))
                  })}
                  className={theme.input.base}
                  min={2}
                  max={10}
                  required
                />
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPrivate" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-4 w-4" />
                Private Room
              </label>
            </div>

            {formData.isPrivate && (
              <div>
                <label className={theme.text.label}>Room Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={theme.input.base}
                  placeholder="Enter room password"
                  required
                  minLength={6}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
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
                Create Room
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateRoomModal; 