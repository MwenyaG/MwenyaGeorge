/*!
=========================================================
* Portfolio interactions
=========================================================
*/

(function () {
    var storageKey = "portfolio-theme";

    function setTheme(theme) {
        document.body.setAttribute("data-theme", theme);

        var metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", theme === "dark" ? "#07111f" : "#f4f7fb");
        }

        var toggles = document.querySelectorAll(".theme-toggle");
        toggles.forEach(function (toggle) {
            toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");

            var icon = toggle.querySelector("i");
            var label = toggle.querySelector("span");

            if (icon) {
                icon.className = theme === "dark" ? "ti-shine" : "ti-light-bulb";
            }

            if (label) {
                label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
            }
        });
    }

    function initTheme() {
        var savedTheme = localStorage.getItem(storageKey);
        var theme = savedTheme || "light";
        setTheme(theme);

        document.querySelectorAll(".theme-toggle").forEach(function (toggle) {
            toggle.addEventListener("click", function () {
                var nextTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
                localStorage.setItem(storageKey, nextTheme);
                setTheme(nextTheme);
            });
        });
    }

    function initReveal() {
        var revealItems = document.querySelectorAll(".reveal");

        if (!("IntersectionObserver" in window)) {
            revealItems.forEach(function (item) {
                item.classList.add("is-visible");
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.18
        });

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    }

    function initSmoothScroll() {
        $(".navbar .nav-link, a.hero-btn-secondary[href^='#']").on("click", function (event) {
            var hash = this.hash;
            if (!hash) {
                return;
            }

            var currentPath = window.location.pathname.replace(/\/$/, "");
            var targetPath = (this.pathname || "").replace(/\/$/, "");
            var samePage = !targetPath || currentPath === targetPath || currentPath.endsWith(targetPath);
            var target = document.querySelector(hash);

            if (!samePage || !target) {
                return;
            }

            event.preventDefault();

            $("html, body").animate({
                scrollTop: $(target).offset().top - 72
            }, 700, function () {
                window.location.hash = hash;
            });
        });
    }

    function initProjectCards() {
        document.querySelectorAll(".project-display-card[aria-hidden='true'] a").forEach(function (link) {
            link.setAttribute("tabindex", "-1");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initReveal();
        initSmoothScroll();
        initProjectCards();
    });
})();
