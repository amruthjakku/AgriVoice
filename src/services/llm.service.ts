const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const USE_REAL_APIS = import.meta.env.VITE_USE_REAL_APIS === 'true';

interface LLMResponse {
  answer: string;
  intent?: string;
  tags: string[];
}

class LLMService {
  private mockAnswers: Record<string, string> = {
    'hi': 'आपकी फसल में कीट की समस्या है। पहले, कीट का प्रकार पहचानें। नीम के तेल का छिड़काव करें (10 मिली प्रति लीटर पानी)। यदि समस्या बनी रहे, तो स्थानीय कृषि अधिकारी से संपर्क करें। फसल की नियमित निगरानी रखें।',
    'te': 'మీ పంటలో చీడల సమస్య ఉంది. మొదట, చీడ రకాన్ని గుర్తించండి. వేప నూనె స్ప్రే చేయండి (లీటరుకు 10 మిల్లీ). సమస్య కొనసాగితే, స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి. పంటను క్రమం తప్పకుండా పర్యవేక్షించండి.',
    'en': 'Your crops have a pest problem. First, identify the type of pest. Spray neem oil (10ml per liter of water). If the problem persists, contact your local agriculture officer. Monitor your crops regularly.',
  };

  private systemPrompt = `You are AgriVoice, an expert agricultural advisor helping farmers in India.

Your role:
- Provide practical, actionable farming advice
- Focus on pest management, crop care, irrigation, fertilizers, weather, and market prices
- Give answers in 3-5 short, clear steps
- Use simple language appropriate for farmers
- Consider local Indian farming practices and conditions
- When uncertain, recommend contacting local agricultural extension officers

Response format:
- Keep answers concise and practical
- Prioritize safety and sustainable farming practices
- Mention specific quantities and timings when relevant
- Consider seasonal factors

Always respond in the same language as the user's question.`;

  async generateAnswer(transcript: string, language: string): Promise<LLMResponse> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        answer: this.mockAnswers[language] || this.mockAnswers['en'],
        intent: this.detectIntent(transcript),
        tags: this.extractTags(transcript)
      };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AgriVoice'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: transcript }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'LLM request failed');
      }

      const result = await response.json();
      const answer = result.choices[0]?.message?.content || 'Unable to generate response';

      return {
        answer,
        intent: this.detectIntent(transcript),
        tags: this.extractTags(transcript)
      };
    } catch (error) {
      console.error('LLM Error:', error);
      throw new Error('Failed to generate answer. Please check your API key and try again.');
    }
  }

  private detectIntent(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('कीट') || lowerText.includes('pest') || lowerText.includes('చీడ') ||
        lowerText.includes('insect') || lowerText.includes('bug')) {
      return 'pest_management';
    }

    if (lowerText.includes('पानी') || lowerText.includes('water') || lowerText.includes('నీరు') ||
        lowerText.includes('irrigation') || lowerText.includes('सिंचाई')) {
      return 'irrigation';
    }

    if (lowerText.includes('खाद') || lowerText.includes('fertilizer') || lowerText.includes('ఎరువు') ||
        lowerText.includes('उर्वरक') || lowerText.includes('खत')) {
      return 'fertilizer';
    }

    if (lowerText.includes('मौसम') || lowerText.includes('weather') || lowerText.includes('వాతావరణం') ||
        lowerText.includes('बारिश') || lowerText.includes('rain')) {
      return 'weather';
    }

    if (lowerText.includes('कीमत') || lowerText.includes('price') || lowerText.includes('ధర') ||
        lowerText.includes('market') || lowerText.includes('बाजार')) {
      return 'market_price';
    }

    if (lowerText.includes('रोग') || lowerText.includes('disease') || lowerText.includes('వ్యాధి') ||
        lowerText.includes('बीमारी')) {
      return 'disease_diagnosis';
    }

    return 'general_advisory';
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    const cropKeywords = {
      'wheat': ['wheat', 'गेहूं', 'గోధుమ'],
      'rice': ['rice', 'धान', 'వరి'],
      'maize': ['maize', 'corn', 'मक्का', 'మొక్కజొన్న'],
      'cotton': ['cotton', 'कपास', 'పత్తి'],
      'tomato': ['tomato', 'टमाटर', 'టమోటా'],
      'potato': ['potato', 'आलू', 'బంగాళదుంప']
    };

    const issueKeywords = {
      'pest': ['pest', 'कीट', 'చీడ', 'insect'],
      'disease': ['disease', 'रोग', 'వ్యాధి'],
      'irrigation': ['water', 'पानी', 'నీరు', 'irrigation'],
      'fertilizer': ['fertilizer', 'खाद', 'ఎరువు'],
      'weather': ['weather', 'मौसम', 'వాతావరణం']
    };

    for (const [tag, keywords] of Object.entries(cropKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        tags.push(tag);
      }
    }

    for (const [tag, keywords] of Object.entries(issueKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags;
  }
}

export const llmService = new LLMService();
