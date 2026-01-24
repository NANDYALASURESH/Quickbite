import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ id, type = 'info', message, duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    return (
        <div
            className={`${styles[type]} rounded-lg shadow-lg p-4 mb-3 flex items-center justify-between min-w-[300px] max-w-md animate-slide-in`}
            role="alert"
        >
            <div className="flex items-center space-x-3">
                {icons[type]}
                <p className="font-medium">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="ml-4 hover:opacity-80 transition-opacity"
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
