document.addEventListener('DOMContentLoaded', function () {
    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
    const audios = document.querySelectorAll('audio');
    const boxes = document.querySelectorAll('.animationBox');
    const buttons = document.querySelectorAll('.control-btn');
    let activeAudio = null;

    const nonPlaylistIds = [34, 35, 36, 37]; // All non-playlist track IDs

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

    // Function to activate track and control buttons
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

    // Handle media session actions
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
            let index = nonPlaylistIds.indexOf(currentId);
            index = (index + 1) % nonPlaylistIds.length;
            const nextId = nonPlaylistIds[index];

            activateTrack(nextId);

            // Focus logic based on whether the audio is playing or paused
            if (activeAudio.paused) {
                const pauseButton = document.querySelector(`.pause-btn[data-id="${nextId}"]`);
                pauseButton?.classList.add('focus'); // Focus on the pause button if audio is paused
            } else {
                const playButton = document.querySelector(`.play-btn[data-id="${nextId}"]`);
                playButton?.classList.add('focus'); // Focus on the play button if audio is playing
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', function() {
            const currentId = parseInt(activeAudio?.id.replace('audio', '')) || 0;
            let index = nonPlaylistIds.indexOf(currentId);
            index = (index - 1 + nonPlaylistIds.length) % nonPlaylistIds.length;
            const prevId = nonPlaylistIds[index];

            activateTrack(prevId);

            // Focus logic based on whether the audio is playing or paused
            if (activeAudio.paused) {
                const pauseButton = document.querySelector(`.pause-btn[data-id="${prevId}"]`);
                pauseButton?.classList.add('focus'); // Focus on the pause button if audio is paused
            } else {
                const playButton = document.querySelector(`.play-btn[data-id="${prevId}"]`);
                playButton?.classList.add('focus'); // Focus on the play button if audio is playing
            }
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
});
