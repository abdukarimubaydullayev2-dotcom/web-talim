import {sqliteTable,text,integer,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const accounts=sqliteTable('accounts',{
 id:text('id').primaryKey(),login:text('login').notNull(),firstName:text('first_name').notNull(),lastName:text('last_name').notNull(),
 role:text('role',{enum:['student','teacher']}).notNull(),regionId:text('region_id').notNull(),districtId:text('district_id').notNull(),collegeId:text('college_id').notNull(),
 groupName:text('group_name'),groupKey:text('group_key'),passwordHash:text('password_hash').notNull(),salt:text('salt').notNull(),iterations:integer('iterations').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('accounts_login_unique').on(t.login),index('accounts_group_lookup').on(t.collegeId,t.groupKey)]);
export const sessions=sqliteTable('auth_sessions',{tokenHash:text('token_hash').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),expiresAt:integer('expires_at').notNull()});
export const rateLimits=sqliteTable('auth_rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),resetAt:integer('reset_at').notNull()});
