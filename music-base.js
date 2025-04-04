document.addEventListener('DOMContentLoaded', function () {
    alert("Üdvözlet a weboldalamon. Ez a weboldal Nagy Imre által készült, és folyamatosan fejlesztés alatt áll. Élvezd azokat a zenéket, amiket sikerült idáig összegyűjtenem.");

    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
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
            pauseButton.classList.add('focus'); // Add focus to active pause button
        }
    }

    function deactivateAllButtons() {
        buttons.forEach(btn => btn.classList.remove('focus'));
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

    function findNextAudio(currentId) {
        const currentIndex = Array.from(audios).findIndex(audio => audio.id === `audio${currentId}`);
        let nextIndex = currentIndex + 1;

        while (nextIndex < audios.length) {
            const nextAudio = audios[nextIndex];
            if (!sequenceIds.includes(parseInt(nextAudio.id.replace('audio', '')))) {
                return nextAudio;
            }
            nextIndex++;
        }

        for (let i = 0; i < audios.length; i++) {
            const nextAudio = audios[i];
            if (!sequenceIds.includes(parseInt(nextAudio.id.replace('audio', '')))) {
                return nextAudio;
            }
        }

        return null;
    }

    function findPreviousAudio(currentId) {
        const currentIndex = Array.from(audios).findIndex(audio => audio.id === `audio${currentId}`);
        let prevIndex = currentIndex - 1;

        while (prevIndex >= 0) {
            const prevAudio = audios[prevIndex];
            if (!sequenceIds.includes(parseInt(prevAudio.id.replace('audio', '')))) {
                return prevAudio;
            }
            prevIndex--;
        }

        for (let i = audios.length - 1; i >= 0; i--) {
            const prevAudio = audios[i];
            if (!sequenceIds.includes(parseInt(prevAudio.id.replace('audio', '')))) {
                return prevAudio;
            }
        }

        return null;
    }

    function updateMediaSession(id) {
        const audio = document.getElementById(`audio${id}`);
        if (!('mediaSession' in navigator) || !audio) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Track ${id}`,
            artist: 'Music Base',
            album: '',
            artwork: [
                { src: '/icon-192.png', sizes: '192x192', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
            audio.play();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            const prev = findPreviousAudio(id);
            if (prev) {
                activeAudio?.pause();
                activeAudio.currentTime = 0;
                prev.play();
                activeAudio = prev;
                const prevId = prev.id.replace('audio', '');
                deactivateAllButtons();
                document.querySelector(`.play-btn[data-id="${prevId}"]`)?.classList.add('focus');
                enablePauseButton(prevId);
                updateMediaSession(prevId);
                startAnimations();
            }
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const next = findNextAudio(id);
            if (next) {
                activeAudio?.pause();
                activeAudio.currentTime = 0;
                next.play();
                activeAudio = next;
                const nextId = next.id.replace('audio', '');
                deactivateAllButtons();
                document.querySelector(`.play-btn[data-id="${nextId}"]`)?.classList.add('focus');
                enablePauseButton(nextId);
                updateMediaSession(nextId);
                startAnimations();
            }
        });

        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
    }

    // Play button logic
                       playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);
            if (!audio) return;
    
            // If the audio is already playing, do nothing
            if (activeAudio === audio && !audio.paused) return;
    
            // Pause all other audios and reset
            audios.forEach(a => {
                if (a !== audio) {
                    a.pause();
                    a.currentTime = 0;
                }
            });
    
            stopAnimations();
            disableAllPauseButtons();  // Ensure all pause buttons are disabled
    
            // Remove focus from all play and pause buttons
            deactivateAllButtons(); 
            pauseButtons.forEach(btn => btn.classList.remove('focus')); // Ensure pause buttons don't get focus
    
            // Play the selected audio
            audio.play();
            activeAudio = audio;
    
            // Focus the play button (no focus on the pause button)
            button.classList.add('focus');
    
            // Disable the corresponding pause button (no focus or activation)
            const pauseButton = document.querySelector(`.pause-btn[data-id="${id}"]`);
            if (pauseButton) {
                 pauseButton.classList.remove('disabled'); 
                 pauseButton.classList.remove('focus');
            }
    
            updateMediaSession(id);
            startAnimations();
        });
    });
        // Pause button logic
              pauseButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('disabled')) return;  // Ignore if pause button is disabled
    
            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);
            if (!audio) return;
    
            audio.pause();  // Pause the audio
            button.classList.add('disabled');  // Disable the pause button (it should not be clickable anymore)
    
            // Remove focus from all buttons
            deactivateAllButtons();
            button.classList.add('focus');  // Focus the pause button (as it's now active)
    
            stopAnimations();
            activeAudio = null;
        });
    });
    // Playlist track autoplay logic (IDs: 13–16)
    audios.forEach(audio => {
        audio.addEventListener('ended', () => {
            const currentId = audio.id.replace('audio', '');
            if (sequenceIds.includes(parseInt(currentId))) {
                const nextId = playNextSequenceAudio(currentId);
                if (nextId) updateMediaSession(nextId);
            }
        });
    });

    function playNextSequenceAudio(currentId) {
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
        activeAudio = nextAudio;

        deactivateAllButtons();
        document.querySelector(`.play-btn[data-id="${nextId}"]`)?.classList.add('focus');
        enablePauseButton(nextId);
        startAnimations();

        return nextId;
    }
});
