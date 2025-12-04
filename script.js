window.addEventListener("load", () => {
        const tl = gsap.timeline();

        tl.to(".preloader-text", { opacity: 1, y: 0, duration: 1 })
          .to(".preloader-line", { width: "200px", duration: 1 }, "-=0.5")
          .to(".preloader", {
            y: "-100%", 
            duration: 1.2,
            ease: "power4.inOut",
            delay: 0.5,
          })
          .from("header", { y: -50, opacity: 0, duration: 1 }, "-=0.5")
          .to(
            ".hero-content",
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
            "-=0.8"
          );

        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray(".dish-card").forEach((card, i) => {
          gsap.to(card, {
            scrollTrigger: { trigger: card, start: "top 85%" },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: i * 0.1,
          });
        });

        gsap.to(".carousel-container", {
          scrollTrigger: { trigger: ".carousel-section", start: "top 75%" },
          opacity: 1,
          duration: 1.5,
        });
        gsap.utils.toArray(".section-title").forEach((title) => {
          gsap.to(title, {
            scrollTrigger: { trigger: title, start: "top 85%" },
            y: 0,
            opacity: 1,
            duration: 1,
          });
        });
      });

      const cursorDot = document.querySelector("[data-cursor-dot]");
      const cursorOutline = document.querySelector("[data-cursor-outline]");

      window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate(
          { left: `${posX}px`, top: `${posY}px` },
          { duration: 500, fill: "forwards" }
        );
      });

      document
        .querySelectorAll(
          "a, button, input, .carousel-item, .dish-card, .hover-target"
        )
        .forEach((el) => {
          el.addEventListener("mouseenter", () =>
            document.body.classList.add("hovering")
          );
          el.addEventListener("mouseleave", () =>
            document.body.classList.remove("hovering")
          );
        });

      function showToast(message) {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<span class="toast-icon">✦</span> <span>${message}</span>`;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add("active"), 100);
        setTimeout(() => {
          toast.classList.remove("active");
          setTimeout(() => toast.remove(), 400);
        }, 3000);
      }

      let currentUser = null;
      let carouselIndex = 0;

      function getItemsToShow() {
        return window.innerWidth <= 768 ? 1 : 3;
      }

      function nextSlide() {
        const wrapper = document.getElementById("carouselWrapper");
        const items = document.querySelectorAll(".carousel-item");
        const itemsToShow = getItemsToShow();
        const maxIndex = items.length - itemsToShow;
        if (carouselIndex < maxIndex) {
          carouselIndex++;
          updateCarousel();
        }
      }

      function prevSlide() {
        if (carouselIndex > 0) {
          carouselIndex--;
          updateCarousel();
        }
      }

      function updateCarousel() {
        const wrapper = document.getElementById("carouselWrapper");
        const containerWidth = document.querySelector(
          ".carousel-container"
        ).offsetWidth;
        const itemsToShow = getItemsToShow();
        const itemWidth = containerWidth / itemsToShow;
        wrapper.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
      }

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          carouselIndex = 0;
          updateCarousel();
        }, 250);
      });

      async function register() {
        const email = document.getElementById("regEmail").value;
        const username = document.getElementById("regUsername").value;
        const password = document.getElementById("regPassword").value;

        if (!email || !username || !password) {
          showToast("Пожалуйста, заполните все поля");
          return;
        }

        try {
          const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
          });
          const data = await response.json();
          if (data.success) {
            showToast("Регистрация успешна! Теперь войдите.");
            closeRegisterModal();
            document.getElementById("usernameInput").value = username;
          } else {
            showToast("Ошибка: " + data.message);
          }
        } catch (error) {
          showToast("Ошибка соединения с сервером");
        }
      }

      async function login() {
        const username = document.getElementById("usernameInput").value;
        const password = document.getElementById("passwordInput").value;
        if (!username || !password) {
          showToast("Введите логин и пароль");
          return;
        }

        try {
          const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();
          if (data.success) {
            currentUser = data.user;
            updateAuthUI();
            showToast(`Добро пожаловать, ${currentUser.username}!`);
          } else {
            showToast("Ошибка: " + data.message);
          }
        } catch (error) {
          showToast("Ошибка соединения с сервером");
        }
      }

      function updateAuthUI() {
        const authSection = document.getElementById("authSection");
        authSection.innerHTML = `
                <div class="user-info">
                    <span>${currentUser.username}</span>
                    <span class="points">✦ ${currentUser.points}</span>
                    <button onclick="logout()" class="hover-target" style="padding: 5px 15px; font-size: 10px; margin-left: 10px; background: #333;">Выйти</button>
                </div>
            `;
        const newBtn = authSection.querySelector("button");
        newBtn.addEventListener("mouseenter", () =>
          document.body.classList.add("hovering")
        );
        newBtn.addEventListener("mouseleave", () =>
          document.body.classList.remove("hovering")
        );
      }

      function logout() {
        currentUser = null;
        location.reload();
      }
      function showRegisterModal() {
        document.getElementById("registerModal").classList.add("active");
      }
      function closeRegisterModal() {
        document.getElementById("registerModal").classList.remove("active");
      }

      let gameReqAnimation;
      let gameState = "MENU";
      let score = 0;
      let bestScore = 0;
      let rotationSpeed = 0.02;
      let baseRotationSpeed = 0.02;

      const plate = { x: 200, y: 200, radius: 80, rotation: 0 };
      let utensils = [];
      let stuckUtensils = [];
      let particles = [];

      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");

      function initGame() {
        stuckUtensils = [];
        utensils = [];
        particles = [];
        score = 0;
        rotationSpeed = baseRotationSpeed;
        plate.rotation = 0;
        gameState = "PLAYING";
        updateScoreUI();
        if (gameReqAnimation) cancelAnimationFrame(gameReqAnimation);
        gameLoop();
      }

      function showGame() {
        if (!currentUser) {
          showToast("Войдите в систему чтобы играть!");
          return;
        }
        document.getElementById("gameModal").classList.add("active");
        gameState = "MENU";
        drawMenu();
      }

      function closeGame() {
        document.getElementById("gameModal").classList.remove("active");
        cancelAnimationFrame(gameReqAnimation);
        gameState = "MENU";
      }

      function gameLoop() {
        if (gameState !== "PLAYING" && gameState !== "GAMEOVER_ANIM") return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === "PLAYING") {
          plate.rotation += rotationSpeed;
        }

        drawPlate(ctx);
        drawStuckUtensils(ctx);
        drawParticles(ctx);

        if (utensils.length > 0) {
          const u = utensils[0];
          const prevY = u.y;
          u.y -= 40;

          drawUtensil(ctx, 200, u.y, 0);

          const hitLine = plate.y + plate.radius;

          if (u.y <= hitLine && prevY > hitLine - 40) {
            checkHit(u);
          }

          if (u.y < -50) utensils.shift();
        }

        if (gameState === "GAMEOVER_ANIM") {
          drawGameOverScreen();
        } else {
          gameReqAnimation = requestAnimationFrame(gameLoop);
        }
      }

      function checkHit(utensil) {
        const hitAngle = normalizeAngle(
          Math.atan2(utensil.y - plate.y, 0) - plate.rotation
        );
        let collision = false;

        for (let stuck of stuckUtensils) {
          let diff = Math.abs(stuck.angle - hitAngle);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          if (diff < 0.25) {
            collision = true;
            break;
          }
        }

        if (collision) {
          gameOver();
        } else {
          stuckUtensils.push({ type: "knife", angle: hitAngle });
          utensils.shift();
          createParticles(200, plate.y + plate.radius);
          score++;
          if (score % 2 === 0) rotationSpeed += 0.002;
          updateScoreUI();
        }
      }

      function gameOver() {
        gameState = "GAMEOVER_ANIM";
        if (score > bestScore) bestScore = score;
        updateScoreUI();
        savePoints(score * 10);
      }

      function drawMenu() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "30px Cormorant Garamond";
        ctx.textAlign = "center";
        ctx.fillText("MERIDIAN CHEF", 200, 180);
        ctx.font = "14px Montserrat";
        ctx.fillStyle = "#CD7F32";
        ctx.fillText("КЛИКНИТЕ, ЧТОБЫ НАЧАТЬ", 200, 220);
        drawUtensil(ctx, 200, 300, 0);
      }

      function drawGameOverScreen() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FF4444";
        ctx.font = "bold 30px Montserrat";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", 200, 150);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px Montserrat";
        ctx.fillText(`Счет: ${score}`, 200, 200);
        ctx.fillStyle = "#CD7F32";
        ctx.font = "14px Montserrat";
        ctx.fillText("КЛИКНИТЕ ДЛЯ РЕСТАРТА", 200, 250);
      }

      function drawPlate(ctx) {
        ctx.save();
        ctx.translate(plate.x, plate.y);
        ctx.rotate(plate.rotation);
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 25;

        const grad = ctx.createRadialGradient(
          0,
          0,
          plate.radius * 0.8,
          0,
          0,
          plate.radius
        );
        grad.addColorStop(0, "#222");
        grad.addColorStop(1, "#050505");

        ctx.beginPath();
        ctx.arc(0, 0, plate.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, plate.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "#CD7F32";
        ctx.fill();

        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, plate.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      function drawUtensil(ctx, x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;

        const bladeGrad = ctx.createLinearGradient(0, 0, 5, -50);
        bladeGrad.addColorStop(0, "#bdc3c7");
        bladeGrad.addColorStop(0.5, "#ecf0f1");
        bladeGrad.addColorStop(1, "#95a5a6");

        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-5, -45);
        ctx.lineTo(0, -65);
        ctx.lineTo(5, -45);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, -50);
        ctx.strokeStyle = "#7f8c8d";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#D4AF37";
        ctx.fillRect(-10, 0, 20, 5);

        ctx.fillStyle = "#3E2723";
        ctx.fillRect(-6, 5, 12, 35);

        ctx.beginPath();
        ctx.arc(0, 40, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#D4AF37";
        ctx.fill();

        ctx.fillStyle = "#D4AF37";
        ctx.beginPath();
        ctx.arc(0, 15, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 28, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      function drawStuckUtensils(ctx) {
        stuckUtensils.forEach((u) => {
          ctx.save();
          ctx.translate(plate.x, plate.y);
          ctx.rotate(plate.rotation + u.angle);

          drawUtensil(ctx, 0, plate.radius, 0);

          ctx.restore();
        });
      }

      function createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
          particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1.0,
          });
        }
      }

      function drawParticles(ctx) {
        for (let i = particles.length - 1; i >= 0; i--) {
          let p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          if (p.life <= 0) {
            particles.splice(i, 1);
          } else {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = "#D4AF37";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      function normalizeAngle(angle) {
        angle = angle % (2 * Math.PI);
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
      }

      function updateScoreUI() {
        document.getElementById("scoreDisplay").innerText = `Счет: ${score}`;
        document.getElementById(
          "bestScoreDisplay"
        ).innerText = `Рекорд: ${bestScore}`;
      }

      async function savePoints(pointsToAdd) {
        if (currentUser && pointsToAdd > 0) {
          try {
            const response = await fetch("/api/add-points", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: currentUser.id,
                points: pointsToAdd,
              }),
            });
            const data = await response.json();
            if (data.success) {
              currentUser.points = data.user.points;
              updateAuthUI();
            }
          } catch (error) {
            console.error("Ошибка сохранения:", error);
          }
        }
      }

      // Поддержка клика и тача для мобильных
      function handleGameInteraction(e) {
        e.preventDefault();
        if (gameState === "MENU" || gameState === "GAMEOVER_ANIM") {
          initGame();
          return;
        }
        if (gameState === "PLAYING" && utensils.length === 0) {
          utensils.push({ x: 200, y: 380 });
        }
      }

      canvas.addEventListener("click", handleGameInteraction);
      canvas.addEventListener("touchstart", handleGameInteraction);

      function resizeCanvas() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          const maxSize = Math.min(window.innerWidth - 40, 350);
          canvas.style.width = maxSize + "px";
          canvas.style.height = maxSize + "px";
        } else {
          canvas.style.width = "400px";
          canvas.style.height = "400px";
        }
      }

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();