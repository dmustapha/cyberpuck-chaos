import { DesignProvider } from '@/designs/DesignContext';
import { DesignId } from '@/designs/types';

interface Props {
  children: React.ReactNode;
  params: Promise<{ 'design-id': string }>;
}

export default async function DesignLayout({ children, params }: Props) {
  const { 'design-id': designId } = await params;

  return (
    <DesignProvider initialDesign={designId as DesignId}>
      {children}
    </DesignProvider>
  );
}

export function generateStaticParams() {
  return [
    { 'design-id': 'tokyo-drift' },
    { 'design-id': 'arctic-frost' },
    { 'design-id': 'molten-core' },
    { 'design-id': 'synthwave-sunset' },
    { 'design-id': 'midnight-club' },
  ];
}
