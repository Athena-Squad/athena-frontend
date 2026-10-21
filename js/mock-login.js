console.log("1. Arquivo mock-login.js carregado com sucesso!");

document.addEventListener("DOMContentLoaded", () => {
    
    // Configura o Toggle (Professor/Aluno)
    const toggleButtons = document.querySelectorAll('.toggle button');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggleButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            console.log("2. Tipo de usuário alterado para:", e.target.innerText);
        });
    });

    // Configura o formulário
    const formLogin = document.getElementById('form-login');
    
    if (!formLogin) {
        console.error("ERRO CRÍTICO: O formulário com id 'form-login' não foi encontrado no seu index.html. Verifique a tag <form>.");
        return; // Para a execução aqui se não achar o formulário
    }

    console.log("3. Formulário encontrado! Aguardando o clique...");

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault(); // Bloqueia o recarregamento da página
        console.log("4. Botão clicado! O recarregamento padrão foi bloqueado.");

        const tipoUsuario = document.querySelector('.toggle button.active').innerText.trim().toLowerCase();
        console.log("5. Redirecionando para a rota de:", tipoUsuario);
        
        const btnSubmit = formLogin.querySelector('.submit');
        btnSubmit.innerText = "Autenticando...";
        btnSubmit.style.opacity = "0.7";

        setTimeout(() => {
            if (tipoUsuario === 'professor') {
                window.location.href = './pages/base-alunos.html'; 
            } else if (tipoUsuario === 'aluno') {
                window.location.href = './pages/painel-aluno.html';
            }
        }, 800);
    });
});