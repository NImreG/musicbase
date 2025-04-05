   document.addEventListener('DOMContentLoaded', function () {
    // 🌍 Language Detection and Translations
    const userLang = (navigator.language || navigator.userLanguage).split('-')[0];

    const translations = {
        en: {
            welcome: "Welcome to my website. This site was created by Imre Nagy and is still under development. Enjoy the music I’ve collected so far.",
            play: "Play",
            pause: "Pause"
        },
        hu: {
            welcome: "Üdvözlet a weboldalamon. Ez a weboldal Nagy Imre által készült, és folyamatosan fejlesztés alatt áll. Élvezd azokat a zenéket, amiket sikerült idáig összegyűjtenem.",
            play: "Lejátszás",
            pause: "Szünet"
        },
        fr: {
            welcome: "Bienvenue sur mon site Web. Ce site a été créé par Imre Nagy et est toujours en cours de développement. Profitez de la musique que j'ai rassemblée jusqu'à présent.",
            play: "Lecture",
            pause: "Pause"
        },
        es: {
            welcome: "Bienvenido a mi sitio web. Este sitio fue creado por Imre Nagy y aún está en desarrollo. Disfruta de la música que he recopilado hasta ahora.",
            play: "Reproducir",
            pause: "Pausa"
        }
    };

    const lang = translations[userLang] ? userLang : 'en'; // fallback
    const t = translations[lang];

    // 🔊 Show welcome alert
    alert(t.welcome);

    // 🈳 Translate Play and Pause button text
    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');

    playButtons.forEach(btn => {
        btn.textContent = t.play;
    });

    pauseButtons.forEach(btn => {
        btn.textContent = t.pause;
    });

    // --- The rest of your music player logic ---
    
    const audios = document.querySelectorAll('audio');
    const boxes = document.querySelectorAll('.animationBox');
    const buttons = document.querySelectorAll('.control-btn');
    let activeAudio = null;
    const sequenceIds = [13, 14, 15, 16];

    function disableAllPauseButtons() {
        pauseButtons.forEach(button => button.classList.add('disabled'));
    }

    function enablePauseButton(id) {
        const pauseButton = document.querySelector(`.pause-btn[data-id="${id}"]`);
        if (pauseButton) {
            pauseButton.classList.remove('disabled');
        }
    }

    function deactivateAllPlayButtons() {
        playButtons.forEach(button => button.classList.remove('focus'));
    }

    function startAnimations() {
        boxes.forEach((box, index) => {
            const id = `oszlop${index + 1}`;
            box.classList.add(id);
        });
    }

    function stopAnimations() {
        boxes.forEach((box, index) => {
            const id = `oszlop${index + 1}`;
            box.classList.remove(id);
        });
    }

    function playNextAudio(currentId) {
        const currentIndex = sequenceIds.indexOf(parseInt(currentId));
        const nextIndex = (currentIndex + 1) % sequenceIds.length;
        const nextId = sequenceIds[nextIndex];
        const nextAudio = document.getElementById(`audio${nextId}`);
        if (!nextAudio) return;

        const currentAudio = document.getElementById(`audio${currentId}`);
        currentAudio?.pause();
        currentAudio.currentTime = 0;

        disableAllPauseButtons();
        stopAnimations();

        nextAudio.play();
        enablePauseButton(nextId);
        deactivateAllPlayButtons();
        const nextPlayButton = document.querySelector(`.play-btn[data-id="${nextId}"]`);
        nextPlayButton?.classList.add('focus');

        activeAudio = nextAudio;
        startAnimations();
    }

    function playPreviousAudio(currentId) {
        const currentIndex = sequenceIds.indexOf(parseInt(currentId));
        const previousIndex = (currentIndex - 1 + sequenceIds.length) % sequenceIds.length;
        const previousId = sequenceIds[previousIndex];
        const previousAudio = document.getElementById(`audio${previousId}`);
        if (!previousAudio) return;

        const currentAudio = document.getElementById(`audio${currentId}`);
        currentAudio?.pause();
        currentAudio.currentTime = 0;

        disableAllPauseButtons();
        stopAnimations();

        previousAudio.play();
        enablePauseButton(previousId);
        deactivateAllPlayButtons();
        const previousPlayButton = document.querySelector(`.play-btn[data-id="${previousId}"]`);
        previousPlayButton?.classList.add('focus');

        activeAudio = previousAudio;
        startAnimations();
    }

    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);
            if (!audio) return;

            if (activeAudio === audio && !audio.paused) return;

            audios.forEach(a => {
                if (a !== audio) {
                    a.pause();
                    a.currentTime = 0;
                }
            });

            disableAllPauseButtons();
            stopAnimations();

            audio.play();
            enablePauseButton(id);
            activeAudio = audio;

            startAnimations();

            buttons.forEach(btn => btn.classList.remove('focus'));
            button.classList.add('focus');
        });
    });

    pauseButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('disabled')) return;

            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);

            audio.pause();
            button.classList.add('disabled');
            stopAnimations();

            buttons.forEach(btn => btn.classList.remove('focus'));
            button.classList.add('focus');

            activeAudio = null;
        });
    });

    audios.forEach(audio => {
        audio.addEventListener('ended', () => {
            const currentId = audio.id.replace('audio', '');
            if (sequenceIds.includes(parseInt(currentId))) {
                playNextAudio(currentId);
            }
        });
    });

    document.querySelector('.skip-backward').addEventListener('click', () => {
        if (activeAudio) {
            const currentId = activeAudio.id.replace('audio', '');
            playPreviousAudio(currentId);
        }
    });

    document.querySelector('.skip-forward').addEventListener('click', () => {
        if (activeAudio) {
            const currentId = activeAudio.id.replace('audio', '');
            playNextAudio(currentId);
        }
    });
});
