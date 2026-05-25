import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { devMark } from '@/lib/dev-mark';

type BackLinkProps = {
  to?: string;
  label?: string;
};

export function BackLink({ to = '/', label = 'Home' }: BackLinkProps) {
  return (
    <Link
      to={to}
      {...devMark('back')}
      className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
    >
      <ChevronLeft size={16} />
      {label}
    </Link>
  );
}
