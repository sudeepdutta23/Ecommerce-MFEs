import { useState, useEffect } from 'react';

export const HeroCarousel = () => {
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
