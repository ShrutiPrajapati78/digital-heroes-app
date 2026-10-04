const steps = [
  {
    icon: "💳",
    title: "Subscribe",
    desc: "Choose a monthly or yearly plan and pick the charity you want to support.",
  },
  {
    icon: "⛳",
    title: "Enter Your Scores",
    desc: "Add your latest golf scores. Your scores become your entries in the draw.",
  },
  {
    icon: "🏆",
    title: "Win and Give",
    desc: "Take part in the monthly prize draw while a share of your subscription goes to charity.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold">How It Works</h2>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="text-3xl">{step.icon}</div>
            <p className="mt-4 text-sm text-green-500">Step {i + 1}</p>
            <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-gray-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}