
// Supabase Initialisierung
const supabaseUrl = 'https://wsoogvnzettuaqdcyawu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzb29ndm56ZXR0dWFxZGN5YXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYzMTY5MzcsImV4cCI6MjAxMTg5MjkzN30.lnmwjNjkaiZoDcDHQmyjNQX-v5XhvSEcCtdZtptFJ6k'
const supa = supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
        redirectTo: window.location.origin,  // This will redirect back to the page where the request originated from
    },
});

export { supa }