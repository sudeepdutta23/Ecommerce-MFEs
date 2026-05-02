// RTK Query base API with mock JSON data strategy
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Product, ProductFilters } from '../../types/product.types'
import mockProducts from '../../data/mock-products.json'

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Product'],
  endpoints: (builder) => ({

    getProducts: builder.query<Product[], ProductFilters | void>({
      async queryFn(filters) {
        await delay(600)
        let products = mockProducts as Product[]
        if (filters?.category && filters.category !== 'All') {
          products = products.filter(p => p.category === filters.category)
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase()
          products = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
          )
        }
        if (filters?.maxPrice) {
          products = products.filter(p => p.price <= filters.maxPrice!)
        }
        if (filters?.sortBy === 'price-asc') products.sort((a,b) => a.price - b.price)
        if (filters?.sortBy === 'price-desc') products.sort((a,b) => b.price - a.price)
        if (filters?.sortBy === 'rating') products.sort((a,b) => b.rating - a.rating)
        return { data: products }
      },
      providesTags: ['Product'],
    }),

    getProductById: builder.query<Product, string>({
      async queryFn(id) {
        await delay(300)
        const product = (mockProducts as Product[]).find(p => p.id === id)
        if (!product) return { error: { status: 404, error: 'Not found' } }
        return { data: product }
      },
      providesTags: (_res, _err, id) => [{ type: 'Product', id }],
    }),

    getCategories: builder.query<string[], void>({
      async queryFn() {
        await delay(200)
        const cats = ['All', ...new Set((mockProducts as Product[]).map(p => p.category))]
        return { data: cats }
      },
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
} = productsApi
