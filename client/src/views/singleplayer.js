import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { fetchWords } from "../stores/actions/wordAction";
import { useDispatch, useSelector } from "react-redux";
import Timer from "../components/Timer";
import Voice from "../components/Voice";
import useSound from "use-sound";
import winSound from "../sounds/Winv2.mp3";
import failSound from "../sounds/Dung.mp3";
import JSConfetti from "js-confetti";
import failGameSound from "../sounds/FailGuess.mp3";
import questionMark from "../question.png";
import { makeLeaderboard } from "../stores/actions/leaderboardAction";
import { useNavigate } from "react-router-dom";
const Singleplayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { words, solution } = useSelector((state) => state.words);
  const [answer, setAnswer] = React.useState("");
  const [guesses, setGuesses] = React.useState(6);
  const [pastAnswers, setPastAnswers] = React.useState([]);
  const [isCorrect, setIsCorrect] = React.useState(false);
  const [localWords, setLocalWords] = React.useState([]);
  const [localSolution, setLocalSolution] = React.useState("");
  const [remainSeconds, setRemainSeconds] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [hint, setHint] = React.useState(false);
  const [openHelp, setOpenHelp] = React.useState(false);
  const [wrong, setWrong] = React.useState(false);
  const [timeup, setTimeup] = React.useState(false);
  const [lose, setLose] = React.useState(false);
  const [answerByVoice, setAnswerByVoice] = React.useState(false);
  const [gameDone, setGameDone] = React.useState(false);
  const [playWin] = useSound(winSound);
  const [playGuessWrong] = useSound(failSound);
  const [playIncorrectAll] = useSound(failGameSound);
  const jsConfetti = new JSConfetti();
  function answerHandler(e) {
    setAnswer(e.target.value);
  }
  function answerVoice(finalTranscript) {
    finalTranscript = finalTranscript.replace(".", "");
    if (finalTranscript == "11") {
      finalTranscript = "Seblak";
    }
    setAnswer(finalTranscript);
    setAnswerByVoice(true);
  }
  React.useEffect(() => {
    if (answerByVoice) {
      autoEnter();
      setAnswerByVoice(false);
    }
  }, [answerByVoice]);

  function autoEnter() {
    if (answer && guesses > 0) {
      const remainingGuesses = guesses - 1;
      console.log(remainingGuesses, "REMAINING GUESSES");
      if (remainingGuesses === 0) setLose(true);
      setGuesses(remainingGuesses);
      // when the user has guessed the user's remaining guesses is stored in localStorage
      // if user reloads the page, he/she will still have the same number of remaining guesses
      localStorage.setItem("user_guesses", remainingGuesses);
      console.log(answer, "ANSWER");
      const userGuess = localWords.find(
        (el) => el.name.toLowerCase() === answer.toLowerCase()
      );
      if (userGuess) {
        const keys = Object.keys(userGuess);
        const obj = {};
        let allCorrect = true;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key === "id") continue;
          if (
            userGuess.name.toLowerCase() !== localSolution.name.toLowerCase()
          ) {
            if (localStorage.getItem("user_guesses") !== "0") {
              playGuessWrong();
            }
            obj[key] = {
              value: userGuess[key],
              isCorrect: false,
            };
            allCorrect = false;
            continue;
          }
          if (userGuess[key] !== localSolution[key]) {
            obj[key] = {
              value: userGuess[key],
              isCorrect: false,
            };
            allCorrect = false;
            continue;
          }
          obj[key] = {
            value: userGuess[key],
            isCorrect: true,
          };
        }
        const temp = [...pastAnswers, obj];
        setPastAnswers(temp);
        localStorage.setItem("pastAnswers", JSON.stringify(temp));
        if (allCorrect) setIsCorrect(true);
      } else {
        // if the user's answer does not exist do something
        if (localStorage.getItem("user_guesses") !== "0") {
          playGuessWrong();
        }
        setWrong(true);
      }
      setAnswer("");
    }
  }
  function onEnter(e) {
    // user can only submit if answer is truthy and guesses are above 0
    if (e.key === "Enter" && answer && guesses > 0) {
      const remainingGuesses = guesses - 1;
      if (remainingGuesses === 0) setLose(true);
      setGuesses(remainingGuesses);
      // when the user has guessed the user's remaining guesses is stored in localStorage
      // if user reloads the page, he/she will still have the same number of remaining guesses
      localStorage.setItem("user_guesses", remainingGuesses);
      const userGuess = localWords.find(
        (el) => el.name.toLowerCase() === answer.toLowerCase()
      );
      if (userGuess) {
        const keys = Object.keys(userGuess);
        const obj = {};
        let allCorrect = true;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key === "id") continue;
          if (
            userGuess.name.toLowerCase() !== localSolution.name.toLowerCase()
          ) {
            if (localStorage.getItem("user_guesses") !== "0") {
              playGuessWrong();
            }
            obj[key] = {
              value: userGuess[key],
              isCorrect: false,
            };
            allCorrect = false;
            continue;
          }
          if (userGuess[key] !== localSolution[key]) {
            obj[key] = {
              value: userGuess[key],
              isCorrect: false,
            };
            allCorrect = false;
            continue;
          }
          obj[key] = {
            value: userGuess[key],
            isCorrect: true,
          };
        }
        const temp = [...pastAnswers, obj];
        setPastAnswers(temp);
        localStorage.setItem("pastAnswers", JSON.stringify(temp));
        if (allCorrect) setIsCorrect(true);
      } else {
        // if the user's answer does not exist do something
        if (localStorage.getItem("user_guesses") !== "0") {
          playGuessWrong();
        }
        setWrong(true);
      }
      setAnswer("");
    }
  }
  React.useEffect(() => {
    dispatch(fetchWords());
  }, []);
  React.useEffect(() => {
    // If user is correct do something
    if (isCorrect) {
      playWin();
      localStorage.setItem("win", true);
      localStorage.setItem("remainingTime", remainSeconds);
      const totalGuesses = +localStorage.getItem("user_guesses");
      let guessScore;
      switch (totalGuesses) {
        case 5:
          guessScore = 60;
          break;
        case 4:
          guessScore = 50;
          break;
        case 3:
          guessScore = 40;
          break;
        case 2:
          guessScore = 30;
          break;
        case 1:
          guessScore = 20;
          break;
        default:
          guessScore = 10;
          break;
      }
      let timeScore;
      const secondsLeft = +localStorage.getItem("remainingTime");

      if (secondsLeft >= 240 && secondsLeft <= 300) {
        timeScore = 60;
      } else if (secondsLeft >= 180) {
        timeScore = 50;
      } else if (secondsLeft >= 120) {
        timeScore = 40;
      } else if (secondsLeft >= 60) {
        timeScore = 30;
      } else if (secondsLeft >= 30) {
        timeScore = 20;
      } else if (secondsLeft >= 0) {
        timeScore = 10;
      }

      const score = guessScore + timeScore;
      localStorage.setItem("score", score);
      setOpen(true);
      setGameDone(true);
      jsConfetti.addConfetti({
        confettiRadius: 2,
        confettiNumber: 100,
        emojis: ["🍔", "🥓", "🍟", "🍣"],
        emojiSize: 60,
      });
    }
    if (
      isCorrect === false &&
      +localStorage.getItem("user_guesses") === 0 &&
      localStorage.getItem("user_guesses") !== null
    ) {
      localStorage.setItem("win", false);
      localStorage.setItem("score", 0);
      setGameDone(true);
    }
    if (
      isCorrect === false &&
      +localStorage.getItem("remainingTime") === 0 &&
      !localStorage.getItem("win")
    ) {
      localStorage.setItem("win", false);
      localStorage.setItem("score", 0);
      setGameDone(true);
    }
  }, [
    isCorrect,
    localStorage.getItem("user_guesses"),
    localStorage.getItem("remainingTime"),
  ]);
  React.useEffect(() => {
    setLocalWords(words);
  }, [words]);
  React.useEffect(() => {
    setLocalSolution(solution);
  }, [solution]);
  React.useEffect(() => {
    if (localStorage.getItem("access_token") && gameDone) {
      dispatch(
        makeLeaderboard({
          score: localStorage.getItem("score"),
          guess: +localStorage.getItem("user_guesses"),
          time: 300 - +localStorage.getItem("remainingTime"),
        })
      );
    }
  }, [gameDone]);
  function close() {
    setOpen(false);
  }
  function closeHelp() {
    setOpenHelp(false);
  }
  React.useEffect(() => {
    if (lose) {
      playIncorrectAll();
    }
  }, [lose]);
  function removeItem() {
    localStorage.removeItem("index");
    localStorage.removeItem("score");
    localStorage.removeItem("user_guesses");
    localStorage.removeItem("remainingTime");
    localStorage.removeItem("win");
    localStorage.removeItem("pastAnswers");
    localStorage.removeItem("time");
  }
  function goBackHome() {
    return (
      <button
        type="button"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:scale-105 duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        onClick={() => {
          setTimeup(false);
          setLose(false);
          removeItem();
          navigate("/", { replace: true });
        }}
      >
        Go Back Home
      </button>
    );
  }
  return (
    <>

      <div className="absolute top-31 right-2 h-10 w-10 ...">
        <button onClick={() => setOpenHelp(true)}><img
          src={questionMark}
          className="h-12 w-12 rounded-lg mb-6 mt-2 shadow-lg"
        /></button>

      </div>
      <div className="flex flex-col items-center overflow-hidden">
        <div className="flex justify-center">
          <Timer
            isCorrect={isCorrect}
            remainSeconds={remainSeconds}
            setRemainSeconds={setRemainSeconds}
            setTimeup={setTimeup}
            setLose={setLose}
          />
        </div>
        {/* <div class="relative h-32 w-32 ...">
        <div class="absolute top-0 right-0 h-16 w-16 ...">03</div>
      </div> */}
        {/*User Input */}
        <button
          onClick={() => setHint(true)}
          // style={{backgroundColor: '#06AED5'}}
          className="py-1 px-2 w-16 justify-center items-center bg-orange-500 rounded-lg text-white hover:bg-orange-600 mt-3 font-medium shadow-md"
        >
          Hint
        </button>

        <div className="flex w-[100%] justify-center items-center space-x-4 mb-4 ml-[5rem] mt-2">

          {/* User can only submit when answer is truthy User can submit using the Enter key (handled by
        the onEnter function) */}
          <input
            placeholder="Answer Here"
            type="text"
            onChange={answerHandler}
            onKeyPress={onEnter}
            className="bg-yellow-400 border-b-2 rounded-lg outline-none bg-opacity-80 w-[60%] h-12 text-black placeholder:text-gray-500 font-medium text-center text-xl"
            value={answer}
          />
          <Voice answerVoice={answerVoice}></Voice>
        </div>
        {/* //? hint */}
        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          appear
          show={hint}
          as={React.Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={close}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />

            <div className="fixed inset-0 overflow-y-auto mx-auto w-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center ">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-gray-200 rounded-2xl bg-white p-6 text-left flex flex-col items-center shadow-xl transition-all">
                  {/* //? solution image */}
                  {solution && (
                    <div className="w-full flex flex-col items-center ">
                      {/* //? solution name */}
                      <h2 className="text-orange-500 text-center font-bold font-mono text-lg mt-2">
                        Clue
                      </h2>
                      <h2 className="text-black text-center font-medium font-mono text-base mt-4 text-transform: capitalize ">
                        {solution.clue}
                      </h2>
                    </div>
                  )}
                  {/* //? num of guesses */}

                  <div className="mt-4 w-full flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setHint(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>
        {/* //! word not found */}
        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          appear
          show={wrong}
          as={React.Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={close}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />

            <div className="fixed inset-0 overflow-y-auto mx-auto w-48 ">
              <div className="flex min-h-full items-center justify-center p-2 text-center">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left flex flex-col items-center shadow-xl transition-all">
                  <h2 className="text-red-400 text-center font-bold font-mono text-lg mt-4">
                    Invalid Word
                  </h2>

                  <div className="mt-4 w-full flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setWrong(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>
        {/* //* Win Modal */}
        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          appear
          show={open}
          as={React.Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={close}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left flex flex-col items-center shadow-xl transition-all">
                  {/* //? solution image */}
                  {solution && (
                    <div className="w-full flex flex-col items-center">
                      <img
                        src={solution.imgUrl}
                        className="h-36 w-36 rounded-lg mb-6 shadow-lg"
                      />
                      <div className="border-b-2 border-orange-400 w-full mb-6"></div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl text-center font-medium leading-6 text-orange-400"
                      >
                        Congrats!
                      </Dialog.Title>
                      {/* //? solution name */}
                      <h2 className="text-orange-400 text-center font-semibold text-xl mt-4">
                        The answer is <span className="font-bold">{solution.name} </span>
                      </h2>
                    </div>
                  )}
                  {/* //? num of player guesses */}
                  <div className="my-4 text-center flex justify-evenly w-full">
                    <div className="flex flex-col bg-opacity-80 shadow-xl bg-orange-600 text-white  w-20 h-20 rounded-full justify-center">
                      <h1 className="text-xs">Attempt(s)</h1>
                      <p className="text-xl text-violet-100 font-semibold">
                        {6 - localStorage.getItem("user_guesses")}
                      </p>
                    </div>
                    {/* //? duration */}
                    <div className="flex flex-col bg-opacity-80 shadow-xl bg-orange-600 text-white w-20 h-20 rounded-full justify-center">
                      <h1 className="text-xs">Time</h1>

                      {Math.floor(
                        (300 - localStorage.getItem("remainingTime")) / 60
                      ) > 0 && (
                        <p className="text-xl font-semibold">
                          {Math.floor(
                            (300 - localStorage.getItem("remainingTime")) / 60
                          )}
                          <span className="text-sm">m </span>
                          {(300 - localStorage.getItem("remainingTime")) % 60}
                          <span className="text-sm">s</span>
                        </p>
                      )}
                      {Math.floor(
                        (300 - localStorage.getItem("remainingTime")) / 60
                      ) === 0 && (
                        <p className="text-xl font-semibold">
                          {(300 - localStorage.getItem("remainingTime")) % 60}
                          <span className="text-sm font-thin">s</span>
                        </p>
                      )}
                    </div>
                    {/* //? score */}
                    <div className="flex flex-col bg-opacity-80 shadow-xl bg-orange-600 text-white w-20 h-20 rounded-full justify-center">
                      <h1 className="text-white text-xs">Score</h1>
                      <p className="text-xl text-white font-semibold">
                        {localStorage.getItem("score")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 w-full flex justify-center">
                    {goBackHome()}
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* //? Modal help */}
        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          appear
          show={openHelp}
          as={React.Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={closeHelp}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />


            <div className="fixed inset-0 overflow-y-auto mx-auto w-auto" >
              <div className="flex min-h-full items-center justify-center p-4 text-center" >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left flex flex-col items-center shadow-xl transition-all"

                  style={{ backgroundColor: `lightgray` }}
                >
                  {/* //? solution image */}
                  <div className="w-full flex flex-col">
                    <h2 className="text-yellow-700 text-center font-bold font-mono text-lg mt-4">
                      Guess the mystery food!
                    </h2>
                    <h2 className="text-black font-thin font-mono text-base mt-4">

                      • You get <span className="font-bold">six</span> guesses, try any food you want!

                    </h2>
                    <h2 className="text-black font-thin font-mono text-base mt-4">

                      • <span style={{ color: `green`, fontWeight: '600' }}>Green in any column</span> indicates a match!
                    </h2>
                    <h2 className="text-black font-thin font-mono text-base mt-4">
                      • <span style={{ color: `red`, fontWeight: '600' }}>Red in any column</span> indicates a mismatch!

                    </h2>
                    <h2 className="text-black font-thin font-mono text-base mt-4">
                      • If you get stuck, try clicking hint button!
                    </h2>
                  </div>
                  {/* //? num of guesses */}

                  <div className="mt-4 w-full flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setOpenHelp(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>
        {/* //? Modal out of time */}
        <Transition
          appear
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          show={timeup}
          as={React.Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={close}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-white rounded-2xl p-6 text-left flex flex-col items-center shadow-xl transition-all">
                  {/* //? solution image */}
                  <Dialog.Title
                    as="h1"
                    className="text-3xl text-center mb-4 leading-6 text-rose-600"
                  >
                    Time's up!
                  </Dialog.Title>
                  {solution && (
                    <div className="font-mono w-full flex flex-col text-zinc-700 items-center">
                      <img
                        src={solution.imgUrl}
                        className="h-36 w-36 rounded-lg mb-6 shadow-lg"
                      />
                      {/* //? solution name */}
                      <h2>The answer is</h2>
                      <h2 className="text-[30px] ">{solution.name}</h2>
                    </div>
                  )}
                  {/* //? num of guesses */}

                  <div className="mt-4 w-full flex justify-center">
                    {goBackHome()}
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* //! Modal lose */}
        <Transition
          appear
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          show={lose}
          as={React.Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={close}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left flex flex-col items-center shadow-xl transition-all">
                  <Dialog.Title
                    as="h1"
                    className="text-[35px]  text-center mb-6 leading-6 text-rose-600"
                  >
                    Game Over
                  </Dialog.Title>
                  {solution && (
                    <div className="font-mono w-full flex flex-col text-zinc-700 items-center">
                      {/* //? solution image */}
                      <img
                        src={solution.imgUrl}
                        className="h-36 w-36 rounded-lg mb-6 shadow-lg"
                      />
                      <h2>The answer is</h2>
                      {/* //? solution name */}
                      <h2 className="text-[30px] font-normal">{solution.name}</h2>
                    </div>
                  )}
                  {/* //? num of guesses */}

                  <div className="mt-4 w-full flex justify-center">
                    {goBackHome()}
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>
        {JSON.parse(localStorage.getItem("pastAnswers")) && (
          <div className="bg-black overflow-y-auto w-[60%] bg-opacity-70 rounded-lg p-[10px]">
            <table className="mr-[18vh] w-3/4 max-h-[40vh] text-center mx-auto text-white border-separate border-spacing-0.5">
              <thead >
                <tr>
                  <th>Name</th>
                  <th>From</th>
                  <th>Color</th>
                  <th>Flavor</th>
                </tr>
              </thead>
              <tbody >
                {localStorage.getItem("pastAnswers") &&

                  JSON.parse(localStorage.getItem("pastAnswers")).map((el, i) => {
                    return (
                      <tr key={`uniquekey${i}`} className="h-16 text-lg text-transform: capitalize">
                        {/* if el.isCorrect false show red color */}
                        {/* if el.isCorrect true show green color */}
                        <td>{el.name.value}</td>
                        {el.location.value == solution.location ? (
                          <td className="bg-emerald-500 bg-opacity-60 text-transform: capitalize text-lg rounded-l-lg ">
                            {el.location.value}
                          </td>
                        ) : (
                          <td className="bg-rose-500 bg-opacity-60 text-lg text-transform: capitalize rounded-l-lg">
                            {el.location.value}
                          </td>
                        )}
                        {el.color.value == solution.color ? (
                          <td className="bg-emerald-500 text-lg text-transform: capitalize bg-opacity-60">
                            {el.color.value}
                          </td>
                        ) : (
                          <td className="bg-rose-500 text-lg text-transform: capitalize bg-opacity-60">
                            {el.color.value}
                          </td>
                        )}
                        {el.taste.value == solution.taste ? (
                          <td className="bg-emerald-500 text-lg text-transform: capitalize bg-opacity-60 rounded-r-lg">
                            {el.taste.value}
                          </td>
                        ) : (
                          <td className="bg-rose-500 text-lg text-transform: capitalize bg-opacity-60 rounded-r-lg">
                            {el.taste.value}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
export default Singleplayer;
