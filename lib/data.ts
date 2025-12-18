export interface Product {
    id: string;
    name: string;
    price: number;
    promoPrice?: number;
    image: string;
    category: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    description?: string;
}

export const PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Neon Cyber Hoodie",
        price: 25000,
        promoPrice: 20000,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop",
        category: "Hoodies",
        isBestSeller: true,
    },
    {
        id: "2",
        name: "Street Tech Pants",
        price: 18000,
        image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1000&auto=format&fit=crop",
        category: "Pantalons",
        isBestSeller: true,
    },
    {
        id: "3",
        name: "Urban Glitch Tee",
        price: 12000,
        promoPrice: 10000,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
        category: "T-Shirts",
        isBestSeller: true,
    },
    {
        id: "4",
        name: "Night City Cap",
        price: 8000,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop",
        category: "Accessoires",
        isBestSeller: true,
    },
    {
        id: "5",
        name: "Cyberpunk Bomber",
        price: 35000,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
        category: "Vestes",
        isNew: true,
    },
    {
        id: "6",
        name: "Matrix Sunglasses",
        price: 5000,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
        category: "Accessoires",
    },
    {
        id: "7",
        name: "Future Kicks",
        price: 45000,
        promoPrice: 40000,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop",
        category: "Chaussures",
        isNew: true,
    },
    {
        id: "8",
        name: "Techwear Vest",
        price: 22000,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop",
        category: "Vestes",
    }
];
