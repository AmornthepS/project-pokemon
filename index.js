import { serve } from "bun";
import axios from "axios";

// ฟังก์ชันดึงข้อมูลโปเกมอน
async function getPokemonData(ids) {
  try {
    const requests = ids.map((id) => axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`));
    const responses = await Promise.all(requests);
    return responses.map((res) => res.data);
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return [];
  }
}

// ฟังก์ชันสร้างหน้าเกม (Game Page)
function generateGamePage(pokemonCards) {
  const cardsHTML = pokemonCards
    .map(
      (pokemon, index) => `
      <div class="card" data-id="${pokemon.id}" onclick="flipCard(this)">
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
          </div>
        </div>
      </div>
    `
    )
    .join("");

  return `
    <html>
      <head>
        <title>Pokemon Matching Game</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            height: 100vh;
            background: linear-gradient(135deg, #1e90ff, #ff69b4);
            color: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.1);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
          }
          .header-left, .header-right {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .header-left div, .header-right div, .header-right a {
            padding: 10px 15px;
            background-color: #ff4500;
            border-radius: 5px;
            text-align: center;
            font-size: 1em;
            color: white;
            text-decoration: none;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
          }
          .header-left div {
            background-color: #32cd32;
          }
          .header-right a:hover {
            background-color: #ff6347;
          }
          .game-board {
            margin-top: 20px;
            display: grid;
            grid-template-columns: repeat(4, 100px);
            gap: 20px;
          }
          .card {
            width: 100px;
            height: 140px;
            perspective: 1000px;
          }
          .card-inner {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.6s;
          }
          .card[data-flipped="true"] .card-inner {
            transform: rotateY(180deg);
          }
          .card-front, .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 8px;
          }
          .card-front {
            background: #ccc;
          }
          .card-back {
            background: white;
            transform: rotateY(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .message {
            margin-top: 20px;
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <div id="scoreboard">Score: 0</div>
            <div id="timer">Time: 0s</div>
          </div>
          <div class="header-right">
            <a href="/">Back to Home</a>
            <a href="https://cite.dpu.ac.th/ResumeDean.html" target="_blank"> About US </a>
            
          </div>
        </div>
        <h1>Pokemon Matching Game</h1>
        <div class="game-board">
          ${cardsHTML}
        </div>
        <div class="message" id="message">Find all matching pairs!</div>
        <script>
          let flippedCards = [];
          let matchedPairs = 0;
          let score = 0;
          let timer = 0;
          let timerInterval;

          // ฟังก์ชันเริ่มจับเวลา
          function startTimer() {
            timerInterval = setInterval(() => {
              timer++;
              document.getElementById("timer").textContent = \`Time: \${timer}s\`;
            }, 1000);
          }

          // ฟังก์ชันหยุดจับเวลา
          function stopTimer() {
            clearInterval(timerInterval);
          }

          // ฟังก์ชันรีเซ็ตเกม
          function resetGame() {
            flippedCards = [];
            matchedPairs = 0;
            score = 0;
            timer = 0;
            stopTimer();
            document.getElementById("scoreboard").textContent = "Score: 0";
            document.getElementById("timer").textContent = "Time: 0s";
            document.getElementById("message").textContent = "Find all matching pairs!";
          }

          function flipCard(card) {
            if (card.dataset.flipped === "true" || flippedCards.length >= 2) {
              return;
            }

            card.dataset.flipped = "true";
            flippedCards.push(card);

            if (flippedCards.length === 2) {
              const [card1, card2] = flippedCards;
              const id1 = card1.dataset.id;
              const id2 = card2.dataset.id;

              if (id1 === id2) {
                setTimeout(() => {
                  card1.style.visibility = "hidden";
                  card2.style.visibility = "hidden";
                  matchedPairs++;
                  score++;
                  document.getElementById("scoreboard").textContent = \`Score: \${score}\`;
                  document.getElementById("message").textContent = "Correct! Keep going!";
                  flippedCards = [];
                  if (matchedPairs === ${pokemonCards.length / 2}) {
                    document.getElementById("message").textContent = "Congratulations! You found all pairs!";
                    stopTimer();
                  }
                }, 500);
              } else {
                setTimeout(() => {
                  card1.dataset.flipped = "false";
                  card2.dataset.flipped = "false";
                  flippedCards = [];
                  document.getElementById("message").textContent = "Try again!";
                }, 1000);
              }
            }
          }

          // เริ่มจับเวลาเมื่อโหลดหน้าเสร็จ
          window.onload = startTimer;
        </script>
      </body>
    </html>
  `;
}


// เสิร์ฟหน้าเว็บ
serve({
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/game") {
      const ids = Array.from({ length: 6 }, () => Math.floor(Math.random() * 1010) + 1);
      const doubledIds = [...ids, ...ids].sort(() => Math.random() - 0.5);
      const pokemonCards = await getPokemonData(doubledIds);
      return new Response(generateGamePage(pokemonCards), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(generateWelcomePage(), {
      headers: { "Content-Type": "text/html" },
    });
  },
  port: 3000,
});

// ฟังก์ชันสร้างหน้าแรก (Welcome Page)
function generateWelcomePage() {
  return `
    <html>
      <head>
        <title>Pokemon Matching Game</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #ffcc00, #ff4500);
            color: white;
            overflow: hidden;
          }
          .logo {
            width: 200px;
            height: 200px;
            margin-bottom: 20px;
            border-radius: 50%;
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 3s infinite;
          }
          @keyframes fadeInOut {
            0%, 100% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
          }
          h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-align: center;
          }
          .new-game-btn {
            padding: 15px 30px;
            background-color: #1e90ff;
            color: white;
            font-size: 1.5em;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
          }
          .new-game-btn:hover {
            background-color: #0066cc;
          }
        </style>
        <script>
          // รายการรูปโลโก้โปเกมอน
          const logoUrls = [
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
          ];

          let currentIndex = 0;

          function changeLogo() {
            const logo = document.getElementById("pokemon-logo");
            currentIndex = (currentIndex + 1) % logoUrls.length;
            logo.src = logoUrls[currentIndex];
          }

          setInterval(changeLogo, 3000); // เปลี่ยนรูปทุก 3 วินาที
        </script>
      </head>
      <body>
        <img id="pokemon-logo" class="logo" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pokemon Logo">
        <h1>Pokemon Matching Game</h1>
        <a href="/game" class="new-game-btn">New Game</a>
      </body>
    </html>
  `;
}
