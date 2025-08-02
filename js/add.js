// Create the observer
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const skill = entry.target;
      const percent = skill.getAttribute('data-percent');
      skill.style.width = percent;

      // Stop observing this skill after it animates
      observer.unobserve(skill);
    }
  });
}, {
  threshold: 0.5 // Trigger when 50% of the element is visible
});

// Observe each skill-fill element
document.querySelectorAll('.skill-fill').forEach(skill => {
  observer.observe(skill);
});





