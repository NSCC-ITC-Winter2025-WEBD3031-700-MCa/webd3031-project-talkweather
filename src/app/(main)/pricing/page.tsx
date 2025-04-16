import * as React from 'react';
import { validateRequest } from "@/auth";
import { redirect } from 'next/dist/server/api-utils';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'client-reference-id'?: string;
        }, 
        HTMLElement
      >;
    }
  }
}

const PricingTable = async () => {
  const { user: loggedInUser } = await validateRequest();
  if(!loggedInUser){
    return("not logged in")
  }
  return (
    <div>
      <h2>Our Pricing Plans</h2>
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      <stripe-pricing-table 
        pricing-table-id="prctbl_1R6uoERL1uMC6KjQqfRjMaVS"
        publishable-key="pk_test_51R6EN5RL1uMC6KjQ0eZLHOJHjkcT3hmQ5uZyOOmeF8oNMjsMAlpccIPs3aYZjwQSyINfMDPyeY1QGbw0AbQ2NZud00wHOHruQE"
        client-reference-id={loggedInUser.id}
      ></stripe-pricing-table>
    </div>
  );
};

export default PricingTable;