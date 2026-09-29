import Link from '@/router';
export function NotFound() {
  return (
    <div className="wrap page-content empty-state">
      <p className="eyebrow">404</p>
      <h1>This page has wandered off.</h1>
      <Link className="button" href="/menu">
        Back to the menu
      </Link>
    </div>
  );
}
