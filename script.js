/* ==========================================================================
   Birthday Mobile Application JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // UI Elements
  const startOverlay = document.getElementById('startOverlay');
  const celebrationContent = document.getElementById('celebrationContent');
  const startBtn = document.getElementById('startBtn');
  const birthdayAudio = document.getElementById('birthdayAudio');
  const playToggleBtn = document.getElementById('playToggleBtn');
  const playIcon = document.getElementById('playIcon');
  const progressBar = document.getElementById('progressBar');
  const currentTimeText = document.getElementById('currentTimeText');
  const durationText = document.getElementById('durationText');
  const songStatus = document.getElementById('songStatus');
  const candleBtn = document.getElementById('candleBtn');
  const candleBtnText = document.getElementById('candleBtnText');
  const candleFlame = document.getElementById('candleFlame');
  const glowHalo = document.getElementById('glowHalo');
  const confettiReplayBtn = document.getElementById('confettiReplayBtn');
  const moreConfettiBtn = document.getElementById('moreConfettiBtn');
  const spawnBalloonsBtn = document.getElementById('spawnBalloonsBtn');
  const balloonsContainer = document.getElementById('balloonsContainer');
  const visualizerCanvas = document.getElementById('visualizerCanvas');

  // Skip first 3 minutes and 10 seconds (190 seconds)
  const START_OFFSET = 190;
  let isCandleLit = true;

  // ==========================================================================
  // Audio Controller & Visualizer Emitter
  // ==========================================================================

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function getEffectiveDuration() {
    return Math.max(0, (birthdayAudio.duration || 0) - START_OFFSET);
  }

  function getEffectiveCurrentTime() {
    return Math.max(0, (birthdayAudio.currentTime || 0) - START_OFFSET);
  }

  function drawVisualizer() {
    if (!visualizerCanvas) return;
    const ctx = visualizerCanvas.getContext('2d');
    const width = visualizerCanvas.width = visualizerCanvas.clientWidth;
    const height = visualizerCanvas.height = visualizerCanvas.clientHeight;

    requestAnimationFrame(drawVisualizer);
    ctx.clearRect(0, 0, width, height);

    const isPlaying = !birthdayAudio.paused && !birthdayAudio.ended;
    const time = Date.now() * 0.005;
    const barsCount = 28;
    const barWidth = width / barsCount;

    for (let i = 0; i < barsCount; i++) {
      let barHeight;
      if (isPlaying) {
        barHeight = (Math.sin(i * 0.3 + time * 3) * 0.4 + 0.5) * (height * 0.85);
        barHeight += (Math.cos(i * 0.5 - time * 2) * 0.2) * height;
      } else {
        barHeight = 4;
      }

      barHeight = Math.max(3, Math.min(height, barHeight));

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#ff758c');
      gradient.addColorStop(1, '#ffd700');

      ctx.fillStyle = isPlaying ? gradient : 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 3, barHeight);
    }
  }

  // Audio Event Listeners
  birthdayAudio.addEventListener('loadedmetadata', () => {
    durationText.textContent = formatTime(getEffectiveDuration());
  });

  birthdayAudio.addEventListener('play', () => {
    if (birthdayAudio.currentTime < START_OFFSET) {
      birthdayAudio.currentTime = START_OFFSET;
    }
    playIcon.className = 'fa-solid fa-pause';
    songStatus.textContent = 'جاري التشغيل... 🎶';
  });

  birthdayAudio.addEventListener('seeking', () => {
    if (birthdayAudio.currentTime < START_OFFSET) {
      birthdayAudio.currentTime = START_OFFSET;
    }
  });

  birthdayAudio.addEventListener('timeupdate', () => {
    if (birthdayAudio.currentTime < START_OFFSET && !birthdayAudio.paused) {
      birthdayAudio.currentTime = START_OFFSET;
    }

    const effDuration = getEffectiveDuration();
    const effCurrent = getEffectiveCurrentTime();

    if (effDuration > 0) {
      const pct = (effCurrent / effDuration) * 100;
      progressBar.value = Math.min(100, Math.max(0, pct));
      currentTimeText.textContent = formatTime(effCurrent);
      durationText.textContent = formatTime(effDuration);
    }
  });

  birthdayAudio.addEventListener('pause', () => {
    playIcon.className = 'fa-solid fa-play';
    songStatus.textContent = 'متوقف مؤقتاً';
  });

  progressBar.addEventListener('input', (e) => {
    const effDuration = getEffectiveDuration();
    if (effDuration > 0) {
      const seekTime = START_OFFSET + (e.target.value / 100) * effDuration;
      birthdayAudio.currentTime = seekTime;
    }
  });

  playToggleBtn.addEventListener('click', () => {
    if (birthdayAudio.paused) {
      if (birthdayAudio.currentTime < START_OFFSET) {
        birthdayAudio.currentTime = START_OFFSET;
      }
      birthdayAudio.play().catch(err => console.log('Audio play error:', err));
    } else {
      birthdayAudio.pause();
    }
  });

  drawVisualizer();

  // ==========================================================================
  // Celebration Confetti Cannon & Particle Generators
  // ==========================================================================

  function triggerConfettiBurst() {
    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } else {
      createCustomSparkles(40);
    }
  }

  function spawnBalloons(count = 8) {
    const colors = [
      'linear-gradient(135deg, #ff416c, #ff4b2b)',
      'linear-gradient(135deg, #f7b731, #fa8231)',
      'linear-gradient(135deg, #a55eea, #8854d0)',
      'linear-gradient(135deg, #2d98da, #3867d6)',
      'linear-gradient(135deg, #26de81, #20bf6b)'
    ];

    for (let i = 0; i < count; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.style.left = `${Math.random() * 88 + 4}%`;
      balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
      balloon.style.animationDuration = `${6 + Math.random() * 5}s`;
      balloon.style.animationDelay = `${Math.random() * 1.5}s`;

      balloonsContainer.appendChild(balloon);

      setTimeout(() => {
        balloon.remove();
      }, 12000);
    }
  }

  // ==========================================================================
  // Background Canvas Sparkles Emitter
  // ==========================================================================

  const canvas = document.getElementById('effectsCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, isSparkle = false) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.size = Math.random() * 4 + 1;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = Math.random() * -1.5 - 0.5;
      this.color = `hsl(${Math.random() * 60 + 320}, 100%, 75%)`;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.isSparkle = isSparkle;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= 0.006;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createCustomSparkles(count = 20) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(canvas.width / 2, canvas.height / 2, true));
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.3) {
      particles.push(new Particle());
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  startBtn.addEventListener('click', () => {
    // Set start time to 3:10 (190 seconds)
    birthdayAudio.currentTime = START_OFFSET;
    
    const playPromise = birthdayAudio.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        birthdayAudio.currentTime = START_OFFSET;
        playIcon.className = 'fa-solid fa-pause';
        songStatus.textContent = 'جاري التشغيل... 🎶';
      }).catch(err => {
        console.log('Audio autoplay prevented or touch required:', err);
      });
    }

    startOverlay.style.transition = 'opacity 0.4s ease';
    startOverlay.style.opacity = '0';

    setTimeout(() => {
      startOverlay.style.display = 'none';
      celebrationContent.classList.remove('hidden');
      
      triggerConfettiBurst();
      spawnBalloons(12);
    }, 400);
  });

  // Re-trigger buttons
  confettiReplayBtn.addEventListener('click', () => {
    triggerConfettiBurst();
  });

  moreConfettiBtn.addEventListener('click', () => {
    triggerConfettiBurst();
  });

  spawnBalloonsBtn.addEventListener('click', () => {
    spawnBalloons(10);
  });

  // Candle Blow Interaction
  candleBtn.addEventListener('click', () => {
    isCandleLit = !isCandleLit;

    if (isCandleLit) {
      candleFlame.classList.remove('extinguished');
      glowHalo.style.display = 'block';
      candleBtnText.textContent = 'اضغط لإطفاء الشمعة والتمني ✨';
      triggerConfettiBurst();
    } else {
      candleFlame.classList.add('extinguished');
      glowHalo.style.display = 'none';
      candleBtnText.textContent = 'تم إطفاء الشمعة! نتمنى لك أمنية سعيدة 🎉 (اضغط لإشعالها)';
      createCustomSparkles(30);
    }
  });

});
