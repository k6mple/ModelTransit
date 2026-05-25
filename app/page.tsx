export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1
        className="
          text-center text-[clamp(2rem,8vw,6rem)] font-extrabold tracking-tight
          select-none
        "
        style={{
          background:
            "linear-gradient(120deg, #fef3c7 0%, #fde68a 20%, #facc15 35%, #fff9e6 50%, #fef3c7 65%, #fbbf24 80%, #fef3c7 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation:
            "fadeInScale 2s ease-out forwards, shimmer 4s ease-in-out 2s infinite, glowPulse 5s ease-in-out 2s infinite",
          textShadow: "0 0 40px rgba(252, 211, 77, 0.25), 0 0 80px rgba(254, 243, 199, 0.15)",
        }}
      >
        The future has already come
      </h1>

      <div
        className="mt-10 opacity-0"
        style={{
          animation: "fadeInUp 1.2s ease-out 2.2s forwards",
        }}
      >
        <button className="rounded-full bg-white px-7 py-3 text-base font-semibold tracking-wide text-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/10">
          Explore
        </button>
      </div>

      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            filter: brightness(1) drop-shadow(0 0 10px rgba(252, 211, 77, 0.25));
          }
          50% {
            filter: brightness(1.08) drop-shadow(0 0 20px rgba(254, 243, 199, 0.4));
          }
        }
      `}</style>
      
    </div>
  );
}
