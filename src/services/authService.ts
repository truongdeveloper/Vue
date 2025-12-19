import api from "../api/axios"

export const login = async (email: string, password: string): Promise<{ok: 0 | 1, d: any, error: any}> => {
  return api.post('auth/login', {
    username: email,
    password
  })
}

export const logout = async () => {
  return api.post('auth/logout')
}

export const refreshToken = async (refresh_token: string) => {
  return api.post('auth/refresh-token', {
    refresh_token
  })
}

export const userInfo = async (): Promise<any> => {
  return api.get('auth/me')
}