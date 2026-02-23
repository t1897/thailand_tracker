import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function AddEntryModal({ isOpen, onClose, initialData, onSave }: AddEntryModalProps) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    location: '',
    dateAdded: new Date().toISOString().split('T')[0],
    description: '',
    image: ''
  });

  // Reset form when opening with new data
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        name: '',
        location: '',
        dateAdded: new Date().toISOString().split('T')[0],
        description: '',
        image: ''
      });
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-surface-dark border border-surface-highlight rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <button onClick={onClose} className="text-slate-400 hover:text-white">Cancel</button>
              <h3 className="font-bold text-white">{initialData ? 'Edit Entry' : 'New Entry'}</h3>
              <button onClick={handleSave} className="text-primary font-bold">Save</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Image Upload Placeholder */}
              <div 
                className="aspect-video bg-black/20 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer overflow-hidden relative"
              >
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    <span className="text-sm font-medium">Add Photo</span>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Place Name</label>
                  <div className="flex items-center bg-black/20 rounded-xl px-3 border border-white/5 focus-within:border-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-slate-500">storefront</span>
                    <input 
                      type="text" 
                      placeholder="Name of the place" 
                      className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                  <div className="flex items-center bg-black/20 rounded-xl px-3 border border-white/5 focus-within:border-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-slate-500">location_on</span>
                    <input 
                      type="text" 
                      placeholder="Where did you go?" 
                      className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                  <div className="flex items-center bg-black/20 rounded-xl px-3 border border-white/5 focus-within:border-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-slate-500">calendar_today</span>
                    <input 
                      type="date" 
                      className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3"
                      value={formData.dateAdded}
                      onChange={(e) => setFormData({...formData, dateAdded: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea 
                    placeholder="Write about your experience..." 
                    className="w-full bg-black/20 rounded-xl p-3 border border-white/5 focus:border-primary/50 focus:ring-0 text-white placeholder-slate-500 min-h-[120px] resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
