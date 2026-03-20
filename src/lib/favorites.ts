export const getFavorites = (): string[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('ma_favs');
  return saved ? JSON.parse(saved) : [];
};

export const saveFavorite = (id: string) => {
  const favs = getFavorites();
  if (!favs.includes(id)) {
    const newFavs = [...favs, id];
    localStorage.setItem('ma_favs', JSON.stringify(newFavs));
    // Trigger a custom event to update navbar count
    window.dispatchEvent(new Event('favorites-updated'));
  }
};

export const removeFavorite = (id: string) => {
  const favs = getFavorites();
  const newFavs = favs.filter(favId => favId !== id);
  localStorage.setItem('ma_favs', JSON.stringify(newFavs));
  window.dispatchEvent(new Event('favorites-updated'));
};