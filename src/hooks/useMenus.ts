import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  createCategory,
  updateCategory,
  deleteCategory,
  createDish,
  updateDish,
  deleteDish,
} from '@/services/menus'

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: () => getMenus(),
  })
}

export function useMenu(id: string) {
  return useQuery({
    queryKey: ['menus', id],
    queryFn: () => getMenu(id),
    enabled: !!id,
  })
}

export function useCreateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useUpdateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMenu>[1] }) =>
      updateMenu(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', id] })
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useDeleteMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useCreateMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, data }: { menuId: string; data: Parameters<typeof createCategory>[1] }) =>
      createCategory(menuId, data),
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', menuId] })
    },
  })
}

export function useUpdateMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, catId, data }: { menuId: string; catId: string; data: Parameters<typeof updateCategory>[2] }) =>
      updateCategory(menuId, catId, data),
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', menuId] })
    },
  })
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, catId }: { menuId: string; catId: string }) =>
      deleteCategory(menuId, catId),
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', menuId] })
    },
  })
}

export function useCreateMenuDish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, catId, data }: { menuId: string; catId: string; data: Parameters<typeof createDish>[2] }) =>
      createDish(menuId, catId, data),
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', menuId] })
    },
  })
}

export function useUpdateMenuDish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, dishId, data }: { menuId: string; dishId: string; data: Parameters<typeof updateDish>[2] }) =>
      updateDish(menuId, dishId, data),
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', menuId] })
    },
  })
}

export function useDeleteMenuDish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ menuId, dishId }: { menuId: string; dishId: string }) =>
      deleteDish(menuId, dishId),
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', menuId] })
    },
  })
}
