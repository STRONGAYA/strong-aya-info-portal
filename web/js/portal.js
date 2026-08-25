/**
 * STRONG-AYA Info Portal — shared page behaviour
 * - Subject carousel: horizontal scrolling via prev/next buttons
 * - "Explore all topics" dropdown on module pages
 */

document.addEventListener('DOMContentLoaded', function () {
    // --- Subject carousel buttons ---
    document.querySelectorAll('.subject-carousel').forEach(function (carousel) {
        const track = carousel.querySelector('.subject-grid');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        if (!track) return;

        const step = function () {
            const card = track.querySelector('.subject-card');
            return card ? card.offsetWidth + 24 : 320;
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                track.scrollBy({ left: -step(), behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                track.scrollBy({ left: step(), behavior: 'smooth' });
            });
        }
    });

    // --- "Explore all topics" dropdown ---
    document.querySelectorAll('.explore-topics-wrap').forEach(function (wrap) {
        const btn = wrap.querySelector('.explore-topics');
        const dropdown = wrap.querySelector('.topics-dropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const open = !dropdown.hidden;
            dropdown.hidden = open;
            btn.setAttribute('aria-expanded', String(!open));
        });

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target) && !dropdown.hidden) {
                dropdown.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    });
});
