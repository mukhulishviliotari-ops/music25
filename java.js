document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("input");
    const suggestions = document.getElementById("suggestions");
    const boxes = document.querySelectorAll(".covers h2");
    
    const audio = document.getElementById("audio");
    const progress = document.getElementById("progress");

    if (!input || !suggestions) return;


    input.addEventListener("input", () => {
        const value = input.value.toLowerCase().trim();
        suggestions.innerHTML = "";

        if (!value) {
            resetView();
            return;
        }


        highlightOnly(value);


        boxes.forEach(box => {
            const name = box.textContent.trim();

            if (name.toLowerCase().startsWith(value)) {
                const li = document.createElement("li");
                li.textContent = name;

                li.addEventListener("click", () => {
                    input.value = name;
                    highlightOnly(name.toLowerCase());
                    suggestions.innerHTML = "";
                });

                suggestions.appendChild(li);
            }
        });
    });


    function highlightOnly(searchValue) {
        boxes.forEach(box => {
            const text = box.textContent.toLowerCase().trim();

            const card = box.closest('[class*="box"]');

            if (!card) return;

            if (text.includes(searchValue)) {
                card.classList.add("active");
                card.classList.remove("blur");
            } else {
                card.classList.add("blur");
                card.classList.remove("active");
            }
        });
    }

    function resetView() {
        boxes.forEach(box => {
            const card = box.closest('[class*="box"]');
            if (card) {
                card.classList.remove("active", "blur");
            }
        });
    }


    if (audio && progress) {
        audio.addEventListener("timeupdate", () => {
            if (audio.duration && !isNaN(audio.duration)) {
                progress.value = (audio.currentTime / audio.duration) * 100;
            }
        });

        progress.addEventListener("input", () => {
            if (audio.duration) {
                audio.currentTime = (progress.value / 100) * audio.duration;
            }
        });
    }

    // Simple track mapping (only add files you have in the project)
    const trackMap = {
        "Nirvana": "Nirvana - Come As You Are (Official Music Video).mp3",
        "Aphex Twin": "",
        "Radiohead": "",
        "Pink Floyd": "",
        "TV Girl": "",
        "Muse": "",
        "HRT": "",
        "Tame Impala": ""
    };

    // Clicking a cover's title will try to load and play a mapped track
    boxes.forEach(box => {
        const name = box.textContent.trim();
        const card = box.closest('[class*="box"]');
        if (card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const file = trackMap[name];
                if (file) {
                    audio.src = file;
                    const coverNameEl = document.querySelector('.cover-name');
                    const songNameEl = document.querySelector('.song-name');
                    if (coverNameEl) coverNameEl.textContent = name;
                    if (songNameEl) songNameEl.textContent = file.replace(/\.(mp3|wav|m4a)$/, '');
                    audio.play().catch(() => {});
                }
            });
        }
    });

    // Expose functions for the inline onclick handlers in the HTML
    window.playMusic = () => {
        if (audio) audio.play().catch(() => {});
    };

    window.pauseMusic = () => {
        if (audio) audio.pause();
    };
});