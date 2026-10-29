import {sqliteTable,text,integer,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const accounts=sqliteTable('accounts',{
 id:text('id').primaryKey(),login:text('login').notNull(),firstName:text('first_name').notNull(),lastName:text('last_name').notNull(),
 role:text('role',{enum:['student','teacher']}).notNull(),regionId:text('region_id').notNull(),districtId:text('district_id').notNull(),collegeId:text('college_id').notNull(),
 groupName:text('group_name'),groupKey:text('group_key'),passwordHash:text('password_hash').notNull(),salt:text('salt').notNull(),iterations:integer('iterations').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('accounts_login_unique').on(t.login),index('accounts_group_lookup').on(t.collegeId,t.groupKey)]);
export const sessions=sqliteTable('auth_sessions',{tokenHash:text('token_hash').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),expiresAt:integer('expires_at').notNull()});
export const rateLimits=sqliteTable('auth_rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),resetAt:integer('reset_at').notNull()});
export const activityEvents=sqliteTable('activity_events',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),clientId:text('client_id').notNull(),kind:text('kind').notNull(),moduleId:integer('module_id'),lessonId:integer('lesson_id'),lessonTitle:text('lesson_title'),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('activity_dedupe').on(t.accountId,t.clientId),index('activity_date').on(t.createdAt),index('activity_user_lesson').on(t.accountId,t.moduleId,t.lessonId)]);
export const testAttempts=sqliteTable('test_attempts',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),clientId:text('client_id').notNull(),moduleId:integer('module_id').notNull(),lessonId:integer('lesson_id').notNull(),lessonTitle:text('lesson_title').notNull(),assessmentVersion:text('assessment_version').notNull(),answersJson:text('answers_json').notNull(),correct:integer('correct').notNull(),total:integer('total').notNull(),percent:integer('percent').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('attempt_dedupe').on(t.accountId,t.clientId),index('attempt_date').on(t.createdAt),index('attempt_user_lesson').on(t.accountId,t.moduleId,t.lessonId)]);
export const loginEvents=sqliteTable('login_events',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),createdAt:integer('created_at').notNull()
},t=>[index('login_date').on(t.createdAt),index('login_user').on(t.accountId)]);
