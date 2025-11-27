process.on('unhandledRejection', (r) => {
  console.error('UNHANDLED_REJECTION:', r && (r.stack || r));
  setTimeout(()=>process.exit(1), 10);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION:', err && (err.stack || err));
  setTimeout(()=>process.exit(1), 10);
});
try {
  require('./dist/src/main.js');
} catch (e) {
  console.error('REQUIRE_FAILED:', e && (e.stack || e));
  process.exit(1);
}
