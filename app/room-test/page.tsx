/**
 * Room Test Page — Development route for ApartmentRoom visual validation
 *
 * TEMPORARY DEVELOPMENT ROUTE
 * This route exists only to verify the ApartmentRoom component rendering.
 * Compare the rendered output against APARTMENT_VISUAL_VERIFICATION.png.
 *
 * To view: npm run dev → http://localhost:3000/room-test
 */

import ApartmentRoom from "@/components/ApartmentRoom";

export default function RoomTestPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        padding: "2rem",
      }}
    >
      <div
        style={{
          marginBottom: "1rem",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      >
        <p>
          <strong>Room Test</strong> — Development route for visual validation
        </p>
        <p style={{ opacity: 0.7, marginTop: "0.5rem" }}>
          Room: 23×18 tiles (736×576px) | Compare against
          APARTMENT_VISUAL_VERIFICATION.png
        </p>
      </div>

      <div
        style={{
          border: "2px solid #444",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <ApartmentRoom />
      </div>

      <div
        style={{
          marginTop: "1rem",
          color: "#888",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        Use browser zoom at 100% for pixel-perfect rendering
      </div>
    </div>
  );
}
