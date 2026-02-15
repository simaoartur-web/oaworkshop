/**
 * O+A ARCHITECTS - MAIN JAVASCRIPT
 * CORREÇÕES DE PERFORMANCE E BUGS
 */

document.addEventListener('DOMContentLoaded', function () {
    // ===== VARIÁVEIS GLOBAIS OTIMIZADAS =====
    let lastScrollTop = 0;
    let scrollTimeout;
    let resizeTimeout;
    const SCROLL_THRESHOLD = 100;
    const HEADER_HIDE_THRESHOLD = 50;

    // ===== 1. HEADER SCROLL BEHAVIOR OTIMIZADO =====
    const siteHeader = document.querySelector('.site-header');

    function initHeaderScroll() {
        if (!siteHeader) return;

        let ticking = false;

        // DEBOUNCE OTIMIZADO para performance
        window.addEventListener('scroll', function () {
            // Cancelar timeout anterior
            clearTimeout(scrollTimeout);

            // Usar requestAnimationFrame para performance
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    handleHeaderScroll();
                    ticking = false;
                });
                ticking = true;
            }

            // Timeout extra para garantir
            scrollTimeout = setTimeout(handleHeaderScroll, 66); // ~15fps para scroll
        }, { passive: true }); // Otimização: passive listener

        // Inicializar estado
        updateHeaderState();
    }

    function handleHeaderScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Adicionar classe 'scrolled' quando passar do threshold
        if (currentScroll > SCROLL_THRESHOLD) {
            siteHeader.classList.add('scrolled');

            // Comportamento: hide on scroll down, show on scroll up
            if (currentScroll > lastScrollTop && currentScroll > HEADER_HIDE_THRESHOLD) {
                // Scroll para baixo - esconder header gradualmente
                siteHeader.classList.add('hidden');
                siteHeader.classList.remove('compact');
            } else if (currentScroll < lastScrollTop) {
                // Scroll para cima - mostrar header compacto com destaque
                siteHeader.classList.remove('hidden');
                siteHeader.classList.add('compact');
            }
        } else {
            // No topo da página - header completo e transparente
            siteHeader.classList.remove('scrolled', 'hidden', 'compact');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    function updateHeaderState() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > SCROLL_THRESHOLD) {
            siteHeader.classList.add('scrolled');
            siteHeader.classList.add('compact');
        } else {
            siteHeader.classList.remove('scrolled', 'compact');
        }
    }

    // ===== 2. PRELOADER ANIMATION (CONSTRUÇÃO DO SITE) =====
    function initPreloader() {
        const preloader = document.getElementById('sitePreloader');

        // Se não existir preloader no HTML, criar um
        if (!preloader) {
            createPreloader();
            return;
        }

        // Animar progresso
        const progressBar = preloader.querySelector('.loader-progress-bar');
        if (progressBar) {
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    hidePreloader(preloader);
                } else {
                    width += 2;
                    progressBar.style.width = width + '%';
                }
            }, 20);
        } else {
            // Fallback: esconder após tempo fixo
            setTimeout(() => hidePreloader(preloader), 1000);
        }
    }

    function createPreloader() {
        const preloader = document.createElement('div');
        preloader.id = 'sitePreloader';
        preloader.className = 'site-preloader';
        preloader.innerHTML = `
            <div class="loader-building">
                <h3>O+A Architects</h3>
                <div class="loader-progress">
                    <div class="loader-progress-bar"></div>
                </div>
            </div>
        `;
        document.body.prepend(preloader);

        // Iniciar animação
        initPreloader();
    }

    function hidePreloader(preloader) {
        if (!preloader) return;

        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.add('loaded');

            // Iniciar animações após preloader
            initScrollAnimations();
        }, 500);
    }

    // ===== 3. MENU MOBILE OTIMIZADO =====
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const menuClose = document.querySelector('.menu-close');
        const menuOverlay = document.querySelector('.menu-overlay');
        const menuLinks = document.querySelectorAll('.menu-item');

        if (!menuToggle || !menuOverlay) return;

        // Abrir menu
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            openMobileMenu();
        });

        // Fechar menu
        menuClose.addEventListener('click', closeMobileMenu);

        // Fechar menu ao clicar em links
        menuLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                setTimeout(closeMobileMenu, 300);
            });
        });

        // Fechar menu ao clicar fora
        menuOverlay.addEventListener('click', function (e) {
            if (e.target === menuOverlay) {
                closeMobileMenu();
            }
        });

        // Fechar menu com ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        function openMobileMenu() {
            menuOverlay.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';

            // Animar itens do menu com delay otimizado
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, 100 + (index * 80));
            });
        }

        function closeMobileMenu() {
            menuOverlay.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    // ===== 4. SMOOTH SCROLL OTIMIZADO =====
    function initSmoothScroll() {
        // Links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');

                // Ignorar links vazios ou que não são IDs
                if (targetId === '#' || !targetId.startsWith('#')) return;

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    // Calcular posição considerando header fixo
                    const headerHeight = siteHeader ? siteHeader.offsetHeight : 80;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    // Scroll suave com polyfill para browsers antigos
                    if ('scrollBehavior' in document.documentElement.style) {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        // Fallback para browsers antigos
                        smoothScrollTo(targetPosition, 500);
                    }

                    // Atualizar URL
                    history.pushState(null, null, targetId);
                }
            });
        });

        // Função fallback para smooth scroll
        function smoothScrollTo(targetPosition, duration) {
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function easeInOutQuad(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        }
    }

    // ===== 5. FILTROS DE PROJETOS CORRIGIDOS =====
    function initProjectFilters() {
        const filterForm = document.querySelector('.projects-filters');
        const applyBtn = document.querySelector('.apply-filters');
        const resetBtn = document.querySelector('.reset-filters');
        const filterSelects = document.querySelectorAll('.filter-select');

        if (!filterForm) return;

        // CORREÇÃO: Remover position: sticky via JS se necessário
        // Mas primeiro vamos corrigir o CSS depois

        // Aplicar filtros
        if (applyBtn) {
            applyBtn.addEventListener('click', function (e) {
                e.preventDefault();
                applyFilters();
            });
        }

        // Resetar filtros
        if (resetBtn) {
            resetBtn.addEventListener('click', function (e) {
                e.preventDefault();
                resetFilters();
            });
        }

        // Função para aplicar filtros
        function applyFilters() {
            const filters = {};

            filterSelects.forEach(select => {
                const name = select.getAttribute('data-filter') || select.name || select.id;
                filters[name] = select.value;
            });

            console.log('Filtros aplicados:', filters);
            showFilterFeedback('Filtros aplicados');
            simulateFiltering(filters);
        }

        function resetFilters() {
            filterSelects.forEach(select => {
                select.value = '';
                select.selectedIndex = 0;
            });

            const projects = document.querySelectorAll('.project-item');
            projects.forEach(project => {
                project.style.display = 'block';
                project.style.opacity = '1';
                project.style.transform = 'scale(1)';
            });

            showFilterFeedback('Filtros resetados');
        }

        function simulateFiltering(filters) {
            const projects = document.querySelectorAll('.project-item');
            let visibleCount = 0;

            projects.forEach(project => {
                const projectCategory = project.getAttribute('data-category') || '';
                const projectType = project.getAttribute('data-typology') || '';
                const projectLocation = project.getAttribute('data-location') || '';
                const projectStatus = project.getAttribute('data-status') || '';

                let shouldShow = true;

                // Lógica de filtro
                if (filters.category && filters.category !== '' && projectCategory !== filters.category) {
                    shouldShow = false;
                }
                if (filters.typology && filters.typology !== '' && projectType !== filters.typology) {
                    shouldShow = false;
                }
                if (filters.location && filters.location !== '' && projectLocation !== filters.location) {
                    shouldShow = false;
                }
                if (filters.status && filters.status !== '' && projectStatus !== filters.status) {
                    shouldShow = false;
                }

                // Animar transição
                if (shouldShow) {
                    project.style.display = 'block';
                    setTimeout(() => {
                        project.style.opacity = '1';
                        project.style.transform = 'scale(1)';
                    }, 10);
                    visibleCount++;
                } else {
                    project.style.opacity = '0';
                    project.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        project.style.display = 'none';
                    }, 300);
                }
            });

            // Mensagem de nenhum resultado
            if (visibleCount === 0) {
                showNoResultsMessage();
            } else {
                hideNoResultsMessage();
            }
        }

        function showFilterFeedback(message) {
            const existingFeedback = document.querySelector('.filter-feedback');
            if (existingFeedback) existingFeedback.remove();

            const feedback = document.createElement('div');
            feedback.className = 'filter-feedback';
            feedback.textContent = message;

            // Estilos inline (evita CSS externo)
            Object.assign(feedback.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(26, 26, 26, 0.95)',
                color: '#f5f5f5',
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                zIndex: '1000',
                fontSize: '0.875rem',
                animation: 'slideIn 0.3s ease-out'
            });

            document.body.appendChild(feedback);

            setTimeout(() => {
                feedback.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => feedback.remove(), 300);
            }, 3000);
        }

        function showNoResultsMessage() {
            const projectsGrid = document.querySelector('.projects-grid');
            if (!projectsGrid) return;

            let message = projectsGrid.querySelector('.no-results-message');
            if (!message) {
                message = document.createElement('div');
                message.className = 'no-results-message';
                message.innerHTML = `
                    <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
                        <h3 style="color: #f5f5f5; margin-bottom: 1rem;">Nenhum projeto encontrado</h3>
                        <p style="color: #666666;">Tente ajustar os filtros para ver mais resultados.</p>
                    </div>
                `;
                projectsGrid.appendChild(message);
            }
        }

        function hideNoResultsMessage() {
            const message = document.querySelector('.no-results-message');
            if (message) message.remove();
        }
    }

    // ===== 6. FORMULÁRIO DE CONTATO OTIMIZADO =====
    function initContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

        // Validação em tempo real
        contactForm.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });

            input.addEventListener('input', function () {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorSpan = this.parentElement.querySelector('.form-error');
                    if (errorSpan) errorSpan.remove();
                }
            });
        });

        // Submissão do formulário
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (validateForm()) {
                submitForm();
            }
        });

        function validateField(field) {
            const value = field.value.trim();
            let errorSpan = field.parentElement.querySelector('.form-error');

            // Limpar erro anterior
            if (errorSpan) errorSpan.remove();
            field.classList.remove('error', 'success');

            // Validações
            if (field.type === 'email' && value && !isValidEmail(value)) {
                showError(field, 'Por favor, insira um email válido');
                return false;
            }

            if (field.required && !value) {
                const fieldName = field.getAttribute('name') || 'este campo';
                showError(field, `Por favor, preencha ${fieldName}`);
                return false;
            }

            // Sucesso
            field.classList.add('success');
            return true;
        }

        function validateForm() {
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        function showError(field, message) {
            field.classList.add('error');

            const errorSpan = document.createElement('span');
            errorSpan.className = 'form-error';
            errorSpan.textContent = message;
            errorSpan.style.cssText = 'color: #f87171; font-size: 0.75rem; margin-top: 0.25rem; display: block;';

            field.parentElement.appendChild(errorSpan);
            field.focus();
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function submitForm() {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Estado de carregamento
            submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise" style="animation: spin 1s linear infinite;"></i> Enviando...';
            submitBtn.disabled = true;

            // Simular envio
            setTimeout(() => {
                // Sucesso
                submitBtn.innerHTML = '<i class="bi bi-check-lg"></i> Mensagem Enviada!';
                submitBtn.style.backgroundColor = '#4ade80';
                submitBtn.style.borderColor = '#4ade80';

                // Resetar formulário
                contactForm.reset();
                contactForm.querySelectorAll('.success').forEach(el => {
                    el.classList.remove('success');
                });

                // Toast de sucesso
                showToast('Mensagem enviada com sucesso! Responderemos em breve.');

                // Resetar botão
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                }, 3000);
            }, 2000);
        }
    }

    // ===== 7. TOAST NOTIFICATIONS OTIMIZADAS =====
    function initToast() {
        window.showToast = function (message, type = 'success') {
            const existingToast = document.querySelector('.toast-notification');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;
            toast.textContent = message;

            // Adicionar ícone correto (Bootstrap Icons)
            const icon = document.createElement('i');
            icon.className = type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle';
            toast.prepend(icon);

            // Estilos inline
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                background: type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                zIndex: '9999',
                fontSize: '0.875rem',
                animation: 'slideIn 0.3s ease-out',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                maxWidth: '320px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            });

            document.body.appendChild(toast);

            // Remover após tempo
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        };

        // Adicionar animação de spin se não existir
        if (!document.querySelector('#spin-animation')) {
            const style = document.createElement('style');
            style.id = 'spin-animation';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===== 8. ANIMAÇÕES ON SCROLL OTIMIZADAS =====
    function initScrollAnimations() {
        // Observer com threshold baixo para melhor performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated', 'visible');
                    observer.unobserve(entry.target); // Parar de observar após animar
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });

        // Observar apenas elementos visíveis
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // ===== 9. CURRENT YEAR IN FOOTER =====
    function initCurrentYear() {
        const yearElement = document.querySelector('#currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ===== 10. PERFORMANCE OPTIMIZATIONS =====
    function initPerformanceOptimizations() {
        // Lazy loading otimizado
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }

        // Otimizar para mobile
        function optimizeForMobile() {
            if (window.innerWidth <= 768) {
                document.body.classList.add('mobile-optimized');
                // Reduzir efeitos no mobile
                if (siteHeader) {
                    siteHeader.style.backdropFilter = 'blur(4px)';
                }
            } else {
                document.body.classList.remove('mobile-optimized');
            }
        }

        optimizeForMobile();
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(optimizeForMobile, 250);
        });

        // Remover listeners em elements removidos
        function cleanupEventListeners() {
            // Esta função pode ser expandida conforme necessário
        }

        // Performance: usar passive listeners onde possível
        document.addEventListener('touchstart', function () { }, { passive: true });
        document.addEventListener('touchmove', function () { }, { passive: true });
    }

    // ===== 11. INITIALIZE EVERYTHING OTIMIZADO =====
    function init() {
        console.log('O+A Architects - Initializing with optimizations...');

        // 1. Primeiro o preloader/animação de construção
        initPreloader();

        // 2. Inicializar otimizações de performance
        initPerformanceOptimizations();

        // 3. Inicializar funcionalidades principais
        initHeaderScroll();
        initMobileMenu();
        initSmoothScroll();
        initProjectFilters();
        initContactForm();
        initToast();
        initCurrentYear();

        // 4. Animações on scroll serão iniciadas após preloader
        // (já chamado em hidePreloader)

        // 5. Adicionar classe loaded ao body
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }

    // ===== 12. INICIALIZAR TUDO =====
    // Aguardar DOM e recursos críticos
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM já carregado
        setTimeout(init, 100);
    }

    // ===== 13. RESIZE HANDLER OTIMIZADO =====
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateHeaderState();
        }, 150);
    }, { passive: true });

    // ===== 14. CLEANUP ON PAGE HIDE =====
    window.addEventListener('pagehide', function () {
        // Limpar timeouts para evitar memory leaks
        clearTimeout(scrollTimeout);
        clearTimeout(resizeTimeout);
    });
});