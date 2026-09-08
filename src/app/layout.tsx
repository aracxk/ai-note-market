export const metadata = {
  title: 'AI-Note Market',
  description: 'AI-Note Market - DDD Learning Project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
