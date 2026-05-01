
import { useState } from "react";

function WorkoutList({
  workouts,
  onAddWorkout,
  onDeleteWorkout,
  onStartWorkout,
  onUpdateWorkout,
  activeWorkout,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: [{ weight: "", reps: "", unit: "lbs" }] },
  ]);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const visibleWorkouts = workouts.slice(0, 4);
  const hasExtraWorkouts = workouts.length > 4;
  const isWorkoutLimitReached = workouts.length >= 10 && !editingWorkoutId;
  const isEditing = editingWorkoutId !== null;

  const resetForm = () => {
    setWorkoutName("");
    setExercises([{ name: "", sets: [{ weight: "", reps: "", unit: "lbs" }] }]);
    setFormError("");
    setEditingWorkoutId(null);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    if (isWorkoutLimitReached) {
      setFormError("You can only save up to 10 workouts.");
      return;
    }

    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutName(workout.name);
    setExercises(
      workout.exercises.length > 0
        ? workout.exercises.map((exercise) => ({
            name: exercise.name,
            sets:
              exercise.sets.length > 0
                ? exercise.sets.map((set) => ({
                    weight: String(set.weight ?? ""),
                    reps: String(set.reps ?? ""),
                    unit: set.unit || "lbs",
                  }))
                : [{ weight: "", reps: "", unit: "lbs" }],
          }))
        : [{ name: "", sets: [{ weight: "", reps: "", unit: "lbs" }] }]
    );
    setFormError("");
    setIsModalOpen(true);
  };

  const getLatestWorkout = (workout) => {
    const savedWorkouts = localStorage.getItem("workouts");
    const latestWorkouts = savedWorkouts ? JSON.parse(savedWorkouts) : workouts;

    return (
      latestWorkouts.find((savedWorkout) => savedWorkout.id === workout.id) ||
      workout
    );
  };

  const handleStartWorkout = (workout) => {
    const latestWorkout = getLatestWorkout(workout);
    setConfirmAction({ type: "start", workout: latestWorkout });
  };

  const confirmStartWorkout = () => {
    if (!confirmAction?.workout) return;
    onStartWorkout(confirmAction.workout);
    setConfirmAction(null);
    setIsViewAllOpen(false);
  };

  const handleDeleteWorkout = (workout) => {
    setConfirmAction({ type: "delete", workout });
  };

  const confirmDeleteWorkout = () => {
    if (!confirmAction?.workout) return;
    onDeleteWorkout(confirmAction.workout.id);
    setConfirmAction(null);
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

    if (isWorkoutLimitReached) {
      setFormError("You can only save up to 10 workouts.");
      return;
    }

    const cleanedName = workoutName.trim();
    if (!cleanedName) {
      setFormError("Workout name is required.");
      return;
    }

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

    const workoutPayload = {
      id: editingWorkoutId,
      name: cleanedName,
      exercises: cleanedExercises,
    };

    if (isEditing) {
      onUpdateWorkout(workoutPayload);
    } else {
      onAddWorkout({
        name: cleanedName,
        exercises: cleanedExercises,
      });
    }

    closeModal();
  };

  const renderWorkoutCard = (workout, shouldCloseViewAll = false) => (
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
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => handleDeleteWorkout(workout)}
        aria-label={`Delete ${workout.name}`}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          opacity: 0.85,
        }}
      >
        ×
      </button>

      <div style={{ paddingRight: "28px" }}>
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
              onClick={() => {
                handleStartWorkout(workout);
                if (shouldCloseViewAll) setIsViewAllOpen(false);
              }}
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
              onClick={() => openEditModal(getLatestWorkout(workout))}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );

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
        <div>
          <h2 style={{ margin: 0 }}>Workouts</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.7, fontSize: "14px" }}>
            {workouts.length}/10 saved workouts
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          aria-label="Create workout"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "none",
            cursor: isWorkoutLimitReached ? "not-allowed" : "pointer",
            opacity: isWorkoutLimitReached ? 0.6 : 1,
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
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {visibleWorkouts.map((workout) => renderWorkoutCard(workout))}
          </div>

          {hasExtraWorkouts && (
            <button
              type="button"
              onClick={() => setIsViewAllOpen(true)}
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #444",
                background: "#2a2a2a",
                color: "inherit",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View Workouts
            </button>
          )}
        </>
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
              <h2 style={{ margin: 0 }}>{isEditing ? "Edit Workout" : "Create Workout"}</h2>

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
                  marginBottom: formError ? "8px" : "18px",
                }}
              />

              {formError && (
                <p
                  style={{
                    margin: "0 0 14px",
                    color: "#ff8a8a",
                    fontSize: "14px",
                  }}
                >
                  {formError}
                </p>
              )}

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
                disabled={isWorkoutLimitReached}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: isWorkoutLimitReached ? "not-allowed" : "pointer",
                  opacity: isWorkoutLimitReached ? 0.6 : 1,
                  fontWeight: "bold",
                }}
              >
                {isEditing ? "Save Changes" : "Save Workout"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isViewAllOpen && (
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
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>All Workouts</h2>
                <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                  {workouts.length}/10 saved workouts
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsViewAllOpen(false)}
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {workouts.map((workout) => renderWorkoutCard(workout, true))}
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: "16px",
              padding: "22px",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {confirmAction.type === "start"
                ? `Start '${confirmAction.workout.name}'?`
                : `Delete '${confirmAction.workout.name}'?`}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="button"
                onClick={
                  confirmAction.type === "start"
                    ? confirmStartWorkout
                    : confirmDeleteWorkout
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutList;
