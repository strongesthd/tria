"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, CalendarDays, CheckCircle2, Inbox, MapPin, MessageSquare, RefreshCw, Shield, ShoppingBag, Store, Trash2, Users } from "lucide-react";
import { deleteMessage, deleteOrder, updateMessageStatus, updateOrderStatus } from "../../app/actions/admin";

type Dashboard = {
  stats: Record<string, number>;
  recentOrders: AdminRow[];
  recentBookings: AdminRow[];
  recentMessages: AdminRow[];
};

type AdminRow = {
  id: string;
  name?: string | null;
  subject?: string | null;
  type?: string | null;
  phone?: string | null;
  locationId?: string | null;
  status?: string | null;
  total?: number | null;
  user?: { name?: string | null; email?: string | null } | null;
};

type Tab = "overview" | "products" | "branches" | "points" | "users" | "bookings" | "orders" | "messages";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "products", label: "Sản phẩm" },
  { id: "branches", label: "Hệ thống quán" },
  { id: "points", label: "Điểm bán" },
  { id: "users", label: "Users" },
  { id: "bookings", label: "Lịch demo" },
  { id: "orders", label: "Đơn hàng" },
  { id: "messages", label: "Tin nhắn" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.error) throw new Error(payload.error);
        setData(payload);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được dashboard."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading && !data) {
    return <div className="flex min-h-[70vh] items-center justify-center text-[#A69B93]">Đang tải dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-[#0F0D0C] px-4 py-8 text-[#FDFBF7] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">TRIA Admin</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Quản trị hệ thống</h1>
            <p className="mt-2 text-sm text-[#A69B93]">Quản lý sản phẩm, hệ thống, người dùng, booking, đơn hàng và liên hệ.</p>
          </div>
          <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#3A302B] px-4 py-2 text-sm text-[#CDBBAA] hover:border-[#D97706]">
            <RefreshCw className="h-4 w-4" aria-hidden /> Làm mới
          </button>
        </header>

        {error && <p role="alert" className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">{error}</p>}

        <nav className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#2A2421] bg-[#171412] p-2 sm:grid-cols-4 lg:grid-cols-8" aria-label="Admin sections">
          {TABS.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-current={tab === item.id} className={`rounded-xl px-2 py-3 text-xs font-bold transition ${tab === item.id ? "bg-[#D97706] text-[#1C1613]" : "text-[#A69B93] hover:bg-[#2A2421] hover:text-white"}`}>
              {item.label}
            </button>
          ))}
        </nav>

        {!data ? <div className="rounded-2xl border border-[#3A302B] bg-[#171412] p-8 text-sm text-[#81746B]">Không có dữ liệu.</div> : (
          <>
            {tab === "overview" && <Overview stats={data.stats} orders={data.recentOrders} bookings={data.recentBookings} messages={data.recentMessages} />}
            {tab === "products" && <InfoPanel title="Quản lý sản phẩm" body="Catalog sản phẩm công khai đang dùng source dữ liệu site để luôn có thể render được khi DB/CDN lỗi. Admin có thể bật/tắt trạng thái active của bản ghi sản phẩm trong database." stats={`${data.stats.products || 0} sản phẩm đang hoạt động`} icon="coffee" />}
            {tab === "branches" && <InfoPanel title="Hệ thống quán" body="Quản lý địa chỉ, hotline, giờ hoạt động, tính năng và trạng thái các cơ sở trải nghiệm." stats={`${data.stats.branches || 0} cơ sở đang hoạt động`} icon="store" />}
            {tab === "points" && <InfoPanel title="Điểm bán On-The-Go" body="Quản lý các lead hợp tác vị trí/nhượng quyền từ module Hợp tác điểm bán." stats={`${data.stats.leads || 0} lead mới đang chờ xử lý`} icon="map" />}
            {tab === "users" && <InfoPanel title="Người dùng" body="Quản lý thành viên, role, badge, TRIA Points. Các thay đổi quyền được thực hiện qua server action requireAdmin." stats={`${data.stats.users || 0} người dùng`} icon="users" />}
            {tab === "bookings" && <DataTable title="Lịch demo / booking gần đây" rows={data.recentBookings} empty="Chưa có booking." />}
            {tab === "orders" && <DataTable title="Đơn đặt hàng gần đây" rows={data.recentOrders} empty="Chưa có đơn hàng." onStatus={updateOrderStatus} onDelete={deleteOrder} />}
            {tab === "messages" && <DataTable title="Tin nhắn liên hệ" rows={data.recentMessages} empty="Chưa có tin nhắn." onStatus={updateMessageStatus} onDelete={deleteMessage} />}
          </>
        )}
      </div>
    </main>
  );
}

