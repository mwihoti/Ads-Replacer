 const quotes = [
        "Believe in yourself! Every day is a new begining",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Your limitation-it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones",
        "Dream it. Wish it. Do it.",
        "Stay focused and never give up.",
        "Hard work pays off in the long run.",
        "Believe you can and you're halfway there.",
        "You are capable of amazing things!",
        "Make today amazing!",
        "Small steps lead to big changes.",
        "Your potential is limitless!"
    ];
    
    const reminders = [
      "Time for a water break!",
      "Have you done your burpees today?",
      "Remember to stretch!",
      "Take a deep breath.",
      "Stand up and move around!"
    ];

    
    function getRandomItem(array) {
      return array[Math.floor(Math.random() * array.length)]
    }
    
    function createWidget(type) {
      const widget =  document.createElement('div');
      widget.style.cssText = `
        padding: 15px;
        margin: 10px;
        border-radius: 8px;
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      `;
      widget.textContent = type === 'quote' ? getRandomItem(quotes) : getRandomItem(reminders);
      return widget;
    }

    function getRandomQuotes() {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    function replaceAds() {
        chrome.storage.sync.get('settings', (data) => {
          const settings = data.settings || { showQuotes: true, showReminders: true};

          // common ad selectors
          const adSelectors = [
              '[class*="ad-"]',
              '[class*="advertisement"]',
              '[id*="ad-"]',
              '[id*="advertisement"]',
              '[aria-label*="advertisement"]',
              'ins.adsbygoogle'            
          ];

          const adElements = document.querySelectorAll(adSelectors.join(','));

          adElements.forEach((ad) => {
            if (ad.dataset.processed) return;

            const widgetType = Math.random() <0.5 && settings.showQuotes ? 'quote' : 'reminder';
            if ((widgetType === 'quote' && settings.showQuotes) || 
                (widgetType === 'reminder' && settings.showReminders)) {
                  const widget = createWidget(widgetType);
                  ad.parentNode.replaceChild(widget, ad);
                }
                ad.dataset.processed = 'true';
          })
        })
      }
  replaceAds();

  // Watch for dynamic content changes

const observer = new MutationObserver(replaceAds);
observer.observe(document.body, {
  childList: true,
  subtree: true
})
      
 