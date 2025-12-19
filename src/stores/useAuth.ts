import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type IUserInfo = {
  fistName: string;
  lastName: string;
  role: string;
  email: string;
  id: string;
};

export const useAuth = defineStore("auth", () => {
  const isReady = ref<Boolean>(false);
  const token = ref<string | null>("");
  const user = ref<IUserInfo | null>();
  const refresh_token = ref<string | null>("");

  const isLoggedIn = computed(
    () => Boolean(token.value) && Boolean(user.value)
  );
  const isAdmin = computed(() => user.value?.role === "ADMIN")

  function login(tokenLoggedIn: string, refresh_token_data: string) {
    token.value = tokenLoggedIn;
    refresh_token.value = refresh_token_data;
    if (typeof window !== undefined) {
      localStorage.setItem("accessToken", tokenLoggedIn);
      localStorage.setItem("refreshToken", refresh_token_data);
    }
  }
  function logout() {
    user.value = null;
    token.value = null;
    if (typeof window !== undefined) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refresh_token')
    }
  }

  function setUser(userData: IUserInfo) {
    console.log(userData)
    if(userData.id) {
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }
  function initAuth() {
    user.value = JSON.parse(localStorage.getItem('user') as string);
    token.value = localStorage.getItem('accessToken');
    refresh_token.value = localStorage.getItem('refresh_token');
    isReady.value = true;
  }
  return {
    isReady,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    setUser,
    initAuth,
    user,
    token
  };
});
