export default function DailyTopicHeader() {
  return (
    <header className="w-full bg-white border-b">
      <div className="container max-w-md mx-auto px-4 py-3">
        {/* Logo e Nome */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/zion-logo.png"
              alt="Logo Zion"
              className="w-5 h-5"
            />
            <span className="text-[15px] text-[#1a1a1a]">Zion Church</span>
          </div>
          <div>
            <span className="text-[15px] text-[#666666]">40 Dias de Oração</span>
          </div>
        </div>
      </div>
    </header>
  );
} 