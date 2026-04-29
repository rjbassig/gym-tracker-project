
import { useState } from "react";

function WorkoutList({ workouts, onAddWorkout, onDeleteWorkout, onStartWorkout, activeWorkout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: [{ weight: "", reps: "", unit: "lbs" }] },
  ]);

  const resetForm = () => {
    setWorkoutName("");
    setExercises([{ name: "", sets: [{ weight: "", reps: "", unit: "lbs" }] }]);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleStartWorkout = (workout) => {
    onStartWorkout(workout);
  };

  const addExercise = () => {
    setExercises((prevExercises) => [
      ...prevExercises,
      { name: "", sets: [{ weight: "", reps: "", unit: "lbs" }] },
    ]);
  };

  const updateExercise = (exerciseIndex, value) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, name: value } : exercise
      )
    );
  };

  const removeExercise = (exerciseIndex) => {
    setExercises((prevExercises) =>
      prevExercises.filter((_, index) => index !== exerciseIndex)
    );
  };

  const addSetToExercise = (exerciseIndex) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: [...exercise.sets, { weight: "", reps: "", unit: "lbs" }],
            }
          : exercise
      )
    );
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise, index) =>
        index === exerciseIndex
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

  const adjustSetWeight = (exerciseIndex, setIndex, amount) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) => {
                if (currentSetIndex !== setIndex) return set;

                const currentWeight = Number(set.weight) || 0;
                const nextWeight = Math.max(0, currentWeight + amount);

                return { ...set, weight: String(nextWeight) };
              }),
            }
          : exercise
      )
    );
  };

  const toggleSetUnit = (exerciseIndex, setIndex) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise, index) =>
        index === exerciseIndex
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

  const saveWorkout = (event) => {
    event.preventDefault();

    const cleanedName = workoutName.trim();
    if (!cleanedName) return;

    const cleanedExercises = exercises
      .map((exercise) => ({
        name: exercise.name.trim(),
        sets: exercise.sets
          .map((set) => ({
            weight: Number(set.weight) || 0,
            reps: Number(set.reps) || 0,
            unit: set.unit || "lbs",
          }))
          .filter((set) => set.weight > 0 || set.reps > 0),
      }))
      .filter((exercise) => exercise.name !== "");

    onAddWorkout({
      name: cleanedName,
      exercises: cleanedExercises,
    });

    closeModal();
  };

  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <h2 style={{ margin: 0 }}>Workouts</h2>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Create workout"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontSize: "26px",
            lineHeight: "42px",
          }}
        >
          +
        </button>
      </div>

      {workouts.length === 0 ? (
        <div
          style={{
            background: "#2a2a2a",
            borderRadius: "12px",
            padding: "18px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          No workouts.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          {workouts.map((workout) => (
            <div
              key={workout.id}
              style={{
                background: "#2a2a2a",
                borderRadius: "12px",
                padding: "14px",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 8px" }}>{workout.name}</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: "14px" }}>
                  {workout.exercises.length} exercise
                  {workout.exercises.length === 1 ? "" : "s"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                {activeWorkout && activeWorkout.id === workout.id ? (
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "default",
                      fontWeight: "bold",
                    }}
                  >
                    Active Workout
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartWorkout(workout)}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Start
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteWorkout(workout.id)}
                      style={{
                        padding: "9px 10px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: "16px",
              padding: "22px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <h2 style={{ margin: 0 }}>Create Workout</h2>

              <button
                type="button"
                onClick={closeModal}
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

            <form onSubmit={saveWorkout}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Workout Name
              </label>

              <input
                type="text"
                value={workoutName}
                onChange={(event) => setWorkoutName(event.target.value)}
                placeholder="Example: Push Day"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #444",
                  marginBottom: "18px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ margin: 0 }}>Exercises</h3>
                <span style={{ opacity: 0.7, fontSize: "14px" }}>
                  Exercise / Sets
                </span>
              </div>

              {exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exerciseIndex}
                  style={{
                    background: "#2a2a2a",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, event.target.value)
                      }
                      placeholder="Exercise name"
                      style={{
                        flex: 1,
                        boxSizing: "border-box",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #444",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => removeExercise(exerciseIndex)}
                      disabled={exercises.length === 1}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: exercises.length === 1 ? "not-allowed" : "pointer",
                        opacity: exercises.length === 1 ? 0.4 : 1,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 2fr 1fr",
                      gap: "8px",
                      marginBottom: "8px",
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    <span>Set</span>
                    <span>Weight</span>
                    <span>Reps</span>
                  </div>

                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 2fr 1fr",
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
                          alignItems: "center",
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
                          onClick={() => toggleSetUnit(exerciseIndex, setIndex)}
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
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSetToExercise(exerciseIndex)}
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
                onClick={addExercise}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px dashed #777",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  marginBottom: "14px",
                }}
              >
                + Add Exercise
              </button>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Save Workout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutList;
