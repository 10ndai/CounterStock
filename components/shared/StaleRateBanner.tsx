import { AlertTriangle } from "lucide-react";

interface Props {
  updatedAt: Date;
}

export function StaleRateBanner({ updatedAt }: Props) {
  const today = new Date();
  const updated = new Date(updatedAt);
  const isToday =
    updated.getFullYear() === today.getFullYear() &&
    updated.getMonth() === today.getMonth() &&
    updated.getDate() === today.getDate();

  if (isToday) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-alert/10 border border-alert/20 px-4 py-2.5 text-alert text-sm font-medium">
      <AlertTriangle size={16} className="shrink-0" />
      <span>Exchange rate not updated today — contact admin before ZWG sales</span>
    </div>
  );
}
