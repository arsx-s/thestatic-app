"use client";


export default function HubPage() {
  return (
    <div className="p-3 bg-[#070707] min-h-full">

      <Module title="Static Marketplace" sub="Member-to-member buying and selling" icon="M" onClick={() => {}} />
      <Module title="Static Store" sub="Official merchandise and limited drops" icon="S" onClick={() => {}} />
      <Module title="Static Events" sub="Events, registrations and tickets" icon="E" onClick={() => {}} />
    </div>
  );
}

function Module({ title, sub, icon, onClick }: { title: string; sub: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#0a0a0a] border border-[#2b2b2b] rounded-[12px] flex items-center gap-3 p-4 mb-3"
    >
      <div className="w-[52px] h-[52px] rounded-[12px] bg-[#1a1a1a] border border-[#2b2b2b] flex items-center justify-center font-Space-Grotesk font-bold text-[20px] text-[#ececec]">
        {icon}
      </div>
      <div>
        <span className="font-Space-Grotesk font-bold text-[16px] text-[#ececec] block">{title}</span>
        <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">{sub}</span>
      </div>
    </button>
  );
}