function Overview({ stats, orders, bookings, messages }: { stats: Record<string, number>; orders: AdminRow[]; bookings: AdminRow[]; messages: AdminRow[] }) {
  const cards = [
    { label: "Người dùng", value: stats.users, icon: <Users className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Sản phẩm active", value: stats.products, icon: <ShoppingBag className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Cơ sở active", value: stats.branches, icon: <Store className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Bài viết", value: stats.posts, icon: <MessageSquare className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Booking", value: stats.bookings, icon: <CalendarDays className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Đơn hàng", value: stats.orders, icon: <ShoppingBag className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Tin nhắn mới", value: stats.messages, icon: <Inbox className="h-5 w-5 text-[#D97706]" aria-hidden /> },
    { label: "Lead hợp tác mới", value: stats.leads, icon: <Shield className="h-5 w-5 text-[#D97706]" aria-hidden /> },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
            {card.icon}
            <p className="mt-4 text-xs text-[#A69B93]">{card.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{card.value || 0}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <MiniList title="Đơn hàng mới" rows={orders} />
        <MiniList title="Lịch demo" rows={bookings} />
        <MiniList title="Tin nhắn mới" rows={messages} />
      </div>
    </div>
  );
}

function MiniList({ title, rows }: { title: string; rows: AdminRow[] }) {
  return (
    <section className="rounded-2xl border border-[#3A302B] bg-[#171412] p-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-[#D97706]" aria-hidden />
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.slice(0, 5).map((row) => (
          <li key={row.id} className="border-b border-[#2A2421] pb-2 text-xs text-[#CDBBAA]">
            <span className="font-semibold text-white">{row.name || row.user?.name || row.subject || row.type}</span>
            <span className="mt-1 block text-[#81746B]">{row.status || row.locationId || row.user?.email || "Mới"}</span>
          </li>
        ))}
      </ul>
      {!rows.length && <p className="mt-4 text-xs text-[#81746B]">Chưa có dữ liệu.</p>}
    </section>
  );
}

function InfoPanel({ title, body, stats, icon }: { title: string; body: string; stats: string; icon: string }) {
  const iconMap: Record<string, ReactNode> = {
    coffee: <ShoppingBag className="h-7 w-7 text-[#D97706]" aria-hidden />,
    store: <Store className="h-7 w-7 text-[#D97706]" aria-hidden />,
    map: <MapPin className="h-7 w-7 text-[#D97706]" aria-hidden />,
    users: <Users className="h-7 w-7 text-[#D97706]" aria-hidden />,
  };
  return (
    <section className="rounded-2xl border border-[#3A302B] bg-[#171412] p-8">
      {iconMap[icon]}
      <h2 className="mt-5 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#A69B93]">{body}</p>
      <p className="mt-6 rounded-xl border border-[#4A3B31] bg-[#221D1A] p-4 text-sm font-bold text-[#F0B429]">{stats}</p>
    </section>
  );
}

function DataTable({ title, rows, empty, onStatus, onDelete }: { title: string; rows: AdminRow[]; empty: string; onStatus?: (id: string, status: string) => Promise<unknown>; onDelete?: (id: string) => Promise<unknown> }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412]">
      <div className="border-b border-[#2A2421] p-5"><h2 className="text-xl font-bold text-white">{title}</h2></div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#221D1A] text-xs uppercase text-[#A69B93]"><tr><th className="px-5 py-3">Thông tin</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Thao tác</th></tr></thead>
            <tbody>{rows.map((row) => (
              <tr key={row.id} className="border-t border-[#2A2421] text-[#CDBBAA]">
                <td className="px-5 py-4"><strong className="text-white">{row.name || row.subject || row.user?.email || row.type}</strong><span className="mt-1 block text-xs text-[#81746B]">{row.phone || row.user?.email || row.locationId || (row.total ? `${row.total.toLocaleString("vi-VN")} VNĐ` : "")}</span></td>
                <td className="px-5 py-4"><span className="rounded-full bg-[#D97706]/15 px-2 py-1 text-xs text-[#F0B429]">{row.status || "Mới"}</span></td>
                <td className="px-5 py-4"><div className="flex gap-2">
                  {onStatus && <button type="button" aria-label="Cập nhật trạng thái" onClick={() => void onStatus(row.id, row.status === "NEW" ? "PROCESSING" : "DONE")} className="rounded-lg border border-[#3A302B] p-2 hover:border-[#D97706]"><CheckCircle2 className="h-4 w-4" /></button>}
                  {onDelete && <button type="button" aria-label="Xóa" onClick={() => void onDelete(row.id)} className="rounded-lg border border-red-900/50 p-2 text-red-400"><Trash2 className="h-4 w-4" /></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="p-8 text-sm text-[#81746B]">{empty}</p>}
    </section>
  );
}
