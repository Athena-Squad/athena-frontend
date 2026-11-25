// Importa��o direta da biblioteca do Supabase via CDN (ES Module)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = 'https://abvegrnwnhvpbdbeyvzl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidmVncm53bmh2cGJkYmV5dnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTczMzAsImV4cCI6MjA5ODY3MzMzMH0.Jv3OGvsutS9zb18mZ8_8uClZAz3NKs_VArfY8cJKkRA';

// Cria e exporta a inst�ncia de conex�o
export const supabase = createClient(supabaseUrl, supabaseKey);
