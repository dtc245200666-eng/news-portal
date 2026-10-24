import React, { useState } from 'react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LikeBookmarkButtonsProps {
  articleId: string;
  initialLiked?: boolean;
  initialLikesCount?: number;
  initialBookmarked?: boolean;
}

export const LikeBookmarkButtons: React.FC<LikeBookmarkButtonsProps> = ({
  articleId,
  initialLiked = false,
  initialLikesCount = 0,
  initialBookmarked = false,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialBookmarked);
  const [loadingLike, setLoadingLike] = useState<boolean>(false);
  const [loadingBookmark, setLoadingBookmark] = useState<boolean>(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/dang-nhap');
      return;
    }
    try {
      setLoadingLike(true);
      const res = await api.post(`/interactions/articles/${articleId}/like`);
      setIsLiked(res.data.data.liked);
      setLikesCount(res.data.data.likesCount);
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/dang-nhap');
      return;
    }
    try {
      setLoadingBookmark(true);
      const res = await api.post(`/interactions/articles/${articleId}/bookmark`);
      setIsBookmarked(res.data.data.bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <div className="flex items-center space-x-3 my-6">
      <button
        onClick={handleLike}
        disabled={loadingLike}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold transition ${
          isLiked
            ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : 'text-gray-500'}`} />
        <span>{likesCount} Yêu thích</span>
      </button>

      <button
        onClick={handleBookmark}
        disabled={loadingBookmark}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold transition ${
          isBookmarked
            ? 'bg-amber-50 text-amber-600 border-amber-200'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600 text-amber-600' : 'text-gray-500'}`} />
        <span>{isBookmarked ? 'Đã lưu tin' : 'Lưu tin'}</span>
      </button>
    </div>
  );
};
