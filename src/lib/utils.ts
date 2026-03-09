export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(seconds: number): string {
  return seconds.toFixed(2);
}

export function pctColor(pct: number): string {
  if (pct >= 100) return "text-green-600";
  if (pct >= 90) return "text-yellow-600";
  return "text-red-600";
}

export function pctBgColor(pct: number): string {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 85) return "bg-yellow-500";
  return "bg-red-500";
}

export function categoryColor(cat: string): { bg: string; text: string } {
  switch (cat) {
    case "marksmanship": return { bg: "bg-red-50", text: "text-red-700" };
    case "transition_vision": return { bg: "bg-blue-50", text: "text-blue-700" };
    case "stage_movement": return { bg: "bg-amber-50", text: "text-amber-700" };
    case "special": return { bg: "bg-purple-50", text: "text-purple-700" };
    default: return { bg: "bg-gray-50", text: "text-gray-700" };
  }
}

export function categoryLabel(cat: string): string {
  switch (cat) {
    case "marksmanship": return "Marksmanship";
    case "transition_vision": return "Transitions";
    case "stage_movement": return "Movement";
    case "special": return "Special";
    default: return cat;
  }
}

export function classificationOrder(c: string): number {
  return ["D", "C", "B", "A", "M", "GM"].indexOf(c);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function minutesBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}
