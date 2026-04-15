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
        <div className="min-h-screen customer-page transition-colors duration-300">
            <Header />
            <div>
                <Banner />
                <SearchCard />
                <FeaturedCars />
                <CarComparison />
                <Promotions />
                <Services />
                <News />
                <Footer />
            </div>
        </div>
    );
}

export default App;
