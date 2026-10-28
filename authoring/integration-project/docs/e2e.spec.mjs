// Ixtiyoriy: README bo‘yicha Playwright o‘rnating va alohida demo serverni oching.
import {test,expect} from '@playwright/test';
test('yangi vazifa ko‘rinadi',async({page})=>{
 const name='E2E-'+Date.now();await page.goto(process.env.BASE_URL||'http://127.0.0.1:3000');
 await page.getByLabel('Vazifa nomi').fill(name);await page.getByRole('button',{name:'Qo‘shish',exact:true}).click();
 await expect(page.getByText(name+' — ochiq',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Tugallash: '+name,exact:true}).click();
 await expect(page.getByText(name+' — tugallangan',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'O‘chirish: '+name,exact:true}).click();
 await expect(page.getByText(name+' — tugallangan',{exact:true})).toHaveCount(0);
});
