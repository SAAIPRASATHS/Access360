import { pgTable, text, integer, boolean, doublePrecision, timestamp, jsonb, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['student', 'admin', 'volunteer']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const moodEnum = pgEnum('mood', ['happy', 'neutral', 'stressed', 'sad']);
export const sosStatusEnum = pgEnum('sos_status', ['active', 'responded', 'handled']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  image: text('image'),
  role: roleEnum('role').default('student').notNull(),
  accessibilityPreferences: jsonb('accessibility_preferences').default({
    highContrast: false,
    fontSize: 'medium',
    dyslexiaFont: false,
    focusMode: false,
    speechEnabled: false,
    language: 'en',
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const crisisReports = pgTable('crisis_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  description: text('description').notNull(),
  severity: severityEnum('severity').notNull(),
  verified: boolean('verified').default(false).notNull(),
  photoUrl: text('photo_url'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const moods = pgTable('moods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  mood: moodEnum('mood').notNull(),
  note: text('note'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  priority: text('priority').default('normal').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const sosAlerts = pgTable('sos_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  status: sosStatusEnum('status').default('active').notNull(),
  urgencyScore: integer('urgency_score'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const incidentTypeEnum = pgEnum('incident_type', ['Flood', 'Heat', 'Safety', 'Other']);
export const incidentStatusEnum = pgEnum('incident_status', ['pending', 'resolved', 'approved']);

export const incidents = pgTable('incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: incidentTypeEnum('type').notNull(),
  description: text('description').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  severity: severityEnum('severity').notNull(),
  status: incidentStatusEnum('status').default('pending').notNull(),
  imageUrl: text('image_url'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const healthLogs = pgTable('health_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  value: text('value').notNull(),
  note: text('note'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
