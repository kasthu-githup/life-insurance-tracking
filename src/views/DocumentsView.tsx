import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  Shield,
  FileCheck,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentItem, Policy } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface DocumentsViewProps {
  documents: DocumentItem[];
  policies: Policy[];
  loading: boolean;
  onRefresh: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  policies,
  loading,
  onRefresh,
}) => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    policyId: policies[0]?.id?.toString() || '',
    documentName: '',
    documentType: 'Policy Document',
    fileSize: '1.4 MB',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingDoc, setDeletingDoc] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const documentTypes = [
    'Policy Document',
    'Premium Receipt',
    'Medical Report',
    'Nominee Document',
    'Payment Receipt',
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.policyName && doc.policyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || doc.documentType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.documentName) {
      setUploadError('Please enter document name');
      return;
    }

    setSubmitting(true);
    setUploadError('');
    try {
      await api.createDocument(token, {
        policyId: formData.policyId ? parseInt(formData.policyId, 10) : null,
        documentName: formData.documentName,
        documentType: formData.documentType,
        fileUrl: `/docs/${Date.now()}_${encodeURIComponent(formData.documentName)}.pdf`,
        fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        notes: formData.notes,
      });

      setIsUploadOpen(false);
      onRefresh();
      setFormData({
        policyId: policies[0]?.id?.toString() || '',
        documentName: '',
        documentType: 'Policy Document',
        fileSize: '1.4 MB',
        notes: '',
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteDoc = async () => {
    if (!token || !deletingDoc) return;
    setIsDeleting(true);
    try {
      await api.deleteDocument(token, deletingDoc.id);
      setDeletingDoc(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete document', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    const content = `====================================
DOCUMENT ATTACHMENT: ${doc.documentName}
Type: ${doc.documentType}
Linked Policy: ${doc.policyName || 'General'}
Upload Date: ${doc.uploadDate}
File Size: ${doc.fileSize}
Notes: ${doc.notes || 'None'}
====================================
Verified Life Insurance Document`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.documentName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Insurance Document Repository
          </h2>
          <p className="text-xs text-slate-500">
            Securely store policy bonds, premium receipts, medical checkup reports, and KYC records
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by name or policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="All">All Document Types</option>
            {documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Documents Uploaded</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Upload and organize your policy bonds, receipts, and health reports.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors"
          >
            + Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {doc.documentType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {doc.fileSize}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {doc.documentName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Policy: <span className="font-semibold text-slate-700">{doc.policyName || 'General'}</span>
                </p>

                {doc.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Uploaded {doc.uploadDate}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingDoc({ id: doc.id, name: doc.documentName })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <h3 className="text-base font-bold text-slate-900">Upload Insurance Document</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  {uploadError}
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LIC Policy Bond Original Copy"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Document Category *
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {documentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Associated Policy
                </label>
                <select
                  value={formData.policyId}
                  onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="">General Insurance Document</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.policyName} ({p.companyName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag & drop upload box */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  File Attachment
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center bg-slate-50/50 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to select file or drag & drop
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PDF, JPG, PNG up to 15MB
                  </p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Notes / Identification
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional remarks about page number, branch, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingDoc}
        title="Delete Document"
        message={
          deletingDoc
            ? `Are you sure you want to delete the document "${deletingDoc.name}"? This file will be removed from your repository.`
            : ''
        }
        confirmLabel="Delete Document"
        isLoading={isDeleting}
        onConfirm={confirmDeleteDoc}
        onCancel={() => setDeletingDoc(null)}
      />
    </div>
  );
};
