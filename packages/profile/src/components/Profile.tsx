import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import OrderHistory from './OrderHistory';
import './Profile.css';

const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Profile() {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState('profile');

    if (!user) {
        return (
            <div className="login-prompt">
                <h2>Please log in to view your profile</h2>
                <a href="/login" className="login-btn">Log In</a>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="avatar-section">
                    <img src={user.avatar} alt={user.firstName} className="user-avatar" />
                    <button className="edit-avatar-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                </div>
                <div className="user-info">
                    <h1 className="user-name">{user.firstName} {user.lastName}</h1>
                    <p className="user-email">{user.email}</p>
                    <div className="member-badge">
                        <span className="badge-icon">⭐</span>
                        <span>Premium Member</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'profile' && (
                    <div className="profile-details animate-in">
                        <h2 className="section-title">Personal Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>First Name</label>
                                <input type="text" defaultValue={user.firstName} className="info-input" />
                            </div>
                            <div className="info-item">
                                <label>Last Name</label>
                                <input type="text" defaultValue={user.lastName} className="info-input" />
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <input type="email" defaultValue={user.email} className="info-input" />
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <input type="tel" defaultValue={user.phone} className="info-input" />
                            </div>
                        </div>
                        <button className="save-btn">Save Changes</button>
                    </div>
                )}

                {activeTab === 'orders' && <OrderHistory />}

                {activeTab === 'addresses' && (
                    <div className="addresses-section animate-in">
                        <div className="section-header">
                            <h2 className="section-title">Saved Addresses</h2>
                            <button className="add-btn">+ Add Address</button>
                        </div>
                        <div className="address-cards">
                            <div className="address-card">
                                <div className="address-header">
                                    <span className="address-label">Home</span>
                                    <span className="default-badge">Default</span>
                                </div>
                                <p className="address-text">
                                    123 Main Street<br />
                                    Apt 4B<br />
                                    New York, NY 10001<br />
                                    United States
                                </p>
                                <div className="address-actions">
                                    <button className="action-link">Edit</button>
                                    <button className="action-link delete">Delete</button>
                                </div>
                            </div>
                            <div className="address-card">
                                <div className="address-header">
                                    <span className="address-label">Work</span>
                                </div>
                                <p className="address-text">
                                    456 Business Ave<br />
                                    Floor 12<br />
                                    New York, NY 10002<br />
                                    United States
                                </p>
                                <div className="address-actions">
                                    <button className="action-link">Edit</button>
                                    <button className="action-link delete">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section animate-in">
                        <h2 className="section-title">Account Settings</h2>
                        <div className="settings-group">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3>Email Notifications</h3>
                                    <p>Receive updates about orders and promotions</p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3>SMS Notifications</h3>
                                    <p>Get order updates via text message</p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3>Two-Factor Authentication</h3>
                                    <p>Add an extra layer of security</p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="danger-zone">
                            <h3>Danger Zone</h3>
                            <button className="delete-account-btn">Delete Account</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
