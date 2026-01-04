import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  count?: number;
}

export interface MetricData {
  id: string;
  title: string;
  value: string;
  subValue: string; // e.g., "15.4% Profit Rate"
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  chartColor: string;
  icon: LucideIcon;
  data: number[]; // For sparkline
}

export interface PendingAction {
  id: string;
  type: 'finance' | 'logistics' | 'inventory';
  title: string;
  subtitle: string;
  urgent?: boolean;
}
