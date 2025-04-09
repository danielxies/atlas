'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface DxButtonProps {
  children: ReactNode;
  bgColor?: string;
  textColor?: string;
  rounded?: string;
  padding?: string;
  hoverColor?: string;
  border?: string;
  shadow?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  destination?: string;
}

export default function DxButton({
  children,
  bgColor = 'bg-[#1a1a1a]',
  textColor = 'text-[#d1cfbf]',
  rounded = 'rounded-lg',
  padding = 'px-6 py-2.5',
  hoverColor = 'hover:bg-[#1a1a1a]/90',
  border,
  shadow,
  onClick,
  className = '',
  disabled = false,
  fullWidth = false,
  destination,
}: DxButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (destination) {
      router.push(destination);
    } else if (onClick) {
      onClick();
    }
  };
  
  const baseClasses = [
    bgColor,
    textColor,
    'font-vastago',
    rounded,
    padding,
    hoverColor,
    border || '',
    shadow || '',
    'transition-colors',
    'text-lg',
    'font-medium',
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
} 