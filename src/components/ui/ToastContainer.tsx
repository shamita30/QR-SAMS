import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Loader2, X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let colorClass = 'text-white border-white/20 bg-white/5';
          
          if (toast.type === 'SUCCESS') {
            Icon = CheckCircle2;
            colorClass = 'text-accent border-accent/20 bg-accent/5';
          } else if (toast.type === 'ERROR') {
            Icon = AlertCircle;
            colorClass = 'text-red-400 border-red-500/20 bg-red-500/5';
          } else if (toast.type === 'LOADING') {
            Icon = Loader2;
            colorClass = 'text-primary border-primary/20 bg-primary/5';
          } else if (toast.type === 'INFO') {
            Icon = Info;
            colorClass = 'text-secondary border-secondary/20 bg-secondary/5';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl pointer-events-auto ${colorClass} min-w-[280px] max-w-sm`}
            >
              <Icon className={toast.type === 'LOADING' ? 'animate-spin' : ''} size={20} />
              <p className="text-sm font-medium flex-1 mr-4">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
