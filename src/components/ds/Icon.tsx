// Ícone outline no peso de traço da marca (Lucide).
// Mantém a API por nome em kebab-case usada em todo o app (ex.: "layout-dashboard").
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CloudOff,
  Fuel,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Power,
  PowerOff,
  ReceiptText,
  RotateCw,
  Search,
  Shield,
  Truck,
  Unlink,
  UserPlus,
  UserRound,
  Users,
  UserX,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'

const REGISTRY: Record<string, LucideIcon> = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'arrow-right': ArrowRight,
  bell: Bell,
  'building-2': Building2,
  car: Car,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-help': CircleHelp,
  'clipboard-list': ClipboardList,
  'cloud-off': CloudOff,
  fuel: Fuel,
  inbox: Inbox,
  'key-round': KeyRound,
  'layout-dashboard': LayoutDashboard,
  link: Link,
  'log-out': LogOut,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  plus: Plus,
  power: Power,
  'power-off': PowerOff,
  'receipt-text': ReceiptText,
  'rotate-cw': RotateCw,
  search: Search,
  shield: Shield,
  truck: Truck,
  unlink: Unlink,
  'user-plus': UserPlus,
  'user-round': UserRound,
  users: Users,
  'user-x': UserX,
  wallet: Wallet,
  x: X,
}

export interface IconProps {
  name: string
  size?: number
  color?: string
  stroke?: number
  style?: CSSProperties
}

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  stroke = 1.75,
  style,
}: IconProps) {
  const Cmp = REGISTRY[name]
  if (!Cmp) return null
  return (
    <Cmp
      width={size}
      height={size}
      strokeWidth={stroke}
      color={color}
      style={{ display: 'block', flex: 'none', ...style }}
    />
  )
}
