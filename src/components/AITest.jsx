import { useState } from 'react';
import { aiService } from '../services/aiService';

function AITest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const testAI = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Test resume analysis
      const analysis = await aiService.analyzeResume('Sample resume text with React and Node.js experience');
      setResult(analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#fff' }}>AI Integration Test</h2>
      
      <button 
        onClick={testAI} 
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          background: '#ffd700',
          color: '#1a1a1a',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          marginTop: '1rem'
        }}
      >
        {loading ? 'Testing AI...' : 'Test AI Integration'}
      </button>

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '8px',
          color: '#ff6b6b'
        }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#4ade80'
        }}>
          <h3>âœ… AI Integration Working!</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default AITest;

