
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ImageDisplay from './components/ImageDisplay';
import { generateAnchorImage } from './services/geminiService';
import { AnchorOptions, FaceImage, Template } from './types';

const PREDEFINED_TEMPLATES: Template[] = [
  {
    name: 'Nữ MC Thời sự (Mẫu)',
    options: {
      prompt: 'Một nữ MC thời sự chuyên nghiệp, mặc áo dài truyền thống màu đỏ, tóc búi gọn gàng, đang dẫn chương trình trong một trường quay hiện đại.',
      gender: 'Nữ', ethnicity: 'Châu Á', age: 'Thanh niên (25-35 tuổi)',
      expression: 'Trung tính',
      hairStyle: 'Tóc búi cao', hairColor: 'Đen', eyeStyle: 'Mắt hạnh nhân', eyeColor: 'Nâu',
      clothing: 'Áo dài truyền thống', clothingDetails: 'Áo dài màu đỏ với họa tiết hoa sen vàng', background: 'Trường quay tin tức ảo',
      aspectRatio: '16:9',
    }
  },
  {
    name: 'Nam MC Livestream Game (Mẫu)',
    options: {
      prompt: 'Một nam streamer game năng động, tóc nhuộm màu bạch kim, đeo tai nghe gaming, ngồi trước màn hình máy tính trong một căn phòng đầy đèn neon.',
      gender: 'Nam', ethnicity: 'Châu Á', age: 'Thiếu niên (18-24 tuổi)',
      expression: 'Tập trung',
      hairStyle: 'Tóc ướt vuốt ngược', hairColor: 'Bạch kim', eyeStyle: 'Mắt một mí', eyeColor: 'Đen',
      clothing: 'Trang phục công nghệ', clothingDetails: 'Áo hoodie đen có logo game, tai nghe gaming phát sáng', background: 'Studio với ánh đèn neon',
      aspectRatio: '9:16',
    }
  },
  {
    name: 'Nữ MC Nông thôn (Mẫu)',
    options: {
      prompt: 'Một cô gái thôn quê xinh đẹp, mặc áo bà ba, đội nón lá, mỉm cười rạng rỡ giữa một cánh đồng lúa xanh mướt.',
      gender: 'Nữ', ethnicity: 'Châu Á', age: 'Thanh niên (25-35 tuổi)',
      expression: 'Mỉm cười rạng rỡ',
      hairStyle: 'Tóc tết hai bên', hairColor: 'Đen', eyeStyle: 'Mắt tròn', eyeColor: 'Đen',
      clothing: 'Dân dã (TikTok)', clothingDetails: 'Áo bà ba màu hồng nhạt, quần đen, nón lá', background: 'Cánh đồng lúa',
      aspectRatio: '9:16',
    }
  }
];

