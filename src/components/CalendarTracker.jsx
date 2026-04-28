function CalendarTracker() {
  const today = new Date();

  const monthName = today.toLocaleDateString("en-US", { month: "long" });
  const year = today.getFullYear();
  const currentDayNumber = today.getDate();
  const currentWeekday = today.toLocaleDateString("en-US", { weekday: "long" });

  const firstDayOfMonth = new Date(year, today.getMonth(), 1);
  const lastDayOfMonth = new Date(year, today.getMonth() + 1, 0);

  const startingWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarCells = [];

  // empty cells before the 1st day
  for (let i = 0; i < startingWeekday; i++) {
    calendarCells.push(null);
  }

  // days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

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
        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h2 style={{ margin: 0 }}>{monthName}</h2>
            <span style={{ opacity: 0.7 }}>{year}</span>
          </div>

          {/* WEEKDAY LABELS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            {weekdayLabels.map((day) => (
              <div key={day} style={{ textAlign: "center", fontSize: "12px", opacity: 0.7 }}>
                {day}
              </div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "6px",
            }}
          >
            {calendarCells.map((day, index) => {
              const isToday = day === currentDayNumber;

              return (
                <div
                  key={index}
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    background: day ? (isToday ? "#ffffff" : "#2a2a2a") : "transparent",
                    color: isToday ? "#000" : "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: isToday ? "bold" : "normal",
                  }}
                >
                  {day || ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarTracker;