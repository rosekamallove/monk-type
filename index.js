const State = {
  REMAINING: "REMAINING",
  ERROR: "ERROR",
  TYPED: "TYPED",
  SKIPPED: "SKIPPED",
};

const intro_elm = document.getElementById("intro");

const game_elm = document.getElementById("game");
const text_elm = document.getElementById("text");
const caret_elm = document.getElementById("caret");

const score_elm = document.getElementById("score");
const wpm_elem = document.getElementById("wpm");
const acc_elem = document.getElementById("accuracy");

const render = (game_state) => {
  const text_html = game_state.sequence
    .map(({ character, state }, idx) => {
      let cls = [];
      switch (state) {
        case State.REMAINING:
          break;
        case State.ERROR:
          cls.push("error");
          break;
        case State.TYPED:
          cls.push("correct");
          break;
        case State.SKIPPED:
          cls.push("skipped");
          break;
      }
      if (idx === game_state.position) {
        cls.push("current");
      }
      return `<span class="${cls.join(" ")}">${character}</span>`;
    })
    .join("");
  text_elm.innerHTML = text_html;

  const current_elm = text_elm.querySelector(".current");
  if (current_elm !== null) {
    const bbox = current_elm.getBoundingClientRect();
    caret_elm.style.left = bbox.left - 1 + "px";
    caret_elm.style.top = bbox.top + "px";
    caret_elm.style.height = bbox.height + "px";
  } else {
    console.info(text_html);
  }
};

const alphabet = new Set(
  [...Array(26)].map((_, i) => String.fromCharCode(i + "a".charCodeAt(0)))
);
alphabet.add(" ");

let score;

const start = () => {
  const words = shuffle(dictionary).slice(0, 20);

  document.getElementById("game").style.display = "";
  const text = words.join(" ");

  const game_state = {
    position: 0,
    sequence: Array.from(text).map((character) => ({
      character,
      state: State.REMAINING,
    })),
  };

  const letter_count = text.length;

  const get_at = (position) => game_state.sequence[position];
  const get_current = () => get_at(game_state.position);

  let word_count = 0;
  let done;
  let start_time = null;
  let error_pos = new Set();
  let was_skipped = false;

  const onkeydown = (e) => {
    e.preventDefault();
    const key = e.key.toLowerCase();
    console.log(key);
    console.log("position:", game_state.position);
    const last_position = game_state.position;
    if (key === "backspace") {
      console.log("processing backspace");
      if (game_state.position > 0) {
        game_state.position--;
        game_state.sequence[game_state.position].state = State.REMAINING;
      }
    } else if (alphabet.has(key)) {
      console.log("processing letter");
      const current = get_current();
      if (current.character === key) {
        current.state = State.TYPED;
        if (key === " ") {
          word_count++;
        }
        game_state.position++;
      } else if (key === " ") {
        if (
          game_state.position > 0 &&
          get_at(game_state.position - 1).character !== " "
        ) {
          let position = game_state.position;
          while (
            position < game_state.sequence.length &&
            get_at(position).character !== " "
          ) {
            error_pos.add(position);
            get_at(position).state = State.SKIPPED;
            was_skipped = true;
            position++;
          }
          game_state.position = position;
          game_state.position++;
        }
      } else {
        current.state = State.ERROR;
        error_pos.add(game_state.position);
        game_state.position++;
      }
    }
    if (last_position !== game_state.position) {
      render(game_state);
    }
    if (game_state.position > 0 && start_time === null) {
      start_time = performance.now();
    }
    if (game_state.position >= game_state.sequence.length) {
      if (!was_skipped) {
        // for the last word we don't type space so
        // we count it at the end unless it's skipped
        word_count++;
      }
      done();
    }
  };

  done = () => {
    window.removeEventListener("keydown", onkeydown);
    console.log("done");
    game_elm.style.display = "none";
    const end_time = performance.now();
    score(end_time - start_time, word_count, error_pos.size, letter_count);
  };

  window.addEventListener("keydown", onkeydown);

  render(game_state);
};

const bind_play = (elm) => {
  const onkeydown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      elm.style.display = "none";
      window.removeEventListener("keydown", onkeydown);
      start();
    }
  };
  window.addEventListener("keydown", onkeydown);
};

score = (duration, word_count, errors, letter_count) => {
  bind_play(score_elm);
  score_elm.style.display = "";
  const wpm = word_count / (duration / 60000);
  const acc = 1 - errors / letter_count;

  wpm_elem.textContent = `${Math.round(wpm)}`;
  acc_elem.textContent = `${Math.round(acc * 100)}%`;
};

const init = () => {
  bind_play(intro_elm);
};

init();
