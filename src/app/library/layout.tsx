import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Library - Anistreamz',
  description: 'Your anime watchlist and watch history.',
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
