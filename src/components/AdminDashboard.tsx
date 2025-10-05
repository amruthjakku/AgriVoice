import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Globe, MessageSquare, Calendar, Download } from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { Interaction } from '../types';

export const AdminDashboard = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [topQueries, setTopQueries] = useState<{ query: string; count: number }[]>([]);
  const [languageData, setLanguageData] = useState<{ language: string; count: number; percentage: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([]);
  const [intentData, setIntentData] = useState<{ intent: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [interactionsData, queriesData, langData, dailyStats, intents] = await Promise.all([
        analyticsService.getInteractions(dateFrom, dateTo),
        analyticsService.getTopQueries(10),
        analyticsService.getLanguageDistribution(),
        analyticsService.getDailyInteractions(7),
        analyticsService.getIntentDistribution()
      ]);

      setInteractions(interactionsData);
      setTopQueries(queriesData);
      setLanguageData(langData);
      setDailyData(dailyStats);
      setIntentData(intents);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Session ID', 'Language', 'Transcript', 'Intent', 'Status'],
      ...interactions.map(i => [
        new Date(i.created_at).toLocaleString(),
        i.session_id,
        i.language,
        i.transcript,
        i.intent || '',
        i.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrivoice_interactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalInteractions = interactions.length;
  const avgResponseTime = '2.3s';
  const successRate = '94%';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AgriVoice Analytics</h1>
            <p className="text-gray-600 mt-1">Monitor voice interactions and system performance</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Total Interactions</div>
                <div className="text-3xl font-bold text-gray-800 mt-1">{totalInteractions}</div>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500" />
            </div>
            <div className="mt-4 text-sm text-green-600">+12% from last week</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Avg Response Time</div>
                <div className="text-3xl font-bold text-gray-800 mt-1">{avgResponseTime}</div>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
            <div className="mt-4 text-sm text-green-600">-0.3s improvement</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Success Rate</div>
                <div className="text-3xl font-bold text-gray-800 mt-1">{successRate}</div>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-500" />
            </div>
            <div className="mt-4 text-sm text-green-600">+2% this month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Languages</div>
                <div className="text-3xl font-bold text-gray-800 mt-1">{languageData.length}</div>
              </div>
              <Globe className="w-10 h-10 text-orange-500" />
            </div>
            <div className="mt-4 text-sm text-gray-600">Hindi, Telugu, English</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Daily Interactions (Last 7 Days)</h3>
            </div>
            <div className="space-y-2">
              {dailyData.map((item, idx) => {
                const maxCount = Math.max(...dailyData.map(d => d.count));
                const width = (item.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 w-24">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-white text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Top Queries</h3>
            </div>
            <div className="space-y-3">
              {topQueries.map((item, idx) => {
                const maxCount = Math.max(...topQueries.map(q => q.count));
                const width = (item.count / maxCount) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700 capitalize">{item.query.replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Language Distribution</h3>
            </div>
            <div className="space-y-4">
              {languageData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700">{item.language}</span>
                    <span className="text-sm font-medium text-gray-900">{item.percentage}% ({item.count})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Intent Categories</h3>
            </div>
            <div className="space-y-3">
              {intentData.map((item, idx) => {
                const maxCount = Math.max(...intentData.map(i => i.count));
                const width = (item.count / maxCount) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700 capitalize">{item.intent.replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Interactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transcript</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(interaction.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {interaction.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-md truncate">
                      {interaction.transcript}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {interaction.intent?.replace('_', ' ') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        interaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        interaction.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        interaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
