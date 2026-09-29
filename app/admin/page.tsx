import { redirect } from "next/navigation";
import { auth } from "../../auth";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  return <main className="min-h-screen bg-[#1C1613] p-8 text-[#FDFBF7]"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">TRIA Admin</p><h1 className="mt-3 text-4xl font-bold">Quản trị hệ thống</h1><p className="mt-3 text-[#B9A99B]">Xin chào {session.user.name}. Khu vực quản lý người dùng, bài viết, workshop và đơn hàng.</p></main>;
}
