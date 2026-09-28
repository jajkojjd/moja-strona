let verified = false;

        /*
         * WERYFIKACJA ma 20 sekund.
         */
        let seconds = 20;

        const secondsElement =
            document.getElementById("seconds");

        const statusElement =
            document.getElementById("captcha-status");

        /*
         * LICZNIK
         */
        const countdown = setInterval(function () {

            if (verified) {
                clearInterval(countdown);
                return;
            }

            seconds--;

            secondsElement.textContent = seconds;

            /*
             * Po 20 sekundach użytkownik
             * zostaje przekierowany.
             */
            if (seconds <= 0) {

                clearInterval(countdown);

                window.location.replace(
                    "https://xjajkojjdkarolx.pl/"
                );
            }

        }, 1000);

        /*
         * KLIKNIĘCIE PRZYCISKU WERYFIKACJI
         */
        document
            .getElementById("verify-btn")
            .addEventListener("click", function () {

                verified = true;

                clearInterval(countdown);

                statusElement.textContent =
                    "Zweryfikowano";

                document
                    .getElementById("captcha-screen")
                    .style.display = "none";

                const mainPage =
                    document.getElementById("main-page");

                mainPage.style.display = "flex";
            });

        /*
         * PRZYCISK ZGŁASZANIA BŁĘDÓW
         */
        document
            .getElementById("report-bug-btn")
            .addEventListener("click", function () {

                const adres = "karolkwiatek5000@gmail.com";
                const temat = "Zgłoszenie błędu - xkarolx.pl";
                const tresc = "Cześć,\n\nCoś się zwaliło na stronie xkarolx.pl.\n\nOpis problemu:\n";

                const link =
                    "mailto:" + adres +
                    "?subject=" + encodeURIComponent(temat) +
                    "&body=" + encodeURIComponent(tresc);

                window.location.href = link;
            });


