export default function NarrowPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[640px] pb-20 md:pb-0">
      {children}
    </div>
  );
}