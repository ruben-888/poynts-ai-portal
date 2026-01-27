// Catalog offers data - images are placeholders, replace in /public/img/catalog-offers/

export interface SubItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export interface CatalogOffer {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  dollarValue: number;
  currency: string;
  hasSubItems: boolean;
  subItems?: SubItem[];
  subItemsTitle?: string;
  subItemsDescription?: string;
}

export const CATALOG_OFFERS: CatalogOffer[] = [
  {
    id: "offer-amazon",
    name: "Amazon",
    description: "Redeem your points for an Amazon gift card and shop millions of products.",
    imageUrl: "/img/catalog-offers/amazon.png",
    pointsCost: 5000,
    dollarValue: 50,
    currency: "USD",
    hasSubItems: false,
  },
  {
    id: "offer-starbucks",
    name: "Starbucks",
    description: "Enjoy your favorite Starbucks beverages and treats.",
    imageUrl: "/img/catalog-offers/starbucks.png",
    pointsCost: 2500,
    dollarValue: 25,
    currency: "USD",
    hasSubItems: false,
  },
  {
    id: "offer-tripgift",
    name: "Trip Gift",
    description: "Choose from popular travel gift cards for flights, hotels, and more.",
    imageUrl: "/img/catalog-offers/tripgift.png",
    pointsCost: 5000,
    dollarValue: 50,
    currency: "USD",
    hasSubItems: false,
  },
  {
    id: "offer-visa",
    name: "Prepaid Visa Debit Card",
    description: "Get a prepaid Visa card to use anywhere Visa is accepted.",
    imageUrl: "/img/catalog-offers/visa.png",
    pointsCost: 5000,
    dollarValue: 50,
    currency: "USD",
    hasSubItems: false,
  },
  {
    id: "offer-charity",
    name: "Charity on Top",
    description: "Donate to your favorite charity and make a difference.",
    imageUrl: "/img/catalog-offers/charity-on-top.png",
    pointsCost: 5000,
    dollarValue: 50,
    currency: "USD",
    hasSubItems: true,
    subItemsTitle: "Choose Your Charity",
    subItemsDescription: "Select from our featured charities",
    subItems: [
      {
        id: "charity-red-cross",
        name: "American Red Cross",
        category: "Disaster Relief",
        imageUrl: "/img/catalog-offers/charities/red-cross.png",
      },
      {
        id: "charity-st-jude",
        name: "St. Jude Children's Research Hospital",
        category: "Healthcare",
        imageUrl: "/img/catalog-offers/charities/st-jude.png",
      },
      {
        id: "charity-feeding-america",
        name: "Feeding America",
        category: "Hunger Relief",
        imageUrl: "/img/catalog-offers/charities/feeding-america.png",
      },
      {
        id: "charity-salvation-army",
        name: "The Salvation Army",
        category: "Social Services",
        imageUrl: "/img/catalog-offers/charities/salvation-army.png",
      },
      {
        id: "charity-habitat",
        name: "Habitat for Humanity",
        category: "Housing",
        imageUrl: "/img/catalog-offers/charities/habitat.png",
      },
      {
        id: "charity-united-way",
        name: "United Way",
        category: "Community",
        imageUrl: "/img/catalog-offers/charities/united-way.png",
      },
      {
        id: "charity-wwf",
        name: "World Wildlife Fund",
        category: "Conservation",
        imageUrl: "/img/catalog-offers/charities/wwf.png",
      },
      {
        id: "charity-make-a-wish",
        name: "Make-A-Wish Foundation",
        category: "Children",
        imageUrl: "/img/catalog-offers/charities/make-a-wish.png",
      },
      {
        id: "charity-cancer-society",
        name: "American Cancer Society",
        category: "Healthcare",
        imageUrl: "/img/catalog-offers/charities/cancer-society.png",
      },
      {
        id: "charity-boys-girls-clubs",
        name: "Boys & Girls Clubs of America",
        category: "Youth Development",
        imageUrl: "/img/catalog-offers/charities/boys-girls-clubs.png",
      },
    ],
  },
  {
    id: "offer-credit-boost",
    name: "Credit Boost",
    description: "Professional credit improvement service to boost your score.",
    imageUrl: "/img/catalog-offers/credit-boost.png",
    pointsCost: 8000,
    dollarValue: 75,
    currency: "USD",
    hasSubItems: false,
  },
  {
    id: "offer-financial-planning",
    name: "Financial Planning Session",
    description: "One-on-one session with a certified financial planner.",
    imageUrl: "/img/catalog-offers/financial-planning.png",
    pointsCost: 15000,
    dollarValue: 150,
    currency: "USD",
    hasSubItems: false,
  },
  {
    id: "offer-life-insurance",
    name: "Life Insurance - First Month Free",
    description: "Get your first month of life insurance coverage completely free.",
    imageUrl: "/img/catalog-offers/life-insurance.png",
    pointsCost: 9900,
    dollarValue: 99,
    currency: "USD",
    hasSubItems: false,
  },
];
