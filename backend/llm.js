const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LLMService {
  constructor() {
    this.openrouterKey = process.env.OPENROUTER_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.defaultProvider = process.env.DEFAULT_PROVIDER || 'openrouter';
    this.defaultModel = process.env.DEFAULT_MODEL || 'openai/gpt-4-vision-preview';
  }

  async processComic(imagePath, options = {}) {
    const { provider = this.defaultProvider, model = this.defaultModel, apiKey } = options;
    
    try {
      // Read image file and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);
      
      const prompt = this.getComicAnalysisPrompt();
      
      let response;
      
      switch (provider) {
        case 'openrouter':
          response = await this.callOpenRouter(prompt, base64Image, mimeType, model, apiKey);
          break;
        case 'openai':
          response = await this.callOpenAI(prompt, base64Image, mimeType, model, apiKey);
          break;
        case 'anthropic':
          response = await this.callAnthropic(prompt, base64Image, mimeType, model, apiKey);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      return this.parseResponse(response);
    } catch (error) {
      console.error('LLM processing error:', error);
      throw error;
    }
  }

  getComicAnalysisPrompt() {
    return `You are a comic translation assistant. Analyze this comic page and extract ALL text in proper reading order.

For each text element, provide:
1. Reading sequence number (1, 2, 3, etc.)
2. Text type (speech_bubble, thought_bubble, narration, sound_effect, sign_text)
3. Character name (if speech/thought bubble, use "Unknown" if unclear)
4. Original English text (exact transcription)
5. Chinese translation (natural, contextual translation)
6. Brief explanations for difficult words/phrases (if any)

Output as JSON format with this structure:
{
  "page_number": 1,
  "reading_order": [
    {
      "sequence": 1,
      "type": "speech_bubble",
      "character": "Character Name",
      "original_text": "Original English text",
      "chinese_translation": "Chinese translation",
      "explanations": [
        {
          "phrase": "difficult phrase",
          "meaning": "Chinese meaning",
          "context": "contextual explanation"
        }
      ]
    }
  ]
}

Consider:
- Western comics: left-to-right, top-to-bottom reading
- Panel flow and speech bubble positioning
- Cultural context for translation
- Idiomatic expressions and slang
- Visual context clues for meaning

Be thorough - don't miss any text including small sound effects or background signs. If no text is found, return an empty reading_order array.`;
  }

  async callOpenRouter(prompt, base64Image, mimeType, model, apiKey) {
    const key = apiKey || this.openrouterKey;
    if (!key) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url', 
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  async callOpenAI(prompt, base64Image, mimeType, model, apiKey) {
    const key = apiKey || this.openaiKey;
    if (!key) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url', 
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  async callAnthropic(prompt, base64Image, mimeType, model, apiKey) {
    const key = apiKey || this.anthropicKey;
    if (!key) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    }, {
      headers: {
        'x-api-key': key,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    return response.data.content[0].text;
  }

  async testConnection(provider, model, apiKey) {
    try {
      const testPrompt = "Hello! Please respond with a simple JSON object containing a 'status' field set to 'success'.";
      
      let response;
      
      switch (provider) {
        case 'openrouter':
          response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          break;
          
        case 'openai':
          response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: model,
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 50
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          break;
          
        case 'anthropic':
          response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: model,
            max_tokens: 50,
            messages: [{ role: 'user', content: testPrompt }]
          }, {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01'
            }
          });
          break;
          
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      return {
        success: true,
        provider,
        model,
        status: response.status
      };
    } catch (error) {
      throw new Error(`API test failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  parseResponse(response) {
    try {
      const parsed = JSON.parse(response);
      
      // Validate response structure
      if (!parsed.reading_order || !Array.isArray(parsed.reading_order)) {
        throw new Error('Invalid response format: missing or invalid reading_order');
      }
      
      // Ensure page_number exists
      if (!parsed.page_number) {
        parsed.page_number = 1;
      }
      
      // Validate each reading order item
      parsed.reading_order.forEach((item, index) => {
        if (!item.sequence || !item.type || !item.original_text) {
          throw new Error(`Invalid reading order item at index ${index}`);
        }
        
        // Ensure explanations is an array
        if (!item.explanations) {
          item.explanations = [];
        }
      });
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      throw new Error('Failed to parse LLM response');
    }
  }
}

module.exports = LLMService;