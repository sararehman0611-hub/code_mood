import { Toolbar } from './components/Toolbar/Toolbar';
import { Canvas } from './components/Canvas/Canvas';
import { Sidebar } from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Toolbar />
      <div className="app-main">
        <Canvas />
        <Sidebar />
      </div>
    </div>
  );
}

export default App;
