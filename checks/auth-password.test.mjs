import assert from 'node:assert/strict';
import {createPassword,verifyPassword,protectedPassword} from '../auth/service.mjs';
// Production Workers may reject PBKDF2 >100000 even if a newer local runtime permits it.
const original=crypto.subtle.deriveBits.bind(crypto.subtle);crypto.subtle.deriveBits=(algorithm,...rest)=>{if(algorithm.name==='PBKDF2'&&algorithm.iterations>100000)throw new Error('Production PBKDF2 limit');return original(algorithm,...rest);};
const pepper='test-only-pepper-not-production-7394-long';const password='A'.repeat(72)+'different suffix';
const hash=await createPassword(password,pepper);assert(hash.startsWith('$2b$12$'));
assert(await verifyPassword(password,{password_hash:hash},pepper));
assert.equal(await verifyPassword('A'.repeat(72)+'other suffix',{password_hash:hash},pepper),false);
assert.equal(await verifyPassword(password,{password_hash:hash},pepper+'other'),false);
assert.notEqual(hash,await createPassword(password,pepper));
assert.equal((await protectedPassword(password,pepper)).length,64);
await assert.rejects(()=>createPassword(password,''),/CONFIG_MISSING/);
console.log('Bcrypt cost 12 works under production PBKDF2 cap; random salts, full long-password distinction, pepper isolation and missing-config guard passed.');
