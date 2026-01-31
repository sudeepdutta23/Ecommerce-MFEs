import './OrderHistory.css';

const mockOrders = [
    {
        id: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 547.00,
        items: [
            { name: 'Premium Wireless Headphones', quantity: 1, price: 299 },
            { name: 'Smart Watch Pro', quantity: 1, price: 248 },
        ],
    },
    {
        id: 'ORD-2024-002',
        date: '2024-01-22',
        status: 'shipped',
        total: 89.00,
        items: [
            { name: 'Minimalist Backpack', quantity: 1, price: 89 },
        ],
    },
    {
        id: 'ORD-2024-003',
        date: '2024-01-28',
        status: 'processing',
        total: 338.00,
        items: [
            { name: 'Wireless Earbuds', quantity: 1, price: 159 },
            { name: 'Mechanical Keyboard', quantity: 1, price: 179 },
        ],
    },
];

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#f59e0b' },
    processing: { label: 'Processing', color: '#6366f1' },
    shipped: { label: 'Shipped', color: '#3b82f6' },
    delivered: { label: 'Delivered', color: '#10b981' },
    cancelled: { label: 'Cancelled', color: '#ef4444' },
};

export default function OrderHistory() {
    return (
        <div className="order-history animate-in">
            <h2 className="section-title">Order History</h2>

            <div className="orders-list">
                {mockOrders.map((order) => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <span className="order-id">{order.id}</span>
                                <span className="order-date">
                                    {new Date(order.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <span
                                className="order-status"
                                style={{ '--status-color': statusConfig[order.status].color } as React.CSSProperties}
                            >
                                {statusConfig[order.status].label}
                            </span>
                        </div>

                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-quantity">× {item.quantity}</span>
                                    <span className="item-price">${item.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="order-footer">
                            <span className="order-total">Total: ${order.total.toFixed(2)}</span>
                            <div className="order-actions">
                                <button className="action-btn-secondary">View Details</button>
                                {order.status === 'delivered' && (
                                    <button className="action-btn-secondary">Reorder</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
