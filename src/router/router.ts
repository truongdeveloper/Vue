import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Home from "@/views/Home.vue";
import Register from "@/views/Register.vue";
import { useAuth } from "@/stores/useAuth";
import { toast } from "vue-sonner";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiredAuth: true,
      isAdmin: true
    },
  },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuth();
  if(to.meta.requiredAuth && !auth.isLoggedIn) {
    if(to.meta.isAdmin && auth.isAdmin){
      toast.error("Bạn phải là ADMIN mới có thể vào trang này")
    }
    return "/login"
  }
  return true;
})

