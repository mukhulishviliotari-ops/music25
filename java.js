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
});