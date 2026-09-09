const features = [
  {
    title: 'Everyday wallet',
    body: 'Log food, bills, and daily spend in seconds — even without internet.',
  },
  {
    title: 'Fuel and mileage',
    body: 'Record ODO and fuel so RideWise can calculate real km/L for your bike.',
  },
  {
    title: 'Private by default',
    body: 'No account required. Your money stays on the device until you export it.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-medium tracking-wide text-primary">RideWise</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Spend smart. Ride more.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-7 text-muted">
        A personal wallet for riders. Track everyday expenses, bike costs, and fuel — fully
        offline.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="#features"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          See how it works
        </a>
        <span className="rounded-full border border-black/10 px-5 py-2.5 text-sm text-muted">
          App coming soon
        </span>
      </div>
      <section id="features" className="mt-20 grid gap-8 sm:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title}>
            <h2 className="text-base font-semibold text-foreground">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
