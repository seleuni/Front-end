import React, { useRef, useState } from 'react';
import { ImagePlus, Upload, X } from 'lucide-react';
import type { ImageCategory } from '../../types/archive';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleText?: string;
  allowCategory?: boolean;
  onSubmit: (payload: {
    url: string;
    title: string;
    category: ImageCategory;
    note: string;
  }) => void;
}

const CATEGORIES: ImageCategory[] = [
  '대표 전신',
  '표정 시트',
  'SD·설정화',
  '팬아트',
];

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  titleText = '새 이미지 등록',
  allowCategory = true,
  onSubmit,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ImageCategory>('대표 전신');
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('이미지 파일(PNG, JPG, WEBP 등)만 업로드할 수 있습니다.');
      return;
    }
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setPreviewUrl(result);
      setUrlInput('');
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = (previewUrl || urlInput).trim();
    if (!finalUrl) {
      setErrorMsg('이미지 파일을 선택하거나 유효한 이미지 URL을 입력해주세요.');
      return;
    }
    onSubmit({
      url: finalUrl,
      title: title.trim() || '새 아트워크',
      category,
      note: note.trim(),
    });
    setUrlInput('');
    setPreviewUrl('');
    setTitle('');
    setNote('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            <h2 id="upload-modal-title" className="text-base font-bold text-ink">
              {titleText}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-low transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Drag & Drop Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary-fixed/30'
                : 'border-hairline bg-surface-low/60 hover:border-primary/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {previewUrl || urlInput ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={previewUrl || urlInput}
                  alt="업로드 미리보기"
                  className="max-h-44 rounded-lg object-contain border border-hairline bg-white"
                  onError={() =>
                    setErrorMsg('URL 이미지를 불러올 수 없습니다. 주소를 확인해주세요.')
                  }
                />
                <span className="text-xs text-primary font-medium">
                  다른 파일을 선택하려면 클릭하세요
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-2">
                <Upload className="w-6 h-6 text-primary" />
                <p className="text-sm font-medium text-ink">
                  이미지를 끌어다 놓거나 클릭하여 파일 선택
                </p>
                <p className="text-xs text-ink-subtle">
                  PNG, JPG, WEBP 지원 (브라우저 즉시 반영)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">
              또는 외부 이미지 URL 입력
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setPreviewUrl('');
                setErrorMsg('');
              }}
              placeholder="https://example.com/artwork.png"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                아트워크 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 겨울 코트 설정화"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>

            {allowCategory && (
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                  분류
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ImageCategory)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">
              메모 (선택)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="착용 소품, 작업 날짜, 커미션 작가 등"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-danger bg-danger-soft/50 px-3 py-2 rounded-lg">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl hover:bg-surface-low transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
