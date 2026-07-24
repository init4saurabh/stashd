import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="flex flex-col w-full bg-[#050505]">
      <div className="flex flex-col md:flex-row gap-12 md:gap-[80px] px-6 md:px-[120px] py-12 md:py-[64px]">
        <div className="flex flex-col gap-6 md:w-[280px] md:shrink-0">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] bg-[#FFD600] shrink-0" />
            <span className="font-grotesk text-[16px] font-bold text-[#FFD600] tracking-[3px]">STASHD</span>
          </div>
          <p className="font-ibm-mono text-[11px] text-[#888888] tracking-[1px] leading-[1.6] max-w-[260px]">
            SAVE ANY LINK. LET AI ORGANIZE IT. FIND IT AGAIN WHEN IT MATTERS.
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-1 gap-8 md:gap-[80px]">
          <div className="flex flex-col gap-4 md:gap-[20px]">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px]">PRODUCT</span>
            <a href="#features" className="font-ibm-mono text-[12px] text-[#888888] tracking-[1px] hover:text-[#CCCCCC] transition-colors">FEATURES</a>
            <a href="#pricing" className="font-ibm-mono text-[12px] text-[#888888] tracking-[1px] hover:text-[#CCCCCC] transition-colors">PRICING</a>
            <a href="#faq" className="font-ibm-mono text-[12px] text-[#888888] tracking-[1px] hover:text-[#CCCCCC] transition-colors">FAQ</a>
          </div>
          <div className="flex flex-col gap-4 md:gap-[20px]">
            <span className="font-grotesk text-[11px] font-bold text-[#F5F5F0] tracking-[2px]">ACCOUNT</span>
            <Link href="/login" className="font-ibm-mono text-[12px] text-[#888888] tracking-[1px] hover:text-[#CCCCCC] transition-colors">SIGN IN</Link>
            <Link href="/signup" className="font-ibm-mono text-[12px] text-[#888888] tracking-[1px] hover:text-[#CCCCCC] transition-colors">SIGN UP</Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-6 md:px-[120px] py-4 md:h-[56px] border-t border-t-[#1D1D1D] gap-3 sm:gap-0">
        <span className="font-ibm-mono text-[11px] text-[#666666] tracking-[1px]">© 2026 STASHD. ALL RIGHTS RESERVED.</span>
        <span className="font-ibm-mono text-[11px] font-bold text-[#FFD600] tracking-[1px]">V1.0</span>
      </div>
    </footer>
  );
}