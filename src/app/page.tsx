import Link from "next/link";
const Home = () => {
  return (
    <main className="landing">
      <div className="landing-orbit orbit-one" />
      <div className="landing-orbit orbit-two" />
      <div className="landing-content">
        <span className="eyebrow">SOLAR SYSTEM / FIELD GUIDE 01</span>
        <h1>
          Viaja.
          <br />
          <em>Descubre.</em>
        </h1>
        <p>Una expedición interactiva por nuestro vecindario cósmico.</p>
        <Link className="primary-button launch-button" href="/play">
          Jugar <span>→</span>
        </Link>
        <div className="landing-meta">
          <span>8 PLANETAS</span>
          <span>DATOS REALES</span>
          <span>EXPLORACIÓN LIBRE</span>
        </div>
      </div>
      <div className="sun-mark">◎</div>
    </main>
  );
};

export default Home;
