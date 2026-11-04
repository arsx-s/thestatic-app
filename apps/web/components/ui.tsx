import { BrandMark } from "./brand-mark";

export function Button({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "submit" | "reset" | "button";
}) {
  const base =
    "font-Space-Grotesk font-bold text-[13px] tracking-[0.06em] uppercase px-4 py-3 rounded-[10px] transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    primary: "bg-[#ececec] text-[#000]",
    secondary: "bg-transparent border border-[#3a3a3a] text-[#ececec]",
    danger: "bg-[#ececec] text-[#000]",
    ghost: "bg-transparent text-[#8b8b8b] font-IBM-Plex-Mono text-[11px]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  className = "",
  multiline = false,
  rows = 1,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <Tag
      type={multiline ? undefined : type}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={multiline ? rows : undefined}
      className={`bg-[#000] border border-[#3a3a3a] text-[#ececec] px-4 py-3 rounded-[10px] font-Inter text-[15px] w-full ${className}`}
    />
  );
}

export function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`font-IBM-Plex-Mono text-[11px] text-[#8b8b8b] uppercase tracking-[0.14em] mb-2 block ml-[2px] ${className}`}>
      {children}
    </label>
  );
}

export function Card({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#0a0a0a] border border-[#2b2b2b] rounded-[12px] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`font-IBM-Plex-Mono text-[11px] text-[#8b8b8b] uppercase tracking-[0.14em] mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block font-Space-Grotesk font-bold text-[22px] tracking-[-0.045em] uppercase text-[#ececec] ${className}`}
    >
      THE STATIC
    </span>
  );
}

export function Tagline({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block font-IBM-Plex-Mono text-[13px] text-[#8b8b8b] tracking-[0.14em] ${className}`}
    >
      There&apos;s more of us than you think.
    </span>
  );
}

export function Avatar({
  src,
  size = 56,
  className = "",
}: {
  src?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-[#1a1a1a] border border-[#2b2b2b]"
        />
      )}
    </div>
  );
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin h-6 w-6 border-2 border-current rounded-full text-[#ececec] ${className}`}
    />
  );
}

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-Space-Grotesk font-bold text-[16px] text-[#ececec]">{value}</span>
      <span className="font-IBM-Plex-Mono text-[10px] text-[#8b8b8b] uppercase tracking-[0.14em]">
        {label}
      </span>
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-[99px] border border-[#3a3a3a] bg-[#000] text-[12px] font-IBM-Plex-Mono text-[#c9c9c9]">
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-[#ececec] font-Space-Grotesk font-bold text-[16px] mb-2">
        {title}
      </div>
      {subtitle && (
        <div className="text-[#8b8b8b] font-IBM-Plex-Mono text-[13px] text-center">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function AuthBrandHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <BrandMark size={30} className="text-[#ececec] shrink-0" />
        <Wordmark />
      </div>
      <Tagline />
    </div>
  );
}
