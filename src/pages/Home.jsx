import '../styles/Home.css';
import Login from './Login';

export default function Home() {
    return (
        <main className="background-container">
            <div className="background-image"></div> {/* NEW fixed background layer */}
            <div className="content-wrapper">
                <h1 className="home-heading">Harvest Fest 2025</h1>
                <Login />
            </div>
        </main>
    );
}