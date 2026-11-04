"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BarChart3, Bell, CalendarDays, CheckCircle2, Eye, ExternalLink, Inbox, MapPin, MessageSquare, RefreshCw, Shield, ShoppingBag, Store, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { deleteLead, deleteMessage, deleteOrder, updateBookingStatus, updateLeadStatus, updateMessageStatus, updateOrderStatus } from "../../app/actions/admin";
import { BranchManager, ProductManager } from "./CatalogManager";
import FooterLinkManager from "./FooterLinkManager";
import FooterPageManager from "./FooterPageManager";
import ContentManager from "./ContentManager";
import UserManager from "./UserManager";
import AffiliateManager from "./AffiliateManager";
import ProductCommentManager from "./ProductCommentManager";
import ProductReviewManager from "./ProductReviewManager";

type Dashboard = {
  stats: Record<string, number>;
  recentOrders: AdminRow[];
  recentBookings: AdminRow[];
  recentMessages: AdminRow[];
  recentLeads: AdminRow[];
};

type AdminRow = {
  id: string;
  name?: string | null;
  subject?: string | null;
  type?: string | null;
  phone?: string | null;
  address?: string | null;
  note?: string | null;
  createdAt?: string | Date | null;
  locationId?: string | null;
  status?: string | null;
  total?: number | null;
  user?: { name?: string | null; email?: string | null } | null;
  fullName?: string | null;
  partnershipType?: string | null;
  location?: string | null;
  date?: string | Date | null;
  items?: { id: string; name: string; unitPrice: number; quantity: number }[];
};

