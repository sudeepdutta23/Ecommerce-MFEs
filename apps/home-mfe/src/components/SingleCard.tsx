export const SingleCard = ({ title, linkText, image }: { title: string, linkText: string, image: string }) => (
  <div className="amz-card">
    <h2 className="amz-card__title">{title}</h2>
    <div className="amz-card__single">
      <img src={image} alt="product" />
    </div>
    <a href="/products" className="amz-card__link">{linkText}</a>
  </div>
);
