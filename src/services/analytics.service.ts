import { Interaction } from '../types';
import { supabaseService } from './supabase.service';

const USE_REAL_APIS = import.meta.env.VITE_USE_REAL_APIS === 'true';

class AnalyticsService {
  private mockInteractions: Interaction[] = [
    {
      id: '1',
      session_id: 'sess_001',
      user_phone: '+919876543210',
      transcript: 'मेरी फसल में कीट लग गए हैं',
      language: 'hi',
      answer_text: 'नीम के तेल का छिड़काव करें',
      intent: 'pest_management',
      tags: ['pest', 'crop_protection'],
      status: 'completed',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: '2',
      session_id: 'sess_002',
      user_phone: '+919876543211',
      transcript: 'How much water for wheat?',
      language: 'en',
      answer_text: 'Water wheat every 10-12 days in normal conditions',
      intent: 'irrigation',
      tags: ['irrigation', 'wheat'],
      status: 'completed',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: '3',
      session_id: 'sess_003',
      user_phone: '+919876543212',
      transcript: 'ధాన్యపు సారం ఎప్పుడు వేయాలి?',
      language: 'te',
      answer_text: 'విత్తన తర్వాత 30 రోజుల్లో మొదటి డోస్',
      intent: 'fertilizer',
      tags: ['fertilizer', 'rice'],
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: '4',
      session_id: 'sess_004',
      user_phone: '+919876543213',
      transcript: 'मौसम की जानकारी चाहिए',
      language: 'hi',
      answer_text: 'अगले 3 दिन बारिश की संभावना है',
      intent: 'weather',
      tags: ['weather'],
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: '5',
      session_id: 'sess_005',
      user_phone: '+919876543214',
      transcript: 'What is the market price for tomatoes?',
      language: 'en',
      answer_text: 'Current market price is ₹25-30 per kg',
      intent: 'market_price',
      tags: ['market', 'tomato'],
      status: 'completed',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  async getInteractions(from?: string, to?: string): Promise<Interaction[]> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...this.mockInteractions];

      if (from) {
        const fromDate = new Date(from);
        filtered = filtered.filter(i => new Date(i.created_at) >= fromDate);
      }

      if (to) {
        const toDate = new Date(to);
        filtered = filtered.filter(i => new Date(i.created_at) <= toDate);
      }

      return filtered.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return supabaseService.getInteractions(from, to);
  }

  async getTopQueries(limit: number = 10): Promise<{ query: string; count: number }[]> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        { query: 'pest management', count: 45 },
        { query: 'irrigation scheduling', count: 38 },
        { query: 'fertilizer application', count: 32 },
        { query: 'weather forecast', count: 28 },
        { query: 'market prices', count: 25 },
        { query: 'crop diseases', count: 22 },
        { query: 'seed selection', count: 18 },
        { query: 'soil testing', count: 15 },
        { query: 'subsidy schemes', count: 12 },
        { query: 'harvest timing', count: 10 }
      ].slice(0, limit);
    }

    return supabaseService.getTopQueries(limit);
  }

  async getLanguageDistribution(): Promise<{ language: string; count: number; percentage: number }[]> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        { language: 'Hindi', count: 120, percentage: 48 },
        { language: 'Telugu', count: 80, percentage: 32 },
        { language: 'English', count: 50, percentage: 20 }
      ];
    }

    return supabaseService.getLanguageDistribution();
  }

  async getDailyInteractions(days: number = 7): Promise<{ date: string; count: number }[]> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - 86400000 * i);
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 30) + 20
        });
      }
      return data;
    }

    return supabaseService.getDailyInteractions(days);
  }

  async getIntentDistribution(): Promise<{ intent: string; count: number }[]> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        { intent: 'pest_management', count: 45 },
        { intent: 'irrigation', count: 38 },
        { intent: 'fertilizer', count: 32 },
        { intent: 'weather', count: 28 },
        { intent: 'market_price', count: 25 },
        { intent: 'disease_diagnosis', count: 22 }
      ];
    }

    return supabaseService.getIntentDistribution();
  }
}

export const analyticsService = new AnalyticsService();
