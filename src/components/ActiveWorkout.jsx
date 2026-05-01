import { useEffect, useState } from "react";

function ActiveWorkout({ workout, setActiveWorkout, onUpdateWorkoutTemplate }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const [restTimer, setRestTimer] = useState(120);
  const [restDuration, setRestDuration] = useState(120);
  const [restInput, setRestInput] = useState(120);
  const [restEndsAt, setRestEndsAt] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isEditingRestTime, setIsEditingRestTime] = useState(false);

  const [sessionExercises, setSessionExercises] = useState(() =>
    workout.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({
        ...set,
        completed: false,
      })),
    }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!restEndsAt) return;

    const timer = setInterval(() => {
      const secondsLeft = Math.max(
        Math.ceil((restEndsAt - Date.now()) / 1000),
        0
      );

      setRestTimer(secondsLeft);

      if (secondsLeft <= 0) {
        setRestEndsAt(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [restEndsAt]);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const formatRestLabel = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    if (minutes > 0 && remainingSeconds === 0) {
      return `${minutes} min${minutes === 1 ? "" : "s"}`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };

  const formatDoneAt = (timestamp) => {
    if (!timestamp) return "Not started";

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const timerProgress = restDuration > 0 ? restTimer / restDuration : 0;

  const selectRestDuration = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 1);

    setRestInput(safeSeconds);
    setRestDuration(safeSeconds);
    setRestTimer(safeSeconds);
    setRestEndsAt(null);
    setIsEditingRestTime(false);
  };

  const startRest = () => {
    const safeSeconds = Math.max(Number(restInput) || 0, 1);

    setRestDuration(safeSeconds);
    setRestTimer(safeSeconds);
    setRestEndsAt(Date.now() + safeSeconds * 1000);
    setIsEditingRestTime(false);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setSessionExercises((prevExercises) =>
      prevExercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  const updateExerciseName = (exerciseIndex, value) => {
    setSessionExercises((prevExercises) =>
      prevExercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? { ...exercise, name: value }
          : exercise
      )
    );
  };

  const getSavedExercises = () =>
    sessionExercises.map((exercise) => ({
      name: exercise.name.trim(),
      sets: exercise.sets.map((set) => ({
        weight: Number(set.weight) || 0,
        reps: Number(set.reps) || 0,
        unit: set.unit || "lbs",
        completed: Boolean(set.completed),
      })),
    }));

  const toggleCompleted = (exerciseIndex, setIndex) => {
    setSessionExercises((prevExercises) =>
      prevExercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex
                  ? { ...set, completed: !set.completed }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  const addSet = (exerciseIndex) => {
    setSessionExercises((prevExercises) =>
      prevExercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                { weight: 0, reps: 0, unit: "lbs", completed: false },
              ],
            }
          : exercise
      )
    );
  };

  const toggleUnit = (exerciseIndex, setIndex) => {
    setSessionExercises((prevExercises) =>
      prevExercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex
                  ? { ...set, unit: set.unit === "lbs" ? "kg" : "lbs" }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  const finishWorkout = () => {
    const cleanedExercises = getSavedExercises().map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets.map((set) => ({
        weight: Number(set.weight) || 0,
        reps: Number(set.reps) || 0,
        unit: set.unit || "lbs",
      })),
    }));

    const updatedTemplate = {
      ...workout,
      exercises: cleanedExercises,
    };

    const savedHistory = localStorage.getItem("workoutHistory");
    const workoutHistory = savedHistory ? JSON.parse(savedHistory) : [];

    const completedWorkout = {
      id: crypto.randomUUID(),
      workoutId: workout.id,
      name: workout.name,
      date: new Date().toISOString(),
      duration: elapsedSeconds,
      exercises: cleanedExercises,
    };

    localStorage.setItem(
      "workoutHistory",
      JSON.stringify([...workoutHistory, completedWorkout])
    );

    const savedWorkouts = localStorage.getItem("workouts");
    const workouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];

    const updatedWorkouts = workouts.map((savedWorkout) =>
      savedWorkout.id === workout.id ? updatedTemplate : savedWorkout
    );

    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));

    if (onUpdateWorkoutTemplate) {
      onUpdateWorkoutTemplate(updatedTemplate);
    }

    setActiveWorkout(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "600px",
          background: "#1e1e1e",
          color: "inherit",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 5000,
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "12px", opacity: 0.7 }}>Active Workout</div>
          <strong>{workout.name}</strong>
        </div>

        <div style={{ fontWeight: "bold", fontSize: "18px" }}>
          {formatTime(elapsedSeconds)}
        </div>
      </button>

      {isExpanded && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 6000,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: "16px",
              padding: "22px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>{workout.name}</h2>
                <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                  Workout time: {formatTime(elapsedSeconds)}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsTimerOpen(true);
                  }}
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ⏱️
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {sessionExercises.map((exercise, exerciseIndex) => (
              <div
                key={exerciseIndex}
                style={{
                  background: "#2a2a2a",
                  borderRadius: "12px",
                  padding: "14px",
                  marginBottom: "12px",
                }}
              >
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(event) =>
                    updateExerciseName(exerciseIndex, event.target.value)
                  }
                  placeholder="Exercise name"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    marginBottom: "12px",
                    fontWeight: "bold",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 2fr 1fr 80px",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "12px",
                    opacity: 0.7,
                  }}
                >
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>Done</span>
                </div>

                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 2fr 1fr 80px",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ opacity: 0.75 }}>#{setIndex + 1}</div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 54px",
                        gap: "6px",
                      }}
                    >
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(event) =>
                          updateSet(
                            exerciseIndex,
                            setIndex,
                            "weight",
                            event.target.value
                          )
                        }
                        placeholder="weight"
                        min="0"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #444",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => toggleUnit(exerciseIndex, setIndex)}
                        style={{
                          height: "38px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {set.unit || "lbs"}
                      </button>
                    </div>

                    <input
                      type="number"
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(
                          exerciseIndex,
                          setIndex,
                          "reps",
                          event.target.value
                        )
                      }
                      placeholder="reps"
                      min="0"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #444",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => toggleCompleted(exerciseIndex, setIndex)}
                      style={{
                        height: "38px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      {set.completed ? "✓" : "—"}
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSet(exerciseIndex)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px dashed #777",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    marginTop: "4px",
                  }}
                >
                  + Add Set
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={finishWorkout}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Finish Workout
            </button>
          </div>
        </div>
      )}

      {isTimerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: "18px",
              padding: "22px",
              width: "100%",
              maxWidth: "420px",
              position: "relative",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setIsTimerOpen(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </button>

            <h2 style={{ margin: "0 0 18px" }}>Rest Timer</h2>

            <div
              style={{
                width: "220px",
                height: "220px",
                margin: "0 auto 22px",
                position: "relative",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg width="220" height="220" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="#4a4a4a"
                  strokeWidth="16"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="#4da3ff"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 92}
                  strokeDashoffset={
                    2 * Math.PI * 92 *
                    (1 - Math.max(Math.min(timerProgress, 1), 0))
                  }
                  transform="rotate(-90 110 110)"
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isEditingRestTime ? (
                  <input
                    autoFocus
                    type="number"
                    min="1"
                    value={restInput}
                    onChange={(event) => {
                      setRestInput(event.target.value);
                      setRestTimer(Number(event.target.value) || 0);
                    }}
                    onBlur={() => selectRestDuration(restInput)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        selectRestDuration(restInput);
                      }
                    }}
                    style={{
                      width: "96px",
                      textAlign: "center",
                      fontSize: "30px",
                      fontWeight: "bold",
                      border: "none",
                      borderRadius: "10px",
                      padding: "6px",
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingRestTime(true)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      fontSize: "34px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {formatTime(restTimer)}
                  </button>
                )}

                <div style={{ marginTop: "6px", opacity: 0.7 }}>
                  {formatRestLabel(restDuration)}
                </div>
                <div style={{ marginTop: "4px", fontSize: "13px", opacity: 0.65 }}>
                  {restEndsAt ? `Done at ${formatDoneAt(restEndsAt)}` : "Not started"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {[120, 180, 240, 300].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => selectRestDuration(seconds)}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {formatRestLabel(seconds)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={startRest}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Set Timer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ActiveWorkout;
