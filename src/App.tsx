import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Sparkles, 
  Target, 
  ListChecks, 
  Coins, 
  Map, 
  AlertTriangle, 
  History, 
  Plus, 
  ArrowRight,
  Loader2,
  Trash2,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';
import { refineSaaS } from './services/geminiService';
import { RefinedIdea } from './constants';

export default function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refinedResult, setRefinedResult] = useState<RefinedIdea | null>(null);
  const [history, setHistory] = useState<RefinedIdea[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('saas_refiner_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveToHistory = (idea: RefinedIdea) => {
    const newHistory = [idea, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('saas_refiner_history', JSON.stringify(newHistory));
  };

  const handleRefine = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const result = await refineSaaS(input);
      const fullIdea: RefinedIdea = {
        ...result as any,
        id: crypto.randomUUID(),
        originalIdea: input,
        timestamp: Date.now(),
      };
      setRefinedResult(fullIdea);
      saveToHistory(fullIdea);
      // Small delay to ensure render then scroll
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error(error);
      alert('Failed to refine idea. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('saas_refiner_history', JSON.stringify(newHistory));
    if (refinedResult?.id === id) setRefinedResult(null);
  };

  const selectHistoryItem = (item: RefinedIdea) => {
    setRefinedResult(item);
    setInput(item.originalIdea);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startNew = () => {
    setRefinedResult(null);
    setInput('');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans selection:bg-orange-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#f5f5f4]/80 backdrop-blur-md border-b border-[#0a0a0a]/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={startNew}>
          <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center text-white">
            <Rocket size={18} />
          </div>
          <span className="font-bold tracking-tight text-xl">SaaS Refiner</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
          >
            <History size={18} />
            <span className="hidden sm:inline">Historique ({history.length})</span>
          </button>
          
          <button 
            onClick={startNew}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Left Side: Input */}
        <section className="flex-1 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[0.9] tracking-tighter">
              Transformez vos <span className="text-orange-500 italic">idées</span> brutes en modèles SaaS solides.
            </h1>
            <p className="text-xl text-black/60 max-w-md">
              Décrivez votre concept et laissez l'IA tracer votre stratégie de marché, vos fonctionnalités et votre feuille de route.
            </p>
          </div>

          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ex: Une application qui utilise l'IA pour analyser les retours clients et suggérer des améliorations produits..."
              className="w-full h-48 bg-white border-2 border-black/10 rounded-2xl p-6 text-xl focus:border-orange-500 transition-all outline-none resize-none shadow-sm group-hover:border-black/20"
            />
            <button
              onClick={handleRefine}
              disabled={isLoading || !input.trim()}
              className="absolute bottom-4 right-4 bg-black text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-black transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              <span>{isLoading ? 'Raffinage...' : "Raffiner l'idée"}</span>
            </button>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-orange-500"
              >
                <Sparkles size={48} />
              </motion.div>
              <p className="text-black/40 font-mono text-sm uppercase tracking-widest animate-pulse">
                Analyse du marché...
              </p>
            </div>
          )}
        </section>

        {/* Right Side: Results */}
        <section className="flex-1">
          <AnimatePresence mode="wait">
            {refinedResult ? (
              <motion.div
                key={refinedResult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
                ref={scrollRef}
              >
                {/* Refined Pitch Card */}
                <div className="bg-white border-2 border-black p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Rocket size={120} className="-rotate-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-orange-500">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Pitch Raffiné</span>
                  </div>
                  <h2 className="text-3xl font-medium leading-tight">
                    {refinedResult.refinedPitch}
                  </h2>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Target Audience */}
                  <div className="bg-black text-white p-8 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3">
                      <Target className="text-orange-400" />
                      <h3 className="text-xl font-bold uppercase tracking-tight">Public Cible</h3>
                    </div>
                    <ul className="space-y-4">
                      {refinedResult.targetAudience.map((audience, idx) => (
                        <li key={idx} className="flex items-start gap-3 border-l-2 border-orange-500/30 pl-4 py-1">
                          <span className="text-lg opacity-90">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Features */}
                  <div className="bg-[#e4e3e0] border-2 border-black/5 p-8 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3">
                      <ListChecks className="text-black" />
                      <h3 className="text-xl font-bold uppercase tracking-tight text-black">Fonctionnalités Clés</h3>
                    </div>
                    <div className="grid gap-4">
                      {refinedResult.keyFeatures.map((feature, idx) => (
                        <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-black/5">
                          <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                          <p className="text-sm opacity-70 leading-relaxed">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monetization & Strategy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-orange-500 p-8 rounded-[32px] text-white">
                      <div className="flex items-center gap-3 mb-6">
                        <Coins />
                        <h3 className="font-bold uppercase tracking-tight">Revenus</h3>
                      </div>
                      <ul className="space-y-3">
                        {refinedResult.monetization.map((m, idx) => (
                          <li key={idx} className="text-sm font-medium flex items-center gap-2">
                             <ArrowRight size={14} className="flex-shrink-0" />
                             {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border-2 border-black p-8 rounded-[32px]">
                      <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-red-500" />
                        <h3 className="font-bold uppercase tracking-tight">Défis</h3>
                      </div>
                      <ul className="space-y-3">
                        {refinedResult.challenges.map((c, idx) => (
                          <li key={idx} className="text-sm opacity-70 italic leading-snug">
                            / {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Roadmap */}
                  <div className="bg-white border-2 border-black/5 p-8 rounded-[32px] relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <Map className="text-orange-500" />
                      <h3 className="text-xl font-bold uppercase tracking-tight">Feuille de Route</h3>
                    </div>
                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-100">
                      {refinedResult.roadmap.map((step, idx) => (
                        <div key={idx} className="relative pl-10">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-500 border-4 border-white shadow-sm z-10" />
                          <p className="text-sm font-medium">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-black/5 border-dashed rounded-[48px] opacity-40">
                <LayoutDashboard size={64} strokeWidth={1} className="mb-4" />
                <p className="text-2xl font-medium">La stratégie apparaîtra ici</p>
                <p className="text-sm">Commencez par décrire votre idée à gauche</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* History Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-tight">Historique</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <Plus className="rotate-45" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-black/30 space-y-2">
                    <History size={48} strokeWidth={1} />
                    <p>Aucun historique pour le moment</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:bg-black/5 ${
                        refinedResult?.id === item.id ? 'border-orange-500 bg-orange-50' : 'border-black/5 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={(e) => deleteFromHistory(item.id, e)}
                          className="opacity-0 group-hover:opacity-40 hover:text-red-500 hover:opacity-100 transition-all p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold line-clamp-2 leading-tight">
                        {item.originalIdea}
                      </p>
                      <p className="text-[11px] opacity-50 mt-1 line-clamp-1 italic">
                        {item.refinedPitch}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-black/5">
                <button 
                  onClick={startNew}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors"
                >
                  <Plus size={20} />
                  <span>Nouvelle Analyse</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
