import * as React from 'react';


declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
const PricingTable = () => {
    return (
      <div>
        <h2>Our Pricing Plans</h2>
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        <stripe-pricing-table pricing-table-id="prctbl_1R6uoERL1uMC6KjQqfRjMaVS"
        publishable-key="pk_test_51R6EN5RL1uMC6KjQ0eZLHOJHjkcT3hmQ5uZyOOmeF8oNMjsMAlpccIPs3aYZjwQSyINfMDPyeY1QGbw0AbQ2NZud00wHOHruQE">
        </stripe-pricing-table>
     </div>
    );
  };
  
  export default PricingTable;