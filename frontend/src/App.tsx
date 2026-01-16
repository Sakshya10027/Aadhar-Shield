import Home from "./pages/Home";

const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f3f6",
        color: "#202124",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <header
        style={{
          padding: "12px 32px 8px 32px",
          borderBottom: "1px solid #dadce0",
          backgroundColor: "#003366",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffffff",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            Government of India
          </div>
          <h1 style={{ margin: 0, fontSize: 20 }}>
            Unique Identification Authority of India
          </h1>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
            Aadhaar data quality and enrolment analytics dashboard
          </p>
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          <div>Digital Identity Analytics Division</div>
          <div style={{ opacity: 0.9 }}>UIDAI HQ, New Delhi</div>
        </div>
      </header>
      <div
        style={{
          height: 3,
          background:
            "linear-gradient(to right,#ff9933 0%,#ff9933 33%,#ffffff 33%,#ffffff 66%,#138808 66%,#138808 100%)",
        }}
      />
      <main style={{ padding: "20px 32px 32px 32px" }}>
        <Home />
      </main>
    </div>
  );
};

export default App;
