ocument.addEventListener('DOMContentLoaded', function () {
    alert("Üdvözlet a weboldalamon. Ez a weboldal Nagy Imre által készült, és folyamatosan fejlesztés alatt áll. Élvezd azokat a zenéket, amiket sikerült idáig összegyűjtenem.");

    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
    const skipForwardButtons = document.querySelectorAll('.skip-forward');
    const skipBackwardButtons = document.querySelectorAll('.skip-backward');
    const audios = document.querySelectorAll('audio');
    const sequenceIds = [13, 14, 15, 16]; // Sequence of track IDs that should be excluded
    let activeAudio = null;

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

    function updatePlayButton() {
        if (activeAudio && !activeAudio.paused) {
            const playButton = document.querySelector(`.play-btn[data-id="${activeAudio.id.replace('audio', '')}"]`);
            playButton?.classList.add('focus');
        }
    }

    // Skip Forward Logic (Excluding Playlist)
    skipForwardButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (activeAudio) {
                const currentId = activeAudio.id.replace('audio', '');
                const nextAudio = findNextAudio(currentId);
                if (nextAudio) {
                    activeAudio.pause();
                    activeAudio.currentTime = 0;
                    nextAudio.play();
                    activeAudio = nextAudio;
                    updatePlayButton();
                }
            }
        });
    });

    // Skip Backward Logic (Excluding Playlist)
    skipBackwardButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (activeAudio) {
                const currentId = activeAudio.id.replace('audio', '');
                const prevAudio = findPreviousAudio(currentId);
                if (prevAudio) {
                    activeAudio.pause();
                    activeAudio.currentTime = 0;
                    prevAudio.play();
                    activeAudio = prevAudio;
                    updatePlayButton();
                }
            }
        });
    });

    // Find Next Audio that is NOT in the Playlist
    function findNextAudio(currentId) {
        const currentIndex = Array.from(audios).findIndex(audio => audio.id === `audio${currentId}`);
        let nextIndex = currentIndex + 1;

        // Loop to the first non-playlisted track
        while (nextIndex < audios.length) {
            const nextAudio = audios[nextIndex];
            if (!sequenceIds.includes(parseInt(nextAudio.id.replace('audio', '')))) {
                return nextAudio;
            }
            nextIndex++;
        }
        return null; // If no next audio found outside playlist
    }

    // Find Previous Audio that is NOT in the Playlist
    function findPreviousAudio(currentId) {
        const currentIndex = Array.from(audios).findIndex(audio => audio.id === `audio${currentId}`);
        let prevIndex = currentIndex - 1;

        // Loop to the last non-playlisted track
        while (prevIndex >= 0) {
            const prevAudio = audios[prevIndex];
            if (!sequenceIds.includes(parseInt(prevAudio.id.replace('audio', '')))) {
                return prevAudio;
            }
            prevIndex--;
        }
        return null; // If no previous audio found outside playlist
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
