
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="fas fa-robot text-3xl text-cyan-400"></i>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Trình tạo MC AI</h1>
            <p className="text-xs md:text-sm text-gray-400">Tạo ảnh MC chuyên nghiệp cho truyền hình AI</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
