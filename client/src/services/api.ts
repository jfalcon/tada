import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Category {
  id: number
  category: string
}

export interface User {
  id: number
  username: string
}

export interface Task {
  id: number
  title: string
  description?: string
  due_date?: string | null
  category_id?: number | null
  user_id?: number | null
  completed?: boolean
  priority?: 'Low' | 'Medium' | 'High'
  status?: 'Pending' | 'In Progress' | 'Completed'
  created_at?: string
}

const BASE_URL = '/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Categories', 'Users'],
  endpoints: (builder) => ({
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({ url: '/category', method: 'POST', body }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
    getCategories: builder.query<Category[], undefined>({
      query: () => ({ url: '/category' }),
      providesTags: (result) =>
        result
          ? [...result.map(
            ({ id }) => ({ type: 'Categories' as const, id }),
          ), { type: 'Categories', id: 'LIST' }]
          : [{ type: 'Categories', id: 'LIST' }],
    }),
    getUsers: builder.query<User[], undefined>({
      query: () => ({ url: '/user' }),
      providesTags: (result) =>
        result
          ? [...result.map(
            ({ id }) => ({ type: 'Users' as const, id }),
          ), { type: 'Users', id: 'LIST' } as const]
          : [{ type: 'Users', id: 'LIST' } as const],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetUsersQuery,
} = api;
