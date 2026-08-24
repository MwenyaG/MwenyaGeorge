/*!
=========================================================
* Portfolio interactions
=========================================================
*/

(function () {
    var storageKey = "portfolio-theme";

    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.setAttribute("data-theme", theme);

        var metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", theme === "dark" ? "#07111f" : "#f4f1e8");
        }

        var toggles = document.querySelectorAll(".theme-toggle");
        toggles.forEach(function (toggle) {
            toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
            toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
            toggle.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");

            var label = toggle.querySelector(".theme-toggle-label");

            if (label) {
                label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
            }
        });

        document.querySelectorAll("[data-theme-preview]").forEach(function (preview) {
            var isActive = preview.getAttribute("data-theme-preview") === theme;
            preview.hidden = !isActive;
            preview.setAttribute("aria-hidden", isActive ? "false" : "true");
        });
    }

    function initTheme() {
        var savedTheme = localStorage.getItem(storageKey);
        setTheme(savedTheme || "light");

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

        revealItems.forEach(function (item) {
            if (item.classList.contains("resume-paper") || item.offsetHeight > window.innerHeight * 1.1) {
                item.classList.add("is-visible");
            }
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -10% 0px"
        });

        revealItems.forEach(function (item) {
            if (!item.classList.contains("is-visible")) {
                observer.observe(item);
            }
        });
    }

    function initSmoothScroll() {
        $(".navbar .nav-link, a.hero-btn-secondary[href^='#']").on("click", function (event) {
            var hash = this.hash;
            if (!hash || hash === "#") {
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

    function initMobileNav() {
        $(".navbar-collapse .dropdown-toggle").on("click", function (event) {
            if (window.innerWidth >= 992) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            var toggle = $(this);
            var parent = toggle.closest(".dropdown");
            var menu = parent.find(".dropdown-menu").first();
            var shouldOpen = !menu.hasClass("show");

            $(".navbar-collapse .dropdown-menu.show").not(menu).removeClass("show");
            $(".navbar-collapse .dropdown-toggle[aria-expanded='true']").not(toggle).attr("aria-expanded", "false");

            menu.toggleClass("show", shouldOpen);
            toggle.attr("aria-expanded", shouldOpen ? "true" : "false");
        });

        $(".navbar-collapse .nav-link:not(.dropdown-toggle), .navbar-collapse .dropdown-item").on("click", function () {
            var collapse = $(".navbar-collapse");
            if (collapse.hasClass("show")) {
                $(".navbar-collapse .dropdown-menu.show").removeClass("show");
                $(".navbar-collapse .dropdown-toggle[aria-expanded='true']").attr("aria-expanded", "false");
                collapse.collapse("hide");
            }
        });
    }

    function initScrollProgress() {
        var ticking = false;

        function updateProgress() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            var progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));

            document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(2));
            ticking = false;
        }

        function requestUpdate() {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }

        updateProgress();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
    }

    function initProjectCards() {
        document.querySelectorAll(".project-display-card[aria-hidden='true'] a").forEach(function (link) {
            link.setAttribute("tabindex", "-1");
        });
    }

    function initDashboardPreview() {
        $("#dashboardPreviewModal").on("show.bs.modal", function (event) {
            var trigger = $(event.relatedTarget);
            var image = trigger.data("image");
            var title = trigger.data("title");

            if (!image) {
                return;
            }

            $(this).find("#dashboardPreviewTitle").text(title || "Dashboard Preview");
            $(this).find("#dashboardPreviewImage")
                .attr("src", image)
                .attr("alt", title || "Dashboard preview image");
        });
    }

    function initPreviewCarousels() {
        document.querySelectorAll("[data-preview-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".preview-card"));
            var activeIndex = slides.findIndex(function (slide) {
                return slide.classList.contains("is-active");
            });

            if (slides.length < 2) {
                return;
            }

            if (activeIndex < 0) {
                activeIndex = 0;
                slides[0].classList.add("is-active");
            }

            window.setInterval(function () {
                slides[activeIndex].classList.remove("is-active");
                activeIndex = (activeIndex + 1) % slides.length;
                slides[activeIndex].classList.add("is-active");
            }, 5000);
        });
    }

    function initProjectAutoCycle() {
        var tabLinks = Array.prototype.slice.call(document.querySelectorAll("#current-projects .project-tab-link"));
        var activeIndex = 0;
        var intervalId;

        if (tabLinks.length < 2 || !window.jQuery) {
            return;
        }

        function syncActiveIndex() {
            var currentIndex = tabLinks.findIndex(function (link) {
                return link.classList.contains("active");
            });

            activeIndex = currentIndex >= 0 ? currentIndex : 0;
        }

        function showNextProject() {
            syncActiveIndex();
            activeIndex = (activeIndex + 1) % tabLinks.length;
            window.jQuery(tabLinks[activeIndex]).tab("show");
        }

        function restartTimer() {
            window.clearInterval(intervalId);
            syncActiveIndex();
            intervalId = window.setInterval(showNextProject, 10000);
        }

        tabLinks.forEach(function (link) {
            link.addEventListener("click", restartTimer);
        });

        restartTimer();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initReveal();
        initSmoothScroll();
        initMobileNav();
        initScrollProgress();
        initProjectCards();
        initDashboardPreview();
        initPreviewCarousels();
        initProjectAutoCycle();
    });
})();
