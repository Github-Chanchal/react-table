import logo from './logo.svg';
import './App.css';
import {Table}  from './table';
import {DataBackend} from "./table1"

function App() {
  return (
    <div className="App">
      <h4>React table</h4>
      <Table/>
      <DataBackend/>
    </div>
  );
}

export default App;
