import React from 'react';
import Timer from './components/Timer';

function App() {
  return (
    <div className="w-[320px] min-h-[480px] bg-[#0A0A0C] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans antialiased">
      <Timer />
    </div>
  );
}

export default App;