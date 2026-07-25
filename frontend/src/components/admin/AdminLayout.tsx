import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
