import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper to verify user from access token
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', userId: null };
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Unauthorized', userId: null };
  }

  return { error: null, userId: user.id };
}

// Health check endpoint
app.get("/make-server-c0325d53/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-c0325d53/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, userId: data.user.id });
  } catch (err: any) {
    console.log('Signup exception:', err);
    return c.json({ error: err.message || 'Internal server error' }, 500);
  }
});

// Save user data endpoint
app.post("/make-server-c0325d53/save-data", async (c) => {
  try {
    const { error, userId } = await verifyUser(c.req.raw);
    if (error || !userId) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const { habits, dailyData, currentStreak } = await c.req.json();

    // Store user data in KV store
    await kv.mset([
      { key: `user:${userId}:habits`, value: habits },
      { key: `user:${userId}:dailyData`, value: dailyData },
      { key: `user:${userId}:currentStreak`, value: currentStreak },
    ]);

    return c.json({ success: true });
  } catch (err: any) {
    console.log('Save data error:', err);
    return c.json({ error: err.message || 'Failed to save data' }, 500);
  }
});

// Load user data endpoint
app.get("/make-server-c0325d53/load-data", async (c) => {
  try {
    const { error, userId } = await verifyUser(c.req.raw);
    if (error || !userId) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    // Load user data from KV store
    const data = await kv.mget([
      `user:${userId}:habits`,
      `user:${userId}:dailyData`,
      `user:${userId}:currentStreak`,
    ]);

    return c.json({
      habits: data[0] || [],
      dailyData: data[1] || {},
      currentStreak: data[2] || 0,
    });
  } catch (err: any) {
    console.log('Load data error:', err);
    return c.json({ error: err.message || 'Failed to load data' }, 500);
  }
});

Deno.serve(app.fetch);