import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Star, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { FavoriteItem } from "../../types";

interface FavoritesWidgetProps {
  favorites: FavoriteItem[];
  onAddFavorite: (title: string, url: string) => void;
  onDeleteFavorite: (url: string) => void;
  onOpenUrl: (url: string) => void;
  onClose: () => void;
}

export function FavoritesWidget({ favorites, onAddFavorite, onDeleteFavorite, onOpenUrl, onClose }: FavoritesWidgetProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [autoHide, setAutoHide] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoHide && favorites.length === 0) {
      timerRef.current = setTimeout(onClose, 10000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHide, onClose, favorites.length]);

  const handleAdd = () => {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    onAddFavorite(t, u);
    setTitle("");
    setUrl("");
  };

  return (
    <div
      onMouseEnter={() => {
        setAutoHide(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => setAutoHide(true)}
      className="animate-slide-up rounded-sm border border-purple-500/15 bg-black/95 backdrop-blur-xl p-4 shadow-2xl shadow-purple-500/10 w-72 relative max-h-[70vh] flex flex-col"
    >
      <button onClick={onClose} className="absolute top-2.5 right-2.5 h-5 w-5 flex items-center justify-center rounded-sm text-gray-600 hover:text-white hover:bg-purple-500/15 transition-all cursor-pointer">
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center gap-1.5 mb-3">
        <Star className="h-3.5 w-3.5 text-purple-400" />
        <span className="text-[0.65rem] text-purple-400 font-medium uppercase tracking-wider">Favoritos</span>
        <span className="text-[0.65rem] text-gray-600 ml-auto">{favorites.length} guardados</span>
      </div>

      {/* Add new */}
      <div className="space-y-1.5 mb-3">
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Nombre..."
          className="h-8 text-xs"
        />
        <div className="flex gap-1.5">
          <Input
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleAdd()}
            placeholder="https://..."
            className="flex-1 h-8 text-xs"
          />
          <Button variant="default" size="sm" onClick={handleAdd} className="h-8 w-8 p-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {favorites.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-6">Sin favoritos</div>
        )}
        {favorites.map((fav, i) => (
          <div key={`${fav.url}-${i}`} className="flex items-center gap-2 rounded-sm bg-black/40 border border-purple-500/10 hover:border-purple-500/20 px-2.5 py-1.5 group transition-colors">
            <Star className="h-3 w-3 text-yellow-500/60" />
            <span className="flex-1 text-xs text-gray-300 truncate">{fav.title}</span>
            <button onClick={() => onOpenUrl(fav.url)} className="text-gray-600 hover:text-purple-400 transition-colors cursor-pointer" title="Abrir">
              <ExternalLink className="h-3 w-3" />
            </button>
            <button onClick={() => onDeleteFavorite(fav.url)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
