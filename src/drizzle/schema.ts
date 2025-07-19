import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  pgEnum,
  json,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

// Enums
export const accountTypeEnum = pgEnum("account_type", [
  "user",
  "admin",
  "trainer",
]);
export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);
export const goalTypeEnum = pgEnum("goal_type", [
  "weight_loss",
  "muscle_gain",
  "endurance",
  "strength",
  "flexibility",
  "general_fitness",
]);
export const unitSystemEnum = pgEnum("unit_system", ["metric", "imperial"]);
export const workoutTypeEnum = pgEnum("workout_type", [
  "strength",
  "cardio",
  "flexibility",
  "hybrid",
]);
export const exerciseCategoryEnum = pgEnum("exercise_category", [
  "upper_body",
  "lower_body",
  "core",
  "full_body",
  "cardio",
  "flexibility",
]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  accountType: accountTypeEnum("account_type").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
  preferredUnitSystem: unitSystemEnum("preferred_unit_system").default(
    "metric"
  ),
  lastLogin: timestamp("last_login"),
});

// Tokens for auth, password reset, etc.
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hash: varchar("hash", { length: 255 }).notNull(),
  expiry: integer("expiry").notNull(), // Unix timestamp
  scope: varchar("scope", { length: 50 }).notNull(), // 'authentication', 'password-reset', etc.
});

// User profiles with health metrics
export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  height: decimal("height", { precision: 5, scale: 2 }), // in cm
  currentWeight: decimal("current_weight", { precision: 5, scale: 2 }), // in kg
  targetWeight: decimal("target_weight", { precision: 5, scale: 2 }), // in kg
  activityLevel: integer("activity_level"), // 1-5 scale
  bio: text("bio"),
  profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weight history tracking
export const weightHistory = pgTable("weight_history", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // in kg
  date: date("date").notNull(),
  notes: text("notes"),
});

// Fitness goals
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  goalType: goalTypeEnum("goal_type").notNull(),
  targetValue: decimal("target_value", { precision: 8, scale: 2 }), // E.g., weight in kg, distance in km
  currentValue: decimal("current_value", { precision: 8, scale: 2 }),
  startDate: date("start_date").notNull(),
  targetDate: date("target_date"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Exercise library
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  category: exerciseCategoryEnum("category").notNull(),
  primaryMuscles: text("primary_muscles").array(), // Array of muscle names
  secondaryMuscles: text("secondary_muscles").array(), // Array of muscle names
  difficulty: integer("difficulty"), // 1-5 scale
  equipment: text("equipment").array(), // Array of equipment names
  videoUrl: varchar("video_url", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  isCustom: boolean("is_custom").default(false).notNull(),
  creatorId: uuid("creator_id").references(() => users.id), // NULL for system exercises
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workouts
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  duration: integer("duration"), // in minutes
  caloriesBurned: integer("calories_burned"),
  date: date("date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  rating: integer("rating"), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workout exercises (junction table)
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), // Sequence in the workout
  sets: integer("sets"),
  targetReps: integer("target_reps"),
  targetDuration: integer("target_duration"), // in seconds (for timed exercises)
  restBetweenSets: integer("rest_between_sets"), // in seconds
  notes: text("notes"),
});

// Exercise sets (actual performance)
export const exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  workoutExerciseId: integer("workout_exercise_id")
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: decimal("weight", { precision: 6, scale: 2 }), // in kg
  reps: integer("reps"),
  duration: integer("duration"), // in seconds (for timed exercises)
  distance: decimal("distance", { precision: 6, scale: 2 }), // in km/miles
  completed: boolean("completed").default(true).notNull(),
  rpe: integer("rpe"), // Rate of Perceived Exertion (1-10)
  notes: text("notes"),
});

// Workout templates
export const workoutTemplates = pgTable("workout_templates", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  difficulty: integer("difficulty"), // 1-5 scale
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template exercises (junction table)
export const templateExercises = pgTable("template_exercises", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id")
    .notNull()
    .references(() => workoutTemplates.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), // Sequence in the template
  sets: integer("sets"),
  targetReps: integer("target_reps"),
  targetDuration: integer("target_duration"), // in seconds (for timed exercises)
  restBetweenSets: integer("rest_between_sets"), // in seconds
  notes: text("notes"),
});

// Nutrition tracking
export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  totalCalories: integer("total_calories"),
  totalProtein: integer("total_protein"), // in grams
  totalCarbs: integer("total_carbs"), // in grams
  totalFat: integer("total_fat"), // in grams
  waterIntake: integer("water_intake"), // in ml
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Meals
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  nutritionLogId: integer("nutrition_log_id")
    .notNull()
    .references(() => nutritionLogs.id, { onDelete: "cascade" }),
  mealType: varchar("meal_type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  name: varchar("name", { length: 100 }).notNull(),
  calories: integer("calories"),
  protein: decimal("protein", { precision: 5, scale: 1 }), // in grams
  carbs: decimal("carbs", { precision: 5, scale: 1 }), // in grams
  fat: decimal("fat", { precision: 5, scale: 1 }), // in grams
  time: timestamp("time"),
  notes: text("notes"),
});

// Progress photos
export const progressPhotos = pgTable("progress_photos", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  photoUrl: varchar("photo_url", { length: 255 }).notNull(),
  date: date("date").notNull(),
  category: varchar("category", { length: 50 }), // front, back, side, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
