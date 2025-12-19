import type { IUserInfo } from "@/stores/useAuth"
import api from "../api/axios"

export interface IUser extends IUserInfo {
  password?: string
}

export const getAllUsers = async (page?: number, limit?:number) => {
  return api.get('users', {
    params: {
      page,
      limit
    }
  })
}
export const createUser = async (user: IUser) => {
  const {id, ...payload} = user;
  return api.post('users', {
    ...payload
  })
}
export const deleteUser = async (id: string | undefined) => {
  if(!id) return;
  return api.delete(`users/${id}`)
}
export const getOneUser = async (id: string) => {
  return api.get(`users/${id}`)
}
export const updateUser = async (id: string, user: IUser) => {
  return api.patch(`users/${id}`,{
      ...user
  })
}