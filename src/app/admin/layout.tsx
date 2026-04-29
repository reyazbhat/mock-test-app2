import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  // Allow multiple admin emails separated by comma
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || '';

  if (!adminEmails.includes(userEmail)) {
    redirect('/'); // Redirect non-admins to the home page
  }

  return (
    <>
      <div style={{ backgroundColor: 'var(--danger)', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
        ⚠️ SUPER ADMIN MODE
      </div>
      {children}
    </>
  );
}
