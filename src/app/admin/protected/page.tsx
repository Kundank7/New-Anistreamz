import { getProtectedAnime } from '../actions';
import { ProtectedControlCenter } from './ProtectedControlCenter';

export const dynamic = 'force-dynamic';

export default async function ProtectedCenterPage() {
  const data = await getProtectedAnime();

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-8">
        <header className="border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary flex items-center gap-3">
              Protected Center
            </h1>
            <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
              Metadata & Episode Management
            </p>
          </div>
        </header>

        <ProtectedControlCenter initialData={data} />
      </div>
    </div>
  );
}
