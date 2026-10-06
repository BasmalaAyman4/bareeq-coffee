export function StaffLoading({ founder }: { founder: boolean | null }) {
  return (
    <main className="grid min-h-screen place-items-center bg-bareeq-cream/55 p-5">
      <section
        className="flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-bareeq-espresso/10 bg-bareeq-ivory p-9 text-center shadow-bareeq"
        role="status"
        aria-live="polite"
      >
        <img
          className="mb-5 size-16 object-contain drop-shadow-md"
          src="/assets/bareeq-logo.png"
          alt="Bareeq"
        />
        <span className="mb-4 size-6 animate-spin rounded-full border-2 border-bareeq-burgundy/20 border-t-bareeq-burgundy" />
        <strong className="text-bareeq-espresso">
          Opening {founder === null ? 'staff' : founder ? 'Founder' : 'Cashier'}{' '}
          workspace
        </strong>
        <p className="mt-2 text-sm text-bareeq-espresso/60">
          Checking your secure session…
        </p>
      </section>
    </main>
  );
}
