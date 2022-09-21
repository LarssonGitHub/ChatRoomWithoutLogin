//Used to reload if cashed
// https://gomakethings.com/fixing-safaris-back-button-browser-cache-issue-with-vanilla-js/
(function () {
    window.onpageshow = function(event) {
        if (event.persisted) {
            window.location.reload();
        }
    };
})();