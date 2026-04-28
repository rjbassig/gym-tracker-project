function ActiveWorkout({ workout, setActiveWorkout }) {
  return (
    <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "12px" }}>
      <h2>{workout.name}</h2>

      <p>Workout in progress...</p>

      <button
        onClick={() => setActiveWorkout(null)}
        style={{
          marginTop: "20px",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Finish Workout
      </button>
    </div>
  );
}

export default ActiveWorkout;