import React, { useState } from 'react';
import { generateImpactVideo, checkApiKeySelection, promptApiKeySelection } from '../services/geminiService';
import { BrandedText } from '../utils';
import { Video, Sparkles, Loader2, Play, AlertCircle } from 'lucide-react';

const VideoCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError(null);
    setLoading(true);
    setVideoUrl(null);

    try {
      const hasKey = await checkApiKeySelection();
      if (!hasKey) {
        await promptApiKeySelection();
        // Wait a moment for state update or rely on retry
      }

      const url = await generateImpactVideo(prompt);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
          // Handle Key race condition or invalid key
          try {
             await promptApiKeySelection();
             setError("Por favor, selecione sua chave API novamente e tente de novo.");
          } catch(e) {
             setError("Erro na seleção de chave API.");
          }
      } else {
          setError("Falha ao gerar o vídeo. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-block p-3 bg-yellow-50 rounded-2xl mb-4">
          <Video className="w-8 h-8 text-brand-yellow-dark text-yellow-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Crie Histórias de Impacto
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Use a inteligência artificial para criar vídeos curtos que inspiram. Descreva a história da sua ONG ou causa e deixe a magia acontecer.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <form onSubmit={handleGenerate} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
             <label className="block text-sm font-bold text-gray-700 mb-2">
                Descreva o vídeo
             </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Um vídeo cinematográfico mostrando voluntários plantando árvores em um parque urbano num dia ensolarado, estilo inspirador."
              className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all resize-none mb-4"
            />
            
            {error && (
               <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-sm">
                  <AlertCircle size={16} />
                  {error}
               </div>
            )}

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 hover:shadow-brand-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Gerando Mágica...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-brand-yellow" />
                  Gerar Vídeo <BrandedText text="+" className="text-white ml-1" />
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Powered by Google Veo. A geração pode levar alguns minutos.
            </p>
          </form>

          <div className="bg-blue-50 p-6 rounded-3xl">
             <h4 className="font-bold text-brand-blue mb-2">Dicas de Prompt</h4>
             <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Seja específico sobre o cenário (luz, ambiente).</li>
                <li>Descreva a ação dos personagens.</li>
                <li>Mencione o estilo visual (cinematográfico, desenho, realista).</li>
             </ul>
          </div>
        </div>

        <div className="bg-gray-900 rounded-3xl aspect-[16/9] md:aspect-[9/16] lg:aspect-video flex items-center justify-center overflow-hidden shadow-2xl relative group">
          {loading ? (
            <div className="text-center p-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                 <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-brand-blue rounded-full border-t-transparent animate-spin"></div>
                 <Video className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
              </div>
              <p className="text-white font-medium animate-pulse">Criando sua história...</p>
              <p className="text-gray-400 text-sm mt-2">Isso leva cerca de 1-2 minutos.</p>
            </div>
          ) : videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full object-contain bg-black"
              autoPlay
              loop
              playsInline
              preload="auto"
            />
          ) : (
            <div className="text-center p-8 opacity-50">
               <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
               </div>
               <p className="text-gray-400">Seu vídeo aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCreator;