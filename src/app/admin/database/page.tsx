import { getAnimeListAdmin } from '../actions';
import { DatabaseTable } from './DatabaseTable';

export const dynamic = 'force-dynamic';

export default async function AdminDatabase({
  searchParams
}: {
  searchParams: Promise<{ page?: string, search?: string, sort?: string, order?: string, source?: string }>
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const sort = params.sort || 'id';
  const order = params.order || 'desc';
  const source = params.source || '';

  const data = await getAnimeListAdmin({ page, limit: 50, search, sort, order, source });

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-8">
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary">
            Data Nexus
          </h1>
          <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
            Central Anime Repository
          </p>
        </header>

        <DatabaseTable 
          initialData={data.items} 
          total={data.total}
          totalPages={data.totalPages}
          currentPage={page}
          currentSearch={search}
          currentSort={sort}
          currentOrder={order}
          currentSource={source}
        />
      </div>
    </div>
  );
}
