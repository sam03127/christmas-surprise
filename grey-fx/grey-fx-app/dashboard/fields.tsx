import { useRef, useState, type ReactNode } from 'react';
import { api, compressImage, photoSrc } from '../lib/api.js';
import styles from './dashboard.module.css';

/** Labeled field wrapper. */
export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {help && <span className={styles.help}>{help}</span>}
    </label>
  );
}

/** Text input bound to a value. */
export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength = 120,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <input
      className={styles.input}
      type={type}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Textarea bound to a value. */
export function TextArea({
  value,
  onChange,
  placeholder,
  hand = false,
  rows,
  maxLength = 4000,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hand?: boolean;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <textarea
      className={`${styles.textarea} ${hand ? styles.hand : ''}`}
      value={value}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * Uploads images (compressed in-browser) to the surprise service.
 * @param onUploaded called with each stored photo id.
 */
export function PhotoDrop({
  onUploaded,
  multiple = false,
  label = 'Drop photos here or tap to upload',
}: {
  onUploaded: (photoId: string) => void;
  multiple?: boolean;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setBusy((b) => b + list.length);
    for (const f of list) {
      try {
        const data = await compressImage(f);
        const id = await api.uploadPhoto(data);
        onUploaded(id);
      } catch (e: any) {
        setError(e.message || 'Upload failed');
      } finally {
        setBusy((b) => b - 1);
      }
    }
  };

  return (
    <div
      className={`${styles.dropzone} ${over ? styles.dropActive : ''}`}
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
    >
      <span className={styles.dropIcon}>📷</span>
      <span>{busy ? `Uploading ${busy} photo${busy > 1 ? 's' : ''}…` : label}</span>
      {error && <span style={{ color: '#ffb3b3' }}>{error}</span>}
      <input
        ref={input}
        className={styles.hidden}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/** Thumbnail for an uploaded photo. */
export function Thumb({ photo, className = styles.thumb }: { photo?: string; className?: string }) {
  if (!photo) return null;
  return <img className={className} src={photoSrc(photo)} alt="" />;
}
