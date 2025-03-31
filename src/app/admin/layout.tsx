export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div className="container mx-auto py-8">{children}</div>;
  }