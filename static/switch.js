(function() {
    const themeToggle = document.getElementById('theme-toggle');
  
    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
      } else {
        document.documentElement.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
      }
    }
  
    function setTheme(theme) {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
  
    themeToggle.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
      setTheme(currentTheme);
    });
  
    (function() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        applyTheme(savedTheme);
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      }
    })();
  
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  })();