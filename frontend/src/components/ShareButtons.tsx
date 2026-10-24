import React, { useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  return (
    <div className="flex items-center space-x-2 my-4">
      <span className="text-xs font-semibold text-gray-500 uppercase flex items-center mr-2">
        <Share2 className="w-3.5 h-3.5 mr-1" />
        Chia sẻ:
      </span>

      <button
        onClick={shareToFacebook}
        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition"
        title="Chia sẻ lên Facebook"
      >
        f
      </button>

      <button
        onClick={shareToTwitter}
        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition"
        title="Chia sẻ lên X"
      >
        𝕏
      </button>

      <button
        onClick={shareToTelegram}
        className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition"
        title="Chia sẻ qua Telegram"
      >
        TG
      </button>

      <button
        onClick={handleCopyLink}
        className="flex items-center space-x-1 px-3 h-8 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
        title="Sao chép liên kết"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span className="text-green-600 font-semibold">Đã chép link!</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" />
            <span>Sao chép</span>
          </>
        )}
      </button>
    </div>
  );
};
