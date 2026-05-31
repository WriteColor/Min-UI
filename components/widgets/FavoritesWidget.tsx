"use client";

import { useState } from "react";
import { X, Plus, Trash2, Star } from "lucide-react";
import type { FavoriteItem } from "../../types";

interface FavoritesWidgetProps {
  favorites: FavoriteItem[];
  onAddFavorite: (title: string, url: string) => void;
  onDeleteFavorite: (url: string) => void;
  onOpenUrl: (url: string) => void;
  onClose: () => void;
}

export function FavoritesWidget({
  favorites,
  onAddFavorite,
  onDeleteFavorite,
  onOpenUrl,
  onClose,
}: FavoritesWidgetProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    onAddFavorite(title.trim(), cleanUrl);
    setTitle("");
    setUrl("");
    setAdding(false);
  };

  const getLinkInitials = (text: string) => {
    return text.trim().slice(0, 2).toUpperCase();
  };

  return (
    <div className="hud-panel p-5 w-80 max-md:w-[calc(100vw-2rem)] relative select-none animate-slide-up space-y-4">
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-300 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-teal-600 animate-pulse" />
          <span className="text-[0.62rem] text-slate-600 font-mono font-bold uppercase tracking-widest">
            LAUNCHPAD // CELLS
          </span>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="text-[0.58rem] font-mono text-slate-500 hover:text-teal-700 underline cursor-pointer uppercase"
        >
          {adding ? "[ Cancelar ]" : "[ Registrar ]"}
        </button>
      </div>

      {adding ? (
        <form onSubmit={handleSubmit} className="p-3 border border-slate-200/80 rounded-lg bg-white/70 space-y-3 font-mono">
          <div className="space-y-1">
            <label className="text-[0.55rem] text-slate-500 uppercase">Nombre</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Google, GitHub..."
              className="w-full h-7 bg-white border border-slate-200 rounded px-2 text-xs text-slate-700 outline-none focus:border-teal-400 transition-all select-text"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[0.55rem] text-slate-500 uppercase">Enlace URL</label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com"
              className="w-full h-7 bg-white border border-slate-200 rounded px-2 text-xs text-slate-700 outline-none focus:border-teal-400 transition-all select-text"
            />
          </div>

          <button
            type="submit"
            className="w-full h-7 rounded border border-teal-500 bg-teal-600 text-[0.62rem] text-white font-semibold cursor-pointer tracking-wider hover:bg-teal-500 hover:shadow-[0_0_12px_rgba(13,148,136,0.35)] transition-all"
          >
            AÑADIR ACCESO DIRECTO
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-3 gap-3 max-h-[190px] overflow-y-auto pr-1">
          {favorites.map((fav) => (
            <div
              key={fav.url}
              className="group relative flex flex-col items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-white/70 hover:border-teal-300 hover:bg-teal-50/70 transition-all duration-300 h-20 text-center"
            >
              <button
                type="button"
                onClick={() => onDeleteFavorite(fav.url)}
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all duration-300 p-0.5 cursor-pointer z-10"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              <button
                onClick={() => onOpenUrl(fav.url)}
                className="w-full h-full flex flex-col items-center justify-between cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full border border-purple-500/15 bg-black/50 group-hover:border-purple-400 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] flex items-center justify-center text-xs font-mono font-bold text-purple-300 group-hover:text-purple-100 transition-all">
                  {getLinkInitials(fav.title)}
                </div>

                <div className="text-[0.62rem] font-mono text-slate-700 truncate w-full mt-1.5">
                  {fav.title.toUpperCase()}
                </div>
              </button>
            </div>
          ))}

          {favorites.length === 0 && (
            <div className="col-span-3 text-center py-6 text-slate-400 text-[0.62rem] uppercase font-mono tracking-widest border border-dashed border-slate-200 rounded">
              Celda vacía // Sin enlaces
            </div>
          )}
        </div>
      )}
    </div>
  );
}
