import { useRef } from 'react';
import { getImg } from '../utils/images';

export const CarouselStrip = ({ title, linkText, itemCount = 10, startId = 1 }: { title: string, linkText?: string, itemCount?: number, startId?: number }) => {
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
