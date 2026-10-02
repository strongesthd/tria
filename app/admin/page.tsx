import { auth } from "../../auth";
import AdminDashboard from "../../components/admin/AdminDashboard";
import AdminLoginGate from "../../components/admin/AdminLoginGate";

export default async function AdminPage() {
  const session = await auth();
  const oauthEnabled = {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
  };

  // Keep the route discoverable and show a clear login action instead of
  // silently redirecting anonymous visitors to the homepage.
  if (!session?.user) return <AdminLoginGate oauthEnabled={oauthEnabled} />;
  if (session.user.role !== "ADMIN") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 text-center">
        <div className="rounded-2xl border border-red-900/50 bg-[#171412] p-8">
          <h1 className="text-2xl font-bold text-white">Không có quyền truy cập</h1>
          <p className="mt-2 text-sm text-[#A69B93]">Tài khoản của bạn không có quyền quản trị hệ thống.</p>
        </div>
      </main>
    );
  }
  return <AdminDashboard />;
}
