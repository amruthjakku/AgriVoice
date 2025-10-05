import { createClient } from '@supabase/supabase-js';
import { Interaction, UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseService {
  async createInteraction(data: Partial<Interaction>): Promise<Interaction> {
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return interaction;
  }

  async updateInteraction(id: string, data: Partial<Interaction>): Promise<Interaction> {
    const { data: interaction, error } = await supabase
      .from('interactions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return interaction;
  }

  async getInteractionBySessionId(sessionId: string): Promise<Interaction | null> {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getInteractions(from?: string, to?: string): Promise<Interaction[]> {
    let query = supabase
      .from('interactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (from) {
      query = query.gte('created_at', from);
    }

    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return data || [];
  }

  async getTopQueries(limit: number = 10): Promise<{ query: string; count: number }[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('intent')
      .not('intent', 'is', null);

    if (error) throw error;

    const intentCounts = (data || []).reduce((acc: Record<string, number>, item) => {
      const intent = item.intent || 'unknown';
      acc[intent] = (acc[intent] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(intentCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getLanguageDistribution(): Promise<{ language: string; count: number; percentage: number }[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('language');

    if (error) throw error;

    const total = data?.length || 1;
    const langCounts = (data || []).reduce((acc: Record<string, number>, item) => {
      const lang = item.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const langNames: Record<string, string> = {
      'hi': 'Hindi',
      'te': 'Telugu',
      'en': 'English'
    };

    return Object.entries(langCounts)
      .map(([code, count]) => ({
        language: langNames[code] || code,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getDailyInteractions(days: number = 7): Promise<{ date: string; count: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('interactions')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      dailyCounts[date.toISOString().split('T')[0]] = 0;
    }

    (data || []).forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date]++;
      }
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  }

  async getIntentDistribution(): Promise<{ intent: string; count: number }[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('intent')
      .not('intent', 'is', null);

    if (error) throw error;

    const intentCounts = (data || []).reduce((acc: Record<string, number>, item) => {
      const intent = item.intent || 'unknown';
      acc[intent] = (acc[intent] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getUserProfile(phone: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createOrUpdateUserProfile(phone: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.getUserProfile(phone);

    if (existing) {
      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('phone', phone)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from('user_profiles')
        .insert([{ phone, ...data }])
        .select()
        .single();

      if (error) throw error;
      return created;
    }
  }

  async incrementUserInteractionCount(phone: string): Promise<void> {
    const profile = await this.getUserProfile(phone);
    if (profile) {
      await supabase
        .from('user_profiles')
        .update({
          total_interactions: (profile.total_interactions || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('phone', phone);
    }
  }
}

export const supabaseService = new SupabaseService();
