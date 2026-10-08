import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🏠",
      title: "Price Prediction",
      description:
        "Estimate property prices using your machine learning model.",
      section: "prediction",
      number: "01",
    },
    {
      icon: "📍",
      title: "Property Map",
      description:
        "Explore Mumbai locations and view property information on the map.",
      section: "property-map",
      number: "02",
    },
    {
      icon: "📊",
      title: "Market Analytics",
      description:
        "Explore property insights, price patterns and prediction results.",
      section: "analytics",
      number: "03",
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description:
        "Find properties by describing your requirements in natural language.",
      section: "ai-assistant",
      number: "04",
    },
  ];

  return (
    <main className="estate-dashboard">
      {/* TOP NAVIGATION */}
      <header className="estate-dashboard-nav">
        <button
          className="estate-dashboard-brand"
          onClick={() => navigate("/")}
          aria-label="Open main application"
        >
          <span className="estate-dashboard-brand-icon">⌂</span>

          <span className="estate-dashboard-brand-text">
            <strong>ESTATE AI</strong>
            <small>REAL ESTATE INTELLIGENCE</small>
          </span>
        </button>

        <div className="estate-dashboard-nav-right">
          <span className="estate-dashboard-status">
            <span className="estate-dashboard-status-dot"></span>
            AI PROPERTY PLATFORM
          </span>

          <button
            className="estate-dashboard-open-btn"
            onClick={() => navigate("/")}
          >
            Open Main App <span>↗</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="estate-dashboard-hero">
        <div className="estate-dashboard-hero-content">
          <div className="estate-dashboard-eyebrow">
            <span>✦</span> YOUR REAL ESTATE WORKSPACE
          </div>

          <h1>
            Smarter Property
            <br />
            Decisions Start <span>Here.</span>
          </h1>

          <p>
            Welcome to Estate AI. Predict property prices, explore locations
            and discover real-estate insights — all in one place.
          </p>

          <div className="estate-dashboard-hero-actions">
            <button
              className="estate-dashboard-primary-btn"
              onClick={() => navigate("/")}
            >
              Explore Main Application <span>→</span>
            </button>

            <button
              className="estate-dashboard-secondary-btn"
              onClick={() => navigate("/?section=prediction")}
            >
              Predict a Property
            </button>
          </div>
        </div>

        <div className="estate-dashboard-hero-visual">
          <div className="estate-dashboard-visual-glow"></div>

          <div className="estate-dashboard-visual-card">
            <div className="estate-dashboard-visual-top">
              <div>
                <span className="estate-dashboard-visual-label">
                  ESTATE AI
                </span>
                <h3>Property Intelligence</h3>
              </div>

              <span className="estate-dashboard-visual-symbol">⌂</span>
            </div>

            <div className="estate-dashboard-building">
              <div className="estate-building building-one">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>

              <div className="estate-building building-two">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>

              <div className="estate-building building-three">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>

            <div className="estate-dashboard-visual-bottom">
              <span>
                <span className="estate-dashboard-status-dot"></span>
                MACHINE LEARNING
              </span>
              <span>MAP • INSIGHTS • AI</span>
            </div>
          </div>

          <div className="estate-dashboard-floating-tag">
            <span>📍</span>
            <div>
              <strong>Mumbai, India</strong>
              <small>Explore property locations</small>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION HEADING */}
      <section className="estate-dashboard-tools">
        <div className="estate-dashboard-section-heading">
          <div>
            <span className="estate-dashboard-section-label">
              YOUR WORKSPACE
            </span>
            <h2>Everything you need.</h2>
            <p>Choose a tool to get started with your property research.</p>
          </div>

          <span className="estate-dashboard-tool-count">
            04 TOOLS AVAILABLE
          </span>
        </div>

        {/* FEATURE CARDS */}
        <div className="estate-dashboard-grid">
          {features.map((feature) => (
            <button
              key={feature.section}
              type="button"
              className="estate-dashboard-feature-card"
              onClick={() =>
                navigate(`/?section=${feature.section}`)
              }
            >
              <div className="estate-dashboard-card-top">
                <span className="estate-dashboard-feature-icon">
                  {feature.icon}
                </span>

                <span className="estate-dashboard-card-number">
                  {feature.number}
                </span>
              </div>

              <div className="estate-dashboard-card-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>

              <div className="estate-dashboard-card-footer">
                <span>Explore tool</span>
                <span className="estate-dashboard-card-arrow">↗</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="estate-dashboard-cta">
        <div className="estate-dashboard-cta-icon">✦</div>

        <div className="estate-dashboard-cta-content">
          <h3>Ready to explore the property market?</h3>
          <p>
            Open your main application to access the interactive map,
            prediction form and other features.
          </p>
        </div>

        <button
          className="estate-dashboard-cta-btn"
          onClick={() => navigate("/")}
        >
          Open Estate AI <span>→</span>
        </button>
      </section>

      {/* FOOTER */}
      <footer className="estate-dashboard-footer">
        <span>
          <strong>ESTATE AI</strong> · Real Estate Price Predictor
        </span>

        <span>Built for smarter property decisions.</span>
      </footer>
    </main>
  );
}

export default Dashboard;