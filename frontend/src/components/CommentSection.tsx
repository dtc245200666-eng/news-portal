import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, CornerDownRight, Trash2, Send } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Comment } from '../types';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const res = await api.get(`/comments/articles/${articleId}`);
      return res.data.data;
    },
  });

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      const res = await api.post(`/comments/articles/${articleId}`, {
        content: text,
        parentId,
      });
      return res.data;
    },
    onSuccess: () => {
      setContent('');
      setReplyingToId(null);
      setReplyContent('');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      queryClient.invalidateQueries({ queryKey: ['article'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Không thể đăng bình luận. Vui lòng thử lại.');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    postCommentMutation.mutate({ text: content });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    postCommentMutation.mutate({ text: replyContent, parentId });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="w-6 h-6 text-brand-700" />
        <h3 className="text-xl font-bold text-gray-900">
          Ý kiến bạn đọc ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Main Comment Box */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}`}
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-sm text-gray-800">{user?.fullName}</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
            rows={3}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent resize-y"
            required
          />

          {errorMessage && <p className="text-xs text-red-600 mt-2">{errorMessage}</p>}

          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={postCommentMutation.isPending || !content.trim()}
              className="flex items-center space-x-2 px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
              <span>{postCommentMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-3">
            Vui lòng đăng nhập để gửi bình luận và tham gia thảo luận cùng bạn đọc.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Link
              to="/dang-nhap"
              className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800 transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/dang-ky"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-6 text-gray-400 text-sm">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={comment.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.fullName)}`}
                    alt={comment.user.fullName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900">{comment.user.fullName}</span>
                      {comment.user.role && comment.user.role !== 'USER' && (
                        <span className="px-2 py-0.5 text-[10px] bg-brand-100 text-brand-800 font-bold rounded">
                          {comment.user.role}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                </div>

                {/* Delete button if owner or staff */}
                {(user?.id === comment.userId || ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user?.role || '')) && (
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                        deleteCommentMutation.mutate(comment.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Xóa bình luận"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-gray-800 text-sm leading-relaxed mt-2 pl-12">{comment.content}</p>

              {/* Reply trigger button */}
              <div className="pl-12 mt-3">
                <button
                  onClick={() => {
                    if (!isAuthenticated) return;
                    setReplyingToId(replyingToId === comment.id ? null : comment.id);
                  }}
                  className="flex items-center space-x-1 text-xs text-brand-700 font-semibold hover:underline"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Trả lời</span>
                </button>
              </div>

              {/* Inline Reply Box */}
              {replyingToId === comment.id && (
                <div className="mt-3 pl-12">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Phản hồi cho ${comment.user.fullName}...`}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-700"
                    />
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim()}
                      className="px-3 py-1.5 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 disabled:opacity-50"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies List */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-12 space-y-4 border-l-2 border-gray-100 ml-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="pt-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5 mb-1">
                          <img
                            src={reply.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user.fullName)}`}
                            alt={reply.user.fullName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-semibold text-xs text-gray-900">{reply.user.fullName}</span>
                            <span className="text-[11px] text-gray-400 ml-2">{formatDate(reply.createdAt)}</span>
                          </div>
                        </div>

                        {(user?.id === reply.userId || ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user?.role || '')) && (
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
                                deleteCommentMutation.mutate(reply.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Xóa phản hồi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-800 text-xs leading-relaxed pl-9">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
