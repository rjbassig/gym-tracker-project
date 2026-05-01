import { useState } from "react";

function CalendarTracker() {
  const today = new Date();
  const [visibleDate, setVisibleDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [hoveredWorkoutId, setHoveredWorkoutId] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const savedHistory = localStorage.getItem("workoutHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const completedDates = workoutHistory.map((entry) => {
    const date = new Date(entry.date);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  });

  const getDateKey = (date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const getReadableDate = (dateKey) => {
    if (!dateKey) return "";

    const [dateYear, dateMonth, dateDay] = dateKey.split("-").map(Number);
    const date = new Date(dateYear, dateMonth, dateDay);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getWorkoutsForDate = (dateKey) =>
    workoutHistory.filter((entry) => getDateKey(new Date(entry.date)) === dateKey);

  const selectedDateWorkouts = selectedDateKey
    ? getWorkoutsForDate(selectedDateKey)
    : [];

  const formatWorkoutDuration = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const getExerciseFormatLabel = (format) => {
    if (format === "repsOnly") return "Reps Only";
    if (format === "timeOnly") return "Time Only";
    if (format === "distanceOnly") return "Distance Only";
    if (format === "weightTime") return "Weight & Time";
    if (format === "weightDistance") return "Weight & Distance";
    return "Weight & Reps";
  };

  const getSetSummary = (set, format) => {
    const unit = set.unit || "lbs";
    const distanceUnit = set.distanceUnit || "mi";

    if (format === "repsOnly") return `${set.reps || 0} reps`;
    if (format === "timeOnly") return `${set.time || 0}s`;
    if (format === "distanceOnly") return `${set.distance || 0} ${distanceUnit}`;
    if (format === "weightTime") return `${set.weight || 0} ${unit} × ${set.time || 0}s`;
    if (format === "weightDistance") {
      return `${set.weight || 0} ${unit} × ${set.distance || 0} ${distanceUnit}`;
    }

    return `${set.weight || 0} ${unit} × ${set.reps || 0} reps`;
  };

  const deleteWorkoutEntry = (workoutId) => {
    const updatedHistory = workoutHistory.filter((entry) => entry.id !== workoutId);

    setWorkoutHistory(updatedHistory);
    localStorage.setItem("workoutHistory", JSON.stringify(updatedHistory));
    setSelectedWorkout(null);
    setHoveredWorkoutId(null);
  };

  const monthName = visibleDate.toLocaleDateString("en-US", { month: "long" });
  const year = visibleDate.getFullYear();
  const currentMonth = visibleDate.getMonth();
  const currentDayNumber = today.getDate();
  const currentWeekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const isViewingCurrentMonth =
    year === today.getFullYear() && currentMonth === today.getMonth();

  const goToPreviousMonth = () => {
    setVisibleDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setVisibleDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  const firstDayOfMonth = new Date(year, currentMonth, 1);
  const lastDayOfMonth = new Date(year, currentMonth + 1, 0);

  const startingWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarCells = [];

  for (let i = 0; i < startingWeekday; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const getDayStyles = (day) => {
    const isToday = isViewingCurrentMonth && day === currentDayNumber;
    const dateKey = `${year}-${currentMonth}-${day}`;
    const hasWorkout = completedDates.includes(dateKey);

    if (isToday && hasWorkout) {
      return {
        background: "#1e5eff",
        color: "#ffffff",
        fontWeight: "bold",
      };
    }

    if (isToday) {
      return {
        background: "#ffffff",
        color: "#000000",
        fontWeight: "bold",
      };
    }

    if (hasWorkout) {
      return {
        background: "#4da3ff",
        color: "#ffffff",
        fontWeight: "bold",
      };
    }

    return {
      background: "#2a2a2a",
      color: "inherit",
      fontWeight: "normal",
    };
  };

  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Calendar</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "24px",
        }}
      >
        <div
          style={{
            background: "#2a2a2a",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p style={{ margin: 0, opacity: 0.7 }}>Today</p>
          <h2 style={{ margin: "8px 0 0" }}>{monthName}</h2>
          <p style={{ fontSize: "48px", margin: "6px 0" }}>{currentDayNumber}</p>
          <p style={{ margin: 0 }}>{currentWeekday}</p>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <h2 style={{ margin: 0 }}>{monthName}</h2>

              <button
                type="button"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                &lt;
              </button>

              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Next month"
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                &gt;
              </button>
            </div>

            <span style={{ opacity: 0.7 }}>{year}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            {weekdayLabels.map((day) => (
              <div
                key={day}
                style={{ textAlign: "center", fontSize: "12px", opacity: 0.7 }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "6px",
            }}
          >
            {calendarCells.map((day, index) => {
              if (!day) {
                return <div key={index} style={{ height: "40px" }} />;
              }

              const dayStyles = getDayStyles(day);

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => {
                    setSelectedDateKey(`${year}-${currentMonth}-${day}`);
                    setSelectedWorkout(null);
                  }}
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    background: dayStyles.background,
                    color: dayStyles.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: dayStyles.fontWeight,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selectedDateKey && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9000,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: "16px",
              padding: "22px",
              width: "100%",
              maxWidth: "620px",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedDateKey(null);
                setSelectedWorkout(null);
              }}
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

            <h2 style={{ margin: "0 40px 6px 0" }}>
              {getReadableDate(selectedDateKey)}
            </h2>

            {!selectedWorkout && (
              <>
                <p style={{ margin: "0 0 16px", opacity: 0.7 }}>
                  {selectedDateWorkouts.length} workout
                  {selectedDateWorkouts.length === 1 ? "" : "s"} completed
                </p>

                {selectedDateWorkouts.length === 0 ? (
                  <div
                    style={{
                      background: "#2a2a2a",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "center",
                      opacity: 0.8,
                    }}
                  >
                    No workouts completed this day.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {selectedDateWorkouts.map((workoutEntry) => (
                      <button
                        key={workoutEntry.id}
                        type="button"
                        onMouseEnter={() => setHoveredWorkoutId(workoutEntry.id)}
                        onMouseLeave={() => setHoveredWorkoutId(null)}
                        onClick={() => setSelectedWorkout(workoutEntry)}
                        style={{
                          width: "100%",
                          background: "#2a2a2a",
                          color: "inherit",
                          border: "none",
                          borderRadius: "12px",
                          padding: "14px",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <strong>{workoutEntry.name}</strong>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            opacity: 0.7,
                          }}
                        >
                          {formatWorkoutDuration(workoutEntry.duration || 0)}

                          {hoveredWorkoutId === workoutEntry.id && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteWorkoutEntry(workoutEntry.id);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.stopPropagation();
                                  deleteWorkoutEntry(workoutEntry.id);
                                }
                              }}
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                background: "#555",
                                color: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                fontWeight: "bold",
                                opacity: 1,
                              }}
                            >
                              ×
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedWorkout && (
              <>
                <h3 style={{ margin: "0 0 6px" }}>{selectedWorkout.name}</h3>
                <p style={{ margin: "0 0 16px", opacity: 0.7 }}>
                  Duration: {formatWorkoutDuration(selectedWorkout.duration || 0)}
                </p>

                <div style={{ display: "grid", gap: "12px" }}>
                  {selectedWorkout.exercises.map((exercise, exerciseIndex) => {
                    const exerciseFormat = exercise.format || "weightReps";

                    return (
                      <div
                        key={`${exercise.name}-${exerciseIndex}`}
                        style={{
                          background: "#2a2a2a",
                          borderRadius: "12px",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <strong>{exercise.name}</strong>
                          <span style={{ fontSize: "12px", opacity: 0.7 }}>
                            {getExerciseFormatLabel(exerciseFormat)}
                          </span>
                        </div>

                        <div style={{ display: "grid", gap: "8px" }}>
                          {exercise.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                background: "#1e1e1e",
                                borderRadius: "8px",
                                padding: "10px",
                              }}
                            >
                              <span>Set {setIndex + 1}</span>
                              <strong>{getSetSummary(set, exerciseFormat)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarTracker;