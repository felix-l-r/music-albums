document.addEventListener("DOMContentLoaded", (event) => {
    const tracks = document.querySelectorAll(".track");
    tracks.forEach((trackElement) => {
        const controlBtn = trackElement.querySelector("#play-pause");
        const track = trackElement.querySelector("audio");
        const playhead = trackElement.querySelector("#playhead");
        const timeline = trackElement.querySelector("#timeline");
        const scrub = trackElement.querySelector(".progress-bar");
        const currentTimeDisplay = trackElement.querySelector("#current-time");
        const durationTimeDisplay = trackElement.querySelector("#duration-time");
        const timelineWidth = timeline.offsetWidth - playhead.offsetWidth;
        const source = controlBtn.getAttribute("data-audio");
        const repeatButton = trackElement.querySelector(".icon-repeat");

        let interval; // Variable to hold the interval

        if (!track) return;

        // Update the track duration when the track is loaded.
        track.addEventListener("canplaythrough", function () {
            durationTimeDisplay.innerHTML = formatSecondsAsTime(Math.floor(track.duration));
        }, false);

        controlBtn.addEventListener("click", function() {
            if (!track.getAttribute("src")) {
                track.setAttribute("src", source);
            }
            if (track.paused) {
                track.play();
                controlBtn.className = "pause";

                // Start updating current time every 250 milliseconds
                interval = setInterval(() => {
                    currentTimeDisplay.innerHTML = formatSecondsAsTime(Math.floor(track.currentTime));
                }, 250);
            } else {
                track.pause();
                controlBtn.className = "play";
                clearInterval(interval); // Stop updating current time
            }
        });

        track.addEventListener("ended", function() {
            controlBtn.className = "play";
            track.currentTime = 0; // reset the playhead
            scrub.style.width = '0'; // Reset progress bar
            currentTimeDisplay.innerHTML = "00:00"; // Reset current time display
            clearInterval(interval); // Stop updating current time
            if (repeatButton.getAttribute("repeat") > 0) {
                track.play();
                controlBtn.className = "pause";
                // Restart interval for the next play
                interval = setInterval(() => {
                    currentTimeDisplay.innerHTML = formatSecondsAsTime(Math.floor(track.currentTime));
                }, 250);
            }
        });

        // Update the playhead position and time display
        track.addEventListener("timeupdate", function() {
            let playPercent = timelineWidth * (track.currentTime / track.duration);
            playhead.style.marginLeft = playPercent + "px";
            scrub.style.width = playPercent + "px"; // Update scrub bar width
        }, false);

        timeline.addEventListener("click", function(event) {
            movePlayhead(event);
            track.currentTime = track.duration * clickPercent(event);
        }, false);

        function movePlayhead(event) {
            let newMargLeft = event.clientX - getPosition(timeline);
            playhead.style.marginLeft = Math.max(0, Math.min(newMargLeft, timelineWidth)) + "px";
        }

        function getPosition(el) {
            return el.getBoundingClientRect().left;
        }

        function clickPercent(event) {
            return (event.clientX - getPosition(timeline)) / timelineWidth;
        }

        repeatButton.onclick = function () {
            repeatButton.classList.toggle("icon-repeat-again");
            repeatButton.setAttribute("repeat", repeatButton.classList.contains("icon-repeat-again") ? 1 : 0);
        };

        function formatSecondsAsTime(secs) {
            let min = Math.floor(secs / 60);
            let sec = Math.floor(secs % 60);
            return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
        }
    });
});
