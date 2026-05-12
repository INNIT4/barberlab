import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BarberLab — Sistema de citas para barberías mexicanas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F4EE",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(123,30,43,0.03) 0%, transparent 70%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7B1E2B"
            strokeWidth="1.5"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 12V8h3v4M12 16h.01" />
          </svg>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontFamily: "DM Serif Display, serif",
                color: "#3D1C1A",
                lineHeight: 1,
              }}
            >
              BarberLab
            </span>
            <span
              style={{
                fontSize: 28,
                color: "#7B1E2B",
                marginTop: 8,
                fontFamily: "Inter, sans-serif",
              }}
            >
              La agenda de los barberos de México
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
