document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input");

    console.log(input); // test if it works
});
const suggestions = document.getElementById("suggestions");
const boxes = document.querySelectorAll(".covers h2");

input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    suggestions.innerHTML = "";

    if (!value) {
        resetView();
        return;
    }

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

function highlightOnly(value) {
    boxes.forEach(box => {
        const text = box.textContent.toLowerCase().trim();

        if (text.includes(value)) {
            box.parentElement.classList.add("active");
            box.parentElement.classList.remove("blur");
        } else {
            box.parentElement.classList.add("blur");
            box.parentElement.classList.remove("active");
        }
    });
}

function resetView() {
    boxes.forEach(box => {
        box.parentElement.classList.remove("active", "blur");
    });
}






//!audio


const audio = document.getElementById("audio");
const progress = document.getElementById("progress");

function playMusic() {
    audio.play();
}

function pauseMusic() {
    audio.pause();
}

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