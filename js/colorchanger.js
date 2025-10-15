const randomColor = "#" + ((1 << 24) * Math.random() | 0).toString(16);
document.documentElement.style.setProperty('--background', randomColor);


/*
const teamCards = document.querySelectorAll('.team-card');
teamCards.forEach(card => {
  const randomColor = "#" + ((1 << 24) * Math.random() | 0).toString(16);
  card.style.setProperty('--background', randomColor);
});
*/