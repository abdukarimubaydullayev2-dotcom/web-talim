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
export const teachingGroups=sqliteTable('teaching_groups',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),collegeId:text('college_id').notNull(),name:text('name').notNull(),groupKey:text('group_key').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('teacher_group_unique').on(t.ownerId,t.collegeId,t.groupKey)]);
export const rosterImports=sqliteTable('roster_imports',{
 id:text('id').primaryKey(),groupId:text('group_id').notNull().references(()=>teachingGroups.id,{onDelete:'cascade'}),clientId:text('client_id').notNull(),payloadHash:text('payload_hash').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('roster_import_dedupe').on(t.groupId,t.clientId)]);
export const rosterStudents=sqliteTable('roster_students',{
 id:text('id').primaryKey(),groupId:text('group_id').notNull().references(()=>teachingGroups.id,{onDelete:'cascade'}),importId:text('import_id').notNull().references(()=>rosterImports.id,{onDelete:'cascade'}),position:integer('position').notNull(),firstName:text('first_name').notNull(),lastName:text('last_name').notNull(),nameKey:text('name_key').notNull(),login:text('login').notNull(),initialSecret:text('initial_secret'),accountId:text('account_id').references(()=>accounts.id,{onDelete:'set null'}),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('roster_student_name').on(t.groupId,t.nameKey),uniqueIndex('roster_login').on(t.login),uniqueIndex('roster_account').on(t.accountId),index('roster_import_order').on(t.importId,t.position)]);
export const groupExams=sqliteTable('group_exams',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),groupId:text('group_id').notNull().references(()=>teachingGroups.id,{onDelete:'cascade'}),clientId:text('client_id').notNull(),payloadHash:text('payload_hash').notNull(),title:text('title').notNull(),questionCount:integer('question_count').notNull(),bankCount:integer('bank_count').notNull(),bankJson:text('bank_json').notNull(),status:text('status').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('exam_create_dedupe').on(t.ownerId,t.clientId),index('exam_group_date').on(t.groupId,t.createdAt)]);
export const examAttempts=sqliteTable('exam_attempts',{
 id:text('id').primaryKey(),examId:text('exam_id').notNull().references(()=>groupExams.id,{onDelete:'cascade'}),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),variantKey:text('variant_key').notNull(),paperJson:text('paper_json').notNull(),answersJson:text('answers_json').notNull(),revision:integer('revision').notNull().default(0),correct:integer('correct'),percent:integer('percent'),startedAt:integer('started_at').notNull(),submittedAt:integer('submitted_at')
},t=>[uniqueIndex('exam_student_once').on(t.examId,t.accountId),uniqueIndex('exam_unique_question_set').on(t.examId,t.variantKey),index('exam_attempt_account').on(t.accountId)]);
export const teacherResources=sqliteTable('teacher_resources',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),clientId:text('client_id').notNull(),payloadHash:text('payload_hash').notNull(),moduleId:integer('module_id').notNull(),lessonId:integer('lesson_id').notNull(),kind:text('kind').notNull(),title:text('title').notNull(),description:text('description').notNull(),source:text('source').notNull(),url:text('url'),fileName:text('file_name'),contentType:text('content_type'),byteSize:integer('byte_size').notNull().default(0),objectKey:text('object_key'),status:text('status').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[uniqueIndex('resource_create_dedupe').on(t.ownerId,t.clientId),index('resource_owner_lesson').on(t.ownerId,t.moduleId,t.lessonId)]);
