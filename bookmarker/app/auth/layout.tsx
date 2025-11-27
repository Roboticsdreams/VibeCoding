import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Bookmarker",
  description: "Login or register for Bookmarker - Your personal bookmark management system",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const heroShapes = [
    {
      style: {
        width: '180px',
        height: '180px',
        top: '2%',
        right: '8%',
        background: 'linear-gradient(135deg, #FF9D66, #FF5DA2)'
      }
    },
    {
      style: {
        width: '120px',
        height: '120px',
        top: '8%',
        left: '55%',
        background: 'linear-gradient(135deg, #6C63FF, #9C91FF)'
      }
    },
    {
      style: {
        width: '140px',
        height: '140px',
        bottom: '12%',
        left: '50%',
        background: 'linear-gradient(135deg, #FF8F70, #FDB469)'
      }
    },
    {
      style: {
        width: '110px',
        height: '110px',
        bottom: '18%',
        right: '10%',
        background: 'linear-gradient(135deg, #8BE0FF, #5BC8FF)'
      }
    },
    {
      style: {
        width: '90px',
        height: '90px',
        top: '35%',
        left: '10%',
        background: 'linear-gradient(135deg, #C184FF, #FFB0FF)'
      }
    }
  ] as const;

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row overflow-hidden rounded-none lg:rounded-3xl shadow-[0_20px_70px_rgba(40,44,63,0.15)]">
        <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-12">
          {children}
        </div>
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FDFCFB] to-[#F4F6FB] relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            {heroShapes.map((shape, index) => (
              <span
                key={index}
                className="absolute rounded-[48%] blur-[0.5px] shadow-[0_20px_60px_rgba(120,120,160,0.15)]"
                style={shape.style as React.CSSProperties}
              />
            ))}
            <span
              className="absolute right-14 top-24 w-24 h-24 opacity-60"
              style={{
                backgroundImage: 'radial-gradient(#1A1A1F 1px, transparent 1px)',
                backgroundSize: '10px 10px'
              }}
            />
          </div>
          <div className="relative z-10 max-w-md text-center px-10">
            <div className="text-4xl font-semibold text-[#1A1A1F] leading-snug">
              Changing the way
              <br />
              the world writes
            </div>
            <p className="mt-4 text-gray-500">
              A productivity-first bookmark manager to save, organize, and resurface knowledge effortlessly.
            </p>
          </div>
          <div className="absolute top-6 right-8 text-sm font-semibold text-[#1A1A1F] tracking-[0.2em]">
            BOOKMARKER
          </div>
        </div>
      </div>
    </div>
  );
}
