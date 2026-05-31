"use client";

import { useState } from "react";
import { X, Plus, Trash2, Star, ExternalLink } from "lucide-react";
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

  const getInitials = (text: string) => {
    return text.trim().slice(0, 2).toUpperCase();
  };

  return (
    <div className="panel w-80 space-y-4 p-5 animate-slide-up max-md:w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-text-secondary">
            Favoritos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding(!adding)}
            className="text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            {adding ? "Cancelar" : "Agregar"}
          </button>
          <button
            onClick={onClose}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg bg-surface-elevated p-3"
        >
          <div className="space-y-1">
            <label className="text-xs text-text-muted">Nombre</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Google, GitHub..."
              className="input text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-muted">URL</label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com"
              className="input text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </form>
      )}

      {/* Favorites grid */}
      {!adding && (
        <div className="grid max-h-[200px] grid-cols-3 gap-2 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="col-span-3 rounded-lg border border-dashed border-border py-6 text-center">
              <p className="text-sm text-text-muted">Sin favoritos</p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.url}
                className="group relative flex flex-col items-center rounded-lg bg-surface-elevated p-3 transition-colors hover:bg-surface-hover"
              >
                <button
                  onClick={() => onDeleteFavorite(fav.url)}
                  className="absolute right-1 top-1 cursor-pointer p-1 text-text-muted opacity-0 transition-all hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>

                <button
                  onClick={() => onOpenUrl(fav.url)}
                  className="flex w-full cursor-pointer flex-col items-center"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">
                    {getInitials(fav.title)}
                  </div>
                  <span className="mt-2 w-full truncate text-center text-xs text-text-primary">
                    {fav.title}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
