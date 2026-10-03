import type { Metadata } from "next";
import LegalPage from "../../../components/legal/LegalPage";
export const metadata: Metadata = { title: "Quyền lợi và trách nhiệm", description: "Quyền lợi, nghĩa vụ và trách nhiệm của khách hàng, thành viên và đối tác TRIA CAFE." };
export default function RightsPage() { return <LegalPage eyebrow="Rights & Responsibilities · TRIA CAFE" title="Quyền lợi và trách nhiệm" intro="Trang này giải thích ngắn gọn quyền lợi và trách nhiệm của khách hàng mua hàng, thành viên Community và đối tác hợp tác điểm bán." sections={[
 { title: "1. Quyền lợi khách hàng", paragraphs: ["Khách hàng có quyền nhận thông tin sản phẩm rõ ràng, được xác nhận đơn, hỗ trợ kỹ thuật, tư vấn phù hợp và tiếp nhận xử lý khiếu nại theo chính sách từng dịch vụ/đơn hàng."] },
 { title: "2. Trách nhiệm khách hàng", paragraphs: ["Khách hàng cần cung cấp thông tin nhận hàng chính xác, kiểm tra sản phẩm khi nhận, sử dụng máy/phụ kiện theo hướng dẫn, không lạm dụng khuyến mại và thanh toán đúng cam kết."] },
 { title: "3. Quyền lợi thành viên", paragraphs: ["Thành viên có thể tham gia thảo luận, bình luận, bình chọn, tích điểm và nhận thông tin cộng đồng theo điều kiện chương trình. Điểm, badge hoặc ưu đãi không mặc nhiên có giá trị tiền mặt và có thể thay đổi theo thể lệ."] },
 { title: "4. Trách nhiệm thành viên", paragraphs: ["Thành viên chịu trách nhiệm về nội dung đã đăng, tôn trọng người khác, bảo vệ tài khoản và báo cáo nội dung vi phạm. Không dùng Community cho mục đích trái pháp luật, spam hoặc quảng cáo trái phép."] },
 { title: "5. Đối tác và điểm bán", paragraphs: ["Lead hợp tác chỉ là nhu cầu ban đầu, không phải cam kết cấp quyền hay bảo đảm doanh thu. Các điều kiện vị trí, đầu tư, chia sẻ doanh thu, đào tạo và hỗ trợ phải được xác nhận bằng hợp đồng/tài liệu riêng trước khi triển khai."] },
]} />; }
