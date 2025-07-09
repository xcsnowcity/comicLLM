// Export utilities for comic translation results

interface ComicText {
  sequence: number;
  type: string;
  character?: string;
  original_text: string;
  chinese_translation: string;
  explanations: Array<{
    phrase: string;
    meaning: string;
    context: string;
  }>;
}

interface ComicResult {
  page_number: number;
  reading_order: ComicText[];
}

export const exportFormats = {
  JSON: 'json',
  TXT: 'txt',
  MARKDOWN: 'markdown'
} as const;

export type ExportFormat = typeof exportFormats[keyof typeof exportFormats];

export class ComicExporter {
  private result: ComicResult;
  private filename: string;

  constructor(result: ComicResult, originalFilename: string) {
    this.result = result;
    this.filename = originalFilename;
  }

  // Export as JSON
  exportAsJSON(): string {
    return JSON.stringify(this.result, null, 2);
  }

  // Export as plain text
  exportAsText(): string {
    const lines: string[] = [];
    
    lines.push(`Comic Translation - Page ${this.result.page_number}`);
    lines.push(`Original File: ${this.filename}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('=' .repeat(50));
    lines.push('');

    this.result.reading_order.forEach((text, index) => {
      lines.push(`[${text.sequence}] ${text.type.toUpperCase()}${text.character ? ` - ${text.character}` : ''}`);
      lines.push(`Original: ${text.original_text}`);
      lines.push(`Chinese: ${text.chinese_translation}`);
      
      if (text.explanations.length > 0) {
        lines.push('Explanations:');
        text.explanations.forEach(exp => {
          lines.push(`  • "${exp.phrase}" → ${exp.meaning}`);
          lines.push(`    Context: ${exp.context}`);
        });
      }
      
      lines.push('');
    });

    return lines.join('\n');
  }

  // Export as Markdown
  exportAsMarkdown(): string {
    const lines: string[] = [];
    
    lines.push(`# Comic Translation - Page ${this.result.page_number}`);
    lines.push('');
    lines.push(`**Original File:** ${this.filename}  `);
    lines.push(`**Generated:** ${new Date().toLocaleString()}  `);
    lines.push(`**Total Elements:** ${this.result.reading_order.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    this.result.reading_order.forEach((text, index) => {
      const typeIcon = this.getTypeIcon(text.type);
      
      lines.push(`## ${typeIcon} ${text.sequence}. ${text.type.replace('_', ' ').toUpperCase()}`);
      
      if (text.character) {
        lines.push(`**Character:** ${text.character}`);
        lines.push('');
      }
      
      lines.push('### Original Text');
      lines.push(`> ${text.original_text}`);
      lines.push('');
      
      lines.push('### Chinese Translation');
      lines.push(`> ${text.chinese_translation}`);
      lines.push('');
      
      if (text.explanations.length > 0) {
        lines.push('### Explanations');
        text.explanations.forEach(exp => {
          lines.push(`- **"${exp.phrase}"** → ${exp.meaning}`);
          lines.push(`  - *Context:* ${exp.context}`);
        });
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'speech_bubble':
        return '💬';
      case 'thought_bubble':
        return '💭';
      case 'narration':
        return '📖';
      case 'sound_effect':
        return '💥';
      case 'sign_text':
        return '📋';
      default:
        return '📝';
    }
  }

  // Get the appropriate file extension
  getFileExtension(format: ExportFormat): string {
    switch (format) {
      case exportFormats.JSON:
        return 'json';
      case exportFormats.TXT:
        return 'txt';
      case exportFormats.MARKDOWN:
        return 'md';
      default:
        return 'txt';
    }
  }

  // Generate filename for export
  generateFilename(format: ExportFormat): string {
    const baseName = this.filename.replace(/\.[^/.]+$/, ''); // Remove original extension
    const extension = this.getFileExtension(format);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${baseName}_translation_${timestamp}.${extension}`;
  }

  // Export and download file
  exportAndDownload(format: ExportFormat): void {
    let content: string;
    let mimeType: string;

    switch (format) {
      case exportFormats.JSON:
        content = this.exportAsJSON();
        mimeType = 'application/json';
        break;
      case exportFormats.TXT:
        content = this.exportAsText();
        mimeType = 'text/plain';
        break;
      case exportFormats.MARKDOWN:
        content = this.exportAsMarkdown();
        mimeType = 'text/markdown';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const filename = this.generateFilename(format);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Utility function to create exporter
export const createExporter = (result: ComicResult, filename: string): ComicExporter => {
  return new ComicExporter(result, filename);
};

// Utility function for quick export
export const quickExport = (result: ComicResult, filename: string, format: ExportFormat): void => {
  const exporter = createExporter(result, filename);
  exporter.exportAndDownload(format);
};