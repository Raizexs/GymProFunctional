import { defineStore } from 'pinia'
import api from '@/services/http'
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null, user: null }),
  getters: { isAuthenticated: (s) => !!s.token && !!s.user },
  actions: {
    loadFromStorage(){
      const t = localStorage.getItem('gpf_token'); const u = localStorage.getItem('gpf_user')
      if (t && u){ this.token=t; this.user=JSON.parse(u); api.defaults.headers.common['Authorization'] = `Bearer ${t}` }
    },
    saveSession({ token, user }){
      this.token=token; this.user=user; localStorage.setItem('gpf_token',token); localStorage.setItem('gpf_user',JSON.stringify(user)); api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    async login(email,password){ const { data } = await api.post('/auth/login',{ email,password }); this.saveSession(data) },
    async register(name,email,password){ const { data } = await api.post('/auth/register',{ name,email,password }); this.saveSession(data) },
    logout(){ this.token=null; this.user=null; localStorage.removeItem('gpf_token'); localStorage.removeItem('gpf_user'); delete api.defaults.headers.common['Authorization'] }
  }
})
