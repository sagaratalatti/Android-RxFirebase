import { useState } from 'react';
import { Share2, Check, Copy, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createSharedReport } from '../lib/cloud-sync';
import { Link } from 'react-router-dom';

interface ShareReportButtonProps {
  moduleId: string;
  moduleTitle: string;
  companyName: string;
  iterations: { loopNumber: number; name: string; response: string }[];
  finalOutput: string;
}

export default function ShareReportButton({
  moduleId,
  moduleTitle,
  companyName,
  iterations,
  finalOutput,
}: ShareReportButtonProps) {
  const { user, configured } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!configured) return null;

  if (!user) {
    return (
      <Link to="/auth" className="btn-secondary text-sm">
        <Share2 className="h-4 w-4" />
        Sign in to Share
      </Link>
    );
  }

  const handleShare = async () => {
    setLoading(true);
    const result = await createSharedReport(user.id, {
      title: `${moduleTitle} — ${companyName}`,
      moduleId,
      companyName,
      moduleTitle,
      iterations,
      finalOutput,
    });
    setLoading(false);

    if (result.success && result.shareUrl) {
      setShareUrl(result.shareUrl);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareUrl) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-secondary text-sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
          <LinkIcon className="h-4 w-4" />
          Open
        </a>
      </div>
    );
  }

  return (
    <button className="btn-secondary text-sm" onClick={handleShare} disabled={loading}>
      <Share2 className="h-4 w-4" />
      {loading ? 'Creating link…' : 'Share Report'}
    </button>
  );
}
