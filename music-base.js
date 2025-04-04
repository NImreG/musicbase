document.addEventListener('DOMContentLoaded', function () {
    alert("Üdvözlet a weboldalamon. Ez a weboldal Nagy Imre által készült, és folyamatosan fejlesztés alatt áll. Élvezd azokat a zenéket, amiket sikerült idáig összegyűjtenem."); // Alert on first load

    const playButtons = document.querySelectorAll('.play-btn');
    const pauseButtons = document.querySelectorAll('.pause-btn');
    const audios = document.querySelectorAll('audio');
    const boxes = document.querySelectorAll('.animationBox'); // Animation elements
    const buttons = document.querySelectorAll('.control-btn'); // Combined play/pause buttons
    let activeAudio = null; // Track the currently playing audio

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
            box.classList.add(id); // Add animation class to each box
        });
    }

    function stopAnimations() {
        boxes.forEach((box, index) => {
            const id = `oszlop${index + 1}`;
            box.classList.remove(id); // Remove animation class from each box
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
        pauseButton.classList.remove('focus');  // Don't focus pause button
        playButton.classList.add('focus');      // Focus play button

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

    // Skip Forward and Skip Backward Logic
    document.querySelector('#skip-forward').addEventListener('click', () => {
        const currentId = parseInt(activeAudio?.id.replace('audio', '')) || 0;
        const allIds = [13, 14, 15, 16]; // 🔁 All non-playlist track IDs
        let index = allIds.indexOf(currentId);
        index = (index + 1) % allIds.length;
        const nextId = allIds[index];

        activateTrack(nextId);
    });

    document.querySelector('#skip-backward').addEventListener('click', () => {
        const currentId = parseInt(activeAudio?.id.replace('audio', '')) || 0;
        const allIds = [13, 14, 15, 16]; // 🔁 All non-playlist track IDs
        let index = allIds.indexOf(currentId);
        index = (index - 1 + allIds.length) % allIds.length;
        const prevId = allIds[index];

        activateTrack(prevId);
    });

    // Sequence Playback Logic (if you have a sequence of tracks)
    audios.forEach(audio => {
        audio.addEventListener('ended', () => {
            const currentId = audio.id.replace('audio', '');
            const sequenceIds = [13, 14, 15, 16]; // Define sequence of IDs
            if (sequenceIds.includes(parseInt(currentId))) {
                const nextIndex = (sequenceIds.indexOf(parseInt(currentId)) + 1) % sequenceIds.length;
                activateTrack(sequenceIds[nextIndex]);
            }
        });
    });
});
