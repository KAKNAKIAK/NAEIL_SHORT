
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-gray-700/50">
      <div className="container mx-auto px-4 flex justify-center items-center">
        <SparklesIcon className="w-8 h-8 text-purple-400 mr-3" />
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          내일이의 모험 스토리
        </h1>
      </div>
    </header>
  );
};

export default Header;