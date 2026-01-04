
export interface Video {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  views: string;
  published: string;
  transcription?: string;
}

export type ArticleType = 'guide' | 'comparison' | 'tutorial' | 'list' | 'news';
export type ArticleLength = 'short' | 'medium' | 'long' | 'detailed';

export interface ArticleConfig {
  type: ArticleType;
  keywords: string[];
  length: ArticleLength;
  includeFAQ: boolean;
  includeTips: boolean;
  includeRecipes: boolean;
  includeEquipment: boolean;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  seoScore: number;
  wordCount: number;
  readingTime: number;
  keywordDensity: string;
  headingCount: number;
  internalLinks: number;
  imageCount: number;
  metaTags: string;
}
