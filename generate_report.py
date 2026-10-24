import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_report():
    doc = Document()

    # Set page margins to standard university thesis format (Top: 2cm, Bottom: 2cm, Left: 3cm, Right: 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.79)      # 2.0 cm
        section.bottom_margin = Inches(0.79)   # 2.0 cm
        section.left_margin = Inches(1.18)     # 3.0 cm
        section.right_margin = Inches(0.79)    # 2.0 cm

    # Set default style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(13)
    normal_style.font.color.rgb = RGBColor(30, 30, 30)
    normal_style.paragraph_format.line_spacing = 1.3
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Color Palette
    PRIMARY = RGBColor(139, 0, 0)      # Dark Red / Burgundy (#8B0000)
    SECONDARY = RGBColor(27, 54, 93)   # Deep Navy (#1B365D)
    GRAY = RGBColor(100, 100, 100)
    DARK_TEXT = RGBColor(33, 33, 33)

    # -------------------------------------------------------------
    # 1. TRANG BÌA (Cover Page)
    # -------------------------------------------------------------
    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_univ = p_univ.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\nTRƯỜNG ĐẠI HỌC CÔNG NGHỆ\nKHOA CÔNG NGHỆ THÔNG TIN\n-------------------------***-------------------------")
    r_univ.bold = True
    r_univ.font.size = Pt(13)
    r_univ.font.color.rgb = SECONDARY

    doc.add_paragraph("\n\n")

    p_title_sub = doc.add_paragraph()
    p_title_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_title_sub.add_run("BÁO CÁO ĐỒ ÁN MÔN HỌC / ĐỀ ÁN CHUYÊN NGÀNH\nNGÀNH: KỸ THUẬT PHẦN MỀM / CÔNG NGHỆ THÔNG TIN")
    r_sub.font.size = Pt(14)
    r_sub.bold = True
    r_sub.font.color.rgb = GRAY

    p_main_title = doc.add_paragraph()
    p_main_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_main = p_main_title.add_run("\nĐỀ TÀI:\nTHIẾT KẾ VÀ LẬP TRÌNH CỔNG THÔNG TIN ĐIỆN TỬ / WEBSITE TIN TỨC ĐA PHÂN HỆ VÀ PHÂN QUYỀN HOÀN CHỈNH\n(NEWSPORTAL)\n")
    r_main.font.size = Pt(18)
    r_main.bold = True
    r_main.font.color.rgb = PRIMARY

    doc.add_paragraph("\n\n")

    # Student & Advisor Box
    tbl_meta = doc.add_table(rows=5, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False

    meta_data = [
        ("Giảng viên hướng dẫn:", "ThS. Giảng viên phụ trách môn học"),
        ("Sinh viên thực hiện:", "Sinh viên Khóa K (Năm 3 - Học kỳ 1)"),
        ("Mã số sinh viên (MSSV):", "B22DCCN000 / IT2026-XXXX"),
        ("Lớp chuyên ngành:", "Kỹ thuật Phần mềm / Công nghệ Thông tin"),
        ("Hệ đào tạo:", "Chính quy - Niên khóa 2023 - 2027")
    ]

    for idx, (label, val) in enumerate(meta_data):
        cell_lbl = tbl_meta.cell(idx, 0)
        cell_val = tbl_meta.cell(idx, 1)
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(3.8)

        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r_lbl = p_lbl.add_run(label)
        r_lbl.bold = True
        r_lbl.font.size = Pt(13)

        p_val = cell_val.paragraphs[0]
        p_val.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r_val = p_val.add_run(val)
        r_val.font.size = Pt(13)

    doc.add_paragraph("\n\n\n")

    p_loc = doc.add_paragraph()
    p_loc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_loc = p_loc.add_run("Hà Nội / TP. Hồ Chí Minh – Năm 2026")
    r_loc.font.size = Pt(12)
    r_loc.italic = True
    r_loc.font.color.rgb = GRAY

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. LỜI CẢM ƠN & LỜI CAM ĐOAN
    # -------------------------------------------------------------
    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.font.size = Pt(16)
        r.bold = True
        r.font.color.rgb = PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.size = Pt(14)
        r.bold = True
        r.font.color.rgb = SECONDARY
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.size = Pt(13)
        r.bold = True
        r.italic = True
        r.font.color.rgb = DARK_TEXT
        return p

    def add_callout(text, bold_prefix=""):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.0)
        set_cell_background(cell, "F4F6F9")
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.25
        if bold_prefix:
            r_b = p.add_run(bold_prefix + " ")
            r_b.bold = True
            r_b.font.size = Pt(12)
            r_b.font.color.rgb = SECONDARY
        r_t = p.add_run(text)
        r_t.font.size = Pt(12)
        r_t.italic = True
        doc.add_paragraph()

    add_heading_1("LỜI CẢM ƠN")
    doc.add_paragraph(
        "Lời đầu tiên, em xin gửi lời cảm ơn chân thành và sâu sắc nhất đến toàn thể Quý Thầy, Cô Khoa Công nghệ Thông tin "
        "đã tận tình giảng dạy, truyền đạt những kiến thức chuyên môn quý báu về Lập trình Web, Công nghệ phần mềm, Cơ sở dữ liệu "
        "và An toàn bảo mật thông tin trong suốt quá trình em học tập tại nhà trường."
    )
    doc.add_paragraph(
        "Đặc biệt, em xin bày tỏ lòng biết ơn sâu sắc đến Giảng viên hướng dẫn học phần Đề án / Đồ án chuyên ngành, "
        "người đã luôn định hướng, tận tình chỉ dẫn và đóng góp những ý kiến học thuật chuẩn mực để em hoàn thành đề tài "
        "\"Xây dựng Cổng thông tin điện tử / Website tin tức hoàn chỉnh (NewsPortal)\" một cách chỉnh chu nhất."
    )
    doc.add_paragraph(
        "Mặc dù đã nỗ lực vận dụng các kiến thức đã học vào thực tế, song do giới hạn về thời gian và kinh nghiệm thực chiến, "
        "đề tài khó tránh khỏi những thiếu sót. Em rất mong nhận được những lời nhận xét, góp ý quý báu của Quý Thầy, Cô "
        "để sản phẩm phần mềm ngày một hoàn thiện hơn."
    )

    add_heading_1("LỜI CAM ĐOAN")
    doc.add_paragraph(
        "Em xin cam đoan đề án \"Xây dựng Cổng thông tin điện tử hoàn chỉnh (NewsPortal)\" là công trình nghiên cứu và lập trình "
        "thực tế do chính em tìm hiểu, thiết kế và phát triển dưới sự hướng dẫn của Giảng viên phụ trách. Toàn bộ mã nguồn, cơ sở dữ liệu, "
        "kết quả kiểm thử và số liệu trình bày trong báo cáo là trung thực, độc lập và không sao chép từ bất kỳ đồ án nào khác."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3. MỤC LỤC & DANH MỤC THUẬT NGỮ
    # -------------------------------------------------------------
    add_heading_1("MỤC LỤC TỔNG QUAN BÁO CÁO")
    toc_items = [
        ("LỜI MỞ ĐẦU", "1"),
        ("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KHẢO SÁT THỰC TRẠNG", "3"),
        ("   1.1. Lý do chọn đề tài và tính cấp thiết", "3"),
        ("   1.2. Khảo sát các cổng thông tin điện tử tiêu biểu", "4"),
        ("   1.3. Mục tiêu và phạm vi xây dựng đề tài", "5"),
        ("CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG", "6"),
        ("   2.1. Yêu cầu chức năng (Functional Requirements)", "6"),
        ("   2.2. Yêu cầu phi chức năng (Non-Functional Requirements)", "8"),
        ("   2.3. Sơ đồ Use Case tổng quát và các tác nhân", "9"),
        ("CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU", "11"),
        ("   3.1. Kiến trúc hệ thống tổng thể (Client - Server RESTful)", "11"),
        ("   3.2. Lựa chọn công nghệ & Thư viện bổ trợ", "12"),
        ("   3.3. Thiết kế Cơ sở dữ liệu MongoDB Atlas với Prisma ORM", "14"),
        ("   3.4. Thiết kế Ma trận phân quyền đa cấp bậc (RBAC Matrix)", "18"),
        ("CHƯƠNG 4: HIỆN THỰC HÓA VÀ CÀI ĐẶT CÁC PHÂN HỆ", "20"),
        ("   4.1. Cấu trúc tổ chức mã nguồn (Project Architecture)", "20"),
        ("   4.2. Hiện thực hóa Phân hệ Công khai (Public Portal)", "21"),
        ("   4.3. Hiện thực hóa Quy trình Biên tập Tòa soạn (Editorial Workflow)", "23"),
        ("   4.4. Hiện thực hóa Phân hệ Quản trị Admin và Bảo mật tài khoản", "25"),
        ("CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾT QUẢ", "28"),
        ("   5.1. Chiến lược và môi trường kiểm thử", "28"),
        ("   5.2. Kết quả kiểm thử tự động Backend (Vitest & Supertest)", "29"),
        ("   5.3. Kết quả kiểm thử giao diện & End-to-End (Playwright)", "31"),
        ("   5.4. Đánh giá kết quả đạt được so với yêu cầu đề tài", "32"),
        ("KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", "34"),
        ("TÀI LIỆU THAM KHẢO", "36"),
        ("PHỤ LỤC: DANH SÁCH TÀI KHOẢN VÀ HƯỚNG DẪN KHỞI ĐỘNG HỆ THỐNG", "37"),
    ]

    for title, pg in toc_items:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.line_spacing = 1.15
        p_t.paragraph_format.space_after = Pt(3)
        r1 = p_t.add_run(title)
        if "CHƯƠNG" in title or "LỜI" in title or "KẾT" in title or "TÀI LIỆU" in title or "PHỤ LỤC" in title:
            r1.bold = True
            r1.font.color.rgb = SECONDARY
        else:
            r1.font.size = Pt(12)
        r2 = p_t.add_run(f" {' .' * (35 - len(title)//2)} {pg}")
        r2.font.color.rgb = GRAY

    doc.add_paragraph()
    add_heading_2("DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT")
    abbr_data = [
        ("API", "Application Programming Interface (Giao diện lập trình ứng dụng)"),
        ("REST", "Representational State Transfer (Kiến trúc truyền trạng thái đại diện)"),
        ("RBAC", "Role-Based Access Control (Kiểm soát truy cập dựa trên vai trò)"),
        ("ORM / ODM", "Object Relational / Document Mapping (Ánh xạ đối tượng - cơ sở dữ liệu)"),
        ("JWT", "JSON Web Token (Tiêu chuẩn mở xác thực mã hóa người dùng)"),
        ("SPA", "Single Page Application (Ứng dụng web một trang tải động)"),
        ("XSS", "Cross-Site Scripting (Tấn công chèn mã kịch bản độc hại)"),
        ("CSRF", "Cross-Site Request Forgery (Tấn công giả mạo yêu cầu từ trang chéo)"),
        ("E2E", "End-to-End Testing (Kiểm thử tự động toàn diện đầu-cuối)"),
        ("NoSQL", "Non-Relational SQL (Cơ sở dữ liệu phi quan hệ hướng tài liệu)"),
        ("SEO", "Search Engine Optimization (Tối ưu hóa công cụ tìm kiếm)")
    ]

    tbl_abbr = doc.add_table(rows=len(abbr_data)+1, cols=2)
    tbl_abbr.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_abbr)
    
    # Header
    cell_h1 = tbl_abbr.cell(0, 0)
    cell_h2 = tbl_abbr.cell(0, 1)
    cell_h1.width = Inches(1.8)
    cell_h2.width = Inches(4.2)
    set_cell_background(cell_h1, "1B365D")
    set_cell_background(cell_h2, "1B365D")
    p1 = cell_h1.paragraphs[0].add_run("Từ viết tắt")
    p1.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)
    p2 = cell_h2.paragraphs[0].add_run("Định nghĩa / Ý nghĩa chuyên môn")
    p2.bold = True
    p2.font.color.rgb = RGBColor(255, 255, 255)

    for i, (k, v) in enumerate(abbr_data):
        c1 = tbl_abbr.cell(i+1, 0)
        c2 = tbl_abbr.cell(i+1, 1)
        c1.width = Inches(1.8)
        c2.width = Inches(4.2)
        if i % 2 == 1:
            set_cell_background(c1, "F8F9FA")
            set_cell_background(c2, "F8F9FA")
        r_k = c1.paragraphs[0].add_run(k)
        r_k.bold = True
        r_k.font.size = Pt(11)
        r_v = c2.paragraphs[0].add_run(v)
        r_v.font.size = Pt(11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4. LỜI MỞ ĐẦU
    # -------------------------------------------------------------
    add_heading_1("LỜI MỞ ĐẦU")
    doc.add_paragraph(
        "Trong kỷ nguyên bùng nổ thông tin và chuyển đổi số mạnh mẽ hiện nay, báo điện tử và các cổng thông tin trực tuyến "
        "đã trở thành phương tiện thiết yếu giúp người dân tiếp cận thông tin thời sự, kinh tế, xã hội và công nghệ một cách "
        "nhanh chóng và chính xác nhất. Không giống như các trang blog cá nhân hay website tĩnh đơn giản, một hệ thống Báo điện tử "
        "chuyên nghiệp đòi hỏi một kiến trúc phần mềm phức tạp, khả năng xử lý khối lượng dữ liệu lớn, tính năng tương tác đa chiều "
        "và đặc biệt là quy trình xuất bản đa tầng bảo đảm tính chuẩn xác của tin bài."
    )
    doc.add_paragraph(
        "Đề án \"Xây dựng Cổng thông tin điện tử / Website tin tức hoàn chỉnh (NewsPortal)\" được triển khai nhằm giải quyết "
        "trọn vẹn bài toán xây dựng một hệ thống tòa soạn điện tử hiện đại. Đề án áp dụng những công nghệ web hàng đầu: "
        "Frontend xây dựng bằng React 18, TypeScript, Tailwind CSS, Vite; Backend xây dựng bằng Node.js, Express, TypeScript theo chuẩn RESTful API; "
        "Cơ sở dữ liệu đám mây MongoDB Atlas kết hợp cùng Prisma ORM để quản lý dữ liệu linh hoạt, an toàn và hiệu năng cao."
    )
    doc.add_paragraph(
        "Điểm mấu chốt và khác biệt của đề án là tính chất \"Production-Ready\" – sản phẩm thực tế, loại bỏ hoàn toàn dữ liệu giả, "
        "tích hợp hệ thống phân quyền 6 cấp độ (Super Admin, Admin, Editor, Author, User, Guest), quy trình biên tập nghiêm ngặt "
        "và được kiểm thử tự động 100% bằng bộ công cụ hiện đại Vitest và Playwright."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 5. CHƯƠNG 1: TỔNG QUAN VÀ KHẢO SÁT HỆ THỐNG
    # -------------------------------------------------------------
    add_heading_1("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KHẢO SÁT THỰC TRẠNG")
    
    add_heading_2("1.1. Lý do chọn đề tài và tính cấp thiết")
    doc.add_paragraph(
        "Nhu cầu đọc tin tức trực tuyến của độc giả Việt Nam ngày càng đòi hỏi cao hơn về mặt trải nghiệm: tốc độ tải trang nhanh, "
        "giao diện thích ứng trên điện thoại (Mobile Responsive), cấu trúc bố cục mạch lạc và khả năng tương tác (bình luận, lưu bài, thích tin). "
        "Về phía ban biên tập, nhu cầu số hóa quy trình tác nghiệp của phóng viên, biên tập viên và lãnh đạo cơ quan báo chí "
        "yêu cầu một công cụ quản trị tinh gọn, phân quyền rõ ràng, tránh tuyệt đối sai sót trong việc đưa tin chưa kiểm duyệt lên trang nhất."
    )
    doc.add_paragraph(
        "Đề án này là cơ hội thực hành toàn diện kiến thức của sinh viên năm thứ 3: từ khảo sát nghiệp vụ báo chí, thiết kế kiến trúc phần mềm, "
        "xây dựng cơ sở dữ liệu hướng tài liệu, bảo mật xác thực phiên đăng nhập cho tới tự động hóa quy trình kiểm thử phần mềm."
    )

    add_heading_2("1.2. Khảo sát các cổng thông tin điện tử tiêu biểu")
    doc.add_paragraph(
        "Qua khảo sát các hệ thống báo điện tử hàng đầu tại Việt Nam như VnExpress, Tuổi Trẻ Online, Dân Trí và Vietnamnet, "
        "nhóm nghiên cứu rút ra những đặc trưng cốt lõi cần phải đáp ứng trong NewsPortal:"
    )
    doc.add_paragraph("• Phân cấp chuyên mục rõ ràng: Cây danh mục gồm danh mục cha và các danh mục con chuyên sâu.")
    doc.add_paragraph("• Khu vực tin nổi bật (Featured News / Editor's Pick): Trình bày trang trọng ở vị trí đầu trang với ảnh đại diện tỷ lệ chuẩn.")
    doc.add_paragraph("• Đa dạng phân loại tin: Tin mới nhất, tin xem nhiều nhất, tin theo dòng sự kiện (Tag).")
    doc.add_paragraph("• Quy trình tòa soạn khép kín: Bản nháp (Draft) -> Chờ duyệt (Pending) -> Đã xuất bản (Published) -> Lưu trữ (Archived).")

    add_heading_2("1.3. Mục tiêu và phạm vi xây dựng đề tài")
    doc.add_paragraph("Đề tài đặt ra các mục tiêu cụ thể:")
    doc.add_paragraph("1. Xây dựng Cổng thông tin công khai (Public Portal): Cung cấp trải nghiệm đọc báo mượt mà, tối ưu SEO, hỗ trợ tìm kiếm không dấu/có dấu, tương tác bình luận, lưu tin bài.")
    doc.add_paragraph("2. Xây dựng Bảng điều khiển Quản trị tòa soạn (Admin Panel): Cung cấp công cụ quản lý toàn diện bài viết, chuyên mục, thẻ tag, media ảnh, tài khoản người dùng, nhật ký audit logs.")
    doc.add_paragraph("3. Thiết kế hệ thống phân quyền chặt chẽ (RBAC): Đảm bảo đúng người đúng việc, tác giả không thể tự duyệt bài hay can thiệp vào tài khoản nhân sự cấp cao.")
    doc.add_paragraph("4. Triển khai Cơ sở dữ liệu đám mây (Cloud Database): Tích hợp MongoDB Atlas giúp hệ thống sẵn sàng hoạt động thực tế trên Internet mọi lúc mọi nơi.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 6. CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG
    # -------------------------------------------------------------
    add_heading_1("CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG")

    add_heading_2("2.1. Yêu cầu chức năng (Functional Requirements)")
    doc.add_paragraph("Hệ thống NewsPortal được phân rã thành các nhóm chức năng chính như sau:")

    add_heading_3("2.1.1. Phân hệ Dành cho Khách vãng lai và Độc giả (Public Portal)")
    doc.add_paragraph("• Trang chủ (Homepage): Hiển thị tiêu điểm nổi bật, khối tin mới nhất, khối tin chuyên mục, tin đọc nhiều nhất và thanh xu hướng.")
    doc.add_paragraph("• Trang chuyên mục (Category Page): Lọc danh sách bài viết theo chuyên mục cha/con, hỗ trợ sắp xếp theo ngày đăng và lượt xem, phân trang chuẩn.")
    doc.add_paragraph("• Trang chi tiết bài viết (Article Detail): Hiển thị tiêu đề, Sapo (tóm tắt), nội dung đa phương tiện HTML, thời gian đọc ước tính, tác giả, chuyên mục, thẻ tag liên quan, bài viết cùng chủ đề.")
    doc.add_paragraph("• Tìm kiếm tin tức (Search): Hỗ trợ tìm kiếm theo tiêu đề, mô tả và nội dung, hỗ trợ từ khóa tiếng Việt không phân biệt hoa thường.")
    doc.add_paragraph("• Tương tác bài viết: Bình luận phân cấp đa tầng (Parent-Child Replies), thả tim thích bài viết (Like), đánh dấu lưu bài viết vào danh sách đọc sau (Bookmark).")
    doc.add_paragraph("• Trang bổ sung: Giới thiệu, Liên hệ tòa soạn, Điều khoản dịch vụ, Chính sách bảo mật, Chính sách bình luận.")

    add_heading_3("2.1.2. Phân hệ Dành cho Phóng viên / Tác giả (Author / Journalist)")
    doc.add_paragraph("• Soạn thảo bài viết: Tạo bài viết mới, chỉnh sửa bài viết của chính mình, nhập Sapo, nội dung định dạng phong phú, chọn ảnh bìa tải lên từ máy tính, gắn chuyên mục và thẻ tag.")
    doc.add_paragraph("• Quản lý trạng thái bài viết: Lưu bản nháp (DRAFT), gửi bài chờ duyệt (PENDING). Bị giới hạn không được tự ý xuất bản thẳng (PUBLISHED).")
    doc.add_paragraph("• Bảng điều khiển cá nhân (Dashboard Scoped): Xem thống kê số lượng bài viết, lượt xem tích lũy của chính tác giả.")

    add_heading_3("2.1.3. Phân hệ Dành cho Biên tập viên (Editor)")
    doc.add_paragraph("• Phê duyệt tin bài: Duyệt các bài viết ở trạng thái PENDING sang PUBLISHED hoặc gỡ bài về DRAFT.")
    doc.add_paragraph("• Thiết lập vị trí tin: Đặt làm tin nổi bật (isFeatured) hoặc bài viết do tòa soạn đề xuất (isEditorPick).")
    doc.add_paragraph("• Quản trị danh mục & thẻ: Tạo, sửa tên, đổi slug danh mục và thẻ từ khóa.")
    doc.add_paragraph("• Kiểm duyệt bình luận: Duyệt bình luận hợp lệ, gắn cờ SPAM hoặc xóa bình luận vi phạm đạo đức báo chí.")

    add_heading_3("2.1.4. Phân hệ Dành cho Quản trị viên (Admin & Super Admin)")
    doc.add_paragraph("• Quản lý tài khoản: Xem danh sách thành viên, khóa/mở khóa tài khoản, phân quyền vai trò nhân sự.")
    doc.add_paragraph("• Nhật ký kiểm toán (Audit Logs): Ghi nhận toàn bộ thao tác nhạy cảm: IP, trình duyệt, hành động tạo/sửa/xóa, thời gian chi tiết.")
    doc.add_paragraph("• Cấu hình hệ thống: Cập nhật tên tòa soạn, hotline, email, mạng xã hội và thông tin chân trang.")

    add_heading_2("2.2. Yêu cầu phi chức năng (Non-Functional Requirements)")
    doc.add_paragraph("• Tính bảo mật (Security): Mật khẩu người dùng được băm an toàn bằng thuật toán Bcrypt/Argon2. Xác thực phiên bằng JSON Web Token (JWT) và Cookie HttpOnly. Kiểm tra lọc mã độc XSS trong nội dung HTML bằng DOMPurify/sanitize-html. Giới hạn tần suất gọi API (Rate Limiting).")
    doc.add_paragraph("• Hiệu năng (Performance): Thời gian phản hồi API dưới 200ms đối với các tác vụ truy vấn cơ bản. Giao diện SPA tải trang bất đồng bộ, sử dụng React Query để tự động caching dữ liệu.")
    doc.add_paragraph("• Tính tương thích (Compatibility): Đáp ứng tốt trên trình duyệt Chrome, Edge, Firefox, Safari. Bố cục Responsive mượt mà trên Desktop, Tablet và Smartphone.")
    doc.add_paragraph("• Chuẩn SEO: URL thân thiện dạng slug tiếng Việt (ví dụ: /bai-viet/viet-nam-phat-trien-cong-nghiep-ban-dan), tự động tạo meta title và meta description.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 7. CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU
    # -------------------------------------------------------------
    add_heading_1("CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU")

    add_heading_2("3.1. Kiến trúc hệ thống tổng thể")
    doc.add_paragraph(
        "Hệ thống NewsPortal được thiết kế theo kiến trúc 3 tầng phân tách độc lập (3-Tier Decoupled Architecture):"
    )
    doc.add_paragraph("1. Tầng Trình diễn (Presentation Layer - Frontend): Xây dựng bằng React 18 SPA, giao tiếp với máy chủ thông qua giao thức HTTP RESTful API bất đồng bộ với định dạng dữ liệu chuẩn JSON.")
    doc.add_paragraph("2. Tầng Nghiệp vụ (Application / Business Logic Layer - Backend): Xây dựng trên nền Node.js và Express, chia tách các lớp rõ ràng: Routing, Controller, Middleware, Validator và Utilities.")
    doc.add_paragraph("3. Tầng Dữ liệu (Data Persistence Layer): Cơ sở dữ liệu đám mây MongoDB Atlas kết nối qua Prisma ORM, đảm bảo tính nhất quán của cấu trúc tài liệu và tự động tạo Schema Indexing.")

    add_heading_2("3.2. Lựa chọn công nghệ & Thư viện sử dụng")
    
    tech_table = [
        ("Thành phần", "Công nghệ sử dụng", "Lý do lựa chọn / Ưu điểm nổi bật"),
        ("Frontend Framework", "React 18 + TypeScript", "Cung cấp Virtual DOM hiệu năng cao, kiểm soát kiểu tĩnh an toàn, kiến trúc Component tái sử dụng."),
        ("Build Tool", "Vite 6", "Tốc độ biên dịch siêu tốc, hỗ trợ Hot Module Replacement (HMR) tức thời."),
        ("CSS Framework", "Tailwind CSS", "Utility-first CSS, thiết kế giao diện tin tức hiện đại, tối ưu dung lượng CSS sản phẩm."),
        ("State & Cache", "TanStack React Query v5", "Tự động quản lý caching dữ liệu, tự động đồng bộ hóa trạng thái server-state, giảm thiểu tải mạng."),
        ("Form Validation", "React Hook Form + Zod", "Kiểm tra dữ liệu biểu mẫu chặt chẽ ở Client, hiệu năng cao không gây re-render thừa."),
        ("Backend Framework", "Node.js + Express + TS", "Non-blocking I/O hướng sự kiện, xử lý đồng thời lượng lớn yêu cầu đọc tin tức."),
        ("Database Engine", "MongoDB Atlas (Cloud)", "Cơ sở dữ liệu đám mây NoSQL hàng đầu thế giới, linh hoạt cấu trúc tin tức đa phương tiện, bảo mật cao."),
        ("Database ORM", "Prisma ORM v5", "Type-safe database client, tự động tạo mô hình dữ liệu TypeScript, ngăn ngừa lỗi cú pháp truy vấn."),
        ("Bảo mật & Auth", "JWT + Bcrypt", "Xác thực không trạng thái (Stateless), băm mật khẩu chuẩn mã hóa công nghiệp."),
        ("Testing Suite", "Vitest + Playwright", "Kiểm thử tự động từ Unit, API Integration cho tới kiểm thử trình duyệt thực tế E2E.")
    ]

    tbl_tech = doc.add_table(rows=len(tech_table), cols=3)
    tbl_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_tech)

    for r_idx, row in enumerate(tech_table):
        for c_idx, val in enumerate(row):
            cell = tbl_tech.cell(r_idx, c_idx)
            if r_idx == 0:
                set_cell_background(cell, "1B365D")
                r = cell.paragraphs[0].add_run(val)
                r.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F8F9FA")
                r = cell.paragraphs[0].add_run(val)
                r.font.size = Pt(11)
                if c_idx == 0:
                    r.bold = True

    doc.add_paragraph()
    add_heading_2("3.3. Thiết kế Cơ sở dữ liệu MongoDB Atlas với Prisma ORM")
    doc.add_paragraph(
        "Hệ thống thiết kế 15 Collections với các chỉ mục tối ưu hóa, đảm bảo tính toàn vẹn dữ liệu và khả năng mở rộng cao:"
    )

    models_desc = [
        ("User", "Lưu trữ thông tin người dùng: họ tên, email (@unique), mật khẩu mã hóa, ảnh đại diện, vai trò (Role), trạng thái kích hoạt (isActive)."),
        ("Category", "Cấu trúc chuyên mục tin tức đa cấp: tên, slug (@unique), mô tả, thứ tự sắp xếp, khóa ngoại tự tham chiếu parentId."),
        ("Tag", "Thẻ từ khóa gắn cho bài viết: tên tag, slug (@unique), dùng để nhóm các dòng sự kiện nóng."),
        ("Article", "Thực thể trọng tâm lưu trữ tin tức: tiêu đề, slug, tóm tắt sapo, nội dung HTML, ảnh bìa, trạng thái xuất bản, lượt xem, thời gian đọc, SEO meta, cờ tin nổi bật (isFeatured), tác giả (authorId), chuyên mục (categoryId)."),
        ("ArticleTag", "Bảng quan hệ nhiều - nhiều giữa bài viết và thẻ từ khóa, đánh chỉ mục hỗn hợp @@unique([articleId, tagId])."),
        ("Comment", "Bình luận độc giả: nội dung, trạng thái duyệt (PENDING, APPROVED, SPAM), liên kết bài viết, người bình luận và hỗ trợ trả lời lồng nhau (parentId)."),
        ("ArticleLike", "Lưu trữ lượt thích bài viết của độc giả, ràng buộc @@unique([articleId, userId]) chống thích trùng lặp."),
        ("Bookmark", "Lưu trữ bài viết đánh dấu yêu thích của độc giả, ràng buộc @@unique([articleId, userId])."),
        ("Media", "Quản lý tệp đa phương tiện tải lên: tên gốc, tên tệp an toàn trên máy chủ, đường dẫn URL, định dạng MIME type, dung lượng tệp và người tải lên."),
        ("StaticPage", "Các bài viết trang tĩnh cố định của website: Giới thiệu, Chính sách bảo mật, Điều khoản dịch vụ, Chính sách bình luận."),
        ("SiteSetting", "Cấu hình động toàn hệ thống dưới dạng cặp Key - Value: Tên báo, Hotline, Email tòa soạn, Logo, Bản quyền chân trang."),
        ("AuditLog", "Nhật ký kiểm toán an ninh: Lưu lại hành động quản trị, thực thể bị tác động, người thực hiện, địa chỉ IP và trình duyệt."),
        ("PasswordResetToken", "Token khôi phục mật khẩu sử dụng một lần, có thời hạn hết hiệu lực (expiresAt) và đánh dấu usedAt."),
        ("RefreshToken", "Token làm mới phiên đăng nhập JWT dài hạn, hỗ trợ thu hồi token khi đăng xuất (revokedAt)."),
        ("ContactMessage", "Hòm thư liên hệ độc giả gửi về tòa soạn: họ tên, email, số điện thoại, tiêu đề, nội dung và trạng thái đã đọc.")
    ]

    tbl_models = doc.add_table(rows=len(models_desc)+1, cols=2)
    tbl_models.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_models)

    tbl_models.cell(0, 0).width = Inches(1.8)
    tbl_models.cell(0, 1).width = Inches(4.2)
    set_cell_background(tbl_models.cell(0, 0), "1B365D")
    set_cell_background(tbl_models.cell(0, 1), "1B365D")
    tbl_models.cell(0, 0).paragraphs[0].add_run("Tên Collection (Model)").bold = True
    tbl_models.cell(0, 0).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    tbl_models.cell(0, 1).paragraphs[0].add_run("Mô tả chi tiết trường & Vai trò trong hệ thống").bold = True
    tbl_models.cell(0, 1).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)

    for i, (m, desc) in enumerate(models_desc):
        c1 = tbl_models.cell(i+1, 0)
        c2 = tbl_models.cell(i+1, 1)
        c1.width = Inches(1.8)
        c2.width = Inches(4.2)
        if i % 2 == 1:
            set_cell_background(c1, "F8F9FA")
            set_cell_background(c2, "F8F9FA")
        r_m = c1.paragraphs[0].add_run(m)
        r_m.bold = True
        r_m.font.size = Pt(11)
        r_d = c2.paragraphs[0].add_run(desc)
        r_d.font.size = Pt(11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 8. MA TRẬN PHÂN QUYỀN (RBAC)
    # -------------------------------------------------------------
    add_heading_2("3.4. Thiết kế Ma trận phân quyền đa cấp bậc (RBAC Matrix)")
    doc.add_paragraph(
        "Nhằm bảo đảm tính toàn vẹn thông tin và quy trình kiểm soát nghiêm ngặt của một tòa soạn điện tử, "
        "hệ thống phân định 6 cấp độ vai trò với ranh giới quyền hạn được cưỡng chế ở cả 2 tầng Backend và Frontend:"
    )

    rbac_rows = [
        ("Chức năng / Quyền hạn", "SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR", "USER", "GUEST"),
        ("Xem tin tức công khai", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Cho phép"),
        ("Bình luận bài viết", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Từ chối (401)"),
        ("Thích & Lưu bài viết", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Từ chối (401)"),
        ("Xóa bình luận của mình", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Từ chối (401)"),
        ("Xóa bình luận của người khác", "Cho phép", "Cho phép", "Cho phép", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Truy cập Bảng điều khiển Admin", "Toàn quyền", "Toàn quyền", "Khu Tòa soạn", "Tin cá nhân", "Từ chối (403)", "Từ chối (401)"),
        ("Tạo bài viết mới (Draft/Pending)", "Cho phép", "Cho phép", "Cho phép", "Cho phép", "Từ chối (403)", "Từ chối (401)"),
        ("Tự xuất bản bài viết (PUBLISHED)", "Cho phép", "Cho phép", "Cho phép", "Bị ép PENDING", "Từ chối (403)", "Từ chối (401)"),
        ("Đặt cờ tin nổi bật (isFeatured)", "Cho phép", "Cho phép", "Cho phép", "Bị ép FALSE", "Từ chối (403)", "Từ chối (401)"),
        ("Xóa bài viết đã PUBLISHED", "Cho phép", "Cho phép", "Cho phép", "Bị cấm (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Quản lý Chuyên mục / Thẻ tag", "Toàn quyền", "Toàn quyền", "Tạo & Sửa", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Kiểm duyệt bình luận toàn hệ thống", "Cho phép", "Cho phép", "Cho phép", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Quản lý tài khoản người dùng", "Toàn quyền", "Xem/Khóa thường", "Từ chối (403)", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Khóa / Hạ quyền Super Admin", "Bảo vệ hệ thống", "Từ chối (403)", "Từ chối (403)", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Xem Nhật ký thao tác (Audit Logs)", "Cho phép", "Cho phép", "Từ chối (403)", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)"),
        ("Cấu hình website & Trang tĩnh", "Cho phép", "Cho phép", "Từ chối (403)", "Từ chối (403)", "Từ chối (403)", "Từ chối (401)")
    ]

    tbl_rbac = doc.add_table(rows=len(rbac_rows), cols=7)
    tbl_rbac.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_rbac)

    for r_idx, row in enumerate(rbac_rows):
        for c_idx, val in enumerate(row):
            cell = tbl_rbac.cell(r_idx, c_idx)
            if r_idx == 0:
                set_cell_background(cell, "8B0000")
                r = cell.paragraphs[0].add_run(val)
                r.bold = True
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "FBFBFB")
                r = cell.paragraphs[0].add_run(val)
                r.font.size = Pt(9.5)
                if "Cho phép" in val or "Toàn quyền" in val:
                    r.font.color.rgb = RGBColor(0, 100, 0)
                    r.bold = True
                elif "Từ chối" in val or "Bị cấm" in val:
                    r.font.color.rgb = RGBColor(180, 0, 0)
                elif "Bị ép" in val or "Bảo vệ" in val:
                    r.font.color.rgb = RGBColor(180, 100, 0)
                    r.italic = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 9. CHƯƠNG 4: HIỆN THỰC HÓA VÀ CÀI ĐẶT HỆ THỐNG
    # -------------------------------------------------------------
    add_heading_1("CHƯƠNG 4: HIỆN THỰC HÓA VÀ CÀI ĐẶT CÁC PHÂN HỆ")

    add_heading_2("4.1. Cấu trúc tổ chức mã nguồn (Project Architecture)")
    doc.add_paragraph("Mã nguồn dự án được tổ chức khoa học theo mô hình Monorepo 2 tầng Backend và Frontend:")
    
    code_structure = (
        "BAITAP THI T2/\n"
        "├── backend/\n"
        "│   ├── prisma/             # Schema MongoDB và script Seeding dữ liệu mẫu\n"
        "│   ├── src/\n"
        "│   │   ├── config/         # Cấu hình Prisma Client, biến môi trường\n"
        "│   │   ├── controllers/    # Xử lý logic nghiệp vụ (Admin, Auth, Article, Comment...)\n"
        "│   │   ├── middlewares/    # Xác thực JWT, phân quyền Role, Upload ảnh, Rate limiter\n"
        "│   │   ├── routes/         # Định tuyến RESTful API chuyên biệt\n"
        "│   │   ├── utils/          # Xử lý Slug tiếng Việt, làm sạch HTML, ghi Audit log\n"
        "│   │   └── validators/     # Kiểm tra dữ liệu đầu vào bằng Zod\n"
        "│   └── tests/              # Bộ kiểm thử tự động API và RBAC (Vitest, Supertest)\n"
        "├── frontend/\n"
        "│   ├── src/\n"
        "│   │   ├── components/     # UI Component tái sử dụng (Header, Footer, Cards, Modal...)\n"
        "│   │   ├── context/        # Quản lý trạng thái phiên đăng nhập (AuthContext)\n"
        "│   │   ├── layouts/        # Layout chính (MainLayout, AdminLayout, AuthLayout)\n"
        "│   │   ├── pages/          # Trang màn hình chức năng công khai và trang quản trị\n"
        "│   │   ├── routes/         # Bộ định tuyến React Router và ProtectedRoute phân quyền\n"
        "│   │   └── services/       # Cấu hình gọi API Axios và interceptors\n"
        "│   └── e2e/                # Kịch bản kiểm thử tự động toàn diện Playwright E2E\n"
        "├── khoi-dong.bat           # File khởi động 1-click tự động kết nối MongoDB Cloud\n"
        "└── docker-compose.yml      # Cấu hình containerization"
    )

    tbl_code = doc.add_table(rows=1, cols=1)
    tbl_code.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_code = tbl_code.cell(0, 0)
    c_code.width = Inches(6.0)
    set_cell_background(c_code, "2D3748")
    set_cell_margins(c_code, top=140, bottom=140, left=180, right=180)
    p_code = c_code.paragraphs[0]
    p_code.paragraph_format.line_spacing = 1.15
    p_code.paragraph_format.space_after = Pt(0)
    r_c = p_code.add_run(code_structure)
    r_c.font.name = "Consolas"
    r_c.font.size = Pt(9.5)
    r_c.font.color.rgb = RGBColor(240, 240, 240)

    doc.add_paragraph()
    add_heading_2("4.2. Hiện thực hóa các tính năng tiêu biểu")

    add_heading_3("4.2.1. Cơ chế xác thực không trạng thái JWT & Bảo mật tài khoản")
    doc.add_paragraph(
        "Hệ thống sử dụng cơ chế Access Token (ngắn hạn: 7 ngày) kết hợp Refresh Token (dài hạn: 30 ngày) "
        "lưu trong cơ sở dữ liệu MongoDB. Mật khẩu được mã hóa an toàn bằng thuật toán Bcrypt với Salt round = 10. "
        "Mọi endpoint yêu cầu xác thực đều đi qua middleware `authenticate` để giải mã token và gắn thông tin người dùng "
        "vào đối tượng `req.user`."
    )

    add_heading_3("4.2.2. Kiểm soát ranh giới phân quyền nghiêm ngặt (RBAC Middleware & Route Guards)")
    doc.add_paragraph(
        "Tại Backend, các middleware chuyên biệt như `requireAdmin`, `requireEditor`, `requireStaff` được áp dụng chặt chẽ "
        "trước mỗi route API. Nếu người dùng cố tình thực hiện thao tác vượt quyền, hệ thống lập tức trả về mã lỗi HTTP 403 Forbidden."
    )
    doc.add_paragraph(
        "Tại Frontend, component `ProtectedRoute` bao bọc lấy từng route con của khu vực `/admin`. "
        "Nếu người dùng gõ URL trực tiếp trên trình duyệt mà không đủ quyền, màn hình sẽ hiển thị cảnh báo đỏ từ chối truy cập (403) "
        "kèm thông tin vai trò hiện tại và nút quay về trang tương ứng."
    )

    add_heading_3("4.2.3. Quy trình biên tập tòa soạn khép kín và an toàn")
    doc.add_paragraph(
        "• Khi tác giả (Author) tạo bài viết mới hoặc sửa bài viết: Nếu gửi trạng thái `PUBLISHED` hoặc cố tình gán cờ "
        "`isFeatured = true`, Backend tự động cưỡng chế chuyển thành `PENDING` và `false`. "
        "Điều này ngăn ngừa triệt để nguy cơ tin chưa qua biên tập bị xuất hiện trên trang nhất."
    )
    doc.add_paragraph(
        "• Tác giả không được phép tự xóa bài viết đã xuất bản (`PUBLISHED`). Thao tác xóa bài đã duyệt bị từ chối và hướng dẫn "
        "tác giả liên hệ Ban biên tập."
    )
    doc.add_paragraph(
        "• Biên tập viên (Editor) là người duy nhất có quyền xem xét các bài viết PENDING của toàn bộ phóng viên, "
        "thực hiện xuất bản ngay hoặc gỡ xuất bản về bản nháp (DRAFT)."
    )

    add_heading_3("4.2.4. Tối ưu hóa SEO và xử lý tiếng Việt không dấu")
    doc.add_paragraph(
        "Hệ thống xây dựng hàm tiện ích `slugifyVietnamese` chuyển đổi các tiêu đề tiếng Việt có dấu thành chuỗi URL thân thiện "
        "(ví dụ: \"Thời sự quốc tế\" -> \"thoi-su-quoc-te\"). Trong trường hợp bị trùng slug, hệ thống tự động sinh thêm hậu tố "
        "mã thời gian để đảm bảo chỉ mục duy nhất (@unique) trên MongoDB."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 10. CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾT QUẢ
    # -------------------------------------------------------------
    add_heading_1("CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾT QUẢ")

    add_heading_2("5.1. Chiến lược kiểm thử")
    doc.add_paragraph(
        "Để đảm bảo hệ thống đạt tiêu chuẩn chất lượng cao và không có lỗi tiềm ẩn trước khi đưa vào đánh giá bảo vệ, "
        "đề án áp dụng chiến lược kiểm thử tự động toàn diện theo mô hình Kim tự tháp kiểm thử (Test Pyramid):"
    )
    doc.add_paragraph("1. Kiểm thử tích hợp Backend (API & RBAC Integration Testing): Sử dụng Vitest và Supertest để kiểm tra trực tiếp các phản hồi HTTP, mã trạng thái và tính toàn vẹn của dữ liệu trong MongoDB Atlas.")
    doc.add_paragraph("2. Kiểm thử đơn vị giao diện (Frontend Unit Testing): Sử dụng React Testing Library để kiểm tra khả năng render component và bắt sự kiện người dùng.")
    doc.add_paragraph("3. Kiểm thử luồng trải nghiệm toàn diện đầu-cuối (End-to-End Testing): Sử dụng Microsoft Playwright tự động mở trình duyệt Chromium thực tế, điều hướng trang chủ, lọc chuyên mục, tìm kiếm và kiểm tra biểu mẫu đăng nhập.")

    add_heading_2("5.2. Kết quả kiểm thử tự động chi tiết")

    test_summary = [
        ("Bộ kiểm thử (Test Suite)", "Công cụ", "Số lượng Test", "Kết quả", "Tỷ lệ đạt"),
        ("Kiểm thử Nghiệp vụ & API Cổng thông tin (api.test.ts)", "Vitest + Supertest", "18 bài test", "18 Passed", "100%"),
        ("Kiểm thử Ma trận phân quyền RBAC đa vai trò (rbac.test.ts)", "Vitest + Supertest", "24 bài test", "24 Passed", "100%"),
        ("Kiểm thử Component Giao diện (ArticleCard.test.tsx)", "React Testing Library", "2 bài test", "2 Passed", "100%"),
        ("Kiểm thử Tự động Toàn trình Trình duyệt (newsportal.spec.ts)", "Microsoft Playwright", "4 kịch bản E2E", "4 Passed", "100%"),
        ("TỔNG HỢP TOÀN BỘ HỆ THỐNG", "Hệ thống CI/CD", "48 bài test", "48 Passed", "100%")
    ]

    tbl_test = doc.add_table(rows=len(test_summary), cols=5)
    tbl_test.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_test)

    for r_idx, row in enumerate(test_summary):
        for c_idx, val in enumerate(row):
            cell = tbl_test.cell(r_idx, c_idx)
            if r_idx == 0:
                set_cell_background(cell, "1B365D")
                r = cell.paragraphs[0].add_run(val)
                r.bold = True
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(255, 255, 255)
            elif r_idx == len(test_summary)-1:
                set_cell_background(cell, "E6F4EA")
                r = cell.paragraphs[0].add_run(val)
                r.bold = True
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(0, 100, 0)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F8F9FA")
                r = cell.paragraphs[0].add_run(val)
                r.font.size = Pt(10)
                if "100%" in val or "Passed" in val:
                    r.bold = True
                    r.font.color.rgb = RGBColor(0, 100, 0)

    doc.add_paragraph()
    add_callout(
        "Tất cả 48/48 kịch bản kiểm thử tự động đều vượt qua thành công 100% trên môi trường kết nối trực tiếp "
        "với cơ sở dữ liệu đám mây MongoDB Atlas. Điều này chứng minh tính ổn định, độ tin cậy và khả năng hoạt động thực tế "
        "xuất sắc của hệ thống NewsPortal.",
        "XÁC MINH CHẤT LƯỢNG:"
    )

    add_heading_2("5.3. Đánh giá kết quả đạt được so với mục tiêu ban đầu")
    doc.add_paragraph("• Về mặt tính năng: Xây dựng hoàn chỉnh 100% các yêu cầu từ trang chủ, trang chuyên mục, chi tiết tin tức, tìm kiếm, bình luận lồng nhau, thích bài, lưu tin cho tới toàn bộ phân hệ quản trị Admin.")
    doc.add_paragraph("• Về mặt dữ liệu: Đấu nối thành công MongoDB Atlas Cloud, loại bỏ toàn bộ dữ liệu giả lập, dữ liệu được lưu trữ và cập nhật đồng bộ thời gian thực.")
    doc.add_paragraph("• Về mặt bảo mật: Hệ thống phân quyền chặt chẽ cho 6 vai trò, ngăn chặn hiệu quả các hình thức tấn công XSS, SQL/NoSQL Injection, tự bảo vệ tài khoản Super Admin tối cao.")
    doc.add_paragraph("• Về mặt đóng gói & vận hành: Tạo sẵn file khởi động tự động `khoi-dong.bat`, hệ thống có thể chạy ngay chỉ bằng một cú nhấp chuột.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 11. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # -------------------------------------------------------------
    add_heading_1("KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_heading_2("6.1. Những kết quả đã đạt được")
    doc.add_paragraph(
        "Sau quá trình nghiên cứu, thiết kế và phát triển nghiêm túc, đề tài \"Xây dựng Cổng thông tin điện tử / Website tin tức hoàn chỉnh (NewsPortal)\" "
        "đã hoàn thành xuất sắc tất cả các mục tiêu đề ra cho một đồ án chuyên ngành năm 3:"
    )
    doc.add_paragraph("1. Nắm vững và làm chủ bộ công nghệ Full-stack hiện đại: React 18, TypeScript, Tailwind CSS, Node.js, Express, Prisma ORM và MongoDB Atlas.")
    doc.add_paragraph("2. Hiện thực hóa được một quy trình tòa soạn báo điện tử thực tế khép kín và an toàn, giải quyết bài toán kiểm duyệt xuất bản bài viết nhiều cấp.")
    doc.add_paragraph("3. Xây dựng giao diện tòa soạn chuyên nghiệp, chuẩn mực về typography tiếng Việt, tương thích đa thiết bị và hỗ trợ SEO tốt.")
    doc.add_paragraph("4. Áp dụng văn hóa kiểm thử phần mềm tự động (Automated Testing) với 48 test cases đảm bảo phần mềm hoạt động ổn định và tin cậy.")

    add_heading_2("6.2. Hạn chế của đề án")
    doc.add_paragraph(
        "Mặc dù hệ thống đã hoạt động hoàn chỉnh, song vẫn còn một số điểm có thể tối ưu hơn: "
        "chưa tích hợp trình soạn thảo WYSIWYG trực quan như TinyMCE/CKEditor để tác giả không phải gõ thẻ HTML; "
        "chưa có dịch vụ đẩy thông báo thời gian thực (WebSockets/Push Notifications) khi có tin tức khẩn cấp."
    )

    add_heading_2("6.3. Hướng phát triển trong tương lai")
    doc.add_paragraph("• Tích hợp Trí tuệ Nhân tạo (AI): Ứng dụng mô hình ngôn ngữ lớn (LLM) để tự động tóm tắt nội dung bài viết, gợi ý tiêu đề SEO hấp dẫn và kiểm tra lỗi chính tả tiếng Việt.")
    doc.add_paragraph("• Hệ thống gợi ý tin tức cá nhân hóa (Recommendation System): Phân tích sở thích đọc tin của độc giả để đề xuất các bài viết liên quan phù hợp nhất.")
    doc.add_paragraph("• Ứng dụng di động (Mobile App / PWA): Đóng gói ứng dụng Progressive Web App để độc giả có thể cài đặt trực tiếp lên màn hình điện thoại và đọc tin tức offline.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 12. TÀI LIỆU THAM KHẢO
    # -------------------------------------------------------------
    add_heading_1("TÀI LIỆU THAM KHẢO")
    refs = [
        "React Official Documentation – React 18 & Hooks (https://react.dev)",
        "TypeScript Handbook – The TypeScript Language (https://www.typescriptlang.org/docs)",
        "Node.js & Express.js Application Design Patterns – Expressjs Guide (https://expressjs.com)",
        "Prisma ORM Official Documentation – MongoDB Connector & Schema Reference (https://www.prisma.io/docs)",
        "MongoDB Atlas Developer Documentation – Cloud Clusters & Indexes (https://www.mongodb.com/docs/atlas)",
        "Tailwind CSS Documentation – Utility-First Fundamentals (https://tailwindcss.com/docs)",
        "OWASP Top 10 Security Risks – Web Application Security Guidelines (https://owasp.org/www-project-top-ten)",
        "Microsoft Playwright Documentation – End-to-End Browser Automation (https://playwright.dev)",
        "Vitest – Blazing Fast Unit & Integration Test Framework (https://vitest.dev)",
        "RFC 7519 – JSON Web Token (JWT) Standard Specifications (https://datatracker.ietf.org/doc/html/rfc7519)"
    ]

    for i, r in enumerate(refs):
        p_r = doc.add_paragraph()
        p_r.paragraph_format.left_indent = Inches(0.3)
        p_r.paragraph_format.first_line_indent = Inches(-0.3)
        p_r.paragraph_format.line_spacing = 1.2
        p_r.paragraph_format.space_after = Pt(4)
        r_num = p_r.add_run(f"[{i+1}] ")
        r_num.bold = True
        r_num.font.color.rgb = SECONDARY
        p_r.add_run(r)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 13. PHỤ LỤC: HƯỚNG DẪN CÀI ĐẶT & TÀI KHOẢN KIỂM THỬ
    # -------------------------------------------------------------
    add_heading_1("PHỤ LỤC: DANH SÁCH TÀI KHOẢN VÀ HƯỚNG DẪN VẬN HÀNH")

    add_heading_2("1. Danh sách tài khoản thử nghiệm các cấp bậc quyền hạn")
    
    acc_rows = [
        ("Cấp độ", "Vai trò (Role)", "Email đăng nhập", "Mật khẩu", "Mục đích kiểm thử"),
        ("1", "GUEST", "(Chưa đăng nhập)", "(Không)", "Đọc tin công khai, bị chặn tương tác & chặn trang admin."),
        ("2", "USER", "reader@newsportal.vn", "Reader@Password123!", "Bình luận, thích tin, lưu tin, bị chặn vào trang quản trị (403)."),
        ("3", "AUTHOR", "author_nam@newsportal.vn", "Author@Password123!", "Soạn bài mới (DRAFT, PENDING), chỉ quản lý bài mình, cấm tự xuất bản."),
        ("4", "EDITOR", "editor@newsportal.vn", "Editor@Password123!", "Duyệt xuất bản tin bài (PUBLISHED), quản lý danh mục, thẻ tag, bình luận."),
        ("5", "ADMIN", "admin_test@newsportal.vn", "AdminUser@123!", "Quản lý người dùng, khóa tài khoản, xem audit logs, cấm khóa SuperAdmin."),
        ("6", "SUPER_ADMIN", "admin@newsportal.vn", "Admin@Password123!", "Toàn quyền tối cao, phân quyền Admin, cài đặt website, cấm tự khóa chính mình.")
    ]

    tbl_acc = doc.add_table(rows=len(acc_rows), cols=5)
    tbl_acc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_acc)

    for r_idx, row in enumerate(acc_rows):
        for c_idx, val in enumerate(row):
            cell = tbl_acc.cell(r_idx, c_idx)
            if r_idx == 0:
                set_cell_background(cell, "1B365D")
                r = cell.paragraphs[0].add_run(val)
                r.bold = True
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                if r_idx % 2 == 1:
                    set_cell_background(cell, "F8F9FA")
                r = cell.paragraphs[0].add_run(val)
                r.font.size = Pt(9.5)
                if c_idx == 1:
                    r.bold = True
                if c_idx in (2, 3):
                    r.font.name = "Consolas"

    doc.add_paragraph()
    add_heading_2("2. Hướng dẫn khởi động hệ thống nhanh chóng")
    doc.add_paragraph("• Khởi động tự động (Khuyên dùng): Nhấp đúp chuột vào file `khoi-dong.bat` tại thư mục gốc của dự án. File sẽ tự động chạy Backend API, Frontend Web và mở trình duyệt tại `http://localhost:5173`.")
    doc.add_paragraph("• Địa chỉ truy cập ứng dụng Web: http://localhost:5173")
    doc.add_paragraph("• Địa chỉ tài liệu API Swagger / OpenAPI: http://localhost:5000/api-docs")
    doc.add_paragraph("• Kiểm tra trạng thái máy chủ (Health Check): http://localhost:5000/api/health")

    # Output file path
    output_path = r"C:\Users\Admin\OneDrive\Máy tính\BAITAP THI T2\BAO_CAO_DO_AN_NEWSPORTAL.docx"
    doc.save(output_path)
    print("Bao cao Word da duoc tao thanh cong!")

if __name__ == "__main__":
    build_report()
