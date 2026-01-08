---
description: How to save to GitHub and deploy to the web
---

### 1. Initialize Git and Commit
I can do this part for you! Run the following in our chat:
`Initialize git and make the first commit`

### 2. Create a GitHub Repository
1. Go to [GitHub](https://github.com/new).
2. Name it `RacknRest`.
3. Leave it Public.
4. Do **NOT** initialize with a README, license, or gitignore (we already have them).
5. Click **Create repository**.

### 3. Connect Local Code to GitHub
Copy the commands from the "**…or push an existing repository from the command line**" section on GitHub. It will look like this:
```bash
git remote add origin https://github.com/YOUR_USERNAME/RacknRest.git
git branch -M main
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your real GitHub username)*

### 4. Deploy to GitHub Pages
Once pushed, the easiest way to deploy a Vite app is via **GitHub Pages**:
1. In your GitHub repo, go to **Settings** > **Pages**.
2. Under **Build and deployment**, set **Source** to `GitHub Actions`.
3. Search for the `Static HTML` or `Vite` template (I can help you set up the specific Action file if needed).

Alternatively, you can use **Netlify**:
1. Go to [Netlify](https://app.netlify.com/start).
2. Connect your GitHub account.
3. Select the `RacknRest` repository.
4. Click **Deploy RacknRest**.
5. It will give you a live URL in seconds!
