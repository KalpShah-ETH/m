import { create } from 'zustand';

export interface Category {
  id: string;
  name: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  packSize: string;
  ptr: number;
  mrp: number;
  stockStatus: 'in-stock' | 'out-of-stock' | 'low-stock' | 'high' | 'low' | 'out';
  discountPercentage: number;
  quantityInCart: number;
}

interface CatalogState {
  activeTab: 'mapped' | 'non-mapped';
  selectedCategory: string | null;
  
  setActiveTab: (tab: 'mapped' | 'non-mapped') => void;
  setSelectedCategory: (categoryId: string | null) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  activeTab: 'mapped',
  selectedCategory: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
}));
