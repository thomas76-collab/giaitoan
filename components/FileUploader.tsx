
import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileUploaderProps {
    onFileChange: (file: File | null) => void;
    disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, disabled }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
            onFileChange(selectedFile);
        }
    }, [onFileChange]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if(!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };
    
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };
    
    const removeFile = () => {
        setFile(null);
        onFileChange(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    if (file) {
        return (
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                    <span className="truncate font-medium text-sm">{file.name}</span>
                </div>
                 <button onClick={removeFile} disabled={disabled} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
                </button>
            </div>
        )
    }

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex justify-center items-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
                ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'}
                ${disabled ? 'cursor-not-allowed bg-gray-200 dark:bg-gray-700' : ''}
            `}
            onClick={handleButtonClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="image/*,.pdf"
                className="hidden"
                disabled={disabled}
            />
            <div className="text-center">
                <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Tải tệp lên</span> hoặc kéo và thả
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ảnh (PNG, JPG) hoặc PDF</p>
            </div>
        </div>
    );
};

export default FileUploader;
