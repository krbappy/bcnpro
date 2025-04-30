# Account Page Components

This directory contains components for the Account page, which allows users to manage their profile information and payment methods.

## Components

### 1. ProfileSettings

This component allows users to:
- View and update their name
- Add or update their phone number

The component communicates with the backend API to fetch and update user profile information.

### 2. PaymentMethods

This component allows users to:
- View their saved payment methods
- Add new payment methods using Stripe
- Set a default payment method
- Delete existing payment methods

## Implementation Details

### Stripe Integration

The payment methods component uses Stripe Elements for secure handling of payment information:

- `@stripe/stripe-js` - Core Stripe JavaScript SDK
- `@stripe/react-stripe-js` - React components for Stripe

### API Endpoints Used

The components interact with the following API endpoints:

#### Profile Management
- `GET /api/users/profile` - Fetch user profile data
- `PUT /api/users/profile` - Update user profile data

#### Payment Method Management
- `POST /api/payments/setup-intent` - Create a SetupIntent for adding a new payment method
- `GET /api/payments/payment-methods` - List user's payment methods
- `POST /api/payments/set-default-payment-method` - Set a payment method as default
- `DELETE /api/payments/payment-methods/:id` - Delete a payment method

## Usage Flow

1. User navigates to the Account page via the sidebar navigation
2. The Account page has tabs for Profile and Payment Methods
3. In the Payment Methods tab, users can:
   - View their existing payment methods
   - Add a new payment method through the "Add Payment Method" button
   - When adding a payment method, a modal opens with Stripe Elements
   - After successful addition, the payment method appears in the list
   - Users can set a default payment method that will be used for payments

## Integration with Booking Flow

When a user books a delivery, the system will use their default payment method. If no payment method is set as default, the user will be prompted to select one during checkout.

## Security Considerations

- All API requests include Firebase authentication token in the Authorization header
- Payment data is never stored in our application; it's handled securely by Stripe
- SetupIntent pattern ensures secure handling of payment details 