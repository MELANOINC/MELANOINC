export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
  res.redirect(307, '/assets/og-melanoinc.jpg?v=20260907');
}
