import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { uploadNote } from '@/api/notes';
import { listFolders } from '@/api/folders';
import { useToast } from '@/components/shared/ToastProvider';

// PDF/Word only, per product scope - see accept attr and the client-side
// check below. The backend enforces this independently (defense in depth),
// so this is purely a fast, friendly UX guard, not the source of truth.
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc'];

export default function UploadPage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedFolder = searchParams.get('folder') || '';
  const { showToast } = useToast();
  const { data: folders } = useQuery({
    queryKey: ['folders'],
    queryFn: () => listFolders().then((r) => r.data.results ?? r.data),
  });

  // defaultValue on the <select> can't pre-select an option that doesn't
  // exist yet - folders load async, after the initial render, and React
  // only honors defaultValue at mount time. This was silently uploading
  // "into a folder" notes as folder-less. setValue fires once the real
  // option list (and the target folder within it) actually exists.
  useEffect(() => {
    if (preselectedFolder && folders?.some((f) => f.id === preselectedFolder)) {
      setValue('folder', preselectedFolder);
    }
  }, [folders, preselectedFolder, setValue]);

  const validateAndSetFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileError('Only PDF and Word documents (.pdf, .docx, .doc) are supported.');
      return;
    }
    setFileError('');
    setFile(f);
  };

  const onSubmit = async (data) => {
    if (!file) {
      setFileError('Please choose a file to upload.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('visibility', data.visibility);
      if (data.folder) formData.append('folder', data.folder);
      formData.append('file', file);
      (data.tags || '').split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => formData.append('tag_names', t));
      await uploadNote(formData);
      setSuccess(true);
      showToast('Your note is ready to share.', { title: 'Uploaded' });
      setTimeout(() => navigate('/dashboard'), 1400);
    } catch (err) {
      // Surface whatever the server actually said, not a generic fallback -
      // a swallowed error message makes real problems undiagnosable, for
      // both the person using the app and whoever debugs it afterward.
      console.error('Upload failed:', err.response?.status, err.response?.data || err.message);
      const data = err.response?.data;
      let message = 'Upload failed. Please try again.';
      if (data?.file) message = Array.isArray(data.file) ? data.file[0] : data.file;
      else if (data?.detail) message = data.detail;
      else if (typeof data === 'object' && data !== null) {
        const firstKey = Object.keys(data)[0];
        if (firstKey) message = `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`;
      } else if (!err.response) {
        message = 'Could not reach the server. Check your connection and that the backend is running.';
      }
      setFileError(message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
          <CheckCircle2 size={56} className="text-approved-500" />
        </motion.div>
        <p className="mt-4 font-medium text-[var(--text-primary)]">Note uploaded</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">Upload a note</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">PDF or Word documents only.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-[var(--radius-card)] border-2 border-dashed p-8 text-center transition-colors ${
            dragActive ? 'border-accent-500 bg-accent-50' : 'border-[var(--border)]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
          />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                <FileText size={20} className="text-accent-500" />
                <span className="text-sm font-medium text-[var(--text-primary)]">{file.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <X size={16} className="text-[var(--text-secondary)]" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <UploadCloud size={28} className="mx-auto text-[var(--text-secondary)]" />
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Drag a file here, or <span className="text-accent-500">browse</span>
                </p>
                <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">.pdf, .docx, .doc</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {fileError && <p className="text-sm text-rejected-500">{fileError}</p>}

        <Field label="Title" error={errors.title}>
          <input {...register('title', { required: 'Required' })} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea {...register('description')} rows={3} className={inputCls} />
        </Field>
        <Field label="Tags (comma separated)">
          <input {...register('tags')} placeholder="algorithms, midterm" className={inputCls} />
        </Field>
        <Field label="Folder (optional)">
          <select {...register('folder')} defaultValue="" className={inputCls}>
            <option value="">No folder</option>
            {folders?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Visibility">
          <select {...register('visibility', { required: true })} defaultValue="private" className={inputCls}>
            <option value="public">Public - everyone can view and download</option>
            <option value="friends">Friends Only - discoverable by friends, approve to download</option>
            <option value="private">Private - nobody but you can see it</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-full bg-accent-500 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload note'}
        </button>
      </form>
    </div>
  );
}

const inputCls = 'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-accent-500';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rejected-500">{error.message}</p>}
    </div>
  );
}
