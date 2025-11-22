
import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  aspectRatio: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, error, aspectRatio }) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ai_anchor_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAspectRatioClass = (ratio: string): string => {
    switch (ratio) {
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      default: return 'aspect-[16/9]';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
          <p className="mt-4 text-lg font-semibold text-gray-300">Đang tạo hình ảnh MC AI...</p>
          <p className="text-gray-400 mt-1">Quá trình này có thể mất một vài giây.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-lg font-semibold text-red-300">Lỗi tạo ảnh</p>
          <p className="text-red-400 mt-1">{error}</p>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div className="relative group w-full h-full">
          <img src={imageUrl} alt="Generated AI Anchor" className="w-full h-full object-contain rounded-lg shadow-lg shadow-cyan-500/20 animate-breathing" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <button 
              onClick={handleDownload}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition-transform transform group-hover:scale-100 scale-90"
            >
              <i className="fas fa-download mr-2"></i>
              Tải xuống
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <i className="fas fa-camera-retro text-6xl text-gray-600 mb-4"></i>
        <p className="text-lg font-semibold text-gray-400">Hình ảnh MC AI của bạn sẽ xuất hiện ở đây</p>
        <p className="text-gray-500 mt-1">Hãy tùy chỉnh các thông số và nhấn "Tạo ảnh MC".</p>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-700 p-2 min-h-[300px] lg:min-h-0 ${getAspectRatioClass(aspectRatio)}`}>
      {renderContent()}
    </div>
  );
};

export default ImageDisplay;