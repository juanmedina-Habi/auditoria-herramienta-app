import { cn } from '../../lib/utils'
import { useAudit } from '../../context/AuditContext'
import type { CountryCode } from '../../types/audit'
import habiLogo from '../../assets/habi-logo.png'
import tuhabiLogo from '../../assets/tuhabi-logo.png'

const brandByCountry: Record<
  CountryCode,
  { logo: string; alt: string; title: string; subtitle: string }
> = {
  CO: { logo: habiLogo, alt: 'Habi', title: 'AuditorIA', subtitle: 'IDM' },
  MX: { logo: tuhabiLogo, alt: 'Tuhabi', title: 'IAudit', subtitle: 'IDM' },
}

type HabiLogoProps = {
  countryCode?: CountryCode
  variant?: 'on-dark' | 'on-light'
  className?: string
}

export function HabiLogo({
  countryCode: countryCodeProp,
  variant = 'on-dark',
  className,
}: HabiLogoProps) {
  const { countryCode: contextCountry } = useAudit()
  const countryCode = countryCodeProp ?? contextCountry
  const brand = brandByCountry[countryCode]

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <img
          src={brand.logo}
          alt={brand.alt}
          className={cn(
            'h-full w-full object-contain',
            variant === 'on-dark' && 'mix-blend-screen',
          )}
        />
      </div>
      <div className={variant === 'on-light' ? 'text-text-primary' : 'text-white'}>
        <p className="text-[11px] font-bold leading-tight">{brand.title}</p>
        <p
          className={cn(
            'text-[10px]',
            variant === 'on-light' ? 'text-text-secondary' : 'text-violet-200',
          )}
        >
          {brand.subtitle}
        </p>
      </div>
    </div>
  )
}
