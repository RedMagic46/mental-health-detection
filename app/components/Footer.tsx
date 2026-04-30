export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-primary font-bold text-lg">MindCare</span>
          <p className="text-muted-foreground text-sm mt-1">Platform Deteksi Kesehatan Mental</p>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MindCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
