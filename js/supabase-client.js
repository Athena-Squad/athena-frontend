// Importação direta da biblioteca do Supabase via CDN (ES Module)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Substitua pelas credenciais que estão na sua pasta 05 do Drive
const supabaseUrl = 'https://abvegrnwnhvpbdbeyvzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidmVncm53bmh2cGJkYmV5dnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTczMzAsImV4cCI6MjA5ODY3MzMzMH0.Jv3OGvsutS9zb18mZ8_8uClZAz3NKs_VArfY8cJKkRA';

// Cria e exporta a instância de conexão
export const supabase = createClient(supabaseUrl, supabaseKey);