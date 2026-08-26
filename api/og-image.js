export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400');
  res.redirect(307, '/assets/luxia-seguimiento.webp');
}
