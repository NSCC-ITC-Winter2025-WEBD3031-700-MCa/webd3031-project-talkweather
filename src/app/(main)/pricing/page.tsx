'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface PricingPlanProps {
  title: string;
  price: number;
  period?: string;
  features: {
    text: string;
    included: boolean;
  }[];
  buttonText?: string;
  featured?: boolean;
  onClick?: () => void;
}

const PricingPlanCard: React.FC<PricingPlanProps> = ({
  title,
  price,
  period = '/month',
  features,
  buttonText = 'Choose plan',
  featured = false,
  
}) => {
  return (
    <div
      className={`w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700 ${
        featured ? 'ring-2 ring-blue-500 dark:ring-blue-600' : ''
      }`}
    >
      <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">{title}</h5>
      <div className="flex items-baseline text-gray-900 dark:text-white">
        <span className="text-3xl font-semibold">$</span>
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        <span className="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">{period}</span>
      </div>
      <ul role="list" className="space-y-5 my-7">
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex ${feature.included ? '' : 'line-through decoration-gray-500'}`}
          >
            <svg
              className={`shrink-0 w-4 h-4 ${
                feature.included
                  ? 'text-blue-700 dark:text-blue-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="text-base font-normal leading-tight text-gray-500 ms-3">
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      <a
  href="https://buy.stripe.com/test_bIY00m5oQ8Ah6f6aEE"
  target="_blank"
  rel="noopener noreferrer"
  className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center ${
    featured ? 'bg-blue-800 dark:bg-blue-700' : ''
  }`}
>
  {buttonText}
</a>
    </div>
  );
};

const PricingPage: React.FC = () => {
  const plans = [
    {
      title: 'Basic Plan',
      price: 29,
      stripePriceId: 'price_123',
      features: [
        { text: '1 team member', included: true },
        { text: '10GB Cloud storage', included: true },
        { text: 'Basic support', included: true },
        { text: 'API Access', included: false },
        { text: 'Complete documentation', included: false },
      ],
    },
    {
      title: 'Standard Plan',
      price: 49,
      stripePriceId: 'price_456',
      featured: true,
      features: [
        { text: '2 team members', included: true },
        { text: '20GB Cloud storage', included: true },
        { text: 'Integration help', included: true },
        { text: 'API Access', included: false },
        { text: 'Complete documentation', included: false },
      ],
    },
    {
      title: 'Premium Plan',
      price: 99,
      stripePriceId: 'price_789',
      features: [
        { text: '5 team members', included: true },
        { text: '50GB Cloud storage', included: true },
        { text: 'Priority support', included: true },
        { text: 'API Access', included: true },
        { text: 'Complete documentation', included: true },
      ],
    },
  ];

  const handlePlanSelect = async (stripePriceId: string) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: stripePriceId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error('Stripe Checkout error:', data);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Our Pricing Plans
      </h2>
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {plans.map((plan, index) => (
          <PricingPlanCard
            key={index}
            title={plan.title}
            price={plan.price}
            features={plan.features}
            featured={plan.featured}
            onClick={() => handlePlanSelect(plan.stripePriceId)}
          />
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
