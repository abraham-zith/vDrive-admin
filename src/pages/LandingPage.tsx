import React from "react";
import { CarTwoTone } from "@ant-design/icons";
import { Button } from "antd";

const LandingPage = () => {
    const [hoveredIndex, setHoveredIndex] = React.useState(null);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Navbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          position: "fixed",
          width: "100%",
          background: "#fff",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CarTwoTone />
          <span>VDrive</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <a
            href="#ride-types"
            style={{ textDecoration: "none", color: "#555" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            Ride Types
          </a>

          <a
            href="#drivers"
            style={{ textDecoration: "none", color: "#555" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            Drivers
          </a>

          <a
            href="#safety"
            style={{ textDecoration: "none", color: "#555" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            Safety
          </a>

          <a
            href="#join-driver"
            style={{ textDecoration: "none", color: "#555" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            Join as Driver
          </a>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            columnGap: "6px",
          }}
        >
          <Button style={{ borderRadius: "16px" }}> Login </Button>
          <Button
            style={{ color: "White", background: "blue", borderRadius: "16px" }}
          >
            {" "}
            Book Now
          </Button>
        </div>
      </div>

      <div>
        <div
          style={{
            minHeight: "100vh",
            padding: "120px 60px",
            background: "radial-gradient(circle at top, #f5faff, #ffffff)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {/* LEFT CONTENT */}
            <div style={{ width: "50%" }}>
              {/* Tag */}
              <span
                style={{
                  backgroundColor: "#0da2e7",
                  color: "white",
                  fontWeight: "600",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  display: "inline-block",
                  marginBottom: "20px",
                }}
              >
                India's #1 Verified Driver Platform
              </span>

              {/* Heading */}
              <h1
                style={{
                  fontSize: "44px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  margin: "0 0 16px 0",
                  color: "#0f172a",
                }}
              >
                Book <span style={{ color: "#2196f3" }}>Verified Drivers</span>
                <br />
                Ride with <span style={{ color: "#1da1f2" }}>Confidence</span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  maxWidth: "520px",
                  fontSize: "14px",
                  color: "#64748b",
                  marginBottom: "30px",
                }}
              >
                Professional, background-verified drivers for your personal
                vehicle. Safe, reliable service across 100+ cities.
              </p>

              {/* Ride Type Buttons */}
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "40px" }}
              >
                {[
                  "🔄 Round Trip",
                  "➡️ One Way",
                  "🌍 Outstation",
                  "⏰ Schedule Ride",
                ].map((item, index) => (
                  <button
                    key={item}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      padding: "6px 10px", // 🔽 reduced padding
                      borderRadius: "999px",
                      border:
                        hoveredIndex === index
                          ? "1px solid #0da2e7"
                          : "1px solid #e2e8f0",
                      backgroundColor:
                        hoveredIndex === index ? "#e6f4ff" : "#f8fafc",
                      color: hoveredIndex === index ? "#0da2e7" : "#0f172a",
                      fontWeight: "600",
                      fontSize: "12px", // 🔽 smaller text
                      cursor: "pointer",
                      lineHeight: "1.2",

                      transition: "all 0.25s ease",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "40px" }}>
                <div>
                  <h3 style={{ margin: 0 }}>50K+</h3>
                  <p style={{ color: "#64748b", margin: 0 }}>Drivers</p>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>1M+</h3>
                  <p style={{ color: "#64748b", margin: 0 }}>Rides</p>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>4.9★</h3>
                  <p style={{ color: "#64748b", margin: 0 }}>Rating</p>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div
              style={{
                width: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Back shadow layer */}
              <div
                style={{
                  position: "absolute",
                  width: "560px",
                  height: "380px",
                  borderRadius: "28px",
                  background: "linear-gradient(135deg, #e0f2fe, #ede9fe)",
                  transform: "rotate(-3deg)",
                  zIndex: 0,
                }}
              />

              {/* Main card */}
              <div
                style={{
                  width: "560px",
                  height: "380px",
                  borderRadius: "28px",
                  background: "linear-gradient(135deg, #fde7e9, #e0f2fe)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  zIndex: 1,
                  boxShadow: "0 30px 60px rgba(0,0,0,0.08)",
                }}
              >
                <img
                  src="https://ride-zenith-motion.lovable.app/assets/hero-driver-CiLvS93v.png"
                  alt="Driver"
                  style={{
                    width: "90%",
                    height: "90%",
                    objectFit: "contain",
                    animation: "float 4s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Animation */}
          <style>
            {`
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-14px); }
    100% { transform: translateY(0); }
  }
`}
          </style>
        </div>
      </div>

      {/* Sections */}
      <div
        id="ride-types"
        style={{
          padding: "100px 40px",
          background: "#f7f7f7",
        }}
      >
        {/* Heading Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px", // 👈 controls gap properly
          }}
        >
          <h1
            style={{
              fontWeight: "600",
              fontSize: "32px",
              marginBottom: "12px",
            }}
          >
            Choose Your Ride Type
          </h1>
          <p style={{ color: "#64748b", maxWidth: "520px", margin: "0 auto" }}>
            Whether it's a quick errand or a cross-country journey, we've got
            the perfect ride for you.
          </p>
        </div>

        {/* Cards Section */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              title: "Round Trip",
              desc: "Perfect for day trips and errands. Pick up and drop back at your location.",
              points: [
                "Same day return",
                "Flexible timing",
                "Best for shopping",
              ],
              icon: "🔄",
            },
            {
              title: "One Way",
              desc: "Direct travel from point A to B. Ideal for airport transfers.",
              points: ["Direct route", "Airport transfers", "No return needed"],
              icon: "➡️",
            },
            {
              title: "Outstation",
              desc: "Long distance travel across cities. Experienced highway drivers.",
              points: ["Multi-day trips", "Highway experts", "Luggage space"],
              icon: "🌍",
            },
            {
              title: "Scheduled Ride",
              desc: "Book in advance for important events. Driver arrives on time.",
              points: [
                "Advance booking",
                "Guaranteed availability",
                "Event-ready",
              ],
              icon: "⏰",
            },
          ].map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                width: "260px",
                background: "#ffffff",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                cursor: "pointer",

                /* ✨ Animation */
                transition: "all 0.3s ease",

                /* 🚀 Elevation */
                transform:
                  hoveredIndex === index
                    ? "translateY(-10px)"
                    : "translateY(0)",
                boxShadow:
                  hoveredIndex === index
                    ? "0 20px 40px rgba(0,0,0,0.12)"
                    : "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "14px",
                  background: "#e6f4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  marginBottom: "16px",
                }}
              >
                {item.icon}
              </div>

              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "500",
                  fontFamily: "revert-layer",
                }}
              >
                {item.title}
              </h3>

              <p style={{ fontSize: "12px", color: "#64748b" }}>{item.desc}</p>

              <ul
                style={{
                  paddingLeft: "0px",
                  color: "#475569",
                  fontSize: "12px",
                  listStyleType: "disc",
                  listStylePosition: "inside",
                }}
              >
                {item.points.map((p, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {p}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                style={{
                  marginTop: "auto",
                  color: "#0da2e7",
                  fontWeight: "600",
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Book Now →
              </a>
            </div>
          ))}
        </div>
      </div>

      <div
        id="drivers"
        style={{
          minHeight: "100vh",
          padding: "120px 40px",
          background: "#f7f7f7",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px", // 👈 controls gap properly
          }}
        >
          <h1
            style={{
              fontWeight: "600",
              fontSize: "32px",
              marginBottom: "12px",
            }}
          >
            Choose Your Driver
          </h1>
          <p style={{ color: "#64748b", maxWidth: "520px", margin: "0 auto" }}>
            All drivers are verified and rated. Pick the perfect match for your
            journey..
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "28px",
            justifyContent: "center",
            flexWrap: "wrap",
            padding: "60px 20px",
            background: "#f8fafc",
          }}
        >
          {[
            {
              badge: "Most Popular",
              title: "Premium Driver",
              subtitle: "Luxury experience for VIP rides",
              desc: "Top-rated drivers with luxury vehicle expertise.",
              features: [
                "5-star rated drivers only",
                "Luxury car experience",
                "Corporate & VIP events",
                "Multi-language support",
              ],
              price: "₹599",
              primary: true,
              button: "Select Premium",
              icon: "👑",
            },
            {
              title: "Elite Driver",
              subtitle: "Professional highway experts",
              desc: "Experienced long-distance drivers for outstation trips.",
              features: [
                "Highway driving certified",
                "Long-distance specialists",
                "Night driving trained",
                "First-aid certified",
              ],
              price: "₹449",
              button: "Select Elite",
              icon: "⭐",
            },
            {
              title: "Standard Driver",
              subtitle: "Reliable everyday rides",
              desc: "Verified, reliable drivers for your daily commute.",
              features: [
                "Fully verified drivers",
                "Perfect for daily use",
                "Punctual & professional",
                "Affordable pricing",
              ],
              price: "₹299",
              button: "Select Standard",
              icon: "🛡️",
            },
          ].map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                width: "300px",
                background: "#fff",
                borderRadius: "24px",
                padding: "28px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                border: item.primary
                  ? "2px solid #0da2e7"
                  : "1px solid #e5e7eb",

                /* 🔥 Elevation effect */
                transform:
                  hoveredIndex === index
                    ? "translateY(-10px)"
                    : "translateY(0)",

                boxShadow:
                  hoveredIndex === index
                    ? "0 30px 60px rgba(0,0,0,0.15)"
                    : item.primary
                    ? "0 20px 40px rgba(13,162,231,0.25)"
                    : "0 12px 30px rgba(0,0,0,0.08)",

                transition: "all 0.35s ease",
              }}
            >
              {/* Badge */}
              {item.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#0da2e7",
                    color: "#fff",
                    padding: "4px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {item.badge}
                </div>
              )}

              {/* Icon */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: item.primary ? "#0da2e7" : "#e6f4ff",
                  color: item.primary ? "#fff" : "#0da2e7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "20px",
                }}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600" }}>
                {item.title}
              </h2>

              <span
                style={{
                  color: "#0da2e7",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {item.subtitle}
              </span>

              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginTop: "12px",
                }}
              >
                {item.desc}
              </p>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  marginTop: "16px",
                  fontSize: "14px",
                  color: "#0f172a",
                }}
              >
                {item.features.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#e6f4ff",
                        color: "#0da2e7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div style={{ marginTop: "20px" }}>
                <span style={{ fontSize: "32px", fontWeight: "700" }}>
                  {item.price}
                </span>
                <span style={{ color: "#64748b" }}>/ride</span>
              </div>

              {/* Button */}
              <button
                style={{
                  marginTop: "24px",
                  padding: "12px",
                  borderRadius: "14px",
                  border: item.primary ? "none" : "2px solid #bae6fd",
                  background: item.primary ? "#0da2e7" : "#fff",
                  color: item.primary ? "#fff" : "#0da2e7",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {item.button}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div id="safety" style={{ minHeight: "100vh", padding: "120px 40px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px", // 👈 controls gap properly
          }}
        >
          <h1
            style={{
              fontWeight: "600",
              fontSize: "32px",
              marginBottom: "12px",
            }}
          >
            Trust & Safety
          </h1>
          <p
            style={{
              color: "#64748b",
              maxWidth: "520px",
              margin: "0 auto",
              fontSize: "14px",
            }}
          >
            Your safety is our top priority. Every VDrive journey is backed by
            our verification process.
          </p>
        </div>

        <div
          style={{
            background: "#f8fafc",
            padding: "80px 24px",
          }}
        >
          {/* TOP CARDS */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "60px",
            }}
          >
            {[
              {
                title: "Verified Drivers",
                desc: "Every driver undergoes thorough background verification.",
                icon: "🛡️",
              },
              {
                title: "Document Checked",
                desc: "Aadhaar and driving license verified for authenticity.",
                icon: "📄",
              },
              {
                title: "Face-to-Face",
                desc: "Physical verification at our Chennai office.",
                icon: "👤",
              },
              {
                title: "Secure Rides",
                desc: "End-to-end encryption and secure payments.",
                icon: "🔒",
              },
            ].map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  width: "260px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "28px 24px",
                  textAlign: "center",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",

                  /* 🔥 Elevation effect */
                  transform:
                    hoveredIndex === index
                      ? "translateY(-12px)"
                      : "translateY(0)",

                  boxShadow:
                    hoveredIndex === index
                      ? "0 30px 60px rgba(0,0,0,0.18)"
                      : "0 15px 35px rgba(0,0,0,0.08)",

                  transition: "all 0.35s ease",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "#e6f4ff",
                    color: "#0da2e7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    margin: "0 auto 18px",
                  }}
                >
                  {item.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "10px",
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    lineHeight: "1.5",
                    marginBottom: "16px",
                  }}
                >
                  {item.desc}
                </p>

                {/* Verified */}
                <div
                  style={{
                    color: "#0da2e7",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  ✓ Verified
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM STATS BAR */}
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px 20px",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            }}
          >
            {[
              { value: "100%", label: "Verified" },
              { value: "24/7", label: "Support" },
              { value: "0", label: "Incidents" },
              { value: "4.9★", label: "Trust Rating" },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#0da2e7",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    marginTop: "6px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        id="join-driver"
        style={{
          minHeight: "100vh",
          padding: "120px 40px",
          background: "#f7f7f7",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px", // 👈 controls gap properly
          }}
        >
          <h1
            style={{
              fontWeight: "600",
              fontSize: "32px",
              marginBottom: "12px",
            }}
          >
            Become a VDrive Driver
          </h1>
          <p
            style={{
              color: "#64748b",
              maxWidth: "520px",
              margin: "0 auto",
              fontSize: "14px",
            }}
          >
            Join thousands of verified drivers earning with VDrive.
          </p>
        </div>
        <h2>Join as Driver</h2>
      </div>
    </div>
  );
};

export default LandingPage;
