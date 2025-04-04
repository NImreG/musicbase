document.addEventListener('DOMContentLoaded', function () {
    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
    const audios = document.querySelectorAll('audio');
    const boxes = document.querySelectorAll('.animationBox');
    const buttons = document.querySelectorAll('.control-btn');
    let activeAudio = null;

    const playlistIds = [13, 14, 15, 16]; // Playlist IDs

    // Helper Functions
    function disableAllPauseButtons() {
        pauseButtons.forEach(button => button.classList.add('disabled'));
    }

    function enablePauseButton(id) {
        const pauseButton = document.querySelector(`.pause-btn[data-id="${id}"]`);
        pauseButton?.classList.remove('disabled');
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

    // Function to activate and play the next track in the playlist
    function playNextInPlaylist(currentId) {
        const nextIndex = playlistIds.indexOf(currentId) + 1;
        const nextId = playlistIds[nextIndex] || playlistIds[0]; // Loop back to the first track if at the end
        activateTrack(nextId);
    }

    // Activate and play a track by its ID
    function activateTrack(id) {
        const audio = document.getElementById(`audio${id}`);
        const playButton = document.querySelector(`.play-btn[data-id="${id}"]`);
        const pauseButton = document.querySelector(`.pause-btn[data-id="${id}"]`);

        if (!audio || !playButton || !pauseButton) return;

        // Stop all other audios
        audios.forEach(a => {
            a.pause();
            a.currentTime = 0;
        });

        // Disable all pause buttons and stop animations
        disableAllPauseButtons();
        stopAnimations();
        deactivateAllButtons();

        // Play the selected audio
        audio.play();
        activeAudio = audio;

        // Enable pause button and set focus to play button
        pauseButton.classList.remove('disabled');
        pauseButton.classList.remove('focus');
        playButton.classList.add('focus');

        // Start animations
        startAnimations();
    }

    // Handle media session actions (play, pause, next, previous)
    if ('MediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', function() {
            if (activeAudio) {
                activeAudio.play();
                const playButton = document.querySelector(`.play-btn[data-id="${activeAudio.id.replace('audio', '')}"]`);
                playButton.classList.add('focus');
            }
        });

        navigator.mediaSession.setActionHandler('pause', function() {
            if (activeAudio) {
                activeAudio.pause();
                const pauseButton = document.querySelector(`.pause-btn[data-id="${activeAudio.id.replace('audio', '')}"]`);
                pauseButton.classList.add('focus');
            }
        });

        navigator.mediaSession.setActionHandler('nexttrack', function() {
            const currentId = parseInt(activeAudio?.id.replace('audio', '')) || 0;
            if (playlistIds.includes(currentId)) return; // Skip next for playlist tracks

            // Find the next valid track
            const nextId = playlistIds[playlistIds.indexOf(currentId) + 1] || playlistIds[0];
            activateTrack(nextId);
        });

        navigator.mediaSession.setActionHandler('previoustrack', function() {
            const currentId = parseInt(activeAudio?.id.replace('audio', '')) || 0;
            if (playlistIds.includes(currentId)) return; // Skip previous for playlist tracks

            // Find the previous valid track
            const prevId = playlistIds[playlistIds.indexOf(currentId) - 1] || playlistIds[playlistIds.length - 1];
            activateTrack(prevId);
        });
    }

    // Play Button Logic
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);

            if (!audio) return;

            // If the clicked audio is already playing, do nothing
            if (activeAudio === audio && !audio.paused) return;

            // Stop all other audios
            audios.forEach(a => {
                if (a !== audio) {
                    a.pause();
                    a.currentTime = 0;
                }
            });

            // Disable all pause buttons and stop animations
            disableAllPauseButtons();
            stopAnimations();

            // Play the selected audio
            audio.play();
            enablePauseButton(id);
            activeAudio = audio;

            // Start animations
            startAnimations();

            // Set focus to the play button
            buttons.forEach(btn => btn.classList.remove('focus'));
            button.classList.add('focus');
        });
    });

    // Pause Button Logic
    pauseButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('disabled')) return;

            const id = button.getAttribute('data-id');
            const audio = document.getElementById(`audio${id}`);

            // Pause the audio without resetting currentTime
            audio.pause();

            // Disable the paired pause button after pausing
            button.classList.add('disabled');

            // Stop animations
            stopAnimations();

            // Update focus for buttons
            buttons.forEach(btn => btn.classList.remove('focus'));
            button.classList.add('focus');

            // Clear active audio
            activeAudio = null;
        });
    });

    // Playlist Logic - Auto play next track in the playlist when current track ends
    audios.forEach(audio => {
        audio.addEventListener('ended', () => {
            const currentId = parseInt(audio.id.replace('audio', ''));
            if (playlistIds.includes(currentId)) {
                playNextInPlaylist(currentId); // Automatically play the next track in the playlist
            }
        });
    });
});
