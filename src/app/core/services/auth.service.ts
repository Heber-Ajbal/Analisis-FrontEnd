import { Injectable } from '@angular/core';

export type Role = 'cliente' | 'admin_empresa';
export type Tipo = 'cliente' | 'empresa';
export interface User { email:string; role:Role; type:Tipo; approved?:boolean; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'app:user';
  private db: User[] = [
    { email:'cliente@demo.com', role:'cliente',       type:'cliente', approved:true },
    { email:'admin@empresa.com', role:'admin_empresa', type:'empresa', approved:true },
    { email:'pendiente@empresa.com', role:'admin_empresa', type:'empresa', approved:false },
  ];
  get user():User|null { const r=localStorage.getItem(this.key); return r? JSON.parse(r) as User:null; }
  set user(u:User|null){ if(u) localStorage.setItem(this.key, JSON.stringify(u)); else localStorage.removeItem(this.key); }
  login(email:string, pass:string):'ok'|'needs_review'{
    const u=this.db.find(x=>x.email===email); if(!u) throw new Error('Credenciales inválidas');
    this.user=u; return (u.type==='empresa' && !u.approved)?'needs_review':'ok';
  }
  logout(){ this.user=null; }
  isLoggedIn(){ return !!this.user; }
  isAdmin(){ return this.user?.role==='admin_empresa'; }
  isApproved(){ return !!this.user?.approved; }
}
