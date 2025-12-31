import React, { useState, useEffect } from 'react';
import { searchNGOs } from '../services/geminiService';
import { SearchResult } from '../types';
import { BrandedText } from '../utils';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';

const NGOSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    // Attempt to get location on mount if possible, or wait for user interaction
  }, []);

  const handleGetLocation = () => {
    setLocationStatus('requesting');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationStatus('granted');
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await searchNGOs(query, location);
      setResult(data);
    } catch (err) {
      console.error(err);
      // Mock result for demo if API fails/key invalid in dev
      // In prod, show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-4">
          <MapPin className="w-8 h-8 text-brand-blue" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Encontre onde doar <BrandedText text="mais" /> amor
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Utilize nossa busca inteligente integrada ao Google Maps para encontrar organizações que precisam da sua ajuda agora mesmo.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Abrigo de animais, Doação de roupas, Voluntariado..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-lg shadow-sm"
          />
          <Search className="absolute left-4 text-gray-400 w-6 h-6" />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 bg-brand-blue text-white p-2.5 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
        
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={handleGetLocation}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              locationStatus === 'granted' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Navigation className={`w-4 h-4 ${locationStatus === 'requesting' ? 'animate-spin' : ''}`} />
            {locationStatus === 'granted' ? 'Localização Ativada' : 'Usar minha localização'}
          </button>
        </div>
      </form>

      {result && (
        <div className="animate-fade-in-up space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-xl mb-4 text-brand-blue">Resumo</h3>
            <div className="prose text-gray-700 leading-relaxed">
              <p>{result.text}</p>
            </div>
          </div>

          {result.chunks && result.chunks.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {result.chunks.map((chunk, idx) => {
                const mapData = chunk.maps;
                if (!mapData) return null;

                return (
                  <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-50 flex flex-col">
                    <div className="h-32 bg-gray-200 relative">
                       {/* Placeholder for map image or street view if available, using pattern for now */}
                       <div className="absolute inset-0 bg-brand-blue/10 flex items-center justify-center">
                          <MapPin className="w-10 h-10 text-brand-blue/40" />
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">{mapData.title}</h4>
                      
                      {mapData.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.content && (
                        <p className="text-sm text-gray-500 italic mb-4 line-clamp-3">
                          "{mapData.placeAnswerSources[0].reviewSnippets[0].content}"
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4">
                        <a 
                          href={mapData.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-brand-yellow text-yellow-900 font-bold py-3 rounded-xl hover:bg-[#ffe680] transition-colors"
                        >
                          Ver no Mapa <span className="ml-1 text-yellow-700">+</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NGOSearch;