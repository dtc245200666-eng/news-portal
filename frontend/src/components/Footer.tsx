import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Mail, Phone, MapPin, ExternalLink, Rss } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto border-t-4 border-brand-800">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Editorial Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-brand-800 rounded-lg flex items-center justify-center text-white">
                <Newspaper className="w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-black text-white">NewsPortal</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Cổng thông tin điện tử uy tín, cập nhật liên tục 24/7 các tin tức thời sự, kinh tế,
              công nghệ và đời sống tại Việt Nam và trên toàn thế giới.
            </p>
            <p className="text-[11px] text-gray-500">
              Giấy phép hoạt động báo chí số 128/GP-BTTTT do Bộ Thông tin và Truyền thông cấp.
            </p>
          </div>

          {/* Column 2: Categories quick links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-700 pl-2">
              Chuyên mục nổi bật
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/danh-muc/thoi-su" className="hover:text-white transition">
                  Thời sự xã hội
                </Link>
              </li>
              <li>
                <Link to="/danh-muc/kinh-doanh" className="hover:text-white transition">
                  Kinh tế & Đầu tư
                </Link>
              </li>
              <li>
                <Link to="/danh-muc/cong-nghe" className="hover:text-white transition">
                  Công nghệ số & AI
                </Link>
              </li>
              <li>
                <Link to="/danh-muc/the-thao" className="hover:text-white transition">
                  Thể thao & Bóng đá
                </Link>
              </li>
              <li>
                <Link to="/danh-muc/doi-song" className="hover:text-white transition">
                  Văn hóa & Đời sống
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policy & Information Pages */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-700 pl-2">
              Thông tin tòa soạn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/gioi-thieu" className="hover:text-white transition">
                  Giới thiệu về NewsPortal
                </Link>
              </li>
              <li>
                <Link to="/lien-he" className="hover:text-white transition">
                  Liên hệ & Tòa soạn
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-bao-mat" className="hover:text-white transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/dieu-khoan-su-dung" className="hover:text-white transition">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/chinh-sach-binh-luan" className="hover:text-white transition">
                  Chính sách bình luận
                </Link>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-amber-500 hover:text-amber-400 transition"
                >
                  <Rss className="w-3.5 h-3.5 mr-1" />
                  Kênh RSS Tin tức
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hotline */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-700 pl-2">
              Đường dây nóng
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>Số 15 Lê Duẩn, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-white font-bold text-sm">1900 6868</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>toasoan@newsportal.vn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright bar */}
      <div className="bg-gray-950 py-4 px-4 text-xs text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-gray-500">
          <p>© {new Date().getFullYear()} NewsPortal. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-2 sm:mt-0 text-[11px]">
            Ghi rõ nguồn "NewsPortal" khi phát hành lại thông tin từ website này.
          </p>
        </div>
      </div>
    </footer>
  );
};
