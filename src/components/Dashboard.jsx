function Dashboard({ workouts = [] }) {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const history = JSON.parse(localStorage.getItem("workoutHistory") || "[]");

  const getKey = (d) => new Date(d).toISOString().slice(0, 10);
  const todayKey = getKey(today);

  const completedToday = history.some((h) => getKey(h.date) === todayKey);

  // simple streak: consecutive days up to today
  const dates = new Set(history.map((h) => getKey(h.date)));
  let streak = 0;
  const d = new Date();
  while (dates.has(getKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  // simple rotation plan (Sun = rest)
  const day = today.getDay();
  const todayPlan =
    day === 0
      ? "Rest"
      : workouts.length
      ? workouts[(day - 1) % workouts.length].name
      : "Create workout";

  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "16px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <span style={{ opacity: 0.7 }}>{formattedDate}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <div style={{ background: "#2a2a2a", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Streak</div>
          <div style={{ fontSize: 20 }}>{streak}d</div>
        </div>

        <div style={{ background: "#2a2a2a", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Today</div>
          <div style={{ fontSize: 16 }}>{todayPlan}</div>
        </div>

        <div style={{ background: "#2a2a2a", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
          <div style={{ fontSize: 16 }}>
            {completedToday ? "Done" : "Pending"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;