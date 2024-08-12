// Save scroll position before navigating away
document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', function() {
        localStorage.setItem('scrollPosition', window.scrollY);
    });
});

// Restore scroll position on page load
window.addEventListener('load', function() {
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
        localStorage.removeItem('scrollPosition'); // Clear the stored position
    }
});