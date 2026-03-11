import React from 'react';
import { MoreHorizontal, Trash2, ExternalLink, Package, Heart, ArrowRightLeft } from 'lucide-react';
import { Button } from './Button';

export const Card = ({ 
  item, 
  type = 'wardrobe', 
  onDelete, 
  onMove,
  onOpenDetails,
  onDragStart, 
  onDragOver, 
  onDrop, 
  isDragTarget,
  isDragging
}: any) => (
  <div 
    draggable
    onDragStart={(e) => onDragStart(e, item)}
    onDragOver={(e) => onDragOver(e, item)}
    onDrop={(e) => onDrop(e, item)}
    className={`group relative rounded-xl border bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing
      ${isDragTarget ? 'border-zinc-300 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] z-10' : 'border-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/40'}
      ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
    `}
  >
    <div 
      className="aspect-[4/5] w-full overflow-hidden bg-zinc-800/50 relative pointer-events-none md:pointer-events-auto cursor-pointer group/img"
      onClick={() => onOpenDetails && onOpenDetails(item)}
    >
      <img 
        src={item.image} 
        alt={item.name} 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
      />
      {/* Overlay Details Hint */}
      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors hidden md:flex items-center justify-center">
        <span className="opacity-0 group-hover/img:opacity-100 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-full transition-all translate-y-4 group-hover/img:translate-y-0 shadow-xl">
          Ver Detalhes
        </span>
      </div>
      {/* Overlay indicating it can be dropped here */}
      {isDragTarget && (
        <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center">
          <ArrowRightLeft className="text-zinc-100 animate-pulse" size={32} />
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium text-zinc-100 truncate flex-1">{item.name}</h3>
        <button className="text-zinc-500 hover:text-zinc-200 p-1">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">
        <span>{item.brand}</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
        <span>{item.category}</span>
      </div>
      {type === 'wishlist' && (
        <div className="mt-3 pt-3 border-t border-zinc-800/50 flex justify-between items-center">
          <span className="text-zinc-100 font-bold">{item.price}</span>
          <Button variant="ghost" className="h-7 px-2 text-xs">
            <ExternalLink size={12} className="mr-1" /> Loja
          </Button>
        </div>
      )}
      
      {/* Hover Actions */}
      <div className="absolute top-2 right-2 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          className="bg-zinc-950/60 backdrop-blur-md text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all border border-white/5"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onMove(item); }}
          className="bg-zinc-950/60 backdrop-blur-md text-blue-400 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all border border-white/5"
          title={type === 'wishlist' ? "Mover para Acervo" : "Mover para Wishlist"}
        >
          {type === 'wishlist' ? <Package size={16} /> : <Heart size={16} />}
        </button>
      </div>
    </div>
  </div>
);
