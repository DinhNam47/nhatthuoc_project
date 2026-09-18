import { Children } from 'react';
import Footer from './component/Layout/Footer';
import Header from './component/Layout/Header';
function App(props) {
  return (
    <>
      <Header/>
        {props.children}
      <Footer/>
    </>
  );
}

export default App;
