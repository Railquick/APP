import logo from '../assets/railquick-logo.png';

export function SplashScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FAFAFA] px-[12%]">
      <img
        src={logo}
        alt="RailQuick – India's Train Delivery App"
        className="block w-full select-none"
        draggable={false}
      />
    </main>
  );
}
