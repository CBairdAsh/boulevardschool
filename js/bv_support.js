const bk_support = {
    sanitize: (str) => str ? str.replace(/[<>"'`]/g, '') : '',
    persistUTMParams: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

        // make sure we have something to do. 
        if (![...urlParams.keys()].some(key => utmKeys.includes(key)) && sessionStorage.length === 0) return;

        // Store UTM params securely
        const storedParams = {};
        utmKeys.forEach(key => {
            if (urlParams.has(key)) {
                const cleanValue = bk_support.sanitize(urlParams.get(key));
                sessionStorage.setItem(key, cleanValue);
                storedParams[key] = cleanValue;
            } else {
                const existingValue = sessionStorage.getItem(key);
                if (existingValue) {
                storedParams[key] = bk_support.sanitize(existingValue);
                }
            }
        });

        // Update internal links only (ignore mailto, external, anchors, etc.)
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');

            // Skip external links
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') ) return;

            if (href.startsWith('#')) return;

            // last check, make sure we don't double up on params
            if (href.includes('utm_')) return;

            const linkUrl = new URL(href, window.location.origin);
            utmKeys.forEach(key => {
                // don't need to sanitize again but just being careful
                const value = bk_support.sanitize(storedParams[key]);
                if (value) linkUrl.searchParams.set(key, value);
            });
            link.setAttribute('href', linkUrl.toString());
        });

        document.querySelectorAll('input[name^="utm_"]').forEach(input => {
            const key = input.name;
            const rawValue = storedParams[key];

            // don't need to sanitize again but just being careful
            const cleanValue = bk_support.sanitize(rawValue);
            if (cleanValue) input.value = cleanValue;
        });
    }
}

const formHandler = {
    isMobileViewport: () => {
        return window.matchMedia("(max-width: 768px)").matches;
    },

    resizeIframe: function(iframeEl) {
        if (formHandler.isMobileViewport()) return;
        $(iframeEl).css('height', `${(window.innerHeight * 1.75)}px`);
    },

    init: function() {
        const iframes = document.querySelectorAll('.resizable-iframe');

        iframes.forEach(iframe => {
            // Resize immediately in case it's already loaded
            formHandler.resizeIframe(iframe);

            // Bind onload for future loads
            iframe.onload = () => formHandler.resizeIframe(iframe);
        });

        // Bind window resize
        $(window).on('resize', () => {
            iframes.forEach(iframe => formHandler.resizeIframe(iframe));
        });
    }
};

document.addEventListener('DOMContentLoaded', bk_support.persistUTMParams);