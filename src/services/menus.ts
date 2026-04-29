import { Menu, MenuCategory, MenuDish } from '@prisma/client'
import {
  createMenuSchema,
  updateMenuSchema,
  createMenuCategorySchema,
  updateMenuCategorySchema,
  createMenuDishSchema,
  updateMenuDishSchema,
} from '@/lib/validation/menu'
import apiFetch from './fetch'
import type { z } from 'zod'

type CreateMenuInput = z.infer<typeof createMenuSchema>
type UpdateMenuInput = z.infer<typeof updateMenuSchema>
type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>
type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>
type CreateMenuDishInput = z.infer<typeof createMenuDishSchema>
type UpdateMenuDishInput = z.infer<typeof updateMenuDishSchema>

export const getMenus = async (): Promise<Menu[]> => {
  const response = await apiFetch<{ ok: boolean; data: Menu[] }>(
    '/api/menus'
  )
  return response.data
}

export const getMenu = async (id: string): Promise<Menu> => {
  const response = await apiFetch<{ ok: boolean; data: Menu }>(
    `/api/menus/${id}`
  )
  return response.data
}

export const createMenu = async (data: CreateMenuInput): Promise<Menu> => {
  const response = await apiFetch<{ ok: boolean; data: Menu }>(
    '/api/menus',
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const updateMenu = async (
  id: string,
  data: UpdateMenuInput
): Promise<Menu> => {
  const response = await apiFetch<{ ok: boolean; data: Menu }>(
    `/api/menus/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deleteMenu = async (id: string): Promise<void> => {
  await apiFetch<{ ok: true }>(`/api/menus/${id}`, {
    method: 'DELETE',
  })
}

export const createCategory = async (
  menuId: string,
  data: CreateMenuCategoryInput
): Promise<MenuCategory> => {
  const response = await apiFetch<{ ok: boolean; data: MenuCategory }>(
    `/api/menus/${menuId}/categories`,
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const updateCategory = async (
  menuId: string,
  catId: string,
  data: UpdateMenuCategoryInput
): Promise<MenuCategory> => {
  const response = await apiFetch<{ ok: boolean; data: MenuCategory }>(
    `/api/menus/${menuId}/categories/${catId}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deleteCategory = async (
  menuId: string,
  catId: string
): Promise<void> => {
  await apiFetch<{ ok: true }>(
    `/api/menus/${menuId}/categories/${catId}`,
    {
      method: 'DELETE',
    }
  )
}

export const createDish = async (
  menuId: string,
  catId: string,
  data: CreateMenuDishInput
): Promise<MenuDish> => {
  const response = await apiFetch<{ ok: boolean; data: MenuDish }>(
    `/api/menus/${menuId}/categories/${catId}`,
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const updateDish = async (
  menuId: string,
  dishId: string,
  data: UpdateMenuDishInput
): Promise<MenuDish> => {
  const response = await apiFetch<{ ok: boolean; data: MenuDish }>(
    `/api/menus/${menuId}/dishes/${dishId}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deleteDish = async (
  menuId: string,
  dishId: string
): Promise<void> => {
  await apiFetch<{ ok: true }>(
    `/api/menus/${menuId}/dishes/${dishId}`,
    {
      method: 'DELETE',
    }
  )
}
