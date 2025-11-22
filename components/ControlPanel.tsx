import React, { useRef, useState, useEffect } from 'react';
import type { AnchorOptions, FaceImage, Template } from '../types';

interface ControlPanelProps {
  options: AnchorOptions;
  setOptions: React.Dispatch<React.SetStateAction<AnchorOptions>>;
  onGenerate: () => void;
  isLoading: boolean;
  faceImage: FaceImage | null;
  setFaceImage: React.Dispatch<React.SetStateAction<FaceImage | null>>;
  templates: Template[];
  onLoadTemplate: (name: string) => void;
  onSaveTemplate: () => void;
  onDeleteTemplate: (name: string) => void;
  predefinedTemplateNames: string[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  options, setOptions, onGenerate, isLoading, faceImage, setFaceImage,
  templates, onLoadTemplate, onSaveTemplate, onDeleteTemplate, predefinedTemplateNames 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    // If the options no longer match any template, reset the dropdown.
    // This handles the case where a user modifies a loaded template.
    const currentOptionsString = JSON.stringify(options);
    const matchingTemplate = templates.find(t => JSON.stringify(t.options) === currentOptionsString);
    setSelectedTemplate(matchingTemplate ? matchingTemplate.name : '');
  }, [options, templates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    if (templateName) {
      onLoadTemplate(templateName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
          setFaceImage({ base64: base64String, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  const isPredefinedSelected = predefinedTemplateNames.includes(selectedTemplate);

  const OptionSelect: React.FC<{ label: string; name: keyof AnchorOptions; value: string; options: string[]; icon: string; description?: string; }> = ({ label, name, value, options, icon, description }) => (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
        <i className={`fas ${icon} w-5 text-center mr-2 text-cyan-400`}></i>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-lg font-semibold text-white">Tùy chỉnh MC AI của bạn</h2>
      
      <div className="bg-gray-900/50 p-4 rounded-lg space-y-3 border border-gray-700">
        <h3 className="text-md font-semibold text-white flex items-center">
            <i className="fas fa-bookmark mr-2 text-cyan-400"></i>
            Quản lý Mẫu
        </h3>
        <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        >
            <option value="">-- Chọn Mẫu --</option>
            {templates.map(template => (
                <option key={template.name} value={template.name}>{template.name}</option>
            ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
            <button onClick={onSaveTemplate} className="flex items-center justify-center text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-md transition">
                <i className="fas fa-save mr-2"></i>
                Lưu Mẫu
            </button>
            <button 
              onClick={() => onDeleteTemplate(selectedTemplate)} 
              disabled={!selectedTemplate || isPredefinedSelected}
              className="flex items-center justify-center text-sm bg-red-800 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition"
            >
                <i className="fas fa-trash mr-2"></i>
                Xóa Mẫu
            </button>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="prompt" className="flex items-center text-sm font-medium text-gray-300">
            <i className="fas fa-pen-fancy w-5 text-center mr-2 text-cyan-400"></i>
            Mô tả chi tiết
          </label>
          {options.prompt && (
            <button
              onClick={() => setOptions(prev => ({ ...prev, prompt: '' }))}
              className="text-gray-400 hover:text-white text-xs py-1 px-2 rounded-lg transition-colors flex items-center gap-1 bg-gray-700/50 hover:bg-gray-700"
              aria-label="Xoá mô tả"
            >
              <i className="fas fa-times"></i>
              Xoá
            </button>
          )}
        </div>
        <textarea
          id="prompt"
          name="prompt"
          rows={5}
          value={options.prompt}
          onChange={handleInputChange}
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          placeholder="VD: một nữ MC tóc vàng, mặc vest xanh, trong trường quay tin tức tương lai..."
        />
      </div>

       <div>
        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
          <i className="fas fa-user-circle w-5 text-center mr-2 text-cyan-400"></i>
          Khuôn mặt tham khảo (Tùy chọn)
        </label>
        <div className="mt-2 flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            aria-label="Tải lên hình ảnh khuôn mặt"
          />
          {faceImage ? (
            <div className="relative">
              <img src={`data:${faceImage.mimeType};base64,${faceImage.base64}`} alt="Xem trước khuôn mặt" className="h-20 w-20 rounded-md object-cover" />
              <button 
                onClick={() => setFaceImage(null)} 
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                aria-label="Xóa ảnh"
               >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          ) : (
             <div 
                className="h-20 w-20 rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-700/50 hover:border-cyan-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
             >
                <i className="fas fa-upload mb-1"></i>
                <span className="text-xs text-center">Tải ảnh lên</span>
            </div>
          )}
           <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
            >
              {faceImage ? 'Thay đổi ảnh' : 'Chọn ảnh'}
            </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Sử dụng hình ảnh khuôn mặt để MC AI có nét tương đồng.</p>
      </div>

      <OptionSelect 
        label="Giới tính" 
        name="gender" 
        value={options.gender}
        options={['Nữ', 'Nam', 'Phi nhị nguyên']} 
        icon="fa-venus-mars"
      />
      <OptionSelect 
        label="Dân tộc" 
        name="ethnicity" 
        value={options.ethnicity}
        options={['Châu Á', 'Da trắng', 'Da đen', 'Hispanic', 'Trung Đông']} 
        icon="fa-globe"
      />
      <OptionSelect 
        label="Độ tuổi" 
        name="age" 
        value={options.age}
        options={['Thanh niên (25-35 tuổi)', 'Thiếu niên (18-24 tuổi)', 'Trung niên (36-50 tuổi)', 'Lớn tuổi (Trên 50 tuổi)']} 
        icon="fa-user-clock"
      />
      <OptionSelect 
        label="Biểu cảm khuôn mặt" 
        name="expression" 
        value={options.expression}
        options={['Trung tính', 'Tập trung', 'Mỉm cười nhẹ', 'Mỉm cười rạng rỡ', 'Nghiêm túc']} 
        icon="fa-smile"
        description="Chọn biểu cảm cho MC. 'Trung tính' phù hợp cho bản tin."
      />
       <OptionSelect 
        label="Kiểu tóc" 
        name="hairStyle" 
        value={options.hairStyle}
        options={['Tóc dài thẳng', 'Tóc dài xoăn', 'Tóc buông xõa tự nhiên', 'Tóc ngắn (bob)', 'Tóc tém (pixie)', 'Tóc búi cao', 'Tóc đuôi ngựa', 'Tóc tết hai bên', 'Tóc búi cổ trang', 'Tóc ướt vuốt ngược']} 
        icon="fa-signature"
      />
      <OptionSelect 
        label="Màu tóc" 
        name="hairColor" 
        value={options.hairColor}
        options={['Đen', 'Nâu', 'Vàng', 'Hạt dẻ', 'Đỏ', 'Bạch kim', 'Xám']} 
        icon="fa-palette"
      />
       <OptionSelect 
        label="Kiểu mắt" 
        name="eyeStyle" 
        value={options.eyeStyle}
        options={['Mắt hạnh nhân', 'Mắt tròn', 'Mắt một mí', 'Mắt hai mí', 'Mắt xếch']} 
        icon="fa-eye"
      />
      <OptionSelect 
        label="Màu mắt" 
        name="eyeColor" 
        value={options.eyeColor}
        options={['Đen', 'Nâu', 'Xanh lam', 'Xanh lá', 'Xám', 'Hổ phách']} 
        icon="fa-eye-dropper"
      />
      <OptionSelect 
        label="Trang phục" 
        name="clothing"
        value={options.clothing}
        options={['Vest công sở', 'Áo dài truyền thống', 'Dân dã (TikTok)', 'Cổ trang', 'Gợi cảm', 'Trang phục thường ngày', 'Trang phục công nghệ']}
        icon="fa-tshirt"
      />
      
      <div>
        <label htmlFor="clothingDetails" className="flex items-center text-sm font-medium text-gray-300 mb-2">
          <i className="fas fa-pencil-ruler w-5 text-center mr-2 text-cyan-400"></i>
          Chi tiết trang phục
        </label>
        <input
          id="clothingDetails"
          name="clothingDetails"
          type="text"
          value={options.clothingDetails || ''}
          onChange={handleInputChange}
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          placeholder="VD: cà vạt màu đỏ, áo sơ mi trắng"
        />
      </div>

      <OptionSelect 
        label="Bối cảnh" 
        name="background"
        value={options.background}
        options={['Trường quay tin tức ảo', 'Phòng họp hiện đại', 'Bếp nhà dân dã', 'Cánh đồng lúa', 'Vườn rau', 'Sân nhà quê', 'Ngoài trời thành phố', 'Cung điện cổ kính', 'Khu vườn thượng uyển', 'Bãi biển hoàng hôn', 'Studio với ánh đèn neon', 'Nền trừu tượng', 'Phông xanh', 'Phông xanh lam']} 
        icon="fa-image"
      />
       <OptionSelect 
        label="Tỷ lệ khung hình" 
        name="aspectRatio"
        value={options.aspectRatio}
        options={['16:9', '9:16', '1:1', '4:3', '3:4']} 
        icon="fa-expand-arrows-alt"
        description="Chọn tỷ lệ phù hợp (VD: 16:9 cho YouTube, 9:16 cho TikTok/Stories)."
      />

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tạo...
          </>
        ) : (
          <>
            <i className="fas fa-magic mr-2"></i>
            Tạo ảnh MC
          </>
        )}
      </button>
    </div>
  );
};

export default ControlPanel;
