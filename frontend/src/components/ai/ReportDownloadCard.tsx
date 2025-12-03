import { useState, type ReactElement } from 'react';

interface ReportDownloadCardProps {
  onDownload: () => Promise<void>;
}

const ReportDownloadCard = ({ onDownload }: ReportDownloadCardProps): ReactElement => {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDownload = async (): Promise<void> => {
    setDownloading(true);
    setMessage('');
    try {
      await onDownload();
      setMessage('Report downloaded.');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to download report';
      setMessage(errMsg);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card">
      <h3>Auto-generated PDF Report</h3>
      <p className="subtle">Includes summary, score breakdown, AI insights, and learning roadmap.</p>
      <button className="primary" onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Preparing...' : 'Download Report'}
      </button>
      {message && <p className={message.includes('downloaded') ? 'message success' : 'error'}>{message}</p>}
    </div>
  );
};

export default ReportDownloadCard;
