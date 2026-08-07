import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

export default function OCRProcessor({ onTextExtracted }) {
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Run OCR
    setStatus('processing');
    setProgress(0);
    setExtractedText('');

    try {
      const Tesseract = (await import('tesseract.js')).default;

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text.trim();
      setExtractedText(text);
      setStatus('done');
      toast.success('OCR completed! Please review the extracted text.');
    } catch (err) {
      console.error('[OCR Error]:', err);
      setStatus('error');
      toast.error('OCR failed. Please try a clearer image.');
    }
  };

  const handleConfirm = () => {
    if (onTextExtracted) {
      onTextExtracted(extractedText);
      toast.success('Text confirmed and saved to record!');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setExtractedText('');
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🔍</span>
        <div>
          <h3 className="font-bold text-navy-800">OCR Digitization</h3>
          <p className="text-xs text-gray-500">Upload a photo of a physical report to extract text</p>
        </div>
      </div>

      {/* File Upload */}
      {status === 'idle' && (
        <label className="block border-2 border-dashed border-navy-300 rounded-lg p-6 text-center cursor-pointer hover:border-navy-600 hover:bg-navy-50 transition-colors">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-4xl block mb-2">📷</span>
          <p className="font-medium text-navy-800">Click to upload report image</p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, TIFF supported • Max 10MB</p>
        </label>
      )}

      {/* Processing */}
      {status === 'processing' && (
        <div className="space-y-3">
          {preview && (
            <img src={preview} alt="Report preview" className="max-h-40 rounded-md mx-auto object-contain" />
          )}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Extracting text with Tesseract.js...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-navy-800 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Done */}
      {status === 'done' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            {preview && (
              <img src={preview} alt="Report preview" className="w-28 h-28 rounded-md object-contain border border-gray-200" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-navy-800">Extracted Text — Review & Edit</label>
                <span className="badge-success">OCR Complete ✓</span>
              </div>
              <textarea
                className="form-input h-32 resize-none text-xs"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text appears here..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleConfirm} className="btn-success flex-1 text-sm py-2">
              ✓ Confirm & Use Text
            </button>
            <button onClick={handleReset} className="btn-secondary text-sm py-2">
              ↺ Try Again
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="alert-critical">
          <p className="text-sm font-medium text-red-800">OCR failed. Please try a higher quality image.</p>
          <button onClick={handleReset} className="btn-danger text-sm py-1.5 mt-2">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
