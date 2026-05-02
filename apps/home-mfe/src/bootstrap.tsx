import { StrictMode, useState, useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import './styles.css';

const getImg = (id: number) => `http://localhost:3004/images/product/product-${((id - 1) % 100) + 1}.jpg`;
const getQuadImages = (startId: number) => [getImg(startId), getImg(startId + 1), getImg(startId + 2), getImg(startId + 3)];

const QuadCard = ({ title, linkText, images }: { title: string, linkText: string, images: string[] }) => (
  <div className="amz-card">
    <h2 className="amz-card__title">{title}</h2>
    <div className="amz-card__quad">
      {images.map((img, i) => (
        <div key={i} className="amz-card__quad-item">
          <img src={img} alt="product" />
          <span>Product {i + 1}</span>
        </div>
      ))}
    </div>
    <a href="/products" className="amz-card__link">{linkText}</a>
  </div>
);

const SingleCard = ({ title, linkText, image }: { title: string, linkText: string, image: string }) => (
  <div className="amz-card">
    <h2 className="amz-card__title">{title}</h2>
    <div className="amz-card__single">
      <img src={image} alt="product" />
    </div>
    <a href="/products" className="amz-card__link">{linkText}</a>
  </div>
);

const CarouselStrip = ({ title, linkText, itemCount = 10, startId = 1 }: { title: string, linkText?: string, itemCount?: number, startId?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="amz-carousel-container">
      <div className="amz-carousel__header">
        <h2>{title}</h2>
        {linkText && <a href="/products">{linkText}</a>}
      </div>
      <div className="amz-carousel__wrapper">
        <button className="amz-carousel__arrow amz-carousel__arrow--left" onClick={() => scroll('left')}>❮</button>
        <div className="amz-carousel__scroll" ref={scrollRef}>
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="amz-carousel__item">
              <img src={getImg(startId + i)} alt={`Item ${i + 1}`} />
            </div>
          ))}
        </div>
        <button className="amz-carousel__arrow amz-carousel__arrow--right" onClick={() => scroll('right')}>❯</button>
      </div>
    </div>
  );
};

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const banners = [
    'http://localhost:3004/images/banner/banner1.png',
    'http://localhost:3004/images/banner/banner2.png',
    'http://localhost:3004/images/banner/banner3.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c === 0 ? banners.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <div className="amz-hero">
      <div className="amz-hero__slider" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((src, i) => (
          <div key={i} className="amz-hero__slide">
            <div className="amz-hero__bg" style={{ backgroundImage: `url(${src})` }}></div>
          </div>
        ))}
      </div>
      <button className="amz-hero__arrow amz-hero__arrow--left" onClick={prev}>❮</button>
      <button className="amz-hero__arrow amz-hero__arrow--right" onClick={next}>❯</button>
    </div>
  );
};

export function HomeApp() {
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

export default function mountHome(el: HTMLElement | string) {
  const container = typeof el === 'string' ? document.querySelector(el) : el;
  if (!container) {
    throw new Error('Home MFE mount point not found');
  }

  const root: Root = createRoot(container);
  root.render(
    <StrictMode>
      <HomeApp />
    </StrictMode>
  );

  return () => root.unmount();
}
