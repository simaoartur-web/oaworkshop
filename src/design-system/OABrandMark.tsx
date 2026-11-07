import { useState } from 'react';

interface OABrandMarkProps {
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OABrandMark({
  subtitle = 'Internal Workspace',
  size = 'md',
}: OABrandMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClass =
    size === 'lg'
      ? 'h-11 sm:h-12'
      : size === 'sm'
        ? 'h-7 sm:h-8'
        : 'h-9 sm:h-10';

  return (
    <div className="inline-flex items-center gap-3.5 select-none">
      {!imageFailed ? (
        <img
          src="/logo.png"
          alt="O+A"
          width={692}
          height={511}
          onError={() => setImageFailed(true)}
          className={`${sizeClass} w-auto object-contain invert brightness-105 contrast-110`}
        />
      ) : (
        <span
          aria-label="O+A"
          className="font-sans text-xl font-semibold tracking-[0.18em] text-white"
        >
          O<span className="text-[#A65D4A]">+</span>A
        </span>
      )}

      <span aria-hidden="true" className="h-6 w-px bg-white/16" />

      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white">
          {subtitle}
        </span>
        <span className="mt-1 text-[10px] font-normal uppercase tracking-[0.20em] text-[#BDBDBD]">
          O+A Workshop
        </span>
      </div>
    </div>
  );
}
