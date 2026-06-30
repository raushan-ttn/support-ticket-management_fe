import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile — Support Ticket Management',
};

export default function UserMePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="text-sm text-gray-500">Profile details will appear here.</p>
    </div>
  );
}
