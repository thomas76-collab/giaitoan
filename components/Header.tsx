
import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center space-x-3">
                 <BrainCircuit className="h-8 w-8 text-indigo-500" />
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white">
                    Trợ lý Giải toán THPT
                </h1>
            </div>
        </header>
    );
};

export default Header;
