// AdminDashboard.css is imported in pages/_app.tsx

const stats = [
    { label: 'Total Revenue', value: '$124,563', change: '+12.5%', positive: true, icon: '💰' },
    { label: 'Total Orders', value: '1,847', change: '+8.2%', positive: true, icon: '📦' },
    { label: 'Active Users', value: '12,453', change: '+15.3%', positive: true, icon: '👥' },
    { label: 'Conversion Rate', value: '3.24%', change: '-2.1%', positive: false, icon: '📊' },
];

const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: '$299.00', status: 'completed' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: '$547.00', status: 'processing' },
    { id: 'ORD-003', customer: 'Bob Johnson', amount: '$89.00', status: 'shipped' },
    { id: 'ORD-004', customer: 'Alice Brown', amount: '$159.00', status: 'pending' },
    { id: 'ORD-005', customer: 'Charlie Wilson', amount: '$449.00', status: 'completed' },
];

const topProducts = [
    { name: 'Premium Wireless Headphones', sales: 234, revenue: '$69,966' },
    { name: 'Smart Watch Pro', sales: 189, revenue: '$84,861' },
    { name: 'Wireless Earbuds', sales: 312, revenue: '$49,608' },
    { name: 'Minimalist Backpack', sales: 156, revenue: '$13,884' },
];

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn-outline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                    </button>
                    <button className="action-btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value-row">
                                <span className="stat-value">{stat.value}</span>
                                <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Recent Orders */}
                <div className="panel orders-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Recent Orders</h2>
                        <a href="/admin/orders" className="view-all-link">View All →</a>
                    </div>
                    <div className="orders-table">
                        <div className="table-header">
                            <span>Order ID</span>
                            <span>Customer</span>
                            <span>Amount</span>
                            <span>Status</span>
                        </div>
                        {recentOrders.map((order) => (
                            <div key={order.id} className="table-row">
                                <span className="order-id">{order.id}</span>
                                <span className="customer-name">{order.customer}</span>
                                <span className="order-amount">{order.amount}</span>
                                <span className={`order-status ${order.status}`}>{order.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="panel products-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Top Products</h2>
                        <a href="/admin/products" className="view-all-link">View All →</a>
                    </div>
                    <div className="products-list">
                        {topProducts.map((product, index) => (
                            <div key={product.name} className="product-item">
                                <span className="product-rank">#{index + 1}</span>
                                <div className="product-info">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-sales">{product.sales} sales</span>
                                </div>
                                <span className="product-revenue">{product.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid">
                    <a href="/admin/products/new" className="quick-action-card">
                        <span className="action-icon">➕</span>
                        <span className="action-label">Add Product</span>
                    </a>
                    <a href="/admin/orders" className="quick-action-card">
                        <span className="action-icon">📋</span>
                        <span className="action-label">Manage Orders</span>
                    </a>
                    <a href="/admin/customers" className="quick-action-card">
                        <span className="action-icon">👥</span>
                        <span className="action-label">View Customers</span>
                    </a>
                    <a href="/admin/settings" className="quick-action-card">
                        <span className="action-icon">⚙️</span>
                        <span className="action-label">Settings</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
