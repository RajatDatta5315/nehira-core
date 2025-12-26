export default function Home() {
  return (
    <div style={{
      backgroundColor: '#050505',
      color: '#10b981',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '2rem', letterSpacing: '0.2em' }}>NEHIRA CORE</h1>
      <p style={{ color: '#4b5563' }}>[SYSTEM_STATUS: ONLINE]</p>
      <div style={{ marginTop: '20px', border: '1px solid #10b981', padding: '10px 20px' }}>
        <p>ARCHITECT: RAJAT</p>
        <p>ACCESS: RESTRICTED (API ONLY)</p>
      </div>
    </div>
  );
}
