// Lightweight client-side RAG over /docs: supports PDF when pdfjs is available, plus .txt/.md

type DocChunk = { doc: string; page: number; text: string; tokens: string[] };

class RagDocsService {
  private indexed = false;
  private chunks: DocChunk[] = [];

  async ensureIndexed(): Promise<void> {
    if (this.indexed) return;
    try {
      // Try to get an index.json with a list of PDFs
      const indexResp = await fetch('/docs/index.json');
      const pdfs: string[] = indexResp.ok ? await indexResp.json() : [];
      for (const name of pdfs) {
        const url = `/docs/${name}`;
        if (name.toLowerCase().endsWith('.pdf')) {
          await this.ingestPdf(url);
        } else if (name.toLowerCase().endsWith('.txt') || name.toLowerCase().endsWith('.md')) {
          await this.ingestTextLike(url);
        } else {
          // Try PDF by default
          await this.ingestPdf(url);
        }
      }
      this.indexed = true;
    } catch (e) {
      console.warn('RAG docs indexing failed:', e);
      this.indexed = true; // avoid repeated attempts during session
    }
  }

  private async ingestPdf(url: string): Promise<void> {
    try {
    // Import PDF.js dynamically and type minimal surface to avoid 'any'
    type PDFJS = { GlobalWorkerOptions?: { workerSrc?: string }; getDocument: (src: string) => { promise: { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items?: Array<{ str?: string }> }> }> } } };
    const pdfjs = (await import('pdfjs-dist')) as unknown as PDFJS;
      
      // Set up worker - use the local worker file
      if (pdfjs?.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      const pdf = await pdfjs.getDocument(url).promise;
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
  const content = await page.getTextContent();
  const items = Array.isArray((content as unknown as { items?: unknown }).items) ? (content as unknown as { items: Array<{ str?: string }> }).items : [];
  const text = items.map((it) => it.str || '').join(' ');
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (!normalized) continue;
        const tokens = this.tokenize(normalized);
        this.chunks.push({ doc: url, page: p, text: normalized, tokens });
      }
    } catch (e) {
      console.warn('Failed to parse PDF via pdfjs. Skipping', url, e);
    }
  }

  private async ingestTextLike(url: string): Promise<void> {
    const resp = await fetch(url);
    if (!resp.ok) return;
    const text = await resp.text();
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return;
    const tokens = this.tokenize(normalized);
    this.chunks.push({ doc: url, page: 1, text: normalized, tokens });
  }

  private tokenize(s: string): string[] {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  private score(query: string[], doc: DocChunk): number {
    let matches = 0;
    const set = new Set(doc.tokens);
    for (const t of query) if (set.has(t)) matches++;
    return matches / Math.max(1, doc.tokens.length);
  }

  async retrieveContext(question: string, k: number = 4): Promise<string> {
    await this.ensureIndexed();
    if (this.chunks.length === 0) return '';
    const qTokens = this.tokenize(question);
    const scored = this.chunks.map(c => ({ c, s: this.score(qTokens, c) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, k)
      .map(x => `Source: ${x.c.doc}#page=${x.c.page}\n${x.c.text}`);
    return scored.join('\n\n');
  }
}

export const ragDocsService = new RagDocsService();


