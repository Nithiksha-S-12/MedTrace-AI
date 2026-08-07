import React, { useState } from 'react';
import PageLayout from '../components/common/PageLayout';
import OCRProcessor from '../components/common/OCRProcessor';
import { toast } from 'react-toastify';

export default function DiagnosticUpload() {
  const [method, setMethod] = useState('pdf'); // pdf | dicom | ocr
  const [form, setForm] = useState({ healthId: '', title: '', doctorName: '', file: null, extractedText: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Record uploaded successfully and linked to patient!');
      setForm({ healthId: '', title: '', doctorName: '', file: null, extractedText: '' });
    }, 1500);
  };

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">📤 Upload Medical Record</h1>
        <p className="page-subtitle">Securely attach scans or lab reports to a patient's Health Passport</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="section-title">Patient Details</h3>
            <div className="form-group">
              <label className="form-label">Patient Health ID *</label>
              <input required className="form-input" placeholder="e.g. HID-A7X2K" value={form.healthId} onChange={e => setForm({...form, healthId: e.target.value})} />
              <p className="text-xs text-green-600 mt-1">✓ Patient verified: Arjun Kumar</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Prescribing Doctor (Optional)</label>
              <input className="form-input" placeholder="e.g. Dr. Priya Sharma" value={form.doctorName} onChange={e => setForm({...form, doctorName: e.target.value})} />
            </div>

            <h3 className="section-title mt-6">Record Details</h3>
            <div className="form-group">
              <label className="form-label">Report Title *</label>
              <input required className="form-input" placeholder="e.g. MRI Brain Routine" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Method</label>
              <div className="flex gap-2">
                {[
                  { id: 'pdf', label: 'PDF Report' },
                  { id: 'dicom', label: 'DICOM Scan' },
                  { id: 'ocr', label: 'Image (OCR)' }
                ].map(m => (
                  <button type="button" key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md border-2 transition-colors ${method === m.id ? 'border-purple-600 bg-purple-50 text-purple-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {method !== 'ocr' && (
              <div className="form-group">
                <label className="form-label">Select File *</label>
                <input required type="file" className="form-input" accept={method === 'pdf' ? '.pdf' : '.dcm,.zip'} />
              </div>
            )}

            {method === 'ocr' && form.extractedText && (
              <div className="form-group">
                <label className="form-label">Digitized Text</label>
                <textarea className="form-input h-24 text-xs bg-gray-50" readOnly value={form.extractedText} />
                <p className="text-xs text-green-600 mt-1">✓ Ready to save</p>
              </div>
            )}

            <button type="submit" disabled={loading || (method === 'ocr' && !form.extractedText)} className="btn-primary w-full py-3 mt-4 bg-purple-700 hover:bg-purple-800">
              {loading ? 'Uploading...' : '📤 Secure Upload & Link'}
            </button>
          </form>
        </div>

        {/* OCR Tool */}
        <div className={method === 'ocr' ? 'block' : 'hidden lg:block opacity-50 pointer-events-none'}>
          <OCRProcessor onTextExtracted={(text) => { setForm({...form, extractedText: text}); setMethod('ocr'); }} />
        </div>
      </div>
    </PageLayout>
  );
}
