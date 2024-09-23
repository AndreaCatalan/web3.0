import { Navbar, Welcome, Footer, Services, Transactions } from './components';
import { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0)

  return (
      <div className="min-h-screen">
          <div className="gradient-bg-welcome">
            <Navbar />
            <Welcome />
          </div>
            <Footer/>
            <Services />
            <Transactions />
      </div>    
  );
}

export default App;
