export const isAdmin=(user,env)=>!!user&&String(env.ADMIN_ACCOUNT_IDS||'').split(',').map(x=>x.trim()).filter(Boolean).includes(user.id);
