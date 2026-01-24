import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({
    onImageSelect,
    currentImage = null,
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
    const [preview, setPreview] = useState(currentImage);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        if (!acceptedFormats.includes(file.type)) {
            setError('Invalid file format. Please upload JPG, PNG, or WebP');
            return false;
        }
        if (file.size > maxSize) {
            setError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
            return false;
        }
        setError('');
        return true;
    };

    const handleFileSelect = (file) => {
        if (!file || !validateFile(file)) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            if (onImageSelect) {
                onImageSelect(file, reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = () => {
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onImageSelect) {
            onImageSelect(null, null);
        }
    };

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                        aria-label="Remove image"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFormats.join(',')}
                        onChange={handleChange}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-3">
                        {isDragging ? (
                            <Upload className="text-orange-500" size={48} />
                        ) : (
                            <ImageIcon className="text-gray-400" size={48} />
                        )}
                        <div>
                            <p className="text-gray-700 font-medium">
                                {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                JPG, PNG or WebP (max {maxSize / (1024 * 1024)}MB)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
