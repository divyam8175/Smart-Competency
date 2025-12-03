import { useState, type ChangeEvent, type ReactElement } from 'react';
import { uploadResumeForParsing } from '../../api/client';
import { ResumeParseResponse, ResumeSnapshot } from '../../types';

interface ResumeUploadCardProps {
  latestSnapshot?: ResumeSnapshot | null;
  onParsed: (data: ResumeParseResponse) => void;
}

const ResumeUploadCard = ({ latestSnapshot, onParsed }: ResumeUploadCardProps): ReactElement => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const result = await uploadResumeForParsing(file);
      onParsed(result);
      setMessage(`Parsed ${file.name} successfully.`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to parse resume';
      setMessage(errMsg);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="card">
      <div className="resume-header">
        <div>
          <h3>Resume Intelligence</h3>
          <p className="subtle">Upload a PDF/DOC resume to auto-extract skills, education, and experience.</p>
        </div>
      </div>

      <label className="resume-upload">
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} disabled={uploading} />
        <span>{uploading ? 'Parsing resume...' : 'Upload Resume'}</span>
      </label>

      {message && <p className={message.includes('success') ? 'success message' : 'error'}>{message}</p>}

      {latestSnapshot ? (
        <div className="resume-meta">
          <p>
            Last parsed <strong>{latestSnapshot.sourceName || 'resume'}</strong> on {new Date(latestSnapshot.parsedAt).toLocaleString()}
          </p>
          <p className="muted-text">Detected {latestSnapshot.skills.length} skills and {latestSnapshot.experience.length} experience entries.</p>
        </div>
      ) : (
        <p className="muted-text">No resume parsed yet.</p>
      )}
    </div>
  );
};

export default ResumeUploadCard;
