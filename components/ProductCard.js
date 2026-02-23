'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || '/placeholder.jpg';

  return (
    <Link href={`/product/${product._id}`}>
      <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer h-full flex flex-col border border-border">
        {/* Product Image */}
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 p-3 flex flex-col gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
            {product.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.description}
          </p>

          {/* Price and Rating */}
          <div className="flex justify-between items-center mt-auto">
            <p className="font-bold text-primary text-lg">₹{product.price}</p>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {product.location?.city && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} />
              <span>{product.location.city}</span>
            </div>
          )}

          {/* Seller */}
          {product.seller && (
            <p className="text-xs text-muted-foreground">
              by {product.seller.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
