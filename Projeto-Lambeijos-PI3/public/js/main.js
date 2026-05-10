// Funções para controle dos modais
function openModal(modalId, petName = '') {
  const modal = document.getElementById(modalId);
  modal.classList.add('show');

  // Se for o modal de adoção, define o nome do pet
  if (modalId === 'adoptModal' && petName) {
    document.getElementById('pet-name').textContent = petName;
  }

  // Impede a rolagem enquanto o modal estiver aberto
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');

  // Permite a rolagem novamente
  document.body.style.overflow = 'auto';
}

// Fecha o modal ao clicar fora dele
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
};

// Função para renderizar os pets no container
function renderPets(pets) {
  const container = document.getElementById('pets-container');
  container.innerHTML = ''; // Limpa o container

  if (pets.length === 0) {
    container.innerHTML = '<p>Nenhum pet encontrado com os filtros aplicados.</p>';
    return;
  }

  pets.forEach(pet => {
    console.log('Dados do pet:', pet); // Debug para ver os dados do pet
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img">
        <img src="${pet.imageUrl}" alt="${pet.type}" onerror="this.src='/api/placeholder/400/300'">
      </div>
      <div class="card-body">
        <h3 class="card-title">${pet.name}</h3>
        <div>
          <span class="card-tag">${pet.type}</span>
          <span class="card-tag">${pet.breed || 'Sem raça definida'}</span>
          <span class="card-tag">${pet.size}</span>
          <span class="card-tag">${pet.age}</span>
        </div>
        <p class="card-text">${pet.description}</p>
        <div class="card-footer">
          <span>${pet.location}</span>
          <button class="btn btn-primary" onclick="openModal('adoptModal', '${pet.name}')">Adotar</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.search-form');

  // Função para buscar os pets, opcionalmente com query string de filtros
  function fetchPets(queryParams = '') {
    const url = '/api/pets' + queryParams;
    fetch(url)
      .then(response => response.json())
      .then(pets => {
        renderPets(pets);
      })
      .catch(error => console.error('Erro ao carregar os pets:', error));
  }

  // Busca inicial de todos os pets
  fetchPets();

  // Evento submit para o formulário de busca
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Obtém os valores dos filtros
      const animalType = document.getElementById('animal-type').value;
      const breed = document.getElementById('breed').value;
      const size = document.getElementById('size').value;
      const age = document.getElementById('age').value;
      const location = document.getElementById('location').value;

      // Constrói a query string com os filtros
      let query = '?';
      if (animalType) query += `type=${encodeURIComponent(animalType)}&`;
      if (breed) query += `breed=${encodeURIComponent(breed)}&`;
      if (size) query += `size=${encodeURIComponent(size)}&`;
      if (age) query += `age=${encodeURIComponent(age)}&`;
      if (location) query += `location=${encodeURIComponent(location)}&`;

      // Remove o último & ou ? se não houver filtros
      query = query.endsWith('&') ? query.slice(0, -1) : query;
      if (query === '?') query = '';

      // Busca os pets com os filtros aplicados
      fetchPets(query);
    });
  }

  // Configura o envio do formulário de cadastro de pet
  const registerPetForm = document.getElementById('registerPetForm');
  if (registerPetForm) {
    registerPetForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Obtém os valores dos campos do formulário
      const petType = document.getElementById('pet-type').value.trim();
      const petName = document.getElementById('pet-name-register').value.trim();
      const petBreed = document.getElementById('pet-breed').value.trim();
      const petAge = document.getElementById('pet-age').value.trim();
      const petSize = document.getElementById('pet-size').value.trim();
      const petGender = document.getElementById('pet-gender').value.trim();
      const petDescription = document.getElementById('pet-description').value.trim();
      const petLocation = document.getElementById('pet-location').value.trim();
      const petPhoto = document.getElementById('pet-photo').files[0];

      // Validação dos campos
      if (!petType || !petName || !petBreed || !petAge || !petSize || !petGender || !petDescription || !petLocation) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Validação da foto
      if (!petPhoto) {
        alert('Por favor, selecione uma foto do animal.');
        return;
      }

      // Cria um FormData para enviar os dados incluindo a imagem
      const formData = new FormData();
      formData.append('type', petType); // Ajustando os nomes dos campos para corresponder ao backend
      formData.append('name', petName);
      formData.append('breed', petBreed);
      formData.append('age', petAge);
      formData.append('size', petSize);
      formData.append('gender', petGender);
      formData.append('description', petDescription);
      formData.append('location', petLocation);
      formData.append('photo', petPhoto);

      // Log para verificar os dados antes do envio
      console.log("Enviando dados para cadastro de pet com imagem");
      
      // Mostra feedback visual do envio
      const submitButton = registerPetForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';

      // Envia os dados para o endpoint de cadastro de pet
      fetch('/api/registerPet', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro na resposta do servidor');
        }
        return response.json();
      })
      .then(data => {
        console.log("Resposta do servidor:", data);
        if (data.success) {
          alert('Pet cadastrado com sucesso!');
          registerPetForm.reset();
          document.getElementById('preview-img').style.display = 'none';
          closeModal('registerPetModal');
          fetchPets();
        } else {
          throw new Error(data.message || 'Erro ao cadastrar pet');
        }
      })
      .catch(error => {
        console.error('Erro ao cadastrar pet:', error);
        alert('Erro ao cadastrar pet: ' + error.message);
      })
      .finally(() => {
        // Restaura o botão
        submitButton.disabled = false;
        submitButton.textContent = 'Cadastrar animal';
      });
    });
  }

  // Configura o envio do formulário de contato
  const contactForm = document.querySelector('#contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Aqui você pode adicionar a lógica para enviar o e-mail
      // Por enquanto, vamos apenas mostrar uma mensagem de sucesso
      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      contactForm.reset();
    });
  }
});
