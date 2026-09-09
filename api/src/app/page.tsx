export default function ApiHome() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 48, color: '#171717' }}>
      <h1 style={{ fontSize: 24, margin: 0 }}>RideWise API</h1>
      <p style={{ color: '#707070', marginTop: 8 }}>
        V1 is local-first. This service is reserved for future sync.
      </p>
      <p style={{ marginTop: 16 }}>
        Health: <a href="/api/health">/api/health</a>
      </p>
    </main>
  );
}
