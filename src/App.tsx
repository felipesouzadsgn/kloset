import React, { useState, useEffect } from 'react';
import { 
  Plus, Shirt, Heart, Search, Filter, Trash2, ExternalLink,
  Package, X, ChevronLeft, Menu, CheckCircle2, ImagePlus,
  Calendar, Tag, Scissors, Hash, Palette, Layers, Check, Sparkles, Link
} from 'lucide-react';
import { INITIAL_WARDROBE, INITIAL_WISHLIST, INITIAL_LOOKS, INITIAL_INSPIRATIONS } from './data';
import { Button } from './components/Button';
import { Card } from './components/Card';

export default function App() {
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [wardrobe, setWardrobe] = useState(() => {
    const saved = localStorage.getItem('kloset_wardrobe');
    return saved ? JSON.parse(saved) : INITIAL_WARDROBE;
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('kloset_wishlist');
    return saved ? JSON.parse(saved) : INITIAL_WISHLIST;
  });
  const [looks, setLooks] = useState(() => {
    const saved = localStorage.getItem('kloset_looks');
    return saved ? JSON.parse(saved) : INITIAL_LOOKS;
  });
  const [inspirations, setInspirations] = useState(() => {
    const saved = localStorage.getItem('kloset_inspirations');
    return saved ? JSON.parse(saved) : INITIAL_INSPIRATIONS;
  });

  useEffect(() => { localStorage.setItem('kloset_wardrobe', JSON.stringify(wardrobe)); }, [wardrobe]);
  useEffect(() => { localStorage.setItem('kloset_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('kloset_looks', JSON.stringify(looks)); }, [looks]);
  useEffect(() => { localStorage.setItem('kloset_inspirations', JSON.stringify(inspirations)); }, [inspirations]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLookModalOpen, setIsLookModalOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', category: 'Tops', occasion: 'Casual', color: '', price: '', brand: '', image: '', url: '' });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const [currentLookName, setCurrentLookName] = useState('');
  const [currentLookItems, setCurrentLookItems] = useState<any[]>([]);

  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverCardId, setDragOverCardId] = useState<any>(null);
  const [dragOverTab, setDragOverTab] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData({ ...formData, image: dataUrl });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!formData.name) return; 
    
    if (activeTab === 'inspirations') {
      const newInspiration = {
        id: Date.now(),
        name: formData.name,
        image: formData.image || "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400&h=500&fit=crop",
        url: formData.url || ""
      };
      setInspirations([newInspiration, ...inspirations]);
      showToast('Inspiração guardada com sucesso! ✨');
    } else {
      const newItem = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        occasion: formData.occasion,
        color: formData.color,
        brand: formData.brand || "Sem Marca", 
        price: formData.price || "R$ 0",
        image: formData.image || "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400&h=500&fit=crop",
        purchaseDate: new Date().toLocaleDateString('pt-BR'),
        usageCount: 0
      };

      if (activeTab === 'wardrobe') {
        setWardrobe([newItem, ...wardrobe]);
        showToast('Peça guardada no acervo!');
      } else if (activeTab === 'wishlist') {
        setWishlist([newItem, ...wishlist]);
        showToast('Item adicionado aos desejos!');
      }
    }
    
    setIsModalOpen(false);
    setFormData({ name: '', category: 'Tops', occasion: 'Casual', color: '', price: '', brand: '', image: '', url: '' }); 
  };

  const handleSaveLook = () => {
    if (!currentLookName || currentLookItems.length === 0) {
      showToast('Adicione um nome e pelo menos uma peça.');
      return;
    }
    const newLook = {
      id: Date.now(),
      name: currentLookName,
      items: currentLookItems.map(item => item.id)
    };
    setLooks([newLook, ...looks]);
    showToast('Look guardado com sucesso! ✨');
    setIsLookModalOpen(false);
    setCurrentLookName('');
    setCurrentLookItems([]);
  };

  const toggleItemInLook = (item: any) => {
    if (currentLookItems.find(i => i.id === item.id)) {
      setCurrentLookItems(currentLookItems.filter(i => i.id !== item.id));
    } else {
      setCurrentLookItems([...currentLookItems, item]);
    }
  };

  const deleteItem = (id: number) => {
    if (activeTab === 'wardrobe') {
      setWardrobe(wardrobe.filter(i => i.id !== id));
    } else if (activeTab === 'wishlist') {
      setWishlist(wishlist.filter(i => i.id !== id));
    } else if (activeTab === 'inspirations') {
      setInspirations(inspirations.filter(i => i.id !== id));
    }
    showToast('Item eliminado com sucesso.');
  };

  const handleIncrementUsage = (item: any) => {
    const updatedItem = { ...item, usageCount: (item.usageCount || 0) + 1 };
    setWardrobe(wardrobe.map(i => i.id === item.id ? updatedItem : i));
    setSelectedItem(updatedItem);
    showToast('Uso registrado!');
  };

  const moveItemToOtherList = (item: any) => {
    if (activeTab === 'wardrobe') {
      setWardrobe(wardrobe.filter(i => i.id !== item.id));
      setWishlist([item, ...wishlist]);
      showToast('Peça movida para a Wishlist 🤍');
    } else {
      setWishlist(wishlist.filter(i => i.id !== item.id));
      setWardrobe([item, ...wardrobe]);
      showToast('Item comprado! Movido para o Acervo 🛍️');
    }
  };

  const handleDragStart = (e: any, item: any) => {
    setDraggedItem({ item, sourceList: activeTab });
    setTimeout(() => { e.target.style.opacity = '0.4'; }, 0); 
  };

  const handleDragOverCard = (e: any, targetItem: any) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.item.id === targetItem.id) return;
    if (draggedItem.sourceList === activeTab) {
      setDragOverCardId(targetItem.id);
    }
  };

  const handleDropOnCard = (e: any, targetItem: any) => {
    e.preventDefault();
    setDragOverCardId(null);
    e.target.style.opacity = '1';

    if (!draggedItem || draggedItem.item.id === targetItem.id) return;
    
    if (draggedItem.sourceList === activeTab) {
      const list = activeTab === 'wardrobe' ? [...wardrobe] : [...wishlist];
      const draggedIdx = list.findIndex(i => i.id === draggedItem.item.id);
      const targetIdx = list.findIndex(i => i.id === targetItem.id);
      
      list.splice(draggedIdx, 1);
      list.splice(targetIdx, 0, draggedItem.item);
      
      if (activeTab === 'wardrobe') setWardrobe(list);
      else setWishlist(list);
    }
    setDraggedItem(null);
  };

  const handleDragOverTab = (e: any, tabName: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.sourceList !== tabName) {
      setDragOverTab(tabName);
    }
  };

  const handleDragLeaveTab = () => {
    setDragOverTab(null);
  };

  const handleDropOnTab = (e: any, targetTab: string) => {
    e.preventDefault();
    setDragOverTab(null);
    
    if (!draggedItem || draggedItem.sourceList === targetTab) return;

    if (targetTab === 'wardrobe') {
      setWishlist(wishlist.filter(i => i.id !== draggedItem.item.id));
      setWardrobe([{...draggedItem.item, tab: targetTab}, ...wardrobe]);
      showToast('Item movido para o Acervo! 🛍️');
      setActiveTab('wardrobe');
    } else if (targetTab === 'wishlist') {
      setWardrobe(wardrobe.filter(i => i.id !== draggedItem.item.id));
      setWishlist([{...draggedItem.item, tab: targetTab}, ...wishlist]);
      showToast('Peça movida para a Wishlist! 🤍');
      setActiveTab('wishlist');
    }
    setDraggedItem(null);
  };

  const handleDragEndGlobal = (e: any) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverCardId(null);
    setDragOverTab(null);
  };

  const filteredItems = (activeTab === 'wardrobe' ? wardrobe : wishlist).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-100 selection:text-zinc-900" onDragEnd={handleDragEndGlobal}>
      
      {/* Sidebar Navigation com Drag & Drop suport */}
      <aside className={`fixed left-0 top-0 h-full border-r border-zinc-900/80 bg-zinc-950/60 backdrop-blur-xl p-4 hidden md:flex flex-col z-50 transition-all duration-300 ease-in-out ${isSidebarMinimized ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center justify-between mb-10 px-2 transition-all ${isSidebarMinimized ? 'flex-col gap-4' : 'flex-row'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0">
              <Shirt className="text-zinc-950" size={18} />
            </div>
            {!isSidebarMinimized && <span className="font-bold text-lg tracking-tight animate-in fade-in duration-500">KLOSET</span>}
          </div>
          <button 
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-500 hover:text-zinc-100 transition-colors"
            title={isSidebarMinimized ? "Expandir" : "Modo Zen"}
          >
            {isSidebarMinimized ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('wardrobe')}
            onDragOver={(e) => handleDragOverTab(e, 'wardrobe')}
            onDragLeave={handleDragLeaveTab}
            onDrop={(e) => handleDropOnTab(e, 'wardrobe')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 
              ${activeTab === 'wardrobe' ? 'bg-zinc-100/10 text-zinc-50 border border-white/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'} 
              ${isSidebarMinimized ? 'justify-center px-0' : ''}
              ${dragOverTab === 'wardrobe' ? 'bg-blue-500/20 border-blue-500 scale-105 text-zinc-50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : ''}
            `}
          >
            <Package size={18} className="shrink-0" />
            {!isSidebarMinimized && <span className="animate-in slide-in-from-left-2 duration-300">Meu Acervo</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('wishlist')}
            onDragOver={(e) => handleDragOverTab(e, 'wishlist')}
            onDragLeave={handleDragLeaveTab}
            onDrop={(e) => handleDropOnTab(e, 'wishlist')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 
              ${activeTab === 'wishlist' ? 'bg-zinc-100/10 text-zinc-50 border border-white/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'} 
              ${isSidebarMinimized ? 'justify-center px-0' : ''}
              ${dragOverTab === 'wishlist' ? 'bg-pink-500/20 border-pink-500 scale-105 text-zinc-50 shadow-[0_0_20px_rgba(236,72,153,0.2)]' : ''}
            `}
          >
            <Heart size={18} className="shrink-0" />
            {!isSidebarMinimized && <span className="animate-in slide-in-from-left-2 duration-300">Wishlist</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('looks')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 
              ${activeTab === 'looks' ? 'bg-zinc-100/10 text-zinc-50 border border-white/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'} 
              ${isSidebarMinimized ? 'justify-center px-0' : ''}
            `}
          >
            <Layers size={18} className="shrink-0" />
            {!isSidebarMinimized && <span className="animate-in slide-in-from-left-2 duration-300">Meus Looks</span>}
          </button>

          <button 
            onClick={() => setActiveTab('inspirations')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 
              ${activeTab === 'inspirations' ? 'bg-zinc-100/10 text-zinc-50 border border-white/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'} 
              ${isSidebarMinimized ? 'justify-center px-0' : ''}
            `}
          >
            <Sparkles size={18} className="shrink-0" />
            {!isSidebarMinimized && <span className="animate-in slide-in-from-left-2 duration-300">Inspirações</span>}
          </button>
        </nav>

        <div className="mt-auto">
          <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden relative group transition-all duration-300 ${isSidebarMinimized ? 'p-2' : 'p-4'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
            {!isSidebarMinimized ? (
              <div className="relative z-10 animate-in fade-in duration-300">
                <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-widest">Total de itens</p>
                <p className="text-2xl font-bold tracking-tight">{wardrobe.length + wishlist.length}</p>
              </div>
            ) : (
              <div className="relative z-10 text-center font-bold text-xs animate-in fade-in duration-300">
                {wardrobe.length + wishlist.length}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            <Shirt className="text-zinc-950" size={14} />
          </div>
          <span className="font-bold text-lg tracking-tight">KLOSET</span>
        </div>
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out p-4 pt-20 md:p-12 pb-28 md:pb-12 ${isSidebarMinimized ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
              {activeTab === 'wardrobe' ? 'Meu Guarda-Roupa' : activeTab === 'wishlist' ? 'Lista de Desejos' : activeTab === 'looks' ? 'Meus Looks' : 'Mural de Inspirações'}
            </h1>
            <p className="text-zinc-500 text-sm mt-2 flex items-center">
              {activeTab === 'wishlist' 
                ? 'Arraste um item para "Meu Acervo" na barra lateral após comprar.'
                : activeTab === 'looks' 
                ? 'Crie combinações perfeitas com as peças do seu acervo.'
                : activeTab === 'inspirations'
                ? 'Guarde referências de estilo, paletas de cores e tendências.'
                : 'Arraste os itens para os reorganizar.'}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {activeTab === 'looks' ? (
              <Button onClick={() => setIsLookModalOpen(true)} className="h-10 px-6">
                <Plus size={18} className="mr-2" /> Montar Novo Look
              </Button>
            ) : (
              <Button onClick={() => setIsModalOpen(true)} className="h-10 px-6">
                <Plus size={18} className="mr-2" /> 
                {activeTab === 'wardrobe' ? 'Adicionar Peça' : activeTab === 'inspirations' ? 'Nova Inspiração' : 'Novo Desejo'}
              </Button>
            )}
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 bg-zinc-900/40 md:bg-zinc-900/20 backdrop-blur-md p-2 md:p-1.5 rounded-2xl border border-zinc-800/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou marca..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm pl-11 h-10 placeholder:text-zinc-600"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto p-1">
            <Button variant="outline" className="flex-1 sm:flex-none h-9">
              <Filter size={14} className="mr-2" /> Filtros
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none h-9">
              Ordenar
            </Button>
          </div>
        </div>

        {/* Grid de Conteúdo */}
        {activeTab === 'looks' ? (
          looks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {looks.map(look => {
                const lookItemsData = look.items.map(id => wardrobe.find(w => w.id === id)).filter(Boolean);
                return (
                  <div key={look.id} className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all hover:border-zinc-600 p-4">
                    <h3 className="font-bold text-lg text-zinc-100 mb-4 tracking-tight">{look.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {lookItemsData.slice(0, 4).map((item: any, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-zinc-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                      {lookItemsData.length > 4 && (
                        <div className="absolute bottom-6 right-6 bg-zinc-950/80 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                          +{lookItemsData.length - 4} peças
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setLooks(looks.filter(l => l.id !== look.id));
                        showToast("Look eliminado.");
                      }}
                      className="absolute top-4 right-4 bg-zinc-950/60 backdrop-blur-md text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all border border-white/5 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
              <div className="w-14 h-14 bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl flex items-center justify-center text-zinc-600 mb-5">
                <Layers size={28} />
              </div>
              <p className="text-zinc-400 font-medium">Ainda não guardaste nenhum look.</p>
              <Button onClick={() => setIsLookModalOpen(true)} className="mt-4">Criar Primeiro Look</Button>
            </div>
          )
        ) : activeTab === 'inspirations' ? (
          inspirations.length > 0 ? (
            <div className="columns-2 md:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
              {inspirations.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                <div key={item.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 transition-all">
                  <img src={item.image} alt={item.name} className="w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <h3 className="font-bold text-zinc-50 mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.name}</h3>
                    
                    <div className="flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full transition-colors flex-1 flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-wider">
                          <Link size={14} /> Fonte
                        </a>
                      )}
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white p-2.5 rounded-full transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
              <div className="w-14 h-14 bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl flex items-center justify-center text-zinc-600 mb-5">
                <Sparkles size={28} />
              </div>
              <p className="text-zinc-400 font-medium">Nenhuma inspiração guardada.</p>
              <Button variant="ghost" onClick={() => setIsModalOpen(true)} className="mt-3 text-xs uppercase tracking-widest">Adicionar a Primeira</Button>
            </div>
          )
        ) : (
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
              {filteredItems.map(item => (
                <Card 
                  key={item.id} 
                  item={item} 
                  type={activeTab} 
                  onDelete={deleteItem}
                  onMove={moveItemToOtherList}
                  onOpenDetails={setSelectedItem}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOverCard}
                  onDrop={handleDropOnCard}
                  isDragTarget={dragOverCardId === item.id}
                  isDragging={draggedItem?.item?.id === item.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
              <div className="w-14 h-14 bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl flex items-center justify-center text-zinc-600 mb-5">
                <Package size={28} />
              </div>
              <p className="text-zinc-400 font-medium">Nenhum item encontrado.</p>
              <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-3 text-xs uppercase tracking-widest">Limpar filtros</Button>
            </div>
          )
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center pb-8 md:pb-0">
          <p className="text-zinc-500 text-xs">
            Desenvolvido por{' '}
            <a 
              href="https://felipesouzadesign.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white transition-colors font-medium underline underline-offset-4"
            >
              Felipe Souza Design
            </a>
          </p>
        </footer>
      </main>

      {/* Modal Adicionar Peça/Desejo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-zinc-950 md:bg-zinc-950/80 backdrop-blur-2xl border-t md:border border-white/10 w-full md:max-w-xl h-[90vh] md:h-auto rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom md:zoom-in duration-300">
            <div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <h2 className="text-xl font-semibold tracking-tight">
                {activeTab === 'inspirations' ? 'Guardar Inspiração' : 'Registrar Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 md:p-8 space-y-6 overflow-y-auto flex-1">
              
              {activeTab === 'inspirations' ? (
                // Formulário simplificado para Inspirações
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Título da Inspiração</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 focus:bg-white/10 outline-none transition-all" 
                      placeholder="Ex: Look Inverno Pinterest" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Link da Fonte (Opcional)</label>
                    <input 
                      type="text" 
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 focus:bg-white/10 outline-none transition-all" 
                      placeholder="Ex: https://br.pinterest.com/pin/..." 
                    />
                  </div>
                </>
              ) : (
                // Formulário padrão para Guarda-Roupa/Desejos
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Peça</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 focus:bg-white/10 outline-none transition-all" 
                      placeholder="Ex: Camiseta Básica" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categoria</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option className="bg-zinc-950 text-white" value="Tops">Tops</option>
                        <option className="bg-zinc-950 text-white" value="Bottoms">Bottoms</option>
                        <option className="bg-zinc-950 text-white" value="Footwear">Footwear</option>
                        <option className="bg-zinc-950 text-white" value="Accessories">Acessórios</option>
                        <option className="bg-zinc-950 text-white" value="Outerwear">Outerwear</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ocasião</label>
                      <select 
                        value={formData.occasion}
                        onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option className="bg-zinc-950 text-white" value="Casual">Casual</option>
                        <option className="bg-zinc-950 text-white" value="Esporte">Esporte</option>
                        <option className="bg-zinc-950 text-white" value="Trilha">Trilha</option>
                        <option className="bg-zinc-950 text-white" value="Trabalho">Trabalho</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Marca</label>
                      <input 
                        type="text" 
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 outline-none transition-all" 
                        placeholder="Ex: Zara" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cor</label>
                      <input 
                        type="text" 
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 outline-none transition-all" 
                        placeholder="Ex: Preto" 
                      />
                    </div>
                    {activeTab === 'wishlist' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço Estimado</label>
                        <input 
                          type="text" 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 outline-none transition-all" 
                          placeholder="Ex: R$ 150" 
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Upload de Imagem (comum a todas as abas) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Foto / Referência</label>
                {formData.image ? (
                  <div className="relative w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-xl overflow-hidden group flex items-center justify-center">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, image: ''})}
                      className="absolute top-2 right-2 p-1.5 bg-zinc-950/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 focus:border-white/20 outline-none transition-all text-sm" 
                      placeholder="Cole o link da imagem (URL) aqui..." 
                    />
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">OU</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-24 bg-white/5 border-2 border-dashed border-white/10 rounded-xl hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer text-zinc-500 hover:text-zinc-300">
                      <ImagePlus size={24} className="mb-2 opacity-80" />
                      <span className="text-xs font-semibold">Fazer upload de foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button className="flex-1 h-11 shadow-lg shadow-white/5" onClick={handleAddItem}>
                  {activeTab === 'inspirations' ? 'Guardar Inspiração' : 'Guardar Peça'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Look (Look Builder) */}
      {isLookModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-end md:items-center justify-center md:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsLookModalOpen(false)}></div>
          <div className="relative bg-zinc-950 border-t md:border border-white/10 w-full md:max-w-5xl h-[95vh] md:h-full md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 flex flex-col md:flex-row">
            
            {/* Esquerda: Canvas do Look */}
            <div className="flex-none md:flex-1 h-[45vh] md:h-auto bg-zinc-900/30 p-4 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/10">
              <div className="mb-4 md:mb-6 flex justify-between items-start">
                <div className="w-full max-w-sm">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome do Look</label>
                  <input 
                    type="text" 
                    value={currentLookName}
                    onChange={(e) => setCurrentLookName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-white text-xl md:text-2xl font-bold px-1 py-1 md:py-2 outline-none transition-all placeholder:text-zinc-700 mt-1" 
                    placeholder="Ex: Reunião de Terça" 
                  />
                </div>
                <button onClick={() => setIsLookModalOpen(false)} className="md:hidden p-2 text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>

              <div className="flex-1 bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800 p-4 md:p-6 flex flex-col items-center justify-center overflow-y-auto relative">
                {currentLookItems.length === 0 ? (
                  <div className="text-center text-zinc-600">
                    <Layers size={36} className="mx-auto mb-3 opacity-50 md:w-12 md:h-12" />
                    <p className="font-medium text-sm md:text-base">Nenhuma peça selecionada</p>
                    <p className="text-xs md:text-sm">Clique nas peças ao lado para compor o look.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 w-full h-full content-start">
                    {currentLookItems.map(item => (
                      <div key={`look-${item.id}`} className="relative aspect-[4/5] rounded-xl overflow-hidden group border border-white/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => toggleItemInLook(item)}
                          className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500/80 backdrop-blur-md text-white p-1.5 rounded-full md:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                        >
                          <X size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-6 flex gap-3">
                <Button variant="outline" className="flex-1 h-10 md:h-12 text-xs md:text-sm" onClick={() => { setIsLookModalOpen(false); setCurrentLookItems([]); setCurrentLookName(''); }}>Cancelar</Button>
                <Button className="flex-1 h-10 md:h-12 text-sm md:text-md font-bold" onClick={handleSaveLook}>Guardar Look</Button>
              </div>
            </div>

            {/* Direita: Seleção de Peças */}
            <div className="flex-1 md:w-2/5 lg:w-1/3 flex flex-col bg-zinc-950 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                <div>
                  <h2 className="text-base md:text-lg font-semibold tracking-tight">O seu Acervo</h2>
                  <p className="text-[10px] md:text-xs text-zinc-500 mt-0.5 md:mt-1">Toque numa peça para adicionar</p>
                </div>
                <button onClick={() => setIsLookModalOpen(false)} className="hidden md:block p-2 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 md:p-4 grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3 scrollbar-hide content-start">
                {wardrobe.map(item => {
                  const isSelected = currentLookItems.find(i => i.id === item.id);
                  return (
                    <div 
                      key={`select-${item.id}`}
                      onClick={() => toggleItemInLook(item)}
                      className={`relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-zinc-100 scale-95 opacity-50' : 'border-transparent hover:border-zinc-700'}`}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <div className="bg-white text-black p-2 rounded-full shadow-lg">
                            <Check size={20} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Drawer de Detalhes da Peça */}
      {selectedItem && (
        <div className="fixed inset-0 z-[120] flex justify-end items-end md:items-stretch overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
          
          <div className="relative w-full md:max-w-md h-[85vh] md:h-full bg-zinc-950/95 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-300 flex flex-col rounded-t-3xl md:rounded-none">
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-white/5 bg-white/5 shrink-0">
              <h2 className="text-lg font-semibold tracking-tight">Detalhes do Item</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 md:space-y-8 scrollbar-hide">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 relative group">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-zinc-50 tracking-tighter mb-2">{selectedItem.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 border border-white/5">{selectedItem.brand}</span>
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{selectedItem.category}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Palette size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Cor</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-100">{selectedItem.color || "N/D"}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Tag size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Preço</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-100">{selectedItem.price || "N/D"}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Scissors size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ocasião</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-100">{selectedItem.occasion || "Casual"}</p>
                </div>
                {activeTab === 'wardrobe' ? (
                  <>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Aquisição</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-100">{selectedItem.purchaseDate || "Desconhecido"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl col-span-2 flex items-center justify-between group/stats">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg text-zinc-400 group-hover/stats:text-zinc-50 transition-colors">
                          <Hash size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Utilizações</p>
                          <p className="text-sm font-medium text-zinc-100">{selectedItem.usageCount || 0} vezes</p>
                        </div>
                      </div>
                      <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => handleIncrementUsage(selectedItem)}>+1 Uso</Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl col-span-2 hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <ExternalLink size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Link da Loja</span>
                      </div>
                      <a href={selectedItem.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4 break-all">
                        {selectedItem.url || "Nenhum link adicionado"}
                      </a>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex gap-3 border-t border-white/5">
                <Button 
                  variant="danger" 
                  className="flex-1"
                  onClick={() => {
                    deleteItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                >
                  <Trash2 size={16} className="mr-2" /> Eliminar
                </Button>
                <Button 
                  className="flex-1 shadow-lg shadow-white/5"
                  onClick={() => {
                    moveItemToOtherList(selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  {activeTab === 'wishlist' ? (
                    <><Package size={16} className="mr-2" /> Comprar</>
                  ) : (
                    <><Heart size={16} className="mr-2" /> P/ Wishlist</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/10 px-2 pt-2 pb-6 flex justify-between items-center md:hidden z-50">
        <button 
          onClick={() => setActiveTab('wardrobe')} 
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all rounded-xl
            ${activeTab === 'wardrobe' ? 'text-zinc-50 scale-105' : 'text-zinc-600'}
          `}
        >
          <Package size={20} />
          <span className="text-[9px] font-bold uppercase truncate">Acervo</span>
        </button>
        <button 
          onClick={() => setActiveTab('looks')} 
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all rounded-xl
            ${activeTab === 'looks' ? 'text-zinc-50 scale-105' : 'text-zinc-600'}
          `}
        >
          <Layers size={20} />
          <span className="text-[9px] font-bold uppercase truncate">Looks</span>
        </button>
        
        <button 
          onClick={() => activeTab === 'looks' ? setIsLookModalOpen(true) : setIsModalOpen(true)}
          className="flex flex-col items-center justify-center -mt-6 mx-1"
        >
          <div className="bg-zinc-100 text-zinc-950 p-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-90 transition-transform">
            <Plus size={24} />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('wishlist')} 
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all rounded-xl
            ${activeTab === 'wishlist' ? 'text-zinc-50 scale-105' : 'text-zinc-600'}
          `}
        >
          <Heart size={20} />
          <span className="text-[9px] font-bold uppercase truncate">Desejos</span>
        </button>
        <button 
          onClick={() => setActiveTab('inspirations')} 
          className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all rounded-xl
            ${activeTab === 'inspirations' ? 'text-zinc-50 scale-105' : 'text-zinc-600'}
          `}
        >
          <Sparkles size={20} />
          <span className="text-[9px] font-bold uppercase truncate">Inspirar</span>
        </button>
      </nav>

      <div className={`fixed bottom-24 md:bottom-10 right-4 md:right-10 z-[110] transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-zinc-50 text-zinc-950 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-medium text-sm">
          <CheckCircle2 size={18} className="text-green-600" />
          {toast.message}
        </div>
      </div>
    </div>
  );
}
