document.addEventListener('DOMContentLoaded', function () {
    alert("Üdvözlet a weboldalamon. Ez a weboldal Nagy Imre által készült, és folyamatosan fejlesztés alatt áll. Élvezd azokat a zenéket, amiket sikerült idáig összegyűjtenem."); // Alert on first load

    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
    const audios = document.querySelectorAll('audio');
    const boxes = document.querySelectorAll('.animationBox'); // Animation elements
    const buttons = document.querySelectorAll('.control-btn'); // Combined play/pause buttons
    let activeAudio = null; // Track the currently playing audio
    const sequenceIds = [13, 14, 15, 16]; // IDs for the sequence (you can adjust this as needed)

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

    function startAnimations() {
        boxes.forEach((box, index) => {
            const id = `oszlop${index + 1}`;
            box.classList.add(id); // Add animation class to each box
        });
    }

    function stopAnimations() {
        boxes.forEach((box, index) => {
            const id = `oszlop${index + 1}`;
            box.classList.remove(id); // Remove animation class from each box
        });
    }

    // Play the next audio in the playlist
    function playNextAudio(currentId) {
        const currentIndex = sequenceIds.indexOf(parseInt(currentId)); // Find current position in sequence
        const nextIndex = (currentIndex + 1) % sequenceIds.length; // Loop back to the first in sequence
        const nextId = sequenceIds[nextIndex];
        const nextAudio = document.getElementById(`audio${nextId}`);

        if (!nextAudio) return;

        // Stop the current audio
        const currentAudio = document.getElementById(`audio${currentId}`);
        currentAudio?.pause();
        currentAudio.currentTime = 0;

        // Disable all pause buttons and stop animations
        disableAllPauseButtons();
        stopAnimations();

        // Play the next audio
        nextAudio.play();
        enablePauseButton(nextId);

        // Update focus for the corresponding play button
        deactivateAllPlayButtons();
        const nextPlayButton = document.querySelector(`.play-btn[data-id="${nextId}"]`);
        nextPlayButton?.classList.add('focus');

        activeAudio = nextAudio;

        // Start animations
        startAnimations();
    }

    // Play the previous audio in the playlist
    function playPreviousAudio(currentId) {
        const currentIndex = sequenceIds.indexOf(parseInt(currentId)); // Find current position in sequence
        const previousIndex = (currentIndex - 1 + sequenceIds.length) % sequenceIds.length; // Loop to the last if at the start
        const previousId = sequenceIds[previousIndex];
        const previousAudio = document.getElementById(`audio${previousId}`);

        if (!previousAudio) return;

        // Stop the current audio
        const currentAudio = document.getElementById(`audio${currentId}`);
        currentAudio?.pause();
        currentAudio.currentTime = 0;

        // Disable all pause buttons and stop animations
        disableAllPauseButtons();
        stopAnimations();

        // Play the previous audio
        previousAudio.play();
        enablePauseButton(previousId);

        // Update focus for the corresponding play button
        deactivateAllPlayButtons();
        const previousPlayButton = document.querySelector(`.play-btn[data-id="${previousId}"]`);
        previousPlayButton?.classList.add('focus');

        activeAudio = previousAudio;

        // Start animations
        startAnimations();
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

    // Sequence Playback Logic (for end of track)
    audios.forEach(audio => {
        audio.addEventListener('ended', () => {
            const currentId = audio.id.replace('audio', '');
            if (sequenceIds.includes(parseInt(currentId))) {
                playNextAudio(currentId); // Play the next audio in sequence
            }
        });
    });

    // Skip Backward and Skip Forward Logic
    document.querySelector('.skip-backward').addEventListener('click', () => {
        if (activeAudio) {
            const currentId = activeAudio.id.replace('audio', '');
            playPreviousAudio(currentId); // Play the previous audio
        }
    });

    document.querySelector('.skip-forward').addEventListener('click', () => {
        if (activeAudio) {
            const currentId = activeAudio.id.replace('audio', '');
            playNextAudio(currentId); // Play the next audio
        }
    });

});
