import { getAdminStats, getRecentOngoingEpisodes, getServerMetrics, getTodaysScrapeSummary, getSystemLogs } from './actions';
import Link from 'next/link';
import RefreshButton from './RefreshButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [stats, recentEpisodes, serverMetrics, todaysSummary, systemLogs] = await Promise.all([
    getAdminStats(),
    getRecentOngoingEpisodes(20),
    getServerMetrics(),
    getTodaysScrapeSummary(),
    getSystemLogs(30)
  ]);

  const metrics = [
    { label: 'Total Anime', value: stats.totalAnime, color: 'text-secondary' },
    { label: 'Total Episodes', value: stats.totalEpisodes, color: 'text-foreground' },
    { label: 'Total Characters', value: stats.totalCharacters, color: 'text-foreground' },
    { label: 'Database Size', value: `${stats.dbSizeMB} MB`, color: 'text-foreground' },
  ];

  const warnings = [
    { label: 'No Episodes', value: stats.noEpisodes, tab: 'noEpisodes' },
    { label: 'Missing AniList ID', value: stats.missingAnilistId, tab: 'unmatched' },
  ];

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary">
              Command Center
            </h1>
            <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
              System Overview & Metrics
            </p>
          </div>
          <div className="flex items-end gap-6">
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-text">Last Sync</div>
              <div className="text-sm font-mono text-secondary">{stats.lastSync}</div>
            </div>
            <RefreshButton />
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider">Global Databanks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-card border border-border p-6 hover:border-secondary transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 min-w-0">
                  <p className="text-xs text-muted-text font-bold uppercase tracking-widest mb-2 truncate" title={metric.label}>{metric.label}</p>
                  <p 
                    className={`text-4xl font-serif font-black truncate ${metric.color}`}
                    title={typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  >
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                </div>
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-secondary/30" />
              </div>
            ))}
          </div>
        </section>

        {/* Server Health & Scraping Summary */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1 space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider">Server Health</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-4 flex flex-col group min-w-0">
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-widest mb-1 truncate">CPU Load (1m)</span>
                  <span className="text-xl font-mono font-black text-secondary truncate">{serverMetrics.cpuUsage[0].toFixed(2)}</span>
                </div>
                <div className="bg-card border border-border p-4 flex flex-col group min-w-0">
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-widest mb-1 truncate">Free RAM</span>
                  <span className="text-xl font-mono font-black text-secondary truncate">{(serverMetrics.freeMem / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                </div>
                <div className="bg-card border border-border p-4 flex flex-col group min-w-0">
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-widest mb-1 truncate">Uptime</span>
                  <span className="text-xl font-mono font-black text-secondary truncate">{Math.floor(serverMetrics.uptime / 3600)}h {Math.floor((serverMetrics.uptime % 3600) / 60)}m</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/3 space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider">Today's Ingestion</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/5 border border-secondary/20 p-4 flex flex-col group min-w-0 hover:border-secondary/50 transition-colors">
                  <span className="text-[10px] text-secondary/80 font-bold uppercase tracking-widest mb-1 truncate">Anime Added</span>
                  <span className="text-xl font-mono font-black text-secondary truncate">+{todaysSummary.animeAdded}</span>
                </div>
                <div className="bg-secondary/5 border border-secondary/20 p-4 flex flex-col group min-w-0 hover:border-secondary/50 transition-colors">
                  <span className="text-[10px] text-secondary/80 font-bold uppercase tracking-widest mb-1 truncate">Eps Added</span>
                  <span className="text-xl font-mono font-black text-secondary truncate">+{todaysSummary.episodesAdded}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start xl:items-stretch">
          
          {/* Left Column: Anomalies & Logs */}
          <div className="space-y-12">
            {/* Warnings */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-wider text-danger">System Anomalies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {warnings.map((warning, idx) => (
                  <Link 
                    href={`/admin/operations?tab=${warning.tab}`} 
                    key={idx} 
                    className="bg-danger/5 border border-danger/20 p-6 flex justify-between items-center hover:bg-danger/10 hover:border-danger/50 transition-all cursor-pointer group min-w-0"
                  >
                    <div className="flex flex-col min-w-0 shrink">
                      <span className="text-sm font-bold text-danger uppercase tracking-widest truncate" title={warning.label}>{warning.label}</span>
                      <span className="text-[10px] uppercase text-danger/40 group-hover:text-danger/80 font-mono mt-1 transition-colors truncate">Click to resolve &rarr;</span>
                    </div>
                    <span 
                      className="text-2xl font-mono font-black text-danger truncate ml-4 shrink-0 max-w-[50%]"
                      title={warning.value.toLocaleString()}
                    >
                      {warning.value.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* System Activity Logs */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-bold uppercase tracking-wider">Terminal Logs</h2>
              </div>
              <div className="bg-black border border-border p-4 h-64 overflow-y-auto font-mono text-xs flex flex-col gap-2 rounded-sm shadow-inner text-gray-300">
                {systemLogs.length === 0 ? (
                  <span className="text-gray-500">No recent activity detected.</span>
                ) : (
                  systemLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 group items-start hover:bg-foreground/10 px-2 py-1 -mx-2 rounded transition-colors">
                      <span className="text-gray-500 shrink-0 opacity-80 group-hover:opacity-100 group-hover:text-gray-400 transition-colors">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                      <span className={`
                        ${log.type === 'error' ? 'text-danger font-bold' : ''}
                        ${log.type === 'warning' ? 'text-yellow-500' : ''}
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'info' ? 'text-gray-300 group-hover:text-white' : ''}
                      `}>
                        {log.type === 'error' ? '[ERROR] ' : log.type === 'warning' ? '[WARN] ' : ''}
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div className="mt-auto text-secondary/30 pt-4 animate-pulse">_</div>
              </div>
            </section>
          </div>

          {/* Right Column: Recent Episodes */}
          <div className="relative h-[500px] xl:h-auto">
            <div className="xl:absolute inset-0 flex flex-col">
              <section className="space-y-6 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-secondary">Recently Added Ongoing Episodes</h2>
                </div>
                
                <div className="bg-card/30 border border-border overflow-hidden flex flex-col flex-1 min-h-0">
                  <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 font-normal">Anime Title</th>
                        <th className="px-6 py-4 font-normal">Episode</th>
                        <th className="px-6 py-4 font-normal">Upload Date</th>
                        <th className="px-6 py-4 font-normal text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentEpisodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-muted-text font-mono text-xs uppercase">
                            No recent episodes found
                          </td>
                        </tr>
                      ) : (
                        recentEpisodes.map((ep) => (
                          <tr key={ep.id} className="hover:bg-card/40 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground max-w-[200px] sm:max-w-xs truncate" title={ep.anime_title}>
                              {ep.anime_title}
                            </td>
                            <td className="px-6 py-4 text-secondary font-mono">
                              Episode {ep.eps_number}
                            </td>
                            <td className="px-6 py-4 text-muted-text font-mono text-xs">
                              {ep.uploaded_at || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <a 
                                href={`/anime/${ep.anime_slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white dark:hover:text-black border border-secondary/30 transition-colors text-[10px] uppercase font-bold tracking-widest"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
