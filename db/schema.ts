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
export const learningCourses=sqliteTable('learning_courses',{
 mutationToken:text('mutation_token').notNull().default(''),id:text('id').primaryKey(),ownerId:text('owner_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),title:text('title').notNull(),description:text('description').notNull(),revision:integer('revision').notNull().default(1),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[index('learning_course_owner').on(t.ownerId)]);
export const learningChapters=sqliteTable('learning_chapters',{
 id:text('id').primaryKey(),courseId:text('course_id').notNull().references(()=>learningCourses.id,{onDelete:'cascade'}),title:text('title').notNull(),position:integer('position').notNull(),createdAt:integer('created_at').notNull()
},t=>[index('learning_chapter_course').on(t.courseId,t.position)]);
export const learningLessons=sqliteTable('learning_lessons',{
 id:text('id').primaryKey(),chapterId:text('chapter_id').notNull().references(()=>learningChapters.id,{onDelete:'cascade'}),title:text('title').notNull(),kind:text('kind').notNull(),position:integer('position').notNull(),conspect:text('conspect').notNull().default(''),slidesJson:text('slides_json').notNull().default('[]'),qaJson:text('qa_json').notNull().default('[]'),quizJson:text('quiz_json').notNull().default('[]'),quizVersion:text('quiz_version').notNull().default(''),videoUrl:text('video_url').notNull().default(''),published:integer('published').notNull().default(0),revision:integer('revision').notNull().default(1),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[index('learning_lesson_chapter').on(t.chapterId,t.position)]);
export const learningCourseGroups=sqliteTable('learning_course_groups',{
 id:text('id').primaryKey(),courseId:text('course_id').notNull().references(()=>learningCourses.id,{onDelete:'cascade'}),groupId:text('group_id').notNull().references(()=>teachingGroups.id,{onDelete:'cascade'}),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('learning_share_unique').on(t.courseId,t.groupId),index('learning_share_group').on(t.groupId)]);
export const learningAttempts=sqliteTable('learning_attempts',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),lessonId:text('lesson_id').notNull().references(()=>learningLessons.id,{onDelete:'cascade'}),clientId:text('client_id').notNull(),version:text('version').notNull(),answersJson:text('answers_json').notNull(),quizJson:text('quiz_json').notNull(),correct:integer('correct').notNull(),total:integer('total').notNull(),percent:integer('percent').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('learning_attempt_dedupe').on(t.accountId,t.clientId),index('learning_attempt_topic').on(t.accountId,t.lessonId,t.createdAt)]);
export const learningEvents=sqliteTable('learning_events',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),lessonId:text('lesson_id').notNull().references(()=>learningLessons.id,{onDelete:'cascade'}),openedAt:integer('opened_at').notNull()
},t=>[uniqueIndex('learning_last_open').on(t.accountId,t.lessonId)]);
export const learningTasks=sqliteTable('learning_tasks',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),groupId:text('group_id').notNull().references(()=>teachingGroups.id,{onDelete:'cascade'}),moduleId:integer('module_id'),builtinLessonId:integer('builtin_lesson_id'),lessonId:text('lesson_id').references(()=>learningLessons.id,{onDelete:'cascade'}),title:text('title').notNull(),instructions:text('instructions').notNull(),dueAt:integer('due_at'),createdAt:integer('created_at').notNull()
},t=>[index('learning_task_group').on(t.groupId,t.createdAt)]);
export const learningSubmissions=sqliteTable('learning_submissions',{
 id:text('id').primaryKey(),taskId:text('task_id').notNull().references(()=>learningTasks.id,{onDelete:'cascade'}),accountId:text('account_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),text:text('text').notNull().default(''),state:text('state').notNull().default('draft'),revision:integer('revision').notNull().default(1),submittedAt:integer('submitted_at'),grade:integer('grade'),feedback:text('feedback').notNull().default(''),gradedAt:integer('graded_at'),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('learning_submission_student').on(t.taskId,t.accountId),index('learning_submission_account').on(t.accountId)]);
export const learningFiles=sqliteTable('learning_files',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),lessonId:text('lesson_id').references(()=>learningLessons.id,{onDelete:'cascade'}),submissionId:text('submission_id').references(()=>learningSubmissions.id,{onDelete:'cascade'}),kind:text('kind').notNull(),fileName:text('file_name').notNull(),contentType:text('content_type').notNull(),byteSize:integer('byte_size').notNull(),objectKey:text('object_key'),status:text('status').notNull().default('pending'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[index('learning_file_owner').on(t.ownerId),index('learning_file_lesson').on(t.lessonId),index('learning_file_submission').on(t.submissionId)]);
export const learningReviews=sqliteTable('learning_reviews',{
 id:text('id').primaryKey(),submissionId:text('submission_id').notNull().references(()=>learningSubmissions.id,{onDelete:'cascade'}),reviewerId:text('reviewer_id').notNull().references(()=>accounts.id,{onDelete:'cascade'}),submissionRevision:integer('submission_revision').notNull(),action:text('action').notNull(),grade:integer('grade'),feedback:text('feedback').notNull(),createdAt:integer('created_at').notNull()
},t=>[index('learning_review_submission').on(t.submissionId,t.createdAt)]);