const App: React.FC = () => {
  const [options, setOptions] = useState<AnchorOptions>({
    prompt: 'Một nữ MC AI chuyên nghiệp với mái tóc nâu, mặc một bộ vest công sở màu xanh navy hiện đại, đang đứng trong một trường quay tin tức ảo có đồ họa công nghệ cao.',
    gender: 'Nữ',
    ethnicity: 'Châu Á',
    hairStyle: 'Tóc dài thẳng',
    hairColor: 'Nâu',
    eyeStyle: 'Mắt hạnh nhân',
    eyeColor: 'Đen',
    clothing: 'Vest công sở',
    clothingDetails: '',
    background: 'Trường quay tin tức ảo',
    aspectRatio: '16:9',
    age: 'Thanh niên (25-35 tuổi)',
    expression: 'Trung tính',
  });
  const [faceImage, setFaceImage] = useState<FaceImage | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [allTemplates, setAllTemplates] = useState<Template[]>([...PREDEFINED_TEMPLATES]);

  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem('ai_mc_templates');
      if (storedTemplates) {
        setCustomTemplates(JSON.parse(storedTemplates));
      }
    } catch (e) {
      console.error("Failed to load templates from localStorage", e);
    }
  }, []);
  
  useEffect(() => {
    setAllTemplates([...PREDEFINED_TEMPLATES, ...customTemplates]);
    try {
      localStorage.setItem('ai_mc_templates', JSON.stringify(customTemplates));
    } catch (e) {
        console.error("Failed to save templates to localStorage", e);
    }
  }, [customTemplates]);


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    const {
      prompt: userPrompt,
      gender,
      ethnicity,
      age,
      expression,
      hairStyle,
      hairColor,
      eyeStyle,
      eyeColor,
      clothing,
      clothingDetails,
      background,
      aspectRatio,
    } = options;

    let descriptivePrompt = `Một người dẫn chương trình AI là ${gender}, dân tộc ${ethnicity}, trong độ tuổi ${age}. `;
    descriptivePrompt += `Họ có mái tóc ${hairColor} kiểu "${hairStyle}" và đôi mắt ${eyeColor} kiểu "${eyeStyle}". `;
    descriptivePrompt += `Trang phục là "${clothing}"${clothingDetails ? ` với chi tiết đặc tả: ${clothingDetails}` : ''}. `;
    descriptivePrompt += `Bối cảnh là một "${background}". `;
    descriptivePrompt += `Biểu cảm khuôn mặt: "${expression}". `;
    descriptivePrompt += `Mô tả thêm từ người dùng: "${userPrompt}". `;
    descriptivePrompt += `Toàn bộ hình ảnh cần có phong cách chuyên nghiệp, hiện đại, chân thực, chất lượng cao, phù hợp cho truyền hình. Đặc biệt chú trọng vào vùng miệng: cần có độ chi tiết cao, hình dáng tự nhiên, không bị biến dạng, phù hợp cho việc tạo chuyển động nhép miệng sau này.`;

    const baseInstruction = faceImage
      ? `Sử dụng khuôn mặt trong hình ảnh tham khảo, tạo ra một hình ảnh chân thực. Giữ lại các đặc điểm khuôn mặt chính từ ảnh tham khảo nhưng điều chỉnh để phù hợp với mô tả sau:`
      : `Tạo một hình ảnh chân thực, chất lượng cao dựa trên mô tả sau:`;
      
    const fullPrompt = `${baseInstruction} ${descriptivePrompt}`;

    try {
      const imageUrl = await generateAnchorImage(fullPrompt, aspectRatio, faceImage);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Đã xảy ra lỗi: ${err.message}. Vui lòng thử lại.`);
      } else {
        setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [options, faceImage]);

  const handleLoadTemplate = (templateName: string) => {
    const template = allTemplates.find(t => t.name === templateName);
    if (template) {
      setOptions(template.options);
      setFaceImage(null); // Clear face image when loading a template
    }
  };

  const handleSaveTemplate = () => {
    const name = prompt("Nhập tên cho mẫu của bạn:");
    if (name && name.trim() !== "") {
      const isPredefined = PREDEFINED_TEMPLATES.some(t => t.name.toLowerCase() === name.trim().toLowerCase());
      const isDuplicate = customTemplates.some(t => t.name.toLowerCase() === name.trim().toLowerCase());
      if (isPredefined) {
        alert("Không thể ghi đè lên mẫu có sẵn.");
        return;
      }
      if (isDuplicate) {
          if (!window.confirm(`Mẫu "${name}" đã tồn tại. Bạn có muốn ghi đè lên nó không?`)) {
              return;
          }
           setCustomTemplates(prev => prev.map(t => t.name.toLowerCase() === name.trim().toLowerCase() ? { name: name.trim(), options } : t));
      } else {
         setCustomTemplates(prev => [...prev, { name: name.trim(), options }]);
      }
      alert(`Đã lưu mẫu "${name.trim()}"!`);
    }
  };

  const handleDeleteTemplate = (templateName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mẫu "${templateName}" không?`)) {
      setCustomTemplates(prev => prev.filter(t => t.name !== templateName));
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <ControlPanel
              options={options}
              setOptions={setOptions}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              faceImage={faceImage}
              setFaceImage={setFaceImage}
              templates={allTemplates}
              onLoadTemplate={handleLoadTemplate}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              predefinedTemplateNames={PREDEFINED_TEMPLATES.map(t => t.name)}
            />
          </div>
          <div className="lg:col-span-8">
            <ImageDisplay
              imageUrl={generatedImageUrl}
              isLoading={isLoading}
              error={error}
              aspectRatio={options.aspectRatio}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Cung cấp bởi Gemini API. Thiết kế bởi một kỹ sư React chuyên nghiệp.</p>
      </footer>
    </div>
  );
};

export default App;
