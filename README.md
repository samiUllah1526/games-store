# Game Dashboard

A game dashboard built with Astro, React, and Supabase authentication.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🔐 Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your credentials from the Supabase dashboard (Settings > API):
   - **Project URL** - Your Supabase project URL
   - **Publishable key** (also called "anon key") - This is safe to use in client-side code
   - **Secret key** (service role key) - ⚠️ **DO NOT use this in client-side code** - Only for server-side operations
3. Create a `.env` file in the root directory with the following:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here
```

**Important:** Use your **Publishable key** (not the Secret key) for `PUBLIC_SUPABASE_ANON_KEY`. The Secret key should never be exposed in client-side code as it has admin privileges.

4. Make sure email authentication is enabled in your Supabase project (Authentication > Providers > Email)

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `yarn install`            | Installs dependencies                            |
| `yarn dev`                | Starts local dev server at `localhost:4321`      |
| `yarn build`              | Build your production site to `./dist/`          |
| `yarn preview`            | Preview your build locally, before deploying     |
| `yarn astro ...`          | Run CLI commands like `astro add`, `astro check` |
| `yarn astro -- --help`    | Get help using the Astro CLI                     |

## 🔑 Authentication

The project includes:
- **Sign Up** page at `/signup`
- **Sign In** page at `/signin`
- Auth status component on the home page
- Auth context provider for managing authentication state

All authentication is handled through Supabase Auth.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
