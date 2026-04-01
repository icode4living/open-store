

import Link from 'next/link';
import React, { useState } from 'react';
import { Product } from '@/types/product';
/*
export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  salePrice: number;
  costPrice: number;
  mainImageURL: string;
  galleryImages: { url: string; productID: string }[];
  stockStatus: string;
  status: string;
}
*/
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlistToggle?: (product: Product) => void;
  wishlisted?: boolean;
  currency: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  currency = "NGN",
  wishlisted = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(product.salePrice ||0.00);

  const hasDiscount = product.regularPrice ? product.regularPrice < product.salePrice! : false
  const discount = hasDiscount
    ? Math.round(((product.regularPrice! - product.salePrice!) / product.salePrice!) * 100)
    : 0;

  const imgSrc =
    !imgError && product.mainImageURL
      ? product.mainImageURL
      : `https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=400&q=80`;

  return (
    <article
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="product-card__image-wrap">
        <img
          src={imgSrc}
          alt={product.shortDescription || product.name}
          onError={() => setImgError(true)}
          className={`product-card__image${hovered ? ' product-card__image--hovered' : ''}`}
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          className={`product-card__wishlist${wishlisted ? ' product-card__wishlist--active' : ''}`}
          onClick={(e) => { e.preventDefault(); onWishlistToggle?.(product); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Badge */}
        {product.status === 'draft' && (
          <span className="product-card__badge product-card__badge--new">New</span>
        )}
        {discount >= 20 && (
          <span className="product-card__badge product-card__badge--sale">−{discount}%</span>
        )}

        {/* Quick add */}
        <div className={`product-card__overlay${hovered ? ' product-card__overlay--visible' : ''}`}>
          <button
            className="product-card__quick-add"
            onClick={(e) => { e.preventDefault(); onAddToCart?.(product); }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-card__info">
        <p className="product-card__category t-caption">Fashion</p>
        <h3 className="product-card__name"><Link href={`/product/${product.slug}`}>{product.name}</Link></h3>
        <p className="product-card__desc t-body-sm">{product.shortDescription}</p>
        <div className="product-card__price-row">
          <span className="product-card__price">{formattedPrice}</span>
          {hasDiscount && (
            <span className="product-card__cost">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(product.costPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};