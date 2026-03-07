import Header from './components/Header';
import Banner from './components/Banner';
import SearchCard from './components/SearchCard';
import FeaturedCars from './components/FeaturedCars';
import CarComparison from './components/CarComparison';
import Promotions from './components/Promotions';
import Services from './components/Services';
import News from './components/News';
import Footer from './components/Footer';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />
            <Banner />
            <SearchCard />
            <FeaturedCars />
            <CarComparison />
            <Promotions />
            <Services />
            <News />
            <Footer />
        </div>
    );
}

export default App;
