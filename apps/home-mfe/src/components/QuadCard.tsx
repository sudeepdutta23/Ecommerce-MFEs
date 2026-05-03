export const QuadCard = ({ title, linkText, images }: { title: string, linkText: string, images: string[] }) => (
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
