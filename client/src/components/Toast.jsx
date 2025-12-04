import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
        <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border shadow-lg animate-fade-in-up ${styles[type] || styles.info} min-w-[280px] sm:min-w-[300px] max-w-[calc(100vw-2rem)] sm:max-w-md`}>
            <div className="flex-shrink-0">
                {icons[type] || icons.info}
            </div>
            <p className="flex-1 text-xs sm:text-sm font-medium break-words">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors flex-shrink-0">
                <X size={14} className="sm:w-4 sm:h-4 opacity-60" />
            </button>
        </div>
    );
};

export default Toast;