type AdminActivity = { id: string; kind: string; title: string; detail: string; actor: string; createdAt: string; tab: Tab };
type Tab = "overview" | "notifications" | "products" | "branches" | "footer" | "content" | "points" | "users" | "bookings" | "orders" | "affiliate" | "messages" | "productComments" | "productReviews";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "notifications", label: "Thông báo" },
  { id: "products", label: "Sản phẩm" },
  { id: "branches", label: "Hệ thống quán" },
  { id: "footer", label: "Footer" },
  { id: "content", label: "Nội dung" },
  { id: "points", label: "Điểm bán" },
  { id: "users", label: "Users" },
  { id: "bookings", label: "Lịch demo" },
  { id: "orders", label: "Đơn hàng" },
  { id: "affiliate", label: "Affiliate" },
  { id: "messages", label: "Tin nhắn" },
  { id: "productComments", label: "Bình luận" },
  { id: "productReviews", label: "Đánh giá" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [unreadActivities, setUnreadActivities] = useState(0);
  const [activityNotification, setActivityNotification] = useState<AdminActivity | null>(null);
  const activityCursor = useRef<string | null>(null);
  const seenActivityIds = useRef(new Set<string>());
  const activityRequestInFlight = useRef(false);

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

  const pollActivities = useCallback(async () => {
    if (activityRequestInFlight.current) return;
    activityRequestInFlight.current = true;
    try {
      const since = activityCursor.current;
      const query = since ? `?since=${encodeURIComponent(since)}` : "";
      const response = await fetch(`/api/admin/notifications${query}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json() as { activities: AdminActivity[]; checkedAt: string };
      const freshActivities = payload.activities.filter((activity) => !seenActivityIds.current.has(activity.id));
      for (const activity of payload.activities) seenActivityIds.current.add(activity.id);
      if (!since) {
        setActivities(payload.activities);
      } else if (freshActivities.length) {
        setActivities((current) => [...freshActivities, ...current].filter((activity, index, all) => all.findIndex((item) => item.id === activity.id) === index).slice(0, 100));
        setUnreadActivities((count) => count + freshActivities.length);
        setActivityNotification(freshActivities[0]);
      }
      activityCursor.current = payload.checkedAt;
    } catch {
      // Keep the dashboard usable if a single polling request fails.
    } finally {
      activityRequestInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void pollActivities();
    const intervalId = window.setInterval(() => { void pollActivities(); }, 5000);
    return () => window.clearInterval(intervalId);
  }, [pollActivities]);

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab === "notifications") {
      setUnreadActivities(0);
      setActivityNotification(null);
    }
  };

  const openActivity = (activity: AdminActivity) => {
    selectTab(activity.tab);
    setActivityNotification(null);
    void load();
  };

  if (loading && !data) {
    return <div className="flex min-h-[70vh] items-center justify-center text-[#A69B93]">Đang tải dashboard...</div>;
  }

  return (
    <main className="min-h-screen w-full bg-[#0F0D0C] px-3 py-4 text-[#FDFBF7] sm:px-5 lg:px-6">
      <div className="w-full">
        <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">TRIA Admin</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white">Quản trị hệ thống</h1>
            <p className="mt-1 text-sm text-[#A69B93]">Quản lý sản phẩm, nội dung website, người dùng, booking, đơn hàng và liên hệ.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#3A302B] px-4 py-2 text-sm text-[#CDBBAA] hover:border-[#D97706] hover:text-white"
            >
              <ExternalLink className="h-4 w-4" aria-hidden /> Xem trang
            </Link>
            <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#3A302B] px-4 py-2 text-sm text-[#CDBBAA] hover:border-[#D97706]">
              <RefreshCw className="h-4 w-4" aria-hidden /> Làm mới
            </button>
          </div>
        </header>

        {error && <p role="alert" className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">{error}</p>}

        {activityNotification && (
          <aside role="status" className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-[#6B452A] bg-[#211A16] p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white">{activityNotification.title}</p>
                <p className="mt-1 text-xs text-[#CDBBAA]">{activityNotification.actor}</p>
                <p className="mt-2 line-clamp-2 text-sm text-[#A69B93]">{activityNotification.detail}</p>
                <button type="button" onClick={() => openActivity(activityNotification)} className="mt-3 text-sm font-bold text-[#E2A168] hover:text-white">Mở để xử lý</button>
              </div>
              <button type="button" aria-label="Đóng thông báo" onClick={() => setActivityNotification(null)} className="rounded-md p-1 text-[#A69B93] hover:bg-[#2A2421] hover:text-white">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </aside>
        )}

        <nav className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-[#2A2421] bg-[#171412] p-2 sm:grid-cols-4 lg:grid-cols-10" aria-label="Admin sections">
          {TABS.map((item) => (
            <button key={item.id} type="button" onClick={() => selectTab(item.id)} aria-current={tab === item.id} className={`rounded-xl px-2 py-3 text-xs font-bold transition ${tab === item.id ? "bg-[#D97706] text-[#1C1613]" : "text-[#A69B93] hover:bg-[#2A2421] hover:text-white"}`}>
              {item.label}{item.id === "notifications" && unreadActivities > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{unreadActivities}</span>}
            </button>
          ))}
        </nav>

        {!data ? <div className="rounded-2xl border border-[#3A302B] bg-[#171412] p-8 text-sm text-[#81746B]">Không có dữ liệu.</div> : (
          <>
            {tab === "overview" && <Overview stats={data.stats} orders={data.recentOrders} bookings={data.recentBookings} messages={data.recentMessages} />}
            {tab === "notifications" && <ActivityCenter activities={activities} onOpen={openActivity} />}
            {tab === "products" && <ProductManager />}
            {tab === "branches" && <BranchManager />}
            {tab === "footer" && <div className="space-y-6"><FooterPageManager /><FooterLinkManager /></div>}
            {tab === "content" && <ContentManager />}
            {tab === "points" && <DataTable title="Lead hợp tác / điểm bán" rows={data.recentLeads} empty="Chưa có lead hợp tác." onStatus={updateLeadStatus} onDelete={deleteLead} />}
            {tab === "users" && <UserManager />}
            {tab === "bookings" && <DataTable title="Lịch demo / booking gần đây" rows={data.recentBookings} empty="Chưa có booking." onStatus={updateBookingStatus} />}
            {tab === "orders" && <DataTable title="Đơn đặt hàng gần đây" rows={data.recentOrders} empty="Chưa có đơn hàng." onStatus={updateOrderStatus} onDelete={deleteOrder} onView />}
            {tab === "affiliate" && <AffiliateManager />}
            {tab === "messages" && <DataTable title="Tin nhắn liên hệ" rows={data.recentMessages} empty="Chưa có tin nhắn." onStatus={updateMessageStatus} onDelete={deleteMessage} />}
            <div hidden={tab !== "productComments"}><ProductCommentManager /></div>
            <div hidden={tab !== "productReviews"}><ProductReviewManager /></div>
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

function ActivityCenter({ activities, onOpen }: { activities: AdminActivity[]; onOpen: (activity: AdminActivity) => void }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412]">
      <div className="flex items-center justify-between gap-3 border-b border-[#2A2421] p-5">
        <div>
          <h2 className="text-xl font-bold text-white">Hoạt động gần đây</h2>
          <p className="mt-1 text-xs text-[#81746B]">Cập nhật tự động mỗi 5 giây khi trang quản trị đang mở</p>
        </div>
        <Bell className="h-5 w-5 text-[#D97706]" aria-hidden />
      </div>
      {activities.length ? (
        <ul className="divide-y divide-[#2A2421]">
          {activities.map((activity) => (
            <li key={activity.id}>
              <button type="button" onClick={() => onOpen(activity)} className="grid w-full gap-2 p-5 text-left transition hover:bg-[#221D1A] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-white">{activity.title}</span>
                  <span className="mt-1 block truncate text-xs text-[#A69B93]">{activity.actor} · {activity.detail}</span>
                </span>
                <time className="text-xs text-[#81746B]" dateTime={activity.createdAt}>{new Date(activity.createdAt).toLocaleString("vi-VN")}</time>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="p-8 text-sm text-[#81746B]">Chưa có hoạt động mới.</p>}
    </section>
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

function DataTable({ title, rows, empty, onStatus, onDelete, onView }: { title: string; rows: AdminRow[]; empty: string; onStatus?: (id: string, status: string) => Promise<unknown>; onDelete?: (id: string) => Promise<unknown>; onView?: boolean }) {
  const [selectedOrder, setSelectedOrder] = useState<AdminRow | null>(null);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[#3A302B] bg-[#171412]">
      <div className="border-b border-[#2A2421] p-5"><h2 className="text-xl font-bold text-white">{title}</h2></div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#221D1A] text-xs uppercase text-[#A69B93]"><tr><th className="px-5 py-3">Thông tin</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Thao tác</th></tr></thead>
            <tbody>{rows.map((row) => (
              <tr key={row.id} className="border-t border-[#2A2421] text-[#CDBBAA]">
                <td className="px-5 py-4"><strong className="text-white">{row.name || row.fullName || row.subject || row.user?.email || row.type}</strong><span className="mt-1 block text-xs text-[#81746B]">{row.phone || row.user?.email || row.location || row.locationId || row.partnershipType || (row.date ? new Date(row.date).toLocaleString("vi-VN") : "") || (row.total ? `${row.total.toLocaleString("vi-VN")} VNĐ` : "")}</span></td>
                <td className="px-5 py-4"><span className="rounded-full bg-[#D97706]/15 px-2 py-1 text-xs text-[#F0B429]">{row.status || "Mới"}</span></td>
                <td className="px-5 py-4"><div className="flex gap-2">
                  {onView && <button type="button" aria-label="Xem chi tiết đơn hàng" onClick={() => setSelectedOrder(row)} className="rounded-lg border border-[#3A302B] p-2 hover:border-[#D97706]"><Eye className="h-4 w-4" /></button>}
                  {onStatus && <button type="button" aria-label="Cập nhật trạng thái" onClick={() => void onStatus(row.id, row.status === "NEW" ? "PROCESSING" : "DONE")} className="rounded-lg border border-[#3A302B] p-2 hover:border-[#D97706]"><CheckCircle2 className="h-4 w-4" /></button>}
                  {onDelete && <button type="button" aria-label="Xóa" onClick={() => void onDelete(row.id)} className="rounded-lg border border-red-900/50 p-2 text-red-400"><Trash2 className="h-4 w-4" /></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="p-8 text-sm text-[#81746B]">{empty}</p>}
      </section>
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </>
  );
}

function OrderDetail({ order, onClose }: { order: AdminRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Chi tiết đơn hàng" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#4A3B31] bg-[#171412] p-6 text-[#FDFBF7] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Chi tiết đơn hàng</p>
            <h2 className="mt-1 text-xl font-bold text-white">{order.name || "Khách hàng"}</h2>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-lg p-2 text-[#A69B93] hover:bg-[#2A2421] hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-[#81746B]">Số điện thoại</dt><dd className="mt-1 text-[#CDBBAA]">{order.phone || "—"}</dd></div>
          <div><dt className="text-[#81746B]">Email</dt><dd className="mt-1 break-all text-[#CDBBAA]">{order.user?.email || "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[#81746B]">Địa chỉ nhận hàng</dt><dd className="mt-1 text-[#CDBBAA]">{order.address || "—"}</dd></div>
          {order.note && <div className="sm:col-span-2"><dt className="text-[#81746B]">Ghi chú</dt><dd className="mt-1 text-[#CDBBAA]">{order.note}</dd></div>}
        </dl>
        <div className="mt-5 border-t border-[#2A2421] pt-4">
          <h3 className="font-bold text-white">Sản phẩm</h3>
          <div className="mt-3 space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 rounded-lg bg-[#221D1A] p-3 text-sm">
                <span className="text-[#CDBBAA]">{item.name} × {item.quantity}</span>
                <span className="shrink-0 text-[#F0B429]">{(item.unitPrice * item.quantity).toLocaleString("vi-VN")} VNĐ</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-[#2A2421] pt-3 font-bold">
            <span>Tổng cộng</span><span className="text-[#F0B429]">{(order.total || 0).toLocaleString("vi-VN")} VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
