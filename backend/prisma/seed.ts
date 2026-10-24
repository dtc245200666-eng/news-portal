import { PrismaClient, Role, ArticleStatus, CommentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting NewsPortal Database Seed ---');

  // Clear existing data (in dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.articleLike.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.media.deleteMany();
  await prisma.staticPage.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared old records successfully.');

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@Password123!', salt);
  const editorPassword = await bcrypt.hash('Editor@Password123!', salt);
  const authorPassword = await bcrypt.hash('Author@Password123!', salt);
  const readerPassword = await bcrypt.hash('Reader@Password123!', salt);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@newsportal.vn',
      username: 'superadmin',
      fullName: 'Tổng Biên Tập',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Chịu trách nhiệm quản lý toàn bộ hệ thống thông tin báo chí và nội dung xuất bản của NewsPortal.',
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@newsportal.vn',
      username: 'editor_minh',
      fullName: 'Vũ Đức Minh',
      password: editorPassword,
      role: Role.EDITOR,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Biên tập viên cao cấp, phụ trách phê duyệt các bài báo lĩnh vực Thời sự và Kinh tế.',
    },
  });

  const authorNam = await prisma.user.create({
    data: {
      email: 'author_nam@newsportal.vn',
      username: 'nam_journalist',
      fullName: 'Nguyễn Hải Nam',
      password: authorPassword,
      role: Role.AUTHOR,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Chuyên gia phân tích xu hướng chuyển đổi số, trí tuệ nhân tạo và kinh tế công nghệ.',
    },
  });

  const authorLan = await prisma.user.create({
    data: {
      email: 'author_lan@newsportal.vn',
      username: 'lan_lifestyle',
      fullName: 'Trần Mai Lan',
      password: authorPassword,
      role: Role.AUTHOR,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Khám phá văn hóa ẩm thực, lối sống hiện đại và du lịch bền vững tại Việt Nam.',
    },
  });

  const readerLong = await prisma.user.create({
    data: {
      email: 'reader@newsportal.vn',
      username: 'hoanglong92',
      fullName: 'Lê Hoàng Long',
      password: readerPassword,
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      bio: 'Độc giả trung thành quan tâm đến thời sự và các chính sách kinh tế vĩ mô.',
    },
  });

  const readerHuong = await prisma.user.create({
    data: {
      email: 'huong_user@newsportal.vn',
      username: 'huongpham',
      fullName: 'Phạm Thu Hương',
      password: readerPassword,
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Yêu thích thể thao, lối sống lành mạnh và bảo vệ môi trường xanh.',
    },
  });

  console.log('Created 6 users across all roles.');

  // 2. Create Categories (including parent and child categories)
  const catThoisu = await prisma.category.create({
    data: {
      name: 'Thời sự',
      slug: 'thoi-su',
      description: 'Tin tức thời sự xã hội, chính sách và sự kiện quan trọng trong nước và quốc tế',
      order: 1,
    },
  });

  const catKinhdoanh = await prisma.category.create({
    data: {
      name: 'Kinh doanh',
      slug: 'kinh-doanh',
      description: 'Thị trường tài chính, chứng khoán, bất động sản và các xu hướng kinh tế mới',
      order: 2,
    },
  });

  const catCongnghe = await prisma.category.create({
    data: {
      name: 'Công nghệ',
      slug: 'cong-nghe',
      description: 'Cập nhật xu hướng AI, thiết bị thông minh, an ninh mạng và chuyển đổi số',
      order: 3,
    },
  });

  const catAI = await prisma.category.create({
    data: {
      name: 'Trí tuệ nhân tạo (AI)',
      slug: 'tri-tue-nhan-tao',
      description: 'Nghiên cứu, đột phá và ứng dụng của trí tuệ nhân tạo vào đời sống',
      order: 1,
      parentId: catCongnghe.id,
    },
  });

  const catThethao = await prisma.category.create({
    data: {
      name: 'Thể thao',
      slug: 'the-thao',
      description: 'Bóng đá trong nước và quốc tế, quần vợt, bóng chuyền và các giải đấu lớn',
      order: 4,
    },
  });

  const catBongdaVN = await prisma.category.create({
    data: {
      name: 'Bóng đá Việt Nam',
      slug: 'bong-da-viet-nam',
      description: 'Đội tuyển quốc gia, giải V-League và tin tức chuyển nhượng cầu thủ Việt',
      order: 1,
      parentId: catThethao.id,
    },
  });

  const catDoisong = await prisma.category.create({
    data: {
      name: 'Đời sống',
      slug: 'doi-song',
      description: 'Gia đình, ẩm thực, du lịch trải nghiệm, văn hóa cộng đồng và sức khỏe',
      order: 5,
    },
  });

  const catGiaitri = await prisma.category.create({
    data: {
      name: 'Giải trí',
      slug: 'giai-tri',
      description: 'Âm nhạc, điện ảnh, nghệ thuật đương đại và sự kiện văn hóa nổi bật',
      order: 6,
    },
  });

  console.log('Created 8 categories with hierarchical relationships.');

  // 3. Create Tags
  const tagList = [
    { name: 'Chuyển đổi số', slug: 'chuyen-doi-so' },
    { name: 'Trí tuệ nhân tạo', slug: 'tri-tue-nhan-tao' },
    { name: 'Kinh tế xanh', slug: 'kinh-te-xanh' },
    { name: 'V-League', slug: 'v-league' },
    { name: 'Đội tuyển Việt Nam', slug: 'doi-tuyen-viet-nam' },
    { name: 'Du lịch bền vững', slug: 'du-lich-ben-vung' },
    { name: 'Bất động sản', slug: 'bat-dong-san' },
    { name: 'Sức khỏe thông minh', slug: 'suc-khoe-thong-minh' },
  ];

  const tags: Record<string, any> = {};
  for (const t of tagList) {
    tags[t.slug] = await prisma.tag.create({
      data: t,
    });
  }

  console.log('Created 8 tags.');

  // 4. Create Articles
  const articlesData = [
    {
      title: 'Việt Nam thúc đẩy chiến lược phát triển công nghiệp bán dẫn và nhân lực AI quốc gia',
      slug: 'viet-nam-thuc-day-chien-luoc-phat-trien-cong-nghiep-ban-dan-va-ai',
      summary: 'Kế hoạch hành động quốc gia đặt mục tiêu đào tạo ít nhất 50.000 kỹ sư bán dẫn và mở rộng các trung tâm nghiên cứu AI hàng đầu khu vực đến năm 2030.',
      content: `
        <p><strong>Hà Nội</strong> — Sáng nay, diễn đàn cấp cao về Công nghiệp Bán dẫn và Trí tuệ Nhân tạo đã chính thức khai mạc với sự tham gia của đại diện các bộ ngành, các tập đoàn công nghệ toàn cầu và các trường đại học hàng đầu.</p>
        
        <h2>Mục tiêu chiến lược đến năm 2030</h2>
        <p>Chiến lược mới khẳng định bán dẫn và trí tuệ nhân tạo là hai trụ cột công nghệ cốt lõi giúp Việt Nam bứt phá trong chuỗi giá trị toàn cầu. Chính phủ cam kết hoàn thiện khung pháp lý ưu đãi thuế, đất đai và tài trợ nghiên cứu cho các doanh nghiệp công nghệ cao.</p>
        
        <blockquote>
          "Việt Nam không chỉ tham gia vào khâu lắp ráp và đóng gói, mà hướng tới làm chủ thiết kế chip chuyên dụng và các giải pháp AI đặc thù cho ngôn ngữ, văn hóa Việt Nam." — Đại diện Bộ Thông tin và Truyền thông phát biểu.
        </blockquote>

        <h2>Hợp tác quốc tế và đào tạo nguồn nhân lực</h2>
        <p>Nhiều thỏa thuận hợp tác đào tạo giữa các trường đại học quốc tế và các doanh nghiệp lớn đã được ký kết ngay trong khuôn khổ diễn đàn. Hơn 30 phòng thí nghiệm vi mạch chuẩn quốc tế dự kiến sẽ được đưa vào vận hành ngay trong quý tới.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      isEditorPick: true,
      views: 12450,
      readingTime: 4,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 5),
      authorId: authorNam.id,
      categoryId: catCongnghe.id,
      tagSlugs: ['chuyen-doi-so', 'tri-tue-nhan-tao'],
    },
    {
      title: 'Thị trường chứng khoán khởi sắc: Dòng vốn ngoại đổ mạnh vào nhóm ngành năng lượng sạch',
      slug: 'thi-truong-chung-khoan-khoi-sac-dong-von-ngoai-do-manh-vao-nang-luong-sach',
      summary: 'Chỉ số VN-Index vượt ngưỡng kháng cự mạnh với thanh khoản bùng nổ, ghi nhận sự dẫn dắt của nhóm cổ phiếu năng lượng tái tạo và xuất khẩu công nghệ.',
      content: `
        <p>Phiên giao dịch hôm nay chứng kiến sự bứt phá ngoạn mục của các chỉ số tài chính. Dòng tiền khối ngoại quay trở lại mua ròng mạnh mẽ sau chuỗi ngày chờ đợi tín hiệu chính sách tiền tệ.</p>
        <h2>Năng lượng xanh dẫn dắt xu hướng</h2>
        <p>Các doanh nghiệp điện gió ngoài khơi và năng lượng mặt trời áp mái thu hút sự chú ý đặc biệt. Giới phân tích nhận định các cam kết Net Zero đang chuyển hóa thành lợi nhuận thực tế cho các dự án xanh có năng lực tài chính minh bạch.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      isEditorPick: false,
      views: 8920,
      readingTime: 3,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 12),
      authorId: editorUser.id,
      categoryId: catKinhdoanh.id,
      tagSlugs: ['kinh-te-xanh'],
    },
    {
      title: 'Đội tuyển bóng đá Việt Nam công bố danh sách tập trung chuẩn bị cho vòng loại châu lục',
      slug: 'doi-tuyen-viet-nam-cong-bo-danh-sach-tap-trung-vong-loai',
      summary: 'Ban huấn luyện triệu tập kết hợp hài hòa giữa dàn cựu binh giàu kinh nghiệm và những nhân tố trẻ đang thi đấu ấn tượng tại V-League.',
      content: `
        <p>Huấn luyện viên trưởng đã chính thức chốt danh sách 28 cầu thủ hội quân cho đợt tập huấn quan trọng sắp tới. Mục tiêu đề ra là đạt phong độ tối đa trước các đối thủ hàng đầu khu vực.</p>
        <h2>Sự trở lại của các trụ cột</h2>
        <p>Sau thời gian hồi phục chấn thương, các tiền vệ chủ chốt đã tìm lại phong độ đỉnh cao. Sự kết hợp với lứa cầu thủ U23 giàu nhiệt huyết hứa hẹn mang đến lối chơi tấn công đa dạng và giàu tính cống hiến.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorPick: true,
      views: 15400,
      readingTime: 3,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 24),
      authorId: editorUser.id,
      categoryId: catBongdaVN.id,
      tagSlugs: ['doi-tuyen-viet-nam', 'v-league'],
    },
    {
      title: 'Ứng dụng mô hình AI ngôn ngữ lớn trong tự động hóa quy trình nghiệp vụ hành chính',
      slug: 'ung-dung-mo-hinh-ai-ngon-ngu-lon-trong-tu-dong-hoa-hanh-chinh',
      summary: 'Các cơ quan quản lý và doanh nghiệp lớn đang ứng dụng các mô hình ngôn ngữ tiếng Việt để trợ giúp người dân soạn thảo và tra cứu thủ tục nhanh gấp 5 lần.',
      content: `
        <p>Việc triển khai trợ lý ảo thông minh sử dụng công nghệ LLM (Large Language Model) được huấn luyện chuyên sâu dữ liệu hành chính công đã đem lại sự tiện lợi vượt bậc cho công dân.</p>
        <h2>Tiết kiệm thời gian và giảm thiểu thủ tục rườm rà</h2>
        <p>Nhờ hệ thống xử lý ngôn ngữ tự nhiên, mọi thắc mắc của người dân về hồ sơ nhà đất, đăng ký kinh doanh đều được giải đáp chính xác theo các thông tư hiện hành chỉ sau vài giây.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorPick: false,
      views: 6300,
      readingTime: 5,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 36),
      authorId: authorNam.id,
      categoryId: catAI.id,
      tagSlugs: ['tri-tue-nhan-tao', 'chuyen-doi-so'],
    },
    {
      title: 'Khám phá cung đường du lịch xanh Tây Bắc mùa hoa nở: Trải nghiệm văn hóa bản địa bền vững',
      slug: 'kham-pha-cung-duong-du-lich-xanh-tay-bac-mua-hoa-no',
      summary: 'Hành trình vượt đèo mây, hòa mình vào cuộc sống của đồng bào dân tộc và thưởng thức ẩm thực truyền thống đậm đà bản sắc vùng cao.',
      content: `
        <p>Những ngày đầu thu và chớm đông, các triền núi Tây Bắc khoác lên mình tấm áo rực rỡ của các loài hoa dại. Đây là thời điểm lý tưởng cho những ai muốn tìm lại sự thư thái giữa thiên nhiên nguyên sơ.</p>
        <h2>Du lịch gắn liền với bảo tồn văn hóa</h2>
        <p>Mô hình homestay cộng đồng do bà con dân tộc bản địa tự vận hành không chỉ đem lại thu nhập bền vững mà còn giúp gìn giữ nguyên vẹn kiến trúc nhà gỗ và nếp sống truyền thống.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      isEditorPick: true,
      views: 11200,
      readingTime: 4,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 48),
      authorId: authorLan.id,
      categoryId: catDoisong.id,
      tagSlugs: ['du-lich-ben-vung'],
    },
    {
      title: 'Chính sách thuế mới hỗ trợ doanh nghiệp vừa và nhỏ chuyển đổi số toàn diện',
      slug: 'chinh-sach-thue-moi-ho-tro-doanh-nghiep-vua-va-nho-chuyen-doi-so',
      summary: 'Nghị định mới ban hành giảm 30% thuế thu nhập doanh nghiệp cho các khoản đầu tư vào phần mềm quản trị và bảo mật dữ liệu khách hàng.',
      content: `
        <p>Gói hỗ trợ tài khóa mới được cộng đồng doanh nghiệp SMEs đón nhận nồng nhiệt, mở ra cơ hội nâng cấp hạ tầng số mà không chịu gánh nặng chi phí ban đầu quá lớn.</p>
        <h2>Tháo gỡ điểm nghẽn nguồn lực số</h2>
        <p>Nhiều doanh nghiệp nhỏ trước đây e ngại chi phí chuyển đổi dữ liệu và mua bản quyền phần mềm, nay đã có thể tự tin áp dụng hóa đơn điện tử, ERP và CRM đồng bộ.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorPick: false,
      views: 7450,
      readingTime: 3,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 60),
      authorId: superAdmin.id,
      categoryId: catThoisu.id,
      tagSlugs: ['chuyen-doi-so'],
    },
    {
      title: 'Bất động sản công nghiệp tiếp tục là điểm sáng thu hút dòng vốn FDI chất lượng cao',
      slug: 'bat-dong-san-cong-nghiep-tiep-tuc-la-diem-sang-fdi',
      summary: 'Tỷ lệ lấp đầy tại các khu công nghiệp phía Bắc và Đông Nam Bộ duy trì trên 85%, với xu hướng phát triển nhà xưởng xanh đạt chuẩn LEED.',
      content: `
        <p>Báo cáo thị trường bất động sản quý mới nhất cho thấy nhu cầu thuê mặt bằng sản xuất vi mạch, linh kiện ô tô điện và logistics công nghệ cao liên tục gia tăng mạnh mẽ.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorPick: false,
      views: 5200,
      readingTime: 3,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 72),
      authorId: authorNam.id,
      categoryId: catKinhdoanh.id,
      tagSlugs: ['bat-dong-san', 'kinh-te-xanh'],
    },
    {
      title: 'Lối sống tối giản và xu hướng chăm sóc sức khỏe thể chất kết hợp tinh thần của thế hệ trẻ',
      slug: 'loi-song-toi-gian-va-xu-huong-cham-soc-suc-khoe-the-he-tre',
      summary: 'Thực dưỡng cân bằng, rèn luyện yoga ngoài trời và giảm tải thời gian sử dụng mạng xã hội đang trở thành kim chỉ nam của nhiều người trẻ thành thị.',
      content: `
        <p>Khái niệm "wellness" không còn giới hạn ở việc tập gym hay ăn kiêng nghiêm ngặt, mà mở rộng sang sự cân bằng cảm xúc, không gian sống xanh và giấc ngủ tự nhiên.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorPick: true,
      views: 9800,
      readingTime: 4,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 84),
      authorId: authorLan.id,
      categoryId: catDoisong.id,
      tagSlugs: ['suc-khoe-thong-minh'],
    },
    {
      title: 'Điện ảnh Việt Nam ghi dấu ấn tại các liên hoan phim quốc tế với đề tài hiện thực xã hội',
      slug: 'dien-anh-viet-nam-ghi-dau-an-tai-cac-lien-hoan-phim-quoc-te',
      summary: 'Các tác phẩm độc lập khai thác chiều sâu tâm lý con người và vẻ đẹp văn hóa đất nước nhận được cơn mưa lời khen từ giới phê bình thế giới.',
      content: `
        <p>Làn sóng các nhà làm phim trẻ độc lập đã mang lại làn gió mới mẻ, khẳng định bản sắc điện ảnh Việt Nam trên bản đồ nghệ thuật thứ bảy toàn cầu.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorPick: false,
      views: 4300,
      readingTime: 3,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 96),
      authorId: authorLan.id,
      categoryId: catGiaitri.id,
      tagSlugs: [],
    },
    {
      title: 'Bản nháp nghiên cứu: Tác động của đô thị thông minh đối với việc giảm ùn tắc giao thông',
      slug: 'ban-nhap-nghien-cuu-tac-dong-do-thi-thong-minh',
      summary: 'Dữ liệu sơ bộ từ camera AI giám sát luồng xe tại các ngã tư trọng điểm giúp tối ưu chu kỳ đèn tín hiệu tự động theo thời gian thực.',
      content: '<p>Nội dung bản nháp đang được ban biên tập thu thập thêm số liệu từ các sở giao thông vận tải trước khi phát hành chính thức.</p>',
      coverImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.DRAFT,
      isFeatured: false,
      isEditorPick: false,
      views: 0,
      readingTime: 3,
      publishedAt: null,
      authorId: authorNam.id,
      categoryId: catCongnghe.id,
      tagSlugs: ['chuyen-doi-so'],
    },
    {
      title: 'Bài viết chờ duyệt: Chiến lược phát triển năng lượng hydrogen xanh tại vùng duyên hải',
      slug: 'bai-viet-cho-duyet-nang-luong-hydrogen-xanh',
      summary: 'Đánh giá tiềm năng xuất khẩu hydrogen xanh sang thị trường Đông Bắc Á từ các trang trại điện gió ngoài khơi miền Trung.',
      content: '<p>Bài viết đang trong danh sách chờ trưởng ban biên tập rà soát số liệu trích dẫn kỹ thuật.</p>',
      coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.PENDING,
      isFeatured: false,
      isEditorPick: false,
      views: 0,
      readingTime: 4,
      publishedAt: null,
      authorId: authorNam.id,
      categoryId: catThoisu.id,
      tagSlugs: ['kinh-te-xanh'],
    },
    {
      title: 'Lưu trữ: Báo cáo tổng kết các chương trình văn hóa cộng đồng năm trước',
      slug: 'luu-tru-bao-cao-tong-ket-chuong-trinh-van-hoa',
      summary: 'Tài liệu lưu trữ phục vụ nghiên cứu và đối chiếu các chỉ tiêu văn hóa xã hội các giai đoạn trước.',
      content: '<p>Tài liệu đã được chuyển sang chế độ lưu trữ sau khi hoàn thành chu kỳ theo dõi thường niên.</p>',
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      status: ArticleStatus.ARCHIVED,
      isFeatured: false,
      isEditorPick: false,
      views: 120,
      readingTime: 2,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 24 * 60),
      authorId: authorLan.id,
      categoryId: catDoisong.id,
      tagSlugs: [],
    },
  ];

  const createdArticles: any[] = [];
  for (const art of articlesData) {
    const { tagSlugs, ...artData } = art;
    const created = await prisma.article.create({
      data: {
        ...artData,
        tags: {
          create: tagSlugs.map((slug) => ({
            tag: {
              connect: { id: tags[slug].id },
            },
          })),
        },
      },
    });
    createdArticles.push(created);
  }

  console.log(`Created ${createdArticles.length} articles across multiple statuses.`);

  // 5. Create Comments & Replies
  const articleSemiconductor = createdArticles[0];
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Chính sách rất kịp thời! Việt Nam có nguồn nhân lực toán học và kỹ thuật phần mềm dồi dào, hoàn toàn có thể nắm bắt cơ hội chip AI này.',
      status: CommentStatus.APPROVED,
      articleId: articleSemiconductor.id,
      userId: readerLong.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Đồng ý với bác Long. Tuy nhiên khâu khó nhất vẫn là chi phí thiết bị thực hành trong các trường đại học, rất cần sự tài trợ từ các tập đoàn lớn.',
      status: CommentStatus.APPROVED,
      articleId: articleSemiconductor.id,
      userId: readerHuong.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Bài viết phân tích rất sâu sắc và truyền cảm hứng cho thế hệ sinh viên kỹ thuật trẻ!',
      status: CommentStatus.APPROVED,
      articleId: articleSemiconductor.id,
      userId: editorUser.id,
    },
  });

  console.log('Created sample comments and nested replies.');

  // 6. Create Likes and Bookmarks
  await prisma.articleLike.create({
    data: {
      articleId: articleSemiconductor.id,
      userId: readerLong.id,
    },
  });

  await prisma.articleLike.create({
    data: {
      articleId: articleSemiconductor.id,
      userId: readerHuong.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      articleId: articleSemiconductor.id,
      userId: readerLong.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      articleId: createdArticles[1].id,
      userId: readerLong.id,
    },
  });

  console.log('Created likes and bookmarks.');

  // 7. Create Static Pages
  const staticPages = [
    {
      slug: 'gioi-thieu',
      title: 'Giới thiệu về Báo điện tử NewsPortal',
      content: `
        <h2>Chào mừng bạn đến với NewsPortal</h2>
        <p><strong>NewsPortal</strong> là cổng thông tin điện tử đa phương tiện, chuyên nghiệp hàng đầu tại Việt Nam. Chúng tôi cam kết mang đến cho bạn đọc những tin tức nhanh chóng, khách quan, chính xác và có chiều sâu về mọi lĩnh vực: Thời sự, Kinh tế, Công nghệ, Thể thao, Văn hóa và Đời sống.</p>
        <h3>Tôn chỉ hoạt động</h3>
        <ul>
          <li><strong>Trung thực và Khách quan:</strong> Mọi thông tin đều được thẩm định đa nguồn trước khi đến với công chúng.</li>
          <li><strong>Đổi mới sáng tạo:</strong> Tiên phong ứng dụng công nghệ số và báo chí dữ liệu trong truyền tải thông điệp.</li>
          <li><strong>Phụng sự độc giả:</strong> Luôn lắng nghe, thấu cảm và đồng hành cùng sự phát triển của xã hội.</li>
        </ul>
        <h3>Đội ngũ tòa soạn</h3>
        <p>Hội tụ các nhà báo, biên tập viên và chuyên gia phân tích giàu kinh nghiệm, tâm huyết với nghề nghiệp và tinh thần đổi mới không ngừng.</p>
      `,
      metaTitle: 'Giới thiệu NewsPortal – Cổng thông tin điện tử chính xác, hiện đại',
      metaDesc: 'Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ xây dựng Cổng thông tin điện tử NewsPortal.',
    },
    {
      slug: 'lien-he',
      title: 'Liên hệ Tòa soạn NewsPortal',
      content: `
        <h2>Thông tin liên hệ tòa soạn</h2>
        <p>Mọi ý kiến đóng góp, cộng tác bài vở hoặc gửi thông tin đường dây nóng, quý độc giả vui lòng liên hệ:</p>
        <p><strong>Trụ sở chính:</strong> Tòa nhà Báo chí Công nghệ, Số 15 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
        <p><strong>Văn phòng đại diện Hà Nội:</strong> Tầng 8, Tòa tháp Công nghệ, 18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội</p>
        <p><strong>Đường dây nóng (24/7):</strong> 1900 6868 - 028 3822 9999</p>
        <p><strong>Email tòa soạn:</strong> toasoan@newsportal.vn</p>
        <p><strong>Hợp tác quảng cáo & truyền thông:</strong> quangcao@newsportal.vn</p>
      `,
      metaTitle: 'Liên hệ Tòa soạn NewsPortal – Đường dây nóng và hợp tác báo chí',
      metaDesc: 'Địa chỉ, số điện thoại đường dây nóng và các kênh liên hệ chính thức của NewsPortal.',
    },
    {
      slug: 'chinh-sach-bao-mat',
      title: 'Chính sách bảo mật thông tin độc giả',
      content: `
        <h2>1. Thu thập thông tin</h2>
        <p>NewsPortal chỉ thu thập các thông tin cần thiết khi người dùng đăng ký tài khoản (họ tên, email) hoặc gửi bình luận nhằm mục đích nâng cao trải nghiệm cá nhân hóa.</p>
        <h2>2. Sử dụng thông tin</h2>
        <p>Chúng tôi cam kết không chia sẻ, bán hoặc trao đổi thông tin cá nhân của bạn đọc cho bất kỳ bên thứ ba nào vì mục đích thương mại mà không có sự đồng ý rõ ràng.</p>
        <h2>3. Bảo mật dữ liệu</h2>
        <p>Mọi thông tin mật khẩu được mã hóa an toàn theo tiêu chuẩn quốc tế và lưu trữ trên hệ sinh thái máy chủ bảo mật cao.</p>
      `,
      metaTitle: 'Chính sách bảo mật – Báo điện tử NewsPortal',
      metaDesc: 'Cam kết bảo mật dữ liệu và quyền riêng tư cho độc giả khi sử dụng nền tảng NewsPortal.',
    },
    {
      slug: 'dieu-khoan-su-dung',
      title: 'Điều khoản sử dụng dịch vụ',
      content: `
        <h2>Quy định chung</h2>
        <p>Khi truy cập và sử dụng dịch vụ trên NewsPortal, bạn đồng ý tuân thủ các quy định pháp luật hiện hành của Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>
        <h2>Quyền sở hữu trí tuệ</h2>
        <p>Toàn bộ bài viết, hình ảnh, video và đồ họa trên NewsPortal thuộc bản quyền của Tòa soạn hoặc các đối tác được cấp phép. Mọi hành vi sao chép cần ghi rõ nguồn và dẫn liên kết trực tiếp về bài gốc.</p>
      `,
      metaTitle: 'Điều khoản sử dụng dịch vụ – NewsPortal',
      metaDesc: 'Các điều khoản, quyền và nghĩa vụ của độc giả khi truy cập cổng thông tin điện tử NewsPortal.',
    },
    {
      slug: 'chinh-sach-binh-luan',
      title: 'Chính sách bình luận và thảo luận văn minh',
      content: `
        <h2>Quy tắc ứng xử cộng đồng</h2>
        <p>NewsPortal khuyến khích độc giả bày tỏ chính kiến một cách xây dựng, tôn trọng lẫn nhau và tuân thủ các tiêu chuẩn đạo đức xã hội.</p>
        <h3>Các nội dung không được chấp nhận:</h3>
        <ul>
          <li>Nội dung xúc phạm danh dự, nhân phẩm của cá nhân hoặc tổ chức.</li>
          <li>Kích động thù hằn, bạo lực, phân biệt chủng tộc, tôn giáo hoặc giới tính.</li>
          <li>Quảng cáo rác (spam), chèn liên kết độc hại hoặc bán hàng trái phép.</li>
          <li>Tiết lộ thông tin bí mật đời tư của người khác khi chưa được phép.</li>
        </ul>
      `,
      metaTitle: 'Chính sách bình luận văn minh – NewsPortal',
      metaDesc: 'Quy chuẩn ứng xử và kiểm duyệt bình luận của độc giả trên NewsPortal.',
    },
  ];

  for (const page of staticPages) {
    await prisma.staticPage.create({
      data: page,
    });
  }

  console.log('Created 5 static pages.');

  // 8. Create Site Settings
  const defaultSettings = [
    { key: 'site_name', value: 'NewsPortal', description: 'Tên hiển thị của website' },
    { key: 'site_slogan', value: 'Cổng thông tin điện tử toàn diện & tin cậy', description: 'Khẩu hiệu website' },
    { key: 'site_description', value: 'Cập nhật tin tức nhanh nhất, nóng hổi nhất trong ngày về Thời sự, Kinh doanh, Công nghệ, Thể thao và Đời sống.', description: 'Mô tả SEO mặc định' },
    { key: 'contact_email', value: 'toasoan@newsportal.vn', description: 'Email liên hệ tòa soạn' },
    { key: 'hotline', value: '1900 6868', description: 'Số hotline hỗ trợ bạn đọc' },
    { key: 'address', value: 'Số 15 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', description: 'Địa chỉ tòa soạn' },
    { key: 'articles_per_page', value: '9', description: 'Số lượng bài viết hiển thị trên mỗi trang' },
    { key: 'facebook_url', value: 'https://facebook.com/newsportal.vn', description: 'Kênh Facebook' },
    { key: 'youtube_url', value: 'https://youtube.com/@newsportal_vn', description: 'Kênh YouTube' },
    { key: 'tiktok_url', value: 'https://tiktok.com/@newsportal', description: 'Kênh TikTok' },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.create({
      data: setting,
    });
  }

  console.log('Created 10 default site settings.');

  // 9. Create Audit Log sample
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'SYSTEM',
      targetId: 'seed',
      details: 'Khởi tạo dữ liệu cơ sở dữ liệu hệ thống NewsPortal thành công.',
      ipAddress: '127.0.0.1',
      userAgent: 'NewsPortal Seed Script',
    },
  });

  console.log('--- Database seed completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
