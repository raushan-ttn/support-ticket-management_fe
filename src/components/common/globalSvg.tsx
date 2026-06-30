import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  readonly size?: number;
}

function strokeIconDefaults(
  size: number,
): Pick<
  SVGProps<SVGSVGElement>,
  'width' | 'height' | 'viewBox' | 'fill' | 'stroke' | 'strokeWidth' | 'aria-hidden'
> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    'aria-hidden': true,
  };
}

export function TtnLogoIcon({ className, width = 48, height = 48, ...props }: IconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <polygon points="24,4 44,16 36,44 12,44 4,16" fill="#e91e8c" />
      <polygon points="24,4 44,16 24,28 4,16" fill="#7b2ff7" />
      <polygon points="4,16 24,28 12,44" fill="#2196f3" />
      <polygon points="44,16 24,28 36,44" fill="#00bcd4" />
      <polygon points="24,28 12,44 36,44" fill="#ffc107" />
    </svg>
  );
}

export function HomeIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

export function ProfileIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function ActionsIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function TimeIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ResumeIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M6 4h9l3 3v13H6V4z" />
      <path d="M15 4v3h3M9 12h6M9 16h6" />
    </svg>
  );
}

export function TicketIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M4 8h16v8H4V8z" />
      <path d="M8 8v8M16 8v8" />
    </svg>
  );
}

export function ApproveIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export function LinksIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10 5.5" />
      <path d="M14 11a5 5 0 0 0-7.1 0L5.5 12.4a5 5 0 0 0 7.1 7.1L14 18.5" />
    </svg>
  );
}

export function OrgChartIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <rect x="2" y="18" width="6" height="4" rx="1" />
      <rect x="16" y="18" width="6" height="4" rx="1" />
      <path d="M12 6v4M12 10H5v8M12 10h7v8" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 14, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

export function HelpIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 1.5-2.3 1.5-2.3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function BellIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function GridIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function CloseIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function LogoutIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg className={className} {...strokeIconDefaults(size)} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
