document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('nav-menu');
  const closeMenuBtn = document.getElementById('close-menu');
  const body = document.body;

  function toggleMenu() {
      navMenu.classList.toggle('active');
      burger.classList.toggle('active');
      if (navMenu.classList.contains('active')) {
          body.classList.add('no-scroll');
      } else {
          body.classList.remove('no-scroll');
      }
  }

  function closeMenu() {
      navMenu.classList.remove('active');
      burger.classList.remove('active');
      body.classList.remove('no-scroll');
  }

  if (burger && navMenu) {
      burger.addEventListener('click', toggleMenu);
  }
  if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', closeMenu);
  }

  const navLinks = document.querySelectorAll('[data-nav-link]');
  navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          closeMenu();
      });
  });

  window.addEventListener('resize', function() {
      if (window.innerWidth >= 768) {
          closeMenu();
      }
  });

  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) {
      ctaButton.addEventListener('click', function() {
          ctaButton.disabled = true;
          const originalText = ctaButton.textContent;
          ctaButton.textContent = 'Обробка...';
          ctaButton.style.transform = 'scale(0.95)';
          setTimeout(() => {
              ctaButton.textContent = 'Відправлено! ✓';
              ctaButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
              setTimeout(() => {
                  ctaButton.textContent = originalText;
                  ctaButton.disabled = false;
                  ctaButton.style.transform = 'scale(1)';
                  ctaButton.style.background = 'linear-gradient(135deg, #ffa500, #ff6b35)';
              }, 2000);
          }, 2000);
      });
      ctaButton.addEventListener('mousedown', function() {
          this.style.transform = 'scale(0.95)';
      });
      ctaButton.addEventListener('mouseup', function() {
          if (!this.disabled) {
              this.style.transform = 'scale(1)';
          }
      });
  }

  // Форма зворотного зв’язку
  const feedbackForm = document.getElementById('feedbackForm');
  const formSuccess = document.getElementById('formSuccess');
  if (feedbackForm) {
      feedbackForm.addEventListener('submit', function(e) {
          e.preventDefault();  // блокуємо стандартну відправку
          // Примусова валідація (прапор novalidate вимкнено, але все одно перевіряємо)
          if (!feedbackForm.checkValidity()) {
              // Якщо невалідна – спрацюють стандартні підказки браузера
              feedbackForm.reportValidity();
              return;
          }
          // Імітація відправки
          const submitBtn = feedbackForm.querySelector('.submit-btn');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Відправка...';
          setTimeout(() => {
              // Показуємо повідомлення про успіх
              formSuccess.style.display = 'block';
              feedbackForm.reset();
              submitBtn.disabled = false;
              submitBtn.textContent = 'Надіслати';
              // Через 3 секунди ховаємо повідомлення
              setTimeout(() => {
                  formSuccess.style.display = 'none';
              }, 3000);
          }, 1000);
      });
  }

  // Картки біомів
  const cardsContainer = document.getElementById('cardsContainer');
  const loader = document.getElementById('loader');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let biomesData = [];

  function showLoader(show) {
      if (loader) {
          if (show) {
              loader.classList.remove('hidden');
          } else {
              loader.classList.add('hidden');
          }
      }
  }

  function showError(message) {
      if (cardsContainer) {
          cardsContainer.innerHTML = `
              <div class="error-message-block" style="grid-column: 1/-1;">
                  <h3>⚠️ Помилка завантаження</h3>
                  <p>${message}</p>
                  <p>Будь ласка, спробуйте оновити сторінку пізніше.</p>
              </div>
          `;
      }
  }

  function saveLikesToLocalStorage() {
      const likesMap = {};
      biomesData.forEach(biome => {
          likesMap[biome.id] = biome.likes;
      });
      localStorage.setItem('valheimBiomeLikes', JSON.stringify(likesMap));
  }

  function loadLikesFromLocalStorage() {
      const savedLikes = localStorage.getItem('valheimBiomeLikes');
      if (savedLikes) {
          const likesMap = JSON.parse(savedLikes);
          biomesData.forEach(biome => {
              if (likesMap[biome.id] !== undefined) {
                  biome.likes = likesMap[biome.id];
              }
          });
      }
  }

  function updateLikeDisplay(button, biomeId, count) {
      const likeCountSpan = button.querySelector('.like-count');
      if (likeCountSpan) {
          likeCountSpan.textContent = count;
      }
      if (count > 0) {
          button.classList.add('active');
      } else {
          button.classList.remove('active');
      }
  }

  function renderCards(dataArray) {
      if (!cardsContainer) return;
      cardsContainer.innerHTML = '';
      dataArray.forEach(biome => {
          const cardHTML = `
              <div class="card" data-category="${biome.category}" data-id="${biome.id}">
                  <h3>${escapeHtml(biome.name)}</h3>
                  <p><strong>Складність:</strong> ${'⭐'.repeat(biome.difficulty)}</p>
                  <p>${escapeHtml(biome.description)}</p>
                  <p><strong>Ресурси:</strong> ${biome.resources.join(', ')}</p>
                  <p><strong>Бос:</strong> ${biome.boss !== "Немає" ? biome.boss : '❌ Немає боса'}</p>
                  <button class="like-btn" data-id="${biome.id}">
                      ❤️ <span class="like-count">${biome.likes}</span>
                  </button>
              </div>
          `;
          cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
      });
      attachLikeHandlers();
      const activeFilter = document.querySelector('.filter-btn.active');
      if (activeFilter) {
          const filterValue = activeFilter.getAttribute('data-filter');
          filterCards(filterValue);
      }
  }

  function escapeHtml(str) {
      if (!str) return '';
      return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
  }

  function attachLikeHandlers() {
      const likeButtons = document.querySelectorAll('.like-btn');
      likeButtons.forEach(button => {
          button.removeEventListener('click', handleLikeClick);
          button.addEventListener('click', handleLikeClick);
      });
  }

  function handleLikeClick(e) {
      e.stopPropagation();
      const button = e.currentTarget;
      const biomeId = parseInt(button.getAttribute('data-id'));
      const biome = biomesData.find(b => b.id === biomeId);
      if (biome) {
          if (biome.likes === 0) {
              biome.likes = 1;
              button.classList.add('active');
              button.style.animation = 'none';
              button.offsetHeight;
              button.style.animation = 'heartBeat 0.3s ease';
          } else {
              biome.likes = 0;
              button.classList.remove('active');
          }
          const likeCountSpan = button.querySelector('.like-count');
          if (likeCountSpan) {
              likeCountSpan.textContent = biome.likes;
          }
          saveLikesToLocalStorage();
          setTimeout(() => {
              button.style.animation = '';
          }, 300);
      }
  }

  function filterCards(category) {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (category === 'all' || cardCategory === category) {
              card.classList.remove('hidden');
          } else {
              card.classList.add('hidden');
          }
      });
  }

  async function loadData() {
      showLoader(true);
      try {
          const response = await fetch('data.json');
          if (!response.ok) {
              throw new Error(`HTTP помилка! Статус: ${response.status}`);
          }
          const data = await response.json();
          if (!Array.isArray(data)) {
              throw new Error('Отримані дані не є масивом');
          }
          biomesData = data;
          loadLikesFromLocalStorage();
          renderCards(biomesData);
      } catch (error) {
          console.error('Помилка завантаження даних:', error);
          showError('Вибачте, дані тимчасово недоступні. Спробуйте оновити сторінку.');
      } finally {
          showLoader(false);
      }
  }

  if (filterButtons.length > 0) {
      filterButtons.forEach(button => {
          button.addEventListener('click', function() {
              filterButtons.forEach(btn => btn.classList.remove('active'));
              this.classList.add('active');
              const filterValue = this.getAttribute('data-filter');
              filterCards(filterValue);
          });
          button.addEventListener('mousedown', function() {
              this.style.transform = 'scale(0.95)';
          });
          button.addEventListener('mouseup', function() {
              this.style.transform = 'scale(1)';
          });
          button.addEventListener('mouseleave', function() {
              this.style.transform = 'scale(1)';
          });
      });
  }

  loadData();
});
