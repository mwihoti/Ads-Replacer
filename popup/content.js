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

    const adElements = document.querySelectorAll("[id*=ad], .ad, .ads");
    adElements.forEach(ad => {
        ad.style.display = "none";
        const quoteBox = document.createElement("div");
        quoteBox.textContent = getRandomQuotes();
        quoteBox.style.cssText = "padding: 15px; background: #ffdfba; text-align: center; font-weight: bold; border-radius: 5px; margin: 5px 0;"
        ad.parentNode?.insertBefore(quoteBox, ad)
    })
});