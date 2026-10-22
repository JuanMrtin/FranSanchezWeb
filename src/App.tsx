import Header from './components/Header';
import Hero from './components/Hero';
import Servicios from './components/Servicios';
import Trabajos from './components/Trabajos';
import Empresa from './components/Empresa';
import Proceso from './components/Proceso';
import Contacto from './components/Contacto';
import Footer from './components/Footer';
import LegalDialog from './components/LegalDialog';
import AccesoRapido from './components/AccesoRapido';
import './App.css';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <Header />

      <main id="main-content" tabIndex={-1}>
        <Hero />          {/* 01 · #inicio     */}
        <Servicios />     {/* 02 · #servicios  */}
        <Trabajos />      {/* 03 · #trabajos   */}
        <Empresa />       {/* 04 · #empresa    */}
        <Proceso />       {/* 05 · #proceso    */}
        <Contacto />      {/* 06 · #contacto   */}
      </main>

      <Footer />          {/* 07 */}
      <AccesoRapido />
      <LegalDialog />
    </>
  );
}
