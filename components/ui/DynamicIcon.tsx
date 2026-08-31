import { HelpCircle, icons, type LucideProps } from "lucide-react";

export function DynamicIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const IconComponent = icons[name as keyof typeof icons] ?? HelpCircle;
  return <IconComponent {...props} />;
}
