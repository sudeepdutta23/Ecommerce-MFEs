import { HeroCarousel } from '../components/HeroCarousel';
import { QuadCard } from '../components/QuadCard';
import { SingleCard } from '../components/SingleCard';
import { CarouselStrip } from '../components/CarouselStrip';
import { getImg, getQuadImages } from '../utils/images';

export function App() {
  return (
    <div className="amz-home">
      <HeroCarousel />

      <div className="amz-main-content">
        <div className="amz-grid">
          <QuadCard title="Customers' most loved gifts for him" linkText="Shop now" images={getQuadImages(1)} />
          <QuadCard title="Continue shopping deals" linkText="See all deals" images={getQuadImages(5)} />
          <QuadCard title="Appliances for your home | Up to 55% off" linkText="See more" images={getQuadImages(9)} />
          <div className="amz-card">
            <h2>Sign in for your best experience</h2>
            <button className="amz-btn">Sign in securely</button>
            <div className="amz-card__single" style={{ marginTop: '20px' }}>
              <img src={getImg(13)} alt="Ad" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        <div className="amz-grid">
          <QuadCard title="Easy shopping for" linkText="See more" images={getQuadImages(14)} />
          <QuadCard title="Buy again" linkText="See your browsing history" images={getQuadImages(18)} />
          <QuadCard title="Up to 65% off | Furniture & appliances" linkText="See more" images={getQuadImages(22)} />
          <QuadCard title="Pick up where you left off" linkText="See more" images={getQuadImages(26)} />
        </div>

        <CarouselStrip title="Related to items you've viewed" linkText="See more" itemCount={15} startId={30} />

        <CarouselStrip title="More items to consider" linkText="See more" itemCount={15} startId={45} />

        <div className="amz-grid">
          <QuadCard title="Continue shopping for" linkText="See more" images={getQuadImages(60)} />
          <QuadCard title="Keep shopping for" linkText="See more" images={getQuadImages(64)} />
          <SingleCard title="Explore more" linkText="See more" image={getImg(68)} />
          <QuadCard title="Pick up where you left off" linkText="See more" images={getQuadImages(69)} />
        </div>

        <CarouselStrip title="Based on your browsing history" linkText="See more" itemCount={12} startId={73} />
        <CarouselStrip title="Based on your cart" itemCount={12} startId={85} />

        <div className="amz-banner-ad">
          <img src={getImg(97)} alt="Banner Ad" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
        </div>

        <div className="amz-grid">
          <SingleCard title="Keep shopping for" linkText="See more" image={getImg(98)} />
          <QuadCard title="For all your gifting needs" linkText="See more" images={getQuadImages(99)} />
          <QuadCard title="Pick up where you left off" linkText="See more" images={getQuadImages(3)} />
          <SingleCard title="Continue shopping for" linkText="See more" image={getImg(7)} />
        </div>

        <CarouselStrip title="Up to 50% off | Cookware, kitchen tools & more" linkText="See more" itemCount={15} startId={8} />
        <CarouselStrip title="Amazon LIVE - Watch, Chat & Shop LIVE" linkText="See more" itemCount={8} startId={23} />

        <div className="amz-grid">
          <SingleCard title="Highly rated skincare products from brands you might like" linkText="See more" image={getImg(31)} />
          <SingleCard title="Savings and Sales" linkText="See more" image={getImg(32)} />
          <QuadCard title="Up to 50% off | Shop essentials for Mother's day" linkText="See more" images={getQuadImages(33)} />
          <SingleCard title="Up to 50% off | International brands" linkText="See more" image={getImg(37)} />
        </div>

        <CarouselStrip title="Max. 50% off | Curated collections from Small Businesses" linkText="See more" itemCount={15} startId={38} />

        <div className="amz-bottom-signin">
          <p>See personalized recommendations</p>
          <button className="amz-btn">Sign in</button>
          <p className="amz-bottom-signin__new">New customer? <a href="#">Start here.</a></p>
        </div>
      </div>
    </div>
  );
}

export default App;
