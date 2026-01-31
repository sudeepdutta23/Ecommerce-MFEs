import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductList from './components/ProductList';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ProductList />
    </React.StrictMode>
);
