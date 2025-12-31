
import React, { useRef, useEffect } from 'react';
import { NGOPost } from '../types';
import { BrandedText } from '../utils';
import { 
  Share2, 
  CircleCheck,
  UserPlus,
  Play
} from 'lucide-react';

interface StoriesFeedProps {
  stories: NGOPost[];
  onSelectNGO: (ngoId: string) => void;
}

const StoriesFeed: React.FC<StoriesFeedProps> = ({ stories, onSelectNGO }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensuring snap scrolling is enabled on the container
    if (containerRef.current) {
      containerRef.current.style.scrollSnapType = 'y mandatory';
    }
  }, []);

  if (stories.length === 0) {
    return (
      <div className="h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center text-white p-8 text-center">
        <Play size={64} className="text-gray-700 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold mb-3">O mundo está esperando sua história</h2>
        <p className="text-gray-400 max-w-xs mx-auto text-sm">
          Ainda não temos histórias publicadas. Seja a mudança que você quer ver!
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] w-full overflow-y-scroll no-scrollbar bg-black snap-y snap-mandatory"
    >
      {stories.map((story) => (
        <section 
          key={story.id} 
          className="h-full w-full relative snap-start flex items-center justify-center overflow-hidden"
        >
          {/* Background Media */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {story.type === 'video' ? (
              <video 
                src={story.url} 
                className="w-full h-full object-cover sm:object-contain bg-black" 
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
              />
            ) : (
              <img src={story.url} className="w-full h-full object-cover sm:object-contain bg-black" alt="Story content" />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          </div>

          {/* Centralized Side Action (Only Share) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center text-white z-20">
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center group-hover:bg-brand-blue group-hover:scale-110 transition-all shadow-xl">
                <Share2 size={30} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">Share</span>
            </button>
          </div>

          {/* Bottom Info (NGO Name, Description, Caption) */}
          <div className="absolute bottom-8 left-4 right-20 text-white z-20">
            <div 
              className="flex items-center gap-3 mb-3 cursor-pointer group"
              onClick={() => story.ngoId && onSelectNGO(story.ngoId)}
            >
              <div className="relative">
                <img 
                  src={story.ngoImage} 
                  className="w-12 h-12 rounded-full border-2 border-brand-yellow shadow-lg bg-white" 
                  alt={story.ngoName}
                />
                <div className="absolute -bottom-1 -right-1 bg-brand-blue rounded-full p-0.5 border border-black">
                   <UserPlus size={10} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-1 text-lg group-hover:text-brand-blue transition-colors drop-shadow-md">
                  {story.ngoName}
                  <CircleCheck size={16} className="fill-brand-blue text-white" />
                </h3>
              </div>
            </div>

            {story.caption && (
              <p className="text-sm text-gray-200 mb-4 drop-shadow-md leading-relaxed line-clamp-4 bg-black/10 backdrop-blur-[2px] p-2 rounded-xl">
                {story.caption}
              </p>
            )}
            
            <button 
              onClick={() => story.ngoId && onSelectNGO(story.ngoId)}
              className="px-8 py-3 bg-brand-blue rounded-full font-bold text-sm shadow-2xl hover:bg-blue-400 transform hover:scale-105 transition-all flex items-center gap-2"
            >
               Apoiar agora
               <span className="text-brand-yellow">+</span>
            </button>
          </div>
        </section>
      ))}
    </div>
  );
};

export default StoriesFeed;
