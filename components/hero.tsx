import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 py-28">
      <h1 className="text-4xl md:text-6xl font-bold max-w-3xl">
        Your game can{" "}
        <span className="text-green-500">change someone's life.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-xl">
        Subscribe, support a charity you believe in, and enter monthly prize draws
        with your scores. Every month, giving and winning happen together.
        </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-green-600 px-6 py-3 font-medium hover:bg-green-700"
        >
          Join Now
        </Link>
        <Link
          href="#how-it-works"
          className="rounded-lg border border-gray-600 px-6 py-3 hover:bg-gray-800"
        >
          How It Works
        </Link>
      </div>
    </section>
  );
}