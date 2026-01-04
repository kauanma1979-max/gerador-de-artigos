
import React, { useState, useEffect, useRef } from 'react';
import { Search, Flame, FileText, Settings, Copy, Plus, Loader2, CheckCircle2, Trophy, Clock, BarChart3, Hash, ChevronRight, ArrowRight, RotateCcw } from 'lucide-react';
import { Video, ArticleConfig, GeneratedArticle, ArticleType, ArticleLength } from './types';
import { searchVideosAI, generateTranscriptionAI, generateArticleAI } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('como fazer espetinho de carne');
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Refs para scroll automático
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<ArticleConfig>({
    type: 'guide',
    keywords: ['espetinho de carne', 'como fazer espetinho', 'churrasco caseiro'],
    length: 'medium',
    includeFAQ: true,
    includeTips: true,
    includeRecipes: true,
    includeEquipment: false
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchVideosAI(searchQuery);
      setVideos(results);
      // Mantém no passo 1 até selecionar um vídeo
      setCurrentStep(1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVideo = async (video: Video) => {
    setSelectedVideo(video);
    setIsTranscribing(true);
    // Avança para o passo 2 visualmente enquanto carrega
    setCurrentStep(2);
    
    try {
      const transcription = await generateTranscriptionAI(video);
      setSelectedVideo(prev => prev ? { ...prev, transcription } : null);
      
      // Scroll suave para o passo 2
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error(error);
      setCurrentStep(1); // Volta se der erro
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!selectedVideo || !selectedVideo.transcription) return;
    setIsGenerating(true);
    // Avança para o passo 3 visualmente
    setCurrentStep(3);

    try {
      const generated = await generateArticleAI(selectedVideo, config);
      setArticle(generated);
      
      // Scroll suave para o resultado
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar artigo.");
      setCurrentStep(2); // Volta se der erro
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (article) {
      const text = article.content.replace(/<[^>]*>/g, '');
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const reset = () => {
    setCurrentStep(1);
    setSelectedVideo(null);
    setArticle(null);
    setVideos([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const steps = [
    { id: 1, label: 'Busca', icon: Search },
    { id: 2, label: 'Configuração', icon: Settings },
    { id: 3, label: 'Publicação', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0]">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 text-primary font-bold text-2xl cursor-pointer" onClick={reset}>
              <Flame className="w-8 h-8 fill-primary" />
              <span className="hidden sm:inline">BARÃO DO <span className="text-secondary">ESPETINHO</span></span>
            </div>
            
            {/* Nav Steps - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {steps.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${currentStep === s.id ? 'bg-primary text-white scale-105 shadow-md' : 'text-gray-400 font-medium'}`}>
                    <s.icon className="w-4 h-4" />
                    <span className="text-sm">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                </React.Fragment>
              ))}
            </div>

            <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500" title="Reiniciar">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-dark-custom text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <h1 className="text-3xl md:text-5xl font-black mb-4 relative z-10">MÁQUINA DE ARTIGOS SEO</h1>
        <p className="text-secondary font-bold tracking-[0.2em] text-sm relative z-10 uppercase">Do YouTube para o topo do Google</p>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full space-y-12">
        
        {/* PASSO 1: BUSCA */}
        <section className={`transition-all duration-500 ${currentStep !== 1 ? 'opacity-40 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg">1</div>
            <h2 className="text-2xl font-bold">Escolha sua Fonte de Inspiração</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-medium text-lg"
                  placeholder="O que vamos churrasquear hoje?"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary hover:bg-[#6b0000] text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="animate-spin w-5 h-5" /> : "BUSCAR VÍDEOS"}
              </button>
            </div>

            {videos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {videos.map((v) => (
                  <div 
                    key={v.id}
                    onClick={() => handleSelectVideo(v)}
                    className={`group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all hover:shadow-2xl ${selectedVideo?.id === v.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-100 bg-white hover:border-secondary'}`}
                  >
                    <div className="aspect-video relative">
                      <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={v.title} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">{v.duration}</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors h-12 leading-tight">{v.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                        <span>{v.channel}</span>
                        <span className="flex items-center gap-1 text-secondary"><BarChart3 className="w-3 h-3" /> {v.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PASSO 2: CONFIGURAÇÃO (Só aparece se houver vídeo selecionado) */}
        <section 
          ref={step2Ref}
          className={`transition-all duration-700 transform ${currentStep < 2 ? 'opacity-0 translate-y-20 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative'} ${currentStep > 2 ? 'opacity-40 scale-[0.98] pointer-events-none' : ''}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary text-dark-custom flex items-center justify-center font-bold text-xl shadow-lg">2</div>
            <h2 className="text-2xl font-bold">Prepare o Tempero (Configurações)</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {isTranscribing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <FileText className="w-6 h-6 text-secondary absolute inset-0 m-auto" />
                </div>
                <p className="mt-6 font-black text-xl text-gray-800">DEGUSTANDO O CONTEÚDO...</p>
                <p className="text-gray-500">Transformando áudio em conhecimento para seu artigo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="bg-dark-custom rounded-2xl p-6 text-white relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 p-2 opacity-20"><Flame className="w-20 h-20" /></div>
                    <h3 className="font-bold text-secondary mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Vídeo Selecionado
                    </h3>
                    <p className="font-bold text-lg leading-tight">{selectedVideo?.title}</p>
                    <p className="text-xs text-gray-400 mt-2 italic">Transcrição pronta com sucesso!</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Estilo do Artigo</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['guide', 'tutorial', 'list', 'comparison'] as ArticleType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setConfig({...config, type})}
                          className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${config.type === type ? 'border-primary bg-primary/5 text-primary shadow-md' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                          {type === 'guide' && 'Guia Master'}
                          {type === 'tutorial' && 'Passo a Passo'}
                          {type === 'list' && 'Lista / Top 10'}
                          {type === 'comparison' && 'Comparativo'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Palavras-chave SEO</label>
                    <input 
                      type="text" 
                      value={config.keywords.join(', ')}
                      onChange={(e) => setConfig({...config, keywords: e.target.value.split(',').map(k => k.trim())})}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl outline-none font-bold"
                      placeholder="Ex: churrasco, picanha, dicas..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-secondary/10 border-2 border-secondary/20 rounded-2xl p-6">
                    <h4 className="font-bold text-secondary flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5" /> Adicionais do Chef
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'includeFAQ', label: 'FAQ (Dúvidas)' },
                        { key: 'includeTips', label: 'Box de Dicas' },
                        { key: 'includeRecipes', label: 'Receita Completa' },
                        { key: 'includeEquipment', label: 'Equipamentos' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-secondary transition-colors group">
                          <input 
                            type="checkbox" 
                            checked={(config as any)[item.key]} 
                            onChange={(e) => setConfig({...config, [item.key]: e.target.checked})}
                            className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                          />
                          <span className="text-sm font-bold text-gray-600 group-hover:text-dark-custom">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateArticle}
                    disabled={isGenerating}
                    className="w-full bg-secondary hover:bg-[#c69552] text-dark-custom py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 group"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-6 h-6" /> : <><Flame className="w-6 h-6 group-hover:animate-bounce" /> COLOCAR NA BRASA (GERAR)</>}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tempo estimado: 30-45 segundos</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PASSO 3: RESULTADO */}
        <section 
          ref={step3Ref}
          className={`transition-all duration-700 transform ${currentStep < 3 ? 'opacity-0 translate-y-20 pointer-events-none absolute' : 'opacity-100 translate-y-0 relative'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-dark-custom text-secondary flex items-center justify-center font-bold text-xl shadow-lg">3</div>
              <h2 className="text-2xl font-bold">Artigo Pronto para Servir!</h2>
            </div>
            {article && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${copySuccess ? 'bg-green-500 text-white' : 'bg-white text-primary border border-primary hover:bg-primary/5'}`}
                >
                  {copySuccess ? <><CheckCircle2 className="w-4 h-4" /> COPIADO</> : <><Copy className="w-4 h-4" /> COPIAR TUDO</>}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 relative mb-8">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Flame className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-dark-custom">O BARÃO ESTÁ REDIGINDO...</h3>
                <p className="text-gray-500 max-w-sm px-4">Estruturando H1, H2, otimizando densidade de palavras-chave e criando conteúdo de alto valor.</p>
              </div>
            ) : article && (
              <div className="flex flex-col xl:flex-row">
                {/* Lateral SEO */}
                <aside className="xl:w-80 bg-gray-50 p-8 border-b xl:border-b-0 xl:border-r border-gray-100">
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * article.seoScore) / 100} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-dark-custom leading-none">{article.seoScore}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SEO SCORE</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: Clock, label: 'Leitura', value: `${article.readingTime} min` },
                      { icon: FileText, label: 'Palavras', value: article.wordCount },
                      { icon: Hash, label: 'Heading Tags', value: article.headingCount },
                      { icon: BarChart3, label: 'Densidade', value: article.keywordDensity },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400">
                          <stat.icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <span className="text-sm font-black text-dark-custom">{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10">
                    <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-xl font-bold text-sm transition-all">
                      <Plus className="w-4 h-4" /> CRIAR NOVO ARTIGO
                    </button>
                  </div>
                </aside>

                {/* Conteúdo do Artigo */}
                <article className="flex-grow p-8 md:p-12 bg-white max-h-[800px] overflow-y-auto custom-scrollbar">
                  <header className="mb-10 pb-6 border-b-2 border-gray-50">
                    <h2 className="text-3xl md:text-4xl font-black text-dark-custom mb-6 leading-tight">{article.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {config.keywords.map(kw => (
                        <span key={kw} className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"># {kw}</span>
                      ))}
                    </div>
                  </header>

                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-dark-custom" 
                    dangerouslySetInnerHTML={{ __html: article.content }} 
                  />

                  <div className="mt-12 p-6 bg-dark-custom rounded-2xl border-l-4 border-secondary">
                    <h4 className="text-secondary font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Meta Tags SEO (Head Section)
                    </h4>
                    <pre className="text-gray-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {article.metaTags}
                    </pre>
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl grayscale opacity-50">
            <Flame className="w-6 h-6 fill-primary" />
            <span>BARÃO DO ESPETINHO</span>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">© 2024 Churrasco IA - Inteligência Artificial para Content Marketing</p>
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-primary transition-colors"><ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9f9f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e2e2; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4a76a; }
      `}</style>
    </div>
  );
};

export default App;
