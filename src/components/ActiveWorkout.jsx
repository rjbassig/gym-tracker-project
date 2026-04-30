import { useEffect, useState } from "react";

function ActiveWorkout({ workout, setActiveWorkout, onUpdateWorkoutTemplate }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [restInput, setRestInput] = useState(120);

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
    if (restTimer <= 0) return;

    const timer = setInterval(() => {
      setRestTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [restTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
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

  const startRest = (seconds) => {
    setRestTimer(seconds);
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
                <button type="button" onClick={() => startRest(120)}>2m</button>
                <button type="button" onClick={() => startRest(180)}>3m</button>
                <button type="button" onClick={() => startRest(240)}>4m</button>
                <button type="button" onClick={() => startRest(300)}>5m</button>

                <input
                  type="number"
                  value={restInput}
                  onChange={(event) => setRestInput(Number(event.target.value))}
                  style={{
                    width: "64px",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                  }}
                />

                <button type="button" onClick={() => startRest(restInput)}>
                  Rest
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

            {restTimer > 0 && (
              <div
                style={{
                  background: "#2a2a2a",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "16px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Rest Timer: {formatTime(restTimer)}
              </div>
            )}

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
    </>
  );
}

export default ActiveWorkout;
