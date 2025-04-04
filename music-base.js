document.addEventListener('DOMContentLoaded', function () {
    alert("Üdvözlet a weboldalamon. Ez a weboldal Nagy Imre által készült, és folyamatosan fejlesztés alatt áll. Élvezd azokat a zenéket, amiket sikerült idáig összegyűjtenem.");

    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
    const skipForwardButtons = document.querySelectorAll('.skip-forward');
    const audios = document.querySelectorAll('audio');
    let activeAudio = null;
    const sequenceIds = [13, 14, 15, 16]; // Sequence of track IDs

    // Media Session Setup (for notification controls)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Track Title', // Dynamically update this
            artist: 'Artist Name', // Dynamically update this
            album: 'Album Name', // Dynamically update this
            artwork: [
                { src: 'image.jpg', sizes: '96x96', type: 'image/jpeg' } // Artwork for the notification
            ]
        });

        // Action Handlers for Media Controls
        navigator.mediaSession.setActionHandler('play', () => {
            if (activeAudio && activeAudio.paused) {
                activeAudio.play();
                updatePlayButton();
            }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            if (activeAudio && !activeAudio.paused) {
                activeAudio.pause();
                updatePlayButton();
            }
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
            if (activeAudio) {
                playPreviousAudio(activeAudio.id.replace('audio', ''));
            }
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
            if (activeAudio) {
                playNextAudio(activeAudio.id.replace('audio', ''));
            }
        });
    }

    // Helper Functions
    function disableAllPauseButtons() {
        pauseButtons.forEach(button => button.classList.add('disabled'));
    }

    function enablePauseButton(id) {
        const pauseButton = document.querySelector(`.pause-btn[data-id="${id}"]`);
        pauseButton?.classList.remove('disabled');
    }

    function deactivateAllPlayButtons() {
        playButtons.forEach(button => button.classList.remove('focus'));
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

        nextAudio.play();
        enablePauseButton(nextId);

        deactivateAllPlayButtons();
        const nextPlayButton = document.querySelector(`.play-btn[data-id="${nextId}"]`);
        nextPlayButton?.classList.add('focus');

        activeAudio = nextAudio;
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

        previousAudio.play();
        enablePauseButton(previousId);

        deactivateAllPlayButtons();
        const previousPlayButton = document.querySelector(`.play-btn[data-id="${previousId}"]`);
        previousPlayButton?.classList.add('focus');

        activeAudio = previousAudio;
    }

    function updatePlayButton() {
        if (activeAudio && !activeAudio.paused) {
            buttons.forEach(btn => btn.classList.remove('focus'));
            const playButton = document.querySelector(`.play-btn[data-id="${activeAudio.id.replace('audio', '')}"]`);
            playButton?.classList.add('focus');
        }
    }

    // Play Button Logic
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

            audio.play();
            enablePauseButton(id);
            activeAudio = audio;

            updatePlayButton();
        });
    });

    // Pause Button Logic
    pauseButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('disabled')) return;

            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);

            audio.pause();
            button.classList.add('disabled');

            updatePlayButton();
            activeAudio = null;
        });
    });

    // Skip Forward Logic
    skipForwardButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (activeAudio) {
                const currentId = activeAudio.id.replace('audio', '');
                playNextAudio(currentId);
            }
        });
    });

    // Skip Backward Logic
    document.querySelector('.skip-backward').addEventListener('click', () => {
        if (activeAudio) {
            const currentId = activeAudio.id.replace('audio', '');
            playPreviousAudio(currentId);
        }
    });

    // Hide Media Session Control (stop music and hide notification)
    document.querySelector('.hide-control').addEventListener('click', () => {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio = null;
            navigator.mediaSession.metadata = null; // Clear metadata and hide controls
        }
    });
});
