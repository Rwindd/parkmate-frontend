# ParkMate — Complete Deployment Guide
# From zero to live. Step by step. No experience needed.
# ═══════════════════════════════════════════════════════

## What you'll have at the end:

    parkmate.netlify.app        ← frontend (what users open)
    parkmate-backend.onrender.com ← backend (engine)
    db.xxxxx.supabase.co        ← database (stores everything)

    Cost: ₹0. All free.


## ═══════════════════════════════════════════════════════
## PART 1 — ORGANISE YOUR FOLDERS
## ═══════════════════════════════════════════════════════

On your PC, create this structure:

    parkmate/                   ← ONE master folder
      ├── frontend/             ← copy your React code here
      │     ├── src/
      │     ├── public/
      │     ├── package.json
      │     └── .env.production ← you'll edit this later
      ├── backend/              ← copy your Spring Boot code here
      │     ├── src/
      │     ├── pom.xml
      │     └── ...
      ├── netlify.toml          ← already written for you
      ├── render.yaml           ← already written for you
      └── .gitignore            ← already written for you

Steps:
1. Create a folder called "parkmate" on your Desktop
2. Inside it, create "frontend" folder and "backend" folder
3. Copy all your React files into "frontend/"
4. Copy all your Spring Boot files into "backend/"
5. Copy netlify.toml, render.yaml, .gitignore into the root "parkmate/" folder


## ═══════════════════════════════════════════════════════
## PART 2 — GITHUB (push your code online)
## ═══════════════════════════════════════════════════════

### 2a. Create GitHub account
1. Go to github.com
2. Sign up (free)
3. Verify your email

### 2b. Install Git on your PC
- Windows: download from https://git-scm.com → install → restart PC
- Check it works: open Command Prompt → type: git --version
  (should show something like "git version 2.43.0")

### 2c. Create a new repo on GitHub
1. Go to github.com → click the green "New" button
2. Name it: parkmate
3. Keep it Public (or Private, both work)
4. Do NOT tick "Add README" — leave everything unchecked
5. Click "Create repository"
6. GitHub shows you a URL like: https://github.com/YOUR_USERNAME/parkmate.git
   → COPY this URL

### 2d. Push your code
Open Command Prompt, run these commands one by one:

    cd Desktop/parkmate

    git init
    git add .
    git commit -m "first commit — ParkMate"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/parkmate.git
    git push -u origin main

Done! Your code is now on GitHub.
Refresh github.com/YOUR_USERNAME/parkmate — you'll see all your files.


## ═══════════════════════════════════════════════════════
## PART 3 — SUPABASE (your database)
## ═══════════════════════════════════════════════════════

### 3a. Create Supabase account
1. Go to supabase.com
2. Sign up with GitHub (easier — uses your GitHub account)

### 3b. Create a project
1. Click "New project"
2. Name: parkmate
3. Database password: create a strong one, SAVE IT SOMEWHERE (e.g. Notepad)
4. Region: pick "Southeast Asia (Singapore)" — closest to Chennai
5. Click "Create new project"
6. Wait 2–3 minutes for it to spin up

### 3c. Get your connection details
1. In Supabase dashboard → click "Settings" (gear icon, left sidebar)
2. Click "Database"
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string — looks like:
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres
6. Save this — you'll need it in the next step


## ═══════════════════════════════════════════════════════
## PART 4 — UPDATE BACKEND CONFIG (point to Supabase)
## ═══════════════════════════════════════════════════════

Open: backend/src/main/resources/application.properties

Find the H2 section and COMMENT IT OUT (add # at the start of each line):

    # spring.datasource.url=jdbc:h2:mem:parkmatedb
    # spring.datasource.driver-class-name=org.h2.Driver
    # spring.h2.console.enabled=true
    # spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

Find the PostgreSQL section and UNCOMMENT IT (remove # from each line):

    spring.datasource.url=${DB_URL}
    spring.datasource.username=${DB_USER}
    spring.datasource.password=${DB_PASS}
    spring.datasource.driver-class-name=org.postgresql.Driver
    spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
    spring.jpa.hibernate.ddl-auto=validate
    spring.flyway.enabled=true
    spring.flyway.locations=classpath:db/migration

Save the file.

Now push this change to GitHub:

    cd Desktop/parkmate
    git add .
    git commit -m "switch to PostgreSQL"
    git push


## ═══════════════════════════════════════════════════════
## PART 5 — RENDER (deploy your Spring Boot backend)
## ═══════════════════════════════════════════════════════

### 5a. Create Render account
1. Go to render.com
2. Sign up with GitHub (easier)

### 5b. Create a Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub → select your "parkmate" repo
3. Fill in the settings:
   - Name: parkmate-backend
   - Root Directory: backend
   - Runtime: Java
   - Build Command: ./mvnw clean package -DskipTests
   - Start Command: java -jar target/parkmate-backend-*.jar
   - Plan: Free

### 5c. Add environment variables
Click "Advanced" → then "Add Environment Variable" for each:

    Key: DB_URL
    Value: (paste your Supabase URI from Part 3)

    Key: DB_USER
    Value: postgres

    Key: DB_PASS
    Value: (your Supabase database password)

    Key: JWT_SECRET
    Value: (any long random string, e.g. "parkmate-super-secret-jwt-key-olympia-2024-xyz")

    Key: SPRING_PROFILES_ACTIVE
    Value: prod

### 5d. Deploy
1. Click "Create Web Service"
2. Render starts building — takes 3–5 minutes first time
3. Watch the logs — you'll see "Started ParkMateApplication in X seconds"
4. Flyway auto-creates all your database tables (you'll see "Migrating schema" in logs)
5. Render gives you a URL like: https://parkmate-backend.onrender.com

TEST IT: open https://parkmate-backend.onrender.com/actuator/health in browser
You should see: {"status":"UP"}  ← means backend is alive!


## ═══════════════════════════════════════════════════════
## PART 6 — UPDATE FRONTEND (point to Render backend)
## ═══════════════════════════════════════════════════════

Open: frontend/.env.production

Change it to your actual Render URL:

    REACT_APP_API_URL=https://parkmate-backend.onrender.com

Save and push:

    cd Desktop/parkmate
    git add .
    git commit -m "point frontend to production backend"
    git push


## ═══════════════════════════════════════════════════════
## PART 7 — NETLIFY (deploy your React frontend)
## ═══════════════════════════════════════════════════════

### 7a. Create Netlify account
1. Go to netlify.com
2. Sign up with GitHub

### 7b. Deploy
1. Click "Add new site" → "Import an existing project"
2. Connect GitHub → select your "parkmate" repo
3. Netlify reads your netlify.toml automatically — it already knows:
   - Base directory: frontend
   - Build command: npm run build
   - Publish directory: build
4. Click "Deploy site"
5. Wait 2–3 minutes

Netlify gives you a URL like: https://parkmate-abc123.netlify.app

### 7c. (Optional) Custom domain
1. In Netlify → "Domain settings"
2. You can change the subdomain to: parkmate.netlify.app
3. Or buy a cheap domain (like parkmate.in for ₹500/year) and connect it

## ═══════════════════════════════════════════════════════
## PART 8 — TEST EVERYTHING END TO END
## ═══════════════════════════════════════════════════════

1. Open https://parkmate.netlify.app on your phone
2. You should see the onboarding page with animations
3. Fill in your name, company, tower, floor → Enter Olympia
4. You should reach Home with all 8 modules
5. Go to Sports → Create an event → fill in details → Post
6. Go back to Sports → you should see your event
7. Open Clockpoint → Check in → chat in the live chat
8. Open another browser tab → open the same URL → Register as a different person
9. That person should see your event, join it, chat with you in Clockpoint

If all that works → 🎉 ParkMate is LIVE!


## ═══════════════════════════════════════════════════════
## SHARING WITH OLYMPIA COLLEAGUES
## ═══════════════════════════════════════════════════════

Send this message in your office WhatsApp group:

"Hey everyone! I built an app for Olympia employees called ParkMate 🏢
Sports teams, lunch groups, gaming, build-together, live chat at Clockpoint
and more — all for us in the park.

👉 https://parkmate.netlify.app

Just open the link, set up your profile in 30 seconds, no login needed.
Completely free, no ads, made by one of us 💙"


## ═══════════════════════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════════════════════

PROBLEM: Render deploy fails
→ Check the logs for the actual error
→ Most common: Java version mismatch
→ Fix: add this to render.yaml under envVars:
     - key: JAVA_VERSION
       value: "17"

PROBLEM: "CORS error" in browser console
→ Your frontend is calling backend but backend blocks it
→ Fix: in backend CorsConfig.java, make sure your Netlify URL is allowed:
     .allowedOrigins("https://parkmate.netlify.app", "http://localhost:3000")

PROBLEM: Render goes to sleep (first request takes 30s)
→ This is normal on free tier — spins down after 15min idle
→ During office hours (9am-6pm) it stays awake because people use it
→ If needed, upgrade to Render Starter ($7/month) for always-on

PROBLEM: Supabase "connection refused"
→ Make sure you used the correct URI format (postgresql:// not postgres://)
→ In Supabase Settings → Database → scroll to "Connection Pooling"
→ Use the "Session mode" URI (port 5432)

PROBLEM: Frontend shows blank page after deploy
→ Check browser console for errors
→ Most common: forgot to update .env.production with Render URL
→ Fix: update .env.production → git push → Netlify auto-redeploys


## ═══════════════════════════════════════════════════════
## SUMMARY OF EVERYTHING
## ═══════════════════════════════════════════════════════

    TOOL          WHAT IT DOES                    COST
    ──────────────────────────────────────────────────
    GitHub        Stores your code online          Free
    Supabase      PostgreSQL database (cloud)      Free (500MB)
    Render        Runs your Spring Boot server     Free
    Netlify       Hosts your React frontend        Free forever
    ──────────────────────────────────────────────────
    TOTAL                                          ₹0

    YOUR STACK
    ──────────────────────────────────────────────────
    Frontend:  React 18 + React Router + Axios
    Backend:   Spring Boot 3 + Java 17
    Database:  PostgreSQL (Supabase)
    Auth:      JWT tokens
    Realtime:  WebSocket (STOMP over SockJS)
    Cache:     Caffeine (in-memory)
