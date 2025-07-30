export type Market_News_Item = {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  url: string;
  category: 'earnings';
  sentiment: 'positive' | 'neutral' | 'negative';
  relatedSymbols: string[];
};