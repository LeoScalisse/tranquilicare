
import React, { useState, useRef, useEffect } from 'react';
import { NGO, NGOPost } from '../types';
import { BrandedText } from '../utils';
import { 
  Grid, 
  Heart, 
  MessageCircle, 
  Target,
  X,
  Instagram,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Camera,
  Video as VideoIcon,
  Upload,
  Play,
  Send,
  Loader2
} from 'lucide-react';

interface NGOProfileProps {
  ngo: NGO;
  isOwner: boolean;
  onUpdate: (ngo: NGO) => void;
}

const NGOProfile: React.FC<NGOProfileProps> = ({ ngo, isOwner, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [zoomedPost, setZoomedPost] = useState<NGOPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [editedData, setEditedData] = useState(ngo);
  
  // States for new post upload simulation
  const [newPostFile, setNewPostFile] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(editedData);
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      
      // Feedback imediato de carregamento do arquivo local
      setIsUploading(true);
      setUploadProgress(10); // Iniciando leitura

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 50);
          setUploadProgress(progress);
        }
      };

      reader.onloadend = () => {
        setNewPostFile({
          url: reader.result as string,
          type: isVideo ? 'video' : 'image'
        });
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPost = async () => {
    if (!newPostFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulação de upload real para o servidor
    // Vídeos costumam demorar mais para "processar"
    const isVideo = newPostFile.type === 'video';
    const totalSteps = isVideo ? 40 : 20;
    const intervalTime = isVideo ? 150 : 80;

    for (let i = 0; i <= 100; i += (100 / totalSteps)) {
      await new Promise(resolve => setTimeout(resolve, intervalTime));
      setUploadProgress(Math.min(i, 99));
    }

    const newPost: NGOPost = {
      id: Math.random().toString(36).substr(2, 9),
      url: newPostFile.url,
      type: newPostFile.type,
      caption: newPostCaption,
      timestamp: Date.now()
    };

    setUploadProgress(100);
    
    // Pequeno delay para o usuário ver o 100%
    setTimeout(() => {
      onUpdate({
        ...ngo,
        posts: [newPost, ...ngo.posts]
      });

      // Reset and close
      setNewPostFile(null);
      setNewPostCaption('');
      setIsUploading(false);
      setUploadProgress(0);
      setShowPostModal(false);
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInstagramUrl = (handle: string) => {
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    return `https://www.instagram.com/${cleanHandle}`;
  };

  const getGmailUrl = (email: string) => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
      {/* Zoomed Post Modal */}
      {zoomedPost && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomedPost(null)}
        >
          <button 
            onClick={() => setZoomedPost(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[130]"
          >
            <X size={24} />
          </button>
          
          <div 
            className="relative w-full max-w-2xl aspect-[4/5] sm:aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {zoomedPost.type === 'video' ? (
              <video 
                src={zoomedPost.url} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay 
                loop 
                playsInline
                preload="auto"
              />
            ) : (
              <img src={zoomedPost.url} className="w-full h-full object-contain" alt="Zoomed Story" />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
              <div className="flex items-center gap-3 mb-2">
                 <img src={ngo.image} className="w-10 h-10 rounded-full border-2 border-white" />
                 <span className="font-bold">{ngo.name}</span>
              </div>
              {zoomedPost.caption && (
                <p className="text-sm text-gray-200 leading-relaxed max-w-lg">
                  {zoomedPost.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Nova história</h3>
              <button 
                disabled={isUploading}
                onClick={() => {
                  setShowPostModal(false);
                  setNewPostFile(null);
                  setNewPostCaption('');
                }} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!newPostFile ? (
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`w-full aspect-video border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer hover:border-brand-blue hover:bg-blue-50'}`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                      <p className="text-sm font-bold text-gray-500">Lendo arquivo...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:bg-brand-blue/10 transition-all">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-700">Selecione uma mídia</p>
                        <p className="text-xs text-gray-400">Fotos ou vídeos curtos de impacto</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group">
                    {newPostFile.type === 'video' ? (
                      <video src={newPostFile.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={newPostFile.url} className="w-full h-full object-cover" />
                    )}
                    {!isUploading && (
                      <button 
                        onClick={() => setNewPostFile(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden max-w-xs">
                          <div 
                            className="h-full bg-brand-yellow transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest">{Math.round(uploadProgress)}% Enviando</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MessageCircle size={16} className="text-brand-blue" />
                      Legenda da história
                    </label>
                    <textarea 
                      disabled={isUploading}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-brand-blue focus:bg-white rounded-2xl outline-none transition-all resize-none text-sm h-24 disabled:opacity-50"
                      placeholder="Conte um pouco sobre este momento de impacto..."
                      value={newPostCaption}
                      onChange={e => setNewPostCaption(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={handlePublishPost}
                    disabled={isUploading || !newPostFile}
                    className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Publicar história
                      </>
                    )}
                  </button>
                </div>
              )}
              <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Contato</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <a href={getInstagramUrl(ngo.instagram)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-brand-blue/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-pink-500"><Instagram size={20} /></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Instagram</p><p className="text-sm font-bold text-gray-800">{ngo.instagram}</p></div>
                </div>
                <ExternalLink size={16} className="text-gray-300 group-hover:text-brand-blue" />
              </a>

              <a href={getGmailUrl(ngo.email)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-brand-blue/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-blue"><Mail size={20} /></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">E-mail</p><p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{ngo.email}</p></div>
                </div>
                <ExternalLink size={16} className="text-gray-300 group-hover:text-brand-blue" />
              </a>

              {ngo.phone && (
                <div onClick={() => copyToClipboard(ngo.phone!)} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-brand-blue/10 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-500"><Phone size={20} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Telefone</p><p className="text-sm font-bold text-gray-800">{ngo.phone}</p></div>
                  </div>
                  <div className="flex items-center gap-1.5">{copied ? <Check size={12} className="text-green-600" /> : <Copy size={16} className="text-gray-300 group-hover:text-brand-blue" />}</div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50/50">
              <button onClick={() => setShowContactModal(false)} className="w-full py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Estilo Instagram */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 md:gap-20 mb-12">
        <div className="relative shrink-0">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border border-gray-100 p-1 bg-gradient-to-tr from-brand-yellow to-brand-blue">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white">
              <img src={ngo.image} alt={ngo.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h2 className="text-xl font-light text-gray-800 lowercase">
              {ngo.name.replace(/\s+/g, '').toLowerCase()}
            </h2>
            <div className="flex gap-2">
              {isOwner && (
                <>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {isEditing ? 'Cancelar' : 'Editar perfil'}
                  </button>
                  <button 
                    onClick={() => setShowPostModal(true)}
                    className="bg-brand-yellow hover:opacity-90 text-yellow-900 text-sm font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={16} />
                    <BrandedText text="+ Histórias" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-8 justify-center sm:justify-start">
            <div className="text-sm"><span className="font-bold">{ngo.posts?.length || 0}</span> histórias</div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="font-bold text-sm">{ngo.name}</h1>
            <div className="text-sm text-gray-500 font-medium mb-1">
              <BrandedText text={ngo.category} />
            </div>
            
            {isEditing && isOwner ? (
              <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-left animate-fade-in">
                <textarea className="w-full p-2 text-sm border rounded-lg outline-none" value={editedData.description} onChange={e => setEditedData({...editedData, description: e.target.value})} />
                <input className="w-full p-2 text-sm border rounded-lg outline-none" value={editedData.goal} onChange={e => setEditedData({...editedData, goal: e.target.value})} />
                <button onClick={handleSave} className="w-full bg-brand-blue text-white font-bold py-2 rounded-lg text-sm">Salvar Alterações</button>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{ngo.description}</p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-brand-blue font-bold text-sm pt-1">
                  <Target size={14} />
                  <span>Meta: {ngo.goal}</span>
                </div>
                <button onClick={() => setShowContactModal(true)} className="text-sm font-bold text-blue-900 block pt-1 hover:underline">Contato</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="flex justify-center -mt-px">
          <button className="flex items-center gap-1.5 py-4 text-xs font-bold uppercase tracking-wider border-t border-gray-800 text-gray-800">
            <Grid size={14} />
            Histórias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 md:gap-6 mt-2">
        {ngo.posts && ngo.posts.length > 0 ? (
          ngo.posts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => setZoomedPost(post)}
              className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100"
            >
              {post.type === 'image' ? (
                <img src={post.url} className="w-full h-full object-cover transition-all group-hover:scale-110" alt="História" />
              ) : (
                <div className="relative w-full h-full">
                  <video src={post.url} className="w-full h-full object-cover" preload="metadata" />
                  <div className="absolute top-2 right-2 text-white drop-shadow-md"><VideoIcon size={20} /></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Play size={32} className="text-white fill-white" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                 <div className="flex items-center gap-1.5"><Heart size={20} fill="white" /> 0</div>
                 <div className="flex items-center gap-1.5"><MessageCircle size={20} fill="white" /> 0</div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-300">
            <div className="w-20 h-20 border-2 border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-400">Nenhuma história ainda</h3>
            {isOwner && <p className="text-sm mt-2">Clique em + Histórias para começar a postar seu impacto.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOProfile;
