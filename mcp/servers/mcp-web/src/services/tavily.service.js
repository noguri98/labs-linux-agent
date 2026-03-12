import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export class TavilyService {
  constructor() {
    this.apiKey = null;
    this.configPath = '/app/config/tavily.json';
  }

  async _loadApiKey() {
    if (this.apiKey) return;
    try {
      const config = JSON.parse(await fs.readFile(this.configPath, 'utf8'));
      this.apiKey = config.token;
    } catch (error) {
      console.error(`Error loading Tavily API key: ${error.message}`);
      throw new Error("Tavily API key not found in config.");
    }
  }

  async search(args = {}) {
    try {
      await this._loadApiKey();
      const { query, search_depth = "basic", include_answer = true, max_results = 5 } = args;

      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.apiKey,
        query,
        search_depth,
        include_answer,
        max_results
      });

      const { answer, results } = response.data;

      let outputText = "";
      if (answer) {
        outputText += `Direct Answer: ${answer}\n\n`;
      }

      if (results && results.length > 0) {
        outputText += "Search Results:\n";
        results.forEach((res, index) => {
          outputText += `${index + 1}. [${res.title}](${res.url})\n   ${res.content}\n\n`;
        });
      } else if (!answer) {
        outputText = "No results found.";
      }

      return {
        content: [{ type: 'text', text: outputText }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error searching web: ${error.response?.data?.detail || error.message}` }],
        isError: true
      };
    }
  }
}
