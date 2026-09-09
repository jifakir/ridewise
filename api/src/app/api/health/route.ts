export async function GET() {
  return Response.json({
    ok: true,
    service: 'ridewise-api',
    mode: 'local-first',
    message: 'V1 does not require a backend. Cloud sync is deferred.',
  });
}
