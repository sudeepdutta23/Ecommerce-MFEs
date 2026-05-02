import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ProductFilters } from '../types/product.types'

interface ProductsState {
  filters: ProductFilters
  selectedProductId: string | null
  viewMode: 'grid' | 'list'
}

const initialState: ProductsState = {
  filters: { category: 'All', search: '', sortBy: 'default' },
  selectedProductId: null,
  viewMode: 'grid',
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) {
      state.filters.category = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
    },
    setSortBy(state, action: PayloadAction<ProductFilters['sortBy']>) {
      state.filters.sortBy = action.payload
    },
    setMaxPrice(state, action: PayloadAction<number | undefined>) {
      state.filters.maxPrice = action.payload
    },
    setSelectedProduct(state, action: PayloadAction<string | null>) {
      state.selectedProductId = action.payload
    },
    setViewMode(state, action: PayloadAction<'grid' | 'list'>) {
      state.viewMode = action.payload
    },
    resetFilters(state) {
      state.filters = initialState.filters
    },
  },
})

export const {
  setCategory, setSearch, setSortBy, setMaxPrice,
  setSelectedProduct, setViewMode, resetFilters,
} = productsSlice.actions

export default productsSlice.reducer
