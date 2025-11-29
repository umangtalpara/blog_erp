import React from 'react';

const Loader = ({ size = 'medium', color = 'indigo', className = '' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4'
    };

    const colorClasses = {
        indigo: 'border-indigo-600',
        white: 'border-white',
        gray: 'border-gray-400'
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`
                    ${sizeClasses[size]} 
                    ${colorClasses[color]} 
                    border-t-transparent 
                    rounded-full 
                    animate-spin
                `}
            ></div>
        </div>
    );
};

export default Loader;
