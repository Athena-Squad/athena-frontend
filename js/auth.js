import { supabase } from './supabase-client.js';

async function realizarLogin(email, senha) {
    // Função nativa do Supabase para login com email e senha
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
    });

    if (error) {
        alert("Erro ao fazer login: " + error.message);
        console.error(error);
        return;
    }

    
    console.log("Usuário autenticado:", data.user);
    
    
    window.location.href = 'painel.html'; 
}

document.getElementById('form-login').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email').value;
    const senhaInput = document.getElementById('senha').value;
    
    realizarLogin(emailInput, senhaInput);
});