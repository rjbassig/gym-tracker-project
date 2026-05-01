import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import CalendarTracker from "../components/CalendarTracker";
import WorkoutList from "../components/WorkoutList";
import ActiveWorkout from "../components/ActiveWorkout";

function Home() {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workouts, setWorkouts] = useState(() => {
    const savedWorkouts = localStorage.getItem("workouts");
    return savedWorkouts ? JSON.parse(savedWorkouts) : [];
  });

  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = (workout) => {
    const trimmedName = workout.name.trim();

    if (!trimmedName) return;

    const newWorkout = {
      id: crypto.randomUUID(),
      name: trimmedName,
      exercises: workout.exercises,
    };

    setWorkouts((prevWorkouts) => [...prevWorkouts, newWorkout]);
  };

  const deleteWorkout = (workoutId) => {
    setWorkouts((prevWorkouts) =>
      prevWorkouts.filter((workout) => workout.id !== workoutId)
    );
  };

  const startWorkout = (workout) => {
    const latestWorkout = workouts.find(
      (savedWorkout) => savedWorkout.id === workout.id
    );

    setActiveWorkout(latestWorkout || workout);
  };

  const updateWorkoutTemplate = (updatedWorkout) => {
    setWorkouts((prevWorkouts) => {
      const updatedWorkouts = prevWorkouts.map((workout) =>
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );

      localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
      return updatedWorkouts;
    });
  };

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <Dashboard workouts={workouts} />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <CalendarTracker />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <WorkoutList
          workouts={workouts}
          onAddWorkout={addWorkout}
          onDeleteWorkout={deleteWorkout}
          onStartWorkout={startWorkout}
          onUpdateWorkout={updateWorkoutTemplate}
          activeWorkout={activeWorkout}
        />
      </div>

      {activeWorkout && (
        <ActiveWorkout
          workout={activeWorkout}
          setActiveWorkout={setActiveWorkout}
          onUpdateWorkoutTemplate={updateWorkoutTemplate}
        />
      )}
    </main>
  );
}

export default Home;