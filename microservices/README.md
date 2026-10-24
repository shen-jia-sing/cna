# Microservices – Registration & Authentication

| Service | Folder | Port | Endpoint |
|---|---|---|---|
| Registration | `registration-service` | 3001 | `POST /register` |
| Authentication (Login) | `auth-service` | 3002 | `POST /login` |

Both use Express + Mongoose, share the same `userSchema.js` and `dbConnect.js`, and read config from `.env`.
Passwords are hashed with bcrypt; login returns a JWT signed with `JWT_SECRET`.

---

## 8. Test locally with Postman

Run each service in its own terminal:

```bash
cd registration-service && npm install && npm start
cd auth-service && npm install && npm start
```

Both should print `MongoDB connected` and `... running on port ...`.

**Register** – `POST http://localhost:3001/register` → Body → raw → JSON
```json
{ "name": "Kasing", "email": "kasing@example.com", "password": "123456" }
```
Expected `201 User registered successfully`. Sending it again gives `409 Email already registered`.

**Login (valid)** – `POST http://localhost:3002/login`
```json
{ "email": "kasing@example.com", "password": "123456" }
```
Expected `200 Login successful` with a `token`.

**Login (invalid)** – same URL, wrong password → `401 Invalid email or password`.

---

## 9. Push to GitHub

Create an empty repo on GitHub (e.g. `microservices`), then from this folder:

```bash
git init
git add .
git commit -m "Registration and authentication microservices"
git branch -M main
git remote add origin https://github.com/<your-username>/microservices.git
git push -u origin main
```

`.env` and `node_modules` are in `.gitignore`, so they are **not** pushed (your DB password stays private). You recreate `.env` on EC2 in step 11.

---

## 10. Create EC2 instance and install libraries

1. EC2 → Launch instance → **Ubuntu 24.04**, `t2.micro`, create/select a key pair.
2. Security group inbound rules: **SSH 22**, **Custom TCP 3001**, **Custom TCP 3002** (source `0.0.0.0/0`).
3. MongoDB Atlas → **Network Access** → Add IP → `0.0.0.0/0` (or the EC2 public IP), otherwise EC2 cannot reach the DB.
4. Connect (EC2 Instance Connect or SSH) and install Node, npm, git:

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node -v && npm -v && git --version
```

## 11. Pull the code on EC2

```bash
git clone https://github.com/<your-username>/microservices.git
cd microservices
```

Recreate both `.env` files (copy the contents from your local `.env` files):

```bash
nano registration-service/.env   # PORT=3001, MONGO_URI=...
nano auth-service/.env           # PORT=3002, MONGO_URI=..., JWT_SECRET=..., JWT_EXPIRES_IN=1h
```

## 12. Run both services on EC2

```bash
cd ~/microservices/registration-service && npm install
cd ~/microservices/auth-service && npm install
sudo npm install -g pm2
cd ~/microservices/registration-service && pm2 start index.js --name registration
cd ~/microservices/auth-service && pm2 start index.js --name auth
pm2 logs --lines 20     # should show "MongoDB connected" for both
```

(pm2 keeps both running after you close the terminal.)

---

## 13. Test on EC2 with Postman (screenshots with URL)

Use the instance's **Public IPv4 address** (`http`, not `https`).

- **13.1 Register (valid data)** – `POST http://<EC2-PUBLIC-IP>:3001/register` with the JSON from step 8 (use a new email) → `201`.
- **13.2 MongoDB screenshot** – Atlas → Browse Collections → database `awsacademy` → collection `users` → the new document with a hashed password.

## 14. Test Login on EC2

- **14.1 Valid** – `POST http://<EC2-PUBLIC-IP>:3002/login` with correct email/password → `200` + `token`.
- **14.1 Invalid** – same URL, wrong password → `401 Invalid email or password`.
- **14.2 JWT check** – copy the `token` and paste it into <https://jwt.io>. The payload shows `id`, `email`, `iat`, `exp`, proving the JWT was generated.
