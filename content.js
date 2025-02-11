document.addEventListener("DOMContentLoaded", function () {
    const quotes = [
        "Believe in yourself! Every day is a new begining",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Your limitation-it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones",
        "Dream it. Wish it. Do it.",
        "Stay focused and never give up.",
        "Hard work pays off in the long run."
    ];

    function getRandomQuotes() {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    function replaceAds() {
        const adElements = document.querySelectorAll("[id*=ad], .ad, .ads");
        adElements.forEach(ad => {
          ad.style.display = "none";
          const quoteBox = document.createElement("div");
          quoteBox.innerHTML = `<div class='quote-widget'>
                                  <p>${getRandomQuote()}</p>
                                </div>`;
          quoteBox.classList.add("styled-widget");
          ad.parentNode?.insertBefore(quoteBox, ad);
        });
      }
      
      replaceAds();
      setInterval(replaceAds, 10000); // Refresh quotes every 10 seconds
    });