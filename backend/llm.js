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
5. Chinese translation (natural, contextual translation - pay careful attention to word context and meaning)
6. Brief explanations for difficult words/phrases AND any potentially ambiguous terms

TRANSLATION GUIDELINES:
- Read the ENTIRE dialogue context before translating individual phrases
- Pay attention to character relationships, tone, and speaking style
- For ambiguous words, choose meaning that fits the visual and narrative context
- Consider the comic's genre and setting when choosing vocabulary
- When a word has multiple meanings, use surrounding context to determine the correct one
- Preserve character voice and speech patterns in Chinese
- Ensure translations sound natural and fluent in Chinese

IMPORTANT: Return ONLY valid JSON. Do not include any text before or after the JSON. Ensure all strings are properly escaped.

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
      max_tokens: 8000,
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
      max_tokens: 8000,
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
      // Clean the response by extracting JSON from potential markdown code blocks or extra text
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON content between braces
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      // Check if JSON appears to be truncated and try to complete it
      if (cleanResponse && !cleanResponse.trim().endsWith('}')) {
        console.warn('JSON appears truncated, attempting to complete...');
        
        // Count open braces and brackets to determine what's missing
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escaped = false;
        
        for (let i = 0; i < cleanResponse.length; i++) {
          const char = cleanResponse[i];
          
          if (escaped) {
            escaped = false;
            continue;
          }
          
          if (char === '\\') {
            escaped = true;
            continue;
          }
          
          if (char === '"' && !escaped) {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
          }
        }
        
        // Close any unclosed strings, arrays, and objects
        if (inString) {
          cleanResponse += '"';
        }
        
        // Close unclosed arrays
        for (let i = 0; i < openBrackets; i++) {
          cleanResponse += ']';
        }
        
        // Close unclosed objects
        for (let i = 0; i < openBraces; i++) {
          cleanResponse += '}';
        }
        
        console.log('Completed JSON structure');
      }
      
      // Fix common JSON issues
      cleanResponse = cleanResponse
        .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']')  // Remove trailing commas before closing brackets
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"');  // Convert single quotes to double quotes
      
      // Try to use JSON5 or relaxed parsing for better handling
      try {
        // First attempt: parse as-is
        const parsed = JSON.parse(cleanResponse);
        return this.validateAndProcessResponse(parsed);
      } catch (firstError) {
        // Second attempt: fix common issues
        console.log('First JSON parse failed, trying to fix common issues...');
        
        // More careful string fixing - only fix obvious issues
        let fixedResponse = cleanResponse;
        
        // Fix unescaped newlines within string values (not affecting structure)
        fixedResponse = fixedResponse.replace(/": "([^"]*)\n([^"]*)"(?=\s*[,\]}])/g, '": "$1\\n$2"');
        
        // Fix unescaped quotes within string values
        fixedResponse = fixedResponse.replace(/": "([^"]*)"([^"]*)"([^"]*)"(?=\s*[,\]}])/g, '": "$1\\"$2\\"$3"');
        
        try {
          const parsed = JSON.parse(fixedResponse);
          return this.validateAndProcessResponse(parsed);
        } catch (secondError) {
          console.error('Both JSON parse attempts failed');
          throw firstError;
        }
      }
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      console.error('Raw response (first 2000 chars):', response.substring(0, 2000));
      console.error('Raw response length:', response.length);
      throw new Error('Failed to parse LLM response');
    }
  }
  
  validateAndProcessResponse(parsed) {
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
  }
}

module.exports = LLMService;