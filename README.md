# DevCircuit

DevCircuit helps developers discover tech events, workshops, and hackathons across Kenya. The preview includes event search and filters, saved events, collaboration profiles, and an organizer studio. Preview-created events and saved items persist in the current browser.

## Run locally

```sh
npm install
npm run dev
```

## Connect Supabase

1. Create a Supabase project and run [`supabase-schema.sql`](supabase-schema.sql) in its SQL editor.
2. Copy `.env.example` to `.env.local` and add your project URL and anon key.
3. Add event rows in the Supabase table and set `published` to `true` to show them in DevCircuit.

The anon key is intended for browser use. Row-level security is enabled, and only published events are readable by visitors. Event publishing and collaboration profiles currently run as local browser previews; add organizer authentication before allowing public database writes.
